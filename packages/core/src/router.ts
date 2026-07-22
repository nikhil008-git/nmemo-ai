//How auto-select works right now


import type { ConnectorRef } from "./types.js";

/**
 * Cheap source router: pick which connected sources to hit for this query.
 * Always keeps memory + docs when connected; fans out others by keywords.
 */
export function routeConnectors(
  query: string,
  connectors: ConnectorRef[],
  opts?: { fast?: boolean },
): { selected: ConnectorRef[]; skipped: { type: string; reason: string }[] } {
  const connected = connectors.filter((c) => c.status === "connected");
  const skipped: { type: string; reason: string }[] = [];
  const q = query.toLowerCase();

  if (opts?.fast) {
    const selected = connected.filter(
      (c) => c.type === "mem0" || c.type === "qdrant",
    );
    for (const c of connected) {
      if (c.type !== "mem0" && c.type !== "qdrant") {
        skipped.push({ type: c.type, reason: "fast path skips live sources" });
      }
    }
    return { selected, skipped };
  }

  const wantsGithub =
    /\b(github|repo|repos|pull request|\bpr\b|issue|commit|@[\w-]+)\b/i.test(q);
  const wantsSlack =
    /\b(slack|channel|thread|dm|message|standup)\b/i.test(q);
  const wantsNotion =
    /\b(notion|wiki|page|doc|docs|spec|notes)\b/i.test(q);

  // If query is generic, hit everything connected (small fan-out today).
  const selective = wantsGithub || wantsSlack || wantsNotion;

  const selected: ConnectorRef[] = [];
  for (const c of connected) {
    if (c.type === "mem0" || c.type === "qdrant") {
      selected.push(c);
      continue;
    }
    if (!selective) {
      selected.push(c);
      continue;
    }
    if (c.type === "github" && wantsGithub) {
      selected.push(c);
      continue;
    }
    if (c.type === "slack" && wantsSlack) {
      selected.push(c);
      continue;
    }
    if (c.type === "notion" && wantsNotion) {
      selected.push(c);
      continue;
    }
    // Always include unmatched OAuth sources lightly when selective — still useful.
    // Actually skip to save latency when selective keywords present.
    skipped.push({ type: c.type, reason: "router: low relevance for query" });
  }

  return { selected, skipped };
}
