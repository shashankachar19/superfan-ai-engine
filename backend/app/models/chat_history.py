from typing import Optional, List
from bson import ObjectId
from app.db.mongodb import db
from datetime import datetime

class ChatHistoryModel:
    collection_name = "chat_history"

    @classmethod
    async def get_collection(cls):
        if db.db is not None:
            return db.db[cls.collection_name]
        return None

    @classmethod
    async def get_history(cls, user_id: str, character_id: str) -> List[dict]:
        collection = await cls.get_collection()
        if collection is not None:
            # Find the document for this user and character
            doc = await collection.find_one({"user_id": user_id, "character_id": character_id})
            if doc:
                return doc.get("messages", [])
        return []

    @classmethod
    async def save_history(cls, user_id: str, character_id: str, messages: List[dict]) -> bool:
        collection = await cls.get_collection()
        if collection is not None:
            # Upsert the document
            result = await collection.update_one(
                {"user_id": user_id, "character_id": character_id},
                {
                    "$set": {
                        "messages": messages,
                        "updated_at": datetime.utcnow()
                    },
                    "$setOnInsert": {
                        "created_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            return True
        return False
