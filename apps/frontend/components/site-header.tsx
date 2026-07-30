"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ComingSoonBanner } from "@/components/app/coming-soon-banner";
import { GitHub } from "@/components/landing/icons";
import { Logo } from "@/components/logo";
import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { REPO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Anchors on the landing page, in the order the page argues them. */
const marketingNav = [
  { href: "/#memory", label: "Memory" },
  { href: "/#receipts", label: "Receipts" },
  { href: "/#resume", label: "Resume" },
  { href: "/docs", label: "Docs" },
] as const;

export function SiteHeader() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const loggedIn = Boolean(session?.user);
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/create-workspace";
  const isAppShell =
    pathname === "/home" ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/sources") ||
    pathname.startsWith("/connectors") ||
    pathname.startsWith("/keys") ||
    pathname.startsWith("/settings");

  // App shell has its own chrome — marketing header stays for / and docs.
  if (isAuthPage || isAppShell) return null;

  return (
    // Sits in flow, not fixed — it scrolls away with the page.
    <div className="relative z-50 w-full">
      <ComingSoonBanner storageKey="nmemo:dismiss-coming-soon-banner-site" />
      <header className="bg-background">
        <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center gap-6 px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-[13px] font-medium tracking-tight text-white"
          >
            <Logo size={16} className="rounded-[4px]" />
            <span>nmemo</span>
          </Link>

          <nav className="mx-auto hidden items-center gap-6 text-[13px] text-white/50 md:flex">
            {marketingNav.map((item) => {
              const active =
                !item.href.startsWith("/#") &&
                (pathname === item.href ||
                  pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 transition-colors hover:text-white",
                    active && "text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="nmemo on GitHub"
              className="rounded-full p-1.5 text-white/50 transition-colors hover:text-white"
            >
              <GitHub className="size-4" />
            </a>

            {isPending ? (
              <div className="flex items-center gap-2" aria-hidden>
                <Skeleton className="hidden h-4 w-14 sm:block" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            ) : loggedIn ? (
              <CtaButton href="/create-workspace" size="compact">
                Open the workspace
              </CtaButton>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden px-2 text-[13px] text-white/60 transition-colors hover:text-white sm:block"
                >
                  Sign in
                </Link>
                <CtaButton href="/sign-up" size="compact">
                  Get started
                </CtaButton>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
