import type {
  Citation,
  ContextItem,
  GetContextResult,
  MemoryItem,
  Retriever,
  SourceStatus,
} from "@contextengine/retriever-interface";
import { RagRetriever } from "@contextengine/rag-retriever";
import { applyTokenBudget } from "./budget.js";
import { dedupeDocuments } from "./dedup.js";
import { buildPrompt, estimateTokens } from "./prompt.js";
import { rankDocuments, rankMemories } from "./ranking.js";
import {
  GitHubRetriever,
  Mem0Retriever,
  NotionRetriever,
  SlackRetriever,
} from "./retrievers/http-retrievers.js";
import { routeConnectors } from "./router.js";
import type { ConnectorRef, GetContextInput } from "./types.js";

const SOURCE_TIMEOUT_MS = 4000;
const RETRIEVE_RETRIES = 1;

const SOURCE_NAMES: Record<string, string> = {
  qdrant: "Documents",
  mem0: "Memory",
  slack: "Slack",
  notion: "Notion",
  github: "GitHub",
  mcp: "MCP",
};

function isLiveToken(token: string | undefined): token is string {
  return Boolean(token && token !== "dev-mock-token");
}

function buildRetrievers(connectors: ConnectorRef[]): Retriever[] {
  const list: Retriever[] = [];
  for (const c of connectors) {
    if (c.status !== "connected") continue;
    const config = (c.config ?? {}) as {
      accessToken?: string;
      apiKey?: string;
      mock?: boolean;
    };
    if (config.mock) continue;
    if (c.type === "qdrant") list.push(new RagRetriever());
    if (c.type === "github" && isLiveToken(config.accessToken)) {
      list.push(new GitHubRetriever(config));
    }
    if (c.type === "slack" && isLiveToken(config.accessToken)) {
      list.push(new SlackRetriever(config));
    }
    if (c.type === "notion" && isLiveToken(config.accessToken)) {
      list.push(new NotionRetriever(config));
    }
    if (c.type === "mem0" && config.apiKey) {
      list.push(new Mem0Retriever(config));
    }
  }
  return list;
}

async function retrieveWithTimeout(
  retriever: Retriever,
  query: string,
  opts: { userId: string; workspaceId: string },
): Promise<{ items: ContextItem[]; latencyMs: number; error?: string }> {
  const started = Date.now();
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= RETRIEVE_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
    try {
      const items = await retriever.retrieve(query, {
        ...opts,
        signal: controller.signal,
      });
      return { items, latencyMs: Date.now() - started };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "retrieve failed";
      if (attempt < RETRIEVE_RETRIES) {
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    items: [],
    latencyMs: Date.now() - started,
    ...(lastError ? { error: lastError } : { error: "retrieve failed" }),
  };
}

function toCitations(documents: ContextItem[]): Citation[] {
  return documents.map((d, i) => {
    const citation: Citation = {
      id: `c-${i}`,
      source: d.source,
      title: d.title ?? d.source,
      snippet: d.text.slice(0, 200),
    };
    if (d.source.startsWith("http")) {
      citation.url = d.source;
    }
    return citation;
  });
}

async function runGetContext(
  input: GetContextInput,
  fast: boolean,
): Promise<GetContextResult> {
  const routed = routeConnectors(input.query, input.connectors, { fast });
  const retrievers = buildRetrievers(routed.selected);

  const sources: SourceStatus[] = [];
  const latencyBySource: Record<string, number> = {};
  const discarded: { id: string; reason: string }[] = routed.skipped.map(
    (s) => ({
      id: s.type,
      reason: s.reason,
    }),
  );
  let documents: ContextItem[] = [];
  let memories: MemoryItem[] = [];

  for (const s of routed.skipped) {
    sources.push({
      id: s.type,
      name: SOURCE_NAMES[s.type] ?? s.type,
      queried: false,
      responded: false,
      latencyMs: 0,
    });
  }

  await Promise.all(
    retrievers.map(async (retriever) => {
      const result = await retrieveWithTimeout(retriever, input.query, {
        userId: input.userId,
        workspaceId: input.workspaceId,
      });
      latencyBySource[retriever.id] = result.latencyMs;
      sources.push({
        id: retriever.id,
        name: SOURCE_NAMES[retriever.id] ?? retriever.id,
        queried: true,
        responded: !result.error,
        latencyMs: result.latencyMs,
      });
      if (result.error) {
        discarded.push({ id: retriever.id, reason: result.error });
        return;
      }
      if (retriever.id === "mem0") {
        memories = result.items.map((i) => ({
          id: i.id,
          text: i.text,
          score: i.score,
        }));
      } else {
        documents.push(...result.items);
      }
    }),
  );

  documents = rankDocuments(documents);
  memories = rankMemories(memories);

  const deduped = dedupeDocuments(documents);
  documents = deduped.kept;
  discarded.push(...deduped.discarded);

  const budgeted = applyTokenBudget(
    documents,
    memories,
    input.tokenBudget ?? 6000,
  );
  documents = budgeted.documents;
  memories = budgeted.memories;
  discarded.push(...budgeted.discarded);

  const rankingScores = [
    ...documents.map((d) => ({
      id: d.id,
      score: d.score,
      reason: "Ranked (score × source reliability)",
    })),
    ...memories.map((m) => ({
      id: m.id,
      score: m.score,
      reason: "Memory score",
    })),
  ];

  const prompt = buildPrompt(input.query, documents, memories);
  // Prefer budget accounting; fall back if empty
  const tokenUsage = budgeted.tokenUsage;
  if (tokenUsage.total === tokenUsage.instructions) {
    const docTokens = estimateTokens(documents.map((d) => d.text).join(" "));
    const memTokens = estimateTokens(memories.map((m) => m.text).join(" "));
    tokenUsage.documents = docTokens;
    tokenUsage.memory = memTokens;
    tokenUsage.total = docTokens + memTokens + tokenUsage.instructions;
  }

  return {
    prompt,
    memories,
    documents,
    sources,
    citations: toCitations(documents),
    tokenUsage,
    diagnostics: {
      rankingScores,
      discarded,
      conflicts: [],
      latencyBySource,
    },
  };
}

export async function getContext(
  input: GetContextInput,
): Promise<GetContextResult> {
  return runGetContext(input, false);
}

export async function getContextFast(
  input: GetContextInput,
): Promise<GetContextResult> {
  return runGetContext(input, true);
}
