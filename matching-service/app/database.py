"""
MongoDB async connection management using motor.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

_client: AsyncIOMotorClient = None
_db = None


async def connect_db():
    global _client, _db
    _client = AsyncIOMotorClient(settings.mongo_uri)
    _db = _client.get_default_database()
    print(f"[Matching] MongoDB connected: {settings.mongo_uri}")


async def disconnect_db():
    global _client
    if _client:
        _client.close()
        print("[Matching] MongoDB disconnected")


def get_db():
    return _db
