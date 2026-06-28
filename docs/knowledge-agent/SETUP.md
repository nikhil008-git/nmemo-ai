# Setup Guide

How to run the Internal Knowledge Agent locally once the codebase is built. Update env var names to match actual implementation.

---

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Docker (local Qdrant only)
- Accounts: Voyage AI or OpenAI, Langfuse, LLM provider (Anthropic/OpenAI)

---

## Environment variables

Create `.env` at the monorepo root (and per-app if needed):

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

# Observability
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
LANGFUSE_HOST=https://cloud.langfuse.com

# MCP server
MCP_SERVER_PORT=3001
MCP_API_KEY=dev-secret          # auth boundary even with mocks
```

---

## 1. Start infrastructure (local)

### Qdrant

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

Verify: `curl http://localhost:6333/collections`

### PostgreSQL

```bash
# Example with Docker
docker run -p 5432:5432 \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=knowledge_agent \
  postgres:16
```

Run migrations:

```bash
pnpm --filter @knowledge-agent/shared db:migrate
# or: npx prisma migrate dev
```

---

## 2. Install dependencies

```bash
pnpm install
```

---

## 3. Ingest documents (Phase 1)

Pick a corpus (e.g. Linear help docs). Run the ingestion CLI:

```bash
pnpm --filter @knowledge-agent/ingestion run ingest \
  --source ./data/linear-docs \
  --collection help-docs
```

Expected output: chunk count, embed count, upsert confirmation.

### Verify retrieval manually

```bash
pnpm --filter @knowledge-agent/agent run retrieval:test \
  --query "How do I reset my API key?"
```

Eyeball that the top chunks match the expected article. Repeat for 5–10 queries before proceeding.

---

## 4. Start the apps

Terminal 1 — MCP server:

```bash
pnpm --filter @knowledge-agent/mcp-server dev
```

Terminal 2 — Web app:

```bash
pnpm --filter @knowledge-agent/web dev
```

Open `http://localhost:3000`.

---

## 5. Run evals (Phase 4)

```bash
pnpm eval
# runs promptfoo from packages/eval
```

Expected output: pass rate percentage and per-case results.

---

## 6. View traces

After a chat turn, open Langfuse dashboard → find trace by session ID or timestamp. Confirm spans for retrieval, rerank, tool calls, and generation.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Empty retrieval results | Collection not seeded or wrong name | Re-run ingest, check `QDRANT_COLLECTION` |
| Citations point to wrong docs | Chunk overlap too small or no rerank | Increase overlap; verify rerank step runs |
| Tool calls not appearing | MCP server not running or wrong port | Check `MCP_SERVER_PORT`, server logs |
| No Langfuse traces | Missing keys or wrong host | Verify `LANGFUSE_*` env vars |
| Eval pass rate 0% | Stale index or wrong expected sources | Re-ingest; update test case expected values |

---

## Production deployment (summary)

| Service | Platform | Notes |
|---------|----------|-------|
| `apps/web` | Vercel | Set all env vars in project settings |
| `apps/mcp-server` | Railway or Fly.io | Expose port, set `MCP_API_KEY` |
| Qdrant | Railway or Qdrant Cloud | Use managed instance |
| PostgreSQL | Railway, Supabase, Neon | Run migrations on deploy |
| Langfuse | Langfuse Cloud | Recommended over self-host for demo |
