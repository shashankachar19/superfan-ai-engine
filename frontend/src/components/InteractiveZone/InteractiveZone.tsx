import { useState, useEffect, useRef } from 'react';
import CharacterShowcase from '../CharacterShowcase/CharacterShowcase';
import PersonalizedStory from '../PersonalizedStory/PersonalizedStory';
import { useUniverse } from '../../context/UniverseContext';
import { ApiClient } from '../../api/client';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function InteractiveBackground3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;
    meshRef.current.position.y = Math.sin(t * 1.5) * 0.15;
  });

  return (
    <mesh ref={meshRef} scale={2.5}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={2.5}
        distort={0.4}
        speed={2}
        wireframe={true}
        transparent={true}
        opacity={0.15}
      />
    </mesh>
  );
}

gsap.registerPlugin(ScrollTrigger);

type InteractiveMode = "create" | "play" | "discover";

export default function InteractiveZone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<InteractiveMode>("create");
  const [showStoryModal, setShowStoryModal] = useState(false);

  const [discoverQuery, setDiscoverQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState("");
  const [resultSources, setResultSources] = useState<any[]>([]);
  const { selectedUniverse } = useUniverse();
  useEffect(() => {
    // Clear results when switching tabs
    setResultText("");
    setResultSources([]);
  }, [mode]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-up",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [mode, resultText]); // Re-run animation when mode or result changes

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    gsap.to(card, {
      rotateX: -yPct * 5,
      rotateY: xPct * 5,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
      zIndex: 10
    });
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)",
      zIndex: 1
    });
  };


  const handleAskOracle = async () => {
    if (!discoverQuery.trim()) return;
    setIsLoading(true);
    setResultText("");
    setResultSources([]);
    try {
      const res = await ApiClient.askFanAssistant(discoverQuery);
      setResultText(res.answer);
      setResultSources(res.sources || []);
    } catch (e) {
      setResultText("The Oracle is currently unresponsive.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full pb-24">
      {/* Header */}
      <div className="mb-12 animate-up flex justify-between items-start">
        <div>
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] mb-4 font-display">03 / Interactive Zone</p>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            Engage
          </h1>
          <p className="text-textMuted text-sm max-w-xl">
            Generate new canon, roleplay with characters, or explore the multiverse lore.
          </p>
        </div>
        <div className="w-32 h-32 hidden md:block opacity-0">
          {/* Header 3D removed to focus on massive card backgrounds */}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex border-b border-accentBorder mb-12 animate-up">
        {(["create", "play", "discover"] as InteractiveMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`font-display text-xs uppercase tracking-[0.15em] px-6 py-4 border-b-2 transition-colors duration-200 ${
              mode === m 
                ? "border-white text-white" 
                : "border-transparent text-textMuted hover:text-white"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Content */}
      {mode === "create" && (
        <div 
          onMouseMove={handleTiltMove}
          onMouseLeave={handleTiltLeave}
          className="border border-accentBorder p-12 min-h-[60vh] flex flex-col items-center justify-center text-center animate-up relative z-1 overflow-hidden"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[2, 2, 2]} intensity={1} />
              <InteractiveBackground3D />
              <Environment preset="city" />
            </Canvas>
          </div>
          <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] mb-8 font-display">Personalized Story Engine</p>
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            Write Your Canon
          </h2>
          <p className="text-textMuted text-sm max-w-xl mb-12">
            Launch the advanced neural storytelling engine to weave yourself into the {selectedUniverse.name} universe.
          </p>
          
          <button 
            onClick={() => setShowStoryModal(true)}
            className="font-display text-sm uppercase tracking-widest bg-textMain text-bgBase px-12 py-6 hover:bg-transparent hover:text-textMain border border-textMain transition-all duration-300"
          >
            [ LAUNCH NARRATIVE ENGINE ]
          </button>
          </div>
        </div>
      )}
      
      {showStoryModal && <PersonalizedStory onClose={() => setShowStoryModal(false)} />}
      
      {mode === "play" && (
        <div className="border border-accentBorder">
          <CharacterShowcase />
        </div>
      )}

      {mode === "discover" && (
        <div 
          onMouseMove={handleTiltMove}
          onMouseLeave={handleTiltLeave}
          className="border border-accentBorder p-12 min-h-[60vh] flex flex-col items-center justify-center text-center animate-up relative z-1 overflow-hidden"
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[2, 2, 2]} intensity={1} />
              <InteractiveBackground3D />
              <Environment preset="city" />
            </Canvas>
          </div>
          <div className="relative z-10 flex flex-col items-center w-full">
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] mb-8 font-display">Lore Database</p>
          <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            Ask The Oracle
          </h2>
          <p className="text-textMuted text-sm max-w-xl mb-12">
            Query the AI Fan Assistant about any lore, timeline, or character detail across all universes.
          </p>
          
          <div className="w-full max-w-2xl flex border border-accentBorder">
            <input 
              type="text"
              value={discoverQuery}
              onChange={(e) => setDiscoverQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskOracle()}
              placeholder="what is the time line of spider man no way home ?"
              className="flex-1 bg-transparent px-6 py-4 text-white placeholder:text-textMuted focus:outline-none font-body text-sm"
            />
            <button 
              onClick={handleAskOracle}
              disabled={isLoading}
              className="btn-nothin border-l border-accentBorder border-t-0 border-r-0 border-b-0"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {resultText && (
            <div className="mt-12 w-full max-w-4xl text-left border border-accentBorder p-8 bg-bgSubtle animate-up">
              <p className="font-display text-xs tracking-widest uppercase text-textMuted mb-4 border-b border-accentBorder pb-2">Oracle Response</p>
              <div className="font-body text-lg leading-relaxed text-textMain mb-6 whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-4">{resultText}</div>
              
              {resultSources.length > 0 && (
                <div className="border-t border-accentBorder pt-4">
                  <p className="font-display text-xs tracking-widest uppercase text-textMuted mb-2">Sources Referenced</p>
                  <ul className="flex flex-wrap gap-2">
                    {resultSources.map((src, i) => (
                      <li key={i} className="text-xs font-body px-2 py-1 bg-bgBase border border-accentBorder text-textMuted">{src.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
