import Link from "next/link";

import { ArrowDownTray, ChevronDown, GitHub } from "@/components/landing/icons";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  AgentWindow,
  CommandBlock,
  FreshnessReport,
  HandoffPlate,
  ProcessPlate,
  ProjectsPlate,
  ReceiptPlate,
  ResumePlate,
  memoryLayers,
} from "@/components/landing/mockups";
import { REPO_URL } from "@/lib/site";

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-balance text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-white sm:text-[40px] ${className}`}
    >
      {children}
    </h2>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-white/50">
      {children}
    </p>
  );
}

/** Hairline grid of cards — one border, one gap colour, no card shadows. */
function CardGrid({
  items,
  className = "sm:grid-cols-2",
}: {
  items: [string, string][];
  className?: string;
}) {
  return (
    <div
      className={`grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] ${className}`}
    >
      {items.map(([title, body]) => (
        <div key={title} className="bg-[#141312] p-7">
          <h3 className="text-[17px] font-medium text-white">{title}</h3>
          <p className="mt-2.5 text-[15px] leading-relaxed text-white/45">
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <main className="flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-8 sm:pt-10">
          <Container className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-14">
            <h1 className="max-w-xs text-balance text-[19px] font-medium leading-[1.2] tracking-[-0.015em] text-white sm:text-[21px]">
              Memory with receipts.
            </h1>

            <div>
              <p className="text-pretty text-[14px] leading-relaxed text-white/45 md:max-w-xs">
                The project continuity layer for AI coding. nmemo remembers your
                repository&apos;s decisions, dead ends, and unfinished work.
              </p>

              <div className="mt-4 flex flex-row items-center gap-2">
                <Link
                  href="/home"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#121110] transition-colors hover:bg-white/85"
                >
                  Open the workspace
                  <ArrowDownTray className="size-3.5 -rotate-90" />
                </Link>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.07]"
                >
                  <GitHub className="size-3.5" />
                  Star on GitHub
                </a>
              </div>
            </div>
          </Container>

          <Container className="pt-8 sm:pt-10">
            <AgentWindow />
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* The premise: git vs nmemo                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-28 sm:pt-40">
          <Container>
            <SectionHeading>
              Git remembers the code. Nothing remembers the reasoning.
            </SectionHeading>
            <Lede>
              Every new chat starts from zero: the constraint you agreed on
              yesterday, the approach that already failed twice, the test that is
              still red. nmemo keeps that layer next to the repository and hands
              it to whichever agent you open next.
            </Lede>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
              <div className="bg-[#141312] p-7">
                <p className="mono text-[13px] text-white/30">git log</p>
                <p className="mt-3 text-[19px] font-medium leading-snug text-white/70">
                  What code changed?
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/40">
                  A perfect record of diffs, and no record at all of the thinking
                  that produced them.
                </p>
              </div>
              <div className="bg-[#141312] p-7">
                <p className="mono text-[13px] text-white/30">
                  nmemo resume --print
                </p>
                <p className="mt-3 text-[19px] font-medium leading-snug text-white">
                  Why it changed, what was tried, what failed, what is next.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/45">
                  Decisions, conventions, failed attempts, test results, and the
                  next correct step — each one carrying its evidence.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Memory model                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section id="memory" className="scroll-mt-20 pt-28 sm:pt-40">
          <Container>
            <SectionHeading>Six kinds of memory, one budget.</SectionHeading>
            <Lede>
              &quot;Memory&quot; is not one thing. nmemo keeps the kinds
              separate, scopes every record to a repository, and makes each one
              carry provenance back to the file, commit, or session it came from.
            </Lede>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
              {memoryLayers.map(({ name, scope, line }) => (
                <div key={name} className="bg-[#141312] p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[15px] font-medium text-white">
                      {name}
                    </span>
                    <span className="ml-auto text-[12px] text-white/30">
                      {scope}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/45">
                    {line}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Receipts + resume                                                */}
        {/* ---------------------------------------------------------------- */}
        <section id="receipts" className="scroll-mt-20 pt-28 sm:pt-40">
          <Container>
            <SectionHeading>
              Memory you can trust, because you can check it.
            </SectionHeading>

            <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-10">
              <div>
                <ReceiptPlate />
                <h3 className="mt-7 text-[22px] font-medium tracking-[-0.01em] text-white">
                  Every memory arrives with a receipt
                </h3>
                <p className="mt-3 text-[16px] leading-relaxed text-white/50">
                  Why it was selected, the score behind that ranking, the file or
                  commit it came from, whether it was confirmed against the
                  current repository, and how confident nmemo is. Nothing is
                  pasted into a prompt anonymously.
                </p>
              </div>

              <div id="resume" className="scroll-mt-20">
                <ResumePlate />
                <h3 className="mt-7 text-[22px] font-medium tracking-[-0.01em] text-white">
                  Resume, don&apos;t re-explain
                </h3>
                <p className="mt-3 text-[16px] leading-relaxed text-white/50">
                  Stop mid-task on Tuesday, come back Thursday in a different
                  agent. nmemo checks the repository and git state, validates
                  memories against the live code, and prints a packet that says
                  what is done, what is failing, and the next correct step.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Freshness: the repo is the source of truth                       */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-28 sm:pt-40">
          <Container>
            <SectionHeading>
              When memory and the repository disagree, the repository wins.
            </SectionHeading>
            <Lede>
              Old context makes an agent worse, not better. If a memory says
              MongoDB while Prisma says PostgreSQL, nmemo marks it stale and
              supersedes it. Leaked scope is dropped before ranking, and a stored
              instruction is never treated as a command.
            </Lede>

            <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
              <FreshnessReport />

              <div className="grid gap-px self-start overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06]">
                {(
                  [
                    [
                      "Stale memory",
                      "Claims about the code are re-checked against files, configs, and git state on every recall.",
                    ],
                    [
                      "Contradiction",
                      "Conflicting facts are surfaced and superseded with history kept, never silently picked.",
                    ],
                    [
                      "Scope leak",
                      "Every record carries a user, workspace, and repository scope, filtered before ranking — not after.",
                    ],
                    [
                      "Prompt injection",
                      "A memory is data. Stored text asking to skip approvals is quarantined, not executed.",
                    ],
                  ] as [string, string][]
                ).map(([title, body]) => (
                  <div key={title} className="bg-[#141312] px-6 py-5">
                    <h3 className="text-[14px] font-medium text-white/85">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-white/45">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Scoping, portability, processes                                  */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-28 sm:pt-40">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <ProjectsPlate />
              <div>
                <SectionHeading>
                  Work across repos without leaking between them.
                </SectionHeading>
                <Lede>
                  Memory belongs to a repository, not to a chat window. What your
                  client project decided about Mongo never surfaces while
                  you&apos;re working on your own product.
                </Lede>
              </div>
            </div>

            <div className="mt-24 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 sm:mt-32">
              <HandoffPlate />
              <div>
                <SectionHeading>
                  Switch agents without starting over.
                </SectionHeading>
                <Lede>
                  The resume packet is plain structured text, so every tool is
                  already integrated: Claude Code, Codex, Cursor, Gemini, or the
                  nmemo TUI. Paste it and the agent begins with verified context
                  instead of a blank chat.
                </Lede>
              </div>
            </div>

            <div className="mt-24 grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16 sm:mt-32">
              <div>
                <SectionHeading>Every step, in sight.</SectionHeading>
                <Lede>
                  The loop reports each step, each tool call, the context it
                  selected, and the tokens it spent. Approval gates stop writes
                  and shell commands before they run, and paths outside the
                  repository root are rejected by the runtime.
                </Lede>
              </div>
              <div>
                <ProcessPlate />
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* The CLI                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section id="cli" className="scroll-mt-20 pt-28 sm:pt-40">
          <Container>
            <SectionHeading>Five commands, one project brain.</SectionHeading>
            <Lede>
              nmemo runs where you already work: inside a git repository, in the
              terminal. It identifies the repo, opens a task session, and keeps
              the episode when you stop.
            </Lede>

            <div className="mt-12">
              <CommandBlock />
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
              <div className="bg-[#141312] p-7">
                <h3 className="text-[17px] font-medium text-white">
                  In the first release
                </h3>
                <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-white/50">
                  {[
                    "The terminal TUI and its agent runtime",
                    "Repository detection and task sessions",
                    "Episode memory with receipts",
                    "Safe read-file and search-files tools",
                    "nmemo start · status · resume · resume --print",
                    "The dashboard as a visual project brain",
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-[9px] size-1 shrink-0 rounded-full bg-white/30" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#141312] p-7">
                <h3 className="text-[17px] font-medium text-white">
                  Deliberately later
                </h3>
                <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-white/40">
                  {[
                    "SDK for custom agents",
                    "MCP server for automatic retrieval",
                    "Editor-native integrations",
                    "GitHub issue and PR automation",
                    "Cloud sync and billing",
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-[9px] size-1 shrink-0 rounded-full bg-white/15" />
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-white/[0.07] pt-4 text-[13px] leading-relaxed text-white/30">
                  A paste-able packet works with every coding tool today. Plugins
                  come after the local loop is reliable.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* What is defensible                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-28 sm:pt-40">
          <Container>
            <SectionHeading>
              Not another code generator. The layer underneath them.
            </SectionHeading>
            <Lede>
              Claude Code, Codex, and Cursor write the code. nmemo gives them a
              shared, portable project brain — and the success metric is not
              &quot;nmemo writes better code&quot;, it is &quot;I never explain
              my project from scratch again&quot;.
            </Lede>

            <div className="mt-12">
              <CardGrid
                items={[
                  [
                    "Portable continuity",
                    "Continuity lives with the repository, not inside one vendor's chat history. Change tools without losing the thread.",
                  ],
                  [
                    "Project-scoped, not chat-scoped",
                    "Recall is filtered by repository and workspace first, so context stays about the project in front of you.",
                  ],
                  [
                    "Visible selection",
                    "You can see which memories were chosen, why, and what they cost against the prompt budget.",
                  ],
                  [
                    "Local-first storage",
                    "Sessions, episodes, and memories live in a database you can open, audit, and delete from.",
                  ],
                ]}
              />
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ                                                              */}
        {/* ---------------------------------------------------------------- */}
        <section id="faq" className="scroll-mt-20 pt-28 sm:pt-40">
          <Container>
            <SectionHeading>The practical bits, answered.</SectionHeading>

            <div className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {(
                [
                  [
                    "What is nmemo?",
                    "A project continuity layer for AI coding. It runs in a git repository, keeps the context around that codebase — decisions, conventions, failed attempts, unfinished tasks, test results — and hands any coding agent a verified packet of it.",
                  ],
                  [
                    "How is it different from a long chat history?",
                    "Chat history is what was said. nmemo stores what turned out to be true and worth keeping, scoped to a repository, with provenance and a freshness check, and retrieves it only when it is relevant to the task.",
                  ],
                  [
                    "Do I have to switch coding agents?",
                    "No. That is the point. `nmemo resume --print` writes plain structured text you paste into Claude Code, Codex, Cursor, or Gemini. The built-in TUI is there when you want the whole loop in one place.",
                  ],
                  [
                    "What happens when memory contradicts the code?",
                    "The repository wins. Live evidence read from disk outranks anything memory claims about the code, and the stale record is superseded rather than quietly deleted.",
                  ],
                  [
                    "Does it remember everything automatically?",
                    "No — remembering everything is how a memory system rots. Candidates are proposed at the end of a session and you accept, edit, or reject each one before anything is written.",
                  ],
                  [
                    "Can it edit files or run commands on its own?",
                    "Writes and shell commands stop for approval, tool arguments are schema-validated, and any path resolving outside the repository root is rejected before it reaches the filesystem.",
                  ],
                  [
                    "Is there an SDK or MCP server?",
                    "Later, on purpose. The portable packet already works with every tool, so the local CLI and TUI have to be reliable first.",
                  ],
                ] as [string, string][]
              ).map(([q, a]) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-5 text-[17px] text-white/85 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="ml-auto size-[18px] shrink-0 text-white/35 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="max-w-3xl pb-6 text-[16px] leading-relaxed text-white/45">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-28 sm:py-40">
          <Container>
            <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] px-8 py-16 text-center sm:px-16 sm:py-24">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_115%,rgba(217,154,85,0.22),transparent_62%)]"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-balance text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-white sm:text-[44px]">
                  Stop re-explaining your codebase every morning.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-white/50">
                  Start a task, let nmemo keep the episode, and pick it back up
                  in whichever agent you open next — with receipts.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/home"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[#121110] transition-colors hover:bg-white/85"
                  >
                    Open the workspace
                    <ArrowDownTray className="size-[18px] -rotate-90" />
                  </Link>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-white/[0.07]"
                  >
                    <GitHub className="size-[18px]" />
                    Read the source
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
