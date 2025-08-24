"""
Logging middleware for Kurobe API
"""
import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

from app.core.logging import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests and responses."""
    
    async def dispatch(self, request: Request, call_next):
        # Clear any existing context
        structlog.contextvars.clear_contextvars()
        
        # Generate request ID
        request_id = str(uuid.uuid4())
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query_params = str(request.query_params)
        
        # Bind context variables
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            client_ip=client_ip,
            method=method,
            path=path,
            query_params=query_params
        )
        
        # Add request ID to request state
        request.state.request_id = request_id
        
        # Log the incoming request
        logger.info(
            "Request started",
            method=method,
            path=path,
            client_ip=client_ip,
            query_params=query_params
        )
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log successful response
            logger.info(
                "Request completed",
                method=method,
                path=path,
                status_code=response.status_code,
                process_time=f"{process_time:.3f}s"
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log failed request
            logger.error(
                "Request failed",
                method=method,
                path=path,
                error=str(e),
                process_time=f"{process_time:.3f}s",
                exc_info=True
            )
            raise
