# apps/cli/src/commands

One file per command. Each exports a handler that takes parsed flags and resolved config and
returns a result object — it does not call `process.exit` and does not format output.

## Commands

| Command  | Purpose |
|----------|---------|
| `start`  | Begin a session in the current repository. Resolve git state, open an episode. |
| `save`   | Write the current session to memory: what changed, what was decided, what is next. |
| `status` | Show session state, repository state, and what memory holds for this branch. |
| `resume` | Rebuild working context from memory for the current repository and branch. |
| `agent`  | Run the model/tool loop against a task, with approvals. |

## Shape

```ts
export async function save(flags: SaveFlags, ctx: CommandContext): Promise<SaveResult>
```

`CommandContext` carries the resolved config, repository handle, and memory client, so
commands stay testable without a real terminal or a real repo.

## Rules

- No `console.log` inside a handler. Return data; `bin.ts` or the TUI renders it.
- Validate flags with a zod schema at the top of the file and fail with a usage error.
- A command that mutates (`save`, `agent`) states what it will do and honours `--dry-run`.
- Long operations report progress through a callback on `ctx`, not by printing directly.
