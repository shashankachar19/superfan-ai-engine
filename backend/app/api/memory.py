from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.agents.memory_agent import MemoryAgent
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter()

_memory_agent: Optional[MemoryAgent] = None

def get_memory_agent() -> MemoryAgent:
    global _memory_agent
    if _memory_agent is None:
        api_key = settings.GEMINI_API_KEY_4 or ""
        _memory_agent = MemoryAgent(api_key=api_key if api_key else None)
    return _memory_agent


class SavePreferenceRequest(BaseModel):
    preference_type: str
    value: str
    universe: Optional[str] = None


@router.post("/save")
async def save_preference(request: SavePreferenceRequest, user_id: str = Depends(get_current_user)):
    """Save a user preference or interaction to memory."""
    agent = get_memory_agent()
    result = await agent.save_preference(
        user_id=user_id,
        preference_type=request.preference_type,
        value=request.value,
        universe=request.universe,
    )
    return result


@router.get("/")
async def get_preferences(user_id: str = Depends(get_current_user)):
    """Get all stored preferences for a user."""
    agent = get_memory_agent()
    preferences = await agent.get_preferences(user_id)
    return {"user_id": user_id, "preferences": preferences}


@router.get("/summary")
async def get_journey_summary(user_id: str = Depends(get_current_user)):
    """Get an AI-generated summary of the user's fandom journey."""
    agent = get_memory_agent()
    summary = await agent.get_journey_summary(user_id)
    return {"user_id": user_id, "summary": summary}
