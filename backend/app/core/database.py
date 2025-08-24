"""
Database connection management for Kurobe using asyncpg
"""
from typing import Optional, Any
import asyncpg
from contextlib import asynccontextmanager
import threading

from app.core.config import settings
from app.core.logging import logger


class DBConnection:
    """Thread-safe singleton database connection manager using asyncpg."""
    
    _instance: Optional['DBConnection'] = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                # Double-check locking pattern
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
                    cls._instance._pool = None
        return cls._instance

    def __init__(self):
        """No initialization needed in __init__ as it's handled in __new__"""
        pass

    async def initialize(self):
        """Initialize the database connection pool."""
        if self._initialized:
            return
                
        try:
            logger.info("Initializing database connection pool")
            
            # Create connection pool
            self._pool = await asyncpg.create_pool(
                str(settings.DATABASE_URL),
                min_size=5,
                max_size=20,
                command_timeout=60,
                server_settings={
                    'jit': 'off'
                }
            )
            
            self._initialized = True
            logger.info("Database connection pool initialized successfully")
            
        except Exception as e:
            logger.error(f"Database initialization error: {e}")
            raise RuntimeError(f"Failed to initialize database connection: {str(e)}")

    async def disconnect(self):
        """Close the database connection pool."""
        if self._pool:
            logger.info("Closing database connection pool")
            try:
                await self._pool.close()
            except Exception as e:
                logger.warning(f"Error during disconnect: {e}")
            finally:
                self._initialized = False
                self._pool = None
                logger.info("Database connection pool closed")

    @asynccontextmanager
    async def acquire(self):
        """Acquire a connection from the pool."""
        if not self._initialized:
            await self.initialize()
        
        async with self._pool.acquire() as conn:
            yield conn

    async def execute(self, query: str, *args) -> str:
        """Execute a query without returning results."""
        async with self.acquire() as conn:
            return await conn.execute(query, *args)

    async def fetch(self, query: str, *args) -> list:
        """Execute a query and fetch all results."""
        async with self.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args) -> Optional[asyncpg.Record]:
        """Execute a query and fetch a single row."""
        async with self.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetchval(self, query: str, *args) -> Any:
        """Execute a query and fetch a single value."""
        async with self.acquire() as conn:
            return await conn.fetchval(query, *args)

    def set_user_context(self, conn: asyncpg.Connection, user_id: str, is_superuser: bool = False):
        """Set the user context for RLS policies."""
        conn.execute(
            """
            SET LOCAL app.current_user_id = $1;
            SET LOCAL app.is_superuser = $2;
            """,
            user_id,
            str(is_superuser).lower()
        )


# Global database instance
db = DBConnection()


async def init_db():
    """Initialize the database connection."""
    await db.initialize()


async def close_db():
    """Close the database connection."""
    await db.disconnect()
