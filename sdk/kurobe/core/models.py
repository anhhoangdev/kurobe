"""
Core data models for Kurobe BI platform
"""
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class ChartType(str, Enum):
    """Supported chart types for visualization"""
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    SCATTER = "scatter"
    AREA = "area"
    TABLE = "table"
    METRIC = "metric"
    HEATMAP = "heatmap"
    GAUGE = "gauge"
    FUNNEL = "funnel"


class EngineType(str, Enum):
    """Types of pluggable engines"""
    TEXT_TO_SQL = "text_to_sql"
    VISUALIZATION = "visualization"
    SEMANTIC = "semantic"


class DataPoint(BaseModel):
    """Represents a single data point in a chart"""
    x: Union[str, int, float, datetime]
    y: Union[int, float, None]
    series: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class QueryResult(BaseModel):
    """Result from a database query"""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    columns: List[str]
    rows: List[List[Any]]
    row_count: int
    execution_time_ms: Optional[float] = None
    query: Optional[str] = None
    connection_id: Optional[str] = None


class PanelSpec(BaseModel):
    """Specification for a single panel/chart"""
    model_config = ConfigDict(use_enum_values=True)
    
    id: str = Field(description="Unique identifier for the panel")
    type: ChartType = Field(description="Type of visualization")
    title: str = Field(description="Panel title")
    description: Optional[str] = Field(default=None, description="Panel description")
    
    # Data configuration
    data: Optional[List[DataPoint]] = Field(default=None, description="Panel data points")
    query_result: Optional[QueryResult] = Field(default=None, description="Raw query result")
    
    # Visual configuration
    config: Dict[str, Any] = Field(default_factory=dict, description="Chart-specific configuration")
    width: int = Field(default=6, ge=1, le=12, description="Grid width (1-12)")
    height: int = Field(default=4, ge=1, description="Grid height units")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Panel(BaseModel):
    """Persisted panel with additional metadata"""
    model_config = ConfigDict(use_enum_values=True)
    
    id: UUID
    question_id: UUID
    spec: PanelSpec
    is_pinned: bool = False
    position: Optional[Dict[str, int]] = None  # {"x": 0, "y": 0}
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class Question(BaseModel):
    """Represents a user's question/chat session"""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    id: UUID
    user_id: UUID
    text: str = Field(description="The user's question text")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    
    # Planning & execution
    plan: Optional[Dict[str, Any]] = Field(default=None, description="Execution plan")
    panels: List[Panel] = Field(default_factory=list, description="Generated panels")
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    status: str = Field(default="pending")  # pending, processing, completed, failed
    error: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class Dashboard(BaseModel):
    """Collection of pinned panels forming a dashboard"""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    
    # Layout & panels
    panels: List[Panel] = Field(default_factory=list)
    layout: Dict[str, Any] = Field(default_factory=dict, description="Grid layout configuration")
    
    # Configuration
    refresh_interval: Optional[int] = Field(default=None, description="Auto-refresh in seconds")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Global dashboard filters")
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    is_public: bool = False
    created_at: datetime
    updated_at: datetime
