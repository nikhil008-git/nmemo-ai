"use client";

import { useState } from "react";

import { HeroNatureBackdrop } from "@/components/landing/landing-hero-backdrop";
import {
  ProductShell,
  type DemoTab,
} from "@/components/landing/landing-playground";

const sections = [
  {
    n: "01",
    title: "Start from one workspace",
    body: "See what’s connected, then decide context for every agent from the same shell.",
    group: "Inside Home",
    features: [
      "Sources connected",
      "See it work",
      "Connect sources",
      "Ship to agents",
    ],
    tab: "Home" as const,
    rail: 0,
    preferContext: false,
    // Crop into the main checklist pane
    frame: { left: "18%", top: "6%", scale: 0.92 },
  },
  {
    n: "02",
    title: "Connect the multi-source stack",
    body: "Bring every source into one workspace. Connect once; nmemo decides the rest.",
    group: "Inside Connectors",
    features: [
      "Workspace sources",
      "Live connectors",
      "Long-term memory",
      "Scoped keys",
    ],
    tab: "Connectors" as const,
    rail: 2,
    preferContext: false,
    // Crop into the source tile grid
    frame: { left: "20%", top: "4%", scale: 0.95 },
  },
  {
    n: "03",
    title: "Ask for the context agents need",
    body: "Playground shows decisions live — ranked prompt, citations, and what got used.",
    group: "Inside Playground",
    features: [
      "Ask across sources",
      "Ranked context",
      "Streaming answers",
      "Manage sources",
    ],
    tab: "Playground" as const,
    rail: 1,
    preferContext: true,
    // Crop into the chat + context panel
    frame: { left: "22%", top: "2%", scale: 1.02 },
  },
] as const;

function JourneyPreview({
  tab,
  rail,
  preferContext,
  frame,
}: {
  tab: DemoTab;
  rail: number;
  preferContext: boolean;
  frame: { left: string; top: string; scale: number };
}) {
  const [currentTab, setCurrentTab] = useState<DemoTab>(tab);
  const [currentRail, setCurrentRail] = useState(rail);

  return (
    <div
      className="absolute z-[1] h-[720px] w-[1180px] overflow-hidden rounded-sm shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
      style={{
        left: frame.left,
        top: frame.top,
        transform: `scale(${frame.scale})`,
        transformOrigin: "top left",
      }}
    >
      <ProductShell
        tab={currentTab}
        onTab={setCurrentTab}
        rail={currentRail}
        onRail={setCurrentRail}
        preferContext={preferContext}
        fill
      />
    </div>
  );
}

export function LandingJourney() {
  return (
    <section className="relative mt-20 w-full sm:mt-24">
      {sections.map((section) => (
        <article
          key={section.n}
          className="relative min-h-screen lg:h-screen"
        >
          <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
            <div className="w-full max-w-md space-y-5 pb-10 pt-16 lg:w-1/2 lg:max-w-none lg:pr-14 lg:pt-20">
              <p className="text-[13px] font-medium text-neutral-500">
                {section.n}
              </p>
              <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] text-neutral-950 sm:text-3xl md:text-[2.15rem]">
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
                    <li
                      key={f}
                      className="text-sm font-semibold text-foreground"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="relative mt-6 h-[70vh] min-h-[420px] overflow-hidden rounded-2xl lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-auto lg:w-1/2 lg:rounded-none lg:rounded-l-3xl">
            <HeroNatureBackdrop className="z-0" />
            <JourneyPreview
              key={section.tab}
              tab={section.tab}
              rail={section.rail}
              preferContext={section.preferContext}
              frame={section.frame}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-white from-15% via-white/90 via-45% to-transparent"
              aria-hidden
            />
          </div>
        </article>
      ))}
    </section>
  );
}
