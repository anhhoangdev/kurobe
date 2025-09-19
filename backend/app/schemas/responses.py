"""
Response schemas for Kurobe API
"""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from .models import Panel, PanelSpec


class QuestionResponse(BaseModel):
    """Response for question creation/retrieval"""

    id: UUID
    text: str
    status: str
    panels: list[PanelSpec] = Field(default_factory=list)
    plan: dict[str, Any] | None = None
    error: str | None = None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None


class PanelResponse(BaseModel):
    """Response for panel operations"""

    id: UUID
    question_id: UUID
    spec: PanelSpec
    is_pinned: bool
    position: dict[str, int] | None
    created_at: datetime
    updated_at: datetime


class DashboardResponse(BaseModel):
    """Response for dashboard operations"""

    id: UUID
    user_id: UUID
    name: str
    description: str | None
    panels: list[Panel]
    layout: dict[str, Any]
    refresh_interval: int | None
    filters: dict[str, Any]
    tags: list[str]
    is_public: bool
    created_at: datetime
    updated_at: datetime


class ChatMessage(BaseModel):
    """Chat message in a conversation"""

    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    """Response from chat interaction"""

    question_id: UUID
    message: ChatMessage
    panels: list[PanelSpec] | None = None
    suggested_actions: list[dict[str, Any]] | None = None
    status: str


class EngineConfigResponse(BaseModel):
    """Response for engine configuration"""

    engine_type: str
    name: str
    provider: str
    config: dict[str, Any]
    enabled: bool
    validated: bool
    validation_errors: list[str] | None = None
    created_at: datetime
    updated_at: datetime


class ConnectionResponse(BaseModel):
    """Response for connection operations"""

    id: str
    name: str
    type: str
    status: str  # connected, disconnected, error
    metadata: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime
    last_used_at: datetime | None = None


class QueryResponse(BaseModel):
    """Response from query execution"""

    success: bool
    columns: list[str] | None = None
    rows: list[list[Any]] | None = None
    row_count: int | None = None
    execution_time_ms: float | None = None
    error: str | None = None


class VisualizationResponse(BaseModel):
    """Response with visualization recommendations"""

    recommendations: list[PanelSpec]
    reasoning: str | None = None


class AnalysisResponse(BaseModel):
    """Response from semantic analysis"""

    intent: str
    entities: list[dict[str, Any]]
    complexity: str  # simple, moderate, complex
    suggested_approach: str
    plan: dict[str, Any] | None = None
    confidence: float
