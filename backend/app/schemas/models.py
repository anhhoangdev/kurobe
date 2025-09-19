"""
Core data models for Kurobe BI platform
"""

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


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

    x: str | int | float | datetime
    y: int | float | None
    series: str | None = None
    metadata: dict[str, Any] | None = None


class QueryResult(BaseModel):
    """Result from a database query"""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    columns: list[str]
    rows: list[list[Any]]
    row_count: int
    execution_time_ms: float | None = None
    query: str | None = None
    connection_id: str | None = None


class PanelSpec(BaseModel):
    """Specification for a single panel/chart"""

    model_config = ConfigDict(use_enum_values=True)

    id: str = Field(description="Unique identifier for the panel")
    type: ChartType = Field(description="Type of visualization")
    title: str = Field(description="Panel title")
    description: str | None = Field(default=None, description="Panel description")

    # Data configuration
    data: list[DataPoint] | None = Field(default=None, description="Panel data points")
    query_result: QueryResult | None = Field(default=None, description="Raw query result")

    # Visual configuration
    config: dict[str, Any] = Field(default_factory=dict, description="Chart-specific configuration")
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
    position: dict[str, int] | None = None  # {"x": 0, "y": 0}
    created_by: UUID
    created_at: datetime
    updated_at: datetime


class Question(BaseModel):
    """Represents a user's question/chat session"""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: UUID
    user_id: UUID
    text: str = Field(description="The user's question text")
    context: dict[str, Any] | None = Field(default=None, description="Additional context")

    # Planning & execution
    plan: dict[str, Any] | None = Field(default=None, description="Execution plan")
    panels: list[Panel] = Field(default_factory=list, description="Generated panels")

    # Metadata
    tags: list[str] = Field(default_factory=list)
    status: str = Field(default="pending")  # pending, processing, completed, failed
    error: str | None = None

    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None


class Dashboard(BaseModel):
    """Collection of pinned panels forming a dashboard"""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: UUID
    user_id: UUID
    name: str
    description: str | None = None

    # Layout & panels
    panels: list[Panel] = Field(default_factory=list)
    layout: dict[str, Any] = Field(default_factory=dict, description="Grid layout configuration")

    # Configuration
    refresh_interval: int | None = Field(default=None, description="Auto-refresh in seconds")
    filters: dict[str, Any] = Field(default_factory=dict, description="Global dashboard filters")

    # Metadata
    tags: list[str] = Field(default_factory=list)
    is_public: bool = False
    created_at: datetime
    updated_at: datetime
