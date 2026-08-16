import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useUniverse } from '../../context/UniverseContext';

function Planet({ position, universe, index }: { position: [number, number, number], universe: any, index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedUniverse, setSelectedUniverse } = useUniverse();
  const isSelected = selectedUniverse.id === universe.id;

  // Alternate colors for planets based on index
  const color = index % 2 === 0 ? "#00f0ff" : "#b026ff";

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        onClick={(e) => { e.stopPropagation(); setSelectedUniverse(universe); }}
        scale={isSelected ? 1.5 : hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          wireframe={!isSelected && !hovered}
          emissive={isSelected || hovered ? color : "#000000"}
          emissiveIntensity={isSelected ? 2 : hovered ? 1 : 0}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* HTML Label overlay on the planet */}
      <Html distanceFactor={15} center>
        <div className={`transition-all duration-300 ${isSelected || hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'} flex flex-col items-center`}>
          <div className="bg-bgSubtle/90 border border-accentBorder backdrop-blur-md p-4 rounded-xl min-w-[200px] text-center" style={{ borderColor: isSelected ? color : 'var(--color-accentBorder)' }}>
            <div className="font-display text-[10px] uppercase tracking-widest mb-2" style={{ color: color }}>
              {universe.category}
            </div>
            <h3 className="font-display text-lg uppercase tracking-tighter font-bold text-textMain mb-2">
              {universe.name}
            </h3>
            {isSelected && (
              <span className="font-display text-[10px] tracking-[0.2em] uppercase text-textMain bg-accentBorder/50 px-2 py-1 rounded">
                System Active
              </span>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

function GalaxyCenter() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.2;
      ref.current.rotation.x -= delta * 0.1;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
    </mesh>
  );
}

export default function FandomGalaxy3D() {
  const { universesList } = useUniverse();

  // Distribute planets in a circle around the center
  const radius = 8;
  const planets = universesList.map((u, i) => {
    const angle = (i / universesList.length) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(angle * 2) * 2; // slight wave in y
    return { ...u, position: [x, y, z] as [number, number, number] };
  });

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-accentBorder bg-bgSubtle/30 relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#b026ff" />
        
        <GalaxyCenter />
        
        {planets.map((p, i) => (
          <Planet key={p.id} universe={p} position={p.position} index={i} />
        ))}
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={5} 
          maxDistance={30} 
          autoRotate 
          autoRotateSpeed={0.5} 
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 pointer-events-none z-10 flex gap-4">
        <div className="flex items-center gap-2 font-display text-[10px] uppercase tracking-widest text-textMuted">
          <div className="w-2 h-2 rounded-full bg-cyberCyan animate-pulse" />
          WebGL Active
        </div>
        <div className="flex items-center gap-2 font-display text-[10px] uppercase tracking-widest text-textMuted">
          [ Drag to Rotate Galaxy ]
        </div>
      </div>
    </div>
  );
}
