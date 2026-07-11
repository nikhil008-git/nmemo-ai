"use client";

import Link from "next/link";

import { Logo } from "@/components/logo";

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#docs", label: "Docs" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-foreground"
        >
          <Logo size={28} priority className="rounded-[6px]" />
          <span>nmemo ai</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4 text-sm font-medium">
          <Link
            href="/sign-in"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-3.5 py-2 text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
