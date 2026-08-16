import { useState, useEffect } from "react";
import { ApiClient } from "../../api/client";
import type { Universe } from "../../data/universes";
import type { Character } from "../../data/characters";
import { useRef } from "react";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function ProfileTiny3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.position.y = Math.sin(t * 2) * 0.1;
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={2.5}
      />
    </mesh>
  );
}

interface ProfileCreationProps {
  user: any;
  onComplete: (updatedUser: any) => void;
}

export default function ProfileCreation({ user, onComplete }: ProfileCreationProps) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState(user.username || "");
  const [selectedUniverses, setSelectedUniverses] = useState<string[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [customUniverse, setCustomUniverse] = useState("");
  
  // Phase 1: Fan Memory Initialization
  const [tropes, setTropes] = useState("");
  const [engagement, setEngagement] = useState("");
  
  const [allUniverses, setAllUniverses] = useState<Universe[]>([]);
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load universes on mount
  useEffect(() => {
    ApiClient.getUniverses().then(data => {
      setAllUniverses(data);
    });
  }, []);

  const handleTiltMove = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    gsap.to(card, {
      rotateX: -yPct * 10,
      rotateY: xPct * 10,
      scale: 1.05,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
      zIndex: 10
    });
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)",
      zIndex: 1
    });
  };

  // Load characters based on selected universes
  useEffect(() => {
    if (step === 3 && selectedUniverses.length > 0) {
      setIsGenerating(true);
      Promise.all(selectedUniverses.map(uId => ApiClient.getCharactersByUniverse(uId)))
        .then(async results => {
          let chars = results.flat();
          
          // If no characters found (likely a custom universe), generate them!
          if (chars.length === 0) {
            // Find the custom universes (those not in allUniverses)
            const customUniverses = selectedUniverses.filter(
              su => !allUniverses.some(au => au.id === su)
            );
            
            if (customUniverses.length > 0) {
              // Generate for the first custom universe
              const generated = await ApiClient.generateCharacters(customUniverses[0]);
              if (generated && generated.length > 0) {
                chars = generated;
              }
            }
          }
          
          setAvailableCharacters(chars);
          setIsGenerating(false);
        })
        .catch(() => setIsGenerating(false));
    }
  }, [step, selectedUniverses, allUniverses]);

  const toggleUniverse = (id: string) => {
    setSelectedUniverses(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const toggleCharacter = (id: string) => {
    setSelectedCharacters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleProceedStep2 = () => {
    const finalUniverses = [...selectedUniverses];
    if (customUniverse.trim() !== "" && !finalUniverses.includes(customUniverse.trim())) {
      finalUniverses.push(customUniverse.trim());
      setSelectedUniverses(finalUniverses);
    }
    setStep(3);
  };

  const handleProceedStep3 = () => {
    setStep(4);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const updated = await ApiClient.updateProfile(user._id || "mock_user_1", {
        username,
        favorite_universes: selectedUniverses,
        favorite_characters: selectedCharacters,
        preferences: {
          tropes,
          engagement
        }
      });
      onComplete(updated);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-bgBase flex flex-col pt-24 pb-12 px-6 overflow-y-auto relative">
      {/* Floating 3D Background Object */}
      <div className="absolute top-20 right-20 w-64 h-64 opacity-50 pointer-events-none hidden md:block">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <ProfileTiny3D />
          <Environment preset="city" />
        </Canvas>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col h-full relative z-10">
        
        {/* Header / Progress */}
        <div className="flex items-center justify-between mb-16 border-b border-borderBase pb-4">
          <div className="font-display font-black text-2xl tracking-tighter uppercase">
            SUPERFAN <span className="text-textMuted ml-2 font-normal text-sm tracking-[0.2em]">PROTOCOL</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-1 w-12 rounded-full transition-colors duration-500 ${step >= i ? 'bg-primary' : 'bg-surfaceBg'}`}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
                Establish Identity
              </h1>
              <p className="text-textMuted text-lg mb-12">
                Welcome to the network. What should we call you?
              </p>
              
              <div className="space-y-4">
                <label className="text-sm font-bold tracking-[0.1em] text-textMuted uppercase">Callsign / Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-2 border-white/20 px-6 py-4 rounded-xl text-xl font-display font-bold text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
                  placeholder="Enter your alias"
                  autoFocus
                />
              </div>

              <div className="mt-16 flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                  disabled={username.trim().length < 2}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.1em] uppercase rounded-full transition-transform disabled:opacity-50"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
                Select Universes
              </h1>
              <p className="text-textMuted text-lg mb-12">
                Choose the fandoms you want to track. You can always add more later.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allUniverses.map(uni => (
                  <button
                    key={uni.id}
                    onClick={() => toggleUniverse(uni.id)}
                    onMouseMove={handleTiltMove}
                    onMouseLeave={handleTiltLeave}
                    className={`relative overflow-hidden text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                      selectedUniverses.includes(uni.id) 
                        ? 'border-primary bg-primary/10 scale-[1.02]' 
                        : 'border-borderBase hover:border-textMuted bg-surfaceBg'
                    }`}
                  >
                    <div className="font-display text-2xl font-black tracking-tight mb-1">{uni.name}</div>
                    <div className="text-sm text-textMuted">{uni.description.substring(0, 50)}...</div>
                    
                    {/* Selected Indicator */}
                    {selectedUniverses.includes(uni.id) && (
                      <div className="absolute top-6 right-6 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.8)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 border-t border-white/10 pt-8">
                <label className="text-sm font-bold tracking-[0.1em] text-textMuted uppercase block mb-4">Don't see your fandom? Add it here:</label>
                <input 
                  type="text" 
                  value={customUniverse}
                  onChange={(e) => setCustomUniverse(e.target.value)}
                  className="w-full bg-transparent border-2 border-white/20 px-6 py-4 rounded-xl text-xl font-display font-bold text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
                  placeholder="e.g. Star Wars, Lord of the Rings..."
                />
              </div>

              <div className="mt-16 flex justify-between items-center">
                <button 
                  onClick={() => setStep(1)}
                  className="text-textMuted hover:text-white uppercase tracking-[0.1em] text-sm font-bold"
                >
                  Back
                </button>
                <button 
                  onClick={handleProceedStep2}
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                  disabled={selectedUniverses.length === 0 && customUniverse.trim().length === 0}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.1em] uppercase rounded-full transition-transform disabled:opacity-50"
                >
                  Proceed
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
                Select Characters
              </h1>
              <p className="text-textMuted text-lg mb-12">
                Choose your favorite characters from your selected universes to pin to your dashboard.
              </p>
              {isGenerating ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
                  <h3 className="font-display text-2xl font-black tracking-widest uppercase text-white mb-2">Scanning Multiverse...</h3>
                  <p className="text-textMuted">Using AI to generate characters for your custom fandom.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {availableCharacters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => toggleCharacter(char.id)}
                      onMouseMove={handleTiltMove}
                      onMouseLeave={handleTiltLeave}
                      className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-300 group ${
                        selectedCharacters.includes(char.id) 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-borderBase'
                      }`}
                    >
                      <div 
                        className="w-full h-full flex flex-col items-center justify-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundColor: `${char.color}20` }}
                      >
                        <span className="text-6xl mb-4">{char.emoji || '👤'}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                        <div className="font-display font-bold text-lg">{char.name}</div>
                      </div>
                      
                      {/* Selected Indicator */}
                      {selectedCharacters.includes(char.id) && (
                        <div className="absolute inset-0 border-4 border-primary rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-8 border-t border-white/10 pt-8">
                <label className="text-sm font-bold tracking-[0.1em] text-textMuted uppercase block mb-4">Don't see your favorite character? Add them here:</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    id="customCharacterInput"
                    className="flex-1 bg-transparent border-2 border-white/20 px-6 py-4 rounded-xl text-xl font-display font-bold text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/30"
                    placeholder="e.g. Darth Vader, Gandalf..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val && !selectedCharacters.includes(val)) {
                          setSelectedCharacters(prev => [...prev, val]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('customCharacterInput') as HTMLInputElement;
                      const val = input.value.trim();
                      if (val && !selectedCharacters.includes(val)) {
                        setSelectedCharacters(prev => [...prev, val]);
                        input.value = '';
                      }
                    }}
                    className="px-8 py-4 bg-primary text-white font-bold tracking-[0.1em] uppercase rounded-xl hover:bg-primary/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {/* Show manually added custom characters */}
                {selectedCharacters.filter(id => !availableCharacters.some(c => c.id === id)).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedCharacters.filter(id => !availableCharacters.some(c => c.id === id)).map(customId => (
                      <div key={customId} className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="font-bold">{customId}</span>
                        <button onClick={() => toggleCharacter(customId)} className="text-white/50 hover:text-white">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-16 flex justify-between items-center">
                <button 
                  onClick={() => setStep(2)}
                  className="text-textMuted hover:text-white uppercase tracking-[0.1em] text-sm font-bold"
                >
                  Back
                </button>
                <button 
                  onClick={handleProceedStep3}
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                  disabled={selectedCharacters.length === 0}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.1em] uppercase rounded-full transition-transform disabled:opacity-50"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
                Initialize Memory
              </h1>
              <p className="text-textMuted text-lg mb-12">
                Teach the AI about your specific tastes so it can generate better recommendations and personalized stories.
              </p>
              
              <div className="space-y-8 max-w-2xl">
                <div>
                  <label className="text-sm font-bold tracking-[0.1em] text-textMuted uppercase block mb-4">What are your favorite tropes or genres?</label>
                  <textarea 
                    value={tropes}
                    onChange={(e) => setTropes(e.target.value)}
                    className="w-full bg-transparent border-2 border-white/20 px-6 py-4 rounded-xl text-xl font-display text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/30 resize-none h-32"
                    placeholder="e.g. Enemies to lovers, Underdog tournaments, Time travel..."
                  />
                </div>

                <div>
                  <label className="text-sm font-bold tracking-[0.1em] text-textMuted uppercase block mb-4">How deep into the fandom are you?</label>
                  <textarea 
                    value={engagement}
                    onChange={(e) => setEngagement(e.target.value)}
                    className="w-full bg-transparent border-2 border-white/20 px-6 py-4 rounded-xl text-xl font-display text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/30 resize-none h-32"
                    placeholder="e.g. I've read all the books, watched season 2, but haven't seen the spin-offs..."
                  />
                </div>
              </div>

              <div className="mt-16 flex justify-between items-center pb-12">
                <button 
                  onClick={() => setStep(3)}
                  className="text-textMuted hover:text-white uppercase tracking-[0.1em] text-sm font-bold"
                >
                  Back
                </button>
                <button 
                  onClick={handleComplete}
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
                  disabled={isSaving}
                  className="px-8 py-4 bg-white text-black font-bold tracking-[0.1em] uppercase rounded-full transition-transform disabled:opacity-50"
                >
                  {isSaving ? "Initializing..." : "Complete Setup →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
