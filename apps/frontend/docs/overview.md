# Frontend overview

## What this app is

`apps/frontend` is the **Context Engine dashboard** (`apps/dashboard` in the target layout) — where developers and workspace owners connect sources, manage API keys, view diagnostics, and test context assembly. It is not the engine itself; it talks to `apps/api` and displays results.

## Two audiences (end-state)

| Audience | Uses dashboard for |
|----------|-------------------|
| **Developer / workspace owner** | Connect sources (mem0, Qdrant, Slack, Notion, GitHub, CRM, MCP), manage API keys, view diagnostics |
| **Demo visitor** | Public marketing pages; optionally in-app chat demo before SDK integration |

## Today vs planned

### Live now

- Light theme (white background, black text)
- Montserrat typography
- Global header with inline breadcrumb nav
- Home / landing hero
- Sign in and sign up (better-auth)
- Dashboard shell (session-gated welcome)

### Planned (product)

- Connector setup UI (mem0, Qdrant, OAuth sources, MCP servers)
- Diagnostics viewer (ranking scores, discarded context, conflicts, latency by source)
- API key management
- Streaming chat demo powered by `engine.getContext()`
- Workspace / usage metering

## App shell

Every page shares:

1. **Root layout** — font, global styles, `<SiteHeader />`
2. **Main content** — page-specific body below the fixed header
3. **Auth** — better-auth via `/api/auth/*` (Next.js route)

## URL map (current + planned)

```
/                     Home / landing
/sign-in              Sign in
/sign-up              Sign up
/dashboard            Authenticated home (today: welcome only)

── planned ──
/chat                 In-app context demo (getContext → LLM stream)
/connectors           Source connector setup (mem0, Qdrant, Slack, etc.)
/diagnostics          Retrieval diagnostics viewer
/settings             API keys, workspace, billing
```

## Principles

- **Citations visible** — every answer shows source chips from `getContext()` return
- **Diagnostics visible** — ranking scores, conflicts, latency by source exposed in dashboard
- **No secrets in browser** — LLM, Qdrant, and connector credentials stay on API only
- **Source agnostic** — UI treats all connectors uniformly via shared connector config model

## Related

- [docs/context-engine/](../../../docs/context-engine/) — full project spec
