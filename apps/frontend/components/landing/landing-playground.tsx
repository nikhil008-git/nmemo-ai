"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  Bell,
  FileText,
  GitBranch,
  Home,
  Inbox,
  Languages,
  MessageSquare,
  Mic,
  NotebookPen,
  Search,
  Settings,
  Star,
} from "lucide-react";

import { RoadmapSidebar } from "@/components/app/roadmap-sidebar";
import { cn } from "@/lib/utils";

const FRAME_W = 1180;
const FRAME_H = 720;

const railIcons = [Home, Star, Inbox, Bell, Settings] as const;
const upcomingRailIcons = [
  { icon: Mic, label: "Voice" },
  { icon: AudioLines, label: "Real-time" },
  { icon: Languages, label: "Languages" },
] as const;

const topTabs = [
  "Home",
  "Playground",
  "Sources",
  "Connectors",
  "API",
  "Docs",
  "Settings",
] as const;

export type DemoTab = (typeof topTabs)[number];

const sources = [
  { name: "Documents", tone: "bg-orange-400", count: "1" },
  { name: "Slack", tone: "bg-pink-400", count: "12" },
  { name: "Notion", tone: "bg-sky-400", count: "8" },
  { name: "GitHub", tone: "bg-emerald-400", count: "4" },
  { name: "Memory", tone: "bg-lime-400", count: "3" },
] as const;

function useFrameScale(baseWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / baseWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseWidth]);

  return { ref, scale };
}

const homeSteps = [
  {
    label: "Connect your sources",
    description:
      "Bring Slack, Notion, GitHub, memory, and more into one place.",
    tab: "Connectors" as const,
    rail: 2,
  },
  {
    label: "Add workspace knowledge",
    description:
      "Give your agents the docs and knowledge they should reason over.",
    tab: "Sources" as const,
    rail: 3,
  },
  {
    label: "See context in action",
    description: "Ask a question and see which context gets used.",
    tab: "Playground" as const,
    rail: 1,
  },
  {
    label: "Ship it to your agents",
    description: "Use the same context in whatever agents you already run.",
    tab: "Playground" as const,
    rail: 1,
  },
] as const;

