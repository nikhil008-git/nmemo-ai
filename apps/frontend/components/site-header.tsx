"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GitHub } from "@/components/landing/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { REPO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

const marketingNav = [{ href: "/docs/sdk", label: "Docs" }] as const;

export function SiteHeader() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const loggedIn = Boolean(session?.user);
  const isAuthPage =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/create-workspace";
  const isAppShell =
    pathname.startsWith("/dashboard") ||
    pathname === "/home" ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/sources") ||
    pathname.startsWith("/connectors") ||
    pathname.startsWith("/keys") ||
    pathname.startsWith("/settings");

  // The app shell and the auth pages carry their own chrome.
  if (isAuthPage || isAppShell) return null;

  return (
    // Sits in flow, not fixed — it scrolls away with the page.
    <div className="relative z-50 w-full">
      <header className="bg-background">
        <div className="mx-auto flex h-14 w-full min-w-0 max-w-[1180px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-[13px] font-medium tracking-tight text-ink"
          >
            <Logo size={16} className="rounded-[4px]" />
            <span>nmemo</span>
          </Link>

          {/* Actions sit beside the logo; the section links close the row. */}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <ThemeToggle className="text-ink/50" />

            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="nmemo on GitHub"
              className="rounded-full p-1.5 text-ink/50 transition-colors hover:text-ink"
            >
              <GitHub className="size-4" />
            </a>

            {isPending ? (
              // One pill resolves here either way, so the placeholder is one pill.
              <Skeleton className="h-8 w-24 rounded-full" aria-hidden />
            ) : loggedIn ? (
              <span className="contents" data-backend-warmup>
                <CtaButton href="/home" size="compact">
                  <span className="hidden min-[420px]:inline">
                    Open the workspace
                  </span>
                  <span className="min-[420px]:hidden">Open</span>
                </CtaButton>
              </span>
            ) : (
              // Auth is OAuth only and `/sign-up` redirects to `/sign-in`, so
              // signing in and signing up are the same click. One pill.
              <span className="contents" data-backend-warmup>
                <CtaButton href="/sign-in" size="compact">
                  Get started
                </CtaButton>
              </span>
            )}
          </div>

          <nav className="ml-auto hidden items-center gap-6 text-[13px] text-ink/50 md:flex">
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
                    "shrink-0 transition-colors hover:text-ink",
                    active && "text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </div>
  );
}
