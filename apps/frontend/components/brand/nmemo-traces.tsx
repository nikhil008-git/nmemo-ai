"use client";

import { cn } from "@/lib/utils";

const STROKE = {
  main: "6 7",
  fine: "4 6",
  ghost: "2 9",
} as const;

type TraceVariant = "landing" | "auth" | "docs" | "app";

function TraceNode({
  cx,
  cy,
  r = 2.25,
  className,
}: {
  cx: number;
  cy: number;
  r?: number;
  className?: string;
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      className={cn("fill-neutral-400/80", className)}
    />
  );
}

/** Stepped dashed divider between sections */
export function TraceDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative mx-auto hidden h-11 w-full max-w-6xl px-6 md:block",
        className,
      )}
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
          strokeDasharray={STROKE.fine}
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
        <TraceNode cx={280} cy={22} r={2} className="fill-neutral-400" />
        <TraceNode cx={576} cy={10} r={2} className="fill-neutral-400" />
        <TraceNode cx={872} cy={34} r={2} className="fill-neutral-400" />
      </svg>
    </div>
  );
}

/** Compact horizontal trace — fits under headers, tabs, form titles */
export function TraceRule({
  className,
  wide = false,
}: {
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none h-6 w-full",
        wide ? "max-w-none" : "max-w-xs",
        className,
      )}
      aria-hidden
    >
      <svg
        className="h-full w-full text-neutral-300"
        viewBox="0 0 320 24"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 12 H72 V4 H160 V20 H248 V12 H320"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={STROKE.fine}
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
        <TraceNode cx={72} cy={12} r={1.75} />
        <TraceNode cx={160} cy={4} r={1.75} />
        <TraceNode cx={248} cy={20} r={1.75} />
      </svg>
    </div>
  );
}

/** Corner bracket motif — frames cards, forms, panels */
export function TraceBracket({
  corner = "tl",
  className,
  size = 64,
}: {
  corner?: "tl" | "tr" | "bl" | "br";
  className?: string;
  size?: number;
}) {
  const paths = {
    tl: "M0 28 H20 V0 H52",
    tr: "M52 28 H32 V0 H0",
    bl: "M0 24 H20 V52 H52",
    br: "M52 24 H32 V52 H0",
  } as const;

  const nodes: Record<typeof corner, [number, number][]> = {
    tl: [
      [0, 28],
      [20, 28],
      [20, 0],
      [52, 0],
    ],
    tr: [
      [52, 28],
      [32, 28],
      [32, 0],
      [0, 0],
    ],
    bl: [
      [0, 24],
      [20, 24],
      [20, 52],
      [52, 52],
    ],
    br: [
      [52, 24],
      [32, 24],
      [32, 52],
      [0, 52],
    ],
  };

  return (
    <svg
      className={cn("text-neutral-300", className)}
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      aria-hidden
    >
      <path
        d={paths[corner]}
        stroke="currentColor"
        strokeWidth="1.1"
        strokeDasharray={STROKE.main}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      {nodes[corner].map(([cx, cy]) => (
        <TraceNode key={`${corner}-${cx}-${cy}`} cx={cx} cy={cy} r={2} />
      ))}
    </svg>
  );
}

