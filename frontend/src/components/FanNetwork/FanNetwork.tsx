import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FanNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Heading words animate in with stagger
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current.querySelectorAll(".word"),
          { y: "100%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: 1,
            stagger: 0.06,
            ease: "power4.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Paragraph fade
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: descRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // Scale the entire section content based on scroll progress (scrub)
      gsap.fromTo(
        containerRef.current!.querySelector(".inner-content"),
        { scale: 0.85, opacity: 0.3 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "center center",
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const words = ["JOIN", "A", "NETWORK", "OF", "MILLIONS", "WHO", "SHARE", "YOUR", "PASSION."];

  return (
    <section ref={containerRef} className="relative min-h-[60vh] bg-bgBase border-t border-accentBorder flex flex-col justify-center items-center overflow-hidden py-32 px-page">
      <div className="inner-content text-center">
        <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-12">
          05 / CONNECTIVITY
        </div>
        
        <h2 ref={headingRef} className="font-display text-[8vw] leading-[0.85] tracking-tighter uppercase font-bold text-textMain max-w-[1400px] mx-auto">
          {words.map((word, i) => {
            const isOutline = ["MILLIONS", "PASSION."].includes(word);
            return (
              <span key={i} className="overflow-hidden inline-block mr-[0.2em]">
                <span className={`word inline-block ${isOutline ? 'text-outline text-textMuted' : ''}`}>
                  {word}
                </span>
              </span>
            );
          })}
        </h2>
        
        <p ref={descRef} className="font-body text-textMuted max-w-xl mx-auto mt-16 text-lg leading-relaxed" style={{ opacity: 0 }}>
          Our decentralized AI network ensures your fandom data, personalized lore, and generated stories belong to you, bridging universes like never before.
        </p>
      </div>
    </section>
  );
}
