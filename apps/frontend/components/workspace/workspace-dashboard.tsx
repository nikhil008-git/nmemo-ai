"use client";

/**
 * The three-pane workspace from the landing hero, as the real dashboard:
 * sessions rail · task · /context inspector.
 *
 * Everything here is this workspace's own data — the last `/ask` run, the
 * documents, the connected sources. There is no fixture behind it: with nothing
 * ingested and nothing asked, the panes are empty and say so.
 *
 * Below `lg` the inspector collapses into a toggle, and below `md` the rail
 * does too — the app shell already owns mobile navigation, so the panes only
 * have to degrade, not duplicate it.
 */

import { useEffect, useState } from "react";
import { PanelLeft, PanelRight } from "lucide-react";

import {
  ContextInspector,
  type InspectorTab,
} from "@/components/workspace/context-inspector";
import { SessionsRail, type RailTab } from "@/components/workspace/sessions-rail";
import { TaskPane } from "@/components/workspace/task-pane";
import { listDocuments } from "@/lib/api";
import {
  readLastTask,
  readStoredContext,
  toContextView,
  type ContextView,
} from "@/lib/context-view";
import { useConnectors } from "@/lib/connectors-store";
import type { IngestedDocument } from "@/lib/types";
import { toTaskRun, type Episode } from "@/lib/workspace-view";
import { cn } from "@/lib/utils";

export function WorkspaceDashboard({
  workspaceName,
}: {
  workspaceName: string;
}) {
  const { connectors } = useConnectors();
  const [railTab, setRailTab] = useState<RailTab>("sessions");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("context");
  const [railOpen, setRailOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [view, setView] = useState<ContextView | null>(null);
  const [task, setTask] = useState<string | null>(null);

  /* The last real /ask run, as the playground left it. */
  useEffect(() => {
    const stored = readStoredContext();
    if (stored) setView(toContextView(stored));
    setTask(readLastTask());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void listDocuments()
      .then(({ documents: docs }) => {
        if (!cancelled) setDocuments(docs);
      })
      .catch(() => {
        /* an empty rail is the correct fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const connected = connectors.filter(
    (c) => c.status === "connected" && c.type !== "qdrant" && c.type !== "groq",
  );

  const run = view ? toTaskRun(view, task) : null;
  const episodes: Episode[] = task
    ? [{ id: "live", title: task, meta: "live", live: true }]
    : [];
  const footer = `${documents.length} document${
    documents.length === 1 ? "" : "s"
  } · ${connected.length} source${connected.length === 1 ? "" : "s"}`;

  const rail = (
    <SessionsRail
      tab={railTab}
      onTabChange={setRailTab}
      workspaceName={workspaceName}
      episodes={episodes}
      documents={documents}
      footer={footer}
    />
  );

  const inspector = (
    <ContextInspector
      view={view}
      tab={inspectorTab}
      onTabChange={setInspectorTab}
    />
  );

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-surface-soft">
      <aside className="hidden w-60 shrink-0 border-r border-ink/[0.07] md:flex md:flex-col">
        {rail}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b border-ink/[0.07] px-2 py-1.5 lg:hidden">
          <PaneToggle
            label="Sessions"
            icon={PanelLeft}
            active={railOpen}
            onClick={() => setRailOpen((v) => !v)}
            className="md:hidden"
          />
          <PaneToggle
            label="Context"
            icon={PanelRight}
            active={inspectorOpen}
            onClick={() => setInspectorOpen((v) => !v)}
            className="ml-auto"
          />
        </div>

        {railOpen ? (
          <div className="max-h-64 shrink-0 overflow-hidden border-b border-ink/[0.07] md:hidden">
            {rail}
          </div>
        ) : null}

        {inspectorOpen ? (
          <div className="max-h-72 shrink-0 overflow-hidden border-b border-ink/[0.07] lg:hidden">
            {inspector}
          </div>
        ) : null}

        <TaskPane
          run={run}
          memoryOn={Boolean(view)}
          className="min-h-0 flex-1"
        />
      </section>

      <aside className="hidden w-80 shrink-0 border-l border-ink/[0.07] lg:flex lg:flex-col">
        {inspector}
      </aside>
    </div>
  );
}

function PaneToggle({
  label,
  icon: Icon,
  active,
  onClick,
  className,
}: {
  label: string;
  icon: typeof PanelLeft;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.6875rem] font-medium transition-colors",
        active ? "bg-ink/[0.08] text-ink/80" : "text-ink/40 hover:text-ink/70",
        className,
      )}
    >
      <Icon size={13} strokeWidth={1.75} />
      {label}
    </button>
  );
}
