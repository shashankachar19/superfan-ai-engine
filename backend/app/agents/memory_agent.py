"""
Fan Memory Agent for SuperFan AI.

Stores and retrieves user preferences, interaction history,
and generates AI summaries of a user's fandom journey.
"""
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.db.mongodb import db
from app.core.config import settings
from app.core.llm import LLMService

logger = logging.getLogger(__name__)


class MemoryAgent:
    """
    Manages persistent user memory — preferences, interactions, and journey summaries.
    """
    def __init__(self, api_key: Optional[str] = None):
        pass

    async def save_preference(self, user_id: str, preference_type: str, value: str, universe: Optional[str] = None) -> Dict[str, Any]:
        """Save a user preference or interaction to the database."""
        doc = {
            "user_id": user_id,
            "type": preference_type,
            "value": value,
            "universe": universe,
            "timestamp": datetime.utcnow(),
        }

        if db.db is not None:
            result = await db.db["user_memories"].insert_one(doc)
            doc["_id"] = str(result.inserted_id)
        else:
            doc["_id"] = f"mock_{datetime.utcnow().timestamp()}"

        return doc

    async def get_preferences(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieve all stored preferences for a user."""
        if db.db is not None:
            cursor = db.db["user_memories"].find({"user_id": user_id}).sort("timestamp", -1).limit(50)
            docs = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                docs.append(doc)
            return docs

        # Fallback mock data
        return [
            {"_id": "mock_1", "user_id": user_id, "type": "favorite_character", "value": "Luffy", "universe": "One Piece", "timestamp": datetime.utcnow().isoformat()},
            {"_id": "mock_2", "user_id": user_id, "type": "quiz_score", "value": "8/10 on One Piece Hard Mode", "universe": "One Piece", "timestamp": datetime.utcnow().isoformat()},
            {"_id": "mock_3", "user_id": user_id, "type": "chat_interaction", "value": "Chatted with Naruto about ramen", "universe": "Naruto", "timestamp": datetime.utcnow().isoformat()},
            {"_id": "mock_4", "user_id": user_id, "type": "story_generated", "value": "Epic battle scene in Marineford", "universe": "One Piece", "timestamp": datetime.utcnow().isoformat()},
        ]

    async def get_journey_summary(self, user_id: str) -> str:
        """Generate an AI summary of the user's fandom journey."""
        preferences = await self.get_preferences(user_id)

        if not preferences:
            return "Your fandom journey is just beginning! Start exploring universes, chatting with characters, and taking quizzes to build your memory."

        # Build context from preferences
        pref_text = "\n".join([
            f"- [{p.get('type', 'unknown')}] {p.get('value', '')} (Universe: {p.get('universe', 'N/A')})"
            for p in preferences[:20]
        ])

        try:
            prompt = f"""You are SuperFan AI's memory system. Based on this user's interaction history, 
write a short, enthusiastic 2-3 paragraph summary of their fandom journey. 
Highlight their favorite universes, characters they've chatted with, and achievements.

USER HISTORY:
{pref_text}

Write the summary in second person ("You have..."). Be warm and encouraging."""
            
            messages = [{"role": "system", "content": "You are SuperFan AI's memory system."}, {"role": "user", "content": prompt}]
            response_text = await LLMService.generate_response(
                model=settings.MEMORY_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=600
            )
            if response_text:
                return response_text
        except Exception as e:
            logger.error(f"Journey summary generation failed: {e}")

        # Fallback
        universes = set(p.get("universe", "") for p in preferences if p.get("universe"))
        return (
            f"You've been on an incredible fandom journey! "
            f"You've explored {len(universes)} universe(s) including {', '.join(universes)}. "
            f"With {len(preferences)} recorded interactions, you're building an impressive fan profile. "
            f"Keep exploring, chatting with characters, and taking quizzes to unlock more of your fandom potential!"
        )
