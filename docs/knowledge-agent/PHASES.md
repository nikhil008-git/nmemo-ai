# Build Phases

Step-by-step build brief for the Internal Knowledge Agent. Work through phases in order — each has a verification gate before moving on.

---

## Phase 1 — Ingestion + retrieval core

**Goal:** Documents in Qdrant; manual retrieval sanity check passes.

### Tasks

1. Pick corpus: public SaaS help docs (Linear, Stripe, etc.) — ~80–150 articles
2. Build `packages/ingestion`:
   - `parse.ts` — PDF / HTML / MD parsing
   - `chunk.ts` — 500–800 tokens, 10–15% overlap
   - `embed.ts` — Voyage `voyage-3` or OpenAI `text-embedding-3-large`
   - `run.ts` — CLI entrypoint
3. Upsert to Qdrant with metadata: `source_url`, `title`, `section`, `chunk_index`
4. Stand up Qdrant locally (Docker for dev only)

### Verification gate

Run 5–10 hand-picked queries. Eyeball whether the right chunks come back. **Do not proceed until this passes.**

### Cursor rule

`.cursor/rules/knowledge-agent-ingestion.mdc`

---

## Phase 2 — RAG answer pipeline

**Goal:** Streamed answers with real, clickable citations.

### Tasks

1. Build `packages/agent/retrieval.ts`:
   - Hybrid search (BM25 + vector) against Qdrant
   - Rerank top-k with Voyage `rerank-2`
2. Define Zod schema: `{ answer, citations[{ source_url, title, snippet }] }`
3. Wire into `apps/web/app/api/chat/route.ts` via Vercel AI SDK (`streamObject` or `streamText`)
4. Build UI components:
   - `citation.tsx` — clickable source chips
   - `chat.tsx` — streaming message list

### Verification gate

Ask 3 knowledge questions in the UI. Each answer must:
- Stream tokens live
- Include at least one citation
- Citation links to the correct source doc

### Cursor rule

`.cursor/rules/knowledge-agent-retrieval.mdc`, `.cursor/rules/knowledge-agent-web.mdc`

---

## Phase 3 — MCP server + agent routing

**Goal:** Action questions trigger the correct MCP tool; UI shows the call.

### Tasks

1. Build `apps/mcp-server` with 3 tools (mock backends):
   - `create_ticket(subject, description, priority)`
   - `lookup_order_status(order_id)`
   - `escalate_to_human(reason)`
2. Build `packages/agent/router.ts` — decide retrieve / tool / both per message
3. Connect Mastra agent to MCP server + retrieval
4. Build `tool-call-indicator.tsx` — visible tool call + result in chat

### Verification gate

Test these prompts:
- "Create a ticket for my broken order" → `create_ticket` called, ticket ID shown
- "What's the status of order ORD-1234?" → `lookup_order_status` called
- "I need to speak to a manager" → `escalate_to_human` called

### Cursor rule

`.cursor/rules/knowledge-agent-mcp.mdc`

---

## Phase 4 — Observability + evaluation

**Goal:** Langfuse traces for every turn; promptfoo suite with pass rate.

### Tasks

1. Add Langfuse tracing around:
   - Retrieval call
   - Rerank call
   - Tool calls
   - Final generation
2. Build 15–20 eval cases in `packages/eval/testcases/`:
   - Retrieval accuracy (expected source doc)
   - Answer correctness (expected characteristics)
   - Tool selection (expected tool call)
3. Wire `pnpm eval` to run promptfoo and print pass rate
4. Log pass rate and failure modes in [EVAL.md](./EVAL.md)

### Verification gate

- Pick any chat turn → find full trace in Langfuse (retrieval → rerank → generation)
- Run `pnpm eval` → pass rate printed
- At least 15 test cases exist

### Cursor rule

`.cursor/rules/knowledge-agent-eval.mdc`

---

## Phase 5 — Polish + documentation

**Goal:** Demo-ready UI and accurate docs.

### Tasks

1. Polish chat UI: streaming, citation chips, tool-call indicators, error states
2. Ensure all five docs are accurate:
   - [README.md](./README.md)
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [EVAL.md](./EVAL.md)
   - [MCP_TOOLS.md](./MCP_TOOLS.md)
   - [SETUP.md](./SETUP.md)
3. Record 30–60 second demo:
   - One knowledge question with citations
   - One action question that triggers a tool call
4. Add architecture diagram and demo gif to README

### Verification gate ("done")

- [ ] Knowledge question → streamed answer + clickable citations
- [ ] Action question → correct MCP tool + visible result
- [ ] Langfuse trace exists for any chat turn
- [ ] `pnpm eval` prints pass rate
- [ ] Five markdown docs accurate to implementation
- [ ] Demo video recorded

---

## Phase dependency graph

```mermaid
flowchart TD
    P1[Phase 1: Ingestion] --> P2[Phase 2: RAG Pipeline]
    P2 --> P3[Phase 3: MCP + Routing]
    P3 --> P4[Phase 4: Observability + Evals]
    P4 --> P5[Phase 5: Polish + Docs]
```

Do not skip phases. Each gate prevents compounding errors (bad chunks → bad retrieval → bad evals → wasted debugging time).
