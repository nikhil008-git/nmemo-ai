# @repo/sync

Local ↔ cloud synchronization. **Later — see step 8 of `../../BUILD.md`.** Nothing here is
built yet; this README fixes the design so the local-first work upstream doesn't have to be
redone.

## Purpose

Memory is written locally first. Sync makes it available on other machines and to the
dashboard, without ever making the local path depend on the network.

## Planned shape

```
src/
├── push.ts        Send local episodes and facts to the API
├── pull.ts        Fetch remote changes for this workspace
├── resolve.ts     Conflict resolution
└── queue.ts       Durable outbox, retries, backoff
```

## Design commitments

- **Local-first, always.** Every command works fully offline. Sync is a background concern;
  a sync failure never fails a `save`.
- **Durable outbox.** Local writes enqueue; the queue drains when the network allows. Nothing
  is lost by quitting mid-sync.
- **Idempotent.** Every synced item carries a stable client-generated id, so a retry after a
  partial success is a no-op.
- **Append-mostly merges.** Memory is append-mostly, so most conflicts don't exist. Where two
  machines correct the same fact, both corrections are kept and the newer one supersedes —
  nothing is silently dropped.
- **Explicit scope.** Sync moves memory for a workspace and project. It never touches source
  code, never reads files outside the memory store, and never syncs anything the user hasn't
  saved.

## Depends on

`@repo/memory`, `@repo/shared`.
