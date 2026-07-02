# Sign in (`/sign-in`)

## Purpose

Existing users authenticate with email and password.

## Audience

Returning site owners (and later, team members).

## Layout

- **Header:** `nmemo / 🏠 / Sign In / Sign Up / Dashboard` — **Sign In** is current (bold)
- **Form block:** Centered, max-width narrow column
  - Eyebrow: “Account”
  - Heading: Sign In
  - Helper: welcome-back line
  - Fields: email, password
  - Submit: Sign In (primary black button)
  - Error: red inline message on failure

## Success path

- Valid credentials → redirect to `/dashboard`
- Session stored via better-auth

## Failure path

- Show API error message (e.g. wrong password)
- Stay on page; do not clear email field

## Related

- No account? User goes to `/sign-up` via header
- Forgot password: not built yet — add link when flow exists

## Future

- OAuth providers
- “Remember this device”
- Redirect to `?returnUrl=` after login for deep links
