import Link from "next/link";

import { DocH2, DocP, DocsShell } from "@/components/docs/docs-shell";

export default function DocsHomePage() {
  return (
    <DocsShell title="Context Engine docs">
      <DocP>
        One call —{" "}
        <code className="text-foreground">engine.getContext()</code> — replaces
        custom glue across memory, documents, Slack, Notion, GitHub, and more.
        Prove it in the Playground, then ship with the SDK.
      </DocP>

      <DocH2>Product map</DocH2>
      <ul className="space-y-0 border border-border divide-y divide-border">
        {[
          {
            href: "/docs/playground",
            title: "Playground",
            body: "Ask + context inspector — the differentiator",
          },
          {
            href: "/docs/connectors",
            title: "Connectors",
            body: "Connect Slack, GitHub, Notion, mem0, docs",
          },
          {
            href: "/docs/sdk",
            title: "SDK",
            body: "createEngine → getContext in your agent",
          },
          {
            href: "/docs/api",
            title: "HTTP API",
            body: "/context, /ingest, /ask, workspace routes",
          },
        ].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block px-4 py-3 transition-colors hover:bg-foreground/5"
            >
              <p className="font-semibold">{item.title}</p>
              <p className="font-light text-muted-foreground">{item.body}</p>
            </Link>
          </li>
        ))}
      </ul>

      <DocH2>In the app (after sign-in)</DocH2>
      <DocP>
        <Link href="/home" className="underline underline-offset-4">
          Home
        </Link>
        {" → "}
        <Link href="/connectors" className="underline underline-offset-4">
          Connectors
        </Link>
        {" → "}
        <Link href="/sources" className="underline underline-offset-4">
          Sources
        </Link>
        {" → "}
        <Link href="/playground" className="underline underline-offset-4">
          Playground
        </Link>
        {" → "}
        <Link href="/keys" className="underline underline-offset-4">
          API keys
        </Link>
        .
      </DocP>
    </DocsShell>
  );
}
