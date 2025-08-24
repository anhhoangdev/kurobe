"""
Structured logging configuration for Kurobe
"""
import structlog
import logging
import os
from app.core.config import settings


def setup_logging():
    """Configure structured logging for the application."""
    
    # Set default logging level based on environment
    if settings.ENVIRONMENT == "production":
        default_level = "INFO"
    else:
        default_level = "DEBUG"
    
    LOGGING_LEVEL = logging.getLevelNamesMapping().get(
        os.getenv("LOGGING_LEVEL", default_level).upper(), 
        logging.DEBUG
    )
    
    # Use JSON renderer in production, console renderer in development
    if settings.ENVIRONMENT == "production":
        renderer = [structlog.processors.JSONRenderer()]
    else:
        renderer = [structlog.dev.ConsoleRenderer()]
    
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.CallsiteParameterAdder(
                {
                    structlog.processors.CallsiteParameter.FILENAME,
                    structlog.processors.CallsiteParameter.FUNC_NAME,
                    structlog.processors.CallsiteParameter.LINENO,
                }
            ),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.contextvars.merge_contextvars,
            *renderer,
        ],
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
        wrapper_class=structlog.make_filtering_bound_logger(LOGGING_LEVEL),
    )
    
    # Configure standard logging to work with structlog
    logging.basicConfig(
        format="%(message)s",
        stream=None,
        level=LOGGING_LEVEL,
    )


# Get logger instance
logger: structlog.stdlib.BoundLogger = structlog.get_logger()
