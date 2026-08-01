---
name: create-nmemo-icons
description: Design, recreate, and integrate nmemo's minimal monochrome role icons and logo tiles as clean SVG or React/Next.js components. Use when a user provides an icon reference like stacked bars or a document outline; asks for a new product, role, feature, navigation, or capability mark in the same visual language; wants icon variants with different weight or structure; or needs these marks placed inside nmemo's dark rounded-square tiles.
---

# Create nmemo Icons

Create small, quiet, geometric marks that look native to nmemo. Use the bundled SVGs as canonical examples and geometry references; extend the system when the requested concept needs a new symbol.

## Workflow

1. Inspect the target UI and any supplied visual references.
2. Identify the concept and choose the closest family: filled bars, tapered hierarchy, or outline symbol.
3. Reuse a bundled asset when it communicates the concept. Create a new SVG only when the meaning differs.
4. Build the mark as vector primitives on a `24 × 24` view box and optically center it.
5. Inline SVG in React when color must inherit from `currentColor`; preserve existing project conventions for props and class names.
6. Preview at final size, in both themes and all interaction states, before considering the work complete.

## Visual language

- Keep marks monochrome, minimal, flat, and background-free.
- Prefer two to four shapes. Remove detail that disappears around `18–24 px`.
- Use rounded ends and corners; avoid sharp mechanical geometry.
- Use `currentColor` for fills and strokes.
- Use opacity or weight sparingly to establish hierarchy.
- Keep filled-symbol bars between `2–4 px` high.
- Keep outline symbols around `1.75–2 px` stroke width with rounded caps and joins.
- Do not add gradients, shadows, text, letters, decorative circles, or brand colors unless explicitly requested.
- Do not substitute a third-party icon merely because it is similar. Draw the small canonical SVG directly.

## Canonical variants

| Variant | Asset | Construction | Use |
| --- | --- | --- | --- |
| Tapered bars | `assets/tapered-bars.svg` | Three rounded bars descending in width | Hierarchy, process, prioritization |
| Thin bars | `assets/thin-bars.svg` | Three equal, low-weight rounded bars | List, structure, calm/secondary role |
| Bold bars | `assets/bold-bars.svg` | Three equal, heavy rounded bars | Primary role, layers, strong emphasis |
| Document outline | `assets/document-outline.svg` | Rounded file outline, folded corner, two text lines | Notes, documents, writing, knowledge |

Preserve the bundled geometry when using an existing variant. Scaling the complete view box is allowed; independently stretching individual primitives is not.

## Create a new symbol

Translate the requested concept into its smallest recognizable silhouette. Match one of the existing families:

- For abstract system concepts, use filled rounded rectangles with consistent gaps.
- For concrete objects, use a single outline with at most two internal detail lines.
- Align geometry to half- or whole-pixel coordinates where practical for crisp rendering.
- Balance visual mass against the canonical variants rather than filling the canvas equally.
- Save a reusable SVG under `assets/` only when the new mark is intended to become part of the system.

Use this design prompt if a vector-capable tool is required:

> Create a minimal monochrome interface icon for [CONCEPT] in the nmemo visual language. Use a 24 × 24 view box, two to four simple geometric primitives, rounded corners or line caps, and currentColor. Match the quiet visual weight of small stacked-bar and document-outline icons. Keep the background transparent. Do not use text, gradients, shadows, colors, or decorative detail. Return editable SVG.

Treat tool output as a draft. Simplify it and correct the geometry in SVG before integrating it.

## Build the tile

The rounded-square tile is a container, not part of the icon asset. Reuse the target page's design tokens and match the references:

- Center one `18–24 px` mark inside a roughly `64–72 px` square.
- Use a generous corner radius around `18–22 px`.
- Keep the background near-black in dark UI.
- Use a subtle neutral border and muted neutral icon color.
- Increase icon contrast on hover or selection without changing its geometry.

Do not bake the tile background or border into the SVG unless the user explicitly requests a single self-contained logo file.

## React integration

Expose `className` and pass it to the root `<svg>`. Set `fill="none"` for outline icons and where individual filled primitives declare their own fill. Use `aria-hidden="true"` when adjacent text already names the destination. When the icon is the only visible content of a control, give the containing control an explicit accessible name.

## Validate

- Compare the rendered result with the requested reference at the actual display size.
- Confirm spacing, stroke weight, corner radius, opacity, and optical centering.
- Confirm `currentColor` works in light, dark, hover, focus, disabled, and selected states that exist in the target UI.
- Confirm the icon remains legible at `18 px` and does not look heavier than sibling icons.
- Validate new SVG files as XML and run the narrowest relevant formatter, type check, or test for changed application files.
