import { useState, useEffect } from "react";

/**
 * Hook to detect user's preference for reduced motion.
 * Respects the prefers-reduced-motion media query for accessibility.
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check on initial render
    if (typeof window === "undefined") return false;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

export default useReducedMotion;
