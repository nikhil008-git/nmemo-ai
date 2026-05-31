# nmemo — Memory Layer as a Service

> **Auth0/Clerk, but for AI agent memory.**
> Persistent, portable, self-maintaining memory for any AI application — in ~5 lines of code.

---

## What is nmemo?

Every AI app today re-implements the same painful stack: pgvector + summarization + dedup + decay + retrieval ranking + GDPR deletion. nmemo is the **memory backend** that does all of this behind three API calls (`add`, `recall`, `delete`).

nmemo is **infrastructure, not a framework**. It is framework-agnostic and works with the Vercel AI SDK, LangChain, raw OpenAI/Anthropic calls, or any agent runtime.

```ts
import { Nmemo } from "@nmemo/sdk";

const mem = new Nmemo({ apiKey: process.env.NMEMO_API_KEY });

// 1. Write — throw raw conversation at it; nmemo extracts what's worth remembering (async)
await mem.add({ subjectId: user.id, messages });

// 2. Read — retrieval blends relevance + recency + importance, within a token budget
const ctx = await mem.recall({ subjectId: user.id, query, budgetTokens: 2000 });

// 3. Inject — a ready-to-use context block for your LLM
const prompt = `${ctx.systemBlock}\n\nUser: ${userInput}`;
```

---

## Why nmemo exists

| Problem | nmemo's answer |
|---|---|
| Memory is hand-rolled and fragile in every AI app | A drop-in backend behind 3 calls |
| Memory is trapped per-app | **Portable** cross-app identity — memory follows the user |
| You can't prove or delete what's stored | **Governed**: provenance, audit log, per-memory delete (GDPR) |
| Memory grows into unbounded noise | **Self-maintaining**: decay + consolidation "sleep cycles" |
| Costs spiral with token usage | Built-in **per-tenant token budgets + rate limiting** |

**USP:** *Portable, governed memory for AI apps — your users' memory follows them across apps, stays consistent, and you can prove exactly what's stored and delete any single fact.*

---

## The three pillars (vs mem0 / Letta-MemGPT)

1. **Portability** — shared memory identity across multiple apps/products.
2. **Governance** — provenance, audit, PII redaction, per-memory deletion (SOC2/GDPR-ready).
3. **Self-maintenance** — automatic decay, conflict resolution via supersede chains, consolidation.

mem0 helps you *store* memory. Letta is a *framework* you build agents inside. **nmemo is neutral memory infrastructure you trust and own.**

---

## Tech stack

- **Next.js** — developer dashboard (memory explorer, usage, API keys)
- **Express** — ingest/recall API
- **BetterAuth** — API-key auth + multi-tenant
- **Prisma + Postgres + pgvector** — storage, embeddings, provenance, audit
- **BullMQ** — async extraction / resolution / embedding / consolidation jobs
- **Redis** — pub/sub (live memory sync), rate limiter (cost guard), hot-memory cache
- **Vercel AI SDK** — fact extraction & summarization (provider-agnostic)
- **TypeScript** — end to end

See [`docs/03-TECH-STACK.md`](docs/03-TECH-STACK.md).

---

## Documentation

| Doc | Contents |
|---|---|
| [`docs/01-PRODUCT.md`](docs/01-PRODUCT.md) | Vision, USP, personas, differentiators |
| [`docs/02-ARCHITECTURE.md`](docs/02-ARCHITECTURE.md) | System diagram, data flow, components |
| [`docs/03-TECH-STACK.md`](docs/03-TECH-STACK.md) | Stack decisions & rationale |
| [`docs/04-DATA-MODEL.md`](docs/04-DATA-MODEL.md) | Prisma schema, memory types |
| [`docs/05-MEMORY-LIFECYCLE.md`](docs/05-MEMORY-LIFECYCLE.md) | Ingest → extract → resolve → decay → consolidate |
| [`docs/06-RAG-RETRIEVAL.md`](docs/06-RAG-RETRIEVAL.md) | Hybrid retrieval & ranking |
| [`docs/07-API-AND-SDK.md`](docs/07-API-AND-SDK.md) | REST API + TypeScript SDK |
| [`docs/08-BUSINESS-MODEL.md`](docs/08-BUSINESS-MODEL.md) | Pricing, ARR/MRR, unit economics |
| [`docs/09-ROADMAP.md`](docs/09-ROADMAP.md) | 2-week MVP + phased roadmap |

---

## Status

**Phase 1 — Documentation.** No application code yet. This repository currently contains the architecture and product specification only.
