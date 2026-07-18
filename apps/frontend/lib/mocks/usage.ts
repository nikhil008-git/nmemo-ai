import type { ApiKey, UsageSummary } from "./types";

export const initialApiKeys: ApiKey[] = [
  {
    id: "key-1",
    name: "Local SDK",
    prefix: "ce_live_8f3a",
    createdAt: "2026-07-01T12:00:00.000Z",
    lastUsedAt: "2026-07-18T06:40:00.000Z",
  },
  {
    id: "key-2",
    name: "CI eval",
    prefix: "ce_live_21bc",
    createdAt: "2026-07-10T09:20:00.000Z",
    lastUsedAt: null,
  },
];

export const mockUsage: UsageSummary = {
  contextCalls: 1284,
  tokensTotal: 2_450_000,
  tokensBySection: {
    total: 2_450_000,
    memory: 320_000,
    documents: 1_480_000,
    workspace: 290_000,
    instructions: 360_000,
  },
  periodLabel: "Last 30 days",
};

export function createApiKey(name: string): ApiKey {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 4);
  return {
    id: `key-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim() || "Untitled key",
    prefix: `ce_live_${suffix}`,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
}
