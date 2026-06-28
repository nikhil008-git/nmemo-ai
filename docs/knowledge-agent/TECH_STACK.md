# Tech Stack — Rationale

Why each piece was chosen for the Internal Knowledge Agent, and what alternatives were considered.

---

## Monorepo: Turborepo

**Why:** Shared types, Zod schemas, and Prisma client need to flow between the web app, MCP server, agent, ingestion pipeline, and eval suite without copy-paste.

**Alternatives considered:** Nx (heavier config), plain npm workspaces (no caching/orchestration).

**Convention:** `apps/` for deployable services, `packages/` for shared libraries.

---

## Frontend: Next.js (App Router)

**Why:** Fastest path to a clean streaming chat demo. App Router supports server components, route handlers for `/api/chat`, and deploys to Vercel in one click.

**Alternatives considered:** Remix (good but less AI SDK ecosystem examples), plain Vite + Express (more wiring).

**Key files:** `apps/web/app/api/chat/route.ts`, `apps/web/components/`

---

## AI SDK: Vercel AI SDK

**Why:** Provider-agnostic streaming, tool calling, and `streamObject` for Zod-validated structured outputs. De facto standard for Next.js + LLM apps.

**Alternatives considered:** Raw OpenAI/Anthropic SDKs (no unified streaming abstraction), LangChain JS (heavier, less control).

---

## Agent orchestration: Mastra

**Why:** TypeScript-native with built-in MCP support. Ships in days vs. weeks with LangGraph for this scope.

**Alternatives considered:**

| Framework | Pros | Cons for this project |
|-----------|------|----------------------|
| LangGraph | Powerful graph state machines | Python-first; MCP wiring is manual |
| Custom agent loop | Full control | Reinventing routing, tracing, tool registry |
| **Mastra** | TS-native, MCP built-in | Newer, smaller community |

Document the Mastra vs LangGraph evaluation in the project README when built.

---

## Vector DB: Qdrant

**Why:** Self-hostable, free tier, native hybrid search (BM25 + dense vectors in one query). No vendor lock-in.

**Alternatives considered:**

| DB | Hybrid search | Self-host | Notes |
|----|---------------|-----------|-------|
| Pinecone | Limited | No | Managed only, hybrid is newer |
| Weaviate | Yes | Yes | Heavier ops |
| pgvector | Via extensions | Yes | Already in stack for Postgres, but hybrid is weaker |
| **Qdrant** | Yes, native | Yes | Best fit for hybrid + self-host |

---

## Embeddings: Voyage AI (`voyage-3`)

**Why:** Stronger retrieval benchmarks than generic embedding models, especially for RAG-specific tasks.

**Fallback:** OpenAI `text-embedding-3-large` — widely available, good enough if Voyage access is limited.

---

## Reranker: Voyage (`rerank-2`)

**Why:** The step most RAG tutorials skip. Reranking top-k candidates dramatically improves retrieval precision for keyword-heavy queries (order IDs, error codes, product names).

**Non-optional.** Pure vector + no rerank is a tutorial pattern, not a production pattern.

---

## Relational DB: PostgreSQL + Prisma

**Why:**

- Chat history persistence
- Mock ticket/order records for MCP tools
- Eval result storage
- Prisma gives type-safe schema shared via `packages/shared`

**Why not MongoDB:** Relational model fits chat sessions, tickets, and eval runs cleanly. pgvector is available but Qdrant handles vector search better for hybrid.

---

## Actions layer: Custom MCP server

**Why:** MCP is the current agent ecosystem standard. A standalone server demonstrates real protocol knowledge — pluggable into Claude Desktop, Cursor, or any MCP client.

**Why not embed tools in the web app:** That hides the protocol layer. The whole point is showing MCP as a first-class integration pattern.

**Mock backends:** Acceptable and expected. Reviewers care about tool schemas, auth boundaries, and agent tool-selection — not a real Zendesk integration.

---

## Observability: Langfuse

**Why:** Open-source LLM observability with traces, spans, and eval scoring. Shows every retrieval, rerank, tool call, and generation step — critical for debugging RAG systems.

**Alternatives considered:** Helicone ( simpler but less span control), custom logging (not inspectable enough for demo).

**Required spans per chat turn:** router → retrieval → rerank → tool call(s) → generation.

---

## Evaluation: promptfoo

**Why:** YAML-defined test cases, multiple assertion types (exact match, LLM rubric, JavaScript), pass-rate reporting. Runs in CI or locally.

**Alternatives considered:** LangSmith evals (vendor lock-in), custom Jest tests (harder to maintain case files).

**Target:** 15–20 cases covering retrieval, answer quality, and tool selection.

---

## Deployment

| Component | Platform | Rationale |
|-----------|----------|-----------|
| `apps/web` | Vercel | Native Next.js hosting, edge streaming |
| `apps/mcp-server` | Railway or Fly.io | Long-running process, not serverless |
| Qdrant | Railway or Qdrant Cloud | Persistent vector storage |
| PostgreSQL | Railway, Neon, Supabase | Managed Postgres |
| Langfuse | Langfuse Cloud | Avoid self-hosting observability for demo |

**No Docker/Kubernetes/Helm in production.** Docker for local Qdrant only.

---

## Cost considerations (demo scale)

| Service | Estimated monthly (demo) |
|---------|--------------------------|
| Voyage embeddings + rerank | ~$5–20 depending on corpus size |
| LLM (GPT-4o-mini or Claude Haiku) | ~$10–30 for dev + eval runs |
| Qdrant Cloud free tier | $0 |
| Langfuse Cloud free tier | $0 |
| Vercel hobby | $0 |
| Railway | ~$5–10 |

Total: roughly $20–60/month for active development and demo usage.
