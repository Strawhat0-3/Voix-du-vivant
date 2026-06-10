import { useState, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─── Config ─────────────────────────────────────────────────────────── */
const MAX_CLAPS = 50;
const LS_PREFIX = "vva_claps_";

/* ─── Types ──────────────────────────────────────────────────────────── */
interface ClapButtonProps {
  /** The content ID (article or podcast UUID) */
  contentId: string;
  contentType: "article" | "podcast";
  className?: string;
}

interface FloatingClap {
  id: number;
  value: number;
}

/* ─── localStorage helpers ───────────────────────────────────────────── */
const getStoredClaps = (key: string): number => {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
};

const setStoredClaps = (key: string, value: number) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* localStorage full or disabled — graceful degradation */
  }
};

/* ─── Clap Icon (SVG inline — no dependency) ─────────────────────────── */
const ClapIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* Stylized hands clapping */}
    <path d="M12 2.5c.5 0 1 .5 1 1v5" />
    <path d="M8.5 5c.3-.5.9-.6 1.3-.3l3 3" />
    <path d="M15.5 5c-.3-.5-.9-.6-1.3-.3l-3 3" />
    <path d="M6 9c.3-.5.8-.7 1.2-.4l4 3.5" />
    <path d="M18 9c-.3-.5-.8-.7-1.2-.4l-4 3.5" />
    <path d="M7 13.5c-.4.3-.5.8-.2 1.2l3 4.5c1 1.5 3.4 2 4.8.6l2.5-2.5c1-1 1.3-2.5.6-3.8l-2-4" />
    <path d="M17 13.5c.4.3.5.8.2 1.2l-1 1.5" />
  </svg>
);

/* ─── Floating +N animation ──────────────────────────────────────────── */
const FloatingNumber = ({ value, onDone }: { value: number; onDone: () => void }) => (
  <motion.span
    key={value}
    initial={{ opacity: 1, y: 0, scale: 0.6 }}
    animate={{ opacity: 0, y: -40, scale: 1.2 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    onAnimationComplete={onDone}
    className="absolute -top-2 left-1/2 -translate-x-1/2 font-serif font-bold text-sm text-highlight pointer-events-none select-none"
    aria-hidden="true"
  >
    +{value}
  </motion.span>
);

/* ─── Main Component ─────────────────────────────────────────────────── */
const ClapButton = ({ contentId, contentType, className }: ClapButtonProps) => {
  const lsKey = `${LS_PREFIX}${contentType}_${contentId}`;
  const [userClaps, setUserClaps] = useState(() => getStoredClaps(lsKey));
  const [floats, setFloats] = useState<FloatingClap[]>([]);
  const [counter, setCounter] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const descId = useId();

  // Sync userClaps to localStorage
  useEffect(() => {
    setStoredClaps(lsKey, userClaps);
  }, [userClaps, lsKey]);

  const atLimit = userClaps >= MAX_CLAPS;

  const handleClap = useCallback(() => {
    if (atLimit) return;
    const newClaps = Math.min(userClaps + 1, MAX_CLAPS);
    setUserClaps(newClaps);
    setCounter((c) => c + 1);
    setFloats((prev) => [...prev, { id: Date.now() + Math.random(), value: 1 }]);
  }, [userClaps, atLimit]);

  const removeFloat = useCallback((id: number) => {
    setFloats((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        className
      )}
    >
      {/* Button container — relative for floating numbers */}
      <div className="relative">
        {/* Floating +1 animations */}
        <AnimatePresence>
          {floats.map((f) => (
            <FloatingNumber
              key={f.id}
              value={f.value}
              onDone={() => removeFloat(f.id)}
            />
          ))}
        </AnimatePresence>

        {/* Clap button */}
        <motion.button
          onClick={handleClap}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          whileTap={{ scale: 0.9 }}
          disabled={atLimit}
          className={cn(
            "group relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-[border-color,background] duration-300 outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            atLimit
              ? "border-border/40 bg-muted/50 cursor-default"
              : "border-highlight/30 bg-card hover:bg-highlight/10 hover:border-highlight/60 active:bg-highlight/20"
          )}
          aria-label={
            atLimit
              ? `Vous avez donné ${userClaps} applaudissements`
              : `Applaudir (${userClaps}/${MAX_CLAPS})`
          }
          aria-describedby={descId}
          aria-pressed={userClaps > 0}
        >
          {/* Ring burst effect on press */}
          {isPressed && !atLimit && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full border-2 border-highlight/50"
              aria-hidden="true"
            />
          )}

          <ClapIcon
            className={cn(
              "w-6 h-6 transition-colors duration-200",
              userClaps > 0
                ? "text-highlight"
                : "text-muted-foreground group-hover:text-highlight"
            )}
          />
        </motion.button>
      </div>

      {/* Count label */}
      <div className="flex flex-col items-center gap-0.5">
        <motion.span
          key={userClaps}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "text-sm font-semibold tabular-nums",
            userClaps > 0 ? "text-highlight" : "text-muted-foreground"
          )}
        >
          {userClaps}
        </motion.span>
        <span
          id={descId}
          className="text-[10px] text-muted-foreground/50 uppercase tracking-wider"
        >
          {atLimit ? "Merci !" : userClaps === 0 ? "Applaudir" : `/ ${MAX_CLAPS}`}
        </span>
      </div>
    </div>
  );
};

export default ClapButton;
