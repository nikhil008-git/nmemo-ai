# nmemo Frontend Guide

Markdown-only documentation for every screen, component, and user flow in `apps/frontend`. No implementation detail — product and UX reference for builders and designers.

## Start here

| Doc | What it covers |
|-----|----------------|
| [overview.md](./overview.md) | What the frontend is today vs end-state |
| [design-system.md](./design-system.md) | Colors, typography, layout rules |

## Pages

| Route | Guide | Status |
|-------|-------|--------|
| `/` | [pages/home.md](./pages/home.md) | Live |
| `/sign-in` | [pages/sign-in.md](./pages/sign-in.md) | Live |
| `/sign-up` | [pages/sign-up.md](./pages/sign-up.md) | Live |
| `/dashboard` | [pages/dashboard.md](./pages/dashboard.md) | Live (auth shell) |
| `/chat` | [pages/chat.md](./pages/chat.md) | Planned |
| `/sites` | [pages/sites.md](./pages/sites.md) | Planned |
| `/sites/[id]` | [pages/site-detail.md](./pages/site-detail.md) | Planned |
| `/sites/[id]/conversations` | [pages/conversations.md](./pages/conversations.md) | Planned |
| `/sites/[id]/analytics` | [pages/analytics.md](./pages/analytics.md) | Planned |
| `/sites/[id]/knowledge` | [pages/knowledge.md](./pages/knowledge.md) | Planned |
| `/sites/[id]/embed` | [pages/embed.md](./pages/embed.md) | Planned |
| `/settings` | [pages/settings.md](./pages/settings.md) | Planned |

## Components

| Component | Guide |
|-----------|-------|
| Site header + nav | [components/site-header.md](./components/site-header.md) |
| Breadcrumb (shadcn) | [components/breadcrumb.md](./components/breadcrumb.md) |
| Chat panel | [components/chat.md](./components/chat.md) |
| Citation chips | [components/citation.md](./components/citation.md) |
| Tool call indicator | [components/tool-call-indicator.md](./components/tool-call-indicator.md) |
| Embed widget | [components/widget.md](./components/widget.md) |

## Flows

| Flow | Guide |
|------|-------|
| Authentication | [flows/auth.md](./flows/auth.md) |
| Navigation & header | [flows/navigation.md](./flows/navigation.md) |
| Owner onboarding | [flows/onboarding.md](./flows/onboarding.md) |
| Visitor chat (embed) | [flows/visitor-chat.md](./flows/visitor-chat.md) |

## Related

- [design.md](../design.md) — technical design tokens and shadcn setup
- [docs/knowledge-agent/](../../../docs/knowledge-agent/) — full product spec
