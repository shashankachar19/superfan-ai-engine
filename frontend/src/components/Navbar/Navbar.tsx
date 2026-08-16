import { useState, useEffect } from "react";

const navLinks = [
  { label: "Explore", href: "#explore" },
  { label: "Universes", href: "#universes" },
  { label: "Characters", href: "#characters" },
  { label: "AI Experiences", href: "#ai-experiences" },
  { label: "Community", href: "#community" },
];

interface NavbarProps {
  onLoginClick: () => void;
  user: any;
}

export default function Navbar({ onLoginClick, user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Scroll effect was previously used here, now removed
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-page py-6 mix-blend-difference text-white pointer-events-none">
      <div className="flex justify-between items-center max-w-[1800px] mx-auto pointer-events-auto">
        <a href="#" className="flex items-baseline space-x-2 text-white hover:opacity-70 transition-opacity duration-300">
          <span className="font-display font-bold text-2xl tracking-tighter uppercase">SuperFan</span>
          <span className="font-body text-xs tracking-widest uppercase ml-2 opacity-50">AI</span>
        </a>

        {user && (
          <ul className={`hidden md:flex space-x-12 items-center`}>
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="font-display text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors duration-300">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="font-display uppercase tracking-widest text-xs text-white/50">[{user.username}]</span>
              <button 
                className="border border-white/30 text-white hover:bg-white hover:text-black transition-colors text-xs py-2 px-4 font-display uppercase tracking-widest" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Profile
              </button>
            </div>
          ) : (
            <div className="flex space-x-4 items-center">
              <button className="font-display text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors" onClick={onLoginClick}>Sign In</button>
              <button className="border border-white/50 text-white hover:bg-white hover:text-black transition-colors text-xs py-2 px-6 uppercase tracking-widest font-display" onClick={onLoginClick}>
                Enter
              </button>
            </div>
          )}
        </div>

        <button
          className="md:hidden flex flex-col space-y-1.5 z-50"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className={`w-8 h-[1px] bg-textMain transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`w-8 h-[1px] bg-textMain transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-8 h-[1px] bg-textMain transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-bgBase z-40 md:hidden flex flex-col justify-center items-center space-y-8 transition-transform duration-700 ease-in-out overflow-hidden ${mobileOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        {user && navLinks.map((link) => (
          <a key={link.label} href={link.href} className="font-display text-4xl uppercase tracking-tighter text-textMain hover:text-outline transition-colors" onClick={() => setMobileOpen(false)}>
            {link.label}
          </a>
        ))}
        <div className="mt-12 flex flex-col items-center space-y-6">
          {user ? (
            <span className="font-display text-xl uppercase tracking-widest text-textMuted">[{user.username}]</span>
          ) : (
            <>
              <button className="font-display text-xl uppercase tracking-widest text-textMuted hover:text-textMain transition-colors" onClick={() => { setMobileOpen(false); onLoginClick(); }}>Sign In</button>
              <button className="btn-nothin" onClick={() => { setMobileOpen(false); onLoginClick(); }}>Enter SuperFan</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
