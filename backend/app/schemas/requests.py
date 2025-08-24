"""
Request schemas for Kurobe API
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from .models import ChartType, PanelSpec


class QuestionRequest(BaseModel):
    """Request to create a new question"""
    text: str = Field(description="The user's question")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    connection_ids: Optional[List[str]] = Field(default=None, description="Specific data connections to use")
    tags: Optional[List[str]] = Field(default=None, description="Tags for categorization")


class PanelRequest(BaseModel):
    """Request to create/update a panel"""
    question_id: UUID
    spec: PanelSpec
    is_pinned: bool = False
    position: Optional[Dict[str, int]] = None


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


class ChatRequest(BaseModel):
    """Request for chat interaction"""
    question_id: UUID
    message: str
    context: Optional[Dict[str, Any]] = None


class EngineConfigRequest(BaseModel):
    """Request to configure an engine"""
    engine_type: str  # text_to_sql, visualization, semantic
    name: str
    provider: str
    config: Dict[str, Any]
    enabled: bool = True


class ConnectionRequest(BaseModel):
    """Request to create a data connection"""
    name: str
    type: str  # postgres, trino, duckdb
    config: Dict[str, Any]  # Connection-specific config
    metadata: Optional[Dict[str, Any]] = None


class QueryRequest(BaseModel):
    """Request to execute a query"""
    sql: str
    connection_id: str
    parameters: Optional[Dict[str, Any]] = None
    timeout_seconds: Optional[int] = 30


class VisualizationRequest(BaseModel):
    """Request for visualization recommendations"""
    query_result: Dict[str, Any]  # Serialized QueryResult
    question: Optional[str] = None
    preferred_types: Optional[List[ChartType]] = None
    max_recommendations: int = 3


class AnalysisRequest(BaseModel):
    """Request for semantic analysis"""
    question: str
    context: Optional[Dict[str, Any]] = None
    available_connections: Optional[List[str]] = None
