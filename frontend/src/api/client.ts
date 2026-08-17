import { universes } from "../data/universes";
import { getUniverseById } from "../data/universes";
import { getCharactersByUniverse } from "../data/characters";

const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper for timeout
const fetchWithTimeout = async (resource: string, options: RequestInit & { timeout?: number } = {}) => {
  const { timeout = 2000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);

  return response;
};

// Mock knowledge base for fallback RAG responses
const MOCK_KNOWLEDGE: Record<string, Record<string, string>> = {
  "one-piece": {
    "marineford": "The Marineford War (Paramount War) was a massive conflict between the Whitebeard Pirates and the Marines. It was triggered by the capture and execution sentence of Portgas D. Ace. The war resulted in the deaths of both Whitebeard and Ace, profoundly impacting Luffy and reshaping the pirate world's power balance.",
    "luffy": "Monkey D. Luffy is the captain of the Straw Hat Pirates. He ate the Gomu Gomu no Mi (revealed to be the Hito Hito no Mi, Model: Nika). His dream is to become King of the Pirates by finding One Piece on Laugh Tale. He is now recognized as one of the Four Emperors.",
    "zoro": "Roronoa Zoro is the first mate and swordsman of the Straw Hat Pirates. He uses Three Sword Style (Santoryu) and dreams of becoming the World's Greatest Swordsman by defeating Dracule Mihawk. His current swords include Wado Ichimonji, Enma, and Sandai Kitetsu.",
    "crew": "The Straw Hat Pirates consist of ten members: Luffy (Captain), Zoro (Swordsman), Nami (Navigator), Usopp (Sniper), Sanji (Cook), Chopper (Doctor), Robin (Archaeologist), Franky (Shipwright), Brook (Musician), and Jinbe (Helmsman). They sail on the Thousand Sunny.",
    "default": "One Piece follows Monkey D. Luffy and his Straw Hat Pirates as they journey across the Grand Line in search of the legendary treasure One Piece. The series features epic battles, deep world-building, and themes of friendship and adventure.",
  },
  "naruto": {
    "naruto": "Naruto Uzumaki is a shinobi of Konoha's Uzumaki clan who became the jinchuriki of the Nine-Tails (Kurama) at birth. Through determination and his ninja way, he became the Seventh Hokage. His signature techniques include the Rasengan and Shadow Clone Technique.",
    "chunin": "The Chunin Exams arc introduced many key characters including Rock Lee, Gaara, and Neji. It featured three stages: a written test, survival in the Forest of Death, and tournament battles. It culminated in Orochimaru's invasion of Konoha and the death of the Third Hokage.",
    "default": "Naruto follows Naruto Uzumaki on his journey from outcast to Hokage. The series explores themes of perseverance, bonds, and the cycle of hatred in the shinobi world.",
  },
  "demon-slayer": {
    "tanjiro": "Tanjiro Kamado is a Demon Slayer who uses Water Breathing and later Sun Breathing (Hinokami Kagura). After his family was killed by Muzan Kibutsuji and his sister Nezuko was turned into a demon, he joined the Demon Slayer Corps to find a cure and avenge his family.",
    "hashira": "The Hashira are the nine strongest swordsmen in the Demon Slayer Corps. Notable members include Giyu Tomioka (Water), Kyojuro Rengoku (Flame), Shinobu Kocho (Insect), and Tengen Uzui (Sound). Rengoku's death deeply impacted Tanjiro.",
    "default": "Demon Slayer follows Tanjiro Kamado as he fights demons and searches for a cure for his sister Nezuko. The series features spectacular breathing techniques and emotional storytelling.",
  },
  "marvel": {
    "spiderman": "Spider-Man (Peter Parker) gained powers from a radioactive spider bite, including wall-crawling, enhanced strength, and spider-sense. Mentored by Tony Stark, he became an Avenger guided by the principle: 'With great power comes great responsibility.'",
    "default": "The Marvel Cinematic Universe features interconnected stories of heroes like Iron Man, Captain America, Thor, and Spider-Man. The Avengers have saved the world from threats including Thanos and his Infinity Stones.",
  },
  "harry-potter": {
    "harry": "Harry Potter is a half-blood wizard known as 'The Boy Who Lived' for surviving Voldemort's Killing Curse. Sorted into Gryffindor at Hogwarts, he fought Voldemort alongside Ron Weasley and Hermione Granger. He is the master of the Elder Wand.",
    "hogwarts": "Hogwarts School of Witchcraft and Wizardry was founded by Gryffindor, Hufflepuff, Ravenclaw, and Slytherin. Located in Scotland, it features moving staircases, the Room of Requirement, and was led by Headmaster Albus Dumbledore during Harry's time.",
    "default": "Harry Potter follows a young wizard's journey through Hogwarts and his battle against the dark wizard Lord Voldemort. The series explores themes of love, sacrifice, and the choice between right and easy.",
  },
};

