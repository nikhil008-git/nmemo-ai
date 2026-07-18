"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { CtaButton } from "@/components/ui/cta-button";
import { signOut, useSession } from "@/lib/auth-client";

const marketingNav = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/playground", label: "Playground" },
  { href: "/docs/sdk", label: "SDK" },
] as const;

const appNav = [
  { href: "/home", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/sources", label: "Sources" },
  { href: "/connectors", label: "Connectors" },
  { href: "/keys", label: "API" },
  { href: "/docs", label: "Docs" },
  { href: "/settings", label: "Settings" },
] as const;

export function SiteHeader() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const loggedIn = Boolean(session?.user);
  const isAuthPage =
    pathname === "/sign-in" || pathname === "/sign-up";
  const isAppShell =
    pathname === "/home" ||
    pathname.startsWith("/playground") ||
    pathname.startsWith("/sources") ||
    pathname.startsWith("/connectors") ||
    pathname.startsWith("/keys") ||
    pathname.startsWith("/settings");
  const isAuthedDocs =
    Boolean(session?.user) &&
    (pathname === "/docs" || pathname.startsWith("/docs/"));

  if (isAuthPage || isAppShell || isAuthedDocs) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href={loggedIn ? "/home" : "/"}
          className="inline-flex shrink-0 items-center gap-2.5 font-heading font-semibold tracking-tight text-foreground"
        >
          <Logo size={28} priority className="rounded-[6px]" />
          <span>nmemo</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-4 overflow-x-auto text-sm font-medium text-muted-foreground sm:gap-6 sm:justify-center">
          {(loggedIn ? appNav : marketingNav).map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 transition-colors hover:text-foreground ${
                  active ? "text-secondary" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-4 text-sm font-medium">
          {isPending ? (
            <span className="text-muted-foreground">…</span>
          ) : loggedIn ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <CtaButton href="/sign-up" size="compact">
                Get started
              </CtaButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
