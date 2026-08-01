# Context Engine API

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

## Run

```bash
# from repo root
npm run dev
# API → http://localhost:8080
```

Requires env: `DATABASE_URL`, `VOYAGE_API_KEY`, `GROQ_API_KEY`, `QDRANT_URL` (see root `.env.example`).

## Stack

- `@contextengine/core` — orchestration
- `@contextengine/rag-retriever` — Qdrant + Voyage
- `@repo/db` — Prisma workspaces / keys / connectors
