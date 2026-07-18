# Sources (`/sources`)

## Purpose

Upload and list documents for RAG ingest.

## Audience

Logged-in workspace owners preparing document context.

## Layout

- Dropzone / file picker (mock ingest only)
- Table: title, source, chunks, status, updatedAt
- Link to Chat when ready docs exist

## Today

Appends to client mock list; status flips `pending` → `ready` after a short delay. Not wired to `POST /ingest`.
