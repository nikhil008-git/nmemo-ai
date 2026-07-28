"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ComingSoonBanner } from "@/components/app/coming-soon-banner";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const marketingNav = [
  { href: "/#product", label: "Product" },
  { href: "/docs", label: "Overview" },
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
      <header className="px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 bg-transparent py-3 sm:py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 justify-self-start font-heading text-[15px] font-semibold tracking-tight text-foreground sm:gap-2.5"
          >
            <Logo size={26} priority className="rounded-[6px]" />
            <span>nmemo</span>
          </Link>

          <nav className="hidden items-center justify-center gap-5 text-sm font-semibold text-muted-foreground md:flex lg:gap-6">
            {marketingNav.map((item) => {
              const active =
                item.href.startsWith("/#")
                  ? false
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 transition-colors hover:text-foreground",
                    active ? "text-foreground" : "",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end text-sm font-semibold sm:gap-3">
            <ThemeToggle />
            {isPending ? (
              <div className="flex items-center gap-2 sm:gap-3" aria-hidden>
                <Skeleton className="hidden h-4 w-16 sm:block" />
                <Skeleton className="h-8 w-20 rounded-md sm:w-28" />
              </div>
            ) : loggedIn ? (
              <CtaButton
                href="/create-workspace"
                size="compact"
                className="!min-w-0 px-3 sm:!min-w-36 sm:px-5"
              >
                Open app
              </CtaButton>
            ) : (
              <CtaButton
                href="/sign-in"
                size="compact"
                className="!min-w-0 px-3 sm:!min-w-36 sm:px-5"
              >
                Sign in
              </CtaButton>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
