import type { DashboardStats } from "./types";
import { initialConnectors } from "./connectors";
import { mockUsage } from "./usage";

export const mockDashboard: DashboardStats = {
  contextCalls: mockUsage.contextCalls,
  tokensUsed: mockUsage.tokensTotal,
  connectedSources: initialConnectors.filter((c) => c.connected).length,
  recentCalls: [
    {
      id: "rc-1",
      query: "What does getContext return?",
      latencyMs: 312,
      sourceCount: 3,
      createdAt: "2026-07-18T06:40:00.000Z",
    },
    {
      id: "rc-2",
      query: "How do retrievers handle timeouts?",
      latencyMs: 268,
      sourceCount: 2,
      createdAt: "2026-07-18T05:12:00.000Z",
    },
    {
      id: "rc-3",
      query: "Summarize conflict resolution policy",
      latencyMs: 401,
      sourceCount: 4,
      createdAt: "2026-07-17T22:05:00.000Z",
    },
    {
      id: "rc-4",
      query: "When should I use getContextFast?",
      latencyMs: 189,
      sourceCount: 2,
      createdAt: "2026-07-17T18:30:00.000Z",
    },
  ],
};

export const hubLinks = [
  {
    href: "/chat",
    label: "Chat",
    description: "Demo getContext with citations and diagnostics.",
  },
  {
    href: "/sources",
    label: "Sources",
    description: "Upload docs and track ingest status.",
  },
  {
    href: "/connectors",
    label: "Connectors",
    description: "Connect mem0, Qdrant, Slack, and more.",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Profile, API keys, and usage.",
  },
] as const;
