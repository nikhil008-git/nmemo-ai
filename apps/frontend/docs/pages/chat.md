# Chat (`/chat`) — planned

## Purpose

In-app demo of the knowledge agent — streaming answers with citations and tool call visibility. Lets owners test their indexed docs before deploying the embed widget.

## Audience

Logged-in site owners (select which site’s knowledge to query).

## Layout (planned)

- **Header:** standard site header or minimal chat chrome
- **Main:** Two-column or full-width chat
  - Message list (user + assistant)
  - Citation chips under assistant messages
  - Tool call cards when agent creates lead/ticket
  - Input bar fixed at bottom
- **Sidebar (optional):** site picker, conversation history

## Behaviors

- Stream tokens as they arrive
- Show “searching docs…” during retrieval
- Click citation → open source URL in new tab
- Empty state: suggest example questions from top analytics queries

## API

- `POST /chat` on `apps/api` (streaming)
- Pass `siteId` + `conversationId`

## Not the same as embed

This page lives on **nmemo’s domain** for testing. Customer visitors use the **widget** on their own site.
