"""
Connections API endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query

from app.middleware.auth import get_current_user
from kurobe.core.schemas import ConnectionRequest, ConnectionResponse

router = APIRouter()


@router.post("/", response_model=ConnectionResponse)
async def create_connection(
    request: ConnectionRequest,
    user: dict = Depends(get_current_user),
):
    """Create a new data connection."""
    # TODO: Implement connection creation
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/", response_model=List[ConnectionResponse])
async def list_connections(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    """List data connections."""
    # TODO: Implement connection listing
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{connection_id}/test")
async def test_connection(
    connection_id: str,
    user: dict = Depends(get_current_user),
):
    """Test a data connection."""
    # TODO: Implement connection testing
    raise HTTPException(status_code=501, detail="Not implemented yet")
