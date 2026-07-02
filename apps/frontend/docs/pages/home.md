# Home (`/`)

## Purpose

Public entry point. Welcomes visitors and points them to sign in or sign up via the global header.

## Audience

Unauthenticated visitors (and authenticated users who land on `/`).

## Layout

- **Header:** `nmemo / Sign In / Sign Up / Dashboard` (single line breadcrumb)
- **Hero:** Centered column
  - Eyebrow: “Welcome to” (light, uppercase, tracked)
  - Title: **nmemo** (large, black weight)
  - Subtitle: knowledge workspace one-liner

## Actions

| Action | Where |
|--------|--------|
| Sign in | Header link → `/sign-in` |
| Sign up | Header link → `/sign-up` |
| Dashboard | Header link → `/dashboard` (redirects if not logged in) |

No in-page buttons — navigation is header-only.

## Content notes

- Keep hero copy short; product pitch can expand when marketing page grows
- `/` renders the same content as the landing module internally

## Future

- Add product screenshot or embed preview
- CTA to “Book demo” or “Try chat” when `/chat` exists
- Logged-in users might redirect `/` → `/sites` or `/dashboard`
