import { useState, useRef } from "react";
import { ApiClient } from "../../api/client";
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

function AuthFloatingObject() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.2;
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <icosahedronGeometry args={[1, 0]} />
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const data: any = await ApiClient.login(email, password);
        onSuccess(data.user);
      } else {
        const data: any = await ApiClient.register(username, email, password);
        onSuccess(data.user || data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bgBase flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      <div className="md:w-1/2 h-1/4 md:h-full flex items-center justify-center border-b md:border-b-0 md:border-r border-accentBorder p-12 relative overflow-hidden group">
        <div className="absolute inset-0 bg-textMain/5" />
        
        {/* 3D Object */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#888888" />
            <AuthFloatingObject />
            <Environment preset="city" />
          </Canvas>
        </div>

        <h2 className="font-display text-[8rem] md:text-[15vw] leading-none tracking-tighter text-bgSubtle text-outline mix-blend-difference absolute pointer-events-none select-none z-10">
          {isLogin ? "IN" : "UP"}
        </h2>
        <div className="relative z-10 w-full max-w-sm">
          <p className="font-display text-xs tracking-widest text-textMuted uppercase mb-4">
            02 / Authentication
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4">
            {isLogin ? "LOG IN" : "SIGN UP"}
          </h2>
          <p className="font-body text-textMuted text-sm leading-relaxed">
            {isLogin ? "Continue your journey into the universe." : "Initialize your profile and prepare for entry."}
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="md:w-1/2 h-3/4 md:h-full flex items-center justify-center p-8 md:p-12 relative">
        <button 
          className="absolute top-8 right-8 font-display text-xs uppercase tracking-widest text-textMuted hover:text-textMain transition-colors"
          onClick={onClose}
        >
          [ Close ]
        </button>

        <div className="w-full max-w-md">
          {error && (
            <div className="mb-8 p-4 border border-red-900/50 text-red-500 font-display text-xs uppercase tracking-widest bg-red-950/20">
              [Error] {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLogin && (
              <div className="space-y-2 group">
                <label className="font-display text-xs tracking-widest text-textMuted uppercase group-focus-within:text-textMain transition-colors">
                  Username
                </label>
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-transparent border-b border-accentBorder p-2 text-xl font-display focus:outline-none focus:border-textMain transition-colors placeholder:text-accentBorder"
                  placeholder="StrawHat99"
                />
              </div>
            )}
            <div className="space-y-2 group">
              <label className="font-display text-xs tracking-widest text-textMuted uppercase group-focus-within:text-textMain transition-colors">
                Email
              </label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-transparent border-b border-accentBorder p-2 text-xl font-display focus:outline-none focus:border-textMain transition-colors placeholder:text-accentBorder"
                placeholder="fan@example.com"
              />
            </div>
            <div className="space-y-2 group">
              <label className="font-display text-xs tracking-widest text-textMuted uppercase group-focus-within:text-textMain transition-colors">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-transparent border-b border-accentBorder p-2 text-xl font-display tracking-widest focus:outline-none focus:border-textMain transition-colors placeholder:text-accentBorder pr-16"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-widest text-textMuted hover:text-textMain transition-colors px-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  [{showPassword ? "HIDE" : "SHOW"}]
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full btn-nothin mt-8" 
              disabled={loading}
            >
              {loading ? "PROCESSING..." : (isLogin ? "ENTER" : "CREATE")}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-accentBorder flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-body text-xs text-textMuted uppercase tracking-wider">
              {isLogin ? "Need a profile?" : "Already initialized?"}
            </span>
            <button 
              type="button" 
              className="font-display text-xs uppercase tracking-widest hover:text-textMuted transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up →" : "← Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
