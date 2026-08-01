"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LandingFooter } from "@/components/landing/landing-footer";
import { CtaButton, CtaButtonRow } from "@/components/ui/cta-button";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * Shell
 *
 * Docs is the landing page's layout with a nav column: the same site header,
 * the same 1180px container, the same footer, and one window scroll. The only
 * addition is a sticky index on the left; below `lg` it becomes a scrollable
 * row of links above the article.
 *
 * Everything inside is built from the landing page's vocabulary, and that
 * vocabulary has no boxes: facts sit in columns held by alignment and
 * whitespace, headings run medium at -0.02em, body copy at `ink/45`, code is a
 * rounded plate with a cast shadow, and buttons are the `btn-cta-*` pills.
 * ------------------------------------------------------------------------- */

const docsNav = [
  {
    href: "/docs/sdk",
    label: "SDK",
    match: (p: string) => p.startsWith("/docs/sdk"),
  },
  {
    href: "/docs/playground",
    label: "Playground",
    match: (p: string) => p.startsWith("/docs/playground"),
  },
] as const;

function NavLink({
  href,
  label,
  active,
  className,
}: {
  href: string;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "block shrink-0 whitespace-nowrap text-[13px] transition-colors hover:text-ink",
        active ? "text-ink" : "text-ink/50",
        className,
      )}
    >
      {label}
    </Link>
  );
}

function DocsNav() {
  const pathname = usePathname();

  return (
    <>
      {/* lg and up: a sticky index beside the article. */}
      <nav
        aria-label="Documentation"
        className="hidden shrink-0 lg:block lg:w-[168px]"
      >
        <div className="sticky top-10 space-y-3">
          <p className="mono text-[12px] text-ink/30">Docs</p>
          {docsNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={item.match(pathname)}
            />
          ))}
        </div>
      </nav>

      {/* Below lg: the same links as one scrollable row. */}
      <nav
        aria-label="Documentation"
        className="-mx-6 flex items-center gap-5 overflow-x-auto px-6 pb-5 lg:hidden"
      >
        {docsNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            active={item.match(pathname)}
          />
        ))}
      </nav>
    </>
  );
}

export function DocsShell({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1180px] px-6 pt-8 sm:pt-10">
          <div className="flex flex-col lg:flex-row lg:gap-14">
            <DocsNav />

            <article className="min-w-0 flex-1 pb-28 sm:pb-40 lg:max-w-[760px]">
              <header className="min-w-0">
                <h1 className="text-balance text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-ink sm:text-[40px]">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink/50">
                    {subtitle}
                  </p>
                ) : null}
              </header>

              <div className="mt-12 space-y-20">{children}</div>
            </article>
          </div>
        </div>
      </main>

      <LandingFooter />
    </>
  );
}

/* ---------------------------------------------------------------------------
 * Content primitives — same scale and construction as the landing sections.
 * ------------------------------------------------------------------------- */

export function DocSection({
  title,
  muted,
  children,
}: {
  title: React.ReactNode;
  muted?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="w-full">
      <h2 className="text-balance text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink sm:text-[30px]">
        {title}
      </h2>

      {muted ? (
        <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink/50">
          {muted}
        </p>
      ) : null}

      {children ? <div className="mt-8 space-y-5">{children}</div> : null}
    </section>
  );
}

