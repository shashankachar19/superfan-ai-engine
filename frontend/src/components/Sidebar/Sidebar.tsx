import { Home, MessageSquare, Sparkles, Target, Settings, LogOut, PanelLeftClose, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

function TinyLogo3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.5;
    meshRef.current.rotation.y = t * 0.8;
  });

  return (
    <mesh ref={meshRef} scale={1.2}>
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

export type ZoneType = "command" | "interactive" | "creation" | "arena" | "community";

interface SidebarProps {
  activeZone: ZoneType;
  setActiveZone: (zone: ZoneType) => void;
  onLogout?: () => void;
  user?: any;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSettingsClick?: () => void;
}

const zones = [
  { id: "command", label: "Command Center", icon: Home },
  { id: "interactive", label: "Interactive Zone", icon: MessageSquare },
  { id: "creation", label: "Creation Studio", icon: Sparkles },
  { id: "arena", label: "The Arena", icon: Target },
  { id: "community", label: "Community Feed", icon: Users },
];

export default function Sidebar({ activeZone, setActiveZone, onLogout, user, collapsed, onToggleCollapse, onSettingsClick }: SidebarProps) {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current.children,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [collapsed]);

  return (
    <div className={`${collapsed ? 'w-0 -translate-x-full' : 'w-20 lg:w-64'} h-screen fixed left-0 top-0 border-r border-accentBorder bg-bgBase flex flex-col justify-between py-6 z-50 transition-all duration-300 overflow-hidden`}>
      
      {/* Top Branding */}
      <div className="px-4 lg:px-6 flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex-shrink-0">
              <Canvas camera={{ position: [0, 0, 3], fov: 50 }} style={{ pointerEvents: 'none' }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 2, 2]} intensity={1} />
                <TinyLogo3D />
                <Environment preset="city" />
              </Canvas>
            </div>
            <span className="font-display font-black text-sm tracking-tighter uppercase hidden lg:block">
              SUPERFAN<span className="text-textMuted ml-1">AI</span>
            </span>
            <span className="font-display font-black text-sm tracking-tighter uppercase lg:hidden">
              SF
            </span>
          </div>
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:block text-textMuted hover:text-white transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1" ref={navRef}>
          {zones.map((zone) => {
            const Icon = zone.icon;
            const isActive = activeZone === zone.id;
            
            return (
              <button
                key={zone.id}
                onClick={() => setActiveZone(zone.id as ZoneType)}
                className={`relative flex items-center gap-4 px-4 py-3 transition-colors duration-200 ${
                  isActive 
                    ? "bg-white text-black" 
                    : "text-textMuted hover:text-white"
                }`}
                title={zone.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-display font-bold text-xs tracking-[0.15em] uppercase hidden lg:block whitespace-nowrap">
                  {zone.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Settings */}
      <div className="px-4 lg:px-6 flex flex-col gap-2 border-t border-accentBorder pt-6">
        <button 
          onClick={onSettingsClick}
          className="flex items-center gap-4 px-4 py-3 text-textMuted hover:text-white transition-colors duration-200" 
          title="Settings"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="font-display font-bold text-xs tracking-[0.15em] uppercase hidden lg:block whitespace-nowrap">
            Settings
          </span>
        </button>
        
        {user && (
          <div className="flex items-center justify-between mt-2 px-4 py-3 border-t border-accentBorder">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="hidden lg:flex flex-col overflow-hidden">
                <span className="font-bold text-xs uppercase tracking-widest truncate">{user.username || "Agent SF"}</span>
                <span className="text-[10px] text-textMuted truncate">{user.email || "agent@superfan.ai"}</span>
              </div>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="p-1 text-textMuted hover:text-white transition-colors"
                title="Log out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
