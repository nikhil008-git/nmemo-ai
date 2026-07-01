# @repo/ingestion

Phase 1 pipeline: parse → chunk → embed → Qdrant upsert.

```bash
# from repo root
npm run build -w @repo/ingestion
npm run ingest -w @repo/ingestion -- ./corpus/sample.md
```

Requires Qdrant locally (`QDRANT_URL=http://localhost:6333`).
