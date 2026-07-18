# Tool call indicator — planned

## Role

Surface **actions and diagnostics** when the agent uses external tools or when `getContext()` diagnostics reveal notable events (conflicts, source timeouts, discarded context).

## Location

`components/tool-call-indicator.tsx` (stub today)

## When shown

- External tool invocations triggered by the calling agent (post-context assembly)
- Notable `diagnostics` events: source timeout, conflict detected, context discarded

## Examples

| Event | Card content |
|-------|----------------|
| Source timeout | "Slack retriever timed out — omitted from context" |
| Conflict | "Conflict detected: memory vs CRM — resolved (most-recent wins)" |
| MCP tool | "Called external tool — result summary" |

## Layout (planned)

- Compact card with icon, event type, status (success / warning / error)
- Expandable detail for diagnostics (ranking scores, token allocation)
- Error state: red border + retry suggestion

## Why it matters

Developers see **what the engine decided** — not just the final answer. Transparency is part of the API contract.

## Related

- `packages/observability` — diagnostics object
- [flows/visitor-chat.md](../flows/visitor-chat.md)
