from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.agents.moderation_agent import ModerationAgent
from app.core.config import settings
from app.core.llm import get_random_gemini_key

router = APIRouter()

# Initialize service (lazy singleton)
_moderation_agent: Optional[ModerationAgent] = None

def get_moderation_agent() -> ModerationAgent:
    global _moderation_agent
    if _moderation_agent is None:
        api_key = get_random_gemini_key()
        _moderation_agent = ModerationAgent(api_key=api_key if api_key else None)
    return _moderation_agent

class CommunityPostRequest(BaseModel):
    universe_name: str
    content: str
    author: str = "Anonymous Fan"

class CommunityPostResponse(BaseModel):
    accepted: bool
    reason: str
    post: Optional[dict] = None

@router.post("/post", response_model=CommunityPostResponse)
async def submit_post(request: CommunityPostRequest):
    """
    Submit a community post and evaluate it using the ModerationAgent.
    """
    agent = get_moderation_agent()
    result = await agent.moderate_post(
        universe_name=request.universe_name,
        content=request.content
    )
    
    response_data = {
        "accepted": result.get("accepted", False),
        "reason": result.get("reason", "Failed to moderate post.")
    }
    
    if response_data["accepted"]:
        # In a real app, we would save to the DB here.
        # For this demo, we just echo it back.
        response_data["post"] = {
            "universe_name": request.universe_name,
            "content": request.content,
            "author": request.author
        }
        
    return response_data
