"""
Request schemas for Kurobe API
"""

from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from .models import ChartType, PanelSpec


class QuestionRequest(BaseModel):
    """Request to create a new question"""

    text: str = Field(description="The user's question")
    context: dict[str, Any] | None = Field(default=None, description="Additional context")
    connection_ids: list[str] | None = Field(default=None, description="Specific data connections to use")
    tags: list[str] | None = Field(default=None, description="Tags for categorization")


class PanelRequest(BaseModel):
    """Request to create/update a panel"""

    question_id: UUID
    spec: PanelSpec
    is_pinned: bool = False
    position: dict[str, int] | None = None


class DashboardRequest(BaseModel):
    """Request to create/update a dashboard"""

    name: str
    description: str | None = None
    panel_ids: list[UUID] | None = None
    layout: dict[str, Any] | None = None
    refresh_interval: int | None = None
    filters: dict[str, Any] | None = None
    tags: list[str] | None = None
    is_public: bool = False


class ChatRequest(BaseModel):
    """Request for chat interaction"""

    question_id: UUID
    message: str
    context: dict[str, Any] | None = None


class EngineConfigRequest(BaseModel):
    """Request to configure an engine"""

    engine_type: str  # text_to_sql, visualization, semantic
    name: str
    provider: str
    config: dict[str, Any]
    enabled: bool = True


class ConnectionRequest(BaseModel):
    """Request to create a data connection"""

    name: str
    type: str  # postgres, trino, duckdb
    config: dict[str, Any]  # Connection-specific config
    metadata: dict[str, Any] | None = None


class QueryRequest(BaseModel):
    """Request to execute a query"""

    sql: str
    connection_id: str
    parameters: dict[str, Any] | None = None
    timeout_seconds: int | None = 30


class VisualizationRequest(BaseModel):
    """Request for visualization recommendations"""

    query_result: dict[str, Any]  # Serialized QueryResult
    question: str | None = None
    preferred_types: list[ChartType] | None = None
    max_recommendations: int = 3


class AnalysisRequest(BaseModel):
    """Request for semantic analysis"""

    question: str
    context: dict[str, Any] | None = None
    available_connections: list[str] | None = None
