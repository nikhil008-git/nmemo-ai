# @repo/tools

The tools the agent can call: read, search, patch, command, diff. Each tool is a schema, a
permission class, and an implementation — nothing else.

## Tools

| Tool      | Does | Permission |
|-----------|------|------------|
| `read`    | Read a file or a line range | read |
| `search`  | Search file contents and names | read |
| `patch`   | Apply an edit to a file | write |
| `command` | Run a shell command in the repository | execute |
| `diff`    | Show pending changes | read |

## Shape

```ts
interface Tool<I, O> {
  name: string
  description: string
  input: ZodSchema<I>
  permission: "read" | "write" | "execute"
  run(input: I, ctx: ToolContext): Promise<O>
}
```

`ToolContext` carries the repository root and an abort signal. A tool receives no config and
reads no environment variables.

## Rules

- Every tool declares its permission class. The agent enforces it; the tool does not decide
  whether it is allowed to run.
- Paths are validated against the repository root before use. No escaping the root, no
  following symlinks out of it, no absolute paths from the model.
- `patch` is atomic and reversible: it returns the exact diff it applied, or it changes nothing.
- `command` never runs with a shell string built from model output without going through
  approval, and it always has a timeout and captured output limits.
- Failures return typed errors. A tool never throws a raw exception into the agent loop.
- Deterministic and side-effect-free for the read-class tools, so evals can replay them.

## Depends on

`@repo/repository`, `@repo/shared`.