function mockRagSearch(query: string, universe?: string): { answer: string; sources: Array<{ title: string; universe: string }> } {
  const queryLower = query.toLowerCase();
  const searchUniverse = universe || "";
  
  // Search in specific universe first, then globally
  const universesToSearch = searchUniverse 
    ? [searchUniverse] 
    : Object.keys(MOCK_KNOWLEDGE);
  
  for (const uId of universesToSearch) {
    const kb = MOCK_KNOWLEDGE[uId];
    if (!kb) continue;
    
    for (const [key, value] of Object.entries(kb)) {
      if (key === "default") continue;
      if (queryLower.includes(key)) {
        return {
          answer: value,
          sources: [{ title: `${key.charAt(0).toUpperCase() + key.slice(1)} Knowledge`, universe: uId }],
        };
      }
    }
  }
  
  // Fallback to universe default or generic
  if (searchUniverse && MOCK_KNOWLEDGE[searchUniverse]) {
    return {
      answer: MOCK_KNOWLEDGE[searchUniverse]["default"],
      sources: [{ title: `${searchUniverse} Overview`, universe: searchUniverse }],
    };
  }
  
  return {
    answer: "Great question! I'm your Fan Assistant and I'd love to help. Try asking about specific characters like Luffy, Naruto, Tanjiro, Spider-Man, or Harry Potter. You can also ask about story arcs like the Marineford War or the Chunin Exams!",
    sources: [],
  };
}


export class ApiClient {
  private static _isBackendAvailable: boolean | null = null;
  private static getStoredUser() {
    try {
      const stored = localStorage.getItem("superfan_mock_user");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to read from localStorage", e);
    }
    return {
      _id: "mock_user_1",
      username: "DemoUser",
      email: "demo@example.com",
      fan_level: "SUPERFAN",
      xp: 1250,
      favorite_universes: [],
      favorite_characters: [],
      created_at: "2024-01-01T00:00:00Z"
    };
  }

  private static mockUser = ApiClient.getStoredUser();

  private static saveStoredUser(user: any, token?: string) {
    try {
      localStorage.setItem("superfan_mock_user", JSON.stringify(user));
      if (token) {
        localStorage.setItem("superfan_token", token);
      }
    } catch (e) {
      console.warn("Failed to save to localStorage", e);
    }
  }

  private static getAuthToken() {
    return localStorage.getItem("superfan_token") || "mock_token";
  }

