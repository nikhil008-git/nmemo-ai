/**
 * The view model behind the /context inspector.
 *
 * The dashboard never reads the platform payload directly — everything goes
 * through `toContextView` so the panes stay honest when the API's vocabulary
 * changes. Today the token buckets are the platform's own
 * (instructions/workspace/memory/documents); when the memory layers land
 * server-side, only the map below moves.
 */

import type { Diagnostics, SourceStatus, TokenUsage } from "@/lib/types";

/** Written by the playground after every /ask — the last real context run. */
export const CONTEXT_STORAGE_KEY = "nmemo:playground-context";
export const MESSAGES_STORAGE_KEY = "nmemo:playground-messages";

/** No budget endpoint yet; the inspector needs a denominator to draw a bar. */
export const PROMPT_BUDGET = 8000;

export type StoredContext = {
  citations: { source_url: string; title: string; snippet: string }[];
  groundingScore: number;
  context: {
    diagnostics: Diagnostics;
    tokenUsage: TokenUsage;
    sources: SourceStatus[];
  };
};

export type ContextLayer = {
  label: string;
  tokens: number;
  /** Tailwind background for the dot and its slice of the budget bar. */
  bar: string;
};

export type RecallRow = {
  text: string;
  score: number;
  source: string;
};

export type ContextView = {
  budget: { used: number; total: number };
  layers: ContextLayer[];
  recall: RecallRow[];
  /** Conflicts the engine resolved — the mockup's "superseded" strip. */
  superseded: string[];
  discarded: number;
  sources: SourceStatus[];
  grounding: number;
  citations: StoredContext["citations"];
};

const LAYERS: [keyof Omit<TokenUsage, "total">, string, string][] = [
  ["instructions", "system + rules", "bg-ink/25"],
  ["workspace", "workspace context", "bg-status-warn/70"],
  ["memory", "long-term memory", "bg-status-info/60"],
  ["documents", "document evidence", "bg-status-ok/60"],
];

export function toContextView(payload: StoredContext): ContextView {
  const usage = payload.context.tokenUsage;
  const diagnostics = payload.context.diagnostics;

  return {
    budget: { used: usage?.total ?? 0, total: PROMPT_BUDGET },
    layers: LAYERS.map(([key, label, bar]) => ({
      label,
      tokens: usage?.[key] ?? 0,
      bar,
    })),
    recall: [...(diagnostics?.rankingScores ?? [])]
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((r) => ({ text: r.id, score: r.score, source: r.reason })),
    superseded: (diagnostics?.conflicts ?? []).map(
      (c) => `${c.summary} → ${c.resolution}`,
    ),
    discarded: diagnostics?.discarded?.length ?? 0,
    sources: payload.context.sources ?? [],
    grounding: payload.groundingScore ?? 0,
    citations: payload.citations ?? [],
  };
}

export function readStoredContext(): StoredContext | null {
  try {
    const raw = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredContext;
    return parsed?.context ? parsed : null;
  } catch {
    return null;
  }
}

/** The last question asked — the dashboard uses it as the task title. */
export function readLastTask(): string | null {
  try {
    const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      role: string;
      parts?: { type: string; text?: string }[];
    }[];
    if (!Array.isArray(parsed)) return null;
    const last = [...parsed].reverse().find((m) => m.role === "user");
    const text = (last?.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}