/** Vertical side rails with junction ticks */
export function TraceRails({
  side = "both",
  className,
}: {
  side?: "both" | "left" | "right";
  className?: string;
}) {
  const leftTicks = [12, 28, 44, 58, 72, 86];
  const rightTicks = [18, 36, 55, 74, 90];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {(side === "both" || side === "left") && (
        <div className="absolute bottom-0 left-[max(0.5rem,calc(50%-37rem))] top-0 w-px">
          <div className="h-full w-px border-l border-dashed border-neutral-300/80" />
          {leftTicks.map((top) => (
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
      )}

      {(side === "both" || side === "right") && (
        <div className="absolute bottom-0 right-[max(0.5rem,calc(50%-37rem))] top-0 w-px">
          <div className="h-full w-px border-l border-dashed border-neutral-200" />
          {rightTicks.map((top) => (
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
      )}
    </div>
  );
}

/** Hero-scale stepped bracket (landing / docs headers) */
export function TraceHeroBracket({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "absolute left-1/2 top-[4.5rem] w-[min(calc(100%-2rem),72rem)] -translate-x-1/2 text-neutral-300",
        className,
      )}
      viewBox="0 0 1152 200"
      fill="none"
      preserveAspectRatio="xMidYMin meet"
      aria-hidden
    >
      <path
        d="M24 0 V88 H160 V128 H320"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeDasharray={STROKE.main}
        strokeLinejoin="miter"
      />
      <path
        d="M40 0 V76 H148 V116 H300"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeDasharray={STROKE.ghost}
        opacity="0.5"
        strokeLinejoin="miter"
      />
      <path
        d="M1128 0 V88 H992 V128 H832"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeDasharray={STROKE.main}
        strokeLinejoin="miter"
      />
      <path
        d="M1112 0 V76 H1004 V116 H852"
        stroke="currentColor"
        strokeWidth="0.85"
        strokeDasharray={STROKE.ghost}
        opacity="0.5"
        strokeLinejoin="miter"
      />
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
        <TraceNode key={`${cx}-${cy}`} cx={cx} cy={cy} />
      ))}
      <path
        d="M16 0 H32 M24 -6 V6 M1120 0 H1136 M1128 -6 V6"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

/** Auth-column frame — the open stepped bracket from the brand motif */
export function TraceAuthFrame({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute text-neutral-300", className)}
      viewBox="0 0 280 320"
      fill="none"
      aria-hidden
    >
      <path
        d="M0 48 H48 V96 H200 V144 H248"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeDasharray={STROKE.main}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M32 280 H80 V232 H200 V184 H248"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeDasharray={STROKE.main}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      {[
        [0, 48],
        [48, 48],
        [48, 96],
        [200, 96],
        [200, 144],
        [248, 144],
        [32, 280],
        [80, 280],
        [80, 232],
        [200, 232],
        [200, 184],
        [248, 184],
      ].map(([cx, cy]) => (
        <TraceNode key={`auth-${cx}-${cy}`} cx={cx} cy={cy} r={2} />
      ))}
    </svg>
  );
}

/** Vertical column divider (auth split, app sidebar edge) */
export function TraceColumnDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 w-px",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-y-[12%] w-px border-l border-dashed border-neutral-300/70" />
      {[22, 42, 62, 78].map((top) => (
        <span
          key={top}
          className="absolute left-0 flex -translate-x-1/2 items-center"
          style={{ top: `${top}%` }}
        >
          <span className="size-1.5 rounded-full bg-neutral-400/60" />
          <span className="h-px w-2.5 border-t border-dashed border-neutral-300/80" />
        </span>
      ))}
    </div>
  );
}

function AppTraceRail({
  side,
  ticks,
  className,
}: {
  side: "left" | "right";
  ticks: number[];
  className?: string;
}) {
  return (
    <div className={cn("absolute w-px", className)} aria-hidden>
      <div className="h-full w-px border-l border-dashed border-neutral-300/40" />
      {ticks.map((top) => (
        <span
          key={top}
          className={cn(
            "absolute flex items-center",
            side === "left"
              ? "left-0 -translate-x-1/2"
              : "right-0 translate-x-1/2 flex-row-reverse",
          )}
          style={{ top: `${top}%` }}
        >
          <span className="size-1 rounded-full bg-neutral-400/45" />
          <span className="h-px w-2 border-t border-dashed border-neutral-300/50" />
        </span>
      ))}
    </div>
  );
}

function AppTraceBus({
  className,
  d,
  nodes,
}: {
  className?: string;
  d: string;
  nodes: [number, number][];
}) {
  return (
    <svg
      className={cn("absolute text-neutral-300/50", className)}
      viewBox="0 0 960 32"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray={STROKE.fine}
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
      {nodes.map(([cx, cy]) => (
        <TraceNode
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={1.6}
          className="fill-neutral-400/55"
        />
      ))}
    </svg>
  );
}

/**
 * Background schematic traces for logged-in app surfaces (/home, /playground, etc.).
 * Fixed to the content pane — scrolls under page content, never steals focus.
 */
