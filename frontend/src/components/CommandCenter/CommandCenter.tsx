import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Film, Tv, ShoppingBag, Palette } from 'lucide-react';
import PersonalizedStory from '../PersonalizedStory/PersonalizedStory';
import { ApiClient } from '../../api/client';
import { useUniverse } from '../../context/UniverseContext';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function CommandTiny3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.y = t * 0.6;
    meshRef.current.position.y = Math.sin(t * 1.5) * 0.1;
  });

  return (
    <mesh ref={meshRef} scale={1}>
      <torusGeometry args={[0.8, 0.3, 16, 32]} />
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

function ActionIcon3D({ type }: { type: 'story' | 'quiz' | 'merch' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.5;
    meshRef.current.rotation.y = t * 0.7;
    // float effect
    meshRef.current.position.y = Math.sin(t * 2 + (type === 'story' ? 0 : type === 'quiz' ? 1 : 2)) * 0.15;
  });

  const getGeometry = () => {
    switch(type) {
      case 'story': return <boxGeometry args={[1, 1, 1]} />;
      case 'quiz': return <octahedronGeometry args={[0.8, 0]} />;
      case 'merch': return <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />;
    }
  };

  return (
    <mesh ref={meshRef} scale={1.2}>
      {getGeometry()}
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

gsap.registerPlugin(ScrollTrigger);

interface CommandCenterProps {
  user: any;
  onNavigate?: (zone: "command" | "interactive" | "creation" | "arena") => void;
}

export default function CommandCenter({ user, onNavigate }: CommandCenterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedUniverse } = useUniverse();
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const trendingFics = [
    { id: 1, title: "Shadows of the Past", author: "FanWriter99", likes: "12k" },
    { id: 2, title: "Alternate Timeline X", author: "LoreMaster", likes: "8.4k" },
    { id: 3, title: "The Hidden Artifact", author: "SciFiNerd", likes: "15k" },
  ];

  useEffect(() => {
    if (selectedUniverse) {
      setIsLoadingRecs(true);
      const preferences = user?.preferences ? `${user.preferences.tropes} ${user.preferences.engagement}` : "";
      ApiClient.getRecommendations(selectedUniverse.name, preferences)
        .then(res => setRecommendations(res.recommendations))
        .catch(console.error)
        .finally(() => setIsLoadingRecs(false));
    }
  }, [selectedUniverse, user]);

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
  }, [recommendations]); // Re-run animation when recs load

  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const inner = btn.querySelector('.magnetic-inner');
    if (!inner) return;
    
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.1;
    
    gsap.to(inner, {
      x,
      y,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const inner = e.currentTarget.querySelector('.magnetic-inner');
    if (inner) {
      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.3)"
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full pb-24">
      {/* Header */}
      <div className="mb-20 animate-up flex justify-between items-start">
        <div>
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] mb-4 font-display">01 / Command Center</p>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            Welcome back,<br />{user?.username || "Agent"}
          </h1>
        </div>
        <div className="w-24 h-24 hidden md:block">
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ pointerEvents: 'none' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <CommandTiny3D />
            <Environment preset="city" />
          </Canvas>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-accentBorder mb-20 animate-up">
        {[
          { label: "Continue Story", desc: "Resume your personalized narrative.", zone: "interactive", type: "story" as const },
          { label: "Daily Quiz", desc: "Test your lore in The Arena.", zone: "arena", type: "quiz" as const },
          { label: "New Merch", desc: "View newly discovered artifacts.", zone: "creation", type: "merch" as const },
        ].map((action) => (
          <button 
            key={action.label} 
            className="bg-bgBase p-8 text-left hover:bg-white hover:text-black transition-colors duration-200 group relative overflow-hidden"
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            onClick={() => {
              if (action.label === "Continue Story") {
                setShowStoryModal(true);
              } else if (onNavigate) {
                onNavigate(action.zone as any);
              }
            }}
          >
            <div className="relative z-10 magnetic-inner">
              <h3 className="font-display font-bold text-sm uppercase tracking-[0.15em] mb-2">{action.label}</h3>
              <p className="text-textMuted text-xs group-hover:text-black/60 transition-colors">{action.desc}</p>
            </div>
            
            {/* 3D Icon that appears on hover or floats in background */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-20 h-20 opacity-30 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">
              <Canvas camera={{ position: [0, 0, 3], fov: 50 }} style={{ pointerEvents: 'none' }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                <ActionIcon3D type={action.type} />
                <Environment preset="city" />
              </Canvas>
            </div>
          </button>
        ))}
      </div>
      
      {showStoryModal && <PersonalizedStory onClose={() => setShowStoryModal(false)} userName={user?.username} />}

      {/* AI Recommendations */}
      <section className="mb-20 animate-up">
        <div className="flex items-end justify-between mb-8 border-b border-accentBorder pb-4">
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] font-display">Recommended For You ({selectedUniverse?.name})</p>
        </div>
        
        {isLoadingRecs ? (
          <div className="flex justify-center p-12 border border-accentBorder bg-bgBase">
            <div className="w-6 h-6 border-2 border-accentBorder border-t-white rounded-full animate-spin"></div>
          </div>
        ) : recommendations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-accentBorder">
            {recommendations.movies?.slice(0,1).map((item: any, i: number) => (
              <div 
                key={`m-${i}`} 
                className="bg-bgBase p-6 group hover:bg-white hover:text-black transition-colors duration-200"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                <div className="magnetic-inner h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-textMuted group-hover:text-black/50 border border-accentBorder group-hover:border-black/20 px-2 py-1 flex items-center gap-2"><Film className="w-3 h-3" /> Movie</span>
                    </div>
                    <h4 className="font-display font-bold text-base uppercase tracking-tight mb-2 leading-tight">{item.title}</h4>
                    <p className="text-xs text-textMuted group-hover:text-black/60">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {recommendations.episodes?.slice(0,1).map((item: any, i: number) => (
              <div 
                key={`e-${i}`} 
                className="bg-bgBase p-6 group hover:bg-white hover:text-black transition-colors duration-200"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                <div className="magnetic-inner h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-textMuted group-hover:text-black/50 border border-accentBorder group-hover:border-black/20 px-2 py-1 flex items-center gap-2"><Tv className="w-3 h-3" /> Episode</span>
                    </div>
                    <h4 className="font-display font-bold text-base uppercase tracking-tight mb-2 leading-tight">{item.title}</h4>
                    <p className="text-xs text-textMuted group-hover:text-black/60">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {recommendations.merchandise?.slice(0,1).map((item: any, i: number) => (
              <div 
                key={`s-${i}`} 
                className="bg-bgBase p-6 group hover:bg-white hover:text-black transition-colors duration-200"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                <div className="magnetic-inner h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-textMuted group-hover:text-black/50 border border-accentBorder group-hover:border-black/20 px-2 py-1 flex items-center gap-2"><ShoppingBag className="w-3 h-3" /> Merch</span>
                    </div>
                    <h4 className="font-display font-bold text-base uppercase tracking-tight mb-2 leading-tight">{item.title}</h4>
                    <p className="text-xs text-textMuted group-hover:text-black/60">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {recommendations.fan_content?.slice(0,1).map((item: any, i: number) => (
              <div 
                key={`f-${i}`} 
                className="bg-bgBase p-6 group hover:bg-white hover:text-black transition-colors duration-200"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                <div className="magnetic-inner h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-textMuted group-hover:text-black/50 border border-accentBorder group-hover:border-black/20 px-2 py-1 flex items-center gap-2"><Palette className="w-3 h-3" /> Fan Art</span>
                    </div>
                    <h4 className="font-display font-bold text-base uppercase tracking-tight mb-2 leading-tight">{item.title}</h4>
                    <p className="text-xs text-textMuted group-hover:text-black/60">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Trending Fan Fiction */}
      <section className="animate-up">
        <div className="flex items-end justify-between mb-8 border-b border-accentBorder pb-4">
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] font-display">Trending Fan Fiction</p>
          <button className="text-xs font-display uppercase tracking-[0.15em] text-textMuted hover:text-white transition-colors flex items-center gap-1">
            Read More <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="space-y-0">
          {trendingFics.map((fic, idx) => (
            <div key={fic.id} className="flex items-center justify-between py-6 border-b border-accentBorder hover:bg-white hover:text-black hover:px-6 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-8">
                <span className="text-xs text-textMuted group-hover:text-black/40 font-display">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <h4 className="font-display font-bold text-sm uppercase tracking-wider">{fic.title}</h4>
                  <p className="text-xs text-textMuted group-hover:text-black/60 mt-1">By {fic.author}</p>
                </div>
              </div>
              <span className="text-xs text-textMuted group-hover:text-black/50">♥ {fic.likes}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
