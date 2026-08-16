import { useRef, useState } from "react";
import { motion, useScroll, useVelocity, useSpring, useTransform, useAnimationFrame, useMotionValue } from "framer-motion";
import { ApiClient } from "../../api/client";
import { Activity } from "lucide-react";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function CommunityTiny3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.z = t * 0.3;
  });

  return (
    <mesh ref={meshRef} scale={1.5}>
      <torusKnotGeometry args={[0.5, 0.15, 64, 16]} />
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

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const initialEvents = [
  { id: 1, type: "STORY", user: "ZoroFan99", action: "created a new canon timeline", target: "One Piece" },
  { id: 2, type: "QUIZ", user: "ShinobiMaster", action: "scored 100% on", target: "Naruto Hard Mode" },
  { id: 3, type: "CHAT", user: "StarkTech", action: "unlocked secret lore with", target: "Tony Stark" },
  { id: 4, type: "ART", user: "AnimeWeeb", action: "generated a poster for", target: "Demon Slayer Arc 4" },
  { id: 5, type: "STORY", user: "JediKnight", action: "wrote an alternate ending to", target: "Episode III" },
  { id: 6, type: "CHAT", user: "GojoSato", action: "conversed for 2 hours with", target: "Gojo Satoru" },
];

function FeedItem({ ev }: { ev: any }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-8 text-[12vw] font-display font-black tracking-tighter uppercase whitespace-nowrap group cursor-none transition-transform duration-300 leading-none py-8">
      <span className="text-outline transition-colors duration-300 group-hover:text-textMain group-hover:text-outline-none">
        {ev.type} //
      </span>
      <span className="text-textMain group-hover:text-bgBase group-hover:bg-textMain px-2 transition-all">{ev.user}</span>
      <span className="text-textMuted text-2xl font-body tracking-normal lowercase transition-colors">{ev.action}</span>
      <span className="text-textMain">{ev.target}</span>
      <Activity size={32} className="text-textMain ml-4" />
    </div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex m-0">
      <motion.div className="flex whitespace-nowrap flex-nowrap gap-12" style={{ x }}>
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export default function CommunityFeed() {
  const [events, setEvents] = useState(initialEvents);
  const [postInput, setPostInput] = useState("");
  const [universeInput, setUniverseInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postInput.trim() || !universeInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setMessage("Analyzing with AI Moderation...");
    
    try {
      const result = await ApiClient.submitPost(universeInput, postInput);
      setMessage(result.reason);
      
      if (result.accepted) {
        setEvents([{
          id: Date.now(),
          type: "POST",
          user: "You",
          action: "broadcasted a message to",
          target: universeInput
        }, ...events]);
        setPostInput("");
        setUniverseInput("");
        
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (err) {
      setMessage("Error submitting post. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTiltMove = (e: React.MouseEvent<HTMLFormElement>) => {
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

  const handleTiltLeave = (e: React.MouseEvent<HTMLFormElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.7,
      ease: "elastic.out(1, 0.3)",
      zIndex: 1
    });
  };

  return (
    <section className="relative bg-bgBase py-32 border-t border-accentBorder overflow-hidden" id="community">
      <div className="px-page mb-24 max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12 relative">
        <div className="z-10">
          <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-8 border-l border-accentBorder pl-4">
            04 / NETWORK ACTIVITY
          </div>
          <h2 className="font-display text-4xl md:text-5xl uppercase tracking-tighter font-bold text-transparent bg-clip-text bg-[url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
            GLOBAL <span className="text-textMuted">SYNC</span>
          </h2>
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-20 pointer-events-none hidden md:block">
          <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <CommunityTiny3D />
            <Environment preset="city" />
          </Canvas>
        </div>

        <form 
          onSubmit={handleSubmit} 
          onMouseMove={handleTiltMove}
          onMouseLeave={handleTiltLeave}
          className="w-full md:w-[400px] border border-accentBorder p-6 bg-bgSubtle flex flex-col gap-4 relative z-10"
        >
          <div className="font-display text-xs uppercase tracking-widest text-textMain mb-2">Broadcast to Network</div>
          
          <input 
            type="text" 
            placeholder="Universe (e.g. Marvel)" 
            value={universeInput}
            onChange={e => setUniverseInput(e.target.value)}
            className="bg-transparent border-b border-accentBorder p-2 text-sm text-textMain focus:outline-none focus:border-textMain font-body uppercase"
            disabled={isSubmitting}
            required
          />
          
          <textarea 
            placeholder="Share your discovery..." 
            value={postInput}
            onChange={e => setPostInput(e.target.value)}
            className="bg-transparent border border-accentBorder p-3 text-sm text-textMain focus:outline-none focus:border-textMain font-body h-[100px] resize-none"
            disabled={isSubmitting}
            required
          />
          
          <div className="flex justify-between items-center mt-2">
            <div className={`font-body text-xs ${message.includes('rejected') ? 'text-red-500' : 'text-textMuted'}`}>
              {message}
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || !postInput.trim() || !universeInput.trim()}
              className="font-display text-xs uppercase tracking-widest bg-textMain text-bgBase px-6 py-2 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "SYNCING..." : "BROADCAST"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-12 w-full">
        <ParallaxText baseVelocity={-2}>
          {events.map((ev, i) => (
            <FeedItem key={`r1-${ev.id}-${i}`} ev={ev} />
          ))}
        </ParallaxText>
        <ParallaxText baseVelocity={2}>
          {[...events].reverse().map((ev, i) => (
            <FeedItem key={`r2-${ev.id}-${i}`} ev={ev} />
          ))}
        </ParallaxText>
      </div>
    </section>
  );
}
