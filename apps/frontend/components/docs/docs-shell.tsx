"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LandingFooter } from "@/components/landing/landing-footer";
import {
  NmemoTraceBackdrop,
  TraceDivider,
  TraceRule,
} from "@/components/brand/nmemo-traces";
import { CtaButton, CtaButtonRow } from "@/components/ui/cta-button";
import { cn } from "@/lib/utils";

const docsNav = [
  { href: "/docs", label: "Overview", match: (p: string) => p === "/docs" },
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

function GridBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      aria-hidden
    />
  );
}

function DocsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap items-center gap-1 border-b border-neutral-200/80 pb-4"
      aria-label="Documentation"
    >
      {docsNav.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-neutral-500 hover:bg-foreground/5 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
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
    <main className="relative flex flex-1 flex-col overflow-hidden text-foreground">
      <GridBackdrop />
      <NmemoTraceBackdrop variant="docs" />

      <section className="relative z-[1] mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-28 sm:pt-32">
        <DocsNav />

        <header className="mt-10 min-w-0 max-w-2xl space-y-3 sm:mt-12">
          <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl md:text-[2.35rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-xl text-sm font-semibold leading-relaxed text-neutral-500">
              {subtitle}
            </p>
          ) : null}
        </header>

        <article className="mt-10 w-full space-y-12 sm:mt-12">
          {children}
        </article>
      </section>

      <TraceDivider className="relative z-[1]" />

      <LandingFooter />
    </main>
  );
}

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
      <div className="min-w-0 max-w-2xl">
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] leading-[1.2] sm:text-2xl">
          {title}
          {muted ? (
            <span className="mt-1 block font-semibold text-neutral-400">
              {muted}
            </span>
          ) : null}
        </h2>
        <TraceRule className="mt-3 opacity-60" />
      </div>
      {children ? <div className="mt-5 space-y-4">{children}</div> : null}
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
        "max-w-xl text-sm font-semibold leading-relaxed text-neutral-500",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function DocCode({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption?: string;
}) {
  return (
    <div className="overflow-hidden rounded-sm bg-code-bg text-code-fg">
      {caption ? (
        <div className="flex items-center justify-between px-4 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
            {caption}
          </p>
          <span className="text-[11px] font-medium text-neutral-500">nmemo</span>
        </div>
      ) : null}
      <pre className="overflow-x-auto px-4 pb-4 text-[12.5px] leading-relaxed sm:px-5 sm:pb-5 sm:text-[13px]">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

export function DocLinkList({
  items,
}: {
  items: { href: string; title: string; body: string; step?: string }[];
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="block rounded-sm bg-neutral-100 px-5 py-5 transition-colors hover:bg-neutral-200/70"
          >
            {item.step ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                {item.step}
              </p>
            ) : null}
            <p
              className={cn(
                "font-heading text-[15px] font-semibold text-foreground",
                item.step && "mt-1.5",
              )}
            >
              {item.title}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-neutral-500">
              {item.body}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function DocTable({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-8"
        >
          <span className="w-36 shrink-0 text-sm font-semibold text-foreground">
            {r.label}
          </span>
          <span className="min-w-0 text-sm font-medium leading-relaxed text-neutral-500">
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
    <CtaButtonRow className="max-w-md">
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
          className="relative flex gap-4 border-l border-neutral-200 pb-8 pl-6 last:pb-0"
        >
          <span className="absolute -left-[7px] top-0 size-3.5 rounded-full border-2 border-background bg-foreground" />
          <div className="min-w-0 max-w-xl space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="text-sm font-medium leading-relaxed text-neutral-500">
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
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-sm bg-neutral-100 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
          Do
        </p>
        <ul className="mt-3 space-y-2.5">
          {doItems.map((item) => (
            <li
              key={item}
              className="text-sm font-medium leading-relaxed text-neutral-600"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-sm bg-neutral-100 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700">
          Don&apos;t
        </p>
        <ul className="mt-3 space-y-2.5">
          {dontItems.map((item) => (
            <li
              key={item}
              className="text-sm font-medium leading-relaxed text-neutral-600"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DocCards({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-sm bg-neutral-100 px-5 py-5"
        >
          <p className="font-heading text-[15px] font-semibold text-foreground">
            {item.title}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-neutral-500">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function DocList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="max-w-xl space-y-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-2.5 text-sm font-medium leading-relaxed text-neutral-500"
        >
          <span className="mt-2 size-1 shrink-0 rounded-full bg-neutral-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** @deprecated use DocSection */
export function DocH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] leading-[1.2] sm:text-2xl">
      {children}
    </h2>
  );
}
