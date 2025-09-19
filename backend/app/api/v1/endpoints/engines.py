"""
Engines API endpoints
"""


from fastapi import APIRouter, Depends, HTTPException
from kurobe.core.schemas import EngineConfigRequest, EngineConfigResponse

from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=EngineConfigResponse)
async def create_engine_config(
    request: EngineConfigRequest,
    user: dict = Depends(get_current_user),
):
    """Create a new engine configuration."""
    # TODO: Implement engine config creation
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/", response_model=list[EngineConfigResponse])
async def list_engine_configs(
    user: dict = Depends(get_current_user),
):
    """List engine configurations."""
    # TODO: Implement engine config listing
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{engine_type}/validate")
async def validate_engine(
    engine_type: str,
    user: dict = Depends(get_current_user),
):
    """Validate an engine configuration."""
    # TODO: Implement engine validation
    raise HTTPException(status_code=501, detail="Not implemented yet")
