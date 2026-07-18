import Link from "next/link";

import {
  DocCode,
  DocH2,
  DocP,
  DocsShell,
  DocTable,
} from "@/components/docs/docs-shell";

export default function DocsConnectorsPage() {
  return (
    <DocsShell title="Connectors">
      <DocP>
        Connect your tools so{" "}
        <code className="text-foreground">getContext()</code> can pull the right
        context. Open{" "}
        <Link href="/connectors" className="underline underline-offset-4">
          Connectors
        </Link>{" "}
        in the dashboard — no cloning, no env files, no secrets to paste for
        OAuth apps.
      </DocP>

      <DocH2>For you (workspace owner)</DocH2>
      <DocTable
        rows={[
          {
            label: "Qdrant / docs",
            value: (
              <>
                Keep Documents connected, then upload PDFs under{" "}
                <Link href="/sources" className="underline underline-offset-4">
                  Sources
                </Link>
                .
              </>
            ),
          },
          {
            label: "GitHub / Slack / Notion",
            value:
              "Click Connect → sign in with the provider → approve access → you’re redirected back. Done.",
          },
          {
            label: "mem0",
            value:
              "Paste your mem0 API key once on the Connectors page (mem0 issues that key; we store it encrypted for your workspace).",
          },
        ]}
      />
      <DocP>
        After connect, Chat and the SDK automatically use those sources. Disconnect
        anytime from the same page.
      </DocP>

      <DocH2>What happens under the hood</DocH2>
      <DocP>
        Context Engine runs a single OAuth app per provider (GitHub, Slack,
        Notion). When you click Connect, you authorize <em>our</em> app to access{" "}
        <em>your</em> workspace. Tokens are saved to your workspace only — other
        customers never see them.
      </DocP>
      <DocCode>{`You click Connect
  → Provider login / approve
  → Back to /connectors (connected)
  → getContext() can query that source`}</DocCode>

      <DocH2>SDK</DocH2>
      <DocP>
        No connector setup in code. Create an API key under{" "}
        <Link href="/keys" className="underline underline-offset-4">
          API
        </Link>
        , connect sources in the UI, then call{" "}
        <Link href="/docs/sdk" className="underline underline-offset-4">
          getContext()
        </Link>
        .
      </DocP>
      <DocCode>{`const context = await engine.getContext({
  query: "What did we decide in Slack about pricing?",
  userId: "user_123",
  workspaceId: "ws_123",
})
// Uses whatever you connected in the dashboard`}</DocCode>

      <DocH2>Self-hosting / operators only</DocH2>
      <DocP>
        If you deploy Context Engine yourself, <em>you</em> (the operator) register
        OAuth apps once and set client IDs/secrets on the server. End users of your
        deployment still only click Connect — they never touch env vars. See the
        repo <code className="text-foreground">.env.example</code> for operator
        keys.
      </DocP>
    </DocsShell>
  );
}
