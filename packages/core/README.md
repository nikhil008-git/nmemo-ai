# @repo/core

The ranking and context-budget engine. Given candidate context from any source, decide what
the model actually sees and in what order.

## Surface

```ts
getContext, getContextFast          // end-to-end orchestration
routeConnectors                     // which sources to ask
rankDocuments, rankMemories         // relevance ordering
dedupeDocuments                     // collapse near-duplicates
applyTokenBudget                    // fit the window, keep the best
writeMemory, writeMemoryAsync       // memory write path
```

Types come from `@contextengine/retriever-interface`: `GetContextResult`, `ContextItem`,
`Citation`, `Diagnostics`, `SourceStatus`, `TokenUsage`.

## Pipeline

```
route → retrieve → rank → dedupe → resolve conflicts → budget → prompt
```

Each stage is a pure function over the previous stage's output, which is why the whole thing
is testable without a network and replayable in `evals/`.

## Role in nmemo

`@repo/memory` decides *what is eligible* for recall; core decides *what fits*. Keep that
line — eligibility is domain logic about projects and branches, budgeting is arithmetic about
tokens and scores.

## Rules

- Deterministic given the same inputs and scores. No hidden clock, no ambient config.
- Never truncate silently: dropped items surface in `Diagnostics`.
- Ranking changes are eval-gated. A scoring tweak without an eval run is a regression waiting
  to happen.
- No Prisma. Retrieval reaches storage through retriever implementations.

## Depends on

`@contextengine/retriever-interface`, `@repo/shared`.
