import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

// Shared scroll progress ref — updated by App.tsx via GSAP ScrollTrigger
export const scrollProgressRef = { current: 0 };

function FloatingIcosahedron() {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = 3;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.y = t * 0.2;
    // Float gently + scroll-linked Y offset
    meshRef.current.position.y = initialY + Math.sin(t * 0.5) * 0.3 - scrollProgressRef.current * 8;
    meshRef.current.position.x = -3 + Math.sin(t * 0.3) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={[-3, initialY, -2]}>
      <icosahedronGeometry args={[1.2, 0]} />
      <meshPhysicalMaterial
        color="#e0e0e0"
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={2}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function FloatingTorus() {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = 0;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.1;
    meshRef.current.rotation.z = t * 0.25;
    meshRef.current.position.y = initialY + Math.cos(t * 0.4) * 0.4 - scrollProgressRef.current * 6;
    meshRef.current.position.x = 3.5 + Math.cos(t * 0.2) * 0.15;
  });

  return (
    <mesh ref={meshRef} position={[3.5, initialY, -3]}>
      <torusGeometry args={[0.8, 0.35, 16, 48]} />
      <meshPhysicalMaterial
        color="#d0d0d0"
        metalness={1}
        roughness={0.08}
        clearcoat={1}
        clearcoatRoughness={0.05}
        envMapIntensity={2.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function FloatingTorusKnot() {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = -3;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.18;
    meshRef.current.rotation.z = t * 0.12;
    meshRef.current.position.y = initialY + Math.sin(t * 0.6) * 0.25 - scrollProgressRef.current * 4;
    meshRef.current.position.x = -2 + Math.sin(t * 0.25) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[-2, initialY, -4]}>
      <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />
      <meshPhysicalMaterial
        color="#c8c8c8"
        metalness={1}
        roughness={0.03}
        clearcoat={1}
        clearcoatRoughness={0.02}
        envMapIntensity={3}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#888888" />
      <FloatingIcosahedron />
      <FloatingTorus />
      <FloatingTorusKnot />
      <Environment preset="city" />
    </>
  );
}

export default function WebGLBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
