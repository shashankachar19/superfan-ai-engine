import { useState, useEffect, useRef } from "react";

export interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useMousePosition(): MousePosition {
  const [mouse, setMouse] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const frameRef = useRef<number>(0);
  const pendingRef = useRef<MousePosition | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pendingRef.current = {
        x: e.clientX,
        y: e.clientY,
        normalizedX: nx,
        normalizedY: ny,
      };

      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(() => {
          if (pendingRef.current) setMouse(pendingRef.current);
          frameRef.current = 0;
        });
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return mouse;
}
