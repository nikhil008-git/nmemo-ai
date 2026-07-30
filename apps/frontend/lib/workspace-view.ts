/**
 * The shapes the three panes render.
 *
 * Only real data reaches these: a live `/ask` run adapted from the platform.
 * Anything the platform does not return yet — an agent plan, tool calls, an
 * approval gate — is left empty and the pane skips the block, rather than
 * filling it with a fixture.
 */

import type { ContextView } from "@/lib/context-view";

export type Episode = {
  id: string;
  title: string;
  meta: string;
  live?: boolean;
};

export type SelectedItem = {
  kind: string;
  text: string;
};

export type StateRow = {
  label: string;
  value: string;
  tone?: "plain" | "ok" | "bad" | "figure";
};

export type TaskRun = {
  title: string;
  meta: string;
  plan: string[];
  selected: SelectedItem[];
  toolCalls: string[];
  /** Header for the working-state block, e.g. "step 6". */
  step?: string;
  state: StateRow[];
  approval?: { action: string; target: string; keys: string };
  save?: string;
};

/** A live `/ask` run, in the shape the centre pane renders. */
export function toTaskRun(view: ContextView, title: string | null): TaskRun {
  return {
    title: title ?? "Untitled run",
    meta: `${view.budget.used.toLocaleString()} tokens · ${
      view.sources.length
    } source${view.sources.length === 1 ? "" : "s"}`,
    plan: [],
    selected: view.citations.map((c) => ({
      kind: "Evidence",
      text: c.title,
    })),
    toolCalls: view.sources.map(
      (s) =>
        `${s.name}${s.responded ? ` · ${s.latencyMs}ms` : " · no answer"}`,
    ),
    state: [
      {
        label: "selected",
        value: `${view.recall.length} ranked · ${view.citations.length} cited`,
      },
      ...(view.discarded > 0
        ? [
            {
              label: "dropped",
              value: `${view.discarded} below threshold`,
              tone: "bad" as const,
            },
          ]
        : []),
      ...(view.superseded.length > 0
        ? [
            {
              label: "conflicts",
              value: `${view.superseded.length} superseded`,
              tone: "bad" as const,
            },
          ]
        : []),
      {
        label: "grounding",
        value: `${view.grounding}%`,
        tone: "ok" as const,
      },
      {
        label: "budget",
        value: `${view.budget.used.toLocaleString()} / ${view.budget.total.toLocaleString()}`,
        tone: "figure" as const,
      },
    ],
  };
}
