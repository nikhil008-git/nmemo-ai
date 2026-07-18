# Settings (`/settings`) — planned

## Purpose

Workspace-level configuration for Context Engine integrations.

## Audience

Authenticated workspace owners and developers.

## Sections (planned)

### Profile

- Name, email, avatar
- Change password

### Workspace / billing

- Plan tier
- Usage metering (getContext calls, token usage)
- Payment method

### API keys

- Create / revoke keys for `@contextengine/sdk` integrations
- Per-workspace scoping

### Connector credentials

- Link to connector setup (mem0, Qdrant, OAuth sources, MCP servers)
- Per-workspace connector config stored in `packages/db`

### Notifications

- Weekly context quality report
- Alert when sources fail or auth expires

### Danger zone

- Delete workspace
- Export conversation and diagnostics data

## Related spec

- [docs/context-engine/PROJECT_SPEC.md](../../../../docs/context-engine/PROJECT_SPEC.md) — developer integration steps
