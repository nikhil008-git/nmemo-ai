import Link from "next/link";
import { ArrowDownTray, GitHub } from "@/components/landing/icons";
import { BackendWarmup } from "@/components/landing/backend-warmup";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { HomeDemo } from "@/components/landing/home-demo";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PlaygroundDemo } from "@/components/landing/playground-demo";
import {
  HandoffPlate,
  ProjectsPlate,
  ResumePlate,
} from "@/components/landing/mockups";
import { Wallpaper } from "@/components/landing/wallpaper";
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
    <div
      className={`mx-auto w-full min-w-0 max-w-[1180px] px-4 sm:px-6 ${className}`}
    >
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
      className={`${id ? "scroll-mt-20 sm:scroll-mt-24 " : ""}pt-20 sm:pt-32 lg:pt-48 ${className}`}
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
      className={`text-balance text-[25px] font-medium leading-[1.16] tracking-[-0.02em] text-ink md:text-[38px] md:leading-[1.12] ${className}`}
    >
      {children}
    </h2>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-[52ch] text-pretty text-[15px] leading-relaxed text-ink/50 md:text-[17px]">
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
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-20">
          <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>{media}</div>
          <div className={`min-w-0 ${flip ? "lg:order-1" : ""}`}>
            <SectionHeading>{title}</SectionHeading>
            <Lede>{body}</Lede>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default function LandingPage() {
  return (
    <>
      <BackendWarmup />
      <main className="min-w-0 flex-1 overflow-x-clip">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-6 sm:pt-10">
          <Container className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-14">
            <h1 className="flex items-center gap-2 text-[18px] font-medium leading-[1.2] tracking-[-0.015em] text-ink md:text-[21px]">
              <span className="whitespace-nowrap">Context with receipts.</span>
              {/* Use a native img so the animated GIF is never reduced to a still. */}
              <img
                src="/marketing/nmemo-idle.gif"
                alt="nmemo mascot idling"
                width={1080}
                height={1080}
                className="size-12 shrink-0 rounded-xl object-cover sm:size-14"
              />
            </h1>

            <div>
              <p className="text-pretty text-[14px] leading-relaxed text-ink/45 md:max-w-xs">
                The context layer for AI agents. nmemo finds the right context
                across your connected sources, with receipts.
              </p>

              <div className="mt-4 flex flex-row items-center gap-2">
                <Link
                  href="/sign-in"
                  data-backend-warmup
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-background transition-colors hover:bg-ink/85"
                >
                  Get started
                  <ArrowDownTray className="size-3.5 -rotate-90" />
                </Link>
                <a
                  href={REPO_URL}
                  data-backend-warmup
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-ink/[0.12] bg-ink/[0.03] px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.07]"
                >
                  <GitHub className="size-3.5" />
                  Star on GitHub
                </a>
              </div>
            </div>
          </Container>

          <Container className="pt-6 sm:pt-10">
            <PlaygroundDemo />
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* The premise: git vs nmemo                                        */}
        {/* ---------------------------------------------------------------- */}
        <Section>
          <Container>
            <SectionHeading className="max-w-[26ch]">
              Your data is connected. Your agent still needs context.
            </SectionHeading>
            <Lede>
              Search gives you raw results. Chat history gives you everything.
              nmemo selects the useful evidence across your connected sources,
              fits it to the budget, and gives your agent one grounded package.
            </Lede>

            <div className="mt-10 grid gap-10 sm:mt-16 sm:grid-cols-2 sm:gap-20">
              <div className="max-w-[40ch]">
                <p className="mono text-[13px] text-ink/30">
                  connected sources
                </p>
                <p className="mt-3 text-[21px] font-medium leading-snug text-ink/45">
                  Where is the answer?
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/40">
                  Documents, memory, Slack, Notion, GitHub, and APIs all hold a
                  partial view of the answer.
                </p>
              </div>
              <div className="max-w-[40ch]">
                <p className="mono text-[13px] text-ink/30">
                  nmemo getContext()
                </p>
                <p className="mt-3 text-[21px] font-medium leading-snug text-ink">
                  What should the model actually see?
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/45">
                  One ranked context package with citations, source status,
                  token use, and the diagnostics behind every selection.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Logged-in product inspection                                    */}
        {/* ---------------------------------------------------------------- */}
        <Section>
          <Container>
            <SectionHeading>
              Connect, inspect, and verify in one surface.
            </SectionHeading>
            <Lede>
              Add workspace knowledge, watch it become available to your agents,
              and keep every source visible without breaking focus.
            </Lede>

            <div className="mt-10 sm:mt-14">
              <HomeDemo />
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Receipts + resume                                                */}
        {/* ---------------------------------------------------------------- */}
        <Showcase
          id="resume"
          flip
          media={<ResumePlate />}
          title="A context package, not another black box."
          body="Your app gets the final prompt together with the selected evidence, citations, source health, token usage, and diagnostics to inspect or display however it needs."
        />

        {/* ---------------------------------------------------------------- */}
        {/* Scoping, portability, processes                                  */}
        {/* ---------------------------------------------------------------- */}
        <Showcase
          media={<ProjectsPlate />}
          title="Connect the sources your product already uses."
          body="Start with documents and memory, then add Slack, Notion, GitHub, and the systems that hold the knowledge your agent needs."
        />

        <Showcase
          flip
          media={<HandoffPlate />}
          title="Keep your model and framework."
          body="Use the Context API or SDK with the agent stack you already have. nmemo assembles the context; your application stays in control of generation."
        />

        {/* ---------------------------------------------------------------- */}
        {/* FAQ                                                              */}
        {/* ---------------------------------------------------------------- */}
        <Section id="faq">
          <Container>
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
              <div className="max-w-sm lg:pt-2">
                <SectionHeading>The practical bits, answered.</SectionHeading>
                <Lede>
                  What nmemo owns, what stays in your stack, and what arrives
                  with every context package.
                </Lede>
              </div>

              <FaqAccordion />
            </div>
          </Container>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA                                                        */}
        {/* ---------------------------------------------------------------- */}
        <Section className="pb-20 sm:pb-32 lg:pb-48">
          <Container>
            <div className="relative overflow-hidden rounded-[22px] px-5 py-16 text-center sm:rounded-[28px] sm:px-16 sm:py-28">
              <Wallpaper className="absolute inset-[-8%] h-[116%] w-[116%] scale-110 opacity-75 blur-2xl" />
              <div aria-hidden className="absolute inset-0 bg-[#0b0a09]/60" />
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_115%,var(--stage-glow),transparent_68%)]"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-balance text-[26px] font-medium leading-[1.14] tracking-[-0.02em] text-white md:text-[44px] md:leading-[1.1]">
                  Give every agent the context it needs. None of the context it
                  doesn&apos;t.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-pretty text-[14px] leading-relaxed text-white/55 md:mt-5 md:text-[17px]">
                  Connect your sources, inspect the context package, then keep
                  building with the model and framework you already use.
                </p>
                <div className="mt-7 flex flex-row items-center justify-center gap-2 sm:mt-9 sm:gap-3">
                  <Link
                    href="/sign-in"
                    data-backend-warmup
                    className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-2 text-[12px] font-medium text-[#0b0a09] transition-colors hover:bg-white/85 sm:gap-2 sm:px-6 sm:py-3 sm:text-[15px]"
                  >
                    Get started
                    <ArrowDownTray className="size-4 -rotate-90 sm:size-[18px]" />
                  </Link>
                  <a
                    href={REPO_URL}
                    data-backend-warmup
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-white/[0.08] sm:gap-2.5 sm:px-6 sm:py-3 sm:text-[15px]"
                  >
                    <GitHub className="size-4 sm:size-[18px]" />
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
