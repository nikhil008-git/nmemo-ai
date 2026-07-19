import Link from "next/link";

import {
  DocCtas,
  DocP,
  DocSection,
  DocsShell,
  DocTable,
} from "@/components/docs/docs-shell";

export default function DocsPlaygroundPage() {
  return (
    <DocsShell
      title={
        <>
          Playground
          <span className="mt-1.5 block font-semibold text-neutral-400">
            Ask once. See the context behind it.
          </span>
        </>
      }
      subtitle="A live view of what getContext() returns, prompt, sources, and citations, before you wire the SDK into your product."
    >
      <DocCtas
        primary={{ href: "/sign-in", label: "Try it" }}
        secondary={{ href: "/docs/sdk", label: "Ship with the SDK" }}
      />

      <DocSection title="How to use it">
        <DocTable
          rows={[
            {
              label: "Ask",
              value:
                "Type a question. The answer is built from the assembled prompt and citations.",
            },
            {
              label: "Inspect",
              value:
                "See which sources contributed, how tokens were spent, and what was kept.",
            },
          ]}
        />
      </DocSection>

      <DocSection title="Same result as production">
        <DocP>
          When the playground looks right, call the same{" "}
          <code className="text-foreground">getContext()</code> from your agent
          with the{" "}
          <Link
            href="/docs/sdk"
            className="text-foreground underline underline-offset-4"
          >
            SDK
          </Link>
          .
        </DocP>
      </DocSection>
    </DocsShell>
  );
}