export function AppTraceBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,0,0,0.015),transparent_55%)]" />
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_88%,transparent),linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [mask-composite:intersect]" />

      <AppTraceRail
        side="right"
        ticks={[14, 32, 50, 68, 86]}
        className="bottom-6 right-5 top-6 md:right-8"
      />
      <AppTraceRail
        side="left"
        ticks={[22, 44, 66]}
        className="bottom-16 left-4 top-28 hidden sm:block md:left-7"
      />

      <AppTraceBus
        className="left-5 right-16 top-[11%] h-7 md:left-8 md:right-24"
        d="M0 16 H120 V8 H360 V24 H640 V12 H960"
        nodes={[
          [0, 16],
          [120, 16],
          [120, 8],
          [360, 8],
          [360, 24],
          [640, 24],
          [640, 12],
          [960, 12],
        ]}
      />
      <AppTraceBus
        className="left-8 right-12 top-[42%] hidden h-6 md:block md:left-12 md:right-20"
        d="M0 14 H88 V22 H280 V6 H520 V18 H960"
        nodes={[
          [0, 14],
          [88, 14],
          [88, 22],
          [280, 22],
          [280, 6],
          [520, 6],
          [520, 18],
          [960, 18],
        ]}
      />
      <AppTraceBus
        className="bottom-[18%] left-6 right-10 h-6 md:left-10 md:right-16"
        d="M0 12 H200 V20 H480 V4 H720 V16 H960"
        nodes={[
          [0, 12],
          [200, 12],
          [200, 20],
          [480, 20],
          [480, 4],
          [720, 4],
          [720, 16],
          [960, 16],
        ]}
      />

      <svg
        className="absolute right-8 top-5 hidden h-20 w-28 text-neutral-300/45 md:block"
        viewBox="0 0 112 80"
        fill="none"
        aria-hidden
      >
        <path
          d="M0 64 H32 V32 H64 V0 H112"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={STROKE.main}
          strokeLinejoin="miter"
        />
        <TraceNode cx={0} cy={64} r={1.75} className="fill-neutral-400/50" />
        <TraceNode cx={32} cy={64} r={1.75} className="fill-neutral-400/50" />
        <TraceNode cx={32} cy={32} r={1.75} className="fill-neutral-400/50" />
        <TraceNode cx={64} cy={32} r={1.75} className="fill-neutral-400/50" />
        <TraceNode cx={64} cy={0} r={1.75} className="fill-neutral-400/50" />
      </svg>

      <svg
        className="absolute bottom-10 left-5 hidden h-16 w-24 text-neutral-300/40 sm:block md:left-8"
        viewBox="0 0 96 64"
        fill="none"
        aria-hidden
      >
        <path
          d="M96 48 H64 V16 H32 V0 H0"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={STROKE.main}
          strokeLinejoin="miter"
        />
        <TraceNode cx={96} cy={48} r={1.75} className="fill-neutral-400/45" />
        <TraceNode cx={64} cy={48} r={1.75} className="fill-neutral-400/45" />
        <TraceNode cx={64} cy={16} r={1.75} className="fill-neutral-400/45" />
        <TraceNode cx={32} cy={16} r={1.75} className="fill-neutral-400/45" />
      </svg>
    </div>
  );
}

/** Page-level backdrop — pick a density per surface */
export function NmemoTraceBackdrop({
  variant = "docs",
  className,
}: {
  variant?: TraceVariant;
  className?: string;
}) {
  if (variant === "app") {
    return <AppTraceBackdrop className={className} />;
  }

  if (variant === "auth") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        aria-hidden
      >
        <div className="absolute bottom-0 left-6 top-0 hidden w-px lg:block">
          <div className="h-full w-px border-l border-dashed border-neutral-300/60" />
          {[15, 35, 55, 75, 90].map((top) => (
            <span
              key={top}
              className="absolute left-0 flex -translate-x-1/2 items-center"
              style={{ top: `${top}%` }}
            >
              <span className="size-1.5 rounded-full bg-neutral-400/60" />
              <span className="h-px w-3 border-t border-dashed border-neutral-300/70" />
            </span>
          ))}
        </div>
        <TraceAuthFrame className="left-4 top-[18%] hidden h-[42%] w-48 opacity-80 lg:block xl:left-10" />
        <TraceAuthFrame className="bottom-[8%] right-6 hidden h-[28%] w-40 rotate-180 opacity-50 lg:block" />
      </div>
    );
  }

  if (variant === "landing") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden md:block",
          className,
        )}
        aria-hidden
      >
        <TraceRails />
        <TraceHeroBracket />
      </div>
    );
  }

  // docs — lighter rails + header bracket
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <TraceRails />
      <svg
        className="absolute left-1/2 top-24 hidden w-[min(calc(100%-3rem),48rem)] -translate-x-1/2 text-neutral-300 md:block"
        viewBox="0 0 768 80"
        fill="none"
        preserveAspectRatio="xMidYMin meet"
        aria-hidden
      >
        <path
          d="M16 0 V40 H120 V64 H320 V40 H448"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={STROKE.main}
          strokeLinejoin="miter"
        />
        <path
          d="M752 0 V40 H648 V64 H448 V40 H320"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray={STROKE.main}
          strokeLinejoin="miter"
        />
        {[
          [16, 40],
          [120, 40],
          [120, 64],
          [320, 64],
          [448, 40],
          [648, 40],
          [648, 64],
          [752, 40],
        ].map(([cx, cy]) => (
          <TraceNode key={`doc-${cx}-${cy}`} cx={cx} cy={cy} r={2} />
        ))}
      </svg>
    </div>
  );
}
