import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function UniverseOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  const orbitItems = [
    { label: "ANIME", x: 0, y: -150 },
    { label: "MOVIES", x: 150, y: 0 },
    { label: "SERIES", x: 0, y: 150 },
    { label: "GAMES", x: -150, y: 0 },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Section label slide in
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none none" },
        }
      );

      // Heading words reveal
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current.querySelectorAll(".word"),
          { y: "110%", opacity: 0 },
          {
            y: "0%", opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out",
            scrollTrigger: { trigger: headingRef.current, start: "top 85%", toggleActions: "play none none none" },
          }
        );
      }

      // Description fade in
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: descRef.current, start: "top 90%", toggleActions: "play none none none" },
        }
      );

      // Orbit rotation linked to scroll
      gsap.to(orbitRef.current, {
        rotation: 360,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[80vh] flex items-center justify-center bg-bgBase py-24 overflow-hidden border-t border-accentBorder">
      <div className="max-w-[1800px] w-full px-page flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
        
        {/* Left Typography */}
        <div className="flex-1">
          <div ref={labelRef} className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-8 border-l border-accentBorder pl-4" style={{ opacity: 0 }}>
            02 / CORE ARCHITECTURE
          </div>
          <h2 ref={headingRef} className="font-display text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter mb-8 leading-[0.9]">
            {["SYNCHRONIZE", "REALITIES"].map((word, i) => (
              <span key={i} className="overflow-hidden block">
                <span className="word block">{word}</span>
              </span>
            ))}
          </h2>
          <p ref={descRef} className="font-body text-textMuted max-w-sm text-sm leading-relaxed" style={{ opacity: 0 }}>
            A singular hub connecting disparate narrative dimensions. Transition seamlessly between anime, cinema, and interactive media.
          </p>
        </div>

        {/* Right Orbit Visualization */}
        <div className="flex-1 flex justify-center items-center relative">
          <div className="relative w-[400px] h-[400px] flex items-center justify-center">
            {/* Center Core */}
            <div className="absolute w-4 h-4 bg-textMain rounded-full z-20" />
            <div className="absolute w-24 h-24 border border-accentBorder rounded-full z-10 flex items-center justify-center">
              <span className="font-display text-[10px] tracking-widest text-textMuted absolute -bottom-6">CORE</span>
            </div>
            
            {/* Outer Orbit */}
            <div 
              ref={orbitRef}
              className="absolute w-full h-full"
            >
              <div className="absolute w-full h-full border border-accentBorder rounded-full border-dashed opacity-50" />
              {orbitItems.map((item, idx) => (
                <div 
                  key={idx}
                  className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center"
                  style={{ 
                    transform: `translate(-50%, -50%) translate(${item.x}px, ${item.y}px)`,
                  }}
                >
                  <div className="w-2 h-2 bg-textMain rounded-full mb-2" />
                  <span className="font-display text-[10px] tracking-widest text-textMuted">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