export function DocP({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-2xl text-pretty text-[15px] leading-relaxed text-ink/45",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** The landing terminal's window bar, reused so code plates read as one family. */
function TrafficLights() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full bg-[#ff5f57]" />
      <span className="size-2.5 rounded-full bg-[#febc2e]" />
      <span className="size-2.5 rounded-full bg-[#28c840]" />
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink/35 transition-colors hover:bg-ink/[0.06] hover:text-ink/80"
    >
      {copied ? (
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path
            d="M3 8.5 6.2 11.5 13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <rect
            x="5.75"
            y="5.75"
            width="8.5"
            height="8.5"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M10.25 3.75a2 2 0 0 0-2-2h-4.5a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * Code is a dusk plate in both themes — `dark-island` re-pins the tokens so
 * the contents keep dark-theme ink on a paper page, exactly like the terminal
 * mockups on the landing page.
 */
export function DocCode({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  const source = typeof children === "string" ? children : "";

  return (
    <div className="dark-island overflow-hidden rounded-[20px] bg-code-bg text-code-fg shadow-[var(--bezel-shadow)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <TrafficLights />
        <p className="mono ml-2 min-w-0 truncate text-[12px] text-ink/30">
          {caption ?? "nmemo"}
        </p>
        {source ? (
          <div className="ml-auto">
            <CopyButton value={source} />
          </div>
        ) : null}
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed sm:px-5">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

/**
 * One plate, several ways in. Each tab is a complete command, so the reader
 * picks their entry point instead of reading three blocks to find theirs.
 */
export function DocTabbedCode({
  tabs,
}: {
  tabs: { label: string; code: string }[];
}) {
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];

  return (
    <div className="dark-island overflow-hidden rounded-[20px] bg-code-bg text-code-fg shadow-[var(--bezel-shadow)]">
      <div className="flex items-center border-b border-border px-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={cn(
              "relative px-3.5 py-3 text-[13px] transition-colors",
              i === active ? "text-ink" : "text-ink/40 hover:text-ink/70",
            )}
          >
            {tab.label}
            {i === active ? (
              <span
                aria-hidden
                className="absolute inset-x-2.5 -bottom-px h-px bg-ink"
              />
            ) : null}
          </button>
        ))}
        <div className="ml-auto pr-1.5">
          <CopyButton value={current.code} />
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed sm:px-5">
        <code className="font-mono">{current.code}</code>
      </pre>
    </div>
  );
}

/**
 * Numbered hairline grid. One border, one gap colour, no shadows — the same
 * construction as every card grid on the landing page.
 */
export function DocFeatureGrid({
  items,
}: {
  items: { title: string; body: string; chips?: string[] }[];
}) {
  return (
    <ol className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={item.title} className="flex max-w-[42ch] flex-col">
          <p className="mono text-[13px] text-ink/30">
            {String(i + 1).padStart(2, "0")}
          </p>
          <p className="mt-3 text-[17px] font-medium text-ink">{item.title}</p>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink/45">
            {item.body}
          </p>
          {item.chips?.length ? (
            <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
              {item.chips.map((chip) => (
                <span
                  key={chip}
                  className="mono rounded border border-ink/[0.1] px-1.5 py-1 text-[12px] text-ink/40"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function DocLinkList({
  items,
}: {
  items: { href: string; title: string; body: string; step?: string }[];
}) {
  return (
    <ol className="grid gap-x-12 gap-y-10 sm:grid-cols-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className="group block h-full">
            {item.step ? (
              <p className="mono text-[13px] text-ink/30">{item.step}</p>
            ) : null}
            <p
              className={cn(
                "text-[17px] font-medium text-ink",
                item.step && "mt-3",
              )}
            >
              {item.title}
              <span
                aria-hidden
                className="ml-1.5 inline-block text-ink/30 transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </p>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink/45">
              {item.body}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Definition rows — the landing FAQ's divider construction, in two columns. */
export function DocTable({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <ul className="max-w-2xl divide-y divide-ink/[0.07]">
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-8"
        >
          <span className="mono w-40 shrink-0 text-[13px] text-ink/85">
            {r.label}
          </span>
          <span className="min-w-0 text-[15px] leading-relaxed text-ink/45">
            {r.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DocCtas({
  primary,
  secondary,
}: {
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <CtaButtonRow>
      <CtaButton href={primary.href} variant="primary">
        {primary.label}
      </CtaButton>
      {secondary ? (
        <CtaButton href={secondary.href} variant="secondary">
          {secondary.label}
        </CtaButton>
      ) : null}
    </CtaButtonRow>
  );
}

export function DocFlow({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="relative flex gap-4 border-l border-ink/[0.07] pb-8 pl-6 last:pb-0"
        >
          <span className="absolute -left-[3px] top-2 size-[5px] rounded-full bg-ink/40" />
          <div className="min-w-0 max-w-2xl space-y-1.5">
            <p className="mono text-[13px] text-ink/30">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="text-[17px] font-medium text-ink">{step.title}</p>
            <p className="text-[15px] leading-relaxed text-ink/45">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DocDoDont({
  doItems,
  dontItems,
}: {
  doItems: string[];
  dontItems: string[];
}) {
  return (
    <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
      {(
        [
          ["Do", doItems, "text-accent", "bg-ink/30"],
          ["Don't", dontItems, "text-ink/40", "bg-ink/15"],
        ] as const
      ).map(([label, items, tone, dot]) => (
        <div key={label} className="max-w-[42ch]">
          <p className={cn("text-[13px] font-medium", tone)}>{label}</p>
          <ul className="mt-4 space-y-2">
            {items.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[15px] leading-relaxed text-ink/45"
              >
                <span
                  className={cn("mt-[9px] size-1 shrink-0 rounded-full", dot)}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function DocCards({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  return (
    <ul className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="max-w-[42ch]">
          <p className="text-[17px] font-medium text-ink">{item.title}</p>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink/45">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function DocList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="max-w-2xl space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-[15px] leading-relaxed text-ink/45"
        >
          <span className="mt-[9px] size-1 shrink-0 rounded-full bg-ink/30" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** @deprecated use DocSection */
export function DocH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-ink sm:text-[30px]">
      {children}
    </h2>
  );
}
