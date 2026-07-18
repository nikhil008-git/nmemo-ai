# Context Engine

A multi-source context orchestration engine for AI agents. Every serious AI application eventually connects to multiple context sources — memory, documents, CRM, Slack, Notion, GitHub, SQL databases, APIs. This engine replaces custom glue code per product with one call:

```ts
import { createEngine } from "@contextengine/sdk"

const engine = createEngine({
  apiKey: process.env.CONTEXT_ENGINE_API_KEY!,
  baseUrl: "http://localhost:8080",
})

const context = await engine.getContext({
  query: "What is our refund policy?",
  userId: "user_123",
  workspaceId: "ws_123",
})
// context.prompt → feed your LLM
```

**Philosophy:** existing tools answer "where is my data?" Context Engine answers "what should the model actually see?"

---

## Current stack

| Layer | Choice |
|-------|--------|
| Monorepo | Turborepo |
| Frontend | Next.js (`apps/frontend`) |
| Backend | Node/Express (`apps/api`) |
| Vector store | Qdrant |
| Embeddings | Voyage |
| LLM | Groq (OpenAI-compatible) |
| Structured data | Prisma + PostgreSQL |
| Engine | `@contextengine/core` + `@contextengine/sdk` |

---

## MVP status

| Path | Status |
|------|--------|
| `apps/frontend` | Dashboard — ingest, chat, connectors, API keys |
| `apps/api` | `POST /context`, `/context/fast`, `/ask`, `/ingest`, workspace routes |
| `packages/retriever-interface` | Shared `Retriever` + contract types |
| `packages/rag-retriever` | Qdrant + Voyage RAG |
| `packages/core` | `getContext()` / `getContextFast()` (RAG path) |
| `packages/sdk` | `createEngine().getContext()` HTTP client |
| `packages/database` | Workspace, ApiKey, Connector models |

**Live docs on site:** `/docs`, `/docs/sdk`, `/docs/connectors`, `/docs/api`

**Deferred:** full ranking/dedup/conflict packages, worker, npm publish.

---

## Quickstart

```bash
npm install
npm run dev    # frontend :3000 + api :8080
```

1. Sign up at http://localhost:3000  
2. Connectors → ensure Qdrant is connected  
3. Sources → upload a PDF  
4. Settings → create an API key  
5. Chat — or call the SDK with that key  

```bash
# Example SDK usage (from any Node script in the monorepo)
node --input-type=module -e "
import { createEngine } from '@contextengine/sdk'
const engine = createEngine({ apiKey: 'ce_live_...', baseUrl: 'http://localhost:8080' })
console.log(await engine.getContext({ query: 'hello', userId: 'u1', workspaceId: 'ws1' }))
"
```

API key auth scopes the workspace from the key; `workspaceId` in the body is optional when using a Bearer key.

---

## Documentation

| File | Purpose |
|------|---------|
| **[DOCS_MAP.md](./docs/context-engine/DOCS_MAP.md)** | **Where every doc lives (start here)** |
| [SDK.md](./docs/context-engine/SDK.md) | `@contextengine/sdk` guide |
| [packages/sdk/README.md](./packages/sdk/README.md) | SDK package README |
| [API.md](./docs/context-engine/API.md) | HTTP API reference |
| [PROJECT_SPEC.md](./docs/context-engine/PROJECT_SPEC.md) | Canonical full product spec |
| [docs/context-engine/README.md](./docs/context-engine/README.md) | Context Engine doc hub |
| [apps/frontend/docs/README.md](./apps/frontend/docs/README.md) | Dashboard UI docs |
| [apps/api/README.md](./apps/api/README.md) | API app README |
