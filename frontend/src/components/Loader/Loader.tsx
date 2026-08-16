import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function Loader3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.y = t * 0.6;
    meshRef.current.position.y = Math.sin(t * 2) * 0.1;
  });

  return (
    <mesh ref={meshRef} scale={1.8}>
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.1}
        clearcoat={1}
        envMapIntensity={2.5}
        wireframe={true}
      />
    </mesh>
  );
}

interface LoaderProps {
  onComplete: () => void;
  onExitStart: () => void;
}

export default function Loader({ onComplete, onExitStart }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const fillTextRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const proxy = { value: 0 };
      const tl = gsap.timeline();

      // Phase 1: Count from 0 to 100 & fill the text
      tl.to(proxy, {
        value: 100,
        duration: 3.2, // slightly longer for liquid feel
        ease: "power2.inOut",
        onUpdate: () => {
          // Update counter
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.floor(proxy.value)).padStart(3, "0");
          }
          // Reveal the foil text from bottom to top using clip-path
          if (fillTextRef.current) {
            fillTextRef.current.style.clipPath = `inset(${100 - proxy.value}% 0 0 0)`;
          }
        },
      });

      // Phase 2: Explosive cinematic zoom
      tl.to(
        containerRef.current,
        {
          scale: 3,
          opacity: 0,
          duration: 1.2,
          ease: "power4.inOut",
          onStart: () => {
            if (onExitStart) onExitStart();
          },
          onComplete: () => {
            if (onComplete) onComplete();
          },
        },
        "+=0.2"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-bgBase flex flex-col justify-center items-center overflow-hidden"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <Loader3D />
          <Environment preset="city" />
        </Canvas>
      </div>

      <div className="relative w-full flex items-center justify-center z-10 h-screen">
        
        {/* Layer 1: Outlined Text (Empty state) */}
        <div 
          className="font-display text-[18vw] leading-none tracking-tighter font-black absolute inset-0 flex items-center justify-center pointer-events-none select-none uppercase"
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.15)",
            color: "transparent"
          }}
        >
          SUPERFAN
        </div>

        {/* Layer 2: Foil Text (Filled state) */}
        <div 
          ref={fillTextRef}
          className="font-display text-[18vw] leading-none tracking-tighter font-black absolute inset-0 flex items-center justify-center pointer-events-none select-none uppercase text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center"
          style={{
            clipPath: "inset(100% 0 0 0)",
            willChange: "clip-path"
          }}
        >
          SUPERFAN
        </div>
      </div>

      {/* Top Left Label */}
      <div
        ref={labelRef}
        className="absolute top-12 left-page font-display text-xs tracking-[0.4em] text-textMuted uppercase"
      >
        Initializing Core Protocol
      </div>

      {/* Bottom Right Counter */}
      <div className="absolute bottom-12 right-page flex items-end gap-2">
        <div
          ref={counterRef}
          className="font-display text-textMain text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none"
        >
          000
        </div>
        <span className="font-display text-textMuted text-xl mb-2">%</span>
      </div>
    </div>
  );
}
