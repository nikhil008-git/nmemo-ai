# Visitor chat flow (embed) — planned

## Goal

Anonymous visitor on customer site gets answers and can take actions; owner sees everything in dashboard.

## Actors

- **Visitor** — on `customer.com`, widget open
- **Widget** — `widget.js`
- **API** — `apps/api` `/chat`
- **Agent** — retrieve / tool / both
- **Owner** — reads logs in dashboard

## Step by step

```
1. Visitor lands on customer.com
   → widget loads, reads visitorId cookie (or creates one)

2. Visitor opens chat, types question
   → widget sends: message, siteId, visitorId, sessionId, pageUrl

3. API loads visitor memory (if returning)
   → logs message to Postgres

4. Agent routes message
   → KNOWLEDGE: Qdrant → rerank → LLM → answer + citations
   → ACTION: MCP tool → lead/ticket record
   → BOTH: retrieve then tool

5. Response streams to widget
   → citations as chips, tool result as card

6. API updates visitor memory summary (end of turn)

7. Owner views thread in /sites/[id]/conversations
```

## Memory

| Layer | Scope |
|-------|--------|
| Session | Same visit, full thread in context |
| Cross-session | `visitorId` — summary + open lead/ticket on return |

## Analytics hooks

- Every message logged with page URL, retrieval scores, tools used
- Feeds analytics + self-healing gap detection

## Related

- [widget.md](../components/widget.md)
- [chat.md](../components/chat.md)
- [conversations.md](../pages/conversations.md)
