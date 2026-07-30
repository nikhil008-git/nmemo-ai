"use client";

/**
 * The right pane of the workspace: what the last run actually put in the
 * prompt. This is the landing hero's `/context` rail (components/landing/
 * mockups.tsx) rebuilt as a real component — type in rem, no aspect box, and
 * every number comes from `ContextView` rather than a fixture.
 */

import Link from "next/link";

import type { ContextView } from "@/lib/context-view";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "context", label: "/context" },
  { id: "memory", label: "/memory" },
  { id: "resume", label: "/resume" },
] as const;

export type InspectorTab = (typeof TABS)[number]["id"];

export function ContextInspector({
  view,
  tab,
  onTabChange,
  className,
}: {
  view: ContextView | null;
  tab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col bg-rail-deep", className)}>
      <header className="flex shrink-0 items-center gap-3 border-b border-ink/[0.07] px-3 py-2.5 text-xs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={cn(
              "transition-colors hover:text-ink/70",
              tab === t.id ? "text-ink/85" : "text-ink/35",
            )}
          >
            {t.label}
          </button>
        ))}
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        {tab === "context" ? <ContextTab view={view} /> : null}
        {tab === "memory" ? <MemoryTab view={view} /> : null}
        {tab === "resume" ? <ResumeTab view={view} /> : null}
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-4 text-xs leading-relaxed text-ink/35">
      {children}
    </div>
  );
}

function ContextTab({ view }: { view: ContextView | null }) {
  if (!view) {
    return (
      <Empty>
        No context run yet. Ask something in the{" "}
        <Link
          href="/playground"
          className="text-ink/60 underline underline-offset-4"
        >
          playground
        </Link>{" "}
        and the selection lands here.
      </Empty>
    );
  }

  const { budget, layers } = view;

  return (
    <div className="space-y-3 px-3 py-3 text-xs leading-relaxed">
      <div>
        <p className="tabular-nums text-ink/30">
          prompt budget {budget.total.toLocaleString()} · used{" "}
          {budget.used.toLocaleString()}
        </p>
        <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
          {layers.map((l) => (
            <span
              key={l.label}
              className={l.bar}
              style={{
                width: `${Math.min(100, (l.tokens / budget.total) * 100)}%`,
              }}
            />
          ))}
        </div>
      </div>

      <ul className="space-y-1 text-ink/40">
        {layers.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <span className={cn("size-1.5 rounded-full", l.bar)} />
            <span>{l.label}</span>
            <span className="ml-auto text-ink/25">
              {l.tokens.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-ink/[0.07] pt-2.5">
        <p className="text-ink/30">top recall</p>
        {view.recall.length === 0 ? (
          <p className="mt-1.5 text-ink/25">
            Nothing ranked on the last run.
          </p>
        ) : (
          <div className="mt-1.5 space-y-2">
            {view.recall.map((m) => (
              <div key={m.text}>
                <div className="flex items-start gap-2">
                  <span className="text-ink/60">{m.text}</span>
                  <span className="ml-auto shrink-0 text-status-ok/70">
                    {m.score.toFixed(2)}
                  </span>
                </div>
                <p className="text-ink/25">{m.source}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-ink/[0.07] pt-2.5 tabular-nums text-ink/30">
        <span>grounding {view.grounding}%</span>
        {view.discarded > 0 ? (
          <span className="ml-auto">{view.discarded} discarded</span>
        ) : null}
      </div>

      {view.superseded.length > 0 ? (
        <div className="space-y-1 rounded-md border border-status-warn/20 bg-status-warn/[0.06] p-2 text-status-warn/70">
          <p>
            {view.superseded.length} memor
            {view.superseded.length === 1 ? "y" : "ies"} superseded
          </p>
          {view.superseded.map((line) => (
            <p key={line} className="text-status-warn/55">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Which sources answered, and how fast — the platform's live source status. */
function MemoryTab({ view }: { view: ContextView | null }) {
  if (!view || view.sources.length === 0) {
    return <Empty>No sources were queried on the last run.</Empty>;
  }

  return (
    <div className="space-y-1 px-3 py-3 text-xs leading-relaxed text-ink/45">
      <p className="pb-1 text-ink/30">sources queried</p>
      {view.sources.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              s.responded ? "bg-status-ok/70" : "bg-ink/20",
            )}
          />
          <span className="truncate">{s.name}</span>
          <span className="ml-auto shrink-0 tabular-nums text-ink/25">
            {s.responded ? `${s.latencyMs}ms` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The paste-able packet. Built from the run that actually happened. */
function ResumeTab({ view }: { view: ContextView | null }) {
  if (!view) {
    return <Empty>Nothing to resume yet.</Empty>;
  }

  return (
    <div className="space-y-2 px-3 py-3 text-xs leading-relaxed">
      <p className="text-ink/85">nmemo resume --print</p>
      <dl className="space-y-2 text-ink/60">
        <Row label="Context">
          {view.budget.used.toLocaleString()} tokens · {view.recall.length}{" "}
          memories
        </Row>
        <Row label="Sources">
          {view.sources.filter((s) => s.responded).length} of{" "}
          {view.sources.length} responded
        </Row>
        <Row label="Grounding">{view.grounding}%</Row>
        <Row label="Conflicts">
          {view.superseded.length === 0 ? "none" : view.superseded.length}
        </Row>
      </dl>
      {view.citations.length > 0 ? (
        <div className="border-t border-ink/[0.07] pt-2.5">
          <p className="text-ink/30">evidence</p>
          <ul className="mt-1 space-y-1">
            {view.citations.slice(0, 5).map((c) => (
              <li key={c.source_url} className="text-ink/50">
                <span className="block truncate">{c.title}</span>
                <span className="block truncate text-ink/25">
                  {c.source_url}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="border-t border-ink/[0.07] pt-2.5 text-ink/25">
        Packet export lands with the CLI — this is the same data it will carry.
      </p>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <dt className="w-[5.5rem] shrink-0 text-ink/30">{label}</dt>
      <dd className="min-w-0 tabular-nums">{children}</dd>
    </div>
  );
}
