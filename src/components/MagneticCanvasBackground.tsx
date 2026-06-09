import { useEffect, useRef } from "react";

/* ─── Particle type ──────────────────────────────────────────────────── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  alpha: number;
  /** Phase offset for gentle bobbing */
  phase: number;
}

/* ─── Config ─────────────────────────────────────────────────────────── */
const CONFIG = {
  count: 110,
  /** Magnetic attraction radius (px) */
  attractRadius: 130,
  /** Max attraction pull strength */
  attractStrength: 0.06,
  /** Return-to-base easing when mouse is gone */
  returnEase: 0.035,
  /** Particle speed range */
  speedMin: 0.08,
  speedMax: 0.28,
  /** Particle size range */
  radiusMin: 1.2,
  radiusMax: 3.4,
  /** Alpha range */
  alphaMin: 0.04,
  alphaMax: 0.18,
  /** Colours sampled from the African palette */
  colors: [
    "hsl(24 65% 55%)",   // Terre de Sienne
    "hsl(18 90% 52%)",   // Soleil Couchant
    "hsl(38 55% 55%)",   // Ocre Savane
    "hsl(158 45% 45%)",  // Forêt Équatoriale
    "hsl(200 55% 50%)",  // Fleuve Congo
  ] as const,
} as const;

/* ─── Helpers ────────────────────────────────────────────────────────── */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const buildParticle = (w: number, h: number): Particle => {
  const speed = rand(CONFIG.speedMin, CONFIG.speedMax);
  const angle = Math.random() * Math.PI * 2;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  return {
    x: rand(0, w),
    y: rand(0, h),
    vx,
    vy,
    baseVx: vx,
    baseVy: vy,
    radius: rand(CONFIG.radiusMin, CONFIG.radiusMax),
    alpha: rand(CONFIG.alphaMin, CONFIG.alphaMax),
    phase: Math.random() * Math.PI * 2,
  };
};

/* ─── Component ──────────────────────────────────────────────────────── */
const MagneticCanvasBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── State shared between handlers & RAF ── */
    let w = window.innerWidth;
    let h = window.innerHeight;
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;
    let rafId = 0;
    let tick = 0;

    /* ── Colour lookup for each particle (stable across frames) ── */
    const colorCount = CONFIG.colors.length;
    const particleColors: string[] = [];

    /* ── Init particles ── */
    const particles: Particle[] = [];

    const init = () => {
      canvas.width = w;
      canvas.height = h;
      particles.length = 0;
      particleColors.length = 0;
      for (let i = 0; i < CONFIG.count; i++) {
        particles.push(buildParticle(w, h));
        particleColors.push(CONFIG.colors[i % colorCount]);
      }
    };

    /* ── Main loop ── */
    const draw = () => {
      tick++;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.attractRadius && dist > 0) {
            /* Attraction falls off linearly with distance */
            const force = (1 - dist / CONFIG.attractRadius) * CONFIG.attractStrength;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            /* Clamp velocity to avoid runaway */
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const maxSpeed = 3.5;
            if (speed > maxSpeed) {
              p.vx = (p.vx / speed) * maxSpeed;
              p.vy = (p.vy / speed) * maxSpeed;
            }
          } else {
            /* Outside attraction radius → ease back to natural drift */
            p.vx += (p.baseVx - p.vx) * CONFIG.returnEase;
            p.vy += (p.baseVy - p.vy) * CONFIG.returnEase;
          }
        } else {
          /* Mouse gone → ease back smoothly */
          p.vx += (p.baseVx - p.vx) * CONFIG.returnEase;
          p.vy += (p.baseVy - p.vy) * CONFIG.returnEase;
        }

        /* Move */
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap edges */
        if (p.x < -p.radius) p.x = w + p.radius;
        else if (p.x > w + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = h + p.radius;
        else if (p.y > h + p.radius) p.y = -p.radius;

        /* Gentle alpha pulse keyed to phase + tick */
        const pulse = Math.sin(p.phase + tick * 0.008) * 0.04;
        const alpha = Math.max(0, Math.min(1, p.alpha + pulse));

        /* Draw */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColors[i];
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };

    /* ── Event handlers ── */
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };
    const onMouseLeave = () => {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    };

    let resizeTimeout = 0;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        w = window.innerWidth;
        h = window.innerHeight;
        init();
      }, 200);
    };

    /* ── Boot ── */
    init();
    draw();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimeout);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -10 }}
    />
  );
};

export default MagneticCanvasBackground;
