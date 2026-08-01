# `nmemo-sdk`

Official client for **nmemo** (Context Engine). Call `getContext()` from any agent or app — route, rank, and budget multi-source context in one request.

[View `nmemo-sdk` on npm](https://www.npmjs.com/package/nmemo-sdk)

## Install

```bash
npm install nmemo-sdk
```

## Quick start

1. Create an API key in the [nmemo dashboard](https://nmemo.cloud) → **Keys**
2. Connect sources (docs, Slack, Notion, GitHub, memory)
3. Call the SDK:

```ts
import { createEngine } from "nmemo-sdk";

const engine = createEngine({
  apiKey: process.env.NMEMO_API_KEY!,
  // optional — defaults to https://api.nmemo.cloud
  // baseUrl: "http://localhost:8080",
});

const context = await engine.getContext({
  query: "What is our refund policy?",
  userId: "user_123",
  workspaceId: "ws_123",
});

// Feed into any LLM
const messages = [
  { role: "system", content: context.prompt },
  { role: "user", content: "What is our refund policy?" },
];

console.log(context.citations);
console.log(context.diagnostics);
```

### GitHub context and receipts

After the workspace owner connects GitHub in nmemo, the same `getContext()`
call can retrieve repository evidence. Mention a repository as `owner/repo`, a
GitHub URL, or an explicit short name such as `for cal.diy`.

```ts
const context = await engine.getContext({
  query: "What did @contributor contribute to acme/cal.diy this month?",
  userId: "user_123",
  workspaceId: "ws_123",
});

// Commits, PRs, issues, README/docs/code matches, releases, refs, and
// discussion records are returned as context items when the question asks for them.
console.log(context.citations); // GitHub commit / PR / issue / repository URLs
```

Use `getContext()` for GitHub activity. `getContextFast()` deliberately skips
live connectors, so it cannot retrieve fresh GitHub data.

### Fast path

```ts
const context = await engine.getContextFast({
  query: "Continue…",
  userId: "user_123",
  workspaceId: "ws_123",
});
```

### Memory write-back

```ts
await engine.writeMemory({
  userId,
  workspaceId,
  messages: [
    { role: "user", content: query },
    { role: "assistant", content: answer },
  ],
});
```

## API

### `createEngine(options)`

| Option    | Type     | Default                   | Description                   |
| --------- | -------- | ------------------------- | ----------------------------- |
| `apiKey`  | `string` | required                  | Bearer key from the dashboard |
| `baseUrl` | `string` | `https://api.nmemo.cloud` | API origin                    |

### Return shape

```ts
type GetContextResult = {
  prompt: string;
  memories: { id: string; text: string; score: number }[];
  documents: {
    id: string;
    text: string;
    source: string;
    title?: string;
    score: number;
  }[];
  sources: {
    id: string;
    name: string;
    queried: boolean;
    responded: boolean;
    latencyMs: number;
  }[];
  citations: {
    id: string;
    source: string;
    title: string;
    url?: string;
    snippet: string;
  }[];
  tokenUsage: {
    total: number;
    memory: number;
    documents: number;
    workspace: number;
    instructions: number;
  };
  diagnostics: {
    rankingScores: { id: string; score: number; reason: string }[];
    discarded: { id: string; reason: string }[];
    conflicts: { id: string; summary: string; resolution: string }[];
    latencyBySource: Record<string, number>;
  };
};
```

## License

MIT
