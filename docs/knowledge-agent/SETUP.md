# Setup Guide

How to run the Internal Knowledge Agent locally. Commands use **npm** (this repo's package manager). Update env var names to match actual implementation as phases land.

**Build order:** [PHASES.md](./PHASES.md) · **Full spec:** [PROJECT_SPEC.md](./PROJECT_SPEC.md)

---

## Prerequisites

- Node.js 18+
- npm 10+ (workspaces)
- Docker (local Qdrant only — Phase 1+)
- Accounts (Phase 2+): Voyage AI or OpenAI, LLM provider (Anthropic/OpenAI)
- Accounts (Phase 4+): Langfuse

---

## Current repo (scaffold only)

What works today without the agent stack:

```bash
npm install
npm run dev    # starts apps/frontend (:3000) + apps/api (:8080)
```

Env files needed for the existing auth scaffold:

| App | File | Vars |
|-----|------|------|
| `apps/frontend` | `.env` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |
| `apps/api` | `.env` | Same as frontend (session validation on Express) |
| `packages/database` | `.env` | `DATABASE_URL` (Prisma CLI) |

```bash
# From packages/database
npm run db:migrate -w @repo/db
npm run db:generate -w @repo/db
```

The agent stack (Qdrant, ingestion, chat) is **not wired yet** — see phases below.

---

## Environment variables (full agent — Phase 1+)

Create `.env` at monorepo root and per-app as needed:

```bash
# LLM
OPENAI_API_KEY=sk-...          # or ANTHROPIC_API_KEY

# Embeddings + rerank
VOYAGE_API_KEY=pa-...          # preferred for retrieval + rerank

# Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                 # empty for local
QDRANT_COLLECTION=help-docs

# Relational DB
DATABASE_URL=postgresql://user:pass@localhost:5432/knowledge_agent

# Observability (Phase 4)
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_HOST=https://cloud.langfuse.com

# MCP server (Phase 3)
MCP_SERVER_PORT=3001
MCP_API_KEY=dev-secret          # auth boundary even with mocks
```

---

## Phase 1 — Start infrastructure

### Qdrant

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

Verify: `curl http://localhost:6333/collections`

### PostgreSQL

Use Neon (current setup) or local Docker:

```bash
docker run -p 5432:5432 \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=knowledge_agent \
  postgres:16
```

Run migrations:

```bash
npm run db:migrate -w @repo/db
```

---

## Phase 1 — Ingest documents

Once `packages/ingestion` exists:

```bash
npm run ingest -w @knowledge-agent/ingestion -- \
  --source ./data/linear-docs \
  --collection help-docs
```

Expected output: chunk count, embed count, upsert confirmation.

### Verify retrieval manually

```bash
npm run retrieval:test -w @knowledge-agent/agent -- \
  --query "How do I reset my API key?"
```

Eyeball that top chunks match the expected article. Repeat for 5–10 queries before Phase 2.

---

## Phase 2–3 — Start the apps

Terminal 1 — MCP server (Phase 3):

```bash
npm run dev -w @knowledge-agent/mcp-server
```

Terminal 2 — Web / chat UI:

```bash
npm run dev -w @knowledge-agent/web
# or current: npm run dev -w frontend
```

Open `http://localhost:3000`.

---

## Phase 4 — Run evals

```bash
npm run eval
# runs promptfoo from packages/eval
```

Expected output: pass rate percentage and per-case results.

---

## View traces (Phase 4)

After a chat turn, open Langfuse dashboard → find trace by session ID or timestamp. Confirm spans for retrieval, rerank, tool calls, and generation.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Empty retrieval results | Collection not seeded or wrong name | Re-run ingest; check `QDRANT_COLLECTION` |
| Citations point to wrong docs | Chunk overlap too small or no rerank | Increase overlap; verify rerank step runs |
| Tool calls not appearing | MCP server not running or wrong port | Check `MCP_SERVER_PORT`, server logs |
| No Langfuse traces | Missing keys or wrong host | Verify `LANGFUSE_*` env vars |
| Eval pass rate 0% | Stale index or wrong expected sources | Re-ingest; update test case expected values |
| Express `/protected` 401 | API `.env` missing or dotenv load order | `import "dotenv/config"` first in `apps/api/src/index.ts` |

---

## Production deployment (summary)

| Service | Platform | Notes |
|---------|----------|-------|
| `apps/web` | Vercel | Set all env vars in project settings |
| `apps/mcp-server` | Railway or Fly.io | Expose port, set `MCP_API_KEY` |
| Qdrant | Railway or Qdrant Cloud | Use managed instance |
| PostgreSQL | Railway, Supabase, Neon | Run migrations on deploy |
| Langfuse | Langfuse Cloud | Recommended over self-host for demo |

No Docker/Kubernetes/Helm in production.
