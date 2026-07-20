"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const STEP_MS = 9000;
const PULSE_MS = 2800;

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("h-2 rounded-sm bg-neutral-200/90", className)} />;
}

function SkeletonPanel({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-neutral-100",
        !active && "opacity-45",
      )}
    >
      <div className="relative h-[200px] p-4 sm:h-[220px] sm:p-5">{children}</div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white from-15% via-white/90 via-45% to-transparent"
        aria-hidden
      />
    </div>
  );
}

function FeatureTag({
  children,
  active,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-tight",
        active ? "bg-neutral-900 text-white" : "bg-neutral-200/80 text-neutral-500",
      )}
    >
      {children}
    </span>
  );
}

/** App shell skeleton, sidebar + one highlighted retrieve hit */
function RetrieveDemo({ active }: { active: boolean }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!active) {
      setPulse(0);
      return;
    }
    const id = window.setInterval(() => setPulse((p) => p + 1), PULSE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  const tags = ["Source A · 42ms", "Source B · 110ms", "Source C · 95ms"] as const;
  const tag = tags[pulse % tags.length];

  return (
    <SkeletonPanel active={active}>
      <div className="flex h-full gap-3">
        <div className="flex w-7 shrink-0 flex-col items-center gap-2 pt-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "size-5 rounded-sm bg-neutral-200/90",
                active && i === pulse % 5 && "bg-neutral-300",
              )}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <SkeletonBar className="w-2/5" />
            <SkeletonBar className="w-3/5" />
          </div>
          <div
            className={cn(
              "h-[72px] rounded-sm bg-neutral-200/50",
              active && "bg-neutral-200",
            )}
          />
          <FeatureTag active={active}>{tag}</FeatureTag>
        </div>
      </div>
    </SkeletonPanel>
  );
}

/** Context card skeleton, thicker bars, ranking tags */
function RankDemo({ active }: { active: boolean }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!active) {
      setPulse(0);
      return;
    }
    const id = window.setInterval(() => setPulse((p) => p + 1), PULSE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  const scores = ["0.92 · Source A", "0.81 · Source B", "0.74 · Source C"] as const;

  return (
    <SkeletonPanel active={active}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-400">#ctx</span>
          <div className="size-7 rounded-full bg-neutral-200" />
        </div>
        <div className="space-y-2.5">
          <SkeletonBar className="h-3.5 w-[88%]" />
          <SkeletonBar className="h-3 w-full" />
          <SkeletonBar className="h-3 w-4/5" />
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5 pb-6">
          <FeatureTag active={active}>
            {scores[pulse % scores.length]}
          </FeatureTag>
          <FeatureTag>Budget ok</FeatureTag>
        </div>
      </div>
    </SkeletonPanel>
  );
}

/** Prompt skeleton, code-ish bars + delivery tag */
function DeliverDemo({ active }: { active: boolean }) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!active) {
      setPulse(0);
      return;
    }
    const id = window.setInterval(() => setPulse((p) => p + 1), PULSE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  const lines = ["w-[92%]", "w-[78%]", "w-[85%]", "w-[60%]", "w-[70%]"] as const;
  const tags = ["via nmemo", "3 citations", "diagnostics"] as const;

  return (
    <SkeletonPanel active={active}>
      <div className="flex h-full flex-col gap-3">
        <div className="space-y-2">
          {lines.map((w, i) => (
            <SkeletonBar
              key={w}
              className={cn(
                w,
                active && i === pulse % lines.length && "bg-neutral-300",
              )}
            />
          ))}
        </div>
        <div
          className={cn(
            "mt-1 h-10 rounded-sm bg-neutral-200/50",
            active && "bg-neutral-200",
          )}
        />
        <div className="mt-auto pb-6">
          <FeatureTag active={active}>{tags[pulse % tags.length]}</FeatureTag>
        </div>
      </div>
    </SkeletonPanel>
  );
}

const steps = [
  {
    n: "01",
    title: "Fan out the ask",
    body: "Hit memory, docs, Slack, GitHub, and more in parallel — each source timed as it returns.",
    Demo: RetrieveDemo,
  },
  {
    n: "02",
    title: "Score, cut, fit",
    body: "Rank by relevance, drop duplicates, and trim to budget so only winning context survives.",
    Demo: RankDemo,
  },
  {
    n: "03",
    title: "Hand off a packed prompt",
    body: "Your agent gets the ready prompt, citations, and diagnostics — drop it into any stack.",
    Demo: DeliverDemo,
  },
] as const;

export function LandingHow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % steps.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="mt-4 w-full scroll-mt-28" id="how-it-works">
      <div className="max-w-2xl space-y-1.5">
        <p className="text-[13px] font-medium text-neutral-500">How it works</p>
        <p className="text-sm font-semibold text-neutral-500">
          Three moves between your sources and the model.
        </p>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((step, i) => {
          const Demo = step.Demo;
          const on = active === i;
          return (
            <article key={step.n} className="flex flex-col gap-4">
              <Demo active={on} />
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-neutral-500">
                  {step.n}
                </p>
                <h3 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs font-medium leading-relaxed text-neutral-500">
                  {step.body}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
