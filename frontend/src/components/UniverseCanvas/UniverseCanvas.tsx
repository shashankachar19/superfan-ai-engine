import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

function MovingStars() {
  const groupRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.02;
      groupRef.current.rotation.x -= delta * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export default function UniverseCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-bgBase">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={['#030308']} />
        <ambientLight intensity={0.5} />
        <MovingStars />
      </Canvas>
      {/* Fog/Gradient overlay to blend the 3D space with the UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bgBase/50 to-bgBase pointer-events-none" />
    </div>
  );
}
