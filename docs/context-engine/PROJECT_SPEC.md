# Context Engine — full project spec

## What this is

A multi-source context orchestration engine for AI agents. Every serious AI application eventually connects to multiple context sources — memory, documents, CRM, Slack, Notion, GitHub, SQL databases, APIs. Developers currently write custom glue code per product to query each source, merge results, dedupe, rerank, fit within a token budget, build a prompt, and update memory afterward. This engine replaces all of that with one call:

```ts
const context = await engine.getContext({ userId, workspaceId, query, conversationId, agent })
```

The engine decides which sources to search, how many results to retrieve, how to rank them, what to discard, what to summarize, how to fit everything into the context window, how to return citations, and what new memories to store afterward. The LLM receives one optimized context package.

**Philosophy**: existing tools (vector DBs, memory systems, document stores) answer "where is my data?" This engine answers "what should the model actually see?" It's a decision-making layer, not another storage layer.

**Long-term vision**: AI agents shouldn't care whether information comes from memory, documents, databases, or external services. They ask one system — "give me the best context for this task" — and the Context Engine becomes the intelligence layer between data sources and language models, consistent and observable across chat agents, voice agents, coding assistants, and enterprise copilots.

## Current stack

- Turborepo monorepo
- Next.js (frontend)
- Node/Express (backend)
- Qdrant (vector store)
- Voyage (embeddings)
- OpenAI (LLM responses with context)
- Prisma (structured/recent data)
- mem0 (long-term memory layer)
- Vercel AI SDK (streaming)

RAG backend (chunking, embedding, retrieval via Qdrant + Voyage) is already implemented.

## Context sources (full set)

| Category | Examples | Notes |
|---|---|---|
| Long-term memory | mem0, custom memory systems | preferences, relationships, long-term facts, recurring goals, user profile |
| Documents (RAG) | PDFs, manuals, contracts, knowledge bases | retrieved via Qdrant, Pinecone, pgvector, Weaviate |
| Workspace | Notion, Confluence, Google Drive, SharePoint | |
| Communication | Slack, Teams, Email | |
| Development | GitHub, GitLab, Jira, Linear | |
| Business | HubSpot, Salesforce, Stripe, PostgreSQL, Snowflake | |
| External tools | REST APIs, GraphQL, MCP servers | |
| Live voice/transcription | streaming ASR output | doesn't go through router/rank/dedup — feeds prompt builder directly |

## Full pipeline

```
                    User query
                         │
                         ▼
             Source Selection Layer (Source Router)
                         │
     ┌───────────┬───────┼───────┬────────────┬────────────┐
     │           │       │       │            │            │
  Memory     Documents  Workspace Comms   Development   Business/External
 (mem0)     (Qdrant+    (Notion,  (Slack,  (GitHub,      (CRM, SQL, APIs,
             Voyage)     Drive)   Email)    Jira)         MCP servers)
     │           │       │       │            │            │
     └───────────┴───────┴───────┴────────────┴────────────┘
                         │
                         ▼
               Context Ranking Engine
                         │
                         ▼
                Deduplication Layer
                         │
                         ▼
              Conflict Resolution Layer
                         │
                         ▼
               Context Compression
                         │
                         ▼
              Token Budget Optimizer
                         │
                         ▼
             Prompt Construction Engine  ◄──── Live transcription (voice, direct feed)
                         │
                         ▼
                       LLM (streamed, model-agnostic)
                         │
                         ▼
              Memory Extraction Layer (async)
```

## Core modules

### 1. Source Router
Determines which sources should be queried for a given query — not every query needs every source. Example: "what's my refund status?" searches CRM, previous conversations, billing docs; skips GitHub and Calendar.

For voice/low-latency contexts, the router additionally decides between a **fast path** (memory + cached/prefetched context only, sub-300ms) and a **full path** (full fan-out across all relevant sources), based on whether the turn represents a genuine topic shift or continues existing context.

### 2. Retrieval Layer
Every source implements a common interface:

```ts
interface Retriever {
  retrieve(query: string, opts: { userId: string; workspaceId: string }): Promise<Context[]>
}
```

