"""
Questions API endpoints
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from kurobe.core.schemas import (
    ChatRequest,
    ChatResponse,
    QuestionRequest,
    QuestionResponse,
)

from app.middleware.auth import get_current_user
from app.services.questions import QuestionService

router = APIRouter()


def get_question_service() -> QuestionService:
    """Dependency to get question service."""
    return QuestionService()


@router.post("/", response_model=QuestionResponse)
async def create_question(
    request: QuestionRequest,
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """Create a new question."""
    return await service.create_question(request, user["user_id"])


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: UUID,
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """Get a question by ID."""
    question = await service.get_question(question_id, user["user_id"])
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.get("/", response_model=list[QuestionResponse])
async def list_questions(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: str | None = Query(None),
    tags: str | None = Query(None),
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """List questions with optional filters."""
    tag_list = tags.split(",") if tags else None
    return await service.list_questions(
        user_id=user["user_id"],
        limit=limit,
        offset=offset,
        status=status,
        tags=tag_list,
    )


@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: UUID,
    tags: list[str] | None = None,
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """Update a question."""
    question = await service.update_question(question_id, user["user_id"], tags=tags)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.delete("/{question_id}")
async def delete_question(
    question_id: UUID,
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """Delete a question."""
    success = await service.delete_question(question_id, user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}


@router.post("/{question_id}/chat", response_model=ChatResponse)
async def chat_with_question(
    question_id: UUID,
    request: ChatRequest,
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """Continue a conversation with a question."""
    # Ensure the question_id matches
    if request.question_id != question_id:
        raise HTTPException(status_code=400, detail="Question ID mismatch")

    return await service.chat_with_question(request, user["user_id"])


@router.get("/{question_id}/panels")
async def get_question_panels(
    question_id: UUID,
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """Get all panels for a question."""
    panels = await service.get_question_panels(question_id, user["user_id"])
    return {"panels": panels}


@router.post("/{question_id}/retry", response_model=QuestionResponse)
async def retry_question(
    question_id: UUID,
    user: dict = Depends(get_current_user),
    service: QuestionService = Depends(get_question_service),
):
    """Retry processing a failed question."""
    question = await service.retry_question(question_id, user["user_id"])
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
