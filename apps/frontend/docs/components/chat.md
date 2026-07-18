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
2. **Citation row** — see [citation.md](./citation.md) (from `context.citations`)
3. **Diagnostics / tool indicator** — see [tool-call-indicator.md](./tool-call-indicator.md)

## States

| State | UI |
|-------|-----|
| Idle | Input enabled |
| Sending | Input disabled, user message shown |
| Retrieving | Per-source progress from `getContext()` diagnostics |
| Streaming | Tokens appearing |
| Error | Red banner, retry button |

## Props (conceptual)

- `workspaceId` — which workspace's connected sources
- `conversationId` — continue thread
- `onCitationClick` — open source URL
