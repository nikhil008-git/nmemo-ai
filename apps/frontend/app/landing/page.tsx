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

/* ---------------------------------------------------------------------------
 * Page vocabulary
 *
 * One rule runs through the whole page: nothing is in a box. Sections are
 * separated by air, groups of facts by type alone. The only objects with an
 * edge are the product plates — because a screenshot has an edge — and even
 * those are just a rounded corner and a cast shadow, no bezel and no hairline.
 * ------------------------------------------------------------------------- */

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

/** The vertical rhythm of the page: one long breath between arguments. */
function Section({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`${id ? "scroll-mt-24 " : ""}pt-32 sm:pt-48 ${className}`}
    >
      {children}
    </section>
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
      className={`text-balance text-[30px] font-medium leading-[1.12] tracking-[-0.02em] text-ink sm:text-[38px] ${className}`}
    >
      {children}
    </h2>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-[52ch] text-pretty text-[17px] leading-relaxed text-ink/50">
      {children}
    </p>
  );
}

/**
 * A product plate on one side, the claim it proves on the other, alternating
 * down the page. The copy is vertically centred against the plate so the two
 * read as one statement rather than a caption under a picture.
 */
function Showcase({
  media,
  title,
  body,
  flip = false,
  id,
}: {
  media: React.ReactNode;
  title: React.ReactNode;
  body: React.ReactNode;
  /** `true` puts the plate on the right at `lg`. */
  flip?: boolean;
  id?: string;
}) {
  return (
    <Section id={id}>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className={flip ? "lg:order-2" : undefined}>{media}</div>
          <div className={flip ? "lg:order-1" : undefined}>
            <SectionHeading>{title}</SectionHeading>
            <Lede>{body}</Lede>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Facts in columns, held together by alignment instead of cell borders. The
 * label carries the weight, the line under it carries the detail, and the
 * whitespace does the work a border used to do.
 */
function FactColumns({
  items,
  className = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: { title: string; meta?: string; body: string }[];
  className?: string;
}) {
  return (
    <div className={`grid gap-x-12 gap-y-10 ${className}`}>
      {items.map((item) => (
        <div key={item.title} className="max-w-[42ch]">
          <div className="flex items-baseline gap-3">
            <h3 className="text-[17px] font-medium text-ink">{item.title}</h3>
            {item.meta ? (
              <span className="ml-auto shrink-0 text-[12px] text-ink/30">
                {item.meta}
              </span>
            ) : null}
          </div>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink/45">
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}

/** A plain list: one dot, one line, no rule and no container. */
function PlainList({
  items,
  dim = false,
}: {
  items: string[];
  dim?: boolean;
}) {
  return (
    <ul
      className={`mt-4 space-y-2 text-[15px] leading-relaxed ${
        dim ? "text-ink/40" : "text-ink/50"
      }`}
    >
      {items.map((line) => (
        <li key={line} className="flex gap-3">
          <span
            className={`mt-[9px] size-1 shrink-0 rounded-full ${
              dim ? "bg-ink/15" : "bg-ink/30"
            }`}
          />
          {line}
        </li>
      ))}
    </ul>
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
            <h1 className="max-w-xs text-balance text-[19px] font-medium leading-[1.2] tracking-[-0.015em] text-ink sm:text-[21px]">
              Memory with receipts.
            </h1>

            <div>
              <p className="text-pretty text-[14px] leading-relaxed text-ink/45 md:max-w-xs">
                The project continuity layer for AI coding. nmemo remembers your
                repository&apos;s decisions, dead ends, and unfinished work.
              </p>

              <div className="mt-4 flex flex-row items-center gap-2">
                <Link
                  href="/home"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-background transition-colors hover:bg-ink/85"
                >
                  Open the workspace
                  <ArrowDownTray className="size-3.5 -rotate-90" />
                </Link>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/[0.12] bg-ink/[0.03] px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.07]"
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
        <Section>
          <Container>
            <SectionHeading className="max-w-[26ch]">
              Git remembers the code. Nothing remembers the reasoning.
            </SectionHeading>
            <Lede>
              Every new chat starts from zero: the constraint you agreed on
              yesterday, the approach that already failed twice, the test that is
              still red. nmemo keeps that layer next to the repository and hands
              it to whichever agent you open next.
            </Lede>

            <div className="mt-16 grid gap-12 sm:grid-cols-2 sm:gap-20">
              <div className="max-w-[40ch]">
                <p className="mono text-[13px] text-ink/30">git log</p>
                <p className="mt-3 text-[21px] font-medium leading-snug text-ink/45">
                  What code changed?
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/40">
                  A perfect record of diffs, and no record at all of the thinking
                  that produced them.
                </p>
              </div>
              <div className="max-w-[40ch]">
                <p className="mono text-[13px] text-ink/30">
                  nmemo resume --print
                </p>
                <p className="mt-3 text-[21px] font-medium leading-snug text-ink">
                  Why it changed, what was tried, what failed, what is next.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/45">
                  Decisions, conventions, failed attempts, test results, and the
                  next correct step — each one carrying its evidence.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Memory model                                                     */}
        {/* ---------------------------------------------------------------- */}
        <Section id="memory">
          <Container>
            <SectionHeading>Six kinds of memory, one budget.</SectionHeading>
            <Lede>
              &quot;Memory&quot; is not one thing. nmemo keeps the kinds
              separate, scopes every record to a repository, and makes each one
              carry provenance back to the file, commit, or session it came from.
            </Lede>

            <div className="mt-16">
              <FactColumns
                items={memoryLayers.map(({ name, scope, line }) => ({
                  title: name,
                  meta: scope,
                  body: line,
                }))}
              />
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Receipts + resume                                                */}
        {/* ---------------------------------------------------------------- */}
        <Showcase
          id="receipts"
          media={<ReceiptPlate />}
          title="Every memory arrives with a receipt."
          body="Why it was selected, the score behind that ranking, the file or commit it came from, whether it was confirmed against the current repository, and how confident nmemo is. Nothing is pasted into a prompt anonymously."
        />

        <Showcase
          id="resume"
          flip
          media={<ResumePlate />}
          title="Resume, don't re-explain."
          body="Stop mid-task on Tuesday, come back Thursday in a different agent. nmemo checks the repository and git state, validates memories against the live code, and prints a packet that says what is done, what is failing, and the next correct step."
        />

        {/* ---------------------------------------------------------------- */}
        {/* Freshness: the repo is the source of truth                       */}
        {/* ---------------------------------------------------------------- */}
        <Section>
          <Container>
            <SectionHeading className="max-w-[30ch]">
              When memory and the repository disagree, the repository wins.
            </SectionHeading>
            <Lede>
              Old context makes an agent worse, not better. If a memory says
              MongoDB while Prisma says PostgreSQL, nmemo marks it stale and
              supersedes it. Leaked scope is dropped before ranking, and a stored
              instruction is never treated as a command.
            </Lede>

            <div className="mt-14">
              <FreshnessReport />
            </div>

            <div className="mt-14">
              <FactColumns
                className="sm:grid-cols-2 lg:grid-cols-4"
                items={[
                  {
                    title: "Stale memory",
                    body: "Claims about the code are re-checked against files, configs, and git state on every recall.",
                  },
                  {
                    title: "Contradiction",
                    body: "Conflicting facts are surfaced and superseded with history kept, never silently picked.",
                  },
                  {
                    title: "Scope leak",
                    body: "Every record carries a user, workspace, and repository scope, filtered before ranking — not after.",
                  },
                  {
                    title: "Prompt injection",
                    body: "A memory is data. Stored text asking to skip approvals is quarantined, not executed.",
                  },
                ]}
              />
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Scoping, portability, processes                                  */}
        {/* ---------------------------------------------------------------- */}
        <Showcase
          media={<ProjectsPlate />}
          title="Work across repos without leaking between them."
          body="Memory belongs to a repository, not to a chat window. What your client project decided about Mongo never surfaces while you're working on your own product."
        />

        <Showcase
          flip
          media={<HandoffPlate />}
          title="Switch agents without starting over."
          body="The resume packet is plain structured text, so every tool is already integrated: Claude Code, Codex, Cursor, Gemini, or the nmemo TUI. Paste it and the agent begins with verified context instead of a blank chat."
        />

        <Showcase
          media={<ProcessPlate />}
          title="Every step, in sight."
          body="The loop reports each step, each tool call, the context it selected, and the tokens it spent. Approval gates stop writes and shell commands before they run, and paths outside the repository root are rejected by the runtime."
        />

        {/* ---------------------------------------------------------------- */}
        {/* The CLI                                                          */}
        {/* ---------------------------------------------------------------- */}
        <Section id="cli">
          <Container>
            <SectionHeading>Five commands, one project brain.</SectionHeading>
            <Lede>
              nmemo runs where you already work: inside a git repository, in the
              terminal. It identifies the repo, opens a task session, and keeps
              the episode when you stop.
            </Lede>

            <div className="mt-14">
              <CommandBlock />
            </div>

            <div className="mt-14 grid gap-12 sm:grid-cols-2 sm:gap-20">
              <div className="max-w-[42ch]">
                <h3 className="text-[17px] font-medium text-ink">
                  In the first release
                </h3>
                <PlainList
                  items={[
                    "The terminal TUI and its agent runtime",
                    "Repository detection and task sessions",
                    "Episode memory with receipts",
                    "Safe read-file and search-files tools",
                    "nmemo start · status · resume · resume --print",
                    "The dashboard as a visual project brain",
                  ]}
                />
              </div>
              <div className="max-w-[42ch]">
                <h3 className="text-[17px] font-medium text-ink">
                  Deliberately later
                </h3>
                <PlainList
                  dim
                  items={[
                    "SDK for custom agents",
                    "MCP server for automatic retrieval",
                    "Editor-native integrations",
                    "GitHub issue and PR automation",
                    "Cloud sync and billing",
                  ]}
                />
                <p className="mt-5 text-[13px] leading-relaxed text-ink/30">
                  A paste-able packet works with every coding tool today. Plugins
                  come after the local loop is reliable.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* What is defensible                                               */}
        {/* ---------------------------------------------------------------- */}
        <Section>
          <Container>
            <SectionHeading className="max-w-[30ch]">
              Not another code generator. The layer underneath them.
            </SectionHeading>
            <Lede>
              Claude Code, Codex, and Cursor write the code. nmemo gives them a
              shared, portable project brain — and the success metric is not
              &quot;nmemo writes better code&quot;, it is &quot;I never explain
              my project from scratch again&quot;.
            </Lede>

            <div className="mt-16">
              <FactColumns
                className="sm:grid-cols-2"
                items={[
                  {
                    title: "Portable continuity",
                    body: "Continuity lives with the repository, not inside one vendor's chat history. Change tools without losing the thread.",
                  },
                  {
                    title: "Project-scoped, not chat-scoped",
                    body: "Recall is filtered by repository and workspace first, so context stays about the project in front of you.",
                  },
                  {
                    title: "Visible selection",
                    body: "You can see which memories were chosen, why, and what they cost against the prompt budget.",
                  },
                  {
                    title: "Local-first storage",
                    body: "Sessions, episodes, and memories live in a database you can open, audit, and delete from.",
                  },
                ]}
              />
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ                                                              */}
        {/* ---------------------------------------------------------------- */}
        <Section id="faq">
          <Container>
            <SectionHeading>The practical bits, answered.</SectionHeading>

            <div className="mt-10 max-w-3xl">
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
                <details key={q} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center gap-4 py-4 text-[17px] text-ink/85 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="ml-auto size-[18px] shrink-0 text-ink/35 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="max-w-[70ch] pb-5 text-[16px] leading-relaxed text-ink/45">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA                                                        */}
        {/* ---------------------------------------------------------------- */}
        <Section className="pb-32 sm:pb-48">
          <Container>
            <div className="relative overflow-hidden rounded-[28px] px-8 py-20 text-center sm:px-16 sm:py-28">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_115%,var(--stage-glow),transparent_62%)]"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-balance text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-ink sm:text-[44px]">
                  Stop re-explaining your codebase every morning.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-ink/50">
                  Start a task, let nmemo keep the episode, and pick it back up
                  in whichever agent you open next — with receipts.
                </p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/home"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-background transition-colors hover:bg-ink/85"
                  >
                    Open the workspace
                    <ArrowDownTray className="size-[18px] -rotate-90" />
                  </Link>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-full border border-ink/[0.12] bg-ink/[0.03] px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-ink/[0.07]"
                  >
                    <GitHub className="size-[18px]" />
                    Read the source
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <LandingFooter />
    </>
  );
}
