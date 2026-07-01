# Internal Knowledge Agent — Project Spec

A RAG-powered chat agent that answers questions from a company's internal docs **and** takes real actions (create ticket, look up order, escalate) via its own MCP server. Built to demonstrate production-grade AI engineering: hybrid retrieval, reranking, citations, observability, and evals — not just a chatbot wrapper.

**This doc is the build brief.** Hand it to Cursor as project context and work through it phase by phase.

---

## 1. What this project actually is

Two capabilities, one agent:

1. **Knowledge** — ask a question, the agent retrieves relevant chunks from a vector store, reranks them, and answers with citations pointing to the exact source document and section.
2. **Action** — if the question implies something needs to be *done* (not just known), the agent calls a tool exposed by a custom MCP server — e.g. `create_ticket`, `lookup_order_status`, `escalate_to_human`.

The agent decides which path (or both) a given question needs. That decision-making — not the UI — is the core engineering problem.

---

## 2. Why this project

- MCP is the freshest standard in the agent ecosystem right now. Almost no portfolio projects at the junior/early level have a real MCP server.
- It mirrors exactly what vertical AI companies (legal AI, support AI, workflow AI) actually ship: domain documents in, structured answers and actions out.
- It's fast to build shallow, but the depth shows immediately to anyone technical: retrieval quality, citation accuracy, eval pass rate, and trace visibility are all things a tutorial-follower skips and you won't.

---

## 3. Tech stack and why each piece

| Layer | Choice | Why |
|-------|--------|-----|
| Monorepo | Turborepo | Shared types/schemas across agent, ingestion, eval, and both apps |
| Frontend | Next.js (App Router) | Streaming UI, server actions, fastest path to a clean demo |
| AI SDK | Vercel AI SDK | Streaming, tool calling, structured outputs (Zod), provider-agnostic |
| Agent orchestration | Mastra | TypeScript-native, built-in MCP support, fastest to ship vs LangGraph |
| Vector DB | Qdrant | Self-hostable, supports hybrid search (BM25 + vector), free |
| Embeddings | Voyage AI (`voyage-3`) or OpenAI (`text-embedding-3-large`) | Voyage has stronger retrieval benchmarks for RAG specifically |
| Reranker | Voyage rerank (`rerank-2`) | Critical step most RAG tutorials skip — this is your differentiator |
| Relational DB | PostgreSQL | Chat history, ticket records, eval results |
| ORM | Prisma | Type-safe schema shared across apps |
| Actions layer | Custom MCP server | Exposes tools as a standalone server — pluggable into any MCP client |
| Observability | Langfuse | Traces every retrieval, rerank, tool call, and generation step |
| Evaluation | promptfoo | Test suite scoring retrieval accuracy + answer correctness |
| Deployment | Vercel (web) + Railway/Fly.io (mcp-server, Qdrant, Postgres) | No k8s needed for this layer |

No Docker/Kubernetes/Helm required for this project — keep the AI layer deployable with simple managed services.

---

## 4. Repository structure (Turborepo)

```
knowledge-agent/
├── apps/
│   ├── web/                 # Next.js chat UI
│   │   ├── app/
│   │   │   ├── api/chat/route.ts      # streaming chat endpoint
│   │   │   └── page.tsx               # chat interface
│   │   └── components/
│   │       ├── chat.tsx
│   │       ├── citation.tsx
│   │       └── tool-call-indicator.tsx
│   │
│   └── mcp-server/          # standalone MCP server
│       ├── src/
│       │   ├── tools/
│       │   │   ├── create-ticket.ts
│       │   │   ├── lookup-order.ts
│       │   │   └── escalate.ts
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── agent/                # Mastra agent + routing logic
│   │   └── src/
│   │       ├── agent.ts              # main agent definition
│   │       ├── router.ts             # decides: RAG vs tool vs both
│   │       └── retrieval.ts          # hybrid search + rerank
│   │
│   ├── ingestion/             # document pipeline
│   │   └── src/
│   │       ├── parse.ts              # PDF/HTML/MD parsing
│   │       ├── chunk.ts              # chunking with overlap
│   │       ├── embed.ts              # embedding + Qdrant upsert
│   │       └── run.ts                # CLI entrypoint
│   │
│   ├── eval/                  # promptfoo test suite
│   │   ├── testcases/
│   │   │   └── retrieval-accuracy.yaml
│   │   └── promptfooconfig.yaml
│   │
│   └── shared/                 # shared types, Zod schemas, Prisma client
│       └── src/
│           ├── schemas.ts            # Answer, Citation, ToolCall types
│           └── db.ts
│
├── turbo.json
├── package.json
└── README.md
```

### Current repo mapping

The monorepo is scaffolded but not yet restructured to match the target layout:

| Target | Current | Action |
|--------|---------|--------|
| `apps/web` | `apps/frontend` | Evolve into chat UI; add `/api/chat` |
| `apps/mcp-server` | `apps/api` (Express stub) | Replace/rename when building Phase 3 |
| `packages/shared` | `packages/database` (`@repo/db`) | Extend with Zod schemas; keep Prisma here |
| `packages/agent` | — | Create in Phase 2 |
| `packages/ingestion` | — | Create in Phase 1 |
| `packages/eval` | — | Create in Phase 4 |

