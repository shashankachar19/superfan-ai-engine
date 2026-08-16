import logging
import json
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class ModerationAgent:
    """
    Evaluates user-submitted posts for toxicity, spoilers, and inappropriate content.
    Uses Gemini API if available, falls back to local rules if not.
    """
    def __init__(self, api_key: Optional[str] = None):
        self._gemini_available = False
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self._gemini_available = True
                logger.info("ModerationAgent: Gemini API initialized.")
            except Exception as e:
                logger.warning(f"ModerationAgent: Gemini init failed: {e}")

    def _build_system_prompt(self, universe_name: str) -> str:
        return f"""You are the automated community moderator for the {universe_name} fandom.
Your job is to evaluate a user-submitted fan post.
RULES:
1. Reject posts that contain hate speech, extreme toxicity, or harassment.
2. Reject posts that contain major spoilers without a spoiler warning.
3. Accept posts that are friendly, creative fan theories, or general discussions.
4. Output your response STRICTLY as a JSON object, with no markdown formatting or extra text.

Format the object as:
{{
  "accepted": true/false,
  "reason": "Brief explanation of why it was accepted or rejected (e.g., 'Contains toxic language', 'Great theory!')"
}}
"""

    async def moderate_post(self, universe_name: str, content: str) -> Dict[str, Any]:
        """
        Moderate a community post.
        """
        if self._gemini_available:
            return await self._moderate_gemini(universe_name, content)
        else:
            return self._moderate_fallback(universe_name, content)

    async def _moderate_gemini(self, universe_name: str, content: str) -> Dict[str, Any]:
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel("gemini-2.0-flash")
            
            prompt = self._build_system_prompt(universe_name)
            full_prompt = f"{prompt}\n\nPOST CONTENT TO EVALUATE:\n{content}"
            
            response = model.generate_content(full_prompt)
            
            # Clean up potential markdown formatting from the response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
                
            result = json.loads(response_text.strip())
            return result
        except Exception as e:
            logger.error(f"Moderation failed: {e}")
            return self._moderate_fallback(universe_name, content)

    def _moderate_fallback(self, universe_name: str, content: str) -> Dict[str, Any]:
        """Local fallback when Gemini is unavailable."""
        content_lower = content.lower()
        
        # Simple local rules for the Dev Fallback Mode
        bad_words = ["hate", "stupid", "idiot", "kill", "ugly"]
        spoiler_words = ["dies", "death", "spoiler", "ending"]
        
        if any(word in content_lower for word in bad_words):
            return {
                "accepted": False,
                "reason": "Your post was rejected because it contains toxic or inappropriate language. Let's keep the fandom positive!"
            }
            
        if any(word in content_lower for word in spoiler_words) and "warning" not in content_lower:
            return {
                "accepted": False,
                "reason": "Your post was rejected because it appears to contain untagged spoilers."
            }
            
        return {
            "accepted": True,
            "reason": "Post accepted! Thank you for contributing to the community."
        }
