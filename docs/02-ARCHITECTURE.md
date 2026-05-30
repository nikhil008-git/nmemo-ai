# 02 — System Architecture

## 1. Design principle

**Writes are async; reads are sync.**

- `add()` enqueues work (extraction, embedding, resolution, consolidation) onto BullMQ and returns immediately. Heavy AI work happens off the request path.
- `recall()` runs a fast hybrid query against Postgres/pgvector (+ Redis hot cache) and returns synchronously within a token budget.

This split is *why* BullMQ + Redis are core to the stack, not decoration.

---

## 2. System diagram

```mermaid
flowchart TB
    subgraph Client["Developer's App"]
        SDK["@mnemo/sdk (TypeScript)"]
    end

    subgraph Edge["API Layer"]
        GW["API Gateway (Express)<br/>BetterAuth API keys<br/>Redis rate limiter (per-tenant token budget)"]
        DASH["Next.js Dashboard<br/>memory explorer · usage · keys"]
    end

    subgraph RedisLayer["Redis"]
        PUBSUB["Pub/Sub<br/>live memory updates → active sessions"]
        RL["Rate limiter + cost guard"]
        CACHE["Hot-memory cache"]
    end

    subgraph Workers["BullMQ Workers"]
        EXTRACT["Fact Extraction (AI SDK)"]
        EMBED["Embedding"]
        RESOLVE["Conflict Resolution"]
        CONSOL["Consolidation / Sleep Cycle<br/>decay · compress · forget"]
    end

    subgraph Data["Storage (Prisma)"]
        PG[("Postgres + pgvector<br/>memories · facts · provenance · audit")]
    end

    SDK -->|add / recall / delete| GW
    GW --> RL
    GW -->|add: enqueue| EXTRACT
    GW -->|recall: hybrid search| PG
    GW --> CACHE
    DASH --> PG
    GW --> DASH

    EXTRACT --> EMBED --> RESOLVE --> PG
    CONSOL --> PG
    PG -->|change events| PUBSUB
    PUBSUB -->|stream| SDK
```

---

## 3. Components

### 3.1 API Gateway (Express)
- Verifies BetterAuth API keys, resolves tenant.
- Enforces Redis rate limiter and per-tenant token/cost budget.
- Routes: `add`, `recall`, `delete`, `keys`, `webhooks`.
- On `add`: validate → persist raw event → enqueue extraction job → return `202`.
- On `recall`: run hybrid retrieval → assemble context block within budget → return.

### 3.2 Next.js Dashboard
- Memory explorer (the demo money-shot): browse a subject's memories, see provenance, one-click delete.
- Usage & cost analytics, API-key management, billing.

### 3.3 BullMQ Workers
| Worker | Job |
|---|---|
| `extract` | LLM extracts atomic facts from raw events (AI SDK) |
| `embed` | Generates vector embeddings for facts |
| `resolve` | Detects conflicts, builds supersede chains, updates importance |
| `consolidate` | Scheduled "sleep cycles": decay scores, compress old episodics, forget noise |

### 3.4 Redis
- **Pub/Sub:** broadcasts memory change events so live sessions stay in sync (the cross-app demo).
- **Rate limiter / cost guard:** per-tenant token-bucket; caps embedding + extraction spend.
- **Hot cache:** recently recalled memories per subject for low-latency reads.

### 3.5 Storage (Postgres + pgvector via Prisma)
- `Memory`, `RawEvent`, `AuditLog`, `Tenant`, `ApiKey`, `Subject`.
- pgvector for embeddings; GIN/tsvector for keyword search (hybrid). See [`04-DATA-MODEL.md`](04-DATA-MODEL.md).

---

## 4. Write path (sequence)

```mermaid
sequenceDiagram
    participant App
    participant API as Express API
    participant Q as BullMQ
    participant W as Workers
    participant DB as Postgres/pgvector
    participant PS as Redis Pub/Sub

    App->>API: add({ subjectId, messages })
    API->>API: auth + rate limit
    API->>DB: persist RawEvent
    API->>Q: enqueue extract
    API-->>App: 202 Accepted
    Q->>W: extract (AI SDK)
    W->>W: extract atomic facts
    W->>Q: enqueue embed
    W->>DB: store facts (pending)
    Q->>W: embed
    W->>DB: write embeddings
    Q->>W: resolve
    W->>DB: supersede conflicts, score importance
    DB->>PS: publish memory.updated
    PS-->>App: live sync event
```

---

## 5. Read path (sequence)

```mermaid
sequenceDiagram
    participant App
    participant API as Express API
    participant C as Redis Cache
    participant DB as Postgres/pgvector

    App->>API: recall({ subjectId, query, budgetTokens })
    API->>API: auth + rate limit
    API->>C: check hot cache
    alt cache hit
        C-->>API: cached candidates
    else cache miss
        API->>DB: hybrid search (vector + keyword)
        DB-->>API: candidates
        API->>C: warm cache
    end
    API->>API: rank (relevance·recency·importance) + pack to budget
    API-->>App: { systemBlock, memories[] }
```

---

## 6. Multi-tenancy & isolation
- Every row is scoped by `tenantId`; all queries are tenant-filtered at the service layer.
- API keys map to a tenant via BetterAuth; rate limits and budgets are per-tenant in Redis.
- Optional dedicated/self-host deployment for enterprise (governance tier).

---

## 7. Scaling notes
- API and workers scale independently (workers scale with ingest volume).
- pgvector with IVFFlat/HNSW index; partition `Memory` by tenant at scale.
- Consolidation runs as scheduled/cron BullMQ jobs to keep stores lean and retrieval fast.
- Redis cache + budget caps keep p99 read latency and CoGS predictable.
