"""
Main Kurobe client following the Kortix pattern
"""
from typing import Optional

# Temporarily commented out to fix circular imports
# from kurobe.api import connections, questions, dashboards, engines
# from kurobe.question import KurobeQuestion
# from kurobe.dashboard import KurobeDashboard
# from kurobe.connection import KurobeConnection
# from kurobe.engine import KurobeEngine


class Kurobe:
    """Main client for interacting with Kurobe BI platform"""
    
    def __init__(self, api_key: str, api_url: str = "http://localhost:8000/api"):
        """
        Initialize Kurobe client
        
        Args:
            api_key: API key for authentication
            api_url: Base URL for the Kurobe API
        """
        # TODO: Implement API clients when modules are ready
        self.api_key = api_key
        self.api_url = api_url
        pass
    
    async def health_check(self) -> dict:
        """Check API health status"""
        # TODO: Implement when questions client is ready
        return {"status": "ok"}
