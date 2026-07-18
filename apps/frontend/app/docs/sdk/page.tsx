import Link from "next/link";

import {
  DocCode,
  DocH2,
  DocP,
  DocsShell,
  DocTable,
} from "@/components/docs/docs-shell";

export default function DocsSdkPage() {
  return (
    <DocsShell title="SDK — @contextengine/sdk">
      <DocP>
        Primary developer surface. Calls{" "}
        <code className="text-foreground">POST /context</code> with an API key
        from{" "}
        <Link href="/keys" className="underline underline-offset-4">
          API
        </Link>
        .
      </DocP>

      <DocH2>Install</DocH2>
      <DocP>
        Workspace package in this monorepo (not published to npm yet):
      </DocP>
      <DocCode>{`import { createEngine } from "@contextengine/sdk"`}</DocCode>

      <DocH2>Quick start</DocH2>
      <DocCode>{`import { createEngine } from "@contextengine/sdk"

const engine = createEngine({
  apiKey: process.env.CONTEXT_ENGINE_API_KEY!,
  baseUrl: "http://localhost:8080",
})

const context = await engine.getContext({
  query: "What is our refund policy?",
  userId: "user_123",
  workspaceId: "ws_123",
})

// Feed into any LLM
console.log(context.prompt)
console.log(context.citations)
console.log(context.diagnostics)`}</DocCode>

      <DocH2>createEngine options</DocH2>
      <DocTable
        rows={[
          { label: "apiKey", value: "Required. Bearer key from API (/keys)." },
          {
            label: "baseUrl",
            value: "Optional. Defaults to http://localhost:8080",
          },
        ]}
      />

      <DocH2>Return shape</DocH2>
      <DocCode>{`{
  prompt, memories, documents, sources,
  citations, tokenUsage, diagnostics
}`}</DocCode>
      <DocP>
        <code className="text-foreground">diagnostics</code> always includes
        latency by source, ranking scores, discarded context, and conflicts.
      </DocP>

      <DocH2>Fast path</DocH2>
      <DocCode>{`await engine.getContextFast({ query, userId, workspaceId })`}</DocCode>
      <DocP>
        Same return shape. Today runs the same multi-source path; later scoped
        to memory + cache for sub-300ms voice turns.
      </DocP>

      <DocH2>Related</DocH2>
      <DocP>
        <Link href="/docs/playground" className="underline underline-offset-4">
          Playground
        </Link>{" "}
        ·{" "}
        <Link href="/docs/connectors" className="underline underline-offset-4">
          Connectors
        </Link>{" "}
        ·{" "}
        <Link href="/docs/api" className="underline underline-offset-4">
          HTTP API
        </Link>
      </DocP>
    </DocsShell>
  );
}
