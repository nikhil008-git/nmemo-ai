/** Frontend-local shapes aligned with Context Engine getContext() contract. */

export type Citation = {
  id: string;
  source: string;
  title: string;
  url?: string;
  snippet: string;
};

export type MemoryItem = {
  id: string;
  text: string;
  score: number;
};

export type DocumentChunk = {
  id: string;
  text: string;
  source: string;
  title: string;
  score: number;
};

export type SourceStatus = {
  id: string;
  name: string;
  queried: boolean;
  responded: boolean;
  latencyMs: number;
};

export type TokenUsage = {
  total: number;
  memory: number;
  documents: number;
  workspace: number;
  instructions: number;
};

export type Diagnostics = {
  rankingScores: { id: string; score: number; reason: string }[];
  discarded: { id: string; reason: string }[];
  conflicts: { id: string; summary: string; resolution: string }[];
  latencyBySource: Record<string, number>;
};

export type ContextResult = {
  prompt: string;
  memories: MemoryItem[];
  documents: DocumentChunk[];
  sources: SourceStatus[];
  citations: Citation[];
  tokenUsage: TokenUsage;
  diagnostics: Diagnostics;
  /** Demo answer text used for mock streaming (not part of getContext). */
  answer: string;
};

export type IngestStatus = "pending" | "ready" | "failed";

export type IngestedDocument = {
  id: string;
  title: string;
  source: string;
  chunkCount: number;
  status: IngestStatus;
  updatedAt: string;
};

export type ConnectorId =
  | "mem0"
  | "qdrant"
  | "slack"
  | "notion"
  | "github"
  | "mcp";

export type Connector = {
  id: ConnectorId;
  name: string;
  description: string;
  connected: boolean;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type UsageSummary = {
  contextCalls: number;
  tokensTotal: number;
  tokensBySection: TokenUsage;
  periodLabel: string;
};

export type RecentContextCall = {
  id: string;
  query: string;
  latencyMs: number;
  sourceCount: number;
  createdAt: string;
};

export type DashboardStats = {
  contextCalls: number;
  tokensUsed: number;
  connectedSources: number;
  recentCalls: RecentContextCall[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  diagnostics?: Diagnostics;
  tokenUsage?: TokenUsage;
  sources?: SourceStatus[];
};
