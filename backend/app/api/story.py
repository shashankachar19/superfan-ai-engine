from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.agents.story_agent import PersonalizedStoryAgent
from app.core.config import settings

router = APIRouter()

_story_agent: Optional[PersonalizedStoryAgent] = None

def get_story_agent() -> PersonalizedStoryAgent:
    global _story_agent
    if _story_agent is None:
        api_key = settings.GEMINI_API_KEY_4 or ""
        _story_agent = PersonalizedStoryAgent(api_key=api_key if api_key else None)
    return _story_agent


class PersonalizedStoryRequest(BaseModel):
    universe_name: str
    user_name: str
    role: str = "a new recruit"
    scenario: Optional[str] = ""


class PersonalizedStoryResponse(BaseModel):
    story: str
    universe_name: str
    user_name: str


@router.post("/generate", response_model=PersonalizedStoryResponse)
async def generate_personalized_story(request: PersonalizedStoryRequest):
    """Generate a personalized story where the user is the protagonist."""
    agent = get_story_agent()
    story_text = await agent.generate_story(
        universe_name=request.universe_name,
        user_name=request.user_name,
        role=request.role,
        scenario=request.scenario or "",
    )
    return {
        "story": story_text,
        "universe_name": request.universe_name,
        "user_name": request.user_name,
    }
