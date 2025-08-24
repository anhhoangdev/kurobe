"""
Application configuration using Pydantic settings
"""
from typing import Any, Dict, List, Optional, Union
from pathlib import Path

from pydantic import PostgresDsn, RedisDsn, field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        env_parse_enums=True,
        env_parse_none_str=True,
        env_ignore_empty=True,
    )
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Kurobe BI Platform"
    ENVIRONMENT: str = "development"  # development, staging, production
    DEBUG: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: str = Field(default="")
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as a list"""
        if not self.BACKEND_CORS_ORIGINS or self.BACKEND_CORS_ORIGINS.strip() == "":
            return []
        return [i.strip() for i in self.BACKEND_CORS_ORIGINS.split(",") if i.strip()]
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "kurobe"
    POSTGRES_PASSWORD: str = "kurobe"
    POSTGRES_DB: str = "kurobe"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[PostgresDsn] = None
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info) -> Any:
        if isinstance(v, str):
            return v
        
        # Get values from the model instance
        values = info.data if hasattr(info, 'data') else {}
        
        return PostgresDsn.build(
            scheme="postgresql",
            username=values.get("POSTGRES_USER", "kurobe"),
            password=values.get("POSTGRES_PASSWORD", "kurobe"),
            host=values.get("POSTGRES_SERVER", "localhost"),
            port=values.get("POSTGRES_PORT", 5432),
            path=values.get("POSTGRES_DB", "kurobe"),
        )
    
    # Redis Cache
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    REDIS_URL: Optional[RedisDsn] = None
    
    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def assemble_redis_connection(cls, v: Optional[str], info) -> Any:
        if isinstance(v, str):
            return v
        
        # Get values from the model instance
        values = info.data if hasattr(info, 'data') else {}
        password = values.get("REDIS_PASSWORD")
        
        return RedisDsn.build(
            scheme="redis",
            username=None,
            password=password,
            host=values.get("REDIS_HOST", "localhost"),
            port=values.get("REDIS_PORT", 6379),
            path=str(values.get("REDIS_DB", 0)),
        )
    
    # Authentication
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # API Keys
    API_KEY_PREFIX: str = "kb_"
    
    # Engine Configuration
    ENGINE_CONFIG_PATH: Path = Path("config/engines.yaml")
    
    # LLM Configuration
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Observability
    LANGFUSE_PUBLIC_KEY: Optional[str] = None
    LANGFUSE_SECRET_KEY: Optional[str] = None
    LANGFUSE_HOST: Optional[str] = "https://cloud.langfuse.com"
    
    SENTRY_DSN: Optional[str] = None
    
    # Background Jobs
    DRAMATIQ_BROKER_URL: Optional[str] = None
    
    @field_validator("DRAMATIQ_BROKER_URL", mode="before")
    @classmethod
    def get_dramatiq_broker_url(cls, v: Optional[str], info) -> str:
        if v:
            return v
        # Use Redis URL for Dramatiq
        values = info.data if hasattr(info, 'data') else {}
        return str(values.get("REDIS_URL", "redis://localhost:6379/1"))
    
    # File Storage
    UPLOAD_DIR: Path = Path("uploads")
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # Query Execution
    DEFAULT_QUERY_TIMEOUT: int = 30  # seconds
    MAX_QUERY_TIMEOUT: int = 300  # 5 minutes
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    



# Create global settings instance
settings = Settings()
