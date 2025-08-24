"""
Interfaces for pluggable engines in Kurobe
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Protocol, Type, runtime_checkable

from pydantic import BaseModel, Field

from kurobe.core.models import PanelSpec, QueryResult


class EngineConfig(BaseModel):
    """Base configuration for all engines"""
    name: str = Field(description="Engine name")
    version: str = Field(description="Engine version")
    provider: str = Field(description="Provider/implementation name")
    config: Dict[str, Any] = Field(default_factory=dict, description="Engine-specific configuration")
    enabled: bool = Field(default=True, description="Whether the engine is enabled")


class EngineResult(BaseModel):
    """Base result from engine execution"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


@runtime_checkable
class Engine(Protocol):
    """Base protocol for all engines"""
    
    @property
    def config(self) -> EngineConfig:
        """Get engine configuration"""
        ...
    
    async def initialize(self) -> None:
        """Initialize the engine"""
        ...
    
    async def validate(self) -> bool:
        """Validate engine configuration and connectivity"""
        ...
    
    async def shutdown(self) -> None:
        """Cleanup engine resources"""
        ...


class TextToSQLEngine(ABC):
    """Interface for Text-to-SQL engines"""
    
    def __init__(self, config: EngineConfig) -> None:
        self._config = config
    
    @property
    def config(self) -> EngineConfig:
        return self._config
    
    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the Text-to-SQL engine"""
        pass
    
    @abstractmethod
    async def validate(self) -> bool:
        """Validate engine configuration"""
        pass
    
    @abstractmethod
    async def generate_sql(
        self,
        question: str,
        context: Optional[Dict[str, Any]] = None,
        connection_id: Optional[str] = None,
        schema_hints: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate SQL from natural language question
        
        Returns:
            {
                "sql": str,
                "connection_id": str,
                "confidence": float,
                "explanation": str,
                "metadata": dict
            }
        """
        pass
    
    @abstractmethod
    async def explain_query(self, sql: str) -> str:
        """Generate natural language explanation of SQL query"""
        pass
    
    async def shutdown(self) -> None:
        """Cleanup engine resources"""
        pass


class VisualizationEngine(ABC):
    """Interface for visualization recommendation engines"""
    
    def __init__(self, config: EngineConfig) -> None:
        self._config = config
    
    @property
    def config(self) -> EngineConfig:
        return self._config
    
    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the visualization engine"""
        pass
    
    @abstractmethod
    async def validate(self) -> bool:
        """Validate engine configuration"""
        pass
    
    @abstractmethod
    async def recommend_visualization(
        self,
        query_result: QueryResult,
        question: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[PanelSpec]:
        """
        Recommend visualizations for query results
        
        Returns list of PanelSpec objects with recommended charts
        """
        pass
    
    @abstractmethod
    async def optimize_visualization(
        self,
        panel_spec: PanelSpec,
        feedback: Optional[Dict[str, Any]] = None,
    ) -> PanelSpec:
        """Optimize existing visualization based on feedback"""
        pass
    
    async def shutdown(self) -> None:
        """Cleanup engine resources"""
        pass


class SemanticEngine(ABC):
    """Interface for semantic understanding and planning"""
    
    def __init__(self, config: EngineConfig) -> None:
        self._config = config
    
    @property
    def config(self) -> EngineConfig:
        return self._config
    
    @abstractmethod
    async def initialize(self) -> None:
        """Initialize the semantic engine"""
        pass
    
    @abstractmethod
    async def validate(self) -> bool:
        """Validate engine configuration"""
        pass
    
    @abstractmethod
    async def analyze_question(
        self,
        question: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze user question for intent and entities
        
        Returns:
            {
                "intent": str,
                "entities": List[Dict],
                "complexity": str,
                "suggested_approach": str,
                "metadata": dict
            }
        """
        pass
    
    @abstractmethod
    async def generate_plan(
        self,
        question: str,
        analysis: Dict[str, Any],
        available_connections: List[str],
    ) -> Dict[str, Any]:
        """
        Generate execution plan for the question
        
        Returns:
            {
                "steps": List[Dict],
                "estimated_time": float,
                "required_engines": List[str],
                "metadata": dict
            }
        """
        pass
    
    @abstractmethod
    async def summarize_results(
        self,
        question: str,
        panels: List[PanelSpec],
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Generate natural language summary of results"""
        pass
    
    async def shutdown(self) -> None:
        """Cleanup engine resources"""
        pass


class EngineRegistry:
    """Registry for managing pluggable engines"""
    
    def __init__(self) -> None:
        self._text_to_sql_engines: Dict[str, Type[TextToSQLEngine]] = {}
        self._visualization_engines: Dict[str, Type[VisualizationEngine]] = {}
        self._semantic_engines: Dict[str, Type[SemanticEngine]] = {}
        self._instances: Dict[str, Engine] = {}
    
    def register_text_to_sql_engine(
        self,
        name: str,
        engine_class: Type[TextToSQLEngine],
    ) -> None:
        """Register a Text-to-SQL engine implementation"""
        self._text_to_sql_engines[name] = engine_class
    
    def register_visualization_engine(
        self,
        name: str,
        engine_class: Type[VisualizationEngine],
    ) -> None:
        """Register a visualization engine implementation"""
        self._visualization_engines[name] = engine_class
    
    def register_semantic_engine(
        self,
        name: str,
        engine_class: Type[SemanticEngine],
    ) -> None:
        """Register a semantic engine implementation"""
        self._semantic_engines[name] = engine_class
    
    async def create_engine(
        self,
        engine_type: str,
        config: EngineConfig,
    ) -> Engine:
        """Create and initialize an engine instance"""
        engine_class = None
        
        if engine_type == "text_to_sql":
            engine_class = self._text_to_sql_engines.get(config.provider)
        elif engine_type == "visualization":
            engine_class = self._visualization_engines.get(config.provider)
        elif engine_type == "semantic":
            engine_class = self._semantic_engines.get(config.provider)
        
        if not engine_class:
            raise ValueError(f"Unknown engine provider: {config.provider} for type: {engine_type}")
        
        engine = engine_class(config)
        await engine.initialize()
        
        instance_key = f"{engine_type}:{config.name}"
        self._instances[instance_key] = engine
        
        return engine
    
    def get_engine(self, engine_type: str, name: str) -> Optional[Engine]:
        """Get an initialized engine instance"""
        instance_key = f"{engine_type}:{name}"
        return self._instances.get(instance_key)
    
    async def shutdown_all(self) -> None:
        """Shutdown all engine instances"""
        for engine in self._instances.values():
            await engine.shutdown()
        self._instances.clear()


# Global registry instance
engine_registry = EngineRegistry()
