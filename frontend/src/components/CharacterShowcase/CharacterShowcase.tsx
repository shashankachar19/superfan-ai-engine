import React, { useState, useRef, useEffect } from "react";
import { characters, getCharactersByUniverse } from "../../data/characters";
import { getUniverseById } from "../../data/universes";
import { useUniverse } from "../../context/UniverseContext";
import { ApiClient } from "../../api/client";
import { User } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CharacterShowcase({ user }: { user?: any }) {
  const { selectedUniverse } = useUniverse();
  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(`superfan_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [activeChar, setActiveChar] = useState<string | null>(getInitialState("activeChar", null));
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [customCharacters, setCustomCharacters] = useState<any[]>(getInitialState("custom_chars", []));
  const [deletedChars, setDeletedChars] = useState<string[]>(getInitialState("deleted_chars", []));
  const [isCreating, setIsCreating] = useState(false);
  const [newCharName, setNewCharName] = useState("");
  const [newCharRole, setNewCharRole] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const universeChars = getCharactersByUniverse(selectedUniverse.id);
  let defaultChars = universeChars.length > 0 ? universeChars : characters.slice(0, 4);

  // If the user has favorite characters in their profile, prioritize showing those!
  if (user && user.favorite_characters && user.favorite_characters.length > 0) {
    const userFavs = universeChars.filter(c => user.favorite_characters.includes(c.id.toLowerCase()) || user.favorite_characters.includes(c.name.toLowerCase()));
    if (userFavs.length > 0) {
      // If we found their favorites for THIS universe, use them. 
      defaultChars = userFavs;
    }
  }

  const allShowChars = [...defaultChars, ...customCharacters].filter(c => !deletedChars.includes(c.id));
  const currentChar = allShowChars.find((c) => c.id === activeChar) || allShowChars[0];

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    localStorage.setItem("superfan_custom_chars", JSON.stringify(customCharacters));
  }, [customCharacters]);

  useEffect(() => {
    localStorage.setItem("superfan_deleted_chars", JSON.stringify(deletedChars));
  }, [deletedChars]);

  useEffect(() => {
    if (activeChar) {
      localStorage.setItem("superfan_activeChar", JSON.stringify(activeChar));
      
      // Load history for this specific character
      const loadHistory = async () => {
        const history = await ApiClient.getChatHistory(activeChar);
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          const char = allShowChars.find((c) => c.id === activeChar);
          if (char) {
            setMessages([{ role: "ai", text: char.greeting }]);
          }
        }
      };
      loadHistory();
    }
  }, [activeChar]);

  useEffect(() => {
    if (!containerRef.current) return;

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
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSelectChar = (id: string) => {
    setIsCreating(false);
    setActiveChar(id);
    // Messages will be updated by the useEffect listening to activeChar
  };

  const handleDeleteChar = (id: string) => {
    if (customCharacters.some(c => c.id === id)) {
      setCustomCharacters(prev => prev.filter(c => c.id !== id));
    } else {
      setDeletedChars(prev => [...prev, id]);
    }
    
    // Switch to another character if possible
    const remaining = allShowChars.filter(c => c.id !== id);
    if (remaining.length > 0) {
      setActiveChar(remaining[0].id);
    } else {
      setActiveChar(null);
      setIsCreating(true);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim() || !newCharRole.trim()) return;

    const newChar = {
      id: `custom_${Date.now()}`,
      name: newCharName.trim(),
      role: newCharRole.trim(),
      universe_id: selectedUniverse.id,
      greeting: `(As ${newCharName.trim()}) I have synchronized. Awaiting input.`,
      responses: {
        "Who are you?": `I am ${newCharName.trim()}, ${newCharRole.trim()}.`
      }
    };

    setCustomCharacters([...customCharacters, newChar]);
    setNewCharName("");
    setNewCharRole("");
    handleSelectChar(newChar.id);
  };

  const handleSend = async () => {
    if (!input.trim() || !currentChar) return;
    const userMsg = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(newMessages);
    setTyping(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.text
      }));
      
      const charUniverse = getUniverseById(currentChar.universe || currentChar.universe_id);
      const universeName = charUniverse ? charUniverse.name : selectedUniverse.name;
      
      const response = await ApiClient.chatWithCharacter(
        currentChar.name, 
        universeName, 
        userMsg, 
        history
      );
      
      const updatedMessages = [...newMessages, { role: "ai" as const, text: response.response }];
      setMessages(updatedMessages);
      
      // Save the updated history to the backend / partitioned local storage
      await ApiClient.saveChatHistory(currentChar.id, updatedMessages);
      
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: "ai", text: "(Connection lost. I can't hear you!)" }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section ref={containerRef} className="py-32 px-page min-h-screen bg-bgBase text-textMain" id="characters">
      <div className="max-w-[1800px] mx-auto mb-24 flex flex-col md:flex-row justify-between items-start">
        <div className="max-w-2xl">
          <div className="font-display text-xs tracking-[0.3em] text-textMuted mb-8 uppercase border-l border-accentBorder pl-4">04 / Character Protocol</div>
          <h2 ref={headingRef} className="font-display text-[10vw] md:text-[6vw] font-black uppercase tracking-tighter leading-[0.9] mb-6">
            {["SYNCHRONIZE", "ENTITIES"].map((word, i) => (
              <span key={i} className="overflow-hidden block">
                <span className="word block">{word}</span>
              </span>
            ))}
          </h2>
          <p className="font-body text-textMuted max-w-md text-lg leading-relaxed">
            Establish a direct neural link with entities from the {selectedUniverse.name} universe.
          </p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-12 h-[70vh]">
        {/* Character Selection */}
        <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-4 custom-scrollbar">
          {allShowChars.map((char) => {
            const isActive = char.id === (activeChar || allShowChars[0].id) && !isCreating;
            return (
              <div
                key={char.id}
                className={`group cursor-none border p-6 transition-all duration-300 ${isActive ? 'border-textMain bg-textMain/5' : 'border-accentBorder hover:border-textMuted'}`}
                onClick={() => handleSelectChar(char.id)}
              >
                <div className="flex items-center gap-6">
                  <div className="text-textMuted group-hover:text-textMain transition-colors duration-300">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl uppercase tracking-tighter mb-1">{char.name}</h3>
                    <p className="font-body text-xs text-textMuted uppercase tracking-widest">{char.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          <button 
            className={`border p-6 font-display text-xs tracking-widest uppercase transition-all duration-300 ${isCreating ? 'border-textMain bg-textMain text-bgBase' : 'border-accentBorder text-textMuted hover:border-textMain hover:text-textMain'}`}
            onClick={() => setIsCreating(true)}
          >
            [ + INITIALIZE CUSTOM ENTITY ]
          </button>
        </div>

        {/* Chat Terminal / Create Form */}
        <div className="lg:w-2/3 border border-accentBorder flex flex-col h-full bg-bgSubtle relative overflow-hidden">
          {isCreating ? (
            <div className="p-12 flex flex-col h-full justify-center">
               <h3 className="font-display text-4xl uppercase tracking-tighter mb-4">Initialize Custom Entity</h3>
               <p className="font-body text-textMuted mb-12">Define a new character from the {selectedUniverse.name} universe to synchronize with.</p>
               
               <form onSubmit={handleCreateSubmit} className="space-y-8 max-w-md">
                 <div className="space-y-2 group">
                    <label className="font-display text-xs tracking-widest text-textMuted uppercase group-focus-within:text-textMain transition-colors">
                      Entity Name
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={newCharName} 
                      onChange={e => setNewCharName(e.target.value)} 
                      className="w-full bg-transparent border-b border-accentBorder p-2 text-xl font-display focus:outline-none focus:border-textMain transition-colors placeholder:text-accentBorder"
                      placeholder="e.g. Shanks"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="font-display text-xs tracking-widest text-textMuted uppercase group-focus-within:text-textMain transition-colors">
                      Entity Role
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={newCharRole} 
                      onChange={e => setNewCharRole(e.target.value)} 
                      className="w-full bg-transparent border-b border-accentBorder p-2 text-xl font-display focus:outline-none focus:border-textMain transition-colors placeholder:text-accentBorder"
                      placeholder="e.g. Emperor of the Sea"
                    />
                  </div>
                  <button type="submit" className="btn-nothin w-full mt-8">INITIALIZE CONNECTION</button>
               </form>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-accentBorder p-6 flex justify-between items-center bg-bgBase">
                <div className="flex items-center gap-4">
                  <div className="text-textMuted">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl uppercase tracking-tighter">{currentChar?.name}</h3>
                    <p className="font-body text-xs text-textMuted uppercase tracking-widest">Active Connection</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-textMain animate-pulse" />
                    <span className="font-display text-xs uppercase tracking-widest text-textMuted">Live</span>
                  </div>
                  {currentChar && (
                    <button 
                      onClick={() => handleDeleteChar(currentChar.id)}
                      className="font-display text-[10px] uppercase tracking-widest border border-red-500/30 text-red-500/50 hover:text-red-500 hover:border-red-500 px-3 py-1 transition-colors"
                      title="End synchronization and remove entity"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <div className="mb-6 text-textMuted">
                      <User size={64} />
                    </div>
                    <p className="font-display text-xl uppercase tracking-widest mb-8">Awaiting input sequence...</p>
                    <div className="flex gap-4 flex-wrap justify-center">
                      {Object.keys(currentChar?.responses || {}).slice(0, 3).map((key) => (
                        <button
                          key={key}
                          className="border border-accentBorder px-4 py-2 font-display text-xs uppercase tracking-widest hover:border-textMain transition-colors"
                          onClick={() => setInput(`Tell me about ${key}`)}
                        >
                          [{key}]
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className="font-display text-[10px] uppercase tracking-widest text-textMuted mb-2">
                          {msg.role === 'user' ? 'USER_INPUT' : 'ENTITY_RESPONSE'}
                        </div>
                        <div className={`font-body text-lg leading-relaxed ${msg.role === 'user' ? 'text-textMuted' : 'text-textMain'}`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {typing && (
                  <div className="flex w-full justify-start">
                    <div className="max-w-[70%] text-left">
                      <div className="font-display text-[10px] uppercase tracking-widest text-textMuted mb-2">
                        ENTITY_PROCESSING
                      </div>
                      <div className="font-display text-lg tracking-widest text-textMain animate-pulse">
                        ...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-accentBorder p-6 bg-bgBase">
                <div className="flex items-end gap-4">
                  <span className="font-display text-textMuted text-xl leading-none select-none">{'>'}</span>
                  <textarea
                    className="flex-1 bg-transparent border-none outline-none font-body text-lg resize-none max-h-32 placeholder:text-accentBorder"
                    placeholder="Initiate transmission..."
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    className="font-display text-xs uppercase tracking-widest border border-accentBorder px-6 py-3 hover:bg-textMain hover:text-bgBase transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-textMain"
                    onClick={handleSend}
                    disabled={!input.trim() || typing}
                  >
                    Transmit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
