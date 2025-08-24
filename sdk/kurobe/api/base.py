"""
Base API client functionality
"""
from typing import Any, Dict, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


class BaseAPIClient:
    """Base class for API clients"""
    
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=self.headers,
            timeout=30.0,
        )
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
    
    async def close(self):
        """Close the HTTP client"""
        await self._client.aclose()
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def _request(
        self,
        method: str,
        endpoint: str,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> httpx.Response:
        """Make an HTTP request with retry logic"""
        response = await self._client.request(
            method=method,
            url=endpoint,
            json=json,
            params=params,
        )
        response.raise_for_status()
        return response
    
    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make a GET request"""
        response = await self._request("GET", endpoint, params=params)
        return response.json()
    
    async def post(self, endpoint: str, json: Dict[str, Any]) -> Dict[str, Any]:
        """Make a POST request"""
        response = await self._request("POST", endpoint, json=json)
        return response.json()
    
    async def put(self, endpoint: str, json: Dict[str, Any]) -> Dict[str, Any]:
        """Make a PUT request"""
        response = await self._request("PUT", endpoint, json=json)
        return response.json()
    
    async def delete(self, endpoint: str) -> Dict[str, Any]:
        """Make a DELETE request"""
        response = await self._request("DELETE", endpoint)
        return response.json()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check API health"""
        return await self.get("/health")
