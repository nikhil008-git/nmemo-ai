import type {
  ContextItem,
  MemoryItem,
} from "@contextengine/retriever-interface";

/**
 * Assembled agent instructions / system context.
 * Callers should pass the user question separately as the user message.
 */
export function buildPrompt(
  _query: string,
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
          .map((d, i) => `[${i + 1}] ${d.title ?? d.source}\n${d.text}`)
          .join("\n\n");

  return [
    "Use only the memories and retrieved context below.",
    "Cite sources as [1], [M1], etc. when helpful.",
    "If the context does not answer the question, say so clearly.",
    "",
    "User memory",
    memSection,
    "",
    "Retrieved context",
    docSection,
  ].join("\n");
}

export function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}
