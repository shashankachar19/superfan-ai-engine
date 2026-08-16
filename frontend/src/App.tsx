import { useState, useEffect, useRef, createContext, useContext } from "react";
import { PanelLeftOpen } from "lucide-react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UniverseProvider, useUniverse } from "./context/UniverseContext";
import Navbar from "./components/Navbar/Navbar";
import InteractiveHero from "./components/InteractiveHero/InteractiveHero";
import InteractiveZone from "./components/InteractiveZone/InteractiveZone";
import AuthModal from "./components/Auth/AuthModal";
import CommandCenter from "./components/CommandCenter/CommandCenter";
import CreationStudio from "./components/CreationStudio/CreationStudio";
import Arena from "./components/Arena/Arena";
import CommunityFeed from "./components/CommunityFeed/CommunityFeed";
import Loader from "./components/Loader/Loader";
import WebGLBackground from "./components/WebGLBackground/WebGLBackground";
import ProfileCreation from "./components/ProfileCreation/ProfileCreation";
import Sidebar, { type ZoneType } from "./components/Sidebar/Sidebar";
import { scrollProgressRef } from "./components/WebGLBackground/WebGLBackground";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Context to share preloader state with child components
export const PreloaderContext = createContext({ done: false });
export const usePreloader = () => useContext(PreloaderContext);

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    
    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('button') || target.closest('a')) {
        cursorRef.current?.classList.add('hovering');
      } else {
        cursorRef.current?.classList.remove('hovering');
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleHover);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleHover);
    };
  }, []);

  return <div className="custom-cursor" ref={cursorRef} />;
}
export function AppInner() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [activeZone, setActiveZone] = useState<ZoneType>("command");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { selectById } = useUniverse();

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      window.location.reload();
    }, 2500);
  };

  // Initialize Lenis smooth scroll synced with GSAP
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP's ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Use GSAP ticker instead of raw rAF for perfect sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Global scroll progress for 3D background
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    // Small delay to let DOM settle before triggering hero animations
    setTimeout(() => setPreloaderDone(true), 100);
  };

  return (
    <PreloaderContext.Provider value={{ done: preloaderDone }}>
      <div className="relative min-h-screen bg-bgBase text-textMain font-body selection:bg-textMain selection:text-bgBase overflow-x-hidden">
        {/* Preloader */}
        {isLoading && (
          <Loader 
            onExitStart={() => setPreloaderDone(true)}
            onComplete={() => setIsLoading(false)} 
          />
        )}

        {/* Logout Animation Overlay */}
        {isLoggingOut && (
          <div 
            className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center"
            style={{ animation: 'fadeIn 0.8s ease forwards' }}
          >
            <h1 
              className="font-display text-4xl md:text-6xl text-white uppercase tracking-[0.2em]"
              style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            >
              Terminating Session...
            </h1>
            <p 
              className="text-textMuted mt-6 uppercase tracking-[0.3em] text-xs font-display"
              style={{ animation: 'fadeIn 1.5s ease forwards 0.5s', opacity: 0 }}
            >
              See you next time, {currentUser?.username || "Agent"}
            </p>
          </div>
        )}

        {/* Fixed 3D Background */}
        <WebGLBackground />
        
        <CustomCursor />

        {/* Guest Navbar */}
        {!currentUser && <Navbar onLoginClick={() => setIsAuthOpen(true)} user={currentUser} />}

        {/* Auth Sidebar */}
        {currentUser && !needsOnboarding && (
          <Sidebar 
            activeZone={activeZone} 
            setActiveZone={setActiveZone} 
            onLogout={handleLogout} 
            user={currentUser} 
            collapsed={sidebarCollapsed} 
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
            onSettingsClick={() => setNeedsOnboarding(true)}
          />
        )}

        {/* Sidebar expand button (visible when collapsed) */}
        {currentUser && !needsOnboarding && sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="fixed top-6 left-6 z-[60] border border-accentBorder bg-bgBase p-3 text-textMuted hover:text-white hover:bg-white hover:text-black transition-colors duration-200"
            title="Open sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <main className={`w-full relative z-[1] transition-all duration-300 ${currentUser && !needsOnboarding && !sidebarCollapsed ? 'lg:pl-64 pl-20' : ''}`}>
          {currentUser && needsOnboarding ? (
            <ProfileCreation 
              user={currentUser} 
              onComplete={(updatedUser) => {
                setCurrentUser(updatedUser);
                setNeedsOnboarding(false);
                if (updatedUser.favorite_universes && updatedUser.favorite_universes.length > 0) {
                  selectById(updatedUser.favorite_universes[0]);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          ) : currentUser ? (
            <div className="pt-12 px-page min-h-screen bg-bgBase">
              {/* Zone Content */}
              <div>
                {activeZone === "command" && <CommandCenter user={currentUser} onLogout={handleLogout} onNavigate={setActiveZone as any} />}
                {activeZone === "interactive" && <InteractiveZone />}
                {activeZone === "creation" && <CreationStudio />}
                {activeZone === "arena" && <Arena />}
                {activeZone === "community" && <CommunityFeed />}
              </div>
            </div>
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <InteractiveHero onLoginClick={() => setIsAuthOpen(true)} />
            </div>
          )}
        </main>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={(user) => {
            if (!user.favorite_universes || user.favorite_universes.length === 0) {
              setNeedsOnboarding(true);
            } else {
              selectById(user.favorite_universes[0]);
            }
            setCurrentUser(user);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
        />

        {/* Footer only on guest landing page */}
        {!currentUser && (
          <footer className="w-full border-t border-accentBorder py-12 px-page bg-bgBase relative z-[1]">
            <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
              <div>
                <h2 className="font-display text-4xl uppercase tracking-tighter font-bold mb-4">SuperFan<span className="text-textMuted ml-2">AI</span></h2>
                <p className="font-body text-xs text-textMuted uppercase tracking-widest max-w-sm leading-relaxed">
                  Academic GenAI project. Multi-agent orchestration. RAG pipeline initialized.
                </p>
              </div>
              <div className="flex gap-12">
                <div className="flex flex-col gap-4">
                  <span className="font-display text-xs text-textMuted uppercase tracking-[0.2em]">Platform</span>
                  <a href="#explore" className="font-body text-sm hover:text-textMuted transition-colors uppercase tracking-wider">Explore</a>
                  <a href="#characters" className="font-body text-sm hover:text-textMuted transition-colors uppercase tracking-wider">Characters</a>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="font-display text-xs text-textMuted uppercase tracking-[0.2em]">Tech</span>
                  <span className="font-body text-sm text-textMain uppercase tracking-wider">React / Vite</span>
                  <span className="font-body text-sm text-textMain uppercase tracking-wider">FastAPI</span>
                </div>
              </div>
            </div>
            <div className="max-w-[1800px] mx-auto mt-24 pt-8 border-t border-accentBorder flex flex-col md:flex-row justify-between items-center text-xs text-textMuted uppercase tracking-widest">
              <span>Your Fandom. Your Universe. Your Story.</span>
              <span>© 2026 SuperFan AI. All rights reserved.</span>
            </div>
          </footer>
        )}
      </div>
    </PreloaderContext.Provider>
  );
}

export default function App() {
  return (
    <UniverseProvider>
      <AppInner />
    </UniverseProvider>
  );
}
