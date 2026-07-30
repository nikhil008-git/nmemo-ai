# apps/cli

The nmemo command line app: commands plus an Ink TUI. This is the primary way a developer
uses nmemo, so it is the only place that reads user config, resolves the current repository,
and decides what to print.

## Layout

```
src/
├── bin.ts        Executable entry — argv parsing, dispatch, exit codes
├── commands/     start, save, status, resume, agent
├── tui/          React/Ink screens and components
└── config.ts     Config resolution and precedence
```

## Responsibilities

- Parse argv, dispatch to a command, map errors to exit codes.
- Resolve config: flags → env → project file → user file → defaults.
- Render output. Plain text when not a TTY or when `--json` is passed; Ink when interactive.

## Not its job

No memory logic, no git logic, no model calls. Those live in `packages/memory`,
`packages/repository`, and `packages/agent`. A command should read as a short script over
those packages — if a command file grows real logic, that logic belongs in a package.

## Contract

- Every command works headless. The TUI is a view over commands that already function with
  plain stdout, never the only path to a feature.
- `--json` emits machine-readable output on stdout; human logging goes to stderr.
- Exit codes: `0` success, `1` expected failure (dirty tree, no memory found), `2` usage
  error, `130` interrupted.

## Depends on

`@repo/agent`, `@repo/memory`, `@repo/repository`, `@repo/shared`.
