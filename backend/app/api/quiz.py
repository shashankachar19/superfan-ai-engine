from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.agents.quiz_agent import QuizAgent
from app.core.config import settings

router = APIRouter()

# Initialize service (lazy singleton)
_quiz_agent: Optional[QuizAgent] = None

def get_quiz_agent() -> QuizAgent:
    global _quiz_agent
    if _quiz_agent is None:
        api_key = settings.GEMINI_API_KEY_5 or ""
        _quiz_agent = QuizAgent(api_key=api_key if api_key else None)
    return _quiz_agent

class QuizGenerateRequest(BaseModel):
    universe_name: str
    difficulty: str = "medium"
    user_context: Optional[str] = None

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctIndex: int
    explanation: str

class QuizGenerateResponse(BaseModel):
    questions: List[QuizQuestion]
    universe_name: str

@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(request: QuizGenerateRequest):
    """
    Generate a set of trivia questions for a universe.
    """
    agent = get_quiz_agent()
    questions = await agent.generate_quiz(
        universe_name=request.universe_name,
        difficulty=request.difficulty,
        user_context=request.user_context
    )
    
    return {
        "questions": questions,
        "universe_name": request.universe_name
    }
