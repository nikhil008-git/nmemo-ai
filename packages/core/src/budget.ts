import type { ContextItem, MemoryItem } from "@contextengine/retriever-interface";
import { estimateTokens } from "./prompt.js";

export type BudgetResult = {
  documents: ContextItem[];
  memories: MemoryItem[];
  discarded: { id: string; reason: string }[];
  tokenUsage: {
    total: number;
    memory: number;
    documents: number;
    workspace: number;
    instructions: number;
  };
};

const DEFAULT_BUDGET = 6000;
const INSTRUCTION_RESERVE = 200;

/** Fit memories + documents into a token budget (memories preferred). */
export function applyTokenBudget(
  documents: ContextItem[],
  memories: MemoryItem[],
  budget = DEFAULT_BUDGET,
): BudgetResult {
  const discarded: { id: string; reason: string }[] = [];
  let remaining = Math.max(500, budget - INSTRUCTION_RESERVE);

  const keptMemories: MemoryItem[] = [];
  for (const m of memories) {
    const t = estimateTokens(m.text);
    if (t > remaining) {
      discarded.push({ id: m.id, reason: "token budget: memory trimmed" });
      continue;
    }
    keptMemories.push(m);
    remaining -= t;
  }

  const keptDocs: ContextItem[] = [];
  for (const d of documents) {
    const t = estimateTokens(d.text);
    if (t > remaining) {
      discarded.push({ id: d.id, reason: "token budget: document trimmed" });
      continue;
    }
    keptDocs.push(d);
    remaining -= t;
  }

  const memTokens = estimateTokens(keptMemories.map((m) => m.text).join(" "));
  const docTokens = estimateTokens(keptDocs.map((d) => d.text).join(" "));

  return {
    documents: keptDocs,
    memories: keptMemories,
    discarded,
    tokenUsage: {
      total: memTokens + docTokens + INSTRUCTION_RESERVE,
      memory: memTokens,
      documents: docTokens,
      workspace: 0,
      instructions: INSTRUCTION_RESERVE,
    },
  };
}
