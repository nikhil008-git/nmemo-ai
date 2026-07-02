# Site header

## Role

Global navigation shell on every page. Combines branding, breadcrumb trail, and primary nav in **one horizontal line**.

## Structure

```
nmemo / [🏠] / Sign In / Sign Up / Dashboard
```

- **nmemo** — wordmark; links to `/` except on home (shown as current)
- **Home icon** — shown on non-home routes; links to `/`
- **Nav items** — Sign In, Sign Up, Dashboard; active route is bold black, others are muted links

## Behavior

- Fixed to top of viewport (`z-50`)
- Max width centered with horizontal padding
- Uses shadcn `Breadcrumb` components internally

## When to change

- Add new top-level routes → extend `navItems` in implementation (document new link here)
- Logged-in state: future version may hide Sign In/Up and show avatar menu

## Related

- [breadcrumb.md](./breadcrumb.md)
- [flows/navigation.md](../flows/navigation.md)
