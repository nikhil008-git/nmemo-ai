# Chat (`/chat`) — planned

## Purpose

In-app demo of the Context Engine — streaming answers with citations and diagnostics visibility. Lets developers test `engine.getContext()` output before integrating the SDK.

## Audience

Logged-in workspace owners testing their connected sources.

## Layout (planned)

- **Header:** standard site header or minimal chat chrome
- **Main:** Two-column or full-width chat
  - Message list (user + assistant)
  - Citation chips under assistant messages (from `context.citations`)
  - Diagnostics panel (sources queried, latency, discarded context, conflicts)
  - Input bar fixed at bottom
- **Sidebar (optional):** workspace picker, conversation history

## Behaviors

- Stream tokens as they arrive
- Show retrieval progress per source during `getContext()`
- Click citation → open source URL in new tab
- Expand diagnostics to inspect ranking scores and token allocation
- Empty state: suggest example questions

## API

- `POST /chat` on `apps/api` (streaming)
- Backend calls `engine.getContext({ query, userId, workspaceId, conversationId, agent })`
- Feeds returned `prompt` into Vercel AI SDK stream
- Memory write-back runs async after response

## Not the same as SDK integration

This page is an in-dashboard demo. Production integrations use `@contextengine/sdk` directly.
