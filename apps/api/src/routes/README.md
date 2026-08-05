# apps/api/src/routes

One file per resource. A route validates input, calls a package, and shapes a response — no
business logic, no Prisma queries inline.

## Routes

| Route | Status | Purpose |
|-------|--------|---------|
| `context.ts`   | live    | Context retrieval via `@repo/core` |
| `workspace.ts` | live    | Workspace CRUD and membership |
| `invite.ts`    | live    | Workspace invites |
| `oauth.ts`     | live    | Provider auth callbacks |
| `projects.ts`  | planned | Projects behind the Project Brain dashboard |

## Rules

- Validate every body, query, and param with a zod schema at the top of the file. Reject
  before touching a package.
- Scope every query by the authenticated `workspaceId` from middleware — never from the
  request body.
- Entitlement checks happen here, server-side. The CLI's copy is messaging only.
- Errors return a typed shape with a stable code; never leak Prisma or provider errors.
- Handlers stay thin. If a handler grows logic worth testing, that logic belongs in a package.
