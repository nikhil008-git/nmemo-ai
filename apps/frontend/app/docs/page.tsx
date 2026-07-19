import {
  DocCtas,
  DocLinkList,
  DocP,
  DocSection,
  DocsShell,
} from "@/components/docs/docs-shell";

export default function DocsHomePage() {
  return (
    <DocsShell
      title={
        <>
          Documentation
          <span className="mt-1.5 block font-semibold text-neutral-400">
            Get from zero to context in minutes.
          </span>
        </>
      }
      subtitle="nmemo gives your agents the right context from your tools and files, in one call. Start in the playground, then ship with the SDK."
    >
      <DocCtas
        primary={{ href: "/docs/sdk", label: "Get the SDK" }}
        secondary={{ href: "/docs/playground", label: "Open playground" }}
      />

      <DocSection title="Suggested path">
        <DocLinkList
          items={[
            {
              href: "/sign-in",
              title: "Create a workspace",
              body: "Book a demo or sign up, then connect the tools your team already uses.",
              step: "01",
            },
            {
              href: "/docs/playground",
              title: "Try the playground",
              body: "Ask a question and inspect the prompt, sources, and citations before you code.",
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

      <DocSection title="What you get">
        <DocP>
          Connect sources once. Every agent turn, nmemo retrieves what matters,
          ranks it, and returns a prompt you can pass straight to your model,
          with citations your UI can show.
        </DocP>
      </DocSection>
    </DocsShell>
  );
}
