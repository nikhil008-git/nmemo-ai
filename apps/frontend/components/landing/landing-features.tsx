"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Home,
  Inbox,
  Plug,
  Search,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";

const railIcons = [Home, Star, Inbox, Bell, Settings] as const;

const connectorSources = [
  { id: "docs", name: "Documents", tone: "bg-orange-400" },
  { id: "chat", name: "Chat", tone: "bg-pink-400" },
  { id: "wiki", name: "Wiki", tone: "bg-sky-400" },
  { id: "code", name: "Code", tone: "bg-emerald-400" },
] as const;

const questions = [
  "What did finance say about billing?",
  "Where is the refund policy?",
  "What did we decide last week?",
] as const;

const answers: Record<(typeof questions)[number], string> = {
  "What did finance say about billing?":
    "Finance kept monthly billing and a 14-day grace period.",
  "Where is the refund policy?":
    "Full refund within 30 days — from your docs and wiki.",
  "What did we decide last week?":
    "Default context budget locked before the model sees it.",
};

const orangeStage = {
  background: `
    radial-gradient(ellipse 90% 70% at 12% 20%, rgba(255, 190, 120, 0.95) 0%, transparent 55%),
    radial-gradient(ellipse 70% 55% at 88% 18%, rgba(255, 150, 80, 0.8) 0%, transparent 50%),
    radial-gradient(ellipse 85% 55% at 45% 100%, rgba(249, 115, 22, 0.65) 0%, transparent 55%),
    radial-gradient(ellipse 45% 35% at 65% 55%, rgba(254, 215, 170, 0.85) 0%, transparent 45%),
    linear-gradient(165deg, #fff7ed 0%, #ffedd5 42%, #fdba74 100%)
  `,
} as const;

function MiniShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full overflow-hidden rounded-sm border border-black/8 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
      <aside className="flex w-9 shrink-0 flex-col items-center gap-2 bg-neutral-900 py-2.5">
        {railIcons.slice(0, 4).map((Icon, i) => (
          <span
            key={Icon.displayName ?? i}
            className={cn(
              "flex size-6 items-center justify-center rounded-sm",
              i === 0 ? "bg-white/15 text-white" : "text-neutral-500",
            )}
          >
            <Icon size={12} strokeWidth={1.75} />
          </span>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-[11px] font-semibold">{title}</p>
          <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-neutral-50 px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
            <Sparkles size={9} className="text-secondary" />
            Ask
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden bg-white">{children}</div>
      </div>
    </div>
  );
}

function ConnectorsDemo() {
  const [on, setOn] = useState<string[]>(["docs", "chat", "wiki"]);

  function toggle(id: string) {
    setOn((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <MiniShell title="Sources">
      <ul className="divide-y divide-border">
        {connectorSources.map((s) => {
          const active = on.includes(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-black/5"
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <span className={cn("size-2 rounded-full", s.tone)} />
                  {s.name}
                </span>
                <span
                  className={cn(
                    "relative h-4 w-7 shrink-0 rounded-full transition-colors",
                    active ? "bg-neutral-900" : "bg-neutral-200",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-all",
                      active ? "left-[0.875rem]" : "left-0.5",
                    )}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </MiniShell>
  );
}

function PlaygroundDemo() {
  const [q, setQ] = useState<(typeof questions)[number]>(questions[0]);

  return (
    <MiniShell title="Playground">
      <div className="space-y-2.5 p-3">
        <div className="flex flex-wrap gap-1.5">
          {questions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQ(item)}
              className={cn(
                "rounded-sm px-2 py-1 text-left text-[10px] font-semibold transition-colors",
                q === item
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-50 text-muted-foreground ring-1 ring-border hover:text-foreground",
              )}
            >
              {item.length > 24 ? `${item.slice(0, 22)}…` : item}
            </button>
          ))}
        </div>
        <div className="rounded-sm border border-border bg-neutral-50 px-3 py-2.5">
          <p className="text-xs font-medium leading-relaxed text-neutral-700">
            {answers[q]}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { name: "Documents", tone: "bg-orange-400" },
            { name: "Chat", tone: "bg-pink-400" },
            { name: "Wiki", tone: "bg-sky-400" },
          ].map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
            >
              <span className={cn("size-1.5 rounded-full", s.tone)} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </MiniShell>
  );
}

function ContextDemo() {
  const [step, setStep] = useState(0);
  const lines = [
    { label: "Documents", score: 0.92, ms: 42, tone: "bg-orange-400" },
    { label: "Chat", score: 0.81, ms: 110, tone: "bg-pink-400" },
    { label: "Wiki", score: 0.74, ms: 95, tone: "bg-sky-400" },
  ];

  return (
    <MiniShell title="Context">
      <div className="flex items-center gap-4 border-b border-border px-3 py-2">
        {(["Sources", "Prompt"] as const).map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "pb-1 text-[10px] font-semibold transition-colors",
              step === i
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-2 p-3">
        {step === 0 ? (
          lines.map((row) => (
            <div
              key={row.label}
              className="rounded-sm border border-border bg-neutral-50 px-2.5 py-2"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", row.tone)} />
                  {row.label}
                </span>
                <span className="text-muted-foreground">{row.ms}ms</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-900"
                  style={{ width: `${row.score * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <pre className="overflow-x-auto rounded-sm border border-border bg-neutral-50 p-2.5 text-[10px] font-medium leading-relaxed text-neutral-600">
            {`Sources ranked
Docs · Chat · Wiki

Q: billing grace period?
A: 14 days from chat`}
          </pre>
        )}
      </div>
    </MiniShell>
  );
}

const cards = [
  {
    label: "Sources",
    Icon: Plug,
    title: "Bring everything in",
    body: "Link the apps and files your team already uses. Turn on only what should be searched.",
    href: "/docs/connectors",
    Demo: ConnectorsDemo,
  },
  {
    label: "Playground",
    Icon: Sparkles,
    title: "Ask once. See it work.",
    body: "Try a real question and watch the answer form from your sources.",
    href: "/docs/playground",
    Demo: PlaygroundDemo,
  },
  {
    label: "Context",
    Icon: Search,
    title: "Know what gets used",
    body: "Inspect sources, scores, and the final prompt before you ship.",
    href: "/docs/sdk",
    Demo: ContextDemo,
  },
] as const;

export function LandingFeatures() {
  return (
    <section className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
      {cards.map((card) => {
        const Demo = card.Demo;
        return (
          <article
            key={card.label}
            className="flex flex-col overflow-hidden rounded-sm bg-neutral-100"
          >
            <div className="flex flex-1 flex-col gap-3 px-7 pb-6 pt-8 sm:px-8 sm:pt-9">
              <div className="flex items-center gap-2 text-neutral-500">
                <card.Icon size={15} strokeWidth={1.75} />
                <p className="text-[13px] font-medium">{card.label}</p>
              </div>
              <Link href={card.href} className="group">
                <h2 className="text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-neutral-950 group-hover:underline sm:text-[1.75rem]">
                  {card.title}
                </h2>
              </Link>
              <p className="text-[15px] font-medium leading-relaxed text-neutral-500">
                {card.body}
              </p>
            </div>

            <div className="relative mt-auto min-h-[230px] overflow-hidden sm:min-h-[250px]">
              <div className="absolute inset-0" style={orangeStage} aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 opacity-50 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), transparent 55%)",
                }}
                aria-hidden
              />
              <div className="relative flex h-full items-end px-4 pb-0 pt-8 sm:px-5">
                <div className="w-full translate-y-3 transition-transform duration-300 hover:translate-y-1">
                  <div className="h-[210px]">
                    <Demo />
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
