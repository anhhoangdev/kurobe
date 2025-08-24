"""
Redis cache service for Kurobe
"""
import redis.asyncio as redis
import asyncio
from typing import Any, Optional, List
import json
import hashlib

from app.core.config import settings
from app.core.logging import logger

# Redis client and connection pool
client: Optional[redis.Redis] = None
pool: Optional[redis.ConnectionPool] = None
_initialized = False
_init_lock = asyncio.Lock()

# Constants
REDIS_KEY_TTL = 3600 * 24  # 24 hour TTL as safety mechanism
QUERY_CACHE_TTL = 3600  # 1 hour for query results


def initialize():
    """Initialize Redis connection pool and client."""
    global client, pool

    # Get Redis configuration from settings
    redis_url = str(settings.REDIS_URL)
    
    # Parse URL to get components
    if redis_url.startswith("redis://"):
        # Connection pool configuration - optimized for production
        max_connections = 128
        socket_timeout = 15.0
        connect_timeout = 10.0
        retry_on_timeout = True

        logger.debug(f"Initializing Redis connection pool with max {max_connections} connections")

        # Create connection pool with production-optimized settings
        pool = redis.ConnectionPool.from_url(
            redis_url,
            decode_responses=True,
            socket_timeout=socket_timeout,
            socket_connect_timeout=connect_timeout,
            socket_keepalive=True,
            retry_on_timeout=retry_on_timeout,
            health_check_interval=30,
            max_connections=max_connections,
        )

        # Create Redis client from connection pool
        client = redis.Redis(connection_pool=pool)

    return client


async def initialize_async():
    """Initialize Redis connection asynchronously."""
    global client, _initialized

    async with _init_lock:
        if not _initialized:
            logger.debug("Initializing Redis connection")
            initialize()

        try:
            # Test connection with timeout
            await asyncio.wait_for(client.ping(), timeout=5.0)
            logger.debug("Successfully connected to Redis")
            _initialized = True
        except asyncio.TimeoutError:
            logger.error("Redis connection timeout during initialization")
            client = None
            _initialized = False
            raise ConnectionError("Redis connection timeout")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            client = None
            _initialized = False
            raise

    return client


async def close():
    """Close Redis connection and connection pool."""
    global client, pool, _initialized
    if client:
        logger.debug("Closing Redis connection")
        try:
            await asyncio.wait_for(client.aclose(), timeout=5.0)
        except asyncio.TimeoutError:
            logger.warning("Redis close timeout, forcing close")
        except Exception as e:
            logger.warning(f"Error closing Redis client: {e}")
        finally:
            client = None
    
    if pool:
        logger.debug("Closing Redis connection pool")
        try:
            await asyncio.wait_for(pool.aclose(), timeout=5.0)
        except asyncio.TimeoutError:
            logger.warning("Redis pool close timeout, forcing close")
        except Exception as e:
            logger.warning(f"Error closing Redis pool: {e}")
        finally:
            pool = None
    
    _initialized = False
    logger.debug("Redis connection and pool closed")


async def get_client():
    """Get the Redis client, initializing if necessary."""
    global client, _initialized
    if client is None or not _initialized:
        await initialize_async()
    return client


# Basic Redis operations
async def set(key: str, value: str, ex: Optional[int] = None, nx: bool = False):
    """Set a Redis key."""
    redis_client = await get_client()
    return await redis_client.set(key, value, ex=ex, nx=nx)


async def get(key: str, default: Optional[str] = None):
    """Get a Redis key."""
    redis_client = await get_client()
    result = await redis_client.get(key)
    return result if result is not None else default


async def delete(key: str):
    """Delete a Redis key."""
    redis_client = await get_client()
    return await redis_client.delete(key)


async def publish(channel: str, message: str):
    """Publish a message to a Redis channel."""
    redis_client = await get_client()
    return await redis_client.publish(channel, message)


async def create_pubsub():
    """Create a Redis pubsub object."""
    redis_client = await get_client()
    return redis_client.pubsub()


# Query caching specific functions
def generate_query_cache_key(query: str, connection_id: str, parameters: Optional[dict] = None) -> str:
    """Generate a cache key for a query."""
    # Normalize query (remove extra whitespace)
    normalized_query = " ".join(query.split())
    
    # Create cache key components
    key_components = [normalized_query, connection_id]
    if parameters:
        key_components.append(json.dumps(parameters, sort_keys=True))
    
    # Generate hash
    key_string = "|".join(key_components)
    query_hash = hashlib.sha256(key_string.encode()).hexdigest()[:16]
    
    return f"query_cache:{query_hash}"


async def cache_query_result(
    query: str,
    connection_id: str,
    result: dict,
    parameters: Optional[dict] = None,
    ttl: int = QUERY_CACHE_TTL
):
    """Cache a query result."""
    try:
        cache_key = generate_query_cache_key(query, connection_id, parameters)
        result_json = json.dumps(result)
        await set(cache_key, result_json, ex=ttl)
        logger.debug(f"Cached query result with key: {cache_key}")
    except Exception as e:
        logger.warning(f"Failed to cache query result: {e}")


async def get_cached_query_result(
    query: str,
    connection_id: str,
    parameters: Optional[dict] = None
) -> Optional[dict]:
    """Get a cached query result."""
    try:
        cache_key = generate_query_cache_key(query, connection_id, parameters)
        cached_result = await get(cache_key)
        if cached_result:
            logger.debug(f"Cache hit for query key: {cache_key}")
            return json.loads(cached_result)
        else:
            logger.debug(f"Cache miss for query key: {cache_key}")
            return None
    except Exception as e:
        logger.warning(f"Failed to get cached query result: {e}")
        return None


# Session management
async def store_session(session_id: str, data: dict, ttl: int = 3600):
    """Store session data."""
    try:
        session_key = f"session:{session_id}"
        session_json = json.dumps(data)
        await set(session_key, session_json, ex=ttl)
    except Exception as e:
        logger.warning(f"Failed to store session: {e}")


async def get_session(session_id: str) -> Optional[dict]:
    """Get session data."""
    try:
        session_key = f"session:{session_id}"
        session_data = await get(session_key)
        if session_data:
            return json.loads(session_data)
        return None
    except Exception as e:
        logger.warning(f"Failed to get session: {e}")
        return None


async def delete_session(session_id: str):
    """Delete session data."""
    try:
        session_key = f"session:{session_id}"
        await delete(session_key)
    except Exception as e:
        logger.warning(f"Failed to delete session: {e}")


# Rate limiting
async def check_rate_limit(key: str, limit: int, window: int) -> bool:
    """Check if a rate limit is exceeded."""
    try:
        redis_client = await get_client()
        current = await redis_client.incr(key)
        if current == 1:
            await redis_client.expire(key, window)
        return current <= limit
    except Exception as e:
        logger.warning(f"Failed to check rate limit: {e}")
        return True  # Allow on error


# Initialization functions for FastAPI
async def init_cache():
    """Initialize the cache connection."""
    await initialize_async()


async def close_cache():
    """Close the cache connection."""
    await close()
