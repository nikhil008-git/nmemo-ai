"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const STEP_MS = 9000;
const PULSE_MS = 2800;

function FeatureTag({
  children,
  active,
  tone = "dark",
}: {
  children: ReactNode;
  active?: boolean;
  tone?: "dark" | "orange" | "sky";
}) {
  const tones = {
    dark: active
      ? "bg-neutral-900 text-white"
      : "bg-neutral-200/80 text-neutral-500",
    orange: active
      ? "bg-orange-500 text-white"
      : "bg-orange-100 text-orange-700/70",
    sky: active ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-800/70",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-tight",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function Panel({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-black/5",
        !active && "opacity-45",
        className,
      )}
    >
      <div className="relative h-[200px] p-4 sm:h-[220px] sm:p-5">{children}</div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white from-20% via-white/85 via-50% to-transparent"
        aria-hidden
      />
    </div>
  );
}

/** Parallel source fan-out — colored latency chips */
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

  const sources = [
    { name: "Docs", ms: 42, tone: "bg-orange-400" },
    { name: "Slack", ms: 110, tone: "bg-pink-400" },
    { name: "Notion", ms: 95, tone: "bg-sky-400" },
    { name: "GitHub", ms: 128, tone: "bg-emerald-400" },
  ] as const;

  return (
    <Panel active={active} className="bg-neutral-950 text-white">
      <div className="flex h-full flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
          Parallel retrieve
        </p>
        <div className="space-y-2">
          {sources.map((s, i) => {
            const on = active && i === pulse % sources.length;
            return (
              <div
                key={s.name}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2.5 py-2 transition-colors",
                  on ? "bg-white/12" : "bg-white/5",
                )}
              >
                <span className={cn("size-2 shrink-0 rounded-full", s.tone)} />
                <span className="flex-1 text-xs font-semibold">{s.name}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold tabular-nums",
                    on ? "text-orange-300" : "text-white/40",
                  )}
                >
                  {s.ms}ms
                </span>
                <span
                  className={cn(
                    "h-1.5 w-16 overflow-hidden rounded-full bg-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "block h-full rounded-full transition-all",
                      on ? "w-full bg-orange-400" : "w-2/5 bg-white/25",
                    )}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/** Ranking card with scored hits */
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

  const scores = [
    { id: "billing-faq.pdf", score: 0.92, keep: true },
    { id: "slack:#finance", score: 0.81, keep: true },
    { id: "notion:runbook", score: 0.54, keep: false },
  ] as const;

  return (
    <Panel active={active} className="bg-orange-50">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-800/50">
            Rank · dedupe · budget
          </p>
          <FeatureTag active={active} tone="orange">
            Budget ok
          </FeatureTag>
        </div>
        <ul className="space-y-2">
          {scores.map((row, i) => {
            const on = active && i === pulse % scores.length;
            return (
              <li
                key={row.id}
                className={cn(
                  "flex items-center gap-2 rounded-sm border px-2.5 py-2",
                  row.keep
                    ? "border-orange-200 bg-white"
                    : "border-transparent bg-orange-100/60 opacity-50 line-through",
                  on && row.keep && "ring-1 ring-orange-400",
                )}
              >
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-neutral-800">
                  {row.id}
                </span>
                <span className="text-[11px] font-bold tabular-nums text-orange-700">
                  {row.score.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

/** Packed prompt handoff */
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

  const tags = ["via nmemo", "3 citations", "diagnostics"] as const;

  return (
    <Panel active={active} className="bg-sky-50">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-800/50">
            Ready prompt
          </p>
          <FeatureTag active={active} tone="sky">
            {tags[pulse % tags.length]}
          </FeatureTag>
        </div>
        <div className="rounded-sm border border-sky-200 bg-white p-3 font-mono text-[10px] leading-relaxed text-sky-950/80">
          <p className="text-sky-600/70">{"// assembled for your agent"}</p>
          <p className="mt-1.5">
            <span className="text-sky-700">context</span>
            <span className="text-neutral-400">: </span>
            <span className="text-neutral-700">
              grace period is 14 days…
            </span>
          </p>
          <p className="mt-1 text-neutral-400">
            citations: [billing-faq, #finance]
          </p>
        </div>
        <div
          className={cn(
            "mt-auto h-8 rounded-sm transition-colors",
            active ? "bg-sky-600" : "bg-sky-200",
          )}
        />
      </div>
    </Panel>
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
