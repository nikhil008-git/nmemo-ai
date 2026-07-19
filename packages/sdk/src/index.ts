import type { GetContextResult } from "@contextengine/retriever-interface";

export type {
  GetContextResult,
  Citation,
  ContextItem,
  Diagnostics,
  SourceStatus,
  TokenUsage,
} from "@contextengine/retriever-interface";

export type CreateEngineOptions = {
  apiKey: string;
  baseUrl?: string;
};

export type GetContextParams = {
  query: string;
  userId: string;
  workspaceId: string;
  conversationId?: string;
  agent?: string;
  /** Persist a completed turn to mem0 in the same request (after you have the assistant reply). */
  persistMemory?: {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
  };
};

export type WriteMemoryParams = {
  userId: string;
  workspaceId: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
};

export type WriteMemoryResult = {
  ok: boolean;
  written: boolean;
  skipped?: string;
};

export type ContextEngine = {
  getContext(params: GetContextParams): Promise<GetContextResult>;
  getContextFast(params: GetContextParams): Promise<GetContextResult>;
  writeMemory(params: WriteMemoryParams): Promise<WriteMemoryResult>;
};

export function createEngine(opts: CreateEngineOptions): ContextEngine {
  const baseUrl = (opts.baseUrl ?? "http://localhost:8080").replace(/\/$/, "");

  async function postJson<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(errBody?.error || `Context request failed (${res.status})`);
    }
    return res.json() as Promise<T>;
  }

  return {
    getContext: (params) => postJson<GetContextResult>("/context", params),
    getContextFast: (params) =>
      postJson<GetContextResult>("/context/fast", params),
    writeMemory: (params) =>
      postJson<WriteMemoryResult>("/context/memory", params),
  };
}
