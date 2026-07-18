import type {
  Citation,
  ContextItem,
  GetContextResult,
  MemoryItem,
  Retriever,
  SourceStatus,
} from "@contextengine/retriever-interface";
import { RagRetriever } from "@contextengine/rag-retriever";
import { buildPrompt, estimateTokens } from "./prompt.js";
import {
  GitHubRetriever,
  Mem0Retriever,
  NotionRetriever,
  SlackRetriever,
} from "./retrievers/http-retrievers.js";
import type { ConnectorRef, GetContextInput } from "./types.js";

const SOURCE_TIMEOUT_MS = 4000;

const SOURCE_NAMES: Record<string, string> = {
  qdrant: "Documents",
  mem0: "Memory",
  slack: "Slack",
  notion: "Notion",
  github: "GitHub",
  mcp: "MCP",
};

function buildRetrievers(connectors: ConnectorRef[]): Retriever[] {
  const list: Retriever[] = [];
  for (const c of connectors) {
    if (c.status !== "connected") continue;
    const config = (c.config ?? {}) as {
      accessToken?: string;
      apiKey?: string;
    };
    if (c.type === "qdrant") list.push(new RagRetriever());
    if (c.type === "github" && config.accessToken) {
      list.push(new GitHubRetriever(config));
    }
    if (c.type === "slack" && config.accessToken) {
      list.push(new SlackRetriever(config));
    }
    if (c.type === "notion" && config.accessToken) {
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const items = await retriever.retrieve(query, {
      ...opts,
      signal: controller.signal,
    });
    return { items, latencyMs: Date.now() - started };
  } catch (err) {
    return {
      items: [],
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : "retrieve failed",
    };
  } finally {
    clearTimeout(timer);
  }
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

export async function getContext(
  input: GetContextInput,
): Promise<GetContextResult> {
  const retrievers = buildRetrievers(input.connectors);

  const sources: SourceStatus[] = [];
  const latencyBySource: Record<string, number> = {};
  const discarded: { id: string; reason: string }[] = [];
  let documents: ContextItem[] = [];
  let memories: MemoryItem[] = [];

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

  documents = documents.sort((a, b) => b.score - a.score);

  const rankingScores = [
    ...documents.map((d) => ({
      id: d.id,
      score: d.score,
      reason: "Retriever score",
    })),
    ...memories.map((m) => ({
      id: m.id,
      score: m.score,
      reason: "Memory score",
    })),
  ];

  const prompt = buildPrompt(input.query, documents, memories);
  const docTokens = estimateTokens(documents.map((d) => d.text).join(" "));
  const memTokens = estimateTokens(memories.map((m) => m.text).join(" "));
  const instructionTokens = estimateTokens(
    "Answer using the relevant documents and memories below.",
  );

  return {
    prompt,
    memories,
    documents,
    sources,
    citations: toCitations(documents),
    tokenUsage: {
      total: docTokens + memTokens + instructionTokens,
      memory: memTokens,
      documents: docTokens,
      workspace: 0,
      instructions: instructionTokens,
    },
    diagnostics: {
      rankingScores,
      discarded,
      conflicts: [],
      latencyBySource,
    },
  };
}

export async function getContextFast(
  input: GetContextInput,
): Promise<GetContextResult> {
  return getContext(input);
}
