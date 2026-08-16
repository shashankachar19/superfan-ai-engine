export interface Character {
  id: string;
  name: string;
  role: string;
  universe: string;
  greeting: string;
  responses: { [key: string]: string };
  defaultResponse: string;
  color: string;
  emoji: string;
  level: string;
}

export const characters: Character[] = [
  {
    id: "marin",
    name: "Marin Kitagawa",
    role: "Cosplay Enthusiast",
    universe: "my-dress-up-darling",
    greeting: "Wakana! Look at this new fabric! Isn't it super cute?!",
    responses: {
      "cosplay": "Cosplay is the ultimate expression of love! You get to become the character you adore!",
      "gojo": "Gojo-kun is amazing! His sewing skills are seriously next level.",
      "anime": "I was just watching this magical girl anime and the costumes were *so* good."
    },
    defaultResponse: "That sounds so fun! Let's make it our next cosplay project!",
    color: "#F472B6",
    emoji: "[M]",
    level: "SUPERFAN",
  },
  {
    id: "gojo",
    name: "Wakana Gojo",
    role: "Hina Doll Craftsman",
    universe: "my-dress-up-darling",
    greeting: "Hello. I was just working on painting the face of a Hina doll...",
    responses: {
      "dolls": "Hina dolls are truly beautiful. My grandfather taught me everything I know.",
      "marin": "Kitagawa-san is so bright and energetic... I still can't believe I'm making clothes for her.",
      "sewing": "The most important part is getting the measurements right and choosing the proper fabric."
    },
    defaultResponse: "I'll do my best to make sure the details are perfect.",
    color: "#8B5CF6",
    emoji: "[G]",
    level: "ELITE",
  },
  {
    id: "luffy",
    name: "Monkey D. Luffy",
    role: "Captain of the Straw Hats",
    universe: "one-piece",
    greeting:
      "Shishishi! I am Monkey D. Luffy, and I WILL be King of the Pirates!",
    responses: {
      "grand line":
        "Shishishi! The Grand Line is the most dangerous sea in the world — but that just makes it more fun! Let's go!",
      "one piece":
        "The One Piece IS real! And I'm gonna find it no matter what!",
      nakama: "My crew is everything to me. I'd never let my nakama down!",
      fight: "You wanna fight? Gear Fifth — I'm ready!",
      food: "MEAT! I want meat! Sanji, make me some meat!",
    },
    defaultResponse:
      "That sounds like an adventure! Let's go find it together — Shishishi!",
    color: "#0EA5E9",
    emoji: "[L]",
    level: "SUPERFAN",
  },
  {
    id: "zoro",
    name: "Roronoa Zoro",
    role: "First Mate / Swordsman",
    universe: "one-piece",
    greeting: "...Don't get in my way.",
    responses: {
      sword:
        "Three swords. One goal. I will surpass Mihawk — nothing else matters.",
      lost:
        "I'm not lost. This is just... a detour. A strategic detour.",
      train: "Nothing I can't cut. I'll train until that's literally true.",
      sleep: "...zzz",
    },
    defaultResponse:
      "Hmph. If you need help, I'll consider it. Don't slow me down.",
    color: "#10B981",
    emoji: "[Z]",
    level: "ELITE",
  },
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    role: "Seventh Hokage",
    universe: "naruto",
    greeting:
      "Hey! I'm Naruto Uzumaki, and I never go back on my word — that's my ninja way! Believe it!",
    responses: {
      hokage:
        "Believe it! I'm gonna be Hokage one day — no, I AM Hokage! The Seventh!",
      ramen:
        "Ichiraku ramen is the BEST food in the world! Old man Teuchi makes the greatest bowls!",
      "nine tails":
        "Kurama and I... we understand each other now. We're partners.",
      sasuke: "Sasuke is my rival and my best friend. I'll never abandon him!",
    },
    defaultResponse:
      "Believe it! Whatever it is, I'll give it everything I've got — that's my ninja way!",
    color: "#F97316",
    emoji: "[N]",
    level: "SUPERFAN",
  },
  {
    id: "tanjiro",
    name: "Tanjiro Kamado",
    role: "Demon Slayer / Water Breathing",
    universe: "demon-slayer",
    greeting:
      "I can smell your kindness... Hello, I'm Tanjiro Kamado. I'm here to protect you.",
    responses: {
      demon:
        "Every demon was once human. I'll end your suffering with compassion — but I will not hesitate.",
      nezuko:
        "Nezuko is my sister. I will find a way to turn her human again — I swear it on my blade.",
      breathing:
        "Total Concentration Breathing — Hinokami Kagura! I'll show you!",
      hashira:
        "The Flame Hashira... Rengoku-san taught me what it means to be a true demon slayer.",
    },
    defaultResponse:
      "I'll face whatever challenge comes with all my strength and a kind heart. That's a promise.",
    color: "#A855F7",
    emoji: "[T]",
    level: "ELITE",
  },
  {
    id: "spiderman",
    name: "Spider-Man",
    role: "Friendly Neighborhood Hero",
    universe: "marvel",
    greeting:
      "Hey there! Your friendly neighborhood Spider-Man, swinging in to save the day — hopefully.",
    responses: {
      web: "With great power comes great responsibility — and great web-slinging. Thwip!",
      "iron man": "Mr. Stark is... was my mentor. I'll make him proud.",
      villain:
        "Every villain thinks they're the hero of their own story. My job is to stop their story.",
      school:
        "Yeah, I still have homework due tomorrow. Being a hero doesn't give you extensions.",
    },
    defaultResponse:
      "Whatever it is, I'll figure it out! I've saved New York like... at least twelve times. Probably.",
    color: "#EF4444",
    emoji: "[S]",
    level: "SUPERFAN",
  },
  {
    id: "harry",
    name: "Harry Potter",
    role: "The Boy Who Lived",
    universe: "harry-potter",
    greeting:
      "Brilliant to meet you. I'm Harry Potter — yes, that Harry Potter. The scar's real, I'm afraid.",
    responses: {
      hogwarts:
        "Hogwarts will always be home to me. There's nowhere quite like it in the world.",
      voldemort:
        "I'm not afraid to say his name — Voldemort. Fear of a name only increases fear of the thing itself.",
      spell:
        "Expelliarmus! It's saved my life more times than I can count. Never underestimate a disarming charm.",
      hermione:
        "Hermione is the brightest witch of her age. Ron and I wouldn't have survived without her.",
    },
    defaultResponse:
      "Brilliant! Whatever the challenge, we'll face it together. That's what we do.",
    color: "#F59E0B",
    emoji: "[H]",
    level: "ELITE",
  },
];

export const getCharacterById = (id: string): Character | undefined =>
  characters.find((c) => c.id === id);

export const getCharactersByUniverse = (universeId: string): Character[] =>
  characters.filter((c) => c.universe === universeId);
