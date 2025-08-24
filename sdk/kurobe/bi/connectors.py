"""
Database connectors for Kurobe BI platform
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union
from contextlib import asynccontextmanager
import asyncio
from datetime import datetime

from pydantic import BaseModel, Field
import asyncpg
import httpx

from kurobe.core.models import QueryResult


class ConnectionConfig(BaseModel):
    """Base configuration for database connections"""
    name: str
    type: str  # postgres, trino, duckdb
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    ssl: bool = False
    extra_params: Dict[str, Any] = Field(default_factory=dict)


class DataConnector(ABC):
    """Abstract base class for database connectors"""
    
    def __init__(self, config: ConnectionConfig):
        self.config = config
        self._pool = None
    
    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the database"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close the database connection"""
        pass
    
    @abstractmethod
    async def execute_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = 30,
    ) -> QueryResult:
        """Execute a query and return results"""
        pass
    
    @abstractmethod
    async def test_connection(self) -> bool:
        """Test if the connection is valid"""
        pass
    
    @abstractmethod
    async def get_schema_info(self, schema: Optional[str] = None) -> Dict[str, Any]:
        """Get schema information for the database"""
        pass
    
    @asynccontextmanager
    async def transaction(self):
        """Context manager for database transactions"""
        # Default implementation - subclasses can override
        yield


class PostgresConnector(DataConnector):
    """PostgreSQL database connector using asyncpg"""
    
    async def connect(self) -> None:
        """Establish connection pool to PostgreSQL"""
        dsn = f"postgresql://{self.config.username}:{self.config.password}@{self.config.host}:{self.config.port}/{self.config.database}"
        
        if self.config.ssl:
            dsn += "?sslmode=require"
        
        self._pool = await asyncpg.create_pool(
            dsn,
            min_size=2,
            max_size=10,
            command_timeout=60,
            **self.config.extra_params
        )
    
    async def disconnect(self) -> None:
        """Close the connection pool"""
        if self._pool:
            await self._pool.close()
            self._pool = None
    
    async def execute_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = 30,
    ) -> QueryResult:
        """Execute a PostgreSQL query"""
        if not self._pool:
            raise RuntimeError("Not connected to database")
        
        start_time = datetime.utcnow()
        
        async with self._pool.acquire() as conn:
            try:
                # Set statement timeout
                await conn.execute(f"SET statement_timeout = {timeout * 1000}")
                
                # Execute query
                if parameters:
                    # Convert dict parameters to positional
                    rows = await conn.fetch(query, *parameters.values())
                else:
                    rows = await conn.fetch(query)
                
                # Calculate execution time
                execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                # Extract columns and convert rows
                if rows:
                    columns = list(rows[0].keys())
                    data = [list(row.values()) for row in rows]
                else:
                    # Try to get column names from prepared statement
                    stmt = await conn.prepare(query)
                    columns = [attr.name for attr in stmt.get_attributes()]
                    data = []
                
                return QueryResult(
                    columns=columns,
                    rows=data,
                    row_count=len(data),
                    execution_time_ms=execution_time,
                    query=query,
                    connection_id=self.config.name,
                )
                
            except asyncio.TimeoutError:
                raise TimeoutError(f"Query exceeded timeout of {timeout} seconds")
            except Exception as e:
                raise RuntimeError(f"Query execution failed: {str(e)}")
    
    async def test_connection(self) -> bool:
        """Test PostgreSQL connection"""
        try:
            async with self._pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
                return True
        except Exception:
            return False
    
    async def get_schema_info(self, schema: Optional[str] = None) -> Dict[str, Any]:
        """Get PostgreSQL schema information"""
        if not self._pool:
            raise RuntimeError("Not connected to database")
        
        schema_filter = f"AND table_schema = '{schema}'" if schema else "AND table_schema NOT IN ('pg_catalog', 'information_schema')"
        
        query = f"""
        SELECT 
            table_schema,
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema IS NOT NULL {schema_filter}
        ORDER BY table_schema, table_name, ordinal_position
        """
        
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(query)
            
            # Organize by schema and table
            schema_info = {}
            for row in rows:
                schema_name = row['table_schema']
                table_name = row['table_name']
                
                if schema_name not in schema_info:
                    schema_info[schema_name] = {}
                
                if table_name not in schema_info[schema_name]:
                    schema_info[schema_name][table_name] = []
                
                schema_info[schema_name][table_name].append({
                    'column_name': row['column_name'],
                    'data_type': row['data_type'],
                    'is_nullable': row['is_nullable'] == 'YES',
                    'default': row['column_default'],
                })
            
            return schema_info


