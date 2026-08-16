from typing import List, Optional
from app.db.mongodb import db

class UniverseModel:
    collection_name = "universes"

    @classmethod
    async def get_collection(cls):
        if db.db is not None:
            return db.db[cls.collection_name]
        return None

    @classmethod
    async def get_all(cls) -> List[dict]:
        collection = await cls.get_collection()
        if collection is not None:
            cursor = collection.find({})
            return await cursor.to_list(length=100)
        return []

    @classmethod
    async def get_by_id(cls, universe_id: str) -> Optional[dict]:
        collection = await cls.get_collection()
        if collection is not None:
            return await collection.find_one({"_id": universe_id})
        return None

class CharacterModel:
    collection_name = "characters"

    @classmethod
    async def get_collection(cls):
        if db.db is not None:
            return db.db[cls.collection_name]
        return None

    @classmethod
    async def get_by_universe(cls, universe_id: str) -> List[dict]:
        collection = await cls.get_collection()
        if collection is not None:
            cursor = collection.find({"universe": universe_id})
            return await cursor.to_list(length=100)
        return []
