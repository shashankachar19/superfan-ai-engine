import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { usePreloader } from "../../App";



// Split text into characters wrapped in overflow-hidden divs
function SplitText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {text.split("").map((char, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <span className="split-char inline-block" style={{ transform: "translateY(100%)" }}>
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}
interface InteractiveHeroProps {
  onLoginClick?: () => void;
}

export default function InteractiveHero({ onLoginClick }: InteractiveHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { done: preloaderDone } = usePreloader();

  // Removed useScroll because this component is now a static landing view without scrolling

  // GSAP text reveal animation after preloader completes
  useEffect(() => {
    if (!preloaderDone || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // 1. Animate characters in
      tl.to(".split-char", {
        y: "0%",
        duration: 1.2,
        stagger: 0.025,
      });

      // 4. CTA Button pops in
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.5)" },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-transparent cursor-none pt-24" id="interactive-hero">
      <motion.div 
        className="mx-auto w-full z-10 px-page"
      >

        {/* The Massive Typography */}
        <div 
          className="relative w-full text-center flex justify-center items-center select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Layer 1: The Media Mask Text */}
          <div 
            className="font-display font-black leading-none tracking-tighter w-full text-center absolute inset-0"
            style={{ 
              fontSize: '18vw',
              backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            SUPERFAN
          </div>

          {/* Layer 2: The text with GSAP split reveal */}
          <motion.div 
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="font-display font-black leading-none tracking-tighter w-full text-center text-white z-10 relative"
            style={{ fontSize: '18vw' }}
          >
            <SplitText text="SUPERFAN" />
          </motion.div>
        </div>

        {/* CTA Button instead of scroll indicator */}
        <div className="mt-20 flex justify-center w-full" style={{ opacity: 0 }} ref={ctaRef}>
          <button 
            onClick={onLoginClick}
            className="group relative px-12 py-5 bg-white text-black font-display font-black tracking-[0.2em] uppercase rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Initialize Protocol
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-primary translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
