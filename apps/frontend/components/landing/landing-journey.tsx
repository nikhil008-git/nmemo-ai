"use client";

import { useState } from "react";

import {
  ProductShell,
  type DemoTab,
} from "@/components/landing/landing-playground";
import { stageBackground } from "@/lib/stage-backgrounds";

/** One section covering the whole product — the shell itself carries the tour. */
const section = {
  title: "Start from one workspace",
  body: "See what’s connected, connect the multi-source stack, and ask for the context your agents need — all from the same shell.",
  group: "Inside nmemo",
  features: [
    "Sources connected",
    "Live connectors",
    "Ranked context",
    "Streaming answers",
    "Long-term memory",
    "Scoped keys",
  ],
} as const;

/** Crop into the main pane of the shell. */
const frame = { left: "18%", top: "6%", scale: 0.92 } as const;

function JourneyPreview() {
  const [tab, setTab] = useState<DemoTab>("Home");
  const [rail, setRail] = useState(0);

  return (
    <div
      className="absolute h-[720px] w-[1180px] overflow-hidden rounded-sm shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
      style={{
        left: frame.left,
        top: frame.top,
        transform: `scale(${frame.scale})`,
        transformOrigin: "top left",
      }}
    >
      <ProductShell
        tab={tab}
        onTab={setTab}
        rail={rail}
        onRail={setRail}
        fill
      />
    </div>
  );
}

export function LandingJourney() {
  return (
    <section className="relative mt-28 w-full sm:mt-32">
      <article className="relative min-h-screen lg:h-screen">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="w-full max-w-md space-y-5 pb-10 pt-16 lg:w-1/2 lg:max-w-none lg:pr-14 lg:pt-20">
            <h2 className="display-lg font-normal text-balance text-neutral-950">
              {section.title}
            </h2>
            <p className="text-sm font-semibold leading-relaxed text-neutral-500">
              {section.body}
            </p>
            <div className="border-t border-border pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                {section.group}
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                {section.features.map((f) => (
                  <li key={f} className="text-sm font-semibold text-foreground">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="relative mt-6 h-[70vh] min-h-[420px] overflow-hidden rounded-2xl lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-auto lg:w-1/2 lg:rounded-none lg:rounded-l-3xl"
          style={{ background: stageBackground }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-50 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, var(--stage-glow), transparent 55%)",
            }}
            aria-hidden
          />
          <JourneyPreview />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-background from-15% via-background/90 via-45% to-transparent"
            aria-hidden
          />
        </div>
      </article>
    </section>
  );
}
