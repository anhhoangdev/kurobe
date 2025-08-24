"""
Authentication API endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.middleware.auth import get_current_user

router = APIRouter()


class APIKeyRequest(BaseModel):
    name: str
    expires_days: int = 30


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key: str  # Only returned on creation
    created_at: str


class APIKeyListResponse(BaseModel):
    id: str
    name: str
    last_used_at: str
    expires_at: str
    is_active: bool
    created_at: str


@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    request: APIKeyRequest,
    user: dict = Depends(get_current_user),
):
    """Create a new API key."""
    # TODO: Implement API key creation
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/api-keys", response_model=List[APIKeyListResponse])
async def list_api_keys(
    user: dict = Depends(get_current_user),
):
    """List user's API keys."""
    # TODO: Implement API key listing
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete an API key."""
    # TODO: Implement API key deletion
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/me")
async def get_current_user_info(
    user: dict = Depends(get_current_user),
):
    """Get current user information."""
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "username": user["username"],
        "full_name": user["full_name"],
        "is_superuser": user["is_superuser"],
    }
