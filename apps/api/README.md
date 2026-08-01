# nmemo API

Express backend for dashboard + `nmemo-sdk`.

## Docs

| Doc | Path |
|-----|------|
| HTTP reference | [docs/context-engine/API.md](../../docs/context-engine/API.md) |
| SDK guide | [docs/context-engine/SDK.md](../../docs/context-engine/SDK.md) |
| Docs map | [docs/context-engine/DOCS_MAP.md](../../docs/context-engine/DOCS_MAP.md) |
| Spec | [docs/context-engine/PROJECT_SPEC.md](../../docs/context-engine/PROJECT_SPEC.md) |

## Endpoints (live)

| Endpoint | Purpose |
|----------|---------|
| `POST /context` | `engine.getContext()` |
| `POST /context/fast` | `engine.getContextFast()` |
| `POST /ask` | getContext + LLM (dashboard chat) |
| `POST /ingest` | PDF → Qdrant |
| `/workspaces/*` | workspace, connectors, API keys |
| `GET /health` | health check |

## Local setup

```bash
# from repo root
cp .env.example .env
npm run db:generate -w @repo/db
npm run db:migrate -w @repo/db
npm run dev
```

The API listens on `http://localhost:8080`; `GET /health` returns `ok` when the process is up.

Required service configuration: `DATABASE_URL`, `QDRANT_URL`, `VOYAGE_API_KEY`, and `GROQ_API_KEY`. Authentication also needs secure values for `BETTER_AUTH_SECRET` and `TOKEN_ENCRYPTION_KEY`. Start with the root [`.env.example`](../../.env.example); OAuth connector credentials are optional.

For production, set `FRONTEND_URL`, `API_PUBLIC_URL`, and `CORS_ORIGINS` to the public origins. Never use the development secrets from `.env.example` in production.

## Stack

- `@contextengine/core` — orchestration
- `@contextengine/rag-retriever` — Qdrant + Voyage
- `@repo/db` — Prisma workspaces / keys / connectors
