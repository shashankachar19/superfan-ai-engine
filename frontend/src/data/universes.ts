import React from 'react';
import { Skull, Zap, Swords, Shield, Wand2, Music } from 'lucide-react';

export interface Universe {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  accent: string;
  accentSecondary: string;
  accentGlow: string;
  episodes?: string;
  icon: React.ElementType;
  characters: string[];
  gradient: string;
}

export const universes: Universe[] = [
  {
    id: "one-piece",
    name: "One Piece",
    category: "Anime",
    tagline: "Enter the Grand Line",
    description:
      "Set sail with the Straw Hat Pirates across the Grand Line in search of the legendary treasure.",
    accent: "#0EA5E9",
    accentSecondary: "#06B6D4",
    accentGlow: "rgba(14, 165, 233, 0.3)",
    episodes: "1120+",
    icon: Skull,
    characters: ["luffy", "zoro", "nami", "sanji"],
    gradient:
      "linear-gradient(135deg, #0c1a2e 0%, #0a2540 50%, #0c1a2e 100%)",
  },
  {
    id: "naruto",
    name: "Naruto",
    category: "Anime",
    tagline: "Believe It!",
    description:
      "Follow Naruto Uzumaki on his journey to become the greatest Hokage the Hidden Leaf has ever seen.",
    accent: "#F97316",
    accentSecondary: "#EF4444",
    accentGlow: "rgba(249, 115, 22, 0.3)",
    episodes: "720+",
    icon: Zap,
    characters: ["naruto", "sasuke", "sakura", "kakashi"],
    gradient:
      "linear-gradient(135deg, #1a0c00 0%, #2a1400 50%, #1a0c00 100%)",
  },
  {
    id: "demon-slayer",
    name: "Demon Slayer",
    category: "Anime",
    tagline: "Slay the Night",
    description:
      "Join Tanjiro and the Demon Slayer Corps in their battle against the forces of darkness.",
    accent: "#A855F7",
    accentSecondary: "#EC4899",
    accentGlow: "rgba(168, 85, 247, 0.3)",
    episodes: "44+",
    icon: Swords,
    characters: ["tanjiro", "nezuko", "zenitsu", "inosuke"],
    gradient:
      "linear-gradient(135deg, #0f0020 0%, #1a0035 50%, #0f0020 100%)",
  },
  {
    id: "my-dress-up-darling",
    name: "My Dress-Up Darling",
    category: "Anime",
    tagline: "Cosplay Dreams",
    description:
      "Follow Wakana Gojo and Marin Kitagawa as they dive into the beautiful and creative world of cosplay.",
    accent: "#F472B6",
    accentSecondary: "#E879F9",
    accentGlow: "rgba(244, 114, 182, 0.3)",
    episodes: "12+",
    icon: Swords,
    characters: ["marin", "gojo", "sajuna", "shinju"],
    gradient:
      "linear-gradient(135deg, #2a0a1a 0%, #3a0d26 50%, #2a0a1a 100%)",
  },
  {
    id: "marvel",
    name: "Marvel",
    category: "Movies",
    tagline: "Avengers Assemble",
    description:
      "Enter the Marvel Cinematic Universe where heroes and villains clash across dimensions.",
    accent: "#EF4444",
    accentSecondary: "#3B82F6",
    accentGlow: "rgba(239, 68, 68, 0.3)",
    icon: Shield,
    characters: ["spiderman", "ironman", "thor", "blackwidow"],
    gradient:
      "linear-gradient(135deg, #1a0000 0%, #220000 50%, #1a0000 100%)",
  },
  {
    id: "harry-potter",
    name: "Harry Potter",
    category: "Series",
    tagline: "Platform 9 3/4",
    description:
      "Step through the magical barrier and into Hogwarts, where magic is real and adventure awaits.",
    accent: "#F59E0B",
    accentSecondary: "#8B5CF6",
    accentGlow: "rgba(245, 158, 11, 0.3)",
    icon: Wand2,
    characters: ["harry", "hermione", "ron", "dumbledore"],
    gradient:
      "linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0d0d1a 100%)",
  },
  {
    id: "music",
    name: "Music",
    category: "Music",
    tagline: "Feel the Rhythm",
    description:
      "Discover artists, albums and tracks across every genre with AI-powered music intelligence.",
    accent: "#06B6D4",
    accentSecondary: "#8B5CF6",
    accentGlow: "rgba(6, 182, 212, 0.3)",
    icon: Music,
    characters: [],
    gradient:
      "linear-gradient(135deg, #00101a 0%, #001a2a 50%, #00101a 100%)",
  },
];

export const getUniverseById = (id: string): Universe | undefined =>
  universes.find((u) => u.id === id);
