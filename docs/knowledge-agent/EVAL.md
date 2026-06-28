# Evaluation Guide

How we measure retrieval quality, answer correctness, and tool-selection accuracy for the Internal Knowledge Agent.

A reviewer should be able to read this doc and the [README](./README.md) and fully understand the project in under three minutes.

---

## Goals

| Dimension | What we measure | Why it matters |
|-----------|-----------------|----------------|
| Retrieval accuracy | Did the right source doc appear in top-k? | Bad retrieval → bad answers, no matter how good the LLM |
| Answer correctness | Does the answer match expected characteristics? | Citations alone don't guarantee factual accuracy |
| Tool selection | Did the agent call the right MCP tool? | Action path is half the product |

---

## Tooling

- **promptfoo** — test runner, assertion library, pass-rate reporting
- **Location** — `packages/eval/`
- **Run command** — `pnpm eval` (to be wired in root `package.json`)

---

## Test suite structure

```
packages/eval/
├── promptfooconfig.yaml
└── testcases/
    ├── retrieval-accuracy.yaml
    ├── answer-correctness.yaml
    └── tool-selection.yaml
```

Target: **15–20 total cases** across all files.

---

## Test case categories

### 1. Retrieval accuracy (6–8 cases)

Verify the right document is retrieved before generation.

```yaml
# testcases/retrieval-accuracy.yaml
- description: "API key reset question retrieves correct doc"
  vars:
    question: "How do I reset my API key?"
  assert:
    - type: javascript
      value: |
        // output.retrieved_sources should include the API keys article
        output.retrieved_sources.some(s => s.source_url.includes('api-keys'))
```

### 2. Answer correctness (6–8 cases)

Check answer content and citation presence.

```yaml
# testcases/answer-correctness.yaml
- description: "Refund policy cites 30-day window"
  vars:
    question: "What is your refund policy?"
  assert:
    - type: llm-rubric
      value: "Answer mentions a 30-day refund window and includes at least one citation"
    - type: is-json
    # validates Zod answer schema: { answer, citations[] }
```

### 3. Tool selection (4–6 cases)

Verify the agent picks the correct MCP tool.

```yaml
# testcases/tool-selection.yaml
- description: "Order lookup triggers lookup_order_status"
  vars:
    question: "What's the status of order ORD-1234?"
  assert:
    - type: equals
      value: "lookup_order_status"
      transform: output.tool_called

- description: "Escalation request triggers escalate_to_human"
  vars:
    question: "I need to speak to a manager about my refund"
  assert:
    - type: equals
      value: "escalate_to_human"
      transform: output.tool_called
```

---

## Methodology

1. **Build eval cases alongside features** — add a case when you ship retrieval, each tool, citation rendering
2. **Run before every phase gate** — Phase 2 exit requires retrieval cases passing; Phase 3 requires tool cases
3. **Track pass rate over time** — record in this doc after each run
4. **Inspect failures in Langfuse** — correlate eval failures with traces to distinguish retrieval vs. generation vs. routing bugs

---

## Pass rate targets

| Phase | Target | Notes |
|-------|--------|-------|
| Phase 2 (RAG) | ≥ 80% retrieval + answer cases | Tune chunk size, overlap, rerank k |
| Phase 3 (MCP) | ≥ 90% tool-selection cases | Router prompts and tool descriptions |
| Phase 4 (full suite) | ≥ 85% overall | Combined suite |

---

## Pass rate log

Update after each eval run:

| Date | Pass rate | Notes |
|------|-----------|-------|
| _TBD_ | _TBD_ | Initial baseline after Phase 4 |

---

## Common failure modes

| Failure | Symptom | Fix |
|---------|---------|-----|
| Chunk too large | Retrieval returns right doc but wrong section | Reduce chunk size to 500–600 tokens |
| Chunk too small | Answer lacks context, hallucinates | Increase to 700–800 tokens, add overlap |
| No rerank | Keyword queries fail (order IDs, error codes) | Enable hybrid search + Voyage rerank |
| Wrong tool | "Create ticket" calls lookup instead | Improve tool descriptions; add routing examples |
| Missing citations | Answer correct but no sources | Enforce Zod schema; reject invalid outputs |
| Citation mismatch | Citation URL doesn't support claim | Tighten prompt: "only cite retrieved chunks" |

---

## promptfoo config sketch

```yaml
# promptfooconfig.yaml
description: Internal Knowledge Agent eval suite
providers:
  - id: file://../agent/src/eval-provider.ts
    label: knowledge-agent

tests:
  - file://testcases/retrieval-accuracy.yaml
  - file://testcases/answer-correctness.yaml
  - file://testcases/tool-selection.yaml

defaultTest:
  options:
    transform: file://transforms/extract-output.ts
```

The eval provider wraps the Mastra agent (or a thin test harness) so promptfoo can call retrieval + generation + routing in one shot.

---

## What reviewers should look for

1. **Pass rate number** — printed by `pnpm eval`, logged above
2. **Failure analysis** — at least 2–3 documented failure modes and fixes
3. **Langfuse correlation** — any failing case has a trace ID you can inspect
4. **Coverage** — cases span knowledge-only, action-only, and combined queries
