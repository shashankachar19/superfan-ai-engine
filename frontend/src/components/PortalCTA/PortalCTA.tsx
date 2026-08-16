import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PortalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax upward movement and fade in as it enters the viewport
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 150 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[70vh] bg-bgBase flex flex-col justify-center items-center px-page border-t border-accentBorder overflow-hidden">
      <div 
        ref={contentRef}
        className="w-full max-w-[1800px] flex flex-col justify-center items-center text-center py-32"
      >
        <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-12">
          FINAL DESTINATION
        </div>
        
        <h2 className="font-display text-[10vw] md:text-[8vw] leading-[0.8] tracking-tighter uppercase font-bold text-textMain mb-16">
          ENTER <br/>
          <span className="text-outline text-textMuted">UNIVERSE</span>
        </h2>
        
        <button className="btn-nothin text-lg px-12 py-6 hover:scale-105 transform transition-all duration-300">
          INITIALIZE PROTOCOL
        </button>
      </div>
    </section>
  );
}
