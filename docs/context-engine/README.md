# Context Engine — Documentation

A multi-source context orchestration engine for AI agents. One call replaces custom glue code across memory, documents, CRM, Slack, Notion, GitHub, SQL, APIs, and more.

**Start here:** [PROJECT_SPEC.md](./PROJECT_SPEC.md) — the canonical full project spec. Follow it strictly.

**Repo root:** [../../README.md](../../README.md) — pitch, quickstart, current vs target structure.

---

## What it does

Developers call:

```ts
const context = await engine.getContext({ userId, workspaceId, query, conversationId, agent })
```

For voice/low-latency agents:

```ts
const context = await engine.getContextFast({ query, userId, workspaceId, conversationId })
```

The engine decides which sources to search, how to rank and dedupe results, how to resolve conflicts, how to fit everything into the token budget, and returns a ready-to-use prompt with citations and diagnostics.

**Philosophy:** vector DBs and memory systems answer "where is my data?" Context Engine answers "what should the model actually see?"

**Long-term vision:** agents ask one system — "give me the best context for this task" — and the Context Engine becomes the intelligence layer between data sources and language models.

---

## Context sources

| Category | Examples |
|----------|----------|
| Long-term memory | mem0, custom memory systems |
| Documents (RAG) | Qdrant, Pinecone, pgvector, Weaviate |
| Workspace | Notion, Confluence, Google Drive, SharePoint |
| Communication | Slack, Teams, Email |
| Development | GitHub, GitLab, Jira, Linear |
| Business | HubSpot, Salesforce, Stripe, PostgreSQL, Snowflake |
| External tools | REST APIs, GraphQL, MCP servers |
| Live voice/transcription | streaming ASR — feeds prompt builder directly |

---

## Pipeline

```
User query → Source Router → Retrievers (parallel) → Ranking → Dedup
  → Conflict Resolution → Compression → Token Budget → Prompt Builder → LLM
  → Memory Writer (async)
```

Voice transcription bypasses router/rank/dedup and feeds the prompt builder directly. `getContextFast()` uses a fast path (memory + cached context only, sub-300ms).

Full architecture: [PROJECT_SPEC.md](./PROJECT_SPEC.md#full-pipeline).

---

## Documentation

| File | Purpose |
|------|---------|
| [PROJECT_SPEC.md](./PROJECT_SPEC.md) | **Canonical spec** — API contract, pipeline, modules, folder structure |

---

## Current repo vs target

This monorepo (`nmemo`) maps to the target `context-engine/` layout:

| Target | Current | Notes |
|--------|---------|-------|
| `apps/dashboard` | `apps/frontend` | API keys, connectors, diagnostics viewer |
| `apps/api` | `apps/api` | Express — `getContext()`, `getContextFast()`, auth |
| `apps/worker` | — | Embedding jobs, memory extraction, connector syncs |
| `packages/retrievers/rag-retriever` | existing RAG code | Wrap behind `Retriever` interface |
| `packages/retrievers/memory-retriever` | mem0 integration | To build |
| `packages/core/*` | — | Router, ranking, dedup, conflict-resolution, compression, budget, prompt-builder, memory-writer, query-planning, adaptive-retrieval |
| `packages/sdk` | — | Published `@contextengine/sdk` |
| `packages/db` | `packages/database` | Extend Prisma for workspaces, API keys, connectors |

---

## API contract

```ts
{
  prompt,
  memories,
  documents,
  sources,
  citations,
  tokenUsage,
  diagnostics  // ranking scores, discarded context, conflicts, latency by source
}
```

`diagnostics` is part of the committed API from day one.
