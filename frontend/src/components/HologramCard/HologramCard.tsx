import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface HologramCardProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  glowColor?: string;
}

export default function HologramCard({ 
  children, 
  active = false, 
  onClick, 
  className = "",
  glowColor = "var(--color-cyberCyan)"
}: HologramCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative cursor-none group ${className}`}
    >
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 60%)`,
          filter: "blur(20px)",
        }}
      />
      
      {/* Actual Card */}
      <div 
        className={`relative z-10 w-full h-full p-8 border transition-colors duration-500 backdrop-blur-md flex flex-col bg-bgBase/80 overflow-hidden ${
          active ? 'border-textMain' : 'border-accentBorder hover:border-textMuted'
        }`}
        style={{
          boxShadow: active ? `0 0 30px ${glowColor}40, inset 0 0 20px ${glowColor}20` : 'none',
        }}
      >
        {/* Holographic grid lines inside */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `linear-gradient(${glowColor} 1px, transparent 1px), linear-gradient(90deg, ${glowColor} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }} />
        
        {/* Dynamic glare based on mouse position */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at calc(50% + ${x.get() * 100}%) calc(50% + ${y.get() * 100}%), rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />

        {/* Content */}
        <div style={{ transform: "translateZ(30px)" }} className="relative z-20 h-full flex flex-col">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