Implementations: `MemoryRetriever` (mem0), `RAGRetriever` (Qdrant + Voyage), `SlackRetriever`, `NotionRetriever`, `GitHubRetriever`, `SQLRetriever`, `CRMRetriever`, `MCPRetriever` (generic MCP server connector), and any custom retriever a developer registers.

Retrievers run in parallel with per-source timeouts; a slow or failing source doesn't block the whole response — omissions are noted in `diagnostics`.

### 3. Ranking Engine
Ranks retrieved context across all sources on: semantic similarity, recency, importance, confidence, user personalization, source reliability.

### 4. Deduplication
Avoids returning the same information twice across sources (e.g. "user works at Acme" from memory and "Alice from Acme asked..." from Slack) — collapses to one representation when they convey the same fact, via embedding-similarity threshold.

### 5. Conflict Resolution
Detects contradictions across sources (e.g. memory says "user lives in London," CRM says "user moved to Berlin") and resolves or surfaces the conflict instead of sending both blindly. Default resolution: most-recent-source-wins, with the conflict itself exposed in `diagnostics` so the calling app can override.

### 6. Context Compression
Large retrieved documents become concise summaries to maximize useful information per token.

### 7. Token Budget Manager
Allocates the available context window across sources dynamically based on the query — e.g. of 20k available tokens: memory 10%, documents 60%, workspace 20%, instructions 10%. Budgets adjust based on which sources are actually relevant to the query rather than a fixed split.

### 8. Prompt Builder
Produces structured sections:

```
System instructions
User memory
Relevant documents
Workspace context
Retrieved API data
Conversation
Current user message
```

For voice agents, live transcription is injected directly into the conversation section, bypassing the router/rank/dedup pipeline since it isn't a queryable historical source.

### 9. Memory Writer
Runs asynchronously after the response: extracts durable facts, merges duplicates, updates importance, archives stale memories, deletes obsolete facts. For voice, extraction runs on finalized turns (not raw mid-utterance ASR output) to avoid extracting facts from incomplete sentences.

## Design principles

- **Source agnostic** — any backend pluggable behind the `Retriever` interface: mem0, Qdrant, Pinecone, pgvector, Notion, Slack, GitHub, and so on.
- **Model agnostic** — OpenAI, Anthropic, Google, DeepSeek, local models.
- **Framework agnostic** — Vercel AI SDK, LangChain, Mastra, LlamaIndex, custom agent frameworks.

## Advanced features

- **Adaptive retrieval** — learns which retrieval strategies produce the best answers over time.
- **Query planning** — breaks complex questions into multiple retrieval steps before generation.
- **Retrieval evaluation** — tracks precision, recall, latency, token usage, answer quality per source.
- **Source confidence** — assigns confidence scores to every retrieved item.
- **Observability** — for every response, exposes retrieved sources, ranking scores, discarded context, token allocation, latency by source, and full prompt composition.

## API contract

```ts
const context = await engine.getContext({
  query,
  userId,
  workspaceId,
  conversationId,
  agent
})
```

Returns:

```ts
{
  prompt,        // final assembled prompt string
  memories,      // facts retrieved from memory sources
  documents,     // chunks retrieved from RAG sources
  sources,       // which retrievers were queried and which responded
  citations,     // pointers back to source docs/facts
  tokenUsage,    // breakdown of token allocation by section
  diagnostics    // ranking scores, discarded context, conflicts, latency by source
}
```

For voice/low-latency use, a variant fast path is exposed:

```ts
const context = await engine.getContextFast({ query, userId, workspaceId, conversationId })
```

Same return shape, but scoped to prefetched/cached memory + hot context only — skips full multi-source fan-out.

## How a developer integrates it

1. `npm i @contextengine/sdk`
2. Connect sources (mem0 workspace, Qdrant index, Slack/Notion/GitHub OAuth, SQL/CRM credentials, MCP servers) via dashboard or API.
3. Replace manual prompt-building code with `engine.getContext()` (or `getContextFast()` for voice/real-time agents).
4. Feed the returned `prompt` into the existing LLM streaming call (Vercel AI SDK or otherwise).
5. Memory write-back happens automatically, async — no extra integration work.

