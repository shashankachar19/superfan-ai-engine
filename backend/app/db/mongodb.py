import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    try:
        logger.info("Connecting to MongoDB...")
        # Add serverSelectionTimeoutMS to fail fast if no local mongodb is running (demo mode)
        db.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        db.db = db.client[settings.DATABASE_NAME]
        
        # Test connection
        await db.client.server_info()
        logger.info("Successfully connected to MongoDB!")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB: {e}")
        logger.warning("Running in degraded mode (No DB). Ensure fallback logic is in place if required.")

async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        logger.info("MongoDB connection closed.")
