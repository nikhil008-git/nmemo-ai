import {
  DocCtas,
  DocFeatureGrid,
  DocLinkList,
  DocP,
  DocSection,
  DocsShell,
  DocTabbedCode,
} from "@/components/docs/docs-shell";

const INSTALL_TABS = [
  {
    label: "CLI",
    code: `npx nmemo start "Add retry handling to GitHub sync"`,
  },
  {
    label: "Resume",
    code: `nmemo resume --print   # portable packet, paste into any agent`,
  },
  {
    label: "Context",
    code: `nmemo context "Why does GitHub sync use a queue?"`,
  },
];

export default function DocsHomePage() {
  return (
    <DocsShell
      title="Documentation"
      subtitle="nmemo runs where you already work: inside a git repository, in the terminal. It keeps the context around your codebase and hands any coding agent a packet it can verify."
    >
      <section className="space-y-8">
        <DocCtas
          primary={{ href: "/sign-up", label: "Get started" }}
          secondary={{ href: "/docs/playground", label: "Try the playground" }}
        />
        <DocTabbedCode tabs={INSTALL_TABS} />
      </section>

      <DocSection
        title="Start here"
        muted="Three steps from an empty terminal to a resumable project brain."
      >
        <DocLinkList
          items={[
            {
              href: "/sign-up",
              title: "Create a workspace",
              body: "Sign up, then point nmemo at the repository you are already working in.",
              step: "01",
            },
            {
              href: "/docs/playground",
              title: "Try the playground",
              body: "Ask a question and inspect the context, sources, and receipts before you code.",
              step: "02",
            },
            {
              href: "/docs/sdk",
              title: "Install the SDK",
              body: "One getContext() call returns a ready prompt for any model or agent framework.",
              step: "03",
            },
          ]}
        />
      </DocSection>

      <DocSection
        title="What nmemo keeps"
        muted="Six kinds of memory, each scoped to a repository and each carrying its evidence."
      >
        <DocFeatureGrid
          items={[
            {
              title: "Decisions and conventions.",
              body: "What the project agreed on, why, and the commit or file that proves it.",
              chips: ["decision", "convention"],
            },
            {
              title: "Failed attempts.",
              body: "The approach that already broke twice, so the next agent does not try it a third time.",
              chips: ["dead-end", "retry"],
            },
            {
              title: "Unfinished work.",
              body: "What is in flight, what is failing, and the next correct step to take.",
              chips: ["in-flight", "next-step"],
            },
            {
              title: "Receipts on everything.",
              body: "Why a memory was selected, its score, its source, and how confident nmemo is.",
              chips: ["score", "source", "confidence"],
            },
            {
              title: "Freshness checks.",
              body: "When memory and the repository disagree, the repository wins and the stale record is superseded.",
              chips: ["stale", "superseded"],
            },
            {
              title: "Repository scope.",
              body: "Every record carries a user, workspace, and repo scope, filtered before ranking — never after.",
              chips: ["user", "workspace", "repo"],
            },
          ]}
        />
      </DocSection>

      <DocSection title="How it fits your stack">
        <DocP>
          Claude Code, Codex, and Cursor write the code. nmemo gives them a
          shared, portable project brain. The resume packet is plain structured
          text, so every tool is already integrated — paste it and the agent
          begins with verified context instead of a blank chat.
        </DocP>
        <DocP>
          When you want it programmatic, the same context is one SDK call away.
        </DocP>
      </DocSection>
    </DocsShell>
  );
}
