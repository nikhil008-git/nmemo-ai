# nmemo — Frontend build guide (UI first, backend later)

Build screens with **mock data** in `lib/mocks/`. Wire real API later.

**Design:** white bg, black text, Montserrat, `max-w-5xl`, shadcn/ui. See `docs/design-system.md`.

**Defer:** real `/chat` API, connector syncs, `engine.getContext()` wiring, dynamic page rebuild, `widget.js` bundle.

---

## Sprint order

| # | Build |
|---|--------|
| 1 | App shell, auth nav, `/sites`, site layout + tabs |
| 2 | Chat + citations + grounding score (mock stream) |
| 3 | Conversations list + detail |
| 4 | Analytics + gaps + weekly report |
| 5 | Knowledge (sources + echo drafts) |
| 6 | Embed + widget preview |
| 7 | Settings, dashboard hub, landing polish |

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
    ├── chat/page.tsx
    ├── settings/page.tsx
    └── sites/
        ├── page.tsx
        ├── new/page.tsx
        └── [id]/
            ├── layout.tsx        # SiteNav tabs
            ├── page.tsx          # overview
            ├── conversations/
            │   ├── page.tsx
            │   └── [conversationId]/page.tsx
            ├── analytics/page.tsx
            ├── knowledge/page.tsx
            └── embed/page.tsx
```

Add `middleware.ts` — protect `(app)/*` → redirect `/sign-in`.

---

## Pages (what each needs)

| Route | Sections |
|-------|----------|
| `/` | Hero, CTA, 3 feature cards |
| `/dashboard` | Stats, site cards, recent chats — or redirect `/sites` |
| `/sites` | List/grid, Add site CTA, empty state |
| `/sites/new` | Domain URL form → mock navigate to knowledge |
| `/sites/[id]` | Header, stats, top questions, recent chats, embed link |
| `/chat` | Site picker + full `Chat` component |
| `/sites/[id]/conversations` | Filters + table → detail Sheet or sub-route |
| `/sites/[id]/conversations/[id]` | Context bar, thread, memory panel |
| `/sites/[id]/analytics` | Stats, top questions, **gap table**, funnel, pages, **weekly report** |
| `/sites/[id]/knowledge` | **Sources** tab + **Gaps & fixes** tab (echo drafts) |
| `/sites/[id]/embed` | Steps, snippet copy, widget preview, customize (local) |
| `/settings` | Profile, notification toggles, webhooks placeholder |

---

## Layout components

| File | Role |
|------|------|
| `site-header.tsx` | Logged out: Sign In/Up. Logged in: Sites, Chat, Settings, sign out |
| `site-nav.tsx` | Tabs: Overview \| Conversations \| Analytics \| Knowledge \| Embed |
| `page-shell.tsx` | Title, description, actions, `pt-16 max-w-5xl` |

---

## Components to build

### Layout & sites
`empty-state` · `stat-card` · `status-badge` · `site-card` · `site-table` · `add-site-form`

### Chat & trust (signature)
`chat` · `message-bubble` · `streaming-text` · `citation` · `citation-row` · **`grounding-bar`** · `lead-card` · `proof-drawer` (optional)

### Conversations & analytics
`conversation-list` · `conversation-row` · `conversation-detail` · **`gap-table`** · **`gap-draft-panel`** · `weekly-report-card` · `simple-bar-chart`

### Knowledge & embed
`source-list` · `ingest-progress` · **`gap-fix-queue`** · `embed-snippet` · `widget-preview`

### Skip for now
`tool-call-indicator` (use `lead-card` instead)

---

## Mock files

```
lib/
├── types.ts
└── mocks/
    ├── sites.ts
    ├── dashboard.ts
    ├── site-overview.ts
    ├── conversations.ts
    ├── chat.ts
    ├── analytics.ts
    ├── gaps.ts
    └── knowledge.ts
```

### Core types

```ts
type Site = { id, domain, name, status: "syncing"|"ready"|"error", lastIngestedAt, conversations7d, gapsCount }
type Citation = { source_url, title, snippet }
type Message = { id, role, content, citations?, groundingScore?, leadId? }
type Conversation = { id, siteId, visitorIdMasked, startedAt, lastMessagePreview, messageCount, pageUrl, avgGrounding, hasLead, messages? }
type KnowledgeGap = { id, questionCluster, count, avgScore, lastAskedAt, status: "detected"|"draft_ready"|"published", suggestedDraft? }
```

---

## Chat states

Idle → Sending → Retrieving ("Searching docs…") → Streaming → Low grounding (amber bar) → Error

---

## shadcn to add

```bash
npx shadcn@latest add button card input label textarea table tabs badge dialog sheet dropdown-menu avatar separator progress sonner
```

---

## Self-improving (Echo) UI map

| Step | Page |
|------|------|
| Weak answer / low grounding | `grounding-bar` in chat + conversations |
| Gap clusters | `/analytics` → `gap-table` |
| Suggested FAQ draft | `/knowledge` Gaps tab → `gap-fix-queue` + `gap-draft-panel` |
| Owner approves | Approve button → toast → mock "published" |

Client (site owner) approves — not platform codebase.

---

## Done checklist

- [ ] All routes render with mocks
- [ ] Auth header + protected `(app)`
- [ ] Site tabs across sub-routes
- [ ] Chat stream + citations + grounding
- [ ] Gap → draft flow (local state)
- [ ] Embed copy works
- [ ] Empty states on sites + conversations

---

## Related

- `docs/README.md` — per-page UX specs
- `docs/design-system.md` — tokens
- `design.md` — shadcn setup
