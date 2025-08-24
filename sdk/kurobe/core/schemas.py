"""
Request/Response schemas for Kurobe API
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from kurobe.core.models import ChartType, Panel, PanelSpec, Question


class QuestionRequest(BaseModel):
    """Request to create a new question"""
    text: str = Field(description="The user's question")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    connection_ids: Optional[List[str]] = Field(default=None, description="Specific data connections to use")
    tags: Optional[List[str]] = Field(default=None, description="Tags for categorization")


class QuestionResponse(BaseModel):
    """Response for question creation/retrieval"""
    id: UUID
    text: str
    status: str
    panels: List[PanelSpec] = Field(default_factory=list)
    plan: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class PanelRequest(BaseModel):
    """Request to create/update a panel"""
    question_id: UUID
    spec: PanelSpec
    is_pinned: bool = False
    position: Optional[Dict[str, int]] = None


class PanelResponse(BaseModel):
    """Response for panel operations"""
    id: UUID
    question_id: UUID
    spec: PanelSpec
    is_pinned: bool
    position: Optional[Dict[str, int]]
    created_at: datetime
    updated_at: datetime


class DashboardRequest(BaseModel):
    """Request to create/update a dashboard"""
    name: str
    description: Optional[str] = None
    panel_ids: Optional[List[UUID]] = None
    layout: Optional[Dict[str, Any]] = None
    refresh_interval: Optional[int] = None
    filters: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_public: bool = False


class DashboardResponse(BaseModel):
    """Response for dashboard operations"""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    panels: List[Panel]
    layout: Dict[str, Any]
    refresh_interval: Optional[int]
    filters: Dict[str, Any]
    tags: List[str]
    is_public: bool
    created_at: datetime
    updated_at: datetime


class ChatMessage(BaseModel):
    """Chat message in a conversation"""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    """Request for chat interaction"""
    question_id: UUID
    message: str
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Response from chat interaction"""
    question_id: UUID
    message: ChatMessage
    panels: Optional[List[PanelSpec]] = None
    suggested_actions: Optional[List[Dict[str, Any]]] = None
    status: str


class EngineConfigRequest(BaseModel):
    """Request to configure an engine"""
    engine_type: str  # text_to_sql, visualization, semantic
    name: str
    provider: str
    config: Dict[str, Any]
    enabled: bool = True


class EngineConfigResponse(BaseModel):
    """Response for engine configuration"""
    engine_type: str
    name: str
    provider: str
    config: Dict[str, Any]
    enabled: bool
    validated: bool
    validation_errors: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime


class ConnectionRequest(BaseModel):
    """Request to create a data connection"""
    name: str
    type: str  # postgres, trino, duckdb
    config: Dict[str, Any]  # Connection-specific config
    metadata: Optional[Dict[str, Any]] = None


class ConnectionResponse(BaseModel):
    """Response for connection operations"""
    id: str
    name: str
    type: str
    status: str  # connected, disconnected, error
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    last_used_at: Optional[datetime] = None


class QueryRequest(BaseModel):
    """Request to execute a query"""
    sql: str
    connection_id: str
    parameters: Optional[Dict[str, Any]] = None
    timeout_seconds: Optional[int] = 30


class QueryResponse(BaseModel):
    """Response from query execution"""
    success: bool
    columns: Optional[List[str]] = None
    rows: Optional[List[List[Any]]] = None
    row_count: Optional[int] = None
    execution_time_ms: Optional[float] = None
    error: Optional[str] = None


class VisualizationRequest(BaseModel):
    """Request for visualization recommendations"""
    query_result: Dict[str, Any]  # Serialized QueryResult
    question: Optional[str] = None
    preferred_types: Optional[List[ChartType]] = None
    max_recommendations: int = 3


class VisualizationResponse(BaseModel):
    """Response with visualization recommendations"""
    recommendations: List[PanelSpec]
    reasoning: Optional[str] = None


class AnalysisRequest(BaseModel):
    """Request for semantic analysis"""
    question: str
    context: Optional[Dict[str, Any]] = None
    available_connections: Optional[List[str]] = None


class AnalysisResponse(BaseModel):
    """Response from semantic analysis"""
    intent: str
    entities: List[Dict[str, Any]]
    complexity: str  # simple, moderate, complex
    suggested_approach: str
    plan: Optional[Dict[str, Any]] = None
    confidence: float
