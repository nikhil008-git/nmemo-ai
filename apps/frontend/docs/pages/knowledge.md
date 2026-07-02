# Knowledge (`/sites/[id]/knowledge`) — planned

## Purpose

Manage what the agent knows — sources, sync status, manual uploads.

## Audience

Site owner or content admin.

## Sections (planned)

### Sources

- Website crawl (root URL, last sync, page count)
- Uploaded files (PDF, MD)
- Manual FAQ entries

### Sync

- Button: Re-ingest now
- Schedule: daily / weekly
- Progress indicator during ingest job

### Corpus health

- Total chunks in Qdrant
- Stale sources warning
- Link to gap report from analytics

### Self-healing (future)

- Pending suggested doc PRs from gap detection
- Approve → merge → auto re-ingest

## Related backend

- `packages/ingestion` CLI / job per `siteId`
- One Qdrant collection (or filtered payload) per site
