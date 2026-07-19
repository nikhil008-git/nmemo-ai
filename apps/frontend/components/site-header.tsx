"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ComingSoonBanner } from "@/components/app/coming-soon-banner";
import { Logo } from "@/components/logo";
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
  const [compact, setCompact] = useState(false);
  const loggedIn = Boolean(session?.user);
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isAppShell =
    pathname === "/home" ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/sources") ||
    pathname.startsWith("/connectors") ||
    pathname.startsWith("/keys") ||
    pathname.startsWith("/settings");

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // App shell has its own chrome — marketing header stays for / and docs.
  if (isAuthPage || isAppShell) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <ComingSoonBanner storageKey="nmemo:dismiss-coming-soon-banner-site" />
      <header
        className={cn(
          "px-4 transition-[padding] duration-300 ease-out sm:px-6",
          compact ? "pt-3" : "pt-0",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-6xl items-center justify-between gap-3 transition-all duration-300 ease-out md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4",
            compact
              ? "rounded-full bg-white px-3 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:px-5 sm:py-3"
              : "bg-transparent py-3 sm:py-4",
          )}
        >
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

          <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end text-sm font-semibold sm:gap-4">
            {isPending ? (
              <div className="flex items-center gap-2 sm:gap-3" aria-hidden>
                <Skeleton className="hidden h-4 w-16 sm:block" />
                <Skeleton className="h-8 w-20 rounded-md sm:w-28" />
              </div>
            ) : loggedIn ? (
              <CtaButton
                href="/home"
                size="compact"
                className="!min-w-0 px-3 sm:!min-w-36 sm:px-5"
              >
                Open app
              </CtaButton>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
                <CtaButton
                  href="/sign-up"
                  size="compact"
                  className="!min-w-0 px-3 sm:!min-w-36 sm:px-5"
                >
                  Book demo
                </CtaButton>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
