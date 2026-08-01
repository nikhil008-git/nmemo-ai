# Frontend overview

## What this app is

`apps/frontend` is the **Context Engine dashboard** — connect sources, manage workspace settings, and ask over ingested documents via `apps/api`.

## Live now

- Auth (better-auth) + protected `(app)` routes
- Sources → multipart `POST /ingest` (PDF → Qdrant)
- Chat → `POST /ask` (retrieve + LLM answer + citations)
- Connectors status (Qdrant live; others coming soon)
- Settings (session profile)

## Still planned

- `engine.getContext()` multi-source pipeline
- Connector OAuth
- Prisma Workspace / API keys / usage metering
- Published `nmemo-sdk`

## Related

- [docs/context-engine/](../../../docs/context-engine/) — full product spec
