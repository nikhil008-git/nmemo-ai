# MCP Tools Reference

The Internal Knowledge Agent exposes operational tools via a **standalone MCP server** at `apps/mcp-server`. Mock backends are intentional — the goal is protocol compliance, schema design, and agent tool-selection, not a real ticketing integration.

---

## Server overview

| Property | Value |
|----------|-------|
| Protocol | MCP (Model Context Protocol) |
| Location | `apps/mcp-server` |
| Auth | `MCP_API_KEY` header (even in dev) |
| Backends | Mocked — in-memory or Postgres stubs |

The server must be usable from Claude Desktop or any MCP client, not only the project's web UI.

---

## Tool: `create_ticket`

Creates a support ticket from a user request.

### Input schema

```json
{
  "type": "object",
  "properties": {
    "subject": {
      "type": "string",
      "description": "Short summary of the issue"
    },
    "description": {
      "type": "string",
      "description": "Full details of the issue"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high", "urgent"],
      "description": "Ticket priority"
    }
  },
  "required": ["subject", "description"]
}
```

### Output schema

```json
{
  "type": "object",
  "properties": {
    "ticket_id": { "type": "string" },
    "status": { "type": "string", "enum": ["open"] },
    "created_at": { "type": "string", "format": "date-time" },
    "message": { "type": "string" }
  }
}
```

### Example

**Call:**
```json
{
  "subject": "Order #1234 not delivered",
  "description": "Customer ordered 5 days ago, tracking shows no movement.",
  "priority": "high"
}
```

**Response:**
```json
{
  "ticket_id": "4821",
  "status": "open",
  "created_at": "2026-06-28T14:30:00Z",
  "message": "Ticket #4821 created successfully."
}
```

### When the agent should call this

- User asks to "open a ticket", "file a complaint", "report an issue"
- User describes a problem that needs human follow-up after retrieval

---

## Tool: `lookup_order_status`

Returns the status of an order by ID.

### Input schema

```json
{
  "type": "object",
  "properties": {
    "order_id": {
      "type": "string",
      "description": "The order identifier (e.g. ORD-1234)"
    }
  },
  "required": ["order_id"]
}
```

### Output schema

```json
{
  "type": "object",
  "properties": {
    "order_id": { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["processing", "shipped", "delivered", "cancelled", "not_found"]
    },
    "last_updated": { "type": "string", "format": "date-time" },
    "details": { "type": "string" }
  }
}
```

### Example

**Call:**
```json
{ "order_id": "ORD-1234" }
```

**Response:**
```json
{
  "order_id": "ORD-1234",
  "status": "shipped",
  "last_updated": "2026-06-27T09:15:00Z",
  "details": "Package in transit via FedEx. Expected delivery June 30."
}
```

### Mock data strategy

Seed a small lookup table in Postgres or an in-memory map:

| order_id | status |
|----------|--------|
| ORD-1234 | shipped |
| ORD-5678 | delivered |
| ORD-9999 | not_found |

### When the agent should call this

- User mentions a specific order ID and asks about status
- "Where is my order?", "Has order #X shipped?"

---

## Tool: `escalate_to_human`

Hands the conversation to a human support agent.

### Input schema

```json
{
  "type": "object",
  "properties": {
    "reason": {
      "type": "string",
      "description": "Why escalation is needed"
    },
    "context_summary": {
      "type": "string",
      "description": "Optional summary of the conversation so far"
    }
  },
  "required": ["reason"]
}
```

### Output schema

```json
{
  "type": "object",
  "properties": {
    "escalation_id": { "type": "string" },
    "status": { "type": "string", "enum": ["queued"] },
    "estimated_wait_minutes": { "type": "number" },
    "message": { "type": "string" }
  }
}
```

### Example

**Call:**
```json
{
  "reason": "Customer requesting refund for order over 90 days — outside policy, needs manager approval.",
  "context_summary": "User asked about refund policy (retrieved: 30-day limit). Order ORD-1234 is 95 days old."
}
```

**Response:**
```json
{
  "escalation_id": "ESC-771",
  "status": "queued",
  "estimated_wait_minutes": 12,
  "message": "You've been added to the support queue. A human agent will join shortly."
}
```

### When the agent should call this

- User explicitly asks for a human / manager
- Retrieved policy says the case requires manual review
- Agent confidence is low after retrieval

---

## UI display convention

Each tool call renders in chat as:

```
🔧 Called create_ticket
   → Ticket #4821 created (high priority)
```

Implementation: `apps/web/components/tool-call-indicator.tsx` (target). Current repo: `apps/frontend` until chat UI is built.

---

## Auth and boundaries

Even with mock backends:

- MCP server validates `MCP_API_KEY` on every request
- Agent never writes directly to ticket DB — only via MCP tools
- Tool inputs are validated against JSON schema before execution
- All tool calls are traced in Langfuse with args + results

---

## Adding a new tool (checklist)

1. Create `apps/mcp-server/src/tools/{name}.ts` with Zod input/output schemas
2. Register in `apps/mcp-server/src/index.ts`
3. Document in this file (schema, example, when-to-call)
4. Add 2–3 eval cases in `packages/eval/testcases/`
5. Update router/agent to expose the tool to Mastra
