"""
Engine registry for loading and managing pluggable engines
"""

from typing import Any

import yaml
from kurobe.core.interfaces import engine_registry

from app.core.config import settings
from app.core.logging import logger


async def init_engines():
    """Initialize engines from configuration."""
    try:
        logger.info("Initializing engines from configuration")

        # Load engine configuration
        config_path = settings.ENGINE_CONFIG_PATH
        if not config_path.exists():
            logger.warning(f"Engine config file not found: {config_path}")
            return

        with open(config_path) as f:
            config_data = yaml.safe_load(f)

        # TODO: Register and initialize engines based on configuration
        # This is a placeholder for the engine loading logic

        logger.info("Engines initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize engines: {e}")
        raise


async def close_engines():
    """Close all engines."""
    try:
        logger.info("Closing all engines")
        await engine_registry.shutdown_all()
        logger.info("All engines closed successfully")
    except Exception as e:
        logger.error(f"Error closing engines: {e}")


def get_engine_config() -> dict[str, Any]:
    """Get the current engine configuration."""
    try:
        config_path = settings.ENGINE_CONFIG_PATH
        if not config_path.exists():
            return {}

        with open(config_path) as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.error(f"Failed to load engine config: {e}")
        return {}
