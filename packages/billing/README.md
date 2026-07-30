# @repo/billing

Plans and entitlements. **Later — see step 8 of `../../BUILD.md`.** Not built yet; this
README records the boundary so limits don't get scattered across the codebase.

## Purpose

One place that answers "is this workspace allowed to do this, and how much has it used."

## Planned shape

```
src/
├── plans.ts          Plan definitions and limits
├── entitlements.ts   can(workspaceId, capability) → allowed | reason
├── usage.ts          Metering on top of the UsageEvent model
└── provider.ts       Payment provider adapter
```

## Design commitments

- **Entitlements are a query, not a scatter of `if` statements.** Features ask
  `can(workspace, capability)`; they never inspect a plan name.
- **Metering is separate from enforcement.** `usage.ts` records; `entitlements.ts` decides.
  Recording never blocks the operation being measured.
- **Fail toward the user.** If the billing provider is unreachable, existing entitlements
  stay in force. A payments outage does not lock people out of their own memory.
- **Provider stays behind an adapter.** No provider SDK types leak past `provider.ts`.
- **Never enforced in the CLI.** Limits are decided server-side in `apps/api`; a client-side
  check is a hint for messaging, not a gate.

## Depends on

`@repo/database` (for `UsageEvent`), `@repo/shared`.
