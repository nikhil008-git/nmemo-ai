import Link from "next/link";

import {
  DocCode,
  DocH2,
  DocP,
  DocsShell,
  DocTable,
} from "@/components/docs/docs-shell";

export default function DocsPlaygroundPage() {
  return (
    <DocsShell title="Playground">
      <DocP>
        The{" "}
        <Link href="/playground" className="underline underline-offset-4">
          Context Playground
        </Link>{" "}
        is the product differentiator: not just chat, but a live view of what{" "}
        <code className="text-foreground">getContext()</code> retrieved,
        ranked, and packed for the model.
      </DocP>

      <DocH2>Two panes</DocH2>
      <DocTable
        rows={[
          {
            label: "Ask",
            value:
              "Your question → answer + citations from connected sources.",
          },
          {
            label: "Inspector",
            value:
              "Sources queried, latency, ranking scores, discarded context, token budget.",
          },
        ]}
      />

      <DocH2>Flow</DocH2>
      <DocCode>{`Connect sources → Upload docs → Ask in Playground
→ Inspect context → Create API key → Same call in your agent`}</DocCode>

      <DocH2>Under the hood</DocH2>
      <DocP>
        Playground calls <code className="text-foreground">POST /ask</code>,
        which runs <code className="text-foreground">getContext()</code> with
        your workspace connectors, then the LLM. Your app should call{" "}
        <code className="text-foreground">POST /context</code> (or the SDK)
        and feed <code className="text-foreground">prompt</code> to your own
        model.
      </DocP>

      <DocP>
        Open the app:{" "}
        <Link href="/playground" className="underline underline-offset-4">
          /playground
        </Link>
        .
      </DocP>
    </DocsShell>
  );
}
