from typing import Optional
from bson import ObjectId
from app.db.mongodb import db

class UserModel:
    collection_name = "users"

    @classmethod
    async def get_collection(cls):
        if db.db is not None:
            return db.db[cls.collection_name]
        return None

    @classmethod
    async def find_by_email(cls, email: str) -> Optional[dict]:
        collection = await cls.get_collection()
        if collection is not None:
            return await collection.find_one({"email": email})
        return None

    @classmethod
    async def create_user(cls, user_data: dict) -> str:
        collection = await cls.get_collection()
        if collection is not None:
            result = await collection.insert_one(user_data)
            return str(result.inserted_id)
        # Mock fallback for dev mode without DB
        return str(ObjectId())

    @classmethod
    async def find_by_id(cls, user_id: str) -> Optional[dict]:
        collection = await cls.get_collection()
        if collection is not None:
            try:
                return await collection.find_one({"_id": ObjectId(user_id)})
            except:
                return None
        return None

    @classmethod
    async def update_user(cls, user_id: str, update_data: dict) -> bool:
        collection = await cls.get_collection()
        if collection is not None:
            try:
                result = await collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": update_data}
                )
                return result.modified_count > 0
            except:
                return False
        return True # Mock success in dev mode
