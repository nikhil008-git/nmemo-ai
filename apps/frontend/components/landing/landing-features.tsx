"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  FileText,
  GitBranch,
  Home,
  Inbox,
  Layers,
  MessageSquare,
  NotebookPen,
  Settings,
  Star,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const railIcons = [Home, Star, Inbox, Bell, Settings] as const;

const connectors = [
  {
    name: "Documents",
    type: "qdrant",
    status: "connected" as const,
    desc: "PDFs ingested on Sources",
  },
  {
    name: "Slack",
    type: "slack",
    status: "connected" as const,
    desc: "User token · search:read",
  },
  {
    name: "Notion",
    type: "notion",
    status: "disconnected" as const,
    desc: "Internal integration secret",
  },
  {
    name: "GitHub",
    type: "github",
    status: "disconnected" as const,
    desc: "Classic PAT · repo",
  },
  {
    name: "Memory",
    type: "mem0",
    status: "disconnected" as const,
    desc: "mem0 API key",
  },
] as const;

const chips = [
  {
    label: "Documents",
    icon: FileText,
    q: "What’s in our billing docs?",
    a: "Monthly billing stays. Grace period is 14 days, from billing-faq.pdf and #finance.",
    citation: "billing-faq.pdf",
  },
  {
    label: "Slack",
    icon: MessageSquare,
    q: "What came up in Slack?",
    a: "Finance locked monthly billing and a 14-day grace period in #finance yesterday.",
    citation: "#finance",
  },
  {
    label: "Notion",
    icon: NotebookPen,
    q: "Summarize our Notion notes",
    a: "Refund policy: full refund within 30 days. Linked from the customer handbook.",
    citation: "Refund policy",
  },
  {
    label: "GitHub",
    icon: GitBranch,
    q: "What’s open on GitHub?",
    a: "Two open PRs touch billing: grace-period copy and invoice webhook retries.",
    citation: "PR #842",
  },
] as const;

