import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContentGenerator from "../ContentGenerator/ContentGenerator";
import QuizGame from "../QuizGame/QuizGame";
import LiveChatFeed from "../LiveChatFeed/LiveChatFeed";
import PersonalizedStory from "../PersonalizedStory/PersonalizedStory";
import Recommendations from "../Recommendations/Recommendations";

gsap.registerPlugin(ScrollTrigger);

interface Ability {
  id: string;
  label: string;
  title: string;
  desc: string;
  examples: string[];
}

const abilities: Ability[] = [
  {
    id: "talk",
    label: "TALK",
    title: "CONVERSE WITH LEGENDS",
    desc: "Have real conversations with AI-powered characters from your favorite universes. They remember the story, know their lore, and respond in character.",
    examples: ["Luffy, what's your dream?", "Naruto, teach me rasengan", "Harry, what house am I in?"],
  },
  {
    id: "create",
    label: "CREATE",
    title: "GENERATE NEW CANON",
    desc: "Create fanfiction, generate artwork prompts, write alternate endings, and build your own stories set in your favorite universes.",
    examples: ["Write a One Piece x Naruto crossover", "Generate a fan poster", "Create an alternate ending"],
  },
  {
    id: "play",
    label: "PLAY",
    title: "TEST YOUR KNOWLEDGE",
    desc: "Challenge yourself with adaptive quizzes. Test your fandom knowledge with AI-generated quizzes that adapt to your level and cover any universe.",
    examples: ["Quiz me on One Piece Devil Fruits", "Hard mode MCU trivia", "Guess the character"],
  },
  {
    id: "discover",
    label: "DISCOVER",
    title: "UNEARTH SECRETS",
    desc: "Your AI guide knows every episode, every album, every arc. Ask anything — get intelligent, personalized recommendations.",
    examples: ["Best Naruto arc for beginners?", "Similar anime to Demon Slayer", "MCU watch order"],
  },
];

export default function AIExperience() {
  const [active, setActive] = useState("talk");
  const [showContentGen, setShowContentGen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Heading slide down
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: -50 },
          {
            opacity: 1, y: 0, duration: 1, ease: "power4.out",
            scrollTrigger: { trigger: containerRef.current, start: "top 80%", toggleActions: "play none none none" }
          }
        );
      }

      // Menu stagger
      if (menuRef.current) {
        gsap.fromTo(
          menuRef.current.querySelectorAll("button"),
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: menuRef.current, start: "top 80%", toggleActions: "play none none none" }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const currentAbility = abilities.find((a) => a.id === active) || abilities[0];

  const handleCtaClick = () => {
    if (active === "create") {
      setShowContentGen(true);
    } else if (active === "play") {
      setShowQuiz(true);
    } else if (active === "story") {
      setShowStory(true);
    } else if (active === "discover") {
      setShowRecs(true);
    } else if (active === "talk") {
      const charSection = document.getElementById("characters");
      if (charSection) {
        charSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      alert(`The ${currentAbility.label} protocol is initializing... Check back later.`);
    }
  };

  return (
    <section ref={containerRef} className="relative min-h-screen bg-white text-black py-32 px-page border-t border-black/10" id="ai-experiences">
      <div className="max-w-[1800px] mx-auto">
        <div className="font-display text-[10px] tracking-widest text-black/50 uppercase mb-8 border-l border-black/20 pl-4">
            03 / GENERATIVE PROTOCOLS
        </div>
        
        <div className="flex flex-col lg:flex-row gap-24">
          
          {/* Left Menu */}
          <div className="flex-1 lg:max-w-sm lg:sticky lg:top-32 h-fit">
            <h2 ref={headingRef} className="font-display text-[10vw] md:text-[5vw] lg:text-6xl leading-[0.9] tracking-tighter font-black mb-16 break-words" style={{ opacity: 0 }}>
              SYSTEM <span className="text-black/50">CAPABILITIES</span>
            </h2>
            
            <div ref={menuRef} className="flex flex-col gap-6">
              {abilities.map((ability) => (
                <button
                  key={ability.id}
                  onClick={() => setActive(ability.id)}
                  className={`text-left font-display text-3xl md:text-5xl tracking-tighter uppercase transition-colors duration-300 ${
                    active === ability.id ? "text-black" : "text-black/30 hover:text-black"
                  }`}
                >
                  {ability.label}
                  {active === ability.id && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="h-[4px] w-full bg-black mt-2"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-[2] relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <h3 className="font-display text-[8vw] md:text-[5vw] tracking-tighter font-black uppercase mb-8 leading-[0.9]">
                  {currentAbility.title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 !== 0 ? "text-black/30" : ""}>{word} </span>
                  ))}
                </h3>
                
                <p className="font-body text-black/70 max-w-xl text-lg leading-relaxed mb-12">
                  {currentAbility.desc}
                </p>

                <div className="mb-12">
                  <div className="font-display text-[10px] tracking-widest text-black/50 uppercase mb-4">
                    INPUT_PARAMETERS
                  </div>
                  <div className="flex flex-col gap-3">
                    {currentAbility.examples.map((ex, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm font-body text-black">
                        <span className="text-black/50">→</span>
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>

                {active === 'talk' && (
                  <div className="mb-12">
                    <LiveChatFeed />
                  </div>
                )}

                <div>
                  <button className="btn-nothin" onClick={handleCtaClick}>
                    INITIATE {currentAbility.label}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showContentGen && (
        <ContentGenerator onClose={() => setShowContentGen(false)} />
      )}
      
      {showQuiz && (
        <QuizGame onClose={() => setShowQuiz(false)} />
      )}

      {showStory && (
        <PersonalizedStory onClose={() => setShowStory(false)} />
      )}

      {showRecs && (
        <Recommendations onClose={() => setShowRecs(false)} />
      )}
    </section>
  );
}

