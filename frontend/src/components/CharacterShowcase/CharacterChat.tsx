// CharacterChat is essentially a modal version of the showcase.
// We can apply the exact same minimal style.

import React, { useState, useRef, useEffect } from "react";
import { ApiClient } from "../../api/client";

interface CharacterChatProps {
  character: any;
  universe: any;
  onClose: () => void;
}

interface Message {
  role: "user" | "character";
  content: string;
}

export default function CharacterChat({ character, universe, onClose }: CharacterChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "character", content: character.greeting }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ApiClient.chatWithCharacter(
        character.name,
        universe.name,
        userMessage.content,
        messages.map(m => ({ role: m.role === "user" ? "user" : "model", content: m.content }))
      );

      setMessages(prev => [...prev, { role: "character", content: response.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "character", content: "(Connection lost. I can't hear you!)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-bgBase/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12 cursor-none">
      <div 
        className="w-full max-w-4xl h-full max-h-[80vh] border border-accentBorder bg-bgBase flex flex-col cursor-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="border-b border-accentBorder p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl filter grayscale">{character.emoji}</span>
            <div>
              <h3 className="font-display text-xl uppercase tracking-tighter">{character.name}</h3>
              <p className="font-body text-xs text-textMuted uppercase tracking-widest">{character.role} • {universe.name}</p>
            </div>
          </div>
          <button 
            className="font-display text-xs uppercase tracking-widest text-textMuted hover:text-textMain transition-colors"
            onClick={onClose}
          >
            [ Close ]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className="font-display text-[10px] uppercase tracking-widest text-textMuted mb-2">
                  {msg.role === 'user' ? 'USER_INPUT' : 'ENTITY_RESPONSE'}
                </div>
                <div className={`font-body text-lg leading-relaxed ${msg.role === 'user' ? 'text-textMuted' : 'text-textMain'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
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
          <div ref={messagesEndRef} />
        </div>

        <form className="border-t border-accentBorder p-6 bg-bgBase flex items-end gap-4" onSubmit={handleSend}>
          <span className="font-display text-textMuted text-xl leading-none select-none">{'>'}</span>
          <input 
            type="text" 
            className="flex-1 bg-transparent border-none outline-none font-body text-lg placeholder:text-accentBorder"
            placeholder={`Initiate transmission to ${character.name}...`} 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className="font-display text-xs uppercase tracking-widest hover:text-textMuted transition-colors disabled:opacity-30"
          >
            Transmit
          </button>
        </form>
      </div>
    </div>
  );
}
