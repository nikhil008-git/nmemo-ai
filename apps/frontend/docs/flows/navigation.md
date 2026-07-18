# Navigation & header

## Logged out

Logo / Product / Docs / Pricing / Log in / Get started

## Logged in

Logo / Dashboard / Chat / Sources / Settings

Connectors is reached from the dashboard hub or Settings — not in the top nav (per BUILD_UI).

## Notes

- Header is session-aware (`useSession`)
- Middleware redirects unauthenticated users away from protected routes
- All navigation is header + in-page links. Add a sidebar later if the dashboard grows.
