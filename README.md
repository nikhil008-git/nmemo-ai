# Context Engine

A multi-source context orchestration engine for AI agents. Every serious AI application eventually connects to multiple context sources — memory, documents, CRM, Slack, Notion, GitHub, SQL databases, APIs. This engine replaces custom glue code per product with one call:

```ts
const context = await engine.getContext({ userId, workspaceId, query, conversationId, agent })
```

The engine decides which sources to search, how to rank and dedupe results, how to resolve conflicts, how to fit everything into the context window, and returns a ready-to-use prompt with citations and diagnostics.

**Philosophy:** existing tools answer "where is my data?" Context Engine answers "what should the model actually see?"

**Long-term vision:** agents ask one system — "give me the best context for this task" — and the Context Engine becomes the intelligence layer between data sources and language models.

---

## Current stack

| Layer | Choice |
|-------|--------|
| Monorepo | Turborepo |
| Frontend | Next.js |
| Backend | Node/Express |
| Vector store | Qdrant |
| Embeddings | Voyage |
| LLM | OpenAI (via Vercel AI SDK streaming) |
| Structured data | Prisma + PostgreSQL |
| Memory | mem0 |
| RAG | Chunking, embedding, retrieval via Qdrant + Voyage — implemented |

---

## Context sources

Memory, documents (RAG), workspace (Notion, Drive), communication (Slack, Email), development (GitHub, Jira), business (CRM, SQL), external tools (APIs, MCP), and live voice/transcription.

---

## Architecture

```
User query → Source Router → Retrievers (parallel) → Ranking → Dedup
  → Conflict Resolution → Compression → Token Budget → Prompt Builder → LLM
  → Memory Writer (async)
```

Voice: `getContextFast()` for sub-300ms fast path; live transcription feeds prompt builder directly.

---

## API contract

```ts
const context = await engine.getContext({
  query, userId, workspaceId, conversationId, agent
})

// Returns: { prompt, memories, documents, sources, citations, tokenUsage, diagnostics }
```

```ts
const context = await engine.getContextFast({ query, userId, workspaceId, conversationId })
// Same shape — prefetched/cached memory + hot context only
```

---

## Target repo structure

```
├── apps/
│   ├── dashboard/          # API keys, connectors, diagnostics viewer
│   ├── api/                # getContext(), getContextFast(), auth, webhooks
│   └── worker/             # embedding jobs, memory extraction, connector syncs
├── packages/
│   ├── core/               # router, ranking, dedup, conflict-resolution, compression,
│   │                       # budget, prompt-builder, memory-writer, query-planning, adaptive-retrieval
│   ├── retrievers/         # memory, rag, slack, notion, github, sql, crm, mcp, voice-stream
│   ├── db/                 # Prisma — workspaces, API keys, connectors
│   ├── ai/                 # Vercel AI SDK wrapper
│   ├── sdk/                # @contextengine/sdk
│   └── observability/      # diagnostics
└── docs/context-engine/    # project documentation
```

**Current repo** (scaffold):

| Path | Status |
|------|--------|
| `apps/frontend` | Next.js — evolves into `apps/dashboard` |
| `apps/api` | Express — add `getContext()` / `getContextFast()` |
| `packages/database` | Prisma + Postgres — grows into `packages/db` |
| RAG core | Implemented — wrap as `rag-retriever` |
| `packages/core`, `packages/retrievers`, `packages/sdk` | Not started |

---

## Documentation

| File | Purpose |
|------|---------|
| [PROJECT_SPEC.md](./docs/context-engine/PROJECT_SPEC.md) | **Canonical full spec** — follow strictly |
| [README.md](./docs/context-engine/README.md) | Doc index + repo mapping |

---

## Quickstart

```bash
npm install
npm run dev    # starts apps/frontend (:3000) + apps/api (:8080)
```
