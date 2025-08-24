"""
Authentication middleware for Kurobe API
"""
from typing import Optional
from datetime import datetime
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import hashlib

from app.core.database import db
from app.core.logging import logger


class AuthMiddleware(BaseHTTPMiddleware):
    """Authentication middleware using API keys."""
    
    # Paths that don't require authentication
    EXEMPT_PATHS = {
        "/",
        "/health",
        "/api/v1/health",
        "/api/v1/docs",
        "/api/v1/openapi.json",
        "/api/v1/redoc",
    }
    
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for exempt paths
        if request.url.path in self.EXEMPT_PATHS:
            return await call_next(request)
        
        # Skip for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
        
        # Extract API key from header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            logger.warning(f"Missing authorization header for {request.url.path}")
            return Response(
                content='{"detail": "Missing authorization header"}',
                status_code=status.HTTP_401_UNAUTHORIZED,
                media_type="application/json"
            )
        
        if not auth_header.startswith("Bearer "):
            logger.warning(f"Invalid authorization header format for {request.url.path}")
            return Response(
                content='{"detail": "Invalid authorization header format"}',
                status_code=status.HTTP_401_UNAUTHORIZED,
                media_type="application/json"
            )
        
        api_key = auth_header[7:]  # Remove "Bearer " prefix
        
        # Validate API key and get user
        user = await self.validate_api_key(api_key)
        if not user:
            logger.warning(f"Invalid API key for {request.url.path}")
            return Response(
                content='{"detail": "Invalid API key"}',
                status_code=status.HTTP_401_UNAUTHORIZED,
                media_type="application/json"
            )
        
        # Add user to request state
        request.state.user = user
        
        # Update last used timestamp for API key
        await self.update_api_key_usage(api_key)
        
        return await call_next(request)
    
    async def validate_api_key(self, api_key: str) -> Optional[dict]:
        """Validate API key and return user information."""
        try:
            # Hash the API key to match stored hash
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            
            # Query database for API key
            query = """
            SELECT ak.id, ak.user_id, ak.name, ak.expires_at, ak.is_active,
                   u.id as user_id, u.email, u.username, u.full_name, u.is_active as user_active, u.is_superuser
            FROM api_keys ak
            JOIN users u ON ak.user_id = u.id
            WHERE ak.key_hash = $1 AND ak.is_active = true AND u.is_active = true
            """
            
            result = await db.fetchrow(query, key_hash)
            if not result:
                return None
            
            # Check if key is expired
            if result['expires_at'] and result['expires_at'] < datetime.utcnow():
                return None
            
            return {
                'api_key_id': result['id'],
                'user_id': result['user_id'],
                'email': result['email'],
                'username': result['username'],
                'full_name': result['full_name'],
                'is_superuser': result['is_superuser'],
            }
            
        except Exception as e:
            logger.error(f"Error validating API key: {e}")
            return None
    
    async def update_api_key_usage(self, api_key: str):
        """Update the last used timestamp for an API key."""
        try:
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            await db.execute(
                "UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1",
                key_hash
            )
        except Exception as e:
            logger.warning(f"Failed to update API key usage: {e}")


def get_current_user(request: Request) -> dict:
    """Get the current user from request state."""
    if not hasattr(request.state, 'user'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return request.state.user