import type { ReactNode } from "react";

import { allRoadmapItems } from "@/lib/roadmap";

type MarkProps = { className?: string };

/** Geometric marks, same black/white language as the nmemo logo. */
const marks: Record<string, (p: MarkProps) => ReactNode> = {
  conflict: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M8 6h5l3 6-3 6H8l3-6-3-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 6h-5l-3 6 3 6h5l-3-6 3-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.35"
      />
    </svg>
  ),
  compression: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="4"
        y="8"
        width="16"
        height="8"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 12h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  "query-planning": ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="6" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 12h4m0 0 4-5m-4 5 4 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "fast-voice": ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 13v-2m3.5 5V8M12 17V7m3.5 8V9M19 13v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  eval: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 4.5V7m0 10v2.5M4.5 12H7m10 0h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  adapters: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="3.5"
        y="7"
        width="7"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="13.5"
        y="7"
        width="7"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10.5 12h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  mcp: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 12h8M12 8v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  sql: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <ellipse
        cx="12"
        cy="7"
        rx="6.5"
        ry="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 7v10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V7"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.5 12c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  crm: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 18c.8-2.4 2.7-3.5 4.5-3.5s3.7 1.1 4.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 10h4m-2-2v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  gmail: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="3.5"
        y="6"
        width="17"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 7.5 12 13l8-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  linear: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 9h8M8 12h6M8 15h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function FallbackMark({ className }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 15h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LandingRoadmap() {
  return (
    <section className="mt-28 w-full sm:mt-32" id="roadmap">
      <div className="max-w-2xl space-y-3">
        <p className="text-[13px] font-medium text-neutral-500">Coming soon</p>
        <h2 className="display-lg font-normal text-neutral-950">
          Deeper decisions.
          <span className="mt-1.5 block font-normal text-neutral-400">
            Same one call.
          </span>
        </h2>
        <p className="text-sm font-semibold leading-relaxed text-neutral-500">
          Voice, real-time, and sharper ranking — still one call for the
          context your agents actually need.
        </p>
      </div>

      <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {allRoadmapItems.map((item) => {
          const Mark = marks[item.id] ?? FallbackMark;
          return (
            <li key={item.id} className="flex gap-3.5">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center text-neutral-950">
                <Mark className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    Soon
                  </span>
                </span>
                <span className="mt-1 block text-xs font-medium leading-relaxed text-neutral-500">
                  {item.short}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
