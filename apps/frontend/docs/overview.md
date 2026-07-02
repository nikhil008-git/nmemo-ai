# Frontend overview

## What this app is

`apps/frontend` is the **nmemo web app** — the surface site owners and (later) demo visitors interact with. It is not the AI brain; it talks to `apps/api` and displays results.

## Two audiences (end-state)

| Audience | Uses frontend for |
|----------|-------------------|
| **Site owner** | Sign up, add sites, view analytics, copy embed code, manage knowledge |
| **Demo visitor** | Public marketing pages; optionally in-app chat demo before embed ships |

## Today vs planned

### Live now

- Light theme (white background, black text)
- Montserrat typography
- Global header with inline breadcrumb nav
- Home / landing hero
- Sign in and sign up (better-auth)
- Dashboard shell (session-gated welcome)

### Planned (product)

- Streaming chat UI with citations and tool indicators
- Multi-site dashboard (sites, conversations, analytics, knowledge, embed)
- Settings and API keys
- Optional in-app preview of embed widget

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
/chat                 In-app agent demo
/sites                List customer sites
/sites/:id            Site overview
/sites/:id/conversations
/sites/:id/analytics
/sites/:id/knowledge
/sites/:id/embed
/settings             Account + billing
```

## Principles

- **Citations visible** — every knowledge answer shows source chips
- **Tool calls visible** — when agent books demo or creates ticket, user sees it
- **Owner vs visitor** — dashboard is for logged-in owners; widget is for anonymous visitors on customer sites
- **No secrets in browser** — LLM and Qdrant keys stay on API only
