# Context Engine — Frontend build guide (UI first, backend later)

Build screens with **mock data** in `lib/mocks/`. Wire real API later.

**Design:** white bg, black text, Montserrat, `max-w-5xl`, shadcn/ui. See `docs/design-system.md`.

**Defer:** real `engine.getContext()` wiring, connector OAuth, published SDK.

---

## Sprint order

| # | Build |
|---|--------|
| 1 | App shell, auth nav, `/dashboard` hub |
| 2 | Chat demo + citations + diagnostics panel (mock stream) |
| 3 | Sources / documents (RAG ingest UI) |
| 4 | Connectors (mem0, Qdrant, Slack, Notion, GitHub, MCP) |
| 5 | API keys + usage |
| 6 | Settings, landing polish |

---

## Routes

```
app/
├── layout.tsx
├── page.tsx                    # marketing home
├── sign-in/ | sign-up/
│
└── (app)/                      # auth required
    ├── layout.tsx
    ├── dashboard/page.tsx
    ├── chat/page.tsx           # getContext demo
    ├── sources/page.tsx        # documents / RAG ingest
    ├── connectors/page.tsx
    └── settings/page.tsx
```

Add `middleware.ts` — protect `(app)/*` → redirect `/sign-in`.

---

## Pages (what each needs)

| Route | Sections |
|-------|----------|
| `/` | Hero, CTA, short value prop (Context Engine) |
| `/dashboard` | Workspace stats, recent context calls, links to chat / sources / connectors |
| `/chat` | Streaming demo + citations + diagnostics |
| `/sources` | Upload docs, list ingested documents, ingest status |
| `/connectors` | Connect / disconnect sources (mem0, Qdrant, OAuth, MCP) |
| `/settings` | Profile, API keys, usage, workspace |

---

## Layout components

| File | Role |
|------|------|
| `site-header.tsx` | Logged out: Log in / Get started. Logged in: Dashboard, Chat, Sources, Settings |
| `chat.tsx` | Message list, input, citations |
| `citation.tsx` | Source chips from `context.citations` |
| `tool-call-indicator.tsx` | Per-source retrieval progress |

---

## Related

- [docs/README.md](./docs/README.md) — doc index
- [docs/context-engine/PROJECT_SPEC.md](../../docs/context-engine/PROJECT_SPEC.md) — product spec
