# BUILD

Build order, workspace map, and the sequence we ship nmemo in. Read this before adding a
package or wiring a dependency.

## Workspace map

```
nmemo-ai/
├── apps/
│   ├── cli/            Commands + Ink TUI          — new
│   ├── api/            Express API                 — exists
│   ├── frontend/       Dashboard → Project Brain   — exists
│   └── mcp-server/     Agent-neutral integration   — later
├── packages/
│   ├── core/           Ranking / context budget    — exists
│   ├── database/       Prisma + Postgres           — exists
│   ├── memory/         Storage, extraction, recall — new
│   ├── repository/     Git root, branch, diff      — new
│   ├── tools/          read, search, patch, cmd    — new
│   ├── agent/          Model + tool loop           — new
│   ├── sync/           Local ↔ cloud sync          — later
│   ├── billing/        Plans and entitlements      — later
│   ├── sdk/            Public client, reshape later— exists
│   └── shared/         Schemas and event types     — exists
└── evals/              Resume, memory, agent evals
```

## Dependency direction

Dependencies point downward only. A package never imports from an app, and never from a
package listed above it.

```
apps/cli ──┬── packages/agent ──┬── packages/tools ── packages/repository
           │                    └── packages/memory ─┬── packages/core
           ├── packages/memory                        └── packages/database
           └── packages/sync
apps/api ───── packages/{core,database,memory,billing}
packages/shared ← everyone (leaf, no internal deps)
```

Rules:

- `packages/shared` has no internal dependencies. Anything imported by two packages that
  would otherwise create a cycle belongs there.
- `packages/repository` never imports `packages/memory`. Repository facts flow into memory,
  not the reverse.
- `packages/agent` owns the model loop and approvals; it must not talk to Prisma directly.
  Persistence goes through `packages/memory`.
- Only apps read environment variables. Packages take config as arguments.

## Build

Turborepo drives everything from the root.

```bash
npm install
npm run build          # turbo run build, respects the graph above
npm run check-types
npm run lint
npm run dev
npm run build:api      # api and its deps only
```

Each package builds with `tsc -b` and publishes types from `dist/`. Copy
`packages/shared/package.json` as the template for a new package: `type: "module"`,
`@repo/typescript-config` as a devDependency, `exports` pointing at `dist/`.

## Ship sequence

1. **Repository truth** — `packages/repository`. Git root, branch, HEAD, changed files.
   Nothing else can be correct until this is.
2. **Memory** — `packages/memory` on top of the existing `core` + `database`. Write path
   first (episodes), then recall.
3. **CLI shell** — `apps/cli` with `start`, `save`, `status`, `resume`. Plain output before
   any Ink screens.
4. **Tools** — `packages/tools`. read, search, patch, command, diff, each with its own
   permission surface.
5. **Agent** — `packages/agent`. Model/tool loop and approvals, driving step 4.
6. **TUI** — `apps/cli/src/tui`. Ink screens over commands that already work headless.
7. **Project Brain** — reshape `apps/frontend` onto the memory API.
8. **Later** — `packages/sync`, `packages/billing`, `apps/mcp-server`.

Each step lands with evals in `evals/` before the next one starts.

## Conventions

- Package names use the `@repo/*` scope and stay `private: true` unless published.
- New cross-package types go in `packages/shared`, exported from a named subpath.
- Prisma is the only writer of schema; migrations live in `packages/database/prisma`.
- Every directory in the tree above carries a `README.md` stating its one responsibility.
