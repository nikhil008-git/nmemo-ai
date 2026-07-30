/**
 * The "desktop wallpaper" behind every product mockup — a dusk ridgeline with a
 * warm horizon, a cold sky, and heavy grain. Drawn entirely in SVG so the page
 * ships no image asset for it and it stays crisp at any size.
 */
export function Wallpaper({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-full w-full ${className}`}
      viewBox="0 0 1200 750"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#0f1418" />
          <stop offset="34%" stopColor="#1c1d21" />
          <stop offset="58%" stopColor="#3b2a22" />
          <stop offset="74%" stopColor="#7a4526" />
          <stop offset="86%" stopColor="#b9713a" />
          <stop offset="100%" stopColor="#d99a55" />
        </linearGradient>

        <radialGradient id="wp-sun" cx="0.28" cy="0.86" r="0.42">
          <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.95" />
          <stop offset="38%" stopColor="#e8964c" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#e8964c" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="wp-cool" cx="0.82" cy="0.1" r="0.75">
          <stop offset="0%" stopColor="#4a6f86" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4a6f86" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="wp-ridge-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3a34" />
          <stop offset="100%" stopColor="#2e2521" />
        </linearGradient>
        <linearGradient id="wp-ridge-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a221f" />
          <stop offset="100%" stopColor="#191413" />
        </linearGradient>
        <linearGradient id="wp-ridge-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15100f" />
          <stop offset="100%" stopColor="#0b0908" />
        </linearGradient>

        <radialGradient id="wp-vignette" cx="0.5" cy="0.45" r="0.78">
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </radialGradient>

        <filter id="wp-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <filter id="wp-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      {/* sky */}
      <rect width="1200" height="750" fill="url(#wp-sky)" />
      <rect width="1200" height="750" fill="url(#wp-cool)" />

      {/* low cloud banding */}
      <g opacity="0.32" filter="url(#wp-soft)">
        <ellipse cx="880" cy="300" rx="420" ry="42" fill="#8a7b6d" />
        <ellipse cx="330" cy="372" rx="360" ry="30" fill="#a08874" />
        <ellipse cx="700" cy="424" rx="520" ry="26" fill="#c39668" />
      </g>

      {/* sun + haze */}
      <circle cx="336" cy="512" r="46" fill="#ffe2b4" opacity="0.9" />
      <rect width="1200" height="750" fill="url(#wp-sun)" />

      {/* ridgelines, far to near */}
      <path
        d="M0 470 L120 438 L232 466 L336 420 L452 468 L560 436 L684 474 L810 430 L930 470 L1060 442 L1200 478 L1200 750 L0 750 Z"
        fill="url(#wp-ridge-far)"
        opacity="0.85"
      />
      <path
        d="M0 548 L96 520 L206 556 L318 512 L430 552 L548 524 L660 562 L790 522 L906 560 L1030 528 L1200 566 L1200 750 L0 750 Z"
        fill="url(#wp-ridge-mid)"
      />
      <path
        d="M0 632 L140 604 L286 640 L420 606 L560 644 L706 612 L850 648 L1000 616 L1200 652 L1200 750 L0 750 Z"
        fill="url(#wp-ridge-near)"
      />

      {/* valley mist caught between the ridges */}
      <g opacity="0.22" filter="url(#wp-soft)">
        <ellipse cx="420" cy="596" rx="380" ry="22" fill="#e9c79a" />
        <ellipse cx="940" cy="620" rx="300" ry="18" fill="#e9c79a" />
      </g>

      <rect width="1200" height="750" fill="url(#wp-vignette)" />
      <rect
        width="1200"
        height="750"
        filter="url(#wp-grain)"
        opacity="0.14"
        style={{ mixBlendMode: "overlay" }}
      />
    </svg>
  );
}

/** Wallpaper plus the dark scrim the mockups sit on. */
export function WallpaperPlate({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <Wallpaper className="absolute inset-0" />
      <div className="absolute inset-0 bg-[#0b0a09]/35" />
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
