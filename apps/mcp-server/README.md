# apps/mcp-server

Agent-neutral integration. **Later — see step 8 of `../../BUILD.md`.** Not built yet.

## Purpose

Expose nmemo's memory over MCP so any MCP-capable agent — not just `apps/cli` — can save to
and recall from a project's memory. The CLI is the first client of the memory layer, not the
only one.

## Planned surface

Tools:

| Tool | Does |
|------|------|
| `recall` | Return memory relevant to a repository, branch, or task |
| `save`   | Write a session's decisions and next steps to memory |
| `status` | Report what memory holds for the current project |

Resources: project memory and episode history, read-only, addressed by project and branch.

## Design commitments

- **A thin adapter.** It maps MCP requests onto `@repo/memory`. No memory logic lives here.
- **Read-mostly by default.** `save` is the only mutation, and it writes memory — never source
  code. This server exposes no file-write or command-execution tools; those stay in
  `@repo/tools` behind the agent's approvals.
- **Explicit scope.** Every call resolves a repository through `@repo/repository` and is
  scoped to that project and workspace. No cross-project reads.
- **Agent-neutral.** Nothing here assumes a particular client's prompt format or transcript
  shape.

## Note

The previous version of this README described an MCP *retriever* — a connector pulling context
*from* third-party MCP servers into the Context Engine, at path
`packages/retrievers/mcp-retriever`:

```ts
interface Retriever {
  retrieve(query: string, opts: { userId: string; workspaceId: string }): Promise<Context[]>
}
```

That is the opposite direction from this app, which serves nmemo's memory *to* external
agents. If the retriever gets built, it belongs under `packages/` alongside
`rag-retriever` and `retriever-interface`.

## Related

- [docs/context-engine/PROJECT_SPEC.md](../../docs/context-engine/PROJECT_SPEC.md)
- [packages/memory/README.md](../../packages/memory/README.md)
