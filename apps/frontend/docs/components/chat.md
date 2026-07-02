# Chat component — planned

## Role

Reusable chat UI for `/chat` page and optionally embed panel.

## Location

`components/chat.tsx` (stub today)

## Structure (planned)

- **MessageList** — scrollable thread
- **MessageBubble** — user (right) vs assistant (left)
- **StreamingText** — incremental token render
- **ChatInput** — textarea + send; disabled while streaming
- **EmptyState** — suggested prompts

## Assistant message anatomy

1. Streamed answer text
2. **Citation row** — see [citation.md](./citation.md)
3. **Tool indicator** — see [tool-call-indicator.md](./tool-call-indicator.md) if tools ran

## States

| State | UI |
|-------|-----|
| Idle | Input enabled |
| Sending | Input disabled, user message shown |
| Retrieving | Optional “Searching docs…” |
| Streaming | Tokens appearing |
| Error | Red banner, retry button |

## Props (conceptual)

- `siteId` — which knowledge collection
- `conversationId` — continue thread
- `onCitationClick` — open source URL
