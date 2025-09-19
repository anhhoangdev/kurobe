"""
Question service for managing BI questions and chat sessions
"""

from datetime import datetime
from uuid import UUID, uuid4

from app.core.database import db
from app.core.logging import logger
from app.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    QuestionRequest,
    QuestionResponse,
)


class QuestionService:
    """Service for managing questions and chat sessions."""

    async def create_question(self, request: QuestionRequest, user_id: UUID) -> QuestionResponse:
        """Create a new question."""
        try:
            question_id = uuid4()

            # Insert question into database
            query = """
            INSERT INTO questions (id, user_id, text, context, tags, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
            RETURNING id, user_id, text, context, tags, status, created_at, updated_at, completed_at, error
            """

            result = await db.fetchrow(
                query,
                question_id,
                user_id,
                request.text,
                request.context or {},
                request.tags or [],
            )

            logger.info(f"Created question {question_id} for user {user_id}")

            # TODO: Trigger async processing of the question
            # await self._process_question_async(question_id)

            return QuestionResponse(
                id=result["id"],
                text=result["text"],
                status=result["status"],
                panels=[],  # Will be populated when processing completes
                plan=None,
                error=result["error"],
                created_at=result["created_at"],
                updated_at=result["updated_at"],
                completed_at=result["completed_at"],
            )

        except Exception as e:
            logger.error(f"Failed to create question: {e}")
            raise

    async def get_question(self, question_id: UUID, user_id: UUID) -> QuestionResponse | None:
        """Get a question by ID."""
        try:
            query = """
            SELECT id, user_id, text, context, plan, tags, status, error, created_at, updated_at, completed_at
            FROM questions
            WHERE id = $1 AND user_id = $2
            """

            result = await db.fetchrow(query, question_id, user_id)
            if not result:
                return None

            # Get panels for this question
            panels = await self.get_question_panels(question_id, user_id)

            return QuestionResponse(
                id=result["id"],
                text=result["text"],
                status=result["status"],
                panels=panels,
                plan=result["plan"],
                error=result["error"],
                created_at=result["created_at"],
                updated_at=result["updated_at"],
                completed_at=result["completed_at"],
            )

        except Exception as e:
            logger.error(f"Failed to get question {question_id}: {e}")
            raise

    async def list_questions(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0,
        status: str | None = None,
        tags: list[str] | None = None,
    ) -> list[QuestionResponse]:
        """List questions with filters."""
        try:
            # Build query with filters
            conditions = ["user_id = $1"]
            params = [user_id]
            param_count = 1

            if status:
                param_count += 1
                conditions.append(f"status = ${param_count}")
                params.append(status)

            if tags:
                param_count += 1
                conditions.append(f"tags && ${param_count}")
                params.append(tags)

            where_clause = " AND ".join(conditions)

            query = f"""
            SELECT id, user_id, text, context, plan, tags, status, error, created_at, updated_at, completed_at
            FROM questions
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT ${param_count + 1} OFFSET ${param_count + 2}
            """

            params.extend([limit, offset])
            results = await db.fetch(query, *params)

            # Convert to response objects
            questions = []
            for result in results:
                # Get panels for each question (this could be optimized with a join)
                panels = await self.get_question_panels(result["id"], user_id)

                questions.append(
                    QuestionResponse(
                        id=result["id"],
                        text=result["text"],
                        status=result["status"],
                        panels=panels,
                        plan=result["plan"],
                        error=result["error"],
                        created_at=result["created_at"],
                        updated_at=result["updated_at"],
                        completed_at=result["completed_at"],
                    )
                )

            return questions

        except Exception as e:
            logger.error(f"Failed to list questions for user {user_id}: {e}")
            raise

    async def update_question(
        self,
        question_id: UUID,
        user_id: UUID,
        tags: list[str] | None = None,
    ) -> QuestionResponse | None:
        """Update a question."""
        try:
            # Build update query
            updates = ["updated_at = NOW()"]
            params = []
            param_count = 0

            if tags is not None:
                param_count += 1
                updates.append(f"tags = ${param_count}")
                params.append(tags)

            if not updates:
                return await self.get_question(question_id, user_id)

            update_clause = ", ".join(updates)
            params.extend([question_id, user_id])

            query = f"""
            UPDATE questions
            SET {update_clause}
            WHERE id = ${param_count + 1} AND user_id = ${param_count + 2}
            RETURNING id
            """

            result = await db.fetchrow(query, *params)
            if not result:
                return None

            return await self.get_question(question_id, user_id)

        except Exception as e:
            logger.error(f"Failed to update question {question_id}: {e}")
            raise

    async def delete_question(self, question_id: UUID, user_id: UUID) -> bool:
        """Delete a question."""
        try:
            query = """
            DELETE FROM questions
            WHERE id = $1 AND user_id = $2
            """

            result = await db.execute(query, question_id, user_id)
            return "DELETE 1" in result

        except Exception as e:
            logger.error(f"Failed to delete question {question_id}: {e}")
            raise

    async def chat_with_question(self, request: ChatRequest, user_id: UUID) -> ChatResponse:
        """Continue a conversation with a question."""
        try:
            # Verify question exists and belongs to user
            question = await self.get_question(request.question_id, user_id)
            if not question:
                raise ValueError("Question not found")

            # Store the user message
            await self._store_chat_message(request.question_id, "user", request.message, request.context)

            # TODO: Process the message and generate response
            # For now, return a placeholder response
            assistant_message = ChatMessage(
                role="assistant",
                content="I understand your question. This feature is still being implemented.",
                timestamp=datetime.utcnow(),
            )

            await self._store_chat_message(
                request.question_id,
                "assistant",
                assistant_message.content,
            )

            return ChatResponse(
                question_id=request.question_id,
                message=assistant_message,
                panels=None,
                suggested_actions=None,
                status="completed",
            )

        except Exception as e:
            logger.error(f"Failed to chat with question {request.question_id}: {e}")
            raise

    async def get_question_panels(self, question_id: UUID, user_id: UUID) -> list[dict]:
        """Get all panels for a question."""
        try:
            query = """
            SELECT p.id, p.spec, p.is_pinned, p.position, p.created_at, p.updated_at
            FROM panels p
            JOIN questions q ON p.question_id = q.id
            WHERE q.id = $1 AND q.user_id = $2
            ORDER BY p.created_at
            """

            results = await db.fetch(query, question_id, user_id)
            return [dict(result) for result in results]

        except Exception as e:
            logger.error(f"Failed to get panels for question {question_id}: {e}")
            raise

    async def retry_question(self, question_id: UUID, user_id: UUID) -> QuestionResponse | None:
        """Retry processing a failed question."""
        try:
            # Update question status to pending
            query = """
            UPDATE questions
            SET status = 'pending', error = NULL, updated_at = NOW()
            WHERE id = $1 AND user_id = $2 AND status = 'failed'
            RETURNING id
            """

            result = await db.fetchrow(query, question_id, user_id)
            if not result:
                return None

            # TODO: Trigger async processing
            # await self._process_question_async(question_id)

            return await self.get_question(question_id, user_id)

        except Exception as e:
            logger.error(f"Failed to retry question {question_id}: {e}")
            raise

    async def _store_chat_message(
        self,
        question_id: UUID,
        role: str,
        content: str,
        metadata: dict | None = None,
    ):
        """Store a chat message in the database."""
        try:
            query = """
            INSERT INTO chat_messages (id, question_id, role, content, metadata, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            """

            await db.execute(
                query,
                uuid4(),
                question_id,
                role,
                content,
                metadata or {},
            )

        except Exception as e:
            logger.error(f"Failed to store chat message: {e}")
            raise
