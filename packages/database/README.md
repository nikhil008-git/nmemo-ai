# @repo/database

Prisma client and Postgres schema. The only package that owns database structure.

## Layout

```
prisma/
├── schema.prisma      Models and enums
└── migrations/        Ordered, committed SQL
src/
├── client.ts          Singleton PrismaClient
├── generated/prisma/  Generated client — do not edit
└── index.ts
```

## Models

Auth and tenancy: `User`, `Session`, `Account`, `Verification`, `Workspace`,
`WorkspaceMember`, `WorkspaceInvite`, `ApiKey`.
Product: `Connector`, `UsageEvent`.

## Workflow

```bash
npx prisma migrate dev --name <change>   # from packages/database
npx prisma generate
npx prisma studio
```

## Rules

- Schema changes ship as migrations. Never `db push` against anything shared.
- Migrations are additive first: add column, backfill, then drop in a later migration.
- Import the client from `@repo/database`, never construct a `PrismaClient` elsewhere — one
  connection pool per process.
- Everything product-facing is scoped by `workspaceId`. A query without that scope is a bug
  unless it is deliberately global.
- `src/generated/` is build output. Regenerate it; don't hand-edit it.

## Depends on

Prisma only. This package sits at the bottom of the graph.
