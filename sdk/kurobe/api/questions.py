"""
Questions API client
"""
from typing import List, Optional
from uuid import UUID

from kurobe.api.base import BaseAPIClient
from kurobe.core.schemas import (
    QuestionRequest,
    QuestionResponse,
    ChatRequest,
    ChatResponse,
)


class QuestionsClient(BaseAPIClient):
    """Client for questions API endpoints"""
    
    async def create_question(self, request: QuestionRequest) -> QuestionResponse:
        """Create a new question"""
        data = await self.post("/questions", request.model_dump())
        return QuestionResponse(**data)
    
    async def get_question(self, question_id: UUID) -> QuestionResponse:
        """Get a question by ID"""
        data = await self.get(f"/questions/{question_id}")
        return QuestionResponse(**data)
    
    async def list_questions(
        self,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> List[QuestionResponse]:
        """List questions with optional filters"""
        params = {
            "limit": limit,
            "offset": offset,
        }
        if status:
            params["status"] = status
        if tags:
            params["tags"] = ",".join(tags)
        
        data = await self.get("/questions", params=params)
        return [QuestionResponse(**item) for item in data["questions"]]
    
    async def update_question(
        self,
        question_id: UUID,
        tags: Optional[List[str]] = None,
    ) -> QuestionResponse:
        """Update a question"""
        data = await self.put(
            f"/questions/{question_id}",
            {"tags": tags} if tags else {}
        )
        return QuestionResponse(**data)
    
    async def delete_question(self, question_id: UUID) -> dict:
        """Delete a question"""
        return await self.delete(f"/questions/{question_id}")
    
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Send a chat message for a question"""
        data = await self.post(
            f"/questions/{request.question_id}/chat",
            request.model_dump(exclude={"question_id"})
        )
        return ChatResponse(**data)
    
    async def get_question_panels(self, question_id: UUID) -> List[dict]:
        """Get panels for a question"""
        data = await self.get(f"/questions/{question_id}/panels")
        return data["panels"]
    
    async def retry_question(self, question_id: UUID) -> QuestionResponse:
        """Retry processing a failed question"""
        data = await self.post(f"/questions/{question_id}/retry", {})
        return QuestionResponse(**data)


def create_questions_client(api_url: str, api_key: str) -> QuestionsClient:
    """Create a questions API client"""
    return QuestionsClient(api_url, api_key)
