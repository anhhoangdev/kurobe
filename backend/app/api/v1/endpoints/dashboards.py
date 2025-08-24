"""
Dashboards API endpoints
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.auth import get_current_user
from kurobe.core.schemas import DashboardRequest, DashboardResponse

router = APIRouter()


@router.post("/", response_model=DashboardResponse)
async def create_dashboard(
    request: DashboardRequest,
    user: dict = Depends(get_current_user),
):
    """Create a new dashboard."""
    # TODO: Implement dashboard creation
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: UUID,
    user: dict = Depends(get_current_user),
):
    """Get a dashboard by ID."""
    # TODO: Implement dashboard retrieval
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/", response_model=List[DashboardResponse])
async def list_dashboards(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    """List dashboards."""
    # TODO: Implement dashboard listing
    raise HTTPException(status_code=501, detail="Not implemented yet")
