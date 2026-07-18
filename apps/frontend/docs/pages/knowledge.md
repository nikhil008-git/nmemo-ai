# Knowledge (`/sites/[id]/knowledge`) — planned

## Purpose

Manage context sources — connect, configure, and monitor the retrievers that feed `engine.getContext()`.

## Audience

Workspace owner or content admin.

## Sections (planned)

### Connected sources

| Source type | Examples | Auth |
|-------------|----------|------|
| Memory | mem0 workspace | API key / workspace config |
| Documents (RAG) | Qdrant index | index config |
| Workspace | Notion, Google Drive | OAuth |
| Communication | Slack, Email | OAuth |
| Development | GitHub, Jira | OAuth |
| Business | CRM, SQL | API keys / credentials |
| External | MCP servers | server registration |

### Sync status

- Last sync per connector
- Per-source health (responding / timed out / auth expired)
- Re-sync button per source

### Corpus health

- Total chunks in Qdrant
- Memory fact count in mem0
- Stale sources warning
- Link to gap report from analytics

## Related backend

- `packages/retrievers/*` — one package per source type
- `packages/db` — per-workspace connector configs in Prisma
- `apps/worker` — embedding jobs, connector syncs

## Related spec

- [docs/context-engine/PROJECT_SPEC.md](../../../../docs/context-engine/PROJECT_SPEC.md) — context sources table
