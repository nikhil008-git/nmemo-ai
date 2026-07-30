# @repo/shared

Small shared schemas and event types. The leaf of the dependency graph — it imports nothing
internal, so anything here can be used anywhere.

## Current exports

```ts
citationSchema, agentAnswerSchema   // zod schemas
type Citation, AgentAnswer          // inferred types
type RouteDecision                  // "retrieve" | "tool" | "both"
```

Subpath: `@repo/shared/schema`.

## What belongs here

- Types crossing two or more packages: episode and fact shapes, agent event types, tool
  result envelopes.
- Zod schemas for anything that crosses a process boundary — CLI ↔ API, agent ↔ tools.
- Small pure helpers with no dependencies.

## What does not

- Anything importing another `@repo/*` package. That dependency makes this a cycle risk.
- Business logic. If it makes a decision, it belongs in the package that owns the decision.
- Config, env access, or clients of any kind.
- Types used by exactly one package. Keep those local until a second consumer exists.

## Rules

- Zod schema is the source of truth; export the inferred type, never a hand-written twin.
- Add each new area as its own file and its own `exports` subpath so consumers import
  narrowly.
- Breaking a shape here breaks the whole graph — extend with optional fields, then migrate.
