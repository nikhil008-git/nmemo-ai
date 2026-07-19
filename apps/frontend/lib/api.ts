/**
 * Browser calls go through the Next.js same-origin proxy so the better-auth
 * session cookie is attached server-side (avoids cross-port cookie gaps).
 */
const PROXY_BASE = "/api/proxy";

const DIRECT_API_URL = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080"
);

function apiBase() {
  if (typeof window !== "undefined") return PROXY_BASE;
  return DIRECT_API_URL;
}

export function getApiBaseUrl() {
  return apiBase();
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export type AskResponse = {
  answer: string;
  citations: {
    source_url: string;
    title: string;
    snippet: string;
  }[];
  groundingScore: number;
  context?: {
    diagnostics: {
      rankingScores: { id: string; score: number; reason: string }[];
      discarded: { id: string; reason: string }[];
      conflicts: { id: string; summary: string; resolution: string }[];
      latencyBySource: Record<string, number>;
    };
    tokenUsage?: {
      total: number;
      memory: number;
      documents: number;
      workspace: number;
      instructions: number;
    };
    sources?: {
      id: string;
      name: string;
      queried: boolean;
      responded: boolean;
      latencyMs: number;
    }[];
  };
};

export type IngestResponse = {
  chunkCount: number;
  title: string;
  source: string;
};

export type Connector = {
  id: string;
  type: string;
  status: string;
  config: Record<string, unknown>;
  updatedAt: string;
  /** Whether platform OAuth env is set (github/slack/notion). */
  oauthConfigured?: boolean;
};

export type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
};

export type Workspace = {
  id: string;
  name: string;
  connectors: Connector[];
  apiKeys: ApiKeyRow[];
};

export function askQuestion(question: string): Promise<AskResponse> {
  return api("/ask", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export function ingestPdfFile(
  file: File,
  opts?: { title?: string },
): Promise<IngestResponse> {
  const form = new FormData();
  form.append("file", file);
  if (opts?.title) form.append("title", opts.title);
  return api("/ingest", { method: "POST", body: form });
}

export function listDocuments(): Promise<{
  documents: {
    id: string;
    title: string;
    source: string;
    chunkCount: number;
    status: "ready";
    updatedAt: string;
  }[];
}> {
  return api("/documents");
}

export function getWorkspace(): Promise<Workspace> {
  return api("/workspaces/current");
}

export function getConnectors(): Promise<{ connectors: Connector[] }> {
  return api("/workspaces/connectors");
}

export function updateConnector(
  type: string,
  data: { status?: string; config?: Record<string, unknown> },
): Promise<{ connector: Connector }> {
  return api(`/workspaces/connectors/${type}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** Same-origin OAuth start (forwards session cookie to the API). */
export function oauthStartUrl(provider: "github" | "slack" | "notion") {
  return `/oauth/${provider}/start`;
}

export function listApiKeys(): Promise<{ apiKeys: ApiKeyRow[] }> {
  return api("/workspaces/api-keys");
}

export function createApiKey(
  name: string,
): Promise<{ apiKey: ApiKeyRow & { secret: string } }> {
  return api("/workspaces/api-keys", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function revokeApiKey(id: string): Promise<{ ok: boolean }> {
  return api(`/workspaces/api-keys/${id}`, { method: "DELETE" });
}
