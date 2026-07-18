import type { ContextResult, SourceStatus } from "./types";

const baseSources: SourceStatus[] = [
  { id: "mem0", name: "Memory", queried: true, responded: true, latencyMs: 42 },
  {
    id: "qdrant",
    name: "Documents",
    queried: true,
    responded: true,
    latencyMs: 118,
  },
  {
    id: "slack",
    name: "Slack",
    queried: true,
    responded: false,
    latencyMs: 300,
  },
  {
    id: "notion",
    name: "Notion",
    queried: false,
    responded: false,
    latencyMs: 0,
  },
];

export const mockContextResult: ContextResult = {
  prompt: `System instructions
User memory
Relevant documents
Conversation
Current user message`,
  memories: [
    {
      id: "m1",
      text: "User prefers concise answers with citations.",
      score: 0.91,
    },
    {
      id: "m2",
      text: "Workspace focuses on Context Engine product docs.",
      score: 0.84,
    },
  ],
  documents: [
    {
      id: "d1",
      text: "getContext() returns prompt, memories, documents, sources, citations, tokenUsage, and diagnostics.",
      source: "docs/context-engine/PROJECT_SPEC.md",
      title: "Project Spec",
      score: 0.94,
    },
    {
      id: "d2",
      text: "Retrievers run in parallel with per-source timeouts; omissions appear in diagnostics.",
      source: "docs/context-engine/PROJECT_SPEC.md",
      title: "Project Spec",
      score: 0.88,
    },
  ],
  sources: baseSources,
  citations: [
    {
      id: "c1",
      source: "docs/context-engine/PROJECT_SPEC.md",
      title: "API contract",
      url: "#",
      snippet:
        "Returns prompt, memories, documents, sources, citations, tokenUsage, diagnostics.",
    },
    {
      id: "c2",
      source: "docs/context-engine/PROJECT_SPEC.md",
      title: "Retrieval Layer",
      url: "#",
      snippet:
        "Retrievers run in parallel with per-source timeouts.",
    },
  ],
  tokenUsage: {
    total: 1840,
    memory: 220,
    documents: 980,
    workspace: 240,
    instructions: 400,
  },
  diagnostics: {
    rankingScores: [
      { id: "d1", score: 0.94, reason: "High semantic match + source reliability" },
      { id: "d2", score: 0.88, reason: "Semantic match" },
      { id: "m1", score: 0.91, reason: "User preference memory" },
    ],
    discarded: [
      {
        id: "d3",
        reason: "Below relevance threshold after ranking",
      },
    ],
    conflicts: [
      {
        id: "cf1",
        summary: "Memory said London; CRM said Berlin",
        resolution: "Most-recent source wins (CRM)",
      },
    ],
    latencyBySource: {
      mem0: 42,
      qdrant: 118,
      slack: 300,
      notion: 0,
    },
  },
  answer:
    "Context Engine decides what the model should see. Call getContext() with your query and workspace — it routes sources, ranks and dedupes results, fits a token budget, and returns a prompt plus citations and diagnostics. Slow sources time out without blocking the response; omissions show up in diagnostics.",
};

/** Simulate per-source retrieval progress for the tool-call indicator. */
export async function* mockRetrieveProgress(
  onTick?: (sources: SourceStatus[]) => void,
): AsyncGenerator<SourceStatus[]> {
  const steps: SourceStatus[][] = [
    baseSources.map((s) => ({
      ...s,
      responded: false,
      latencyMs: 0,
    })),
    baseSources.map((s) =>
      s.id === "mem0"
        ? { ...s, responded: true, latencyMs: 42 }
        : { ...s, responded: false, latencyMs: s.id === "notion" ? 0 : 0 },
    ),
    baseSources.map((s) => {
      if (s.id === "mem0") return { ...s, responded: true, latencyMs: 42 };
      if (s.id === "qdrant") return { ...s, responded: true, latencyMs: 118 };
      if (s.id === "slack") return { ...s, responded: false, latencyMs: 180 };
      return { ...s, responded: false, latencyMs: 0 };
    }),
    baseSources,
  ];

  for (const step of steps) {
    onTick?.(step);
    yield step;
    await sleep(280);
  }
}

/** Yield answer text in small chunks for a fake stream. */
export async function* mockStreamAnswer(
  text: string = mockContextResult.answer,
  chunkSize = 4,
): AsyncGenerator<string> {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await sleep(28);
  }
}

export function getMockContextForQuery(query: string): ContextResult {
  return {
    ...mockContextResult,
    answer: `${mockContextResult.answer}\n\n(You asked: “${query.trim()}”)`,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
