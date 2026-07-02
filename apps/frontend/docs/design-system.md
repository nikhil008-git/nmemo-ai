# Design system

High-level visual rules for all frontend pages. Implementation tokens live in `design.md` at the app root.

## Theme

- **Mode:** Light only (for now)
- **Background:** White (`#ffffff`)
- **Text:** Black (`#000000`)
- **Muted text:** Neutral grays for subtitles, placeholders, breadcrumb links
- **Borders:** Light gray (`#e5e5e5`)

## Typography — Montserrat

| Weight | Use |
|--------|-----|
| Black (900) | Hero titles |
| Bold (700) | Page headings, logo |
| Semibold (600) | Primary buttons |
| Medium (500) | Nav links, current breadcrumb |
| Light (300) | Subtitles, helper copy |
| Normal (400) | Body, inputs |

## Layout

- **Max width:** `max-w-5xl` centered for header and most page content
- **Header:** Fixed top, full width, border bottom
- **Page body:** Flex grow below header; auth forms centered vertically on tall screens

## Buttons

- **Primary:** Black fill, white label, semibold, rounded-md
- **Secondary / outline:** Black border, black text, hover light gray background

## Forms

- White inputs, neutral border, light placeholder
- Error text in red (`text-red-600`)
- Full-width submit buttons on auth pages

## Components library

- shadcn/ui pattern under `components/ui/`
- App-specific layout in `components/` (e.g. `site-header.tsx`)

## Accessibility

- Breadcrumb uses proper `nav` + `aria-label`
- Home icon in breadcrumb includes screen-reader label
- Sufficient contrast on light theme (black on white)
