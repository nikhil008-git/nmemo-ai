import Link from "next/link";

import {
  DocCode,
  DocH2,
  DocP,
  DocsShell,
  DocTable,
} from "@/components/docs/docs-shell";

export default function DocsApiPage() {
  return (
    <DocsShell title="HTTP API">
      <DocP>
        Base URL (local):{" "}
        <code className="text-foreground">http://localhost:8080</code>
      </DocP>

      <DocH2>Auth</DocH2>
      <DocTable
        rows={[
          {
            label: "Session",
            value: "Dashboard cookie (credentials: include)",
          },
          {
            label: "API key",
            value: "Authorization: Bearer ce_live_…",
          },
        ]}
      />

      <DocH2>Context</DocH2>
      <DocCode>{`POST /context
POST /context/fast

{
  "query": "…",
  "userId": "…",
  "workspaceId": "…"
}`}</DocCode>
      <DocP>
        Returns the full getContext contract. Prefer the{" "}
        <Link href="/docs/sdk" className="underline underline-offset-4">
          SDK
        </Link>{" "}
        for clients.
      </DocP>

      <DocH2>Dashboard helpers</DocH2>
      <DocTable
        rows={[
          { label: "POST /ingest", value: "Multipart PDF upload (session)" },
          { label: "POST /ask", value: "getContext + LLM (session)" },
          {
            label: "GET /workspaces/connectors",
            value: "List connectors (tokens redacted)",
          },
          {
            label: "PATCH /workspaces/connectors/:type",
            value: "Toggle Qdrant / save mem0 / disconnect OAuth",
          },
          {
            label: "POST /workspaces/api-keys",
            value: "Create SDK key (secret once)",
          },
        ]}
      />

      <DocH2>OAuth</DocH2>
      <DocTable
        rows={[
          {
            label: "Start",
            value: "GET /oauth/github|slack|notion/start",
          },
          {
            label: "Callback",
            value: "GET /oauth/…/callback → redirects to /connectors",
          },
        ]}
      />
    </DocsShell>
  );
}
