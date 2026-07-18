# Authentication flow

## Stack

better-auth — Next.js route at `/api/auth/*`, API session middleware on `apps/api`.

## Actors

- **Workspace owner / developer** — signs in to dashboard
- **SDK clients** — use API keys (not browser session)

## Flow

1. User lands on `/sign-in` or `/sign-up`
2. better-auth creates session cookie
3. Protected routes under `(app)/*` require session
4. API protected routes use `requireSession` (or API key for SDK)

## Out of scope (old product)

No anonymous visitor widget or public site key — Context Engine is developer infrastructure.
