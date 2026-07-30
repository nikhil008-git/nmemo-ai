# apps/cli/src/tui

React/Ink screens and components for the interactive CLI. A rendering layer only — every
screen is driven by a command handler from `../commands`.

## Layout

```
tui/
├── screens/      One screen per interactive flow (session, resume, agent review)
├── components/   Reusable pieces (status line, diff view, approval prompt, spinner)
└── hooks/        State and subscriptions (session state, keypress, progress streams)
```

## Rules

- Screens hold no business logic. They call command handlers and render the result.
- Components take plain props. No package imports beyond `@repo/shared` types.
- Every interactive flow degrades to plain stdout when stdin is not a TTY.
- Keep frames cheap: Ink re-renders the whole tree, so memoize lists and avoid work in render.
- Handle `Ctrl-C` at the top level once, exiting `130` after cleanup.

## Approvals

Tool approvals are rendered here but decided in `@repo/agent`. The TUI shows the request,
collects the answer, and hands it back — it never approves on the agent's behalf, and it
never widens a request's scope.
