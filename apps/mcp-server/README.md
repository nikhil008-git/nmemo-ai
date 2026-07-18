# MCP Retriever

`packages/retrievers/mcp-retriever` — generic MCP server connector for the Context Engine.

MCP servers are one context source among many (memory, documents, Slack, CRM, etc.). Each MCP server a developer registers becomes a retriever that implements the shared `Retriever` interface:

```ts
interface Retriever {
  retrieve(query: string, opts: { userId: string; workspaceId: string }): Promise<Context[]>
}
```

Retrieved context flows through the standard pipeline: ranking → dedup → conflict resolution → compression → token budget → prompt builder.

## Related

- [docs/context-engine/PROJECT_SPEC.md](../../docs/context-engine/PROJECT_SPEC.md)
