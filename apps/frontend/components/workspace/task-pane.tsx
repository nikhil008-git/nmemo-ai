"use client";

/**
 * The centre pane: the task, the plan, the context that was selected for it,
 * the tools it called, the working state, and the gates.
 *
 * Every block is optional and driven by the run: a live `/ask` run carries no
 * plan, tool calls, or approval gate yet, so those blocks are not drawn at all
 * rather than filled with placeholder content.
 */

import Link from "next/link";
import { Check } from "lucide-react";

import type { TaskRun } from "@/lib/workspace-view";
import { cn } from "@/lib/utils";

/* Everything is Inter — numbers and paths get tabular figures, not a mono face. */
const TONE: Record<string, string> = {
  plain: "text-ink/45",
  ok: "text-status-ok/75",
  bad: "text-status-bad/70",
  figure: "tabular-nums text-ink/45",
};

export function TaskPane({
  run,
  memoryOn,
  className,
}: {
  run: TaskRun | null;
  memoryOn: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col bg-surface", className)}>
      <header className="flex shrink-0 items-center gap-2 border-b border-ink/[0.07] px-4 py-3">
        <span className="truncate text-sm text-ink/80">
          {run?.title ?? "No open task"}
        </span>
        <span className="ml-auto hidden shrink-0 rounded border border-ink/10 px-1.5 py-0.5 text-[0.625rem] text-ink/40 sm:block">
          memory: {memoryOn ? "on" : "idle"}
        </span>
      </header>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5"
        data-lenis-prevent
      >
        <div className="mx-auto max-w-2xl space-y-3 text-[0.8125rem] leading-relaxed">
          {!run ? (
            <EmptyState />
          ) : (
            <>
              <p className="tabular-nums text-ink/30">{run.meta}</p>

              {run.plan.length > 0 ? (
                <div>
                  <p className="font-medium text-ink/80">Agent plan</p>
                  <ol className="mt-1 space-y-0.5 text-ink/50">
                    {run.plan.map((step, i) => (
                      <li key={step}>
                        {i + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {run.selected.length > 0 ? (
                <div className="rounded-md border border-ink/[0.07] bg-ink/[0.02] p-2.5">
                  <p className="mb-1 text-ink/45">Context selected</p>
                  <ul className="space-y-0.5">
                    {run.selected.map(({ kind, text }) => (
                      <li key={text} className="flex items-start gap-1.5">
                        <Check
                          size={11}
                          strokeWidth={2.5}
                          className="mt-1 shrink-0 text-status-ok/80"
                        />
                        <span className="min-w-0 text-ink/35">
                          <span className="font-medium text-ink/65">
                            {kind}:
                          </span>{" "}
                          <span>{text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {run.toolCalls.length > 0 ? (
                <div className="space-y-0.5 text-ink/45">
                  {run.toolCalls.map((call) => (
                    <p key={call}>
                      <span className="text-ink/25">Tool</span>{" "}
                      <span>{call}</span>
                    </p>
                  ))}
                </div>
              ) : null}

              {run.state.length > 0 ? (
                <div className="rounded-md border border-ink/[0.07] bg-ink/[0.02]">
                  <div className="flex items-center gap-2 border-b border-ink/[0.07] px-2.5 py-1.5">
                    <span className="text-ink/60">Working state</span>
                    {run.step ? (
                      <span className="text-ink/30">{run.step}</span>
                    ) : null}
                    <span className="ml-auto rounded border border-ink/10 px-1.5 py-0.5 text-[0.625rem] text-ink/45">
                      checkpointed
                    </span>
                  </div>
                  <div className="space-y-1 px-2.5 py-2">
                    {run.state.map((row) => (
                      <div key={row.label} className="flex gap-2">
                        <span className="w-16 shrink-0 text-ink/25">
                          {row.label}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 truncate",
                            TONE[row.tone ?? "plain"],
                          )}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {run.approval ? (
                <div className="rounded-md border border-ink/[0.07] bg-ink/[0.02] px-2.5 py-2 text-ink/45">
                  <span className="text-ink/25">Approval</span>{" "}
                  {run.approval.action}
                  <span className="text-ink/60">
                    {" "}
                    {run.approval.target}
                  </span>{" "}
                  <span className="text-ink/35">{run.approval.keys}</span>
                </div>
              ) : null}

              {run.save ? (
                <div className="rounded-md border border-ink/[0.07] bg-ink/[0.03] px-2.5 py-2 text-ink/30">
                  {run.save} <span className="text-ink/45">[Y/n]</span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center">
      <p className="text-sm text-ink/70">Nothing in flight.</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/35">
        Open a task in the playground and this pane shows the context selected
        for it, with the receipts on the right.
      </p>
      <Link
        href="/playground"
        className="mt-5 inline-flex items-center rounded-full bg-ink px-4 py-2 text-[0.8125rem] font-medium text-background transition-colors hover:bg-ink/85"
      >
        Start a task
      </Link>
    </div>
  );
}
