# 07 — API & SDK

> Interface contract for Phase 1. Endpoints/SDK are documented, not implemented.

## 1. Authentication
- Every request carries an API key: `Authorization: Bearer mnemo_sk_...`.
- BetterAuth resolves the key → tenant. Rate limiting + token budget enforced per tenant in Redis.

---

## 2. REST API

### `POST /v1/memories` — add
Ingest raw events; extraction happens async.
```http
POST /v1/memories
{
  "subjectId": "user_123",        // tenant's own user id (portability key)
  "messages": [
    { "role": "user", "content": "I'm allergic to peanuts" }
  ],
  "source": "support-app"          // optional, for provenance
}
→ 202 Accepted
{ "eventId": "evt_...", "status": "queued" }
```

### `POST /v1/recall` — read
Hybrid retrieval within a token budget.
```http
POST /v1/recall
{
  "subjectId": "user_123",
  "query": "any dietary restrictions?",
  "budgetTokens": 2000,
  "types": ["SEMANTIC", "EPISODIC"]   // optional filter
}
→ 200 OK
{
  "systemBlock": "Known facts about the user:\n- Allergic to peanuts ...",
  "memories": [
    { "id": "mem_...", "type": "SEMANTIC", "content": "Allergic to peanuts",
      "score": 0.94, "provenance": { "eventIds": ["evt_..."], "model": "..." } }
  ],
  "budget": { "used": 180, "limit": 2000 }
}
```

### `DELETE /v1/memories/:id` — delete one
```http
DELETE /v1/memories/mem_abc
→ 200 { "status": "deleted", "auditId": "aud_..." }
```

### `POST /v1/forget` — bulk forget
```http
POST /v1/forget
{ "subjectId": "user_123", "filter": { "type": "WORKING" } }
→ 200 { "deleted": 14 }
```

### `GET /v1/memories?subjectId=` — list (dashboard/inspection)
Returns paginated active memories with provenance for the memory explorer.

### `GET /v1/subjects/:id/export` — GDPR export
Full dump of everything stored about a subject (governance tier).

---

## 3. TypeScript SDK (`@mnemo/sdk`)

```ts
import { Mnemo } from "@mnemo/sdk";

const mem = new Mnemo({ apiKey: process.env.MNEMO_API_KEY });

// add
await mem.add({ subjectId: "user_123", messages });

// recall
const ctx = await mem.recall({
  subjectId: "user_123",
  query: userInput,
  budgetTokens: 2000,
});
const prompt = `${ctx.systemBlock}\n\nUser: ${userInput}`;

// govern
await mem.delete("mem_abc");
await mem.forget({ subjectId: "user_123", filter: { type: "WORKING" } });

// live sync (Redis pub/sub under the hood)
const sub = mem.subscribe("user_123", (event) => {
  // { type: "memory.updated" | "memory.deleted", memory }
});
```

### Convenience: AI SDK middleware
```ts
import { withMnemo } from "@mnemo/sdk/ai";

// wraps a Vercel AI SDK model so recall/add happen automatically
const model = withMnemo(openai("gpt-4o"), { mem, subjectId });
```

---

## 4. Webhooks
Tenants can subscribe to memory events server-side:
- `memory.created`, `memory.updated`, `memory.superseded`, `memory.deleted`.
- Delivered with HMAC signature; useful for syncing external systems.

---

## 5. Errors & limits
| Code | Meaning |
|---|---|
| `401` | Invalid/missing API key |
| `402` | Token/cost budget exceeded for tenant |
| `429` | Rate limited (Redis limiter) |
| `404` | Memory/subject not found |
| `422` | Malformed payload |

Rate limits and monthly token budgets are tier-based (see [`08-BUSINESS-MODEL.md`](08-BUSINESS-MODEL.md)).
