# Context Engine API

Node/Express backend exposing the Context Engine to dashboard and SDK clients.

## Endpoints (target)

| Endpoint | Purpose |
|----------|---------|
| `POST /context` | `engine.getContext()` — full multi-source fan-out |
| `POST /context/fast` | `engine.getContextFast()` — voice/low-latency fast path |
| `POST /chat` | Streaming LLM response (feeds `context.prompt` into Vercel AI SDK) |
| Auth / webhooks | Workspace auth, connector OAuth callbacks |

## Responsibilities

- `getContext()` and `getContextFast()` orchestration
- Per-workspace connector config (from `packages/db`)
- Session middleware
- Async memory writer trigger post-response

## Stack

- Node/Express
- Prisma (`packages/db`)
- Vercel AI SDK (streaming)
- Context Engine core + retrievers

## Related

- [docs/context-engine/PROJECT_SPEC.md](../../docs/context-engine/PROJECT_SPEC.md)
