import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Universe } from "../data/universes";
import { universes as fallbackUniverses } from "../data/universes";
import { ApiClient } from "../api/client";

interface UniverseContextType {
  selectedUniverse: Universe;
  setSelectedUniverse: (universe: Universe) => void;
  selectById: (id: string) => void;
  universesList: Universe[];
  isLoading: boolean;
}

const UniverseContext = createContext<UniverseContextType | null>(null);

export function UniverseProvider({ children }: { children: React.ReactNode }) {
  const [universesList, setUniversesList] = useState<Universe[]>(fallbackUniverses);
  const [selectedUniverse, setSelectedUniverse] = useState<Universe>(fallbackUniverses[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchUniverses = async () => {
      const data = await ApiClient.getUniverses();
      if (mounted && data && data.length > 0) {
        setUniversesList(data);
        // Make sure selectedUniverse matches the new data if needed
        const currentId = selectedUniverse.id;
        const matching = data.find((u: Universe) => u.id === currentId);
        if (matching) setSelectedUniverse(matching);
        else setSelectedUniverse(data[0]);
      }
      if (mounted) setIsLoading(false);
    };
    fetchUniverses();
    return () => { mounted = false; };
  }, []); // Intentionally only run once on mount

  const selectById = useCallback((id: string) => {
    let u = universesList.find((u) => u.id === id || u.name === id);
    if (!u) {
      u = {
        id: id,
        name: id,
        category: "Custom",
        tagline: "Your Custom Universe",
        description: `Explore the dynamic world of ${id}.`,
        accent: "#0EA5E9",
        accentSecondary: "#A855F7",
        accentGlow: "rgba(14, 165, 233, 0.3)",
        icon: "div" as any, 
        characters: [],
        gradient: "linear-gradient(135deg, #0c1a2e 0%, #1a0035 50%, #0c1a2e 100%)",
      };
      setUniversesList(prev => {
        if (!prev.find(p => p.id === id)) return [...prev, u!];
        return prev;
      });
    }
    setSelectedUniverse(u);
  }, [universesList]);

  return (
    <UniverseContext.Provider
      value={{ selectedUniverse, setSelectedUniverse, selectById, universesList, isLoading }}
    >
      {children}
    </UniverseContext.Provider>
  );
}

export function useUniverse() {
  const ctx = useContext(UniverseContext);
  if (!ctx)
    throw new Error("useUniverse must be used within UniverseProvider");
  return ctx;
}
