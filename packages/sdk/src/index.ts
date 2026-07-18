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
};

export type ContextEngine = {
  getContext(params: GetContextParams): Promise<GetContextResult>;
  getContextFast(params: GetContextParams): Promise<GetContextResult>;
};

export function createEngine(opts: CreateEngineOptions): ContextEngine {
  const baseUrl = (opts.baseUrl ?? "http://localhost:8080").replace(/\/$/, "");

  async function post(
    path: string,
    params: GetContextParams,
  ): Promise<GetContextResult> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error || `Context request failed (${res.status})`);
    }
    return res.json() as Promise<GetContextResult>;
  }

  return {
    getContext: (params) => post("/context", params),
    getContextFast: (params) => post("/context/fast", params),
  };
}
