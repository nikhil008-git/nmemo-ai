# @repo/agent

The model/tool loop and approvals. Given a task and a set of tools, run turns until the task
is done, the user stops it, or a limit is hit.

## Layout

```
src/
├── loop.ts        Turn loop: prompt → model → tool calls → results → repeat
├── approvals.ts   Policy: which tool calls need a human, and how the answer is remembered
├── model.ts       Provider client and streaming
└── prompt.ts      System prompt and context assembly
```

## The loop

1. Assemble context: task, repository state, recalled memory, tool schemas.
2. Call the model, streaming.
3. For each tool call: check the approval policy, run it, append the result.
4. Repeat until the model stops requesting tools, or a limit trips.

Limits are explicit and always set: max turns, max wall clock, max tokens.

## Approvals

- Read-class tools run without asking. Write- and execute-class tools require an answer
  unless policy already covers them.
- An approval is scoped to what was asked. Approving one command does not approve the next
  one, and approving a patch to one file does not approve another file.
- "Always allow" is remembered per project and per permission class, never globally by default.
- Denial is a normal outcome. The loop reports it to the model and continues; it does not
  retry the same call verbatim.

## Rules

- No Prisma, no HTTP to our own API. Persistence goes through `@repo/memory`.
- No terminal rendering. The loop emits events; `apps/cli` renders them.
- Provider details stay inside `model.ts` so the loop is testable against a fake model.
- Every run is replayable from its event log — that is what `evals/` depends on.

## Depends on

`@repo/tools`, `@repo/memory`, `@repo/repository`, `@repo/shared`.
