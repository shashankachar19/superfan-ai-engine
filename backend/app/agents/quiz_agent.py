import logging
import json
import re
from typing import Optional, List, Dict, Any

from app.core.config import settings
from app.core.llm import LLMService

logger = logging.getLogger(__name__)

class QuizAgent:
    """
    Generates trivia questions based on a selected universe.
    Uses Gemini API if available, falls back to static questions if not.
    """
    def __init__(self, api_key: Optional[str] = None):
        self._gemini_available = True  # Handled by LLMService

    def _build_system_prompt(self, universe_name: str, difficulty: str, user_context: Optional[str] = None) -> str:
        context_block = ""
        if user_context:
            context_block = f"""\nUSER PROFILE DATA:
{user_context}
IMPORTANT: You MUST generate questions specifically tailored to this user's fandom. Reference their favorite characters, their preferred genres/tropes, and their depth of engagement. Do NOT generate generic questions like 'who is the main protagonist'. Generate questions that a dedicated fan of {universe_name} would find interesting and challenging based on their profile.\n"""
        
        return f"""You are an expert trivia generator for the {universe_name} fandom.
Generate EXACTLY 5 unique multiple-choice trivia questions at '{difficulty}' difficulty.
{context_block}
STRICT OUTPUT RULES:
- Output ONLY a raw JSON array. NO markdown, NO backticks, NO extra text.
- Each question must have: question (string), options (array of exactly 4 strings), correctIndex (integer 0-3), explanation (1 sentence string).
- Keep explanation SHORT (max 15 words).
- Keep options SHORT (max 8 words each).
- Questions must be specific, accurate, and interesting for {universe_name} fans.

Example format:
[{{"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 2, "explanation": "Brief reason."}}]"""

    async def generate_quiz(
        self,
        universe_name: str,
        difficulty: str = "medium",
        user_context: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate a quiz based on universe and difficulty.
        """
        if self._gemini_available:
            return await self._generate_gemini(universe_name, difficulty, user_context)
        else:
            return self._generate_fallback(universe_name, difficulty)

    async def _generate_gemini(self, universe_name: str, difficulty: str, user_context: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            prompt = self._build_system_prompt(universe_name, difficulty, user_context)
            messages = [{"role": "user", "content": prompt}]
            
            response_text = await LLMService.generate_response(
                model=settings.CHAT_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=4096  # Increased to prevent truncation
            )
            
            response_text = response_text.strip()
            
            # Strip markdown code fences if present
            if "```" in response_text:
                response_text = re.sub(r'```(?:json)?', '', response_text).strip()
            
            # Find the JSON array by locating the first '[' and its matching ']'
            start = response_text.find('[')
            if start != -1:
                depth = 0
                end = -1
                for i, ch in enumerate(response_text[start:], start):
                    if ch == '[':
                        depth += 1
                    elif ch == ']':
                        depth -= 1
                        if depth == 0:
                            end = i + 1
                            break
                if end != -1:
                    json_str = response_text[start:end]
                    quiz_data = json.loads(json_str)
                    if isinstance(quiz_data, list) and len(quiz_data) > 0:
                        return quiz_data[:5]  # Return at most 5
            
            # Last resort: direct parse
            quiz_data = json.loads(response_text)
            return quiz_data[:5] if isinstance(quiz_data, list) else self._generate_fallback(universe_name, difficulty)
            
        except Exception as e:
            logger.error(f"Quiz generation failed: {e}", exc_info=True)
            return self._generate_fallback(universe_name, difficulty)

    def _generate_fallback(self, universe_name: str, difficulty: str) -> List[Dict[str, Any]]:
        """Local fallback when Gemini is unavailable."""
        
        if universe_name.lower() == "my dress-up darling":
            return [
                {
                    "question": "What is Wakana Gojo's traditional craft?",
                    "options": ["Pottery", "Hina Doll Making", "Calligraphy", "Woodworking"],
                    "correctIndex": 1,
                    "explanation": "Gojo is training to become a kashirashi, a craftsman who makes traditional Hina dolls."
                },
                {
                    "question": "What is Marin Kitagawa's hobby that brings her and Gojo together?",
                    "options": ["Cooking", "Dancing", "Cosplay", "Painting"],
                    "correctIndex": 2,
                    "explanation": "Marin's passion for cosplay leads her to ask Gojo for help making costumes."
                },
                {
                    "question": "What is the name of the anime series Marin is obsessed with?",
                    "options": ["Flower Princess Blaze", "Holy Slippery Shiny Girls", "Magical Girl Rune", "Starlight Warriors"],
                    "correctIndex": 1,
                    "explanation": "Marin is a huge fan of the magical girl anime 'Holy Slippery Shiny Girls'."
                },
                {
                    "question": "What is Sajuna Inui's online cosplay alias?",
                    "options": ["Momo", "Luna", "Juju", "Riko"],
                    "correctIndex": 2,
                    "explanation": "Sajuna is known online as 'Juju' and is a famous cosplayer."
                },
                {
                    "question": "Who lives with Wakana Gojo?",
                    "options": ["His parents", "His older sister", "His grandfather", "He lives alone"],
                    "correctIndex": 2,
                    "explanation": "Gojo lives with his grandfather, who taught him the art of Hina doll making."
                }
            ]

        elif universe_name.lower() == "one piece":
            return [
                {
                    "question": "What is the name of Luffy's Devil Fruit according to the World Government?",
                    "options": ["Mera Mera no Mi", "Gomu Gomu no Mi", "Hito Hito no Mi", "Bara Bara no Mi"],
                    "correctIndex": 1,
                    "explanation": "It was publicly known as the Gomu Gomu no Mi to hide its true nature."
                },
                {
                    "question": "Who was the first member to join the Straw Hat Pirates?",
                    "options": ["Nami", "Usopp", "Zoro", "Sanji"],
                    "correctIndex": 2,
                    "explanation": "Roronoa Zoro was the first to join Luffy's crew."
                },
                {
                    "question": "What is the name of the Straw Hat Pirates' first ship?",
                    "options": ["Thousand Sunny", "Going Merry", "Oro Jackson", "Red Force"],
                    "correctIndex": 1,
                    "explanation": "The Going Merry was their beloved first ship, gifted by Kaya."
                },
                {
                    "question": "What is Sanji's dream?",
                    "options": ["To become Pirate King", "To find the All Blue", "To map the entire world", "To cure all diseases"],
                    "correctIndex": 1,
                    "explanation": "Sanji dreams of finding the All Blue, a legendary sea containing fish from all four seas."
                },
                {
                    "question": "Who is the shipwright of the Straw Hat Pirates?",
                    "options": ["Usopp", "Jinbe", "Franky", "Brook"],
                    "correctIndex": 2,
                    "explanation": "Franky is the shipwright who built the Thousand Sunny."
                }
            ]
            
        elif universe_name.lower() == "naruto":
            return [
                {
                    "question": "What is the name of the Nine-Tailed Fox sealed within Naruto?",
                    "options": ["Shukaku", "Kurama", "Matatabi", "Gyuki"],
                    "correctIndex": 1,
                    "explanation": "Kurama is the Nine-Tails."
                },
                {
                    "question": "Who was Naruto's first mentor?",
                    "options": ["Kakashi Hatake", "Jiraiya", "Iruka Umino", "Hiruzen Sarutobi"],
                    "correctIndex": 2,
                    "explanation": "Iruka was the first person to acknowledge and guide Naruto."
                },
                {
                    "question": "What jutsu is Naruto's signature move?",
                    "options": ["Chidori", "Rasengan", "Shadow Clone Jutsu", "Both Rasengan and Shadow Clone"],
                    "correctIndex": 3,
                    "explanation": "He is famous for heavily utilizing both the Rasengan and Shadow Clones."
                },
                {
                    "question": "What is the name of Naruto's son?",
                    "options": ["Boruto", "Kawaki", "Mitsuki", "Shikadai"],
                    "correctIndex": 0,
                    "explanation": "Boruto Uzumaki is Naruto's son and the protagonist of the sequel series."
                },
                {
                    "question": "Which eye technique does the Uchiha clan possess?",
                    "options": ["Byakugan", "Rinnegan", "Sharingan", "Tenseigan"],
                    "correctIndex": 2,
                    "explanation": "The Sharingan is the kekkei genkai of the Uchiha clan."
                }
            ]
            
        else:
            return [
                {
                    "question": f"What genre best describes {universe_name}?",
                    "options": ["Action", "Romance", "Comedy", "It depends on the arc"],
                    "correctIndex": 3,
                    "explanation": f"Most fictional universes blend multiple genres."
                },
                {
                    "question": f"Who is the main protagonist of {universe_name}?",
                    "options": ["The Hero", "The Villain", "The Sidekick", "The Mentor"],
                    "correctIndex": 0,
                    "explanation": "Every story needs a hero."
                },
                {
                    "question": "What is the ultimate goal in this universe?",
                    "options": ["Wealth", "Peace", "Power", "Adventure"],
                    "correctIndex": 1,
                    "explanation": "Most fictional universes revolve around a quest for peace."
                },
                {
                    "question": f"Which of these themes is central to {universe_name}?",
                    "options": ["Friendship", "Betrayal", "Discovery", "All of the above"],
                    "correctIndex": 3,
                    "explanation": "Rich storytelling often weaves multiple themes together."
                },
                {
                    "question": f"What makes {universe_name} unique among its genre?",
                    "options": ["Its world-building", "Its characters", "Its plot twists", "All of the above"],
                    "correctIndex": 3,
                    "explanation": "The best stories excel in all these areas."
                }
            ]