const contextSources = [
  { name: "Documents", latencyMs: 42 },
  { name: "Slack", latencyMs: 110 },
  { name: "Notion", latencyMs: 95 },
  { name: "GitHub", latencyMs: 128 },
] as const;

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
  children,
  railActive = 0,
}: {
  children: React.ReactNode;
  railActive?: number;
}) {
  return (
    <div className="flex h-full overflow-hidden rounded-sm border border-black/8 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
      <aside className="flex w-9 shrink-0 flex-col items-center gap-2 bg-neutral-900 py-2.5">
        {railIcons.slice(0, 4).map((Icon, i) => (
          <span
            key={Icon.displayName ?? i}
            className={cn(
              "flex size-6 items-center justify-center rounded-sm",
              i === railActive ? "bg-white/15 text-white" : "text-neutral-500",
            )}
          >
            <Icon size={12} strokeWidth={1.75} />
          </span>
        ))}
      </aside>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}

function ConnectorsDemo() {
  return (
    <MiniShell>
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-3 py-2">
          <p className="text-[11px] font-semibold">Connectors</p>
          <p className="mt-0.5 text-[9px] font-semibold text-neutral-400">
            Saved on your workspace · try in Playground
          </p>
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-border overflow-auto">
          {connectors.map((c) => (
            <li key={c.type} className="flex items-start justify-between gap-2 px-3 py-2.5">
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold leading-tight">
                  {c.name}
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold leading-snug text-neutral-400">
                  {c.desc}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 pt-0.5 text-[9px] font-bold uppercase tracking-wider",
                  c.status === "connected"
                    ? "text-foreground"
                    : "text-neutral-400",
                )}
              >
                {c.status === "connected" ? "Connected" : "Disconnected"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </MiniShell>
  );
}

function PlaygroundDemo() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"idle" | "gathering" | "done">("idle");
  const chip = chips[active];

  useEffect(() => {
    if (phase !== "gathering") return;
    const t = window.setTimeout(() => setPhase("done"), 700);
    return () => window.clearTimeout(t);
  }, [phase]);

  function pick(i: number) {
    setActive(i);
    setPhase("gathering");
  }

  return (
    <MiniShell railActive={1}>
      <div className="flex h-full flex-col">
        {phase === "idle" ? (
          <div className="flex flex-1 flex-col items-center justify-center px-3 py-3">
            <h3 className="text-center font-heading text-[15px] font-semibold tracking-[-0.03em] text-neutral-950">
              Ask across your sources
            </h3>
            <div className="relative mt-3 w-full rounded-[1.25rem] border border-black/[0.06] bg-[#f3f1ee] px-3 pb-2.5 pt-2.5">
              <p className="min-h-[3.25rem] text-[11px] font-medium leading-relaxed text-neutral-400">
                Ask anything across connected sources…
              </p>
              <div className="flex justify-end">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-neutral-200/80 text-neutral-500">
                  <ArrowRight size={13} strokeWidth={2} />
                </span>
              </div>
            </div>
            <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-1.5">
              {chips.map(({ label, icon: Icon }, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => pick(i)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-neutral-800 transition-colors hover:border-black/20 hover:bg-neutral-50"
                >
                  <Icon
                    size={11}
                    strokeWidth={1.75}
                    className="text-neutral-500"
                  />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] font-semibold text-neutral-400 underline decoration-neutral-300 underline-offset-2">
              Manage sources
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-auto px-3 py-3">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl bg-[#f3f1ee] px-3 py-2 text-left text-[11px] font-medium leading-relaxed">
                  {chip.q}
                </p>
              </div>
              <div className="flex gap-2">
                <Logo size={18} className="mt-0.5 shrink-0 rounded-[5px]" />
                <div className="min-w-0 space-y-1.5">
                  <p className="font-heading text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    nmemo
                  </p>
                  {phase === "gathering" ? (
                    <p className="text-[11px] font-semibold text-neutral-500">
                      Gathering context…
                    </p>
                  ) : (
                    <>
                      <p className="text-[11px] font-medium leading-relaxed text-neutral-900">
                        {chip.a}
                      </p>
                      <span className="inline-flex max-w-full truncate rounded-sm border border-border px-2 py-0.5 text-[9px] font-semibold text-neutral-500">
                        {chip.citation}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                {phase === "done" ? (
                  <button
                    type="button"
                    onClick={() => setPhase("idle")}
                    className="text-[10px] font-semibold text-neutral-400 hover:text-foreground"
                  >
                    Ask again
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex flex-wrap justify-end gap-1">
                  {chips.map(({ label }, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => pick(i)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                        i === active
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-500",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MiniShell>
  );
}

function ContextDemo() {
  const [open, setOpen] = useState(true);

  return (
    <MiniShell railActive={1}>
      <div className="flex h-full flex-col px-3 py-2.5">
        <p className="text-[10px] font-semibold text-neutral-400">
          Show context
        </p>
        <ul className="mt-2 space-y-1.5 text-[11px] font-semibold">
          {contextSources.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3">
              <span>{s.name}</span>
              <span className="text-neutral-500">{s.latencyMs}ms</span>
            </li>
          ))}
        </ul>
        <p className="mt-2.5 text-[10px] font-semibold text-neutral-500">
          Grounding · 87%
        </p>

        <div className="mt-2.5 min-h-0 flex-1 overflow-hidden rounded-sm border border-border">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between px-2.5 py-1.5 text-left font-heading text-[9px] font-semibold uppercase tracking-widest text-neutral-500 hover:text-foreground"
          >
            Diagnostics
            <span>{open ? "−" : "+"}</span>
          </button>
          {open ? (
            <div className="space-y-2 border-t border-border px-2.5 py-2 text-[9px] font-semibold leading-relaxed text-neutral-500">
              <div>
                <p className="font-heading text-foreground">Token usage</p>
                <p className="mt-0.5">
                  Total 1,240 · memory 180 · docs 620 · workspace 340 ·
                  instructions 100
                </p>
              </div>
              <div>
                <p className="font-heading text-foreground">Ranking scores</p>
                <ul className="mt-0.5 space-y-0.5">
                  <li>doc:billing-faq · 0.92, semantic match</li>
                  <li>slack:#finance · 0.81, recent + keyword</li>
                  <li>notion:refund · 0.74, title overlap</li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </MiniShell>
  );
}

const cards = [
  {
    label: "Connectors",
    title: "Wire every source once.",
    body: "Connect the sources your agents should search. One workspace, only what you turn on.",
    href: "/sign-up",
    Demo: ConnectorsDemo,
  },
  {
    label: "Playground",
    title: "See orchestration live.",
    body: "Ask once across connected sources. Same ranked context your agents use in production.",
    href: "/docs/playground",
    Demo: PlaygroundDemo,
  },
  {
    label: "Context",
    title: "Know what gets used.",
    body: "Latency, ranking, token budget, and grounding. Full diagnostics on every call.",
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
                <Layers size={15} strokeWidth={1.5} />
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

            <div className="relative mt-auto min-h-[250px] overflow-hidden sm:min-h-[270px]">
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
                <div className="w-full">
                  <div className="h-[230px]">
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
