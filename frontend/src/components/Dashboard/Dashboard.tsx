import React, { useState, useEffect } from "react";
import { useUniverse } from "../../context/UniverseContext";
import { ApiClient } from "../../api/client";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const { universesList, selectedUniverse, selectById } = useUniverse();
  const [memorySummary, setMemorySummary] = useState<string | null>(null);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const loadMemories = async () => {
        const [memRes, sumRes] = await Promise.all([
          ApiClient.getMemories(user._id),
          ApiClient.getJourneySummary(user._id)
        ]);
        setRecentMemories(memRes.preferences || []);
        setMemorySummary(sumRes.summary || "Your fandom journey awaits...");
      };
      loadMemories();
    }
  }, [user]);

  if (!user) return null;

  // Compute progress to next level (mock logic)
  const xp = user.xp || 0;
  const nextLevelXp = 2000;
  const progressPercent = Math.min(100, Math.max(0, (xp / nextLevelXp) * 100));

  return (
    <section className="pt-48 pb-32 px-page min-h-screen bg-bgBase text-textMain relative">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start border-b border-accentBorder pb-16 mb-16">
          <div>
            <div className="font-display text-xs tracking-widest text-textMuted uppercase mb-8">
              03 / User Protocol
            </div>
            <h1 className="font-display text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-none mb-4">
              USER <br/><span className="text-outline">{user.username}</span>
            </h1>
          </div>
          
          <div className="mt-8 md:mt-0 flex flex-col items-end">
            <button 
              onClick={onLogout}
              className="font-display text-xs uppercase tracking-widest text-textMuted hover:text-textMain transition-colors mb-8"
            >
              [ Terminate Session ]
            </button>
            <div className="text-right">
              <div className="font-display text-4xl uppercase tracking-tighter mb-2">
                LEVEL: <span className="text-outline">{user.fan_level || "FAN"}</span>
              </div>
              <div className="font-body text-textMuted text-sm tracking-widest mb-4">
                XP: {xp} / {nextLevelXp}
              </div>
              {/* Minimalist Progress Bar */}
              <div className="w-64 h-[1px] bg-accentBorder relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-textMain transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <div>
            <h3 className="font-display text-2xl uppercase tracking-tight mb-12 border-b border-accentBorder pb-4">
              Active Fandoms
            </h3>
            <div className="space-y-6">
              {(user.favorite_universes || []).map((uId: string) => {
                const u = universesList.find(un => un.id === uId);
                return u ? (
                  <div 
                    key={u.id} 
                    onClick={() => selectById(u.id)}
                    className={`group flex items-center justify-between border-b border-accentBorder/30 pb-4 hover:border-textMain transition-colors cursor-pointer ${selectedUniverse.id === u.id ? 'border-textMain/50 bg-white/5' : ''}`}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="font-display text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                        {React.createElement(u.icon as any, { size: 24 })}
                      </div>
                      <span className="font-display text-xl uppercase tracking-wider group-hover:pl-4 transition-all duration-300">{u.name}</span>
                    </div>
                    <span className="font-display text-xs tracking-widest text-textMuted uppercase group-hover:text-textMain transition-colors">
                      {selectedUniverse.id === u.id ? "Active" : "Enter →"}
                    </span>
                  </div>
                ) : null;
              })}
              {(!user.favorite_universes || user.favorite_universes.length === 0) && (
                <p className="font-body text-textMuted text-sm">No universes synchronized. Begin exploration.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl uppercase tracking-tight mb-12 border-b border-accentBorder pb-4 flex items-center justify-between">
              <span>Fan Memory Core</span>
              <span className="text-xs text-textMuted tracking-widest">Neural Link Active</span>
            </h3>
            
            <div className="mb-12 border border-accentBorder p-6 bg-bgBase hover:border-textMain transition-colors">
              <div className="font-display text-[10px] tracking-widest text-textMuted uppercase mb-4 border-l border-textMain pl-3">
                AI Journey Analysis
              </div>
              <p className="font-body text-sm leading-relaxed text-textMain/90 italic">
                {memorySummary ? `"${memorySummary}"` : "Analyzing neural pathways..."}
              </p>
            </div>

            <ul className="space-y-6">
              {recentMemories.length > 0 ? recentMemories.slice(0, 5).map((mem, i) => (
                <li key={i} className="flex flex-col space-y-2 border-l border-accentBorder pl-6 hover:border-textMain transition-colors group">
                  <span className="font-display text-xs tracking-widest text-textMuted uppercase group-hover:text-textMain transition-colors">
                    [{mem.type}] — {mem.universe || "Global"}
                  </span>
                  <span className="font-body text-sm text-textMain/80">
                    {mem.value}
                  </span>
                </li>
              )) : (
                <li className="font-body text-textMuted text-sm">No memory fragments recorded yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
