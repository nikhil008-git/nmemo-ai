# Context Engine — Documentation

A multi-source context orchestration engine for AI agents. One call replaces custom glue code across memory, documents, CRM, Slack, Notion, GitHub, SQL, APIs, and more.

---

## Where to go

| Need | Open |
|------|------|
| **Doc index (everything)** | **[DOCS_MAP.md](./DOCS_MAP.md)** |
| **SDK usage** | **[SDK.md](./SDK.md)** · package: [`packages/sdk/README.md`](../../packages/sdk/README.md) |
| **HTTP API** | **[API.md](./API.md)** |
| **Full product spec** | [PROJECT_SPEC.md](./PROJECT_SPEC.md) |
| **Repo quickstart** | [../../README.md](../../README.md) |
| **Dashboard UI docs** | [../../apps/frontend/docs/README.md](../../apps/frontend/docs/README.md) |

---

## What it does

```ts
import { createEngine } from "@contextengine/sdk"

const engine = createEngine({ apiKey: process.env.CONTEXT_ENGINE_API_KEY! })
const context = await engine.getContext({
  userId,
  workspaceId,
  query,
  conversationId,
  agent,
})
```

Fast path:

```ts
const context = await engine.getContextFast({ query, userId, workspaceId, conversationId })
```

**Philosophy:** vector DBs answer "where is my data?" Context Engine answers "what should the model actually see?"

---

## Pipeline (target)

```
User query → Source Router → Retrievers (parallel) → Ranking → Dedup
  → Conflict Resolution → Compression → Token Budget → Prompt Builder → LLM
  → Memory Writer (async)
```

MVP today: router → RAG retriever → prompt + diagnostics. Full modules: [PROJECT_SPEC.md](./PROJECT_SPEC.md).

---

## Documentation files in this folder

| File | Purpose |
|------|---------|
| [DOCS_MAP.md](./DOCS_MAP.md) | **Map of all docs in the repo** |
| [SDK.md](./SDK.md) | SDK guide |
| [API.md](./API.md) | HTTP API reference |
| [PROJECT_SPEC.md](./PROJECT_SPEC.md) | Canonical full spec |
| [README.md](./README.md) | This hub |

---

## Current repo vs target

| Target | Current | Notes |
|--------|---------|-------|
| `apps/dashboard` | `apps/frontend` | API keys, connectors, chat, sources — live |
| `apps/api` | `apps/api` | `POST /context`, `/ask`, `/ingest`, workspace routes |
| `apps/worker` | — | Not started |
| `packages/sdk` | `packages/sdk` | `@contextengine/sdk` — live (workspace) |
| `packages/core` | `packages/core` | MVP `getContext` |
| `packages/rag-retriever` | `packages/rag-retriever` | Live |
| `packages/db` | `packages/database` | Workspace, ApiKey, Connector |

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
