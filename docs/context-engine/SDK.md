# SDK guide — `@contextengine/sdk`

Primary developer surface for Context Engine.

## Where it lives

| What | Path |
|------|------|
| Package | [`packages/sdk`](../../packages/sdk) |
| Package README | [`packages/sdk/README.md`](../../packages/sdk/README.md) |
| Source | [`packages/sdk/src/index.ts`](../../packages/sdk/src/index.ts) |
| Shared types | [`packages/retriever-interface`](../../packages/retriever-interface) |
| Engine (server-side) | [`packages/core`](../../packages/core) |
| HTTP API | [`apps/api`](../../apps/api) — `POST /context` |
| Create keys | Dashboard → [Settings](../../apps/frontend/docs/pages/settings.md) |

## Install

Workspace package (not on npm yet):

```ts
import { createEngine } from "@contextengine/sdk"
```

## End-to-end flow (SaaS user)

```
Sign up → Connectors (click Connect for Slack/GitHub/Notion, paste mem0 key)
       ↓
Sources → upload PDFs
       ↓
Settings → create API key
       ↓
createEngine({ apiKey }).getContext({ query, userId, workspaceId })
       ↓
POST /context → connected retrievers → prompt + citations + diagnostics
       ↓
Your LLM
```

Users never set `GITHUB_CLIENT_*` etc. Those are platform secrets for the SaaS deploy.

## Usage

```ts
import { createEngine } from "@contextengine/sdk"

const engine = createEngine({
  apiKey: process.env.CONTEXT_ENGINE_API_KEY!,
  baseUrl: "http://localhost:8080",
})

const context = await engine.getContext({
  query: "Summarize the refund policy",
  userId: "user_123",
  workspaceId: "ws_123", // optional if API key already scopes workspace
  conversationId: "conv_1",
  agent: "support-bot",
})

// Use with any LLM
const messages = [
  { role: "system", content: context.prompt },
]
```

### Fast path

```ts
await engine.getContextFast({ query, userId, workspaceId })
```

MVP: same RAG path as `getContext`. Later: memory + cache only (sub-300ms).

## Auth

- Header: `Authorization: Bearer <apiKey>`
- Keys created in dashboard **Settings** (`POST /workspaces/api-keys`)
- Secret shown once; stored hashed in Postgres

## Errors

SDK throws `Error` with the API `error` message when status is not OK (e.g. invalid key, Voyage rate limit, missing query).

## Related docs

- [API.md](./API.md) — HTTP endpoints
- [PROJECT_SPEC.md](./PROJECT_SPEC.md) — full product vision
- [DOCS_MAP.md](./DOCS_MAP.md) — index of all documentation
