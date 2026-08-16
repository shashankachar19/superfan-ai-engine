import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiClient } from "../../api/client";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function FanAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "[SYS]: Online. How can I assist you with your fandom data?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: `[USER]: ${userMessage}` }]);
    setIsLoading(true);

    try {
      const response = await ApiClient.askFanAssistant(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: `[SYS]: ${response.answer}` }]);
      } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: "assistant", content: "[SYS]: Connection error. Unable to reach neural network." }]);
      } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 right-0 w-[380px] bg-bgSubtle border border-accentBorder p-6 shadow-2xl"
          >
            <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-4 border-b border-accentBorder pb-2">
              SYSTEM ASSISTANT
            </div>
            
            <div className="h-[280px] overflow-y-auto mb-4 font-body text-sm text-textMain flex flex-col gap-3 custom-scrollbar pr-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`${msg.role === 'user' ? 'text-textMuted text-right' : 'text-textMain'}`}>
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="text-textMain animate-pulse">[SYS]: Processing query...</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSubmit} className="relative flex">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="INPUT COMMAND..." 
                className="w-full bg-transparent border border-accentBorder text-textMain text-sm p-3 focus:outline-none focus:border-textMain font-body uppercase placeholder:text-textMuted"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="absolute right-0 top-0 h-full px-4 border-l border-accentBorder font-display text-xs hover:bg-textMain hover:text-bgBase transition-colors disabled:opacity-50"
                disabled={!input.trim() || isLoading}
              >
                SEND
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-bgSubtle border border-accentBorder hover:border-textMain hover:bg-textMain hover:text-bgBase transition-colors flex items-center justify-center font-display text-lg"
      >
        {isOpen ? "×" : "AI"}
      </button>
    </div>
  );
}
