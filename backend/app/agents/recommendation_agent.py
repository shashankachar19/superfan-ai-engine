"""
Recommendation Engine Agent for SuperFan AI.

Generates personalized recommendations for movies, episodes,
merchandise, and fan content based on the user's active universe.
"""
import logging
import json
from typing import Optional, Dict, Any, List

from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are SuperFan AI's Recommendation Engine for the {universe} universe.
Generate personalized recommendations for a fan.

Output STRICTLY as a JSON object with these categories:
{{
  "movies": [{{ "title": "...", "description": "...", "reason": "..." }}],
  "episodes": [{{ "title": "...", "description": "...", "reason": "..." }}],
  "merchandise": [{{ "title": "...", "description": "...", "reason": "..." }}],
  "fan_content": [{{ "title": "...", "description": "...", "reason": "..." }}]
}}

RULES:
1. Provide 3 items per category (12 total).
2. "reason" should explain WHY this fan would enjoy it based on their preferences.
3. For episodes, reference specific arc/episode names.
4. For merchandise, suggest real product types (figures, posters, apparel).
5. For fan_content, suggest types of fan works (AMVs, theories, fan art styles).
6. Be specific and knowledgeable about {universe}.
"""

# Static fallback data
FALLBACK_RECOMMENDATIONS: Dict[str, Dict[str, List[Dict[str, str]]]] = {
    "one piece": {
        "movies": [
            {"title": "One Piece Film: Red", "description": "Shanks' daughter Uta holds a concert that threatens to change the world.", "reason": "Essential viewing for understanding Shanks' backstory."},
            {"title": "One Piece Film: Z", "description": "The Straw Hats face former Admiral Zephyr in an emotional showdown.", "reason": "Features incredible fight choreography and deep Marine lore."},
            {"title": "One Piece Film: Strong World", "description": "Shiki the Golden Lion kidnaps Nami in this Oda-supervised adventure.", "reason": "Written by Oda himself — considered canon-adjacent."},
        ],
        "episodes": [
            {"title": "Episode 1015 — Straw Hat Luffy", "description": "Luffy's rooftop battle against Kaido reaches its peak.", "reason": "Widely regarded as one of the best-animated episodes in the series."},
            {"title": "Episode 312 — Thank You, Merry!", "description": "The Going Merry's final voyage — the most emotional moment in One Piece.", "reason": "If you haven't cried here, you're not a true fan."},
            {"title": "Episode 870 — Katakuri's Respect", "description": "The conclusion of Luffy vs Katakuri in Whole Cake Island.", "reason": "One of the best rivalries and fights in the entire series."},
        ],
        "merchandise": [
            {"title": "Portrait of Pirates Luffy Gear 5 Figure", "description": "Premium collectible figure of Luffy in his awakened Nika form.", "reason": "The most iconic transformation — a must-have for any display."},
            {"title": "Straw Hat Replica", "description": "Wearable replica of Luffy's signature straw hat.", "reason": "The ultimate One Piece cosplay accessory."},
            {"title": "One Piece Box Set Vol 1-23", "description": "Complete East Blue to Skypiea manga collection.", "reason": "The manga has details the anime misses — essential reading."},
        ],
        "fan_content": [
            {"title": "\"We Are!\" AMV Compilations", "description": "Fan-made anime music videos set to the original OP.", "reason": "Captures the spirit of adventure that defines One Piece."},
            {"title": "Void Century Theory Videos", "description": "Deep-dive fan theories about the lost history.", "reason": "The biggest mystery in One Piece — endlessly fascinating."},
            {"title": "Straw Hat Crew Fan Art Collections", "description": "Community art reimagining the crew in different styles.", "reason": "See your favorite characters through hundreds of creative lenses."},
        ],
    },
    "naruto": {
        "movies": [
            {"title": "The Last: Naruto the Movie", "description": "Canon film covering Naruto and Hinata's love story.", "reason": "Essential for understanding the NaruHina relationship."},
            {"title": "Road to Ninja", "description": "Naruto and Sakura enter an alternate reality.", "reason": "Fun 'what if' scenario with great emotional moments."},
            {"title": "Boruto: Naruto the Movie", "description": "Naruto as Hokage faces a new threat with his son.", "reason": "See how Naruto's story continues into the next generation."},
        ],
        "episodes": [
            {"title": "Episode 133 — Naruto vs Sasuke (Valley of the End)", "description": "The iconic first battle between best friends turned rivals.", "reason": "The emotional core of Part 1."},
            {"title": "Episode 477 — Naruto and Sasuke", "description": "The final battle — everything leads to this moment.", "reason": "The culmination of the entire series."},
            {"title": "Episode 329 — Two-Man Team", "description": "Naruto and Itachi fight together during the war.", "reason": "One of the most unexpected and satisfying team-ups."},
        ],
        "merchandise": [
            {"title": "Naruto Headband Set", "description": "Collection of village headbands (Leaf, Sand, Mist, etc).", "reason": "Perfect cosplay starter — represent your favorite village."},
            {"title": "Funko Pop Naruto (Six Path)", "description": "Collectible figure of Naruto in Six Paths Sage Mode.", "reason": "His most powerful and visually stunning form."},
            {"title": "Naruto Manga Box Set", "description": "Complete manga collection in a premium box.", "reason": "Kishimoto's art is incredible — worth owning physically."},
        ],
        "fan_content": [
            {"title": "Naruto vs Sasuke AMVs", "description": "Fan-edited compilations of their rivalry.", "reason": "The greatest rivalry in anime, beautifully compiled."},
            {"title": "Itachi Truth Reveal Analyses", "description": "Deep dives into the Uchiha Massacre reveal.", "reason": "One of the best plot twists in anime history."},
            {"title": "Akatsuki Fan Art", "description": "Community artwork of the iconic villain organization.", "reason": "The Akatsuki designs are endlessly inspiring."},
        ],
    },
}


class RecommendationAgent:
    """
    Generates personalized recommendations based on universe and user preferences.
    """
    def __init__(self, api_key: Optional[str] = None):
        pass

    async def get_recommendations(
        self,
        universe_name: str,
        preferences: Optional[str] = None,
    ) -> Dict[str, List[Dict[str, str]]]:
        """Get personalized recommendations for a universe using LLMService."""
        try:
            from app.core.llm import LLMService
            prompt = SYSTEM_PROMPT.format(universe=universe_name)
            if preferences:
                prompt += f"\n\nUser preferences: {preferences}"
                
            messages = [{"role": "system", "content": "You are a recommendation engine."}, {"role": "user", "content": prompt}]

            response_text = await LLMService.generate_response(
                model=settings.RECOMMENDATION_MODEL,
                messages=messages,
                temperature=0.7,
                max_tokens=800
            )

            # Clean markdown formatting
            text = response_text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]

            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return self._generate_fallback(universe_name)

    def _generate_fallback(self, universe_name: str) -> Dict[str, List[Dict[str, str]]]:
        """Return curated static recommendations."""
        key = universe_name.lower()
        if key in FALLBACK_RECOMMENDATIONS:
            return FALLBACK_RECOMMENDATIONS[key]

        # Generic fallback
        return {
            "movies": [
                {"title": f"Top {universe_name} Movie", "description": f"The most acclaimed film in the {universe_name} franchise.", "reason": "A must-watch for any fan."},
                {"title": f"{universe_name} Origins", "description": "The origin story that started it all.", "reason": "Understanding the beginning deepens your appreciation."},
                {"title": f"{universe_name} — The Final Chapter", "description": "The epic conclusion to the main storyline.", "reason": "See how it all ends."},
            ],
            "episodes": [
                {"title": "The Pilot Episode", "description": "Where the journey begins.", "reason": "Essential context for everything that follows."},
                {"title": "The Big Reveal", "description": "The episode that changed everything.", "reason": "The twist that defines the series."},
                {"title": "The Season Finale", "description": "The climactic ending of the best season.", "reason": "Peak storytelling."},
            ],
            "merchandise": [
                {"title": "Official Art Book", "description": "Behind-the-scenes artwork and commentary.", "reason": "See the creative process."},
                {"title": "Collector's Figure", "description": "Premium collectible of the main character.", "reason": "A centerpiece for any collection."},
                {"title": "Soundtrack Album", "description": "The complete musical score.", "reason": "Relive the emotions through music."},
            ],
            "fan_content": [
                {"title": "Theory Videos", "description": "Community theories about unresolved mysteries.", "reason": "Join the discussion."},
                {"title": "Fan Art Compilations", "description": "The best community artwork.", "reason": "See your favorites through new eyes."},
                {"title": "Reaction Videos", "description": "Watch others experience key moments.", "reason": "Relive the magic."},
            ],
        }
