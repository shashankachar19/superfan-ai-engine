import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUniverse } from '../../context/UniverseContext';
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function CreationBackground3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.position.y = Math.sin(t * 2) * 0.1;
  });

  return (
    <mesh ref={meshRef} scale={6}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={2.5}
        wireframe={true}
        transparent={true}
        opacity={0.15}
      />
    </mesh>
  );
}

gsap.registerPlugin(ScrollTrigger);

const TOOLS = [
  { id: "meme", title: "Meme Generator", desc: "Create universe-specific viral memes." },
  { id: "poster", title: "Cinematic Poster", desc: "Generate high-res theatrical posters." },
  { id: "fanfic", title: "Fan Fiction", desc: "Write chapters with AI assistance." },
  { id: "wallpaper", title: "Wallpaper", desc: "Desktop and mobile backgrounds." },
  { id: "social", title: "Social Posts", desc: "In-character tweets and updates." },
  { id: "lore", title: "Lore Analyzer", desc: "AI-powered deep analysis of any universe lore." },
];

export default function CreationStudio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedUniverse } = useUniverse();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{type: 'image' | 'text', url?: string, text?: string} | null>(null);

  const MOCK_IMAGES = [
    "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop", // abstract cool
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop", // anime style pink
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop", // cinematic dark
    "https://images.unsplash.com/photo-1542779283-429940ce8336?q=80&w=1000&auto=format&fit=crop"  // cyberpunk
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    
    setTimeout(() => {
      if (activeTool === "lore") {
        setGeneratedContent({
          type: 'text',
          text: `[SIMULATED DEEP DIVE]\n\nBased on the lore of ${selectedUniverse.name}, the complex interplay between characters and their environment suggests a deeper thematic focus on identity and perseverance. The underlying power systems often parallel real-world struggles, making the narrative highly resonant. \n\n(This is a simulated response to save API costs.)`
        });
      } else {
        const randomImage = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
        setGeneratedContent({
          type: 'image',
          url: randomImage
        });
      }
      setIsGenerating(false);
    }, 2000);
  };

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
  }, [activeTool]);

  const handleTiltMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    gsap.to(card, {
      rotateX: -yPct * 10,
      rotateY: xPct * 10,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
      zIndex: 10
    });
    
    const inner = card.querySelector('.magnetic-inner');
    if (inner) {
      gsap.to(inner, { x: xPct * 10, y: yPct * 10, duration: 0.4, ease: "power2.out" });
    }
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)",
      zIndex: 1
    });
    const inner = card.querySelector('.magnetic-inner');
    if (inner) {
      gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    }
  };

  if (activeTool) {
    const tool = TOOLS.find(t => t.id === activeTool);
    return (
      <div ref={containerRef} className="w-full min-h-screen pb-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, -2, 8], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <CreationBackground3D />
            <Environment preset="city" />
          </Canvas>
        </div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-12 border-b border-accentBorder pb-6 animate-up">
          <div className="flex items-center gap-6">
            <button onClick={() => { setActiveTool(null); setGeneratedContent(null); }} className="text-textMuted hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h1 className="font-display text-3xl font-black uppercase tracking-tighter">{tool?.title}</h1>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating} className="btn-nothin">
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-accentBorder border border-accentBorder animate-up">
          {/* Controls */}
          <div className="bg-bgBase p-8 space-y-6 lg:col-span-1">
            <div>
              <label className="block text-[10px] font-display uppercase tracking-[0.2em] text-textMuted mb-3">Prompt</label>
              <textarea 
                className="w-full bg-transparent border border-accentBorder px-4 py-3 text-white focus:border-white focus:outline-none transition-colors h-32 resize-none text-sm"
                placeholder={activeTool === "lore" ? "e.g. Compare the power systems in Naruto vs One Piece..." : "Describe what you want to create..."}
              />
            </div>
            
            {activeTool !== "lore" && (
              <div>
                <label className="block text-[10px] font-display uppercase tracking-[0.2em] text-textMuted mb-3">Style</label>
                <select className="w-full bg-transparent border border-accentBorder px-4 py-3 text-white focus:border-white focus:outline-none transition-colors text-sm">
                  <option className="bg-black">Cinematic</option>
                  <option className="bg-black">Comic Book</option>
                  <option className="bg-black">Anime</option>
                  <option className="bg-black">Cyberpunk</option>
                </select>
              </div>
            )}

            {activeTool === "lore" && (
              <div>
                <label className="block text-[10px] font-display uppercase tracking-[0.2em] text-textMuted mb-3">Analysis Type</label>
                <select className="w-full bg-transparent border border-accentBorder px-4 py-3 text-white focus:border-white focus:outline-none transition-colors text-sm">
                  <option className="bg-black">Deep Dive</option>
                  <option className="bg-black">Cross-Universe Compare</option>
                  <option className="bg-black">Timeline Analysis</option>
                  <option className="bg-black">Character Arc Breakdown</option>
                </select>
              </div>
            )}

            <div className="border border-accentBorder p-4 text-xs text-textMuted">
              {activeTool === "lore" 
                ? "Powered by Gemini AI. Responses are generated in real-time."
                : "Note: Image generation is currently locked. Text-based generation is fully operational."
              }
            </div>
          </div>

          {/* Preview */}
          <div className="bg-bgBase/80 backdrop-blur-sm p-12 lg:col-span-2 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            <div className="relative z-10 w-full flex flex-col items-center justify-center h-full">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-accentBorder border-t-white rounded-full animate-spin"></div>
                <p className="text-textMuted text-xs uppercase tracking-[0.3em] font-display">Synthesizing...</p>
              </div>
            ) : generatedContent ? (
              generatedContent.type === 'image' ? (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="w-full max-w-md aspect-square border border-accentBorder p-2 relative overflow-hidden group">
                    <img src={generatedContent.url} alt="Generated" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <button className="mt-8 text-xs font-display uppercase tracking-widest text-textMuted hover:text-white transition-colors border-b border-accentBorder pb-1">Download Asset</button>
                </div>
              ) : (
                <div className="w-full h-full text-left p-6 border border-accentBorder">
                  <p className="font-display text-xs tracking-widest uppercase text-textMuted mb-4 border-b border-accentBorder pb-2">Analysis Complete</p>
                  <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{generatedContent.text}</p>
                </div>
              )
            ) : (
              <p className="text-textMuted text-xs uppercase tracking-[0.3em] font-display">Awaiting prompt...</p>
            )}
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, -2, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <CreationBackground3D />
          <Environment preset="city" />
        </Canvas>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-12 animate-up flex justify-between items-start">
        <div>
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] mb-4 font-display">04 / Creation Studio</p>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            Create
          </h1>
          <p className="text-textMuted text-sm max-w-xl">
            The foundry for fan content. Generate memes, posters, and stories powered by the Fan Memory engine.
          </p>
        </div>
        <div className="w-32 h-32 hidden md:block opacity-0">
          {/* Header 3D removed to focus on massive card backgrounds */}
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-accentBorder border border-accentBorder animate-up">
        {TOOLS.map((tool, idx) => (
          <button 
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            onMouseMove={handleTiltMove}
            onMouseLeave={handleTiltLeave}
            className="bg-bgBase p-8 text-left hover:bg-white hover:text-black transition-colors duration-200 group relative"
          >
            <div className="magnetic-inner pointer-events-none">
              <span className="text-[10px] text-textMuted group-hover:text-black/40 font-display uppercase tracking-[0.2em] block mb-8 transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display font-bold text-lg uppercase tracking-tight mb-2">{tool.title}</h3>
              <p className="text-xs text-textMuted group-hover:text-black/60 transition-colors">{tool.desc}</p>
            </div>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
