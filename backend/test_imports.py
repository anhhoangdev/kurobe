"""
Test imports to verify the structure works
"""

try:
    from app.core.config import settings

    print("✓ Config import successful")
except ImportError as e:
    print(f"✗ Config import failed: {e}")

try:
    from app.core.logging import logger

    print("✓ Logging import successful")
except ImportError as e:
    print(f"✗ Logging import failed: {e}")

try:
    from app.core.database import db

    print("✓ Database import successful")
except ImportError as e:
    print(f"✗ Database import failed: {e}")

try:
    from app.core.cache import init_cache

    print("✓ Cache import successful")
except ImportError as e:
    print(f"✗ Cache import failed: {e}")

try:
    from app.api.v1.api import api_router

    print("✓ API router import successful")
except ImportError as e:
    print(f"✗ API router import failed: {e}")

print("\nAll imports completed!")
