/**
 * NoiseOverlay — Grain de film fractal ultra-subtil.
 * SVG feTurbulence encodé en data URI — aucune requête réseau, 0 dépendance.
 * Fixed sur tout l'écran, pointer-events-none, mix-blend-overlay.
 *
 * NOTE: The encoded SVG is computed once at module scope to avoid
 * re-running btoa() on every render.
 */

const SVG_NOISE = `
  <svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
    <filter id='n'>
      <feTurbulence
        type='fractalNoise'
        baseFrequency='0.75'
        numOctaves='4'
        stitchTiles='stitch'
      />
    </filter>
    <rect width='300' height='300' filter='url(#n)' opacity='1'/>
  </svg>
`;

const NOISE_URI = `data:image/svg+xml;base64,${btoa(SVG_NOISE)}`;

const STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  pointerEvents: "none",
  opacity: 0.035,
  mixBlendMode: "overlay",
  backgroundImage: `url("${NOISE_URI}")`,
  backgroundRepeat: "repeat",
  backgroundSize: "300px 300px",
};

const NoiseOverlay = () => (
  <div aria-hidden="true" style={STYLE} />
);

export default NoiseOverlay;
