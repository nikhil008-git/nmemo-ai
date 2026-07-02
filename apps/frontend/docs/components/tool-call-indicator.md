# Tool call indicator — planned

## Role

Make **actions visible** when the agent calls MCP tools (not silent backend magic).

## Location

`components/tool-call-indicator.tsx` (stub today)

## When shown

After assistant message when router chose **tool** or **both** path.

## Examples

| Tool | Card content |
|------|----------------|
| `create_lead` | “Lead created — #42” |
| `create_ticket` | “Ticket #8821 opened” |
| `lookup_order` | Order status summary |
| `book_demo` | Confirmed time / calendar link |

## Layout (planned)

- Compact card with icon, tool name, status (pending / success / error)
- Expandable JSON for power users (optional)
- Error state: red border + retry suggestion

## Why it matters

Differentiates nmemo from generic chatbots — user sees **something happened**, not just prose.

## Related

- `apps/mcp-server` tool implementations
- [flows/visitor-chat.md](../flows/visitor-chat.md)
