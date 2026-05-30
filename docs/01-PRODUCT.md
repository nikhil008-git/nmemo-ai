# 01 — Product Specification

## 1. Vision

AI applications are only as good as what they remember. Today, every team rebuilds memory from scratch — badly. Mnemo provides **persistent, portable, governed memory as a managed service**, so developers ship AI products with long-term memory the way they ship auth with Clerk or payments with Stripe.

> **One-liner:** *The memory layer for AI apps — store, recall, and govern what your users tell your AI, across every app you build.*

---

## 2. The problem

1. **Memory is hand-rolled.** Teams glue together a vector DB, summarizers, dedup heuristics, and retrieval ranking. It's brittle and consumes weeks of eng time.
2. **Memory is siloed.** A user's context lives in one app and can't follow them to the next. There is no portable "memory identity."
3. **Memory is ungoverned.** Most systems can't answer "what do you know about this user?" or delete a single fact on request — a compliance time bomb (GDPR/CCPA).
4. **Memory becomes noise.** Without decay and consolidation, stores fill with stale, contradictory, redundant facts that *degrade* retrieval quality over time.
5. **Memory costs spiral.** Naive re-embedding and unbounded extraction blow up token bills with no per-tenant guardrails.

---

## 3. The solution

A managed memory backend exposed through a tiny SDK and REST API:

- `add()` — ingest raw events/conversations; Mnemo asynchronously extracts atomic facts.
- `recall()` — hybrid retrieval (relevance + recency + importance) within a token budget.
- `delete()` / `forget()` — per-memory deletion with audit trail.

Behind those calls: fact extraction, conflict resolution, importance scoring, decay, consolidation sleep cycles, provenance tracking, and real-time sync — all managed.

---

## 4. Target users (personas)

| Persona | Pain | What they buy |
|---|---|---|
| **Indie AI dev** | No time to build memory infra | 5-line drop-in memory |
| **Funded AI startup** | Memory quality + scale + cost control | Reliable backend, usage analytics |
| **Multi-product company** | User context trapped per app | Portable cross-app memory identity |
| **Enterprise / regulated** | Can't prove or delete stored data | Governance, audit, SOC2/GDPR posture |

Primary ICP for monetization: **funded AI startups** (fast adoption) → expand into **enterprise** (governance).

---

## 5. Unique Selling Proposition

> **Portable, governed memory for AI apps — your users' memory follows them across apps, stays consistent, and you can prove exactly what's stored and delete any single fact.**

Three pillars competitors don't nail *together*:

1. **Portability** — a shared memory identity spanning multiple apps/products.
2. **Governance** — provenance, audit logging, PII redaction, per-memory deletion.
3. **Self-maintenance** — automatic decay, supersede-based conflict resolution, consolidation.

---

## 6. Differentiators vs mem0 / Letta (MemGPT)

| Dimension | mem0 | Letta / MemGPT | **Mnemo** |
|---|---|---|---|
| Core model | Add/search facts to a vector store | Agent framework w/ OS-style context paging | **Memory *backend* (infra), framework-agnostic** |
| Conflict resolution | Basic update | In-context self-editing | **Explicit supersede chains + provenance** |
| Forgetting / decay | Limited | Manual | **Automatic decay + consolidation sleep cycles** |
| Portability | Per-app | Per-agent | **Cross-app shared identity (killer feature)** |
| Governance / compliance | Minimal | Minimal | **Per-memory audit, delete, PII redaction (GDPR/SOC2-ready)** |
| Real-time | Request/response | In-loop | **Pub/sub live memory sync across sessions** |
| Cost control | None native | None | **Per-tenant token budget + rate limiting built in** |
| Memory evals | None | None | **Memory quality scoring / regression detection** |

**Positioning statement:** *mem0 helps you store memory; Letta is a framework you build agents inside; Mnemo is the neutral memory infrastructure you trust and own across your whole product suite.*

**Sharpest wedge to lead with:** **governance + portability** — exactly what enterprises (who pay) need and what mem0/Letta ignore.

---

## 7. Where RAG fits

RAG is not a separate product — it is the **read path** of memory. `recall()` is a retrieval-augmented step that assembles the most relevant memories into a context block. Mnemo's RAG is *personalized and governed*: retrieval is ranked by importance and recency per subject, and every retrieved memory carries provenance. See [`06-RAG-RETRIEVAL.md`](06-RAG-RETRIEVAL.md).

Expansion path: today RAG over *memories*; later **RAG-as-a-service over arbitrary documents** as a second product line (land-and-expand).

---

## 8. The demo that wins the room

Open two different chat apps. Tell one: *"I'm allergic to peanuts."* Open the other app — it already knows. The dashboard shows the extracted fact, its provenance (which message it came from), and a one-click delete that propagates everywhere instantly.

This single demo proves all three pillars (portability, governance, self-maintenance) in under 60 seconds.

---

## 9. Non-goals (for v1)

- Not an agent framework (we integrate with them, not replace them).
- Not a general vector DB (we're opinionated about memory, not raw vectors).
- Not a chat UI product (we sell the backend).
