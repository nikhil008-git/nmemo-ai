# nmemo Frontend Design

Design system notes for the public shell: site header, breadcrumb navigation, typography, and shadcn/ui integration.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | [shadcn/ui](https://ui.shadcn.com) pattern (`components/ui`) |
| Font | [Montserrat](https://fonts.google.com/specimen/Montserrat) (100–900, normal + italic) |
| Icons | [lucide-react](https://lucide.dev) (UI), [@radix-ui/react-icons](https://www.radix-ui.com/icons) (breadcrumb primitives) |

## shadcn setup

The frontend follows the standard shadcn project layout:

```
apps/frontend/
├── components/
│   ├── ui/           # shadcn primitives (breadcrumb, future buttons, etc.)
│   └── site-header.tsx
├── lib/
│   └── utils.ts      # cn() helper (clsx + tailwind-merge)
├── components.json   # shadcn CLI config
└── app/globals.css   # design tokens
```

**Why `components/ui`?** shadcn CLI installs components into this folder by convention. Keeping primitives here makes `npx shadcn@latest add <component>` work without path changes and separates reusable UI from app-specific layout (`site-header.tsx`).

To add more shadcn components later:

```bash
cd apps/frontend
npx shadcn@latest init   # only if components.json is missing
npx shadcn@latest add button
```

## Color & typography

Light theme only (for now):

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#000000` | Primary text |
| `--muted-foreground` | `#737373` | Breadcrumb trail, secondary copy |
| `--border` | `#e5e5e5` | Header divider |

Typography weights in use:

- **Black (900)** — hero title
- **Bold (700)** — headings, logo
- **Semibold (600)** — primary buttons
- **Medium (500)** — nav links, current breadcrumb
- **Light (300)** — subtitles, placeholders

## Site header pattern

The header is a **single inline row** rendered in `app/layout.tsx` via `SiteHeader`. Logo, home icon, and nav links all sit on one line with `/` separators — same rhythm as the shadcn breadcrumb demo.

```
nmemo / 🏠 / Sign In / Sign Up / Dashboard
```

- **nmemo** — wordmark; links to `/` unless you are on home (then shown as current page)
- **🏠** — home icon; current on `/`, otherwise links to `/`
- **Sign In · Sign Up · Dashboard** — inline nav; active route uses `BreadcrumbPage` (bold black), others are muted links

Example on `/sign-in`:

```
nmemo / 🏠 / Sign In / Sign Up / Dashboard
              ^^^^^^^^ (current)
```

All items live inside one `BreadcrumbList` so spacing, separators, and hover states stay consistent.

## Breadcrumb component API

Imported from `@/components/ui/breadcrumb`:

| Export | Role |
| --- | --- |
| `Breadcrumb` | Root `<nav aria-label="breadcrumb">` |
| `BreadcrumbList` | Ordered list container |
| `BreadcrumbItem` | Single crumb |
| `BreadcrumbLink` | Link; supports `asChild` for Next.js `Link` |
| `BreadcrumbPage` | Current page (non-link) |
| `BreadcrumbSeparator` | Between items; default chevron or custom children |
| `BreadcrumbEllipsis` | Collapsed trail indicator |

### Example (demo pattern)

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link href="/">
          <Home size={16} strokeWidth={2} aria-hidden="true" />
          <span className="sr-only">Home</span>
        </Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator> / </BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbPage>Sign In</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Responsive behavior

- Header content is constrained to `max-w-5xl` and centered.
- Breadcrumb list wraps on narrow viewports (`flex-wrap`).
- Auth links stay on one line; stack is not required until mobile widths below ~320px.

## Dependencies

```json
"@radix-ui/react-slot",
"@radix-ui/react-icons",
"lucide-react",
"clsx",
"tailwind-merge"
```

## Future work

- Hide Sign In / Sign Up when session exists; show avatar + Sign Out on dashboard routes.
- Nested breadcrumbs for deeper app sections (e.g. `/dashboard/settings`).
- Dark mode tokens if product requires it.
- Pull primary button into shadcn `Button` for consistency.
