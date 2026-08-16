import { useMousePosition } from "./useMousePosition";

export function useParallax(strength: number = 20) {
  const mouse = useMousePosition();
  return {
    x: mouse.normalizedX * strength,
    y: mouse.normalizedY * strength,
    mouse,
  };
}
