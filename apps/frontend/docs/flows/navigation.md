# Navigation flow

## Global header

Present on all pages via root layout. Single-line breadcrumb nav:

```
nmemo / [home icon on inner pages] / Sign In / Sign Up / Dashboard
```

## Active state

- Current route rendered as `BreadcrumbPage` (bold, not a link)
- Other items are muted links with hover darken

## User journeys

### Anonymous visitor

```
/ → sign-in or sign-up via header → /dashboard
```

### Returning user

```
Any page → Dashboard (header) if session valid
/dashboard → Sign out → session cleared → /sign-in if tries dashboard again
```

### Future owner journey

```
/dashboard or /sites → site detail → conversations | analytics | embed
```

## No sidebar yet

All navigation is header + in-page links. Add sidebar when `/sites/*` section ships.

## Related

- [site-header.md](../components/site-header.md)
