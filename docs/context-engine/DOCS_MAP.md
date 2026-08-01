# Documentation map — where everything lives

Single index for specs, SDK, API, and dashboard docs.

---

## On the website (live app)

| Page | URL |
|------|-----|
| Docs home | `/docs` |
| SDK | `/docs/sdk` |
| Connectors | `/docs/connectors` |
| HTTP API | `/docs/api` |

---

## Start here (repo markdown)

| Doc | Path | What |
|-----|------|------|
| **Repo README** | [`README.md`](../../README.md) | Pitch, MVP status, quickstart |
| **Spec (canonical)** | [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) | Full product vision & pipeline |
| **This map** | [`DOCS_MAP.md`](./DOCS_MAP.md) | You are here |
| **Doc hub** | [`README.md`](./README.md) | Context Engine docs index |

---

## SDK & engine packages

| Doc | Path |
|-----|------|
| **SDK guide** | [`SDK.md`](./SDK.md) |
| **SDK package README** | [`packages/sdk/README.md`](../../packages/sdk/README.md) |
| SDK source | `packages/sdk/src/index.ts` |
| Core (`getContext`) | `packages/core/` |
| RAG retriever | `packages/rag-retriever/` |
| Retriever interface / types | `packages/retriever-interface/` |

---

## HTTP API

| Doc | Path |
|-----|------|
| **API reference** | [`API.md`](./API.md) |
| API app README | [`apps/api/README.md`](../../apps/api/README.md) |
| Implementation | `apps/api/src/` |

---

## Dashboard (frontend)

| Doc | Path |
|-----|------|
| Frontend docs index | [`apps/frontend/docs/README.md`](../../apps/frontend/docs/README.md) |
| Overview | [`apps/frontend/docs/overview.md`](../../apps/frontend/docs/overview.md) |
| UI build checklist | [`apps/frontend/BUILD_UI.md`](../../apps/frontend/BUILD_UI.md) |
| Design system | [`apps/frontend/docs/design-system.md`](../../apps/frontend/docs/design-system.md) |

### Pages

| Route | Doc |
|-------|-----|
| `/` | [`pages/home.md`](../../apps/frontend/docs/pages/home.md) |
| `/dashboard` | [`pages/dashboard.md`](../../apps/frontend/docs/pages/dashboard.md) |
| `/chat` | [`pages/chat.md`](../../apps/frontend/docs/pages/chat.md) |
| `/sources` | [`pages/sources.md`](../../apps/frontend/docs/pages/sources.md) |
| `/connectors` | [`pages/connectors.md`](../../apps/frontend/docs/pages/connectors.md) |
| `/settings` | [`pages/settings.md`](../../apps/frontend/docs/pages/settings.md) |
| `/sign-in` / `/sign-up` | [`pages/sign-in.md`](../../apps/frontend/docs/pages/sign-in.md), [`sign-up.md`](../../apps/frontend/docs/pages/sign-up.md) |

### Components & flows

| Doc | Path |
|-----|------|
| Chat / citations / tools | `apps/frontend/docs/components/` |
| Auth / nav / onboarding | `apps/frontend/docs/flows/` |

---

## Database

| What | Path |
|------|------|
| Prisma schema | [`packages/database/prisma/schema.prisma`](../../packages/database/prisma/schema.prisma) |
| Workspace routes | `apps/api/src/routes/workspace.ts` |

---

## Cursor / agent context

| Doc | Path |
|-----|------|
| Core product rule | [`.cursor/rules/context-engine-core.mdc`](../../.cursor/rules/context-engine-core.mdc) |

---

## What’s documented vs deferred

**Documented & live (MVP):** SDK, `/context`, RAG ingest/ask, connectors (Qdrant), API keys, dashboard pages.

**Spec only (not built):** ranking/dedup/conflict packages and the worker runtime — see [PROJECT_SPEC.md](./PROJECT_SPEC.md).
