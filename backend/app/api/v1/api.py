"""
Main API router for v1 endpoints
"""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from app.api.v1.endpoints import auth, connections, dashboards, engines, questions
from app.middleware.metrics import get_metrics

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(dashboards.router, prefix="/dashboards", tags=["dashboards"])
api_router.include_router(connections.router, prefix="/connections", tags=["connections"])
api_router.include_router(engines.router, prefix="/engines", tags=["engines"])


# Metrics endpoint
@api_router.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    """Prometheus metrics endpoint."""
    return get_metrics()
