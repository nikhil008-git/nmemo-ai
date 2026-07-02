# Dashboard (`/dashboard`)

## Purpose

**Today:** Authenticated landing after login — confirms session and shows user name/email.

**End-state:** Hub for site owners — sites list, quick stats, links to conversations and embed setup.

## Audience

Logged-in site owners only.

## Access control

- Unauthenticated → redirect to `/sign-in`
- Loading state: “Loading…” then “Redirecting…” if no session

## Layout (today)

- **Header:** breadcrumb with **Dashboard** current
- **Body:** Centered welcome
  - Eyebrow: “Dashboard”
  - Welcome line with user name
  - Email in muted text
  - Sign Out button (primary style)

## End-state sections (planned)

| Section | Description |
|---------|-------------|
| Sites overview | Cards per connected website |
| Quick stats | Conversations today, leads, unanswered gaps |
| Recent activity | Last 5 chats across sites |
| CTA | Add site / copy embed |

## Navigation out

- Header links to other public routes
- Future sidebar: Sites, Analytics, Settings

## Future routes

Dashboard may become `/sites` as primary home; `/dashboard` redirects or becomes overview widget.
