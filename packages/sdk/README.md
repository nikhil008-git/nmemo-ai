# `@contextengine/sdk`

Developer client for Context Engine. Calls `POST /context` on `apps/api` with an API key from the dashboard.

## Install (monorepo)

```bash
# already a workspace package
npm install
```

```ts
import { createEngine } from "@contextengine/sdk"
```

Monorepo package (`packages/sdk`). To publish: `npm publish -w @contextengine/sdk` (after bundling/publishing `@contextengine/retriever-interface` or inlining types).

## Quick start

1. Run API + frontend (`npm run dev`)
2. Dashboard → **Settings** → create an API key (copy the secret once)
3. Dashboard → **Sources** → upload PDFs (Qdrant connected)
4. Call the SDK:

```ts
import { createEngine } from "@contextengine/sdk"

const engine = createEngine({
  apiKey: process.env.CONTEXT_ENGINE_API_KEY!,
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

Fast path (same shape today; RAG-only MVP):

```ts
const context = await engine.getContextFast({
  query: "Continue…",
  userId: "user_123",
  workspaceId: "ws_123",
})
```

## API

### `createEngine(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | required | Bearer key from Settings |
| `baseUrl` | `string` | `http://localhost:8080` | API origin |

### `engine.getContext(params)` / `getContextFast(params)`

| Param | Type | Required |
|-------|------|----------|
| `query` | `string` | yes |
| `userId` | `string` | yes |
| `workspaceId` | `string` | yes\* |
| `conversationId` | `string` | no |
| `agent` | `string` | no |
| `persistMemory` | `{ messages }` | no — write turn to mem0 in same request |

\*With a valid API key, the server uses the key’s workspace; `workspaceId` can still be sent for client bookkeeping.

### Memory write-back (after your LLM answers)

```ts
const context = await engine.getContext({ query, userId, workspaceId })
// ... call your LLM with context.prompt → answer
await engine.writeMemory({
  userId,
  workspaceId,
  messages: [
    { role: "user", content: query },
    { role: "assistant", content: answer },
  ],
})
```

### Return shape (`GetContextResult`)

Always these seven fields (from `@contextengine/retriever-interface`):

```ts
type GetContextResult = {
  prompt: string
  memories: { id, text, score }[]
  documents: { id, text, source, title?, score, metadata? }[]
  sources: { id, name, queried, responded, latencyMs }[]
  citations: { id, source, title, url?, snippet }[]
  tokenUsage: {
    total, memory, documents, workspace, instructions
  }
  diagnostics: {
    rankingScores,   // { id, score, reason }[]
    discarded,       // { id, reason }[]
    conflicts,       // { id, summary, resolution }[]
    latencyBySource  // Record<sourceId, ms>
  }
}
```

## Source

- Implementation: [`src/index.ts`](./src/index.ts)
- Types: `@contextengine/retriever-interface`
- Server: `apps/api` → `POST /context`, `POST /context/fast`
- Full guide: [docs/context-engine/SDK.md](../../docs/context-engine/SDK.md)
