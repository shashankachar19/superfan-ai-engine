import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageSquare, Paintbrush, Gamepad2, Compass, BookOpen } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: "talk",
    num: "01",
    title: "CHARACTER CHAT",
    desc: "Have real-time conversations with AI-powered characters. They know their lore, remember the story, and respond in character.",
    icon: MessageSquare,
    accent: "#fff",
  },
  {
    id: "create",
    num: "02",
    title: "CONTENT STUDIO",
    desc: "Generate memes, posters, fan fiction, wallpapers, and social posts — all powered by AI that understands your fandom.",
    icon: Paintbrush,
    accent: "#fff",
  },
  {
    id: "play",
    num: "03",
    title: "QUIZ ARENA",
    desc: "Test your knowledge with adaptive AI quizzes that evolve based on your skill level. Compete and climb the ranks.",
    icon: Gamepad2,
    accent: "#fff",
  },
  {
    id: "discover",
    num: "04",
    title: "RECOMMENDATION ENGINE",
    desc: "Get personalized recommendations for movies, episodes, merchandise, and fan content tailored to your taste.",
    icon: Compass,
    accent: "#fff",
  },
  {
    id: "story",
    num: "05",
    title: "PERSONALIZED STORY",
    desc: "Step into the narrative. Tell us your name, choose your role, and the AI weaves you into the canon as the protagonist.",
    icon: BookOpen,
    accent: "#fff",
  },
];

export default function HorizontalScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      // Heading text reveal
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current.querySelectorAll(".word"),
          { y: "100%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: 1,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Horizontal scroll pinning
      const track = trackRef.current!;
      const totalWidth = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Stagger card entrances
      gsap.fromTo(
        ".h-scroll-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-bgBase overflow-hidden border-t border-accentBorder">
      {/* Section heading */}
      <div className="px-page pt-32 pb-16 max-w-[1800px] mx-auto">
        <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-8 border-l border-accentBorder pl-4">
          03 / PLATFORM CAPABILITIES
        </div>
        <h2 ref={headingRef} className="font-display text-[10vw] md:text-[6vw] font-black uppercase tracking-tighter leading-[0.9] mb-4">
          {["WHAT", "CAN", "YOU", "DO"].map((word, i) => (
            <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
              <span className="word inline-block">
                {word}
              </span>
            </span>
          ))}
        </h2>
        <p className="font-body text-textMuted max-w-lg text-sm leading-relaxed">
          Scroll to explore the full spectrum of AI-powered capabilities. Each module is a self-contained intelligence protocol.
        </p>
      </div>

      {/* Horizontal track */}
      <div ref={trackRef} className="flex items-stretch gap-8 px-page pb-32 will-change-transform" style={{ width: 'max-content' }}>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="h-scroll-card flex-shrink-0 w-[85vw] md:w-[45vw] lg:w-[35vw] border border-accentBorder bg-bgSubtle/30 p-12 flex flex-col justify-between group hover:border-textMain transition-colors duration-500 relative overflow-hidden"
            >
              {/* Background number */}
              <div className="absolute top-4 right-6 font-display text-[20vw] md:text-[12vw] font-black text-white/[0.03] leading-none pointer-events-none select-none">
                {feature.num}
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <span className="font-display text-xs tracking-widest text-textMuted uppercase">
                    {feature.num}
                  </span>
                  <Icon className="w-6 h-6 text-textMuted group-hover:text-textMain transition-colors" strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-4xl md:text-5xl uppercase tracking-tighter font-bold mb-8 leading-[0.95] group-hover:translate-x-2 transition-transform duration-500">
                  {feature.title}
                </h3>

                <p className="font-body text-textMuted text-sm leading-relaxed max-w-sm">
                  {feature.desc}
                </p>
              </div>

              <div className="relative z-10 mt-12">
                <button 
                  onClick={() => document.getElementById('ai-experiences')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-nothin text-sm group-hover:bg-textMain group-hover:text-bgBase group-hover:border-textMain transition-all duration-300"
                >
                  EXPLORE →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
