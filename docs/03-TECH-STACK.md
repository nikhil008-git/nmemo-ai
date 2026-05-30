# 03 — Tech Stack & Rationale

End-to-end **TypeScript**. Every component below was chosen so the architecture exercises the stack naturally (async AI jobs, live sync, cost control), not as decoration.

| Layer | Technology | Why |
|---|---|---|
| Dashboard / web | **Next.js** | Memory explorer, usage analytics, API-key + billing UI; SSR + React ecosystem |
| API server | **Express** | Lightweight, explicit control over the ingest/recall hot path |
| Auth & tenancy | **BetterAuth** | API-key issuance, sessions, multi-tenant identity for the dashboard + SDK |
| ORM / DB | **Prisma + Postgres** | Type-safe schema, migrations; Postgres is the durable store of record |
| Vector search | **pgvector** | Keeps vectors *in* Postgres — one store for facts + embeddings + provenance (simpler, transactional) |
| Job queue | **BullMQ** | Async extraction/embedding/resolution + scheduled consolidation "sleep cycles" |
| Realtime / cache / limits | **Redis** | Pub/Sub (live memory sync), rate limiter (token/cost guard), hot-memory cache |
| AI calls | **Vercel AI SDK** | Provider-agnostic fact extraction & summarization; swap models without code churn |
| Language | **TypeScript** | One language across SDK, API, workers, dashboard |
| Monorepo | **Turborepo + pnpm** | Shared `core`, `db`, `sdk` packages; fast incremental builds |

---

## Key decisions & trade-offs

### Postgres + pgvector over a dedicated vector DB
- **Pro:** single transactional store for memory, embeddings, provenance, and audit. No dual-write consistency problems. Cheaper at MVP scale.
- **Trade-off:** at very large scale a dedicated vector DB (Pinecone/Qdrant) may win on ANN throughput. We keep the retrieval layer abstracted so it can be swapped (see `packages/core/retrieval`).

### Async writes via BullMQ
- Extraction/embedding are expensive and latency-variable. Queueing keeps `add()` instant and lets us retry, batch, and rate-limit AI calls. Consolidation runs on a schedule via BullMQ repeatable jobs.

### Redis as the realtime + control plane
- Pub/Sub powers the cross-app live-sync demo.
- The rate limiter doubles as a **cost guard** (per-tenant token budgets) — central to the unit economics story.

### Vercel AI SDK as the model abstraction
- Provider-neutral: extraction quality can improve by swapping models without touching workers. Aligns with "neutral infrastructure" positioning.

---

## Environment / services

| Service | Local (dev) | Prod |
|---|---|---|
| Postgres + pgvector | docker-compose | Managed Postgres w/ pgvector |
| Redis | docker-compose | Managed Redis |
| Workers | local node process | Containerized BullMQ workers (autoscaled) |
| API | local node | Containerized Express (autoscaled) |
| Dashboard | next dev | Vercel / container |

> No application code in Phase 1 — this documents intended stack only.
