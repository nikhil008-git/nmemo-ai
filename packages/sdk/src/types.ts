/** Public result types returned by getContext / getContextFast. */

export type ContextItem = {
  id: string;
  text: string;
  source: string;
  title?: string;
  score: number;
  metadata?: Record<string, unknown>;
};

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

export type MemoryItem = {
  id: string;
  text: string;
  score: number;
};

export type GetContextResult = {
  prompt: string;
  memories: MemoryItem[];
  documents: ContextItem[];
  sources: SourceStatus[];
  citations: Citation[];
  tokenUsage: TokenUsage;
  diagnostics: Diagnostics;
};