  static async checkBackend(): Promise<boolean> {
    if (this._isBackendAvailable !== null) return this._isBackendAvailable;
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, { timeout: 1000 });
      this._isBackendAvailable = res.ok;
      return res.ok;
    } catch {
      console.warn("Backend not reachable. Using Dev Fallback Mode.");
      this._isBackendAvailable = false;
      return false;
    }
  }

  // --- UNIVERSES ---
  static async getUniverses() {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try { 
        const res = await fetch(`${API_BASE_URL}/universes/`); 
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) return data;
        }
      } catch (e) { console.error(e); }
    }
    return universes;
  }

  static async getUniverseById(id: string) {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try { const res = await fetch(`${API_BASE_URL}/universes/${id}`); if (res.ok) return await res.json(); } catch (e) { console.error(e); }
    }
    return getUniverseById(id);
  }

  // --- CHARACTERS ---
  static async generateCharacters(universeName: string) {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/generate/characters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universe_name: universeName })
        });
        if (res.ok) {
          const data = await res.json();
          return data.characters;
        }
      } catch (e) {
        console.error("Failed to generate characters:", e);
      }
    }
    return [];
  }

  static async getCharactersByUniverse(universeId: string) {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try { 
        const res = await fetch(`${API_BASE_URL}/universes/${universeId}/characters`); 
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) return data;
        }
      } catch (e) { console.error(e); }
    }
    return getCharactersByUniverse(universeId);
  }

  // --- AUTH ---
  static async login(email: string, password: string) {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
        if (res.ok) {
          const data = await res.json();
          this.saveStoredUser(data.user, data.access_token);
          return data;
        }
        throw new Error("Invalid credentials");
      } catch (e) {
        console.warn("Login API failed, falling back to mock data:", e);
      }
    }
    return new Promise((resolve) => setTimeout(() => resolve({ access_token: "mock_token_123", token_type: "bearer", user: this.mockUser }), 500));
  }

  static async register(username: string, email: string, password: string) {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, email, password }) });
        if (res.ok) {
          // Auto-login to save token in localStorage and return full session payload
          return await this.login(email, password);
        }
        throw new Error("Registration failed");
      } catch (e) {
        console.warn("Registration API failed, falling back to mock data:", e);
      }
    }
    // New user mock defaults to empty favorites so onboarding is triggered
    const newUser = { ...this.mockUser, username, email, favorite_universes: [], favorite_characters: [], _id: "mock_" + Math.random().toString(36).substr(2, 9) };
    this.mockUser = newUser;
    this.saveStoredUser(this.mockUser);
    return new Promise((resolve) => setTimeout(() => resolve(newUser), 500));
  }

  static async updateProfile(userId: string, data: any) {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/profile`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn("Update Profile API failed, falling back to mock data:", e);
      }
    }
    this.mockUser = { ...this.mockUser, ...data };
    this.saveStoredUser(this.mockUser);
    return new Promise((resolve) => setTimeout(() => resolve(this.mockUser), 500));
  }


  // --- FAN ASSISTANT (RAG) ---
  static async askFanAssistant(query: string, universe?: string): Promise<{ answer: string; sources: Array<{ title: string; universe: string }> }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, universe })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error("Fan Assistant API failed:", e);
      }
    }
    
    // Fallback: use mock RAG search
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRagSearch(query, universe)), 800);
    });
  }

  // --- CHARACTER AI ---
  static async chatWithCharacter(characterName: string, universeName: string, message: string, history: Array<{role: string, content: string}>): Promise<{ response: string; character_name: string }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/characters/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ character_name: characterName, universe_name: universeName, message, history })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error("Character Chat API failed:", e);
      }
    }
    
    // Fallback Mock Logic
    return new Promise((resolve) => {
      setTimeout(() => {
        let fallbackResponse = `(As ${characterName}) That's interesting! I don't have much to say right now because the backend AI is offline, but I am definitely ${characterName} from ${universeName}!`;

        resolve({ response: fallbackResponse, character_name: characterName });
      }, 800);
    });
  }

  static async getChatHistory(characterId: string): Promise<any[]> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const token = this.getAuthToken();
        const res = await fetch(`${API_BASE_URL}/characters/history/${characterId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          return data.history || [];
        }
      } catch (e) {
        console.error("Failed to get chat history:", e);
      }
    }
    // Fallback to local storage (partitioned by character ID now)
    try {
      const stored = localStorage.getItem(`superfan_chat_${characterId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }

  static async saveChatHistory(characterId: string, messages: any[]): Promise<boolean> {
    const isAvailable = await this.checkBackend();
    
    // Always save to partitioned local storage as backup
    localStorage.setItem(`superfan_chat_${characterId}`, JSON.stringify(messages));

    if (isAvailable) {
      try {
        const token = this.getAuthToken();
        const res = await fetch(`${API_BASE_URL}/characters/history/${characterId}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ messages })
        });
        return res.ok;
      } catch (e) {
        console.error("Failed to save chat history:", e);
      }
    }
    return true;
  }

  // --- CONTENT GENERATION ---
  static async generateContent(universeName: string, prompt: string, type: string = "story"): Promise<{ content: string; universe_name: string; image_url?: string }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/content/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universe_name: universeName, prompt, content_type: type })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error("Content Generation API failed:", e);
      }
    }
    
    // Fallback Mock Logic
    return new Promise((resolve) => {
      setTimeout(() => {
        let fallbackResponse = `This is a generated ${type.replace('_', ' ')} set in the ${universeName} universe.\n\nThe prompt was: '${prompt}'.\n\n(Note: The AI generator is currently offline. This is a fallback response. When the AI is active, it will generate a dynamic, high-quality response tailored to your exact prompt.)`;
        
        let image_url = undefined;
        if (type === "wallpaper_description" || type === "poster_tagline") {
           const sanitized_prompt = `${universeName} ${prompt}`.replace(/ /g, "%20");
           image_url = `https://image.pollinations.ai/prompt/${sanitized_prompt}?width=1024&height=1024&nologo=true`;
        }

        resolve({ content: fallbackResponse, universe_name: universeName, image_url });
      }, 1500); // Simulate slightly longer generation time
    });
  }

  // --- QUIZ GENERATION ---
  static async generateQuiz(universeName: string, difficulty: string = "medium", userContext: string = ""): Promise<{ questions: any[]; universe_name: string }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/quiz/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universe_name: universeName, difficulty, user_context: userContext })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error("Quiz Generation API failed:", e);
      }
    }
    
    // Fallback Mock Logic
    return new Promise((resolve) => {
      setTimeout(() => {
        let mockQuestions = [
          {
            question: `Who is the main protagonist of ${universeName}?`,
            options: ["The Hero", "The Villain", "The Sidekick", "The Mentor"],
            correctIndex: 0,
            explanation: "Every story needs a hero."
          },
          {
            question: "What is the ultimate goal in this universe?",
            options: ["Wealth", "Peace", "Power", "Adventure"],
            correctIndex: 1,
            explanation: "Most fictional universes revolve around a quest for peace."
          },
          {
            question: `Which of these factions exists in ${universeName}?`,
            options: ["The Resistance", "The Empire", "The Guild", "All of the above"],
            correctIndex: 3,
            explanation: "Universes are full of competing factions."
          }
        ];

        resolve({ questions: mockQuestions, universe_name: universeName });
      }, 1000);
    });
  }

  // --- COMMUNITY MODERATION ---
  static async submitPost(universeName: string, content: string): Promise<{ accepted: boolean; reason: string; post?: any }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/community/post`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universe_name: universeName, content })
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error("Community API failed:", e);
      }
    }
    
    // Fallback Mock Logic
    return new Promise((resolve) => {
      setTimeout(() => {
        const contentLower = content.toLowerCase();
        const badWords = ["hate", "stupid", "idiot", "kill", "ugly"];
        const spoilerWords = ["dies", "death", "spoiler", "ending"];
        
        if (badWords.some(word => contentLower.includes(word))) {
          resolve({
            accepted: false,
            reason: "Your post was rejected because it contains toxic or inappropriate language. Let's keep the fandom positive!"
          });
          return;
        }
        
        if (spoilerWords.some(word => contentLower.includes(word)) && !contentLower.includes("warning")) {
          resolve({
            accepted: false,
            reason: "Your post was rejected because it appears to contain untagged spoilers."
          });
          return;
        }
        
        resolve({
          accepted: true,
          reason: "Post accepted! Thank you for contributing to the community.",
          post: {
            universe_name: universeName,
            content: content,
            author: "Anonymous Fan",
            timestamp: new Date().toISOString()
          }
        });
      }, 500);
    });
  }

  // --- FAN MEMORY ---
  static async saveMemory(userId: string, preferenceType: string, value: string, universe?: string): Promise<any> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/memory/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, preference_type: preferenceType, value, universe })
        });
        if (res.ok) return await res.json();
      } catch (e) { console.error("Memory save failed:", e); }
    }
    return { _id: "mock_" + Date.now(), user_id: userId, type: preferenceType, value, universe };
  }

  static async getMemories(userId: string): Promise<{ user_id: string; preferences: any[] }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/memory/${userId}`);
        if (res.ok) return await res.json();
      } catch (e) { console.error("Memory fetch failed:", e); }
    }
    return {
      user_id: userId,
      preferences: [
        { _id: "m1", type: "system_log", value: "Memory database initialized.", universe: "System" },
        { _id: "m2", type: "system_log", value: "Awaiting new interactions...", universe: "System" }
      ]
    };
  }

  static async getJourneySummary(userId: string): Promise<{ summary: string }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/memory/${userId}/summary`);
        if (res.ok) return await res.json();
      } catch (e) { console.error("Journey summary failed:", e); }
    }
    return { summary: "You've explored multiple universes, chatted with legendary characters, and aced several quizzes. Your fandom journey is impressive — keep discovering!" };
  }

  // --- PERSONALIZED STORY ---
  static async generatePersonalizedStory(universeName: string, userName: string, role: string = "a new recruit", scenario: string = ""): Promise<{ story: string; universe_name: string; user_name: string }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/story/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universe_name: universeName, user_name: userName, role, scenario })
        });
        if (res.ok) return await res.json();
      } catch (e) { console.error("Personalized story failed:", e); }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          story: `The portal shimmered before ${userName}, its surface rippling like liquid starlight. They had dreamed of this moment — of stepping into the ${universeName} universe — and now it was real.\n\nAs ${role}, they carried the weight of an impossible mission. But as they stepped through, the world that greeted them was more vivid, more alive, than anything they'd imagined.\n\n"Welcome," said a voice from the shadows. "We've been expecting you, ${userName}."\n\nThe adventure had only just begun...`,
          universe_name: universeName,
          user_name: userName,
        });
      }, 1500);
    });
  }

  // --- RECOMMENDATION ENGINE ---
  static async getRecommendations(universeName: string, preferences?: string): Promise<{ universe_name: string; recommendations: any }> {
    const isAvailable = await this.checkBackend();
    if (isAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/recommendations/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universe_name: universeName, preferences })
        });
        if (res.ok) return await res.json();
      } catch (e) { console.error("Recommendations failed:", e); }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          universe_name: universeName,
          recommendations: {
            movies: [
              { title: `Top ${universeName} Film`, description: "The most acclaimed film in the franchise.", reason: "A must-watch for any fan." },
              { title: `${universeName} Origins`, description: "The origin story that started it all.", reason: "Understanding the beginning deepens appreciation." },
              { title: `${universeName} — Final Chapter`, description: "The epic conclusion.", reason: "See how it all ends." },
            ],
            episodes: [
              { title: "The Pilot Episode", description: "Where the journey begins.", reason: "Essential context." },
              { title: "The Big Reveal", description: "The episode that changed everything.", reason: "Defines the series." },
              { title: "The Season Finale", description: "Climactic ending of the best season.", reason: "Peak storytelling." },
            ],
            merchandise: [
              { title: "Official Art Book", description: "Behind-the-scenes artwork.", reason: "See the creative process." },
              { title: "Collector's Figure", description: "Premium collectible.", reason: "Centerpiece for any collection." },
              { title: "Soundtrack Album", description: "The complete musical score.", reason: "Relive the emotions." },
            ],
            fan_content: [
              { title: "Theory Videos", description: "Community theories.", reason: "Join the discussion." },
              { title: "Fan Art Compilations", description: "Best community artwork.", reason: "New perspectives on favorites." },
              { title: "Reaction Videos", description: "Watch others experience key moments.", reason: "Relive the magic." },
            ],
          }
        });
      }, 1000);
    });
  }
}