---

## 5. Build phases

### Phase 1 — Ingestion + retrieval core

- Pick a target corpus: a public SaaS company's help docs (Linear, Stripe, or similar) — clean structure, ~80–150 articles.
- `packages/ingestion`: scrape or download → parse → chunk (500–800 tokens, 10–15% overlap) → embed → upsert into Qdrant with metadata (`source_url`, `title`, `section`, `chunk_index`).
- Stand up Qdrant locally (Docker for local dev only — not part of the deployed AI architecture, just a dev convenience).
- Verify retrieval manually: run 5–10 hand-picked queries, eyeball whether the right chunks come back.

### Phase 2 — RAG answer pipeline

- `packages/agent/retrieval.ts`: hybrid search (BM25 + vector) against Qdrant, then rerank top-k with Voyage rerank.
- Define a strict Zod schema for the answer: `{ answer: string, citations: [{ source_url, title, snippet }] }`.
- Wire into `apps/web/app/api/chat/route.ts` using the Vercel AI SDK's `streamObject` or `streamText` with tool calling.
- Render citations in the UI as clickable source chips.

### Phase 3 — MCP server + agent routing

- Build `apps/mcp-server` with 2–3 tools. Mock backends are fine — the point is the protocol and the agent's tool-selection judgment, not a real ticketing system:
  - `create_ticket(subject, description, priority)`
  - `lookup_order_status(order_id)`
  - `escalate_to_human(reason)`
- `packages/agent/router.ts`: the agent decides per-message whether to retrieve, call a tool, or both, then composes the final response.
- Surface tool calls visibly in the UI (e.g. "Called `create_ticket` → ticket #4821 created").

### Phase 4 — Observability + evaluation

- Add Langfuse tracing around: retrieval call, rerank call, tool calls, final generation. Every trace should be inspectable end to end.
- Build 15–20 eval cases in `packages/eval/testcases/`: question, expected source doc, expected answer characteristics (or expected tool call).
- Run via promptfoo, capture a pass-rate number.

### Phase 5 — Polish + documentation

- Clean up the chat UI: streaming, citation chips, tool-call indicators.
- Write the five markdown files (see section 7).
- Record a 30–60 second demo: one knowledge question with citations, one action question that triggers a tool call.

### Phase 6 — Paid tier (later, after core project is done)

Not part of the initial build — revisit only once Phases 1–5 are solid and demoable. Adding billing too early risks shaping the product around monetization before the agent itself works well.

- **Provider**: Dodo Payments (merchant-of-record, low setup overhead for an indie/solo project).
- **Likely gate**: free tier = basic Q&A with plain vector search; Plus tier = action tools (MCP) unlocked + hybrid search/reranking + higher usage limits. Exact gating to be finalized once the core agent's free-tier experience is dialed in.
- **Scope when picked back up**: checkout flow, webhook to flip a `plan` field in Postgres, and plan-gated middleware in front of the tool-calling and retrieval paths.

---

## 6. Key design decisions to hold onto

- **Mastra over LangGraph**: TypeScript-native, built-in MCP support, much faster to ship solo in days rather than weeks. Worth a line in the README explaining you evaluated both.
- **Hybrid search, not pure vector search**: keyword search catches exact terms (IDs, error codes, proper nouns) that embeddings sometimes blur. Combining both with reranking on top is the realistic production pattern.
- **MCP server as its own app, not a function inside `web`**: this is what makes it a real demonstration of the protocol — pluggable into Claude Desktop or any other MCP client, not just your own UI.
- **Mocked tool backends are fine**: a founder cares that you understand tool schemas, auth boundaries, and agent tool-selection — not that you built a real ticketing system from scratch.

---

## 7. Documentation files to produce (initial build)

| File | Purpose |
|------|---------|
| `README.md` | Main pitch: what it does, architecture diagram, demo gif, quickstart, eval summary, stack table |
| `ARCHITECTURE.md` | Deep dive: data flow, why hybrid search, why Mastra, how routing decisions are made |
| `EVAL.md` | Eval methodology, test cases, pass rate, failure modes found and fixed |
| `MCP_TOOLS.md` | Each MCP tool: name, schema, purpose, example call/response |
| `SETUP.md` | Env vars, how to seed Qdrant, how to run the app and the eval suite locally |

A reviewer should be able to read just `README.md` and `EVAL.md` and fully understand the project in under three minutes.

A sixth file, `BILLING.md`, gets added once Phase 6 is picked up — covering the Dodo Payments integration, plan gating, and webhook flow. Not part of the initial five.

Also maintained: **PROJECT_SPEC.md** (this file) as the canonical build brief.

---

## 8. What "done" looks like (initial build)

- Ask a knowledge question → get a streamed answer with real, clickable citations to specific source chunks.
- Ask an action question → agent calls the correct MCP tool and the UI shows the call and its result.
- A Langfuse trace exists for any given chat turn, showing every step.
- `npm run eval` (or equivalent) runs the promptfoo suite and prints a pass rate.
- Five markdown files exist and are accurate to what's actually built.
