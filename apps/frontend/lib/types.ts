export type Citation = {
  id: string;
  source: string;
  title: string;
  url?: string;
  snippet: string;
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

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  diagnostics?: Diagnostics;
  tokenUsage?: TokenUsage;
  sources?: SourceStatus[];
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
