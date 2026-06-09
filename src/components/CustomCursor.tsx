import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * CustomCursor — Orbe ocre qui suit la souris avec spring physics.
 * - État "default" : petit cercle (20px) semi-transparent
 * - État "hover" : grand cercle (48px) en mix-blend-difference
 * Masqué sur mobile / coarse pointer. SSR-safe.
 */

/** Check once at module load whether we have a fine pointer */
const IS_FINE_POINTER =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHover, setIsHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Stable callbacks — no dependency on isVisible to avoid listener churn
  const onMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  }, []);

  const onEnterInteractive = useCallback((e: Event) => {
    const el = e.target as HTMLElement;
    if (el.closest?.("a, button, [role='button'], label, [tabindex]")) {
      setIsHover(true);
    }
  }, []);

  const onLeaveInteractive = useCallback(() => setIsHover(false), []);
  const onLeave = useCallback(() => setIsVisible(false), []);
  const onEnter = useCallback(() => setIsVisible(true), []);

  useEffect(() => {
    if (!IS_FINE_POINTER) return;

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onEnterInteractive, { passive: true });
    document.addEventListener("mouseout", onLeaveInteractive, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnterInteractive);
      document.removeEventListener("mouseout", onLeaveInteractive);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [onMove, onEnterInteractive, onLeaveInteractive, onLeave, onEnter]);

  // Don't render on touch devices
  if (!IS_FINE_POINTER) return null;

  const size = isHover ? 48 : 20;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[99999]"
      animate={{
        x: pos.x - size / 2,
        y: pos.y - size / 2,
        opacity: isVisible ? 1 : 0,
        width: size,
        height: size,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.5,
        opacity: { duration: 0.15 },
      }}
      style={{
        borderRadius: "50%",
        background: isHover ? "white" : "hsl(18 90% 52% / 0.75)",
        mixBlendMode: isHover ? "difference" : "normal",
        border: isHover ? "none" : "1.5px solid hsl(18 90% 52% / 0.4)",
        willChange: "transform",
      }}
    />
  );
};

export default CustomCursor;
