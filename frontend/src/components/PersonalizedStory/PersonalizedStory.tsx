import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useUniverse } from "../../context/UniverseContext";
import { ApiClient } from "../../api/client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

function StoryBackground3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.position.y = Math.sin(t) * 0.5;
  });
  return (
    <mesh ref={meshRef} scale={4}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.1}
        clearcoat={1}
        envMapIntensity={2.5}
        wireframe={true}
        transparent={true}
        opacity={0.3}
      />
    </mesh>
  );
}

interface PersonalizedStoryProps {
  onClose: () => void;
  userName?: string;
}

export default function PersonalizedStory({ onClose, userName = "" }: PersonalizedStoryProps) {
  const { selectedUniverse } = useUniverse();
  const [name, setName] = useState(userName);
  const [role, setRole] = useState("");
  const [scenario, setScenario] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [displayedStory, setDisplayedStory] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Typewriter effect
  useEffect(() => {
    if (story) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedStory(story.substring(0, i));
        i += 3;
        if (i > story.length) {
          clearInterval(interval);
          setDisplayedStory(story);
        }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [story]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isGenerating) return;

    setIsGenerating(true);
    setStory(null);
    setDisplayedStory("");

    try {
      const response = await ApiClient.generatePersonalizedStory(
        selectedUniverse.name,
        name.trim(),
        role.trim() || "a new recruit",
        scenario.trim()
      );
      setStory(response.story);
    } catch (error) {
      setStory("An error occurred while weaving your story. The narrative threads were tangled. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    gsap.to(card, {
      rotateX: -yPct * 2,
      rotateY: xPct * 2,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000
    });
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)"
    });
  };

  const rolePresets = [
    "A new recruit",
    "A legendary warrior",
    "A cunning spy",
    "The chosen one",
    "A rival turned ally",
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bgBase/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Massive 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <StoryBackground3D />
          <Environment preset="city" />
        </Canvas>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl max-h-[85vh] border border-accentBorder bg-bgBase flex flex-col overflow-hidden relative z-10"
        onClick={e => e.stopPropagation()}
        onMouseMove={handleTiltMove}
        onMouseLeave={handleTiltLeave}
      >
        <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-accentBorder p-6 flex justify-between items-center">
          <div>
            <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-1">
              Personalized Narrative Engine
            </div>
            <h3 className="font-display text-xl uppercase tracking-tight text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
              YOUR STORY — {selectedUniverse.name}
            </h3>
          </div>
          <button className="font-display text-xs uppercase tracking-widest text-textMuted hover:text-textMain transition-colors" onClick={onClose}>
            [ Close ]
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {!story && !isGenerating ? (
            <form onSubmit={handleGenerate} className="space-y-8">
              <div>
                <label className="font-display text-xs uppercase tracking-widest text-textMuted block mb-3">
                  Your Name (The Protagonist)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-transparent border-b border-accentBorder p-3 text-lg text-textMain focus:outline-none focus:border-textMain font-body"
                  required
                />
              </div>

              <div>
                <label className="font-display text-xs uppercase tracking-widest text-textMuted block mb-3">
                  Your Role
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {rolePresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRole(preset)}
                      className={`font-display text-xs uppercase tracking-widest px-4 py-2 border transition-all ${
                        role === preset
                          ? "border-textMain bg-textMain text-bgBase"
                          : "border-accentBorder text-textMuted hover:border-textMain hover:text-textMain"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Or type a custom role..."
                  className="w-full bg-transparent border-b border-accentBorder p-3 text-sm text-textMain focus:outline-none focus:border-textMain font-body"
                />
              </div>

              <div>
                <label className="font-display text-xs uppercase tracking-widest text-textMuted block mb-3">
                  Scenario (Optional)
                </label>
                <textarea
                  value={scenario}
                  onChange={e => setScenario(e.target.value)}
                  placeholder="Describe a scenario... e.g. 'I discover a hidden power during a battle'"
                  className="w-full bg-transparent border border-accentBorder p-3 text-sm text-textMain focus:outline-none focus:border-textMain font-body h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full font-display text-sm uppercase tracking-widest bg-textMain text-bgBase py-4 hover:opacity-80 transition-opacity disabled:opacity-30"
              >
                Generate My Story
              </button>
            </form>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
              <div className="w-8 h-8 border-2 border-textMain border-t-transparent rounded-full animate-spin" />
              <p className="font-display text-xs uppercase tracking-widest text-textMuted animate-pulse">
                Weaving your narrative into {selectedUniverse.name}...
              </p>
            </div>
          ) : (
            <div>
              <div className="font-display text-xl uppercase tracking-tighter mb-6 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
                Chapter I — {name}'s Adventure
              </div>
              <div className="font-body text-lg leading-relaxed text-textMain space-y-4">
                {displayedStory.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <button
                onClick={() => { setStory(null); setDisplayedStory(""); }}
                className="mt-8 font-display text-xs uppercase tracking-widest text-textMuted hover:text-textMain transition-colors"
              >
                [ Generate Another ]
              </button>
            </div>
          )}
        </div>
        </div>
      </motion.div>
    </div>
  );
}
