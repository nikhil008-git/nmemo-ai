/**
 * Browser calls go through the Next.js same-origin proxy so the better-auth
 * session cookie is attached server-side (avoids cross-port cookie gaps).
 */
const PROXY_BASE = "/api/proxy";

const READ_TTL_MS = 2 * 60_000;
const DOCUMENTS_TTL_MS = 30_000;

type ReadOptions = { fresh?: boolean };
type ReadCacheEntry = { expiresAt: number; value: unknown };

const readCache = new Map<string, ReadCacheEntry>();
const inflightReads = new Map<string, Promise<unknown>>();
let cacheScope: string | null = null;

const DIRECT_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

function apiBase() {
  if (typeof window !== "undefined") return PROXY_BASE;
  return DIRECT_API_URL;
}

export function getApiBaseUrl() {
  return apiBase();
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Prevent cached authenticated data from crossing browser sessions/users. */
export function setApiCacheScope(userId: string) {
  if (cacheScope === userId) return;
  cacheScope = userId;
  clearApiReadCache();
}

export function clearApiReadCache() {
  readCache.clear();
  inflightReads.clear();
}

function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const entry = readCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    readCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T, ttl = READ_TTL_MS) {
  if (typeof window === "undefined") return;
  readCache.set(key, { expiresAt: Date.now() + ttl, value });
}

function invalidate(...keys: string[]) {
  keys.forEach((key) => readCache.delete(key));
}

async function cachedRead<T>(
  key: string,
  load: () => Promise<T>,
  ttl = READ_TTL_MS,
  fresh = false,
): Promise<T> {
  if (typeof window === "undefined") return load();

  if (!fresh) {
    const cached = getCached<T>(key);
    if (cached) return cached;

    const inflight = inflightReads.get(key);
    if (inflight) return inflight as Promise<T>;
  }

  const promise = load()
    .then((value) => {
      setCached(key, value, ttl);
      return value;
    })
    .finally(() => {
      if (inflightReads.get(key) === promise) inflightReads.delete(key);
    });

  inflightReads.set(key, promise);
  return promise;
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
    throw new ApiError(
      body?.error || `Request failed (${res.status})`,
      res.status,
    );
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
  domain?: string | null;
  industry?: string | null;
  companySize?: string | null;
  maxMembers?: number;
  connectors: Connector[];
  apiKeys: ApiKeyRow[];
};

export type DocumentsResponse = {
  documents: {
    id: string;
    title: string;
    source: string;
    chunkCount: number;
    status: "ready";
    updatedAt: string;
  }[];
};

export type CreateWorkspaceInput = {
  name: string;
  domain?: string;
  industry?: string;
  companySize?: string;
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
  return api<IngestResponse>("/ingest", { method: "POST", body: form }).then(
    (result) => {
      invalidate("documents");
      return result;
    },
  );
}

export function listDocuments(
  options: ReadOptions = {},
): Promise<DocumentsResponse> {
  return cachedRead(
    "documents",
    () => api("/documents"),
    DOCUMENTS_TTL_MS,
    options.fresh,
  );
}

export function peekDocuments() {
  return getCached<DocumentsResponse>("documents");
}

export function deleteDocument(
  source: string,
): Promise<{ deleted: true; source: string }> {
  return api<{ deleted: true; source: string }>(
    `/documents?source=${encodeURIComponent(source)}`,
    {
      method: "DELETE",
    },
  ).then((result) => {
    const cached = getCached<DocumentsResponse>("documents");
    if (cached) {
      setCached(
        "documents",
        {
          documents: cached.documents.filter((doc) => doc.source !== source),
        },
        DOCUMENTS_TTL_MS,
      );
    }
    return result;
  });
}

function seedWorkspaceReads(workspace: Workspace) {
  setCached("workspace", workspace);
  setCached("connectors", { connectors: workspace.connectors });
  setCached("apiKeys", { apiKeys: workspace.apiKeys });
}

export function getWorkspace(options: ReadOptions = {}): Promise<Workspace> {
  return cachedRead(
    "workspace",
    () =>
      api<Workspace>("/workspaces/current").then((workspace) => {
        seedWorkspaceReads(workspace);
        return workspace;
      }),
    READ_TTL_MS,
    options.fresh,
  );
}

export function peekWorkspace() {
  return getCached<Workspace>("workspace");
}

export function prefetchAuthenticatedData() {
  return getWorkspace().then((workspace) => {
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        void listDocuments().catch(() => {
          /* Sources reports its own availability when opened. */
        });
      }, 0);
    }
    return workspace;
  });
}

export function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<Workspace> {
  return api<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((workspace) => {
    seedWorkspaceReads(workspace);
    return workspace;
  });
}

export function updateWorkspace(
  input: CreateWorkspaceInput,
): Promise<Workspace> {
  return api<Workspace>("/workspaces/current", {
    method: "PATCH",
    body: JSON.stringify(input),
  }).then((workspace) => {
    seedWorkspaceReads(workspace);
    return workspace;
  });
}

export function getConnectors(
  options: ReadOptions = {},
): Promise<{ connectors: Connector[] }> {
  return cachedRead(
    "connectors",
    () => api("/workspaces/connectors"),
    READ_TTL_MS,
    options.fresh,
  );
}

export function updateConnector(
  type: string,
  data: { status?: string; config?: Record<string, unknown> },
): Promise<{ connector: Connector }> {
  return api<{ connector: Connector }>(`/workspaces/connectors/${type}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }).then((result) => {
    const connectors = getCached<{ connectors: Connector[] }>("connectors");
    if (connectors) {
      const next = [
        ...connectors.connectors.filter((item) => item.type !== type),
        result.connector,
      ];
      setCached("connectors", { connectors: next });
    }
    invalidate("workspace");
    return result;
  });
}

/** Same-origin OAuth start (forwards session cookie to the API). */
export function oauthStartUrl(provider: "github" | "slack" | "notion") {
  return `/oauth/${provider}/start`;
}

export function listApiKeys(
  options: ReadOptions = {},
): Promise<{ apiKeys: ApiKeyRow[] }> {
  return cachedRead(
    "apiKeys",
    () => api("/workspaces/api-keys"),
    READ_TTL_MS,
    options.fresh,
  );
}

export function createApiKey(
  name: string,
): Promise<{ apiKey: ApiKeyRow & { secret: string } }> {
  return api<{ apiKey: ApiKeyRow & { secret: string } }>(
    "/workspaces/api-keys",
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
  ).then((result) => {
    const keys = getCached<{ apiKeys: ApiKeyRow[] }>("apiKeys");
    if (keys) {
      setCached("apiKeys", { apiKeys: [result.apiKey, ...keys.apiKeys] });
    }
    invalidate("workspace");
    return result;
  });
}

export function revokeApiKey(id: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/workspaces/api-keys/${id}`, {
    method: "DELETE",
  }).then((result) => {
    const keys = getCached<{ apiKeys: ApiKeyRow[] }>("apiKeys");
    if (keys) {
      setCached("apiKeys", {
        apiKeys: keys.apiKeys.filter((key) => key.id !== id),
      });
    }
    invalidate("workspace");
    return result;
  });
}
