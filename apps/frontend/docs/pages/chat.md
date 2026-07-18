# Chat (`/chat`)

## Purpose

In-app demo of the Context Engine — streaming answers with citations and diagnostics visibility.

## Audience

Logged-in workspace owners testing context assembly before SDK integration.

## Layout

- Message list (user + assistant)
- Citation chips under assistant messages
- Collapsible diagnostics panel (latency, ranking, discarded, conflicts, token usage)
- Per-source retrieval indicator while mocking `getContext`
- Input bar at bottom
- Empty state with example questions

## Today

Client-side mock stream from `lib/mocks/context.ts`. Not wired to `POST /chat` or `engine.getContext()` yet.
