"""
Metrics middleware for Kurobe API using Prometheus
"""

import time

from fastapi import Request
from prometheus_client import Counter, Histogram, generate_latest
from starlette.middleware.base import BaseHTTPMiddleware

# Prometheus metrics
REQUEST_COUNT = Counter("kurobe_http_requests_total", "Total HTTP requests", ["method", "endpoint", "status_code"])

REQUEST_DURATION = Histogram(
    "kurobe_http_request_duration_seconds", "HTTP request duration in seconds", ["method", "endpoint"]
)

ACTIVE_CONNECTIONS = Counter("kurobe_active_connections_total", "Total active connections")


class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware to collect Prometheus metrics."""

    async def dispatch(self, request: Request, call_next):
        # Skip metrics collection for metrics endpoint itself
        if request.url.path == "/metrics":
            return await call_next(request)

        start_time = time.time()
        method = request.method
        path = request.url.path

        # Normalize path for metrics (remove dynamic segments)
        normalized_path = self.normalize_path(path)

        try:
            response = await call_next(request)
            duration = time.time() - start_time
            status_code = str(response.status_code)

            # Record metrics
            REQUEST_COUNT.labels(method=method, endpoint=normalized_path, status_code=status_code).inc()

            REQUEST_DURATION.labels(method=method, endpoint=normalized_path).observe(duration)

            return response

        except Exception:
            duration = time.time() - start_time

            # Record error metrics
            REQUEST_COUNT.labels(method=method, endpoint=normalized_path, status_code="500").inc()

            REQUEST_DURATION.labels(method=method, endpoint=normalized_path).observe(duration)

            raise

    def normalize_path(self, path: str) -> str:
        """Normalize path for metrics to avoid high cardinality."""
        # Replace UUIDs and other dynamic segments with placeholders
        import re

        # Replace UUIDs
        path = re.sub(r"/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", "/{id}", path)

        # Replace other common patterns
        path = re.sub(r"/\d+", "/{id}", path)  # Replace numeric IDs

        return path


def get_metrics() -> str:
    """Get Prometheus metrics in text format."""
    return generate_latest().decode("utf-8")
