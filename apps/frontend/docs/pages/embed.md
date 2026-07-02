# Embed (`/sites/[id]/embed`) — planned

## Purpose

Give owners the script snippet to put nmemo on their live website.

## Audience

Site owner (may paste into Shopify, Webflow, custom HTML).

## Layout (planned)

- **Install steps:** numbered list (copy script → paste before `</body>` → verify)
- **Snippet box:** read-only code with copy button
  - `data-site-id`
  - `data-key` (public widget key)
- **Preview:** iframe or live demo of bubble on sample page
- **Customize:** bubble position, primary color, greeting message (future)

## Verification

- “Test connection” — pings API with site key
- Status: widget seen on domain (optional DNS or pingback)

## Security note (copy for docs)

- Public key only in snippet
- Never expose LLM or Qdrant credentials in browser

## Related

- [components/widget.md](../components/widget.md)
- [flows/visitor-chat.md](../flows/visitor-chat.md)
