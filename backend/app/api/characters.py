from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.agents.character_agent import CharacterAgent, Message
from app.core.config import settings
from app.core.security import get_current_user
from app.models.chat_history import ChatHistoryModel

router = APIRouter()

# Initialize service (lazy singleton)
_character_agent: Optional[CharacterAgent] = None

def get_character_agent() -> CharacterAgent:
    global _character_agent
    if _character_agent is None:
        api_key = settings.GEMINI_API_KEY_2 or ""
        _character_agent = CharacterAgent(api_key=api_key if api_key else None)
    return _character_agent

class CharacterChatRequest(BaseModel):
    character_name: str
    universe_name: str
    message: str
    history: List[Message] = []

class CharacterChatResponse(BaseModel):
    response: str
    character_name: str

@router.post("/chat", response_model=CharacterChatResponse)
async def chat_with_character(request: CharacterChatRequest):
    """
    Send a message to a specific character and get their persona-based response.
    """
    agent = get_character_agent()
    response_text = await agent.chat(
        character_name=request.character_name,
        universe_name=request.universe_name,
        message=request.message,
        history=request.history
    )
    
    return {
        "response": response_text,
        "character_name": request.character_name
    }

class SaveHistoryRequest(BaseModel):
    messages: List[Dict[str, Any]]

@router.get("/history/{character_id}")
async def get_chat_history(character_id: str, user_id: str = Depends(get_current_user)):
    """Retrieve chat history for a specific character."""
    history = await ChatHistoryModel.get_history(user_id, character_id)
    return {"history": history}

@router.post("/history/{character_id}")
async def save_chat_history(character_id: str, request: SaveHistoryRequest, user_id: str = Depends(get_current_user)):
    """Save chat history for a specific character."""
    success = await ChatHistoryModel.save_history(user_id, character_id, request.messages)
    return {"success": success}
