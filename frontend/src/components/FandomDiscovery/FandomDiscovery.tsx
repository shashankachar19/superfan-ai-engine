import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InteractiveUniverseMap from "../InteractiveUniverseMap/InteractiveUniverseMap";

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ["ALL", "ANIME", "MOVIES", "SERIES", "MUSIC", "GAMES"];

export default function FandomDiscovery() {

  const [activeCategory, setActiveCategory] = useState("ALL");
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading word reveals
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

      // Description fade
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: descRef.current, start: "top 90%", toggleActions: "play none none none" },
        }
      );

      // Button stagger
      if (buttonsRef.current) {
        gsap.fromTo(
          buttonsRef.current.querySelectorAll("button"),
          { opacity: 0, y: 15 },
          {
            opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out",
            scrollTrigger: { trigger: buttonsRef.current, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-page min-h-screen bg-white text-black relative" id="explore">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start mb-16 relative z-10">
        <div className="max-w-2xl">
          <div className="font-display text-xs tracking-[0.3em] text-black/50 mb-8 uppercase flex items-center gap-4">
            <span className="w-8 h-[1px] bg-black/50" />
            01 / Fandom Discovery
          </div>
          <h2 ref={headingRef} className="font-display text-[12vw] md:text-[8vw] lg:text-[6vw] font-black uppercase tracking-tighter leading-[0.9] mb-6 break-words w-full">
            {["EXPLORE", "UNIVERSES"].map((word, i) => (
              <span key={i} className="overflow-hidden block">
                <span className="word block">{word}</span>
              </span>
            ))}
          </h2>
          <p ref={descRef} className="font-body text-black/70 max-w-md text-lg leading-relaxed" style={{ opacity: 0 }}>
            Drag the constellation map to explore neural-linked fandoms. Select a node to initialize the universe protocol and unlock character intelligence.
          </p>
        </div>

        <div ref={buttonsRef} className="flex flex-wrap gap-4 mt-12 md:mt-0 max-w-sm justify-end">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`font-display text-xs tracking-widest uppercase transition-all duration-300 px-4 py-2 border ${
                activeCategory === cat 
                  ? 'border-black text-white bg-black' 
                  : 'border-black/20 text-black/50 hover:border-black'
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        <InteractiveUniverseMap />
      </div>
    </section>
  );
}
