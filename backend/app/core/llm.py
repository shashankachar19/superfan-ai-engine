import os
import random
import logging
from typing import List, Dict, Any, Optional
from litellm import acompletion

from app.core.config import settings

logger = logging.getLogger(__name__)

def get_random_gemini_key() -> Optional[str]:
    """Pulls a random valid Gemini key from the environment pool to balance load."""
    keys = []
    # Collect all available keys
    for k in [settings.GEMINI_API_KEY, settings.GEMINI_API_KEY_1, settings.GEMINI_API_KEY_2, 
              settings.GEMINI_API_KEY_3, settings.GEMINI_API_KEY_4, settings.GEMINI_API_KEY_5,
              settings.GEMINI_API_KEY_6, settings.GEMINI_API_KEY_7, settings.GEMINI_API_KEY_8]:
        if k and k.strip():
            keys.append(k.strip())
            
    # Also check direct os.environ in case they are set there
    for i in range(1, 9):
        k = os.environ.get(f"GEMINI_API_KEY_{i}")
        if k and k.strip() and k.strip() not in keys:
            keys.append(k.strip())
            
    if os.environ.get("GEMINI_API_KEY") and os.environ.get("GEMINI_API_KEY") not in keys:
         keys.append(os.environ.get("GEMINI_API_KEY").strip())

    return random.choice(keys) if keys else None


class LLMService:
    @staticmethod
    async def generate_response(
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> str:
        """
        Unified method to generate LLM responses using LiteLLM.
        `messages` should be in standard OpenAI format: 
        [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
        """
        max_retries = 3
        last_error = None
        
        for attempt in range(max_retries):
            # If the model is Gemini, dynamically inject a random API key to load balance
            if "gemini" in model.lower():
                random_key = get_random_gemini_key()
                if random_key:
                    kwargs["api_key"] = random_key
                    if attempt == 0:
                        logger.info(f"LLMService: Routing Gemini request via Key Pool (using key ending in ...{random_key[-4:] if len(random_key)>4 else ''})")
                    else:
                        logger.warning(f"LLMService: Retrying with different key (ending in ...{random_key[-4:] if len(random_key)>4 else ''})")

            try:
                response = await acompletion(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs
                )
                if response and response.choices and len(response.choices) > 0:
                    return response.choices[0].message.content
                return ""
            except Exception as e:
                last_error = e
                # Only retry for 503 or 429
                if "503" in str(e) or "429" in str(e) or "ServiceUnavailable" in str(e):
                    logger.warning(f"LLM Generation attempt {attempt + 1} failed for model {model} (Rate Limit / 503). Retrying...")
                    continue
                else:
                    logger.error(f"LLM Generation failed for model {model}: {e}")
                    raise e
                    
        logger.error(f"LLM Generation failed after {max_retries} attempts. Last error: {last_error}")
        raise last_error
