# Frontend overview

## What this app is

`apps/frontend` is the **Context Engine dashboard** (`apps/dashboard` in the target layout) — where developers and workspace owners connect sources, manage API keys, view diagnostics, and test context assembly. It is not the engine itself; it will talk to `apps/api` once wired. Today authenticated product surfaces use **mock data** in `lib/mocks/`.

## Two audiences (end-state)

| Audience | Uses dashboard for |
|----------|-------------------|
| **Developer / workspace owner** | Connect sources (mem0, Qdrant, Slack, Notion, GitHub, CRM, MCP), manage API keys, view diagnostics |
| **Demo visitor** | Public marketing pages; optionally in-app chat demo before SDK integration |

## Today vs planned

### Live now (UI + mocks)

- Global session-aware header
- Home / landing hero
- Sign in and sign up (better-auth)
- Middleware + `(app)` shell for protected routes
- Dashboard hub (stats, recent calls, links)
- Chat demo (mock retrieve + stream, citations, diagnostics)
- Sources (mock document ingest)
- Connectors (demo connect/disconnect)
- Settings (profile, mock API keys, usage)

### Still planned (product wiring)

- Real `engine.getContext()` / streaming `POST /chat`
- Real `POST /ingest` for sources
- Connector OAuth and credential storage
- Prisma Workspace / API key models
- Published `@contextengine/sdk`

## App shell

Every page shares:

1. **Root layout** — font, global styles, `<SiteHeader />`
2. **`(app)` layout** — `max-w-5xl` content under fixed header for authenticated routes
3. **Auth** — better-auth via `/api/auth/*`; middleware cookie check + client `useSession`

## URL map

```
/                     Home / landing
/sign-in              Sign in
/sign-up              Sign up
/dashboard            Authenticated hub
/chat                 Context demo (mock stream)
/sources              Document ingest UI (mock)
/connectors           Source connector toggles (demo)
/settings             Profile, API keys, usage
```

## Principles

- **Citations visible** — every answer shows source chips from `getContext()` return
- **Diagnostics visible** — ranking scores, conflicts, latency by source exposed in chat
- **No secrets in browser** — LLM, Qdrant, and connector credentials stay on API only
- **Source agnostic** — UI treats all connectors uniformly via shared connector config model

## Related

- [docs/context-engine/](../../../docs/context-engine/) — full product spec
