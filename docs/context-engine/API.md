# HTTP API reference (`apps/api`)

Base URL (local): `http://localhost:8080`

## Auth

| Mode | How |
|------|-----|
| Session | Cookie from dashboard sign-in (`credentials: "include"`) |
| API key | `Authorization: Bearer ce_live_...` |

---

## Context Engine

### `POST /context`

Full `getContext()` orchestration.

**Auth:** session or API key  

**Body:**

```json
{
  "query": "string",
  "userId": "string",
  "workspaceId": "string",
  "conversationId": "string?",
  "agent": "string?"
}
```

**Response:** `GetContextResult` — see [SDK.md](./SDK.md).

### `POST /context/fast`

Same auth/body/response. MVP uses the same RAG path.

---

## RAG helpers (dashboard)

### `POST /ingest`

**Auth:** session  
**Body:** multipart `file` (PDF) + optional `title`  
**Response:** `{ chunkCount, title, source }`

### `POST /ask`

**Auth:** session  
Runs `getContext` then LLM.  

**Body:** `{ "question": "string" }`  

**Response:**

```json
{
  "answer": "string",
  "citations": [{ "source_url", "title", "snippet" }],
  "groundingScore": 0,
  "context": { "...GetContextResult fields..." }
}
```

---

## Workspace

All require **session**.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/workspaces/current` | Ensure default workspace + connectors |
| `GET` | `/workspaces/connectors` | List connectors |
| `PATCH` | `/workspaces/connectors/:type` | Update status/config (`qdrant` only in MVP) |
| `GET` | `/workspaces/api-keys` | List keys |
| `POST` | `/workspaces/api-keys` | Create key → returns `secret` once |
| `DELETE` | `/workspaces/api-keys/:id` | Revoke key |

---

## Health

### `GET /health` → `{ "status": "ok" }`

---

## Source

- Routes: [`apps/api/src/index.ts`](../../apps/api/src/index.ts), [`routes/`](../../apps/api/src/routes/)
- App README: [`apps/api/README.md`](../../apps/api/README.md)
