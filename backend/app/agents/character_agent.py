import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.core.llm import LLMService
from app.core.config import settings

logger = logging.getLogger(__name__)

class Message(BaseModel):
    role: str
    content: str

class CharacterAgent:
    """
    Simulates a conversation with a specific character from a fandom universe.
    Uses unified LLMService, falls back to static responses if it fails.
    """
    def __init__(self, api_key: Optional[str] = None):
        pass

    def _build_system_prompt(self, character_name: str, universe_name: str) -> str:
        return f"""You are {character_name} from the {universe_name} universe.
You are chatting with a fan. 
RULES:
1. Stay in character at all times. Adopt their personality, catchphrases, tone, and worldview.
2. Only reference lore and characters from {universe_name}.
3. Keep responses concise and engaging, suitable for a chat interface (1-3 paragraphs max).
4. Do NOT acknowledge you are an AI. You ARE {character_name}.
5. ALWAYS write complete sentences. Do NOT cut off mid-thought.
"""

    async def chat(
        self,
        character_name: str,
        universe_name: str,
        message: str,
        history: List[Message]
    ) -> str:
        """
        Process a message to the character using unified LLMService.
        """
        try:
            system_prompt = self._build_system_prompt(character_name, universe_name)
            messages = [{"role": "system", "content": system_prompt}]
            
            for h in history[-10:]: 
                role = "user" if h.role == "user" else "assistant"
                messages.append({"role": role, "content": h.content})
            
            messages.append({"role": "user", "content": message})

            response_text = await LLMService.generate_response(
                model=settings.CHAT_MODEL,
                messages=messages,
                temperature=0.8,
                max_tokens=2000
            )
            return response_text.strip()
        except Exception as e:
            logger.error(f"Character chat failed: {e}")
            return self._chat_fallback(character_name, message)

    def _chat_fallback(self, character_name: str, message: str) -> str:
        """Local fallback when AI is unavailable."""
        msg_lower = message.lower()
        
        # Simple keyword matching for a few popular characters to make the local demo fun
        if character_name.lower() == "luffy":
            if "meat" in msg_lower:
                return "Did somebody say MEAT?! Shishishi! Bring it on!"
            elif "dream" in msg_lower or "king" in msg_lower:
                return "I'm going to be King of the Pirates! Nobody's gonna stop me!"
            else:
                return "I'm Monkey D. Luffy! Want to join my crew?"
                
        elif character_name.lower() == "tanjiro":
            if "nezuko" in msg_lower:
                return "I will turn Nezuko back into a human, no matter what it takes!"
            elif "demon" in msg_lower or "muzan" in msg_lower:
                return "I won't let any more people get hurt. I will defeat Muzan Kibutsuji!"
            else:
                return "I have to keep training. My Water Breathing isn't strong enough yet!"
                
        elif character_name.lower() == "spiderman" or character_name.lower() == "spider-man":
            if "stark" in msg_lower or "iron" in msg_lower:
                return "Mr. Stark gave me this suit! It's got so many cool features."
            elif "responsibility" in msg_lower:
                return "Yeah... with great power comes great responsibility. Uncle Ben taught me that."
            else:
                return "Just your friendly neighborhood Spider-Man here! What's up?"
                
        elif character_name.lower() == "harry":
            if "voldemort" in msg_lower:
                return "We don't say his name... but we will defeat him."
            elif "hogwarts" in msg_lower:
                return "Hogwarts is my home. Gryffindor for life!"
            else:
                return "Expecto Patronum! Oh, hi there. Need help with some Defense Against the Dark Arts?"

        # Generic fallback
        return f"(As {character_name}) That's interesting! Tell me more about that from your perspective."