export function HomeDemo({
  onTab = () => {},
  onRail = () => {},
}: {
  onTab?: (t: DemoTab) => void;
  onRail?: (i: number) => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-6 py-6">
      <div className="space-y-3 text-center">
        <h2 className="font-heading text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl">
          Hey, Nikhil Rajpurohit
        </h2>
        <p className="text-sm font-semibold leading-relaxed text-neutral-500">
          Orchestrate the right context for your agents, across every source.
        </p>
        <p className="text-sm font-semibold leading-relaxed text-neutral-500">
          <span className="text-foreground">2</span> sources connected · qdrant,
          groq
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            onRail(1);
            onTab("Playground");
          }}
          className="inline-flex flex-1 items-center justify-center rounded-sm bg-secondary px-4 py-2.5 text-sm font-bold text-white"
        >
          See it work
        </button>
        <button
          type="button"
          onClick={() => {
            onRail(2);
            onTab("Connectors");
          }}
          className="inline-flex flex-1 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm font-semibold"
        >
          Connect sources
        </button>
      </div>

      <ul className="space-y-1.5 text-left">
        {homeSteps.map((step, i) => (
          <li key={step.label}>
            <button
              type="button"
              onClick={() => {
                onRail(step.rail);
                onTab(step.tab);
              }}
              className="flex w-full gap-3 rounded-sm border border-border px-3 py-2.5 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="font-heading block text-sm font-semibold tracking-[-0.02em]">
                  {step.label}
                </span>
                <span className="mt-0.5 block text-xs font-semibold leading-relaxed text-neutral-500">
                  {step.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-center text-xs font-semibold text-neutral-500">
        Building agents already?{" "}
        <span className="text-foreground underline underline-offset-4">
          Integrate in code
        </span>
      </p>
    </div>
  );
}

const askFlows = [
  {
    label: "Documents",
    icon: FileText,
    q: "What’s in our documents?",
    a: "Monthly billing stays. Grace period is 14 days — from billing-faq.pdf and #finance.",
    citation: "billing-faq.pdf",
    sources: [
      { name: "Documents", latencyMs: 42 },
      { name: "Slack", latencyMs: 110 },
      { name: "Notion", latencyMs: 95 },
      { name: "GitHub", latencyMs: 128 },
    ],
    scores: [
      { id: "doc:billing-faq", score: 0.92, reason: "semantic match" },
      { id: "slack:#finance", score: 0.81, reason: "recent + keyword" },
    ],
  },
  {
    label: "Slack",
    icon: MessageSquare,
    q: "What came up in Slack?",
    a: "Finance locked monthly billing and a 14-day grace period in #finance yesterday.",
    citation: "#finance",
    sources: [
      { name: "Documents", latencyMs: 38 },
      { name: "Slack", latencyMs: 96 },
      { name: "Notion", latencyMs: 102 },
      { name: "GitHub", latencyMs: 140 },
    ],
    scores: [
      { id: "slack:#finance", score: 0.94, reason: "thread match" },
      { id: "doc:billing-faq", score: 0.71, reason: "related doc" },
    ],
  },
  {
    label: "Notion",
    icon: NotebookPen,
    q: "Summarize our Notion notes",
    a: "Refund policy: full refund within 30 days. Linked from the customer handbook.",
    citation: "Refund policy",
    sources: [
      { name: "Documents", latencyMs: 51 },
      { name: "Slack", latencyMs: 120 },
      { name: "Notion", latencyMs: 78 },
      { name: "GitHub", latencyMs: 132 },
    ],
    scores: [
      { id: "notion:refund", score: 0.88, reason: "title overlap" },
      { id: "doc:handbook", score: 0.76, reason: "linked page" },
    ],
  },
  {
    label: "GitHub",
    icon: GitBranch,
    q: "What’s open on GitHub?",
    a: "Two open PRs touch billing: grace-period copy and invoice webhook retries.",
    citation: "PR #842",
    sources: [
      { name: "Documents", latencyMs: 44 },
      { name: "Slack", latencyMs: 115 },
      { name: "Notion", latencyMs: 98 },
      { name: "GitHub", latencyMs: 86 },
    ],
    scores: [
      { id: "github:pr-842", score: 0.91, reason: "issue match" },
      { id: "github:pr-819", score: 0.79, reason: "related PR" },
    ],
  },
] as const;

export function PlaygroundDemo({
  onTab = () => {},
  preferContext = false,
}: {
  onTab?: (t: DemoTab) => void;
  preferContext?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"idle" | "gathering" | "done">(
    preferContext ? "done" : "idle",
  );
  const [showDetails, setShowDetails] = useState(preferContext);
  const flow = askFlows[active];

  useEffect(() => {
    if (phase !== "gathering") return;
    const t = window.setTimeout(() => {
      setPhase("done");
      setShowDetails(preferContext);
    }, 700);
    return () => window.clearTimeout(t);
  }, [phase, preferContext]);

  function ask(i: number) {
    setActive(i);
    setShowDetails(false);
    setPhase("gathering");
  }

  if (phase === "idle") {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 py-8">
        <div className="flex w-full max-w-2xl flex-col items-center">
          <h2 className="text-center font-heading text-[1.85rem] font-semibold tracking-[-0.035em] leading-[1.15] text-neutral-950 sm:text-[2.2rem]">
            Ask across your sources
          </h2>

          <div className="relative mt-7 w-full rounded-[1.75rem] border border-black/[0.06] bg-[#f3f1ee] px-5 pb-4 pt-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
            <p className="min-h-[7rem] text-[15px] font-medium leading-relaxed text-neutral-400">
              Ask anything across connected sources…
            </p>
            <div className="flex items-end justify-end">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-neutral-200/80 text-neutral-500">
                <ArrowRight size={16} strokeWidth={2} />
              </span>
            </div>
          </div>

          <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2">
            {askFlows.map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                type="button"
                onClick={() => ask(i)}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:border-black/20 hover:bg-neutral-50"
              >
                <Icon
                  size={14}
                  strokeWidth={1.75}
                  className="text-neutral-500"
                />
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onTab("Connectors")}
            className="mt-6 text-center text-[12px] font-semibold text-neutral-400 underline decoration-neutral-300 underline-offset-2 hover:text-foreground"
          >
            Manage sources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl bg-[#f3f1ee] px-4 py-2.5 text-left text-sm font-medium leading-relaxed">
              {flow.q}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-[7px] bg-neutral-900 text-[11px] font-bold text-white">
              n
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                nmemo
              </p>
              {phase === "gathering" ? (
                <p className="text-sm font-semibold text-neutral-500">
                  Gathering context…
                </p>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-[0.9375rem] font-medium leading-[1.65] text-neutral-900">
                    {flow.a}
                  </p>
                  <span className="inline-flex max-w-full truncate rounded-sm border border-border px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                    {flow.citation}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-5 pt-2 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-2">
          <div className="relative rounded-[1.5rem] border border-black/[0.06] bg-[#f3f1ee] px-4 pb-3 pt-3">
            <p className="min-h-[3.25rem] text-[15px] font-medium leading-relaxed text-neutral-400">
              Ask anything across connected sources…
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {phase === "done" ? (
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    className="text-[11px] font-semibold text-neutral-400 hover:text-foreground"
                  >
                    {showDetails ? "Hide context" : "Show context"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setPhase("idle");
                    setShowDetails(false);
                  }}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-foreground"
                >
                  New chat
                </button>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {askFlows.map(({ label }, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => ask(i)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      i === active
                        ? "bg-neutral-900 text-white"
                        : "bg-white/80 text-neutral-500",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showDetails && phase === "done" ? (
            <div className="space-y-3 rounded-2xl border border-black/8 bg-white px-3.5 py-3">
              <ul className="space-y-1.5 text-xs font-semibold">
                {flow.sources.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{s.name}</span>
                    <span className="text-neutral-500">{s.latencyMs}ms</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] font-semibold text-neutral-500">
                Grounding · 87%
              </p>
              <div className="rounded-sm border border-border">
                <p className="px-3 py-2 font-heading text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                  Diagnostics
                </p>
                <div className="space-y-2 border-t border-border px-3 py-2.5 text-[11px] font-semibold text-neutral-500">
                  <div>
                    <p className="font-heading text-foreground">Token usage</p>
                    <p className="mt-0.5">
                      Total 1,240 · memory 180 · docs 620 · workspace 340 ·
                      instructions 100
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-foreground">
                      Ranking scores
                    </p>
                    <ul className="mt-0.5 space-y-0.5">
                      {flow.scores.map((r) => (
                        <li key={r.id}>
                          {r.id} · {r.score.toFixed(2)} · {r.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SourcesDemo() {
  const docs = [
    { name: "billing-faq.pdf", status: "Ready", chunks: 42 },
    { name: "refund-policy.md", status: "Ready", chunks: 18 },
    { name: "q2-handbook.pdf", status: "Ready", chunks: 31 },
  ] as const;

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col justify-center gap-4 py-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-heading text-lg font-semibold tracking-tight">
            Documents
          </p>
          <p className="mt-1 text-sm font-semibold text-neutral-500">
            Ingested files your agents can cite.
          </p>
        </div>
        <span className="rounded-sm bg-secondary px-3 py-1.5 text-xs font-bold text-white">
          Upload
        </span>
      </div>
      <ul className="divide-y divide-border border border-border">
        {docs.map((doc) => (
          <li
            key={doc.name}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="size-2 rounded-full bg-orange-400" />
              {doc.name}
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              {doc.status} · {doc.chunks} chunks
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const connectorCatalog = [
  {
    type: "qdrant",
    name: "Documents",
    description: "PDFs from Sources as workspace knowledge.",
    connected: true,
  },
  {
    type: "slack",
    name: "Slack",
    description: "Search messages for context.",
    connected: true,
  },
  {
    type: "notion",
    name: "Notion",
    description: "Pull pages into context.",
    connected: false,
  },
  {
    type: "github",
    name: "GitHub",
    description: "Issues and PRs for context.",
    connected: false,
  },
  {
    type: "mem0",
    name: "Memory",
    description: "Long-term preferences and facts.",
    connected: false,
  },
] as const;

export function ConnectorsDemo({
  onTab = () => {},
}: {
  onTab?: (t: DemoTab) => void;
}) {
  const [rows, setRows] = useState(
    connectorCatalog.map((c) => ({ ...c, connected: c.connected })),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const connectedCount = rows.filter((r) => r.connected).length;
  const connectedTypes = rows
    .filter((r) => r.connected)
    .map((r) => r.type)
    .join(", ");

  function toggle(type: string) {
    setBusy(type);
    window.setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.type === type ? { ...r, connected: !r.connected } : r,
        ),
      );
      setBusy(null);
    }, 220);
  }

  return (
    <div className="mx-auto flex h-full max-w-md flex-col justify-center gap-6 py-6">
      <div className="space-y-3 text-center">
        <h2 className="font-heading text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl">
          Connectors
        </h2>
        <p className="text-sm font-semibold leading-relaxed text-neutral-500">
          Paste a token once, saved on your workspace.
        </p>
        <p className="text-sm font-semibold leading-relaxed text-neutral-500">
          <span className="text-foreground">{connectedCount}</span> source
          {connectedCount === 1 ? "" : "s"} connected
          {connectedCount > 0 ? ` · ${connectedTypes}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onTab("Playground")}
          className="inline-flex flex-1 items-center justify-center rounded-sm bg-secondary px-4 py-2.5 text-sm font-bold text-white"
        >
          See it work
        </button>
        <button
          type="button"
          onClick={() => onTab("Sources")}
          className="inline-flex flex-1 items-center justify-center rounded-sm border border-border px-4 py-2.5 text-sm font-semibold"
        >
          Add documents
        </button>
      </div>

      <ul className="space-y-1.5 text-left">
        {rows.map((row, i) => (
          <li
            key={row.type}
            className="rounded-sm border border-border px-3 py-2.5"
          >
            <div className="flex gap-3">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold",
                  row.connected
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-500",
                )}
              >
                {row.connected ? "✓" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-semibold tracking-[-0.02em]">
                      {row.name}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold leading-relaxed text-neutral-500">
                      {row.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy === row.type}
                    onClick={() => toggle(row.type)}
                    className="shrink-0 pt-0.5 text-xs font-semibold text-foreground underline-offset-4 hover:underline disabled:opacity-40"
                  >
                    {busy === row.type ? "…" : row.connected ? "Off" : "On"}
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductShell({
  tab,
  onTab,
  rail,
  onRail,
  fill = false,
  preferContext = false,
}: {
  tab: DemoTab;
  onTab: (t: DemoTab) => void;
  rail: number;
  onRail: (i: number) => void;
  /** Stretch to parent (auth / journey half-screen crops). */
  fill?: boolean;
  /** Open playground on a completed ask with Show context visible. */
  preferContext?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex overflow-hidden border border-black/8 bg-white",
        fill
          ? "absolute inset-0 h-full w-full rounded-none shadow-none"
          : "h-[720px] w-[1180px] rounded-sm shadow-[0_18px_50px_rgba(0,0,0,0.14)]",
      )}
    >
      <aside className="flex w-12 shrink-0 flex-col items-center gap-3 bg-neutral-900 py-3">
        {railIcons.map((Icon, i) => (
          <button
            key={Icon.displayName ?? i}
            type="button"
            onClick={() => {
              onRail(i);
              if (i === 0) onTab("Home");
              if (i === 1) onTab("Playground");
              if (i === 2) onTab("Connectors");
              if (i === 3) onTab("Sources");
              // Settings rail: hover/active only, no content switch
            }}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-sm transition-colors",
              rail === i
                ? "bg-white/15 text-white"
                : "text-neutral-400 hover:bg-white/10 hover:text-white",
            )}
            aria-label={Icon.displayName ?? "nav"}
          >
            <Icon size={16} strokeWidth={1.75} />
          </button>
        ))}
        <div className="mt-auto flex w-full flex-col items-center gap-2 border-t border-white/10 pt-3">
          {upcomingRailIcons.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex size-8 items-center justify-center rounded-sm text-neutral-500"
              aria-label={`${label}, coming soon`}
              title={`${label}, coming soon`}
            >
              <Icon size={16} strokeWidth={1.75} />
            </span>
          ))}
        </div>
      </aside>

      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-neutral-50">
        <div className="px-3 py-3">
          <div className="min-w-0">
            <p className="font-heading truncate text-sm font-semibold tracking-[-0.02em]">
              Nikhil Rajpurohit
            </p>
            <p className="truncate text-[10px] font-semibold text-neutral-500">
              Workspace & IDs →
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-2 pb-3">
          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Inbox
            </p>
            <ul className="mt-1 space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => onTab("Connectors")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold hover:bg-black/5",
                    tab === "Connectors" ? "bg-black/5" : "",
                  )}
                >
                  <span>All sources</span>
                  <span className="text-[10px] text-neutral-500">2</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTab("Home")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold hover:bg-black/5",
                    tab === "Home" ? "bg-black/5" : "",
                  )}
                >
                  <span>My context</span>
                  <span className="text-[10px] text-neutral-500">2</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Sources
            </p>
            <ul className="mt-1 space-y-0.5">
              {sources.map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.name === "Documents") onTab("Sources");
                      else onTab("Connectors");
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-foreground hover:bg-black/5"
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", item.tone)} />
                      {item.name}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              View
            </p>
            <ul className="mt-1 space-y-0.5">
              {(
                [
                  { name: "Playground", tab: "Playground" as const, live: true },
                  { name: "Keys", tab: "API" as const, live: false },
                  { name: "Docs", tab: "Docs" as const, live: false },
                ] as const
              ).map((item) => (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.live) onTab(item.tab);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-black/5 hover:text-foreground",
                      item.live && tab === item.tab
                        ? "bg-black/5 text-foreground"
                        : "text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-neutral-400" />
                      {item.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <RoadmapSidebar compact />
        </div>

        <div className="border-t border-border px-2 py-2">
          <span className="block w-full rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-neutral-500">
            Sign out
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            {topTabs.map((t) => {
              const inert = t === "API" || t === "Docs" || t === "Settings";
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (!inert) onTab(t);
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer pb-2 pt-1 font-heading text-xs font-semibold tracking-[-0.01em] transition-colors",
                    !inert && tab === t
                      ? "border-b-2 border-foreground text-foreground"
                      : "text-neutral-500 hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-1.5 rounded-sm border border-border bg-neutral-50 px-2 py-1">
            <Search size={12} className="text-neutral-500" />
            <input
              type="search"
              placeholder="Filter sources"
              className="w-28 bg-transparent text-[11px] font-semibold outline-none placeholder:text-neutral-400"
            />
          </label>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 bg-white",
            tab === "Playground" ? "overflow-hidden p-0" : "overflow-auto p-4",
          )}
        >
          {tab === "Home" ? (
            <HomeDemo onTab={onTab} onRail={onRail} />
          ) : null}
          {tab === "Playground" ? (
            <PlaygroundDemo onTab={onTab} preferContext={preferContext} />
          ) : null}
          {tab === "Sources" ? <SourcesDemo /> : null}
          {tab === "Connectors" ? <ConnectorsDemo onTab={onTab} /> : null}
        </div>
      </div>
    </div>
  );
}

export function LandingPlayground({
  variant = "landing",
}: {
  variant?: "landing" | "auth";
}) {
  const isAuth = variant === "auth";
  const [tab, setTab] = useState<DemoTab>(isAuth ? "Playground" : "Playground");
  const [rail, setRail] = useState(isAuth ? 1 : 1);
  const { ref: frameRef, scale } = useFrameScale(FRAME_W);

  const shell = (
    <ProductShell
      tab={tab}
      onTab={setTab}
      rail={rail}
      onRail={setRail}
    />
  );

  return (
    <div
      className={
        isAuth
          ? "relative h-full min-h-screen w-full overflow-hidden rounded-l-2xl"
          : "hero-visual relative mx-auto w-full max-w-7xl overflow-hidden pl-2 sm:overflow-visible sm:px-4"
      }
    >
      <div
        className={
          isAuth
            ? "relative h-full w-full overflow-hidden"
            : "relative w-full overflow-hidden rounded-l-xl rounded-r-none sm:rounded-2xl"
        }
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
            radial-gradient(ellipse 90% 70% at 12% 20%, rgba(255, 190, 120, 0.95) 0%, transparent 55%),
            radial-gradient(ellipse 70% 55% at 88% 18%, rgba(255, 150, 80, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 85% 55% at 45% 100%, rgba(249, 115, 22, 0.65) 0%, transparent 55%),
            radial-gradient(ellipse 45% 35% at 65% 55%, rgba(254, 215, 170, 0.85) 0%, transparent 45%),
            linear-gradient(165deg, #fff7ed 0%, #ffedd5 42%, #fdba74 100%)
          `,
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-50 blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), transparent 55%)",
          }}
          aria-hidden="true"
        />

        {/* Mobile: zoomed landscape desktop, orange + shell clipped on the right */}
        {!isAuth ? (
          <div className="relative h-[300px] overflow-hidden sm:hidden">
            <div
              className="absolute left-[4%] top-[6%] origin-top-left"
              style={{ transform: "scale(0.58)" }}
            >
              <div className="overflow-hidden rounded-sm shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
                <ProductShell
                  tab={tab}
                  onTab={setTab}
                  rail={rail}
                  onRail={setRail}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div
          className={
            isAuth
              ? "absolute inset-0 overflow-hidden"
              : "relative hidden min-h-[36rem] items-center justify-center px-10 py-14 sm:flex lg:min-h-[42rem] lg:px-14 lg:py-16"
          }
        >
          <div
            ref={isAuth ? undefined : frameRef}
            className={
              isAuth
                ? "absolute left-[6%] top-[8%] h-[720px] w-[1180px]"
                : "relative w-[94%] max-w-[1080px]"
            }
            style={
              isAuth
                ? undefined
                : {
                    height: scale > 0 ? FRAME_H * scale : undefined,
                    aspectRatio:
                      scale > 0 ? undefined : `${FRAME_W} / ${FRAME_H}`,
                  }
            }
          >
            <div
              className={isAuth ? undefined : "origin-top-left"}
              style={
                isAuth
                  ? undefined
                  : {
                      transform: `scale(${scale || 0.01})`,
                      visibility: scale > 0 ? "visible" : "hidden",
                    }
              }
            >
              {shell}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
