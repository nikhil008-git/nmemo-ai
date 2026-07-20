"use client";

import { useLenis } from "lenis/react";
import { useState } from "react";

const SIZE = 16;
const STROKE = 1.75;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const lenis = useLenis();

  useLenis((instance) => {
    setProgress(instance.progress);
  });

  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <button
      type="button"
      aria-label="Scroll progress"
      onClick={() => lenis?.scrollTo(0, { duration: 1.2 })}
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-neutral-900 px-3.5 py-2 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform hover:scale-[1.02]"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90 shrink-0"
        aria-hidden
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-neutral-600"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="text-white transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      <span className="text-[13px] font-medium tracking-tight">Context</span>
    </button>
  );
}
