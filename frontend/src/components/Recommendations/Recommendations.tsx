import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUniverse } from "../../context/UniverseContext";
import { ApiClient } from "../../api/client";
import { Film, Tv, Gift, Palette } from "lucide-react";

interface RecommendationsProps {
  onClose: () => void;
}

interface RecItem {
  title: string;
  description: string;
  reason: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  movies: Film,
  episodes: Tv,
  merchandise: Gift,
  fan_content: Palette,
};

const CATEGORY_LABELS: Record<string, string> = {
  movies: "Movies & Films",
  episodes: "Must-Watch Episodes",
  merchandise: "Merchandise",
  fan_content: "Fan Content",
};

export default function Recommendations({ onClose }: RecommendationsProps) {
  const { selectedUniverse } = useUniverse();
  const [recommendations, setRecommendations] = useState<Record<string, RecItem[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("movies");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const loadRecs = async () => {
      setIsLoading(true);
      try {
        const data = await ApiClient.getRecommendations(selectedUniverse.name);
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecs();
  }, [selectedUniverse.name]);

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="fixed inset-0 z-[100] bg-bgBase/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[85vh] border border-accentBorder bg-bgBase flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-accentBorder p-6 flex justify-between items-center">
          <div>
            <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-1">
              Recommendation Engine
            </div>
            <h3 className="font-display text-xl uppercase tracking-tight">
              CURATED FOR — {selectedUniverse.name}
            </h3>
          </div>
          <button className="font-display text-xs uppercase tracking-widest text-textMuted hover:text-textMain transition-colors" onClick={onClose}>
            [ Close ]
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-accentBorder flex">
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 py-4 font-display text-xs uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2 ${
                  activeCategory === cat
                    ? "border-textMain text-textMain"
                    : "border-transparent text-textMuted hover:text-textMain"
                }`}
              >
                {React.createElement(Icon as any, { size: 16 })} {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
              <div className="w-8 h-8 border-2 border-textMain border-t-transparent rounded-full animate-spin" />
              <p className="font-display text-xs uppercase tracking-widest text-textMuted animate-pulse">
                Analyzing your fandom profile...
              </p>
            </div>
          ) : recommendations ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {(recommendations[activeCategory] || []).map((item: RecItem, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border border-accentBorder p-6 hover:border-textMain transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-display text-lg uppercase tracking-tight group-hover:pl-2 transition-all">
                        {item.title}
                      </h4>
                      <span className="font-display text-xs text-textMuted">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <p className="font-body text-sm text-textMuted mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 border-t border-accentBorder pt-3">
                      <span className="font-display text-[10px] tracking-widest text-textMuted uppercase">
                        Why:
                      </span>
                      <span className="font-body text-xs text-textMain">
                        {item.reason}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="font-body text-textMuted text-center py-20">
              No recommendations available. Try selecting a different universe.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
