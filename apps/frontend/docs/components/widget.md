# Embed widget — planned

## Role

Floating chat on **customer websites** — separate from the nmemo dashboard app.

## Delivery

- `widget.js` served from CDN or API static path
- Installed via one `<script>` tag (see [pages/embed.md](../pages/embed.md))

## UI (planned)

- **Bubble** — bottom-right (configurable), brand color
- **Panel** — opens on click; contains mini chat UI
- **Greeting** — configurable first message
- **Powered by** — optional nmemo footer link

## Identity

- `visitorId` — cookie / localStorage, cross-session memory anchor
- `sessionId` — per visit thread
- `siteId` + public `data-key` on script tag

## Context sent with each message

- Current page URL
- Referrer
- Optional UTM params

## Not in Next.js app tree

Widget is its own bundle (`apps/widget` future) — loads on arbitrary domains.

## Related

- [flows/visitor-chat.md](../flows/visitor-chat.md)
- In-app [components/chat.md](./chat.md) shares same message/citation patterns
