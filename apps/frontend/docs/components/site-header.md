# Site header

## Role

Global navigation shell on every page. Session-aware: marketing links when logged out, app links when logged in.

## Structure

**Logged out**

```
nmemo ai | Product Docs Pricing | Log in · Get started
```

**Logged in**

```
nmemo ai | Dashboard Chat Sources Settings
```

## Behavior

- Fixed to top of viewport (`z-50`), bottom border, backdrop blur
- Max width centered (`max-w-5xl`) with horizontal padding
- Active app route highlighted via `usePathname`
- Logo links to `/` when logged out, `/dashboard` when logged in

## When to change

- Add new top-level app routes → extend `appNav` in `components/site-header.tsx`

## Related

- [flows/navigation.md](../flows/navigation.md)
