# Visitor chat flow (embed) — planned

## Goal

Anonymous visitor on customer site gets answers powered by Context Engine; owner sees diagnostics in dashboard.

## Actors

- **Visitor** — on `customer.com`, widget open
- **Widget** — `widget.js`
- **API** — `apps/api` `/chat`
- **Context Engine** — `engine.getContext()` assembles optimized prompt
- **Owner** — reads logs and diagnostics in dashboard

## Step by step

```
1. Visitor lands on customer.com
   → widget loads, reads visitorId cookie (or creates one)

2. Visitor opens chat, types question
   → widget sends: message, workspaceId, visitorId, conversationId, pageUrl

3. API calls engine.getContext({ query, userId, workspaceId, conversationId, agent })
   → Source Router selects relevant retrievers
   → Retrievers run in parallel (memory, docs, connected sources)
   → Ranking → Dedup → Conflict Resolution → Compression → Token Budget → Prompt Builder

4. API feeds context.prompt into LLM stream (Vercel AI SDK)
   → Response streams to widget with citations

5. Memory Writer runs async
   → Extracts durable facts, writes back to mem0

6. Owner views thread + diagnostics in dashboard
   → sources queried, latency, conflicts, token allocation
```

## Memory

| Layer | Scope |
|-------|--------|
| Session | Same visit, full thread in context |
| Cross-session | `visitorId` — mem0 long-term memory on return |

## Analytics hooks

- Every `getContext()` call logs full `diagnostics` object
- Feeds analytics + context gap detection

## Related

- [widget.md](../components/widget.md)
- [chat.md](../pages/chat.md)
- [conversations.md](../pages/conversations.md)
