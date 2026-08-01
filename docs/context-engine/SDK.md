# SDK guide — `nmemo-sdk`

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
| Create keys | Dashboard → [Keys](../../apps/frontend/docs/pages/keys.md) |

## Install

Published publicly on npm:

```bash
npm install nmemo-sdk
```

```ts
import { createEngine } from "nmemo-sdk"
```

## End-to-end flow (SaaS user)

```
Sign up → Connectors (click Connect for Slack/GitHub/Notion, paste mem0 key)
       ↓
Sources → upload PDFs
       ↓
Keys → create API key
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
import { createEngine } from "nmemo-sdk"

const engine = createEngine({
  apiKey: process.env.NMEMO_API_KEY!,
})

const context = await engine.getContext({
  query: "What is our refund policy?",
  userId: "user_123",
  workspaceId: "ws_123",
})

// Feed into any LLM
const messages = [
  { role: "system", content: context.prompt },
  { role: "user", content: "What is our refund policy?" },
]

console.log(context.prompt)
console.log(context.citations)
console.log(context.diagnostics)
```

### Fast path

```ts
await engine.getContextFast({ query, userId, workspaceId })
```

Use this endpoint for latency-sensitive turns such as voice or live assistance.

## Auth

- Header: `Authorization: Bearer <apiKey>`
- Keys created in dashboard **Keys** (`POST /workspaces/api-keys`)
- Secret shown once; stored hashed in Postgres

## Errors

The SDK throws an `Error` with the API message when a request fails. Catch it at the agent boundary and avoid exposing internal error details to end users.

## Related docs

- [API.md](./API.md) — HTTP endpoints
- [PROJECT_SPEC.md](./PROJECT_SPEC.md) — full product vision
- [DOCS_MAP.md](./DOCS_MAP.md) — index of all documentation
