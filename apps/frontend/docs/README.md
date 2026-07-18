# Context Engine — Frontend Guide

Markdown docs for the **Context Engine dashboard** (`apps/dashboard` in target layout). Connector setup, diagnostics, API keys, chat demo.

## Start here

| Doc | What it covers |
|-----|----------------|
| [BUILD_UI.md](../BUILD_UI.md) | **Build checklist** — routes, components, mocks |
| [overview.md](./overview.md) | What the frontend is today vs end-state |
| [design-system.md](./design-system.md) | Colors, typography, layout rules |

## Pages

| Route | Guide | Status |
|-------|-------|--------|
| `/` | [pages/home.md](./pages/home.md) | Live |
| `/sign-in` | [pages/sign-in.md](./pages/sign-in.md) | Live |
| `/sign-up` | [pages/sign-up.md](./pages/sign-up.md) | Live |
| `/dashboard` | [pages/dashboard.md](./pages/dashboard.md) | Live |
| `/chat` | [pages/chat.md](./pages/chat.md) | Live (mock stream) |
| `/sources` | [pages/sources.md](./pages/sources.md) | Live (mock ingest) |
| `/connectors` | [pages/connectors.md](./pages/connectors.md) | Live (demo toggles) |
| `/settings` | [pages/settings.md](./pages/settings.md) | Live (mock keys/usage) |

## Components

| Component | Guide |
|-----------|-------|
| Site header + nav | [components/site-header.md](./components/site-header.md) |
| Breadcrumb (shadcn) | [components/breadcrumb.md](./components/breadcrumb.md) |
| Chat panel | [components/chat.md](./components/chat.md) |
| Citation chips | [components/citation.md](./components/citation.md) |
| Tool call indicator | [components/tool-call-indicator.md](./components/tool-call-indicator.md) |

## Flows

| Flow | Guide |
|------|-------|
| Authentication | [flows/auth.md](./flows/auth.md) |
| Navigation & header | [flows/navigation.md](./flows/navigation.md) |
| Workspace onboarding | [flows/onboarding.md](./flows/onboarding.md) |

## Related

- [design.md](../design.md) — design tokens and shadcn setup
- [docs/context-engine/](../../../docs/context-engine/) — full product spec
