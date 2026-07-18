# Analytics (`/sites/[id]/analytics`) — planned

## Purpose

Aggregate insight — what users ask, where context retrieval fails, token usage, and source performance.

## Audience

Workspace owners, growth/support leads.

## Sections (planned)

### Top questions

- Bar chart or table: question clusters, count, trend

### Context gaps

- Queries with low retrieval score, empty sources, or no citations
- Sources that timed out or returned nothing (from `diagnostics`)

### Source performance

- Latency by source (from `diagnostics`)
- Retrieval precision/recall per source over time
- Token allocation breakdown by section

### Conflicts detected

- Contradictions surfaced by conflict resolution layer
- Most-recent-source-wins resolutions logged

### Weekly report

- Export or email summary of context quality metrics

## Data source

- Postgres: workspaces, conversations, usage metering
- `packages/observability`: diagnostics from every `getContext()` call — ranking scores, discarded context, conflicts, latency, token allocation

## Future

- Compare week over week
- Adaptive retrieval performance trends
