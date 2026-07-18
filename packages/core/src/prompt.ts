import type {
  ContextItem,
  MemoryItem,
} from "@contextengine/retriever-interface";

export function buildPrompt(
  query: string,
  documents: ContextItem[],
  memories: MemoryItem[] = [],
): string {
  const memSection =
    memories.length === 0
      ? "(no memories retrieved)"
      : memories.map((m, i) => `[M${i + 1}] ${m.text}`).join("\n");

  const docSection =
    documents.length === 0
      ? "(no documents retrieved)"
      : documents
          .map(
            (d, i) => `[${i + 1}] ${d.title ?? d.source}\n${d.text}`,
          )
          .join("\n\n");

  return [
    "System instructions",
    "Answer using the relevant memories and documents below. Cite sources when possible.",
    "",
    "User memory",
    memSection,
    "",
    "Relevant documents",
    docSection,
    "",
    "Current user message",
    query,
  ].join("\n");
}

export function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}
