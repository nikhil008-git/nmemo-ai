# Breadcrumb (shadcn)

## Role

Accessible navigation primitive — ordered list of location links with separators.

## Location

`components/ui/breadcrumb.tsx` (shadcn pattern)

## Parts

| Part | Use |
|------|-----|
| `Breadcrumb` | Root `<nav aria-label="breadcrumb">` |
| `BreadcrumbList` | Horizontal list container |
| `BreadcrumbItem` | One segment |
| `BreadcrumbLink` | Clickable segment (supports Next.js `Link` via `asChild`) |
| `BreadcrumbPage` | Current page (non-link, bold) |
| `BreadcrumbSeparator` | Between items — we use literal ` / ` |
| `BreadcrumbEllipsis` | Collapsed trail (not used in header yet) |

## Usage in app

Primary use: **site header** inline nav, not traditional hierarchical trail like `Home / Sites / Acme / Settings`.

Future: deeper dashboard pages may use hierarchical breadcrumbs:
`Sites / acme.com / Analytics`

## Design

- Small text (`text-sm`)
- Muted links; current page `text-foreground` + medium weight
- Wraps on very narrow screens
