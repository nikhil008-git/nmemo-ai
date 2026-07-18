# Connectors (`/connectors`)

## Purpose

Always show Slack / GitHub / Notion / mem0 / Documents rows. Status loads via `/api/proxy` → API (session cookie forwarded).

## For customers

- **Connect with …** → OAuth (platform env must be set or they see “Unavailable”)
- **mem0** → paste API key
- **Documents** → Manage docs → `/sources`

## Auth note

Browser must not call `:8080` directly for session routes; use Next proxy.
