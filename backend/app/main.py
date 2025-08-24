"""
Main FastAPI application for Kurobe BI Platform
"""
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.database import init_db, close_db
from app.core.cache import init_cache, close_cache
from app.api.v1.api import api_router
from app.engines.registry import init_engines, close_engines
from app.middleware.auth import AuthMiddleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.metrics import MetricsMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Kurobe Backend API")
    
    # Initialize logging
    setup_logging()
    
    # Initialize database
    await init_db()
    
    # Initialize cache
    await init_cache()
    
    # Initialize engines
    await init_engines()
    
    logger.info("Kurobe Backend API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Kurobe Backend API")
    
    # Close engines
    await close_engines()
    
    # Close cache
    await close_cache()
    
    # Close database
    await close_db()
    
    logger.info("Kurobe Backend API shut down successfully")


# Create FastAPI app
app = FastAPI(
    title="Kurobe BI Platform",
    description="Production-ready BI chat application with pluggable engines",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(MetricsMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint"""
    return {
        "app": "Kurobe BI Platform",
        "version": "0.1.0",
        "status": "running",
        "docs": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "environment": settings.ENVIRONMENT,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler"""
    logger.error(
        "Unhandled exception",
        exc_info=exc,
        path=request.url.path,
        method=request.method,
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": "internal_error",
        },
    )
