import type { ContextItem, MemoryItem } from "@contextengine/retriever-interface";

const SOURCE_RELIABILITY: Record<string, number> = {
  qdrant: 1,
  mem0: 1.05,
  github: 0.95,
  notion: 0.9,
  slack: 0.85,
};

/** Re-score items: retriever score × source reliability + slight length penalty. */
export function rankDocuments(items: ContextItem[]): ContextItem[] {
  return items
    .map((item) => {
      const provider =
        typeof item.metadata?.provider === "string"
          ? item.metadata.provider
          : item.source;
      const reliability = SOURCE_RELIABILITY[provider] ?? 0.8;
      const lengthPenalty = Math.min(0.1, estimateLen(item.text) / 50_000);
      const score = Math.max(0, item.score * reliability - lengthPenalty);
      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function rankMemories(items: MemoryItem[]): MemoryItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}

function estimateLen(text: string) {
  return text.length;
}
