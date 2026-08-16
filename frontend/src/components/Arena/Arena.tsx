import { useState, useRef, useEffect } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUniverse } from '../../context/UniverseContext';
import QuizGame from '../QuizGame/QuizGame';
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function ArenaTiny3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.8;
    meshRef.current.rotation.y = t * 0.6;
    meshRef.current.position.y = Math.sin(t * 3) * 0.15;
  });

  return (
    <mesh ref={meshRef} scale={1.2}>
      <dodecahedronGeometry args={[0.8, 0]} />
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

export default function Arena() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedUniverse } = useUniverse();
  const [quizActive, setQuizActive] = useState(false);
  const [quizMode, setQuizMode] = useState<"daily"|"deepdive">("daily");

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate-up",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 80%" } }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [quizActive]);

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

  return (
    <div ref={containerRef} className="w-full pb-24">
      {/* Header */}
      <div className="mb-12 animate-up flex justify-between items-start">
        <div>
          <p className="text-xs text-textMuted uppercase tracking-[0.3em] mb-4 font-display">05 / The Arena</p>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6 text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            Compete
          </h1>
          <p className="text-textMuted text-sm max-w-xl">
            Adaptive lore quizzes and challenges for {selectedUniverse.name}.
          </p>
        </div>
        <div className="w-32 h-32 hidden md:block">
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ pointerEvents: 'none' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <ArenaTiny3D />
            <Environment preset="city" />
          </Canvas>
        </div>
      </div>

      {/* Content */}
      <div className="border border-accentBorder p-12 min-h-[60vh] flex flex-col items-center justify-center text-center animate-up bg-bgSubtle">
        
        {!quizActive ? (
          <>
            <p className="text-xs text-textMuted uppercase tracking-[0.3em] mb-8 font-display">Quiz Engine</p>
            <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Adaptive Trivia
            </h2>
            <p className="text-textMuted text-sm max-w-xl mb-16">
              The Quiz Agent adapts difficulty in real-time based on your Fan Memory profile.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-accentBorder w-full max-w-3xl border border-accentBorder">
              <button 
                onClick={() => { setQuizMode("daily"); setQuizActive(true); }} 
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="bg-bgBase p-8 text-left hover:bg-white hover:text-black transition-colors duration-200 group relative"
              >
                <div className="magnetic-inner pointer-events-none">
                  <h3 className="font-display font-bold text-sm uppercase tracking-[0.15em] mb-2">Daily Challenge</h3>
                  <p className="text-xs text-textMuted group-hover:text-black/60 transition-colors">A quick 5-question sprint covering trending topics.</p>
                </div>
              </button>
              <button 
                onClick={() => { setQuizMode("deepdive"); setQuizActive(true); }} 
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="bg-bgBase p-8 text-left hover:bg-white hover:text-black transition-colors duration-200 group relative"
              >
                <div className="magnetic-inner pointer-events-none">
                  <h3 className="font-display font-bold text-sm uppercase tracking-[0.15em] mb-2">Deep Dive</h3>
                  <p className="text-xs text-textMuted group-hover:text-black/60 transition-colors">An endless gauntlet of increasingly difficult questions.</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-2xl animate-up">
            <QuizGame mode={quizMode} onClose={() => setQuizActive(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