class TrinoConnector(DataConnector):
    """Trino/Presto database connector"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self._client = None
    
    async def connect(self) -> None:
        """Establish connection to Trino"""
        base_url = f"http://{self.config.host}:{self.config.port}"
        
        headers = {
            "X-Trino-User": self.config.username or "kurobe",
            "X-Trino-Catalog": self.config.extra_params.get("catalog", "hive"),
            "X-Trino-Schema": self.config.database or "default",
        }
        
        self._client = httpx.AsyncClient(
            base_url=base_url,
            headers=headers,
            timeout=60.0,
        )
    
    async def disconnect(self) -> None:
        """Close the Trino connection"""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    async def execute_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = 30,
    ) -> QueryResult:
        """Execute a Trino query"""
        if not self._client:
            raise RuntimeError("Not connected to Trino")
        
        if parameters:
            # Simple parameter substitution for Trino
            for key, value in parameters.items():
                if isinstance(value, str):
                    query = query.replace(f":{key}", f"'{value}'")
                else:
                    query = query.replace(f":{key}", str(value))
        
        start_time = datetime.utcnow()
        
        # Submit query
        response = await self._client.post(
            "/v1/statement",
            data=query,
            timeout=timeout,
        )
        response.raise_for_status()
        
        result = response.json()
        
        # Poll for results
        while "nextUri" in result:
            response = await self._client.get(result["nextUri"], timeout=timeout)
            response.raise_for_status()
            result = response.json()
        
        # Extract results
        columns = []
        rows = []
        
        if "columns" in result:
            columns = [col["name"] for col in result["columns"]]
        
        if "data" in result:
            rows = result["data"]
        
        execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return QueryResult(
            columns=columns,
            rows=rows,
            row_count=len(rows),
            execution_time_ms=execution_time,
            query=query,
            connection_id=self.config.name,
        )
    
    async def test_connection(self) -> bool:
        """Test Trino connection"""
        try:
            result = await self.execute_query("SELECT 1", timeout=5)
            return result.row_count == 1
        except Exception:
            return False
    
    async def get_schema_info(self, schema: Optional[str] = None) -> Dict[str, Any]:
        """Get Trino schema information"""
        catalog = self.config.extra_params.get("catalog", "hive")
        
        if schema:
            query = f"SHOW TABLES FROM {catalog}.{schema}"
        else:
            query = f"SHOW SCHEMAS FROM {catalog}"
        
        result = await self.execute_query(query)
        
        # This is simplified - real implementation would get full schema details
        return {
            "catalog": catalog,
            "schemas": result.rows if not schema else None,
            "tables": result.rows if schema else None,
        }


class DuckDBConnector(DataConnector):
    """DuckDB file-based database connector"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self._conn = None
        # DuckDB operations will be wrapped in asyncio.to_thread
    
    async def connect(self) -> None:
        """Open DuckDB database file"""
        import duckdb
        
        db_path = self.config.extra_params.get("path", ":memory:")
        self._conn = await asyncio.to_thread(duckdb.connect, db_path)
    
    async def disconnect(self) -> None:
        """Close DuckDB connection"""
        if self._conn:
            await asyncio.to_thread(self._conn.close)
            self._conn = None
    
    async def execute_query(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None,
        timeout: Optional[int] = 30,
    ) -> QueryResult:
        """Execute a DuckDB query"""
        if not self._conn:
            raise RuntimeError("Not connected to DuckDB")
        
        start_time = datetime.utcnow()
        
        # Execute query in thread pool
        if parameters:
            result = await asyncio.to_thread(
                self._conn.execute,
                query,
                parameters,
            )
        else:
            result = await asyncio.to_thread(
                self._conn.execute,
                query,
            )
        
        # Fetch results
        rows = await asyncio.to_thread(result.fetchall)
        columns = [desc[0] for desc in result.description] if result.description else []
        
        execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return QueryResult(
            columns=columns,
            rows=rows,
            row_count=len(rows),
            execution_time_ms=execution_time,
            query=query,
            connection_id=self.config.name,
        )
    
    async def test_connection(self) -> bool:
        """Test DuckDB connection"""
        try:
            result = await self.execute_query("SELECT 1 as test")
            return result.row_count == 1
        except Exception:
            return False
    
    async def get_schema_info(self, schema: Optional[str] = None) -> Dict[str, Any]:
        """Get DuckDB schema information"""
        query = """
        SELECT 
            table_schema,
            table_name,
            column_name,
            data_type,
            is_nullable
        FROM information_schema.columns
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        """
        
        if schema:
            query += f" AND table_schema = '{schema}'"
        
        query += " ORDER BY table_schema, table_name, ordinal_position"
        
        result = await self.execute_query(query)
        
        # Organize results
        schema_info = {}
        for row in result.rows:
            schema_name, table_name, column_name, data_type, is_nullable = row
            
            if schema_name not in schema_info:
                schema_info[schema_name] = {}
            
            if table_name not in schema_info[schema_name]:
                schema_info[schema_name][table_name] = []
            
            schema_info[schema_name][table_name].append({
                'column_name': column_name,
                'data_type': data_type,
                'is_nullable': is_nullable,
            })
        
        return schema_info


class ConnectionPool:
    """Manages multiple database connections"""
    
    def __init__(self):
        self._connections: Dict[str, DataConnector] = {}
    
    async def add_connection(
        self,
        config: ConnectionConfig,
    ) -> DataConnector:
        """Add a new connection to the pool"""
        if config.name in self._connections:
            raise ValueError(f"Connection {config.name} already exists")
        
        # Create appropriate connector
        if config.type == "postgres":
            connector = PostgresConnector(config)
        elif config.type == "trino":
            connector = TrinoConnector(config)
        elif config.type == "duckdb":
            connector = DuckDBConnector(config)
        else:
            raise ValueError(f"Unsupported connection type: {config.type}")
        
        # Connect
        await connector.connect()
        
        # Test connection
        if not await connector.test_connection():
            await connector.disconnect()
            raise RuntimeError(f"Failed to connect to {config.name}")
        
        self._connections[config.name] = connector
        return connector
    
    def get_connection(self, name: str) -> DataConnector:
        """Get a connection by name"""
        if name not in self._connections:
            raise KeyError(f"Connection {name} not found")
        return self._connections[name]
    
    async def remove_connection(self, name: str) -> None:
        """Remove and disconnect a connection"""
        if name in self._connections:
            await self._connections[name].disconnect()
            del self._connections[name]
    
    async def close_all(self) -> None:
        """Close all connections"""
        for connector in self._connections.values():
            await connector.disconnect()
        self._connections.clear()
    
    def list_connections(self) -> List[str]:
        """List all connection names"""
        return list(self._connections.keys())
