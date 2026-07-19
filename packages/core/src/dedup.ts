import type { ContextItem } from "@contextengine/retriever-interface";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 400);
}

function jaccard(a: string, b: string): number {
  const sa = new Set(a.split(" ").filter(Boolean));
  const sb = new Set(b.split(" ").filter(Boolean));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  return inter / (sa.size + sb.size - inter);
}

/**
 * Drop near-duplicate chunks across sources. Keeps higher-score item.
 * Returns kept list + discarded ids for diagnostics.
 */
export function dedupeDocuments(
  items: ContextItem[],
  threshold = 0.85,
): { kept: ContextItem[]; discarded: { id: string; reason: string }[] } {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const kept: ContextItem[] = [];
  const discarded: { id: string; reason: string }[] = [];

  for (const item of sorted) {
    const norm = normalize(item.text);
    const dupOf = kept.find((k) => jaccard(norm, normalize(k.text)) >= threshold);
    if (dupOf) {
      discarded.push({
        id: item.id,
        reason: `dedup: similar to ${dupOf.id}`,
      });
      continue;
    }
    kept.push(item);
  }
  return { kept, discarded };
}