## Folder structure (turborepo)

```
context-engine/
├── apps/
│   ├── dashboard/                  # Next.js — API keys, connectors, diagnostics viewer
│   ├── api/                        # Node/Express — getContext(), getContextFast(), auth, webhooks
│   └── worker/                     # embedding jobs, memory extraction, connector syncs, adaptive retrieval eval
├── packages/
│   ├── core/
│   │   ├── router/                 # Source Router (incl. fast-path/full-path decision)
│   │   ├── ranking/                # Ranking Engine
│   │   ├── dedup/                  # Deduplication Layer
│   │   ├── conflict-resolution/     # Conflict Resolution Layer
│   │   ├── compression/            # Context Compression
│   │   ├── budget/                 # Token Budget Manager
│   │   ├── prompt-builder/         # Prompt Construction Engine
│   │   ├── memory-writer/          # async fact extraction + archival
│   │   ├── query-planning/         # breaks complex queries into retrieval steps
│   │   └── adaptive-retrieval/     # learns retrieval strategy performance over time
│   ├── retrievers/
│   │   ├── retriever-interface/    # shared `Retriever` TS interface + Context type
│   │   ├── memory-retriever/       # wraps mem0
│   │   ├── rag-retriever/          # wraps Qdrant + Voyage
│   │   ├── slack-retriever/
│   │   ├── notion-retriever/
│   │   ├── github-retriever/
│   │   ├── sql-retriever/
│   │   ├── crm-retriever/          # HubSpot, Salesforce, Stripe
│   │   ├── mcp-retriever/          # generic MCP server connector
│   │   └── voice-stream-retriever/ # live transcription feed, bypasses rank/dedup
│   ├── db/                         # Prisma — workspaces, api keys, connectors, sessions, usage
│   ├── ai/                         # Vercel AI SDK streaming wrapper, model-agnostic call layer
│   ├── sdk/                        # published npm package — engine.getContext() / getContextFast()
│   ├── observability/              # diagnostics: sources, scores, conflicts, latency, token use
│   └── config/                     # eslint, tsconfig, shared config
├── turbo.json
└── package.json
```

Each retriever implements the same interface so adding a new source is a new package under `packages/retrievers/`, not a change to `core/`.

## What's required to build this in full

- `retriever-interface` — shared `Context[]` shape (text, source, score, metadata) so ranking/dedup/conflict-resolution can treat all sources uniformly.
- Per-source retrievers with their own auth flows (OAuth for Slack/Notion/GitHub, API keys for CRM/SQL, MCP server registration).
- Ranking module — similarity + recency + importance + confidence + source reliability scoring.
- Dedup module — embedding-similarity threshold across contexts from different sources.
- Conflict resolution module — contradiction detection + resolution policy + surfaced diagnostics.
- Context compression module — summarization for oversized retrieved chunks.
- Token budget manager — dynamic allocation based on query and source relevance, tokenizer-based counting, truncation/summarization on overflow.
- Prompt builder — composable function producing the structured template.
- Query planning module — decomposes complex/multi-part questions into retrieval sub-steps.
- Adaptive retrieval module — tracks which retrieval strategies perform best over time and adjusts.
- Voice fast-path — prefetching, hot-cache context, turn-finalization-aware memory writer, low-latency `getContextFast()`.
- Diagnostics/observability object — full transparency into sources, scores, conflicts, latency, token allocation.
- Multi-tenant Prisma schema — workspaces, API keys, per-workspace connector configs, usage metering for billing.
- Published SDK package — the primary developer-facing integration surface.
- Evaluation harness — tracks retrieval precision, recall, latency, token usage, and answer quality per source over time.

## Distribution notes

This is a developer-facing infrastructure product. The buyer is a developer choosing infra, not a consumer scrolling a feed — paid social (Meta/Instagram-style ads) is a weak channel here. Better fits: X/Twitter with a working demo, Reddit (r/LocalLLaMA, r/AI_Agents), Product Hunt, Hacker News "Show HN," and developer Discord communities (LangChain, agent-building servers).
