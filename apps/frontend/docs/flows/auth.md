# Authentication flow

## Stack

- **better-auth** on Next.js (`app/api/auth/[...all]/route.ts`)
- **Prisma** via `@repo/db` for users and sessions
- Client hooks in `lib/auth-client.ts`

## Routes

| Route | Purpose |
|-------|---------|
| `/sign-up` | Create account |
| `/sign-in` | Login |
| `/dashboard` | Protected; redirects if no session |

## Session lifecycle

1. User submits sign-in or sign-up form
2. Client calls better-auth (`signIn.email` / `signUp.email`)
3. Session cookie set
4. Protected pages use `useSession()` — redirect to `/sign-in` if missing
5. Sign out clears session

## API auth (separate)

- `apps/api` has its own session middleware for `/protected`
- Future: dashboard chat calls API with same session or API key

## Future

- Team invites / roles per site
- OAuth (Google)
- Widget uses **public site key**, not user session — visitors are anonymous `visitorId`

## Related pages

- [sign-in.md](../pages/sign-in.md)
- [sign-up.md](../pages/sign-up.md)
- [dashboard.md](../pages/dashboard.md)
