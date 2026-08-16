import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AI_CONVERSATIONS = [
  { user: 'StrawHat99', character: 'Luffy', msg: 'Will I find the One Piece?' },
  { character: 'Luffy', user: 'StrawHat99', msg: 'Shishishi! Only if you join my crew and risk it all! Are you ready for an adventure?!' },
  { user: 'JediMaster', character: 'Obi-Wan', msg: 'Hello there.' },
  { character: 'Obi-Wan', user: 'JediMaster', msg: 'General Kenobi... wait, that is my line. How can the Force guide you today?' },
  { user: 'StarkTech', character: 'Iron Man', msg: 'Analyze my new arc reactor design.' },
  { character: 'Iron Man', user: 'StarkTech', msg: 'Running diagnostics... Energy output is optimal, but you need to stabilize the palladium core.' },
];

export default function LiveChatFeed() {
  const [messages, setMessages] = useState<typeof AI_CONVERSATIONS>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const nextMessage = () => {
      if (i >= AI_CONVERSATIONS.length) {
        i = 0; // Loop conversation
        setMessages([]);
      }

      const msg = AI_CONVERSATIONS[i];
      setIsTyping(true);

      // Simulate typing delay based on message length
      const delay = Math.max(800, msg.msg.length * 30);
      
      timeout = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, msg]);
        i++;
        
        // Wait a bit before next message
        timeout = setTimeout(nextMessage, 1500);
      }, delay);
    };

    nextMessage();

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="w-full h-full max-h-[400px] border border-accentBorder bg-bgSubtle/50 backdrop-blur-md rounded-xl p-6 flex flex-col relative overflow-hidden group">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyberCyan to-neonPurple opacity-50" />
      
      <div className="flex justify-between items-center mb-6 border-b border-accentBorder pb-4">
        <div className="font-display text-[10px] tracking-widest text-textMuted uppercase flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyberCyan animate-pulse" />
          Live Synapse Stream
        </div>
        <div className="font-display text-[10px] tracking-widest text-textMuted uppercase">
          Neural Link: ACTIVE
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-4 scroll-smooth scrollbar-none">
        <AnimatePresence>
          {messages.map((m, idx) => {
            const isAI = m.character !== undefined && m.user !== undefined && m.character === m.character; // simplified check
            // Actually, if it's the character responding, it's AI.
            const isChar = AI_CONVERSATIONS.findIndex(c => c === m) % 2 !== 0;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col max-w-[80%] ${isChar ? 'mr-auto' : 'ml-auto items-end'}`}
              >
                <span className="font-display text-[10px] uppercase tracking-widest text-textMuted mb-1">
                  {isChar ? m.character : m.user}
                </span>
                <div className={`p-3 rounded-lg font-body text-sm ${
                  isChar 
                  ? 'bg-accentBorder/50 text-textMain border border-accentBorder rounded-tl-none' 
                  : 'bg-cyberCyan/10 text-cyberCyan border border-cyberCyan/30 rounded-tr-none'
                }`}>
                  {m.msg}
                </div>
              </motion.div>
            );
          })}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mr-auto flex flex-col"
            >
              <span className="font-display text-[10px] uppercase tracking-widest text-textMuted mb-1">
                System
              </span>
              <div className="p-3 bg-accentBorder/30 rounded-lg rounded-tl-none border border-accentBorder/50 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-textMuted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-accentBorder relative">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-bgSubtle to-transparent z-10" />
        <div className="font-body text-xs text-textMuted flex items-center justify-between opacity-50">
          <span>Connection Secure</span>
          <span>Latency: 12ms</span>
        </div>
      </div>
    </div>
  );
}
