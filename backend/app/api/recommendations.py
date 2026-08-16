from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.agents.recommendation_agent import RecommendationAgent
from app.core.config import settings

router = APIRouter()

_recommendation_agent: Optional[RecommendationAgent] = None

def get_recommendation_agent() -> RecommendationAgent:
    global _recommendation_agent
    if _recommendation_agent is None:
        api_key = settings.GEMINI_API_KEY_3 or ""
        _recommendation_agent = RecommendationAgent(api_key=api_key if api_key else None)
    return _recommendation_agent


class RecommendationRequest(BaseModel):
    universe_name: str
    preferences: Optional[str] = None


@router.post("/get")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized recommendations for a universe."""
    agent = get_recommendation_agent()
    recommendations = await agent.get_recommendations(
        universe_name=request.universe_name,
        preferences=request.preferences,
    )
    return {
        "universe_name": request.universe_name,
        "recommendations": recommendations,
    }
