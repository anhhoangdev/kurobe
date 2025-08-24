"""
Question management following the Kortix pattern
"""
from typing import List, Optional, AsyncGenerator
from uuid import UUID

from kurobe.api.questions import QuestionsClient, ChatRequest
from kurobe.core.schemas import QuestionResponse, ChatResponse
from kurobe.core.models import Panel, PanelSpec


class Question:
    """Represents a single question/chat session"""
    
    def __init__(self, client: QuestionsClient, question_id: UUID):
        self._client = client
        self._question_id = question_id
        self._cached_data: Optional[QuestionResponse] = None
    
    async def refresh(self) -> QuestionResponse:
        """Refresh question data from API"""
        self._cached_data = await self._client.get_question(self._question_id)
        return self._cached_data
    
    async def get_data(self) -> QuestionResponse:
        """Get question data (cached or fresh)"""
        if not self._cached_data:
            await self.refresh()
        return self._cached_data
    
    async def chat(self, message: str, context: Optional[dict] = None) -> ChatResponse:
        """Continue the conversation"""
        request = ChatRequest(
            question_id=self._question_id,
            message=message,
            context=context,
        )
        response = await self._client.chat(request)
        # Invalidate cache as new panels might be generated
        self._cached_data = None
        return response
    
    async def get_panels(self) -> List[PanelSpec]:
        """Get all panels for this question"""
        panels_data = await self._client.get_question_panels(self._question_id)
        return [PanelSpec(**panel) for panel in panels_data]
    
    async def update_tags(self, tags: List[str]) -> QuestionResponse:
        """Update question tags"""
        response = await self._client.update_question(self._question_id, tags=tags)
        self._cached_data = response
        return response
    
    async def retry(self) -> QuestionResponse:
        """Retry processing if failed"""
        response = await self._client.retry_question(self._question_id)
        self._cached_data = response
        return response
    
    async def delete(self) -> dict:
        """Delete this question"""
        return await self._client.delete_question(self._question_id)
    
    async def stream_updates(self) -> AsyncGenerator[dict, None]:
        """Stream real-time updates for this question"""
        # This would connect to a WebSocket or SSE endpoint
        # Implementation depends on backend real-time capabilities
        raise NotImplementedError("Real-time streaming not yet implemented")


class KurobeQuestion:
    """Question management interface"""
    
    def __init__(self, client: QuestionsClient):
        self._client = client
    
    async def create(
        self,
        text: str,
        context: Optional[dict] = None,
        connection_ids: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
    ) -> Question:
        """Create a new question"""
        from kurobe.core.schemas import QuestionRequest
        
        request = QuestionRequest(
            text=text,
            context=context,
            connection_ids=connection_ids,
            tags=tags,
        )
        response = await self._client.create_question(request)
        return Question(self._client, response.id)
    
    async def get(self, question_id: UUID) -> Question:
        """Get an existing question"""
        # Verify it exists
        await self._client.get_question(question_id)
        return Question(self._client, question_id)
    
    async def list(
        self,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> List[Question]:
        """List questions with filters"""
        responses = await self._client.list_questions(
            limit=limit,
            offset=offset,
            status=status,
            tags=tags,
        )
        return [Question(self._client, resp.id) for resp in responses]
