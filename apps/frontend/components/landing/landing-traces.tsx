"use client";

/**
 * Schematic route traces for the landing page.
 * Sharp stepped paths + junction nodes — not the soft single L-curve motif.
 */
export function LandingTraces() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden md:block"
      aria-hidden
    >
      {/* Left rail */}
      <div className="absolute bottom-0 left-[max(0.5rem,calc(50%-37rem))] top-0 w-px">
        <div className="h-full w-px border-l border-dashed border-neutral-300/80" />
        {[12, 28, 44, 58, 72, 86].map((top) => (
          <span
            key={`l-${top}`}
            className="absolute left-0 flex -translate-x-1/2 items-center"
            style={{ top: `${top}%` }}
          >
            <span className="size-1.5 rounded-full bg-neutral-400/70" />
            <span className="h-px w-3 border-t border-dashed border-neutral-300" />
          </span>
        ))}
      </div>

      {/* Right rail — looser dash rhythm */}
      <div className="absolute bottom-0 right-[max(0.5rem,calc(50%-37rem))] top-0 w-px">
        <div
          className="h-full w-px border-l border-dashed border-neutral-200"
          style={{ borderImage: "none" }}
        />
        {[18, 36, 55, 74, 90].map((top) => (
          <span
            key={`r-${top}`}
            className="absolute right-0 flex translate-x-1/2 flex-row-reverse items-center"
            style={{ top: `${top}%` }}
          >
            <span className="size-1 rounded-full bg-neutral-300" />
            <span className="h-px w-2.5 border-t border-dashed border-neutral-200" />
          </span>
        ))}
      </div>

      {/* Hero: open stepped bracket (sharp corners, double-trace, open side) */}
      <svg
        className="absolute left-1/2 top-[4.5rem] w-[min(calc(100%-2rem),72rem)] -translate-x-1/2 text-neutral-300"
        viewBox="0 0 1152 200"
        fill="none"
        preserveAspectRatio="xMidYMin meet"
      >
        {/* Left bracket ┌─ with step */}
        <path
          d="M24 0 V88 H160 V128 H320"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeDasharray="6 7"
          strokeLinejoin="miter"
        />
        <path
          d="M40 0 V76 H148 V116 H300"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeDasharray="2 9"
          opacity="0.5"
          strokeLinejoin="miter"
        />

        {/* Right bracket ─┐ mirrored, open toward center */}
        <path
          d="M1128 0 V88 H992 V128 H832"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeDasharray="6 7"
          strokeLinejoin="miter"
        />
        <path
          d="M1112 0 V76 H1004 V116 H852"
          stroke="currentColor"
          strokeWidth="0.85"
          strokeDasharray="2 9"
          opacity="0.5"
          strokeLinejoin="miter"
        />

        {/* Center bus — incomplete, with a dip (routing step) */}
        <path
          d="M360 128 H480 V160 H672 V128 H792"
          stroke="currentColor"
          strokeWidth="1.05"
          strokeDasharray="5 7"
          strokeLinejoin="miter"
        />

        {[
          [24, 88],
          [160, 88],
          [160, 128],
          [320, 128],
          [480, 128],
          [480, 160],
          [672, 160],
          [672, 128],
          [792, 128],
          [832, 128],
          [992, 128],
          [992, 88],
          [1128, 88],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="2.25"
            className="fill-neutral-400/80"
          />
        ))}

        {/* Registration ticks */}
        <path
          d="M16 0 H32 M24 -6 V6 M1120 0 H1136 M1128 -6 V6"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

/** Stepped dashed divider between landing blocks */
export function TraceDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none relative mx-auto hidden h-11 w-full max-w-6xl px-6 md:block ${className}`}
      aria-hidden
    >
      <svg
        className="h-full w-full text-neutral-300"
        viewBox="0 0 1152 44"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 22 H280 V10 H576 V34 H872 V22 H1152"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 6"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="280" cy="22" r="2" className="fill-neutral-400" />
        <circle cx="576" cy="10" r="2" className="fill-neutral-400" />
        <circle cx="872" cy="34" r="2" className="fill-neutral-400" />
      </svg>
    </div>
  );
}
