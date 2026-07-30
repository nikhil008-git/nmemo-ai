"use client";

/**
 * The app chrome: an icon rail, a tab row, and the page.
 *
 * There used to be a second 14rem sidebar here listing an Inbox, a catalog of
 * ten sources, a "View" group, and a pipeline roadmap — all of it from the
 * Context Engine era, most of it duplicating /connectors or naming things that
 * do not exist. It is gone. Navigation is now the real routes only, and the
 * dashboard's own sessions rail is the only rail on the dashboard.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Plug,
  Settings,
  Terminal,
  FileText,
  X,
} from "lucide-react";

import { ReactLenis } from "lenis/react";

import {
  CommandSearch,
  SearchTrigger,
  type CommandItem,
} from "@/components/app/command-search";
import { AppShellSkeleton } from "@/components/ui/loading-states";
import { ConnectorsProvider } from "@/lib/connectors-store";
import { getWorkspace } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Every destination in the app, once. The icon rail, the tab row, the mobile
 * drawer, and the command palette all read from this list, so a route can never
 * appear in one and be missing from another.
 */
const nav = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    hint: "Sessions, task, and the context behind it",
  },
  {
    href: "/playground",
    icon: Terminal,
    label: "Playground",
    hint: "Ask a question and watch context get selected",
  },
  {
    href: "/sources",
    icon: FileText,
    label: "Sources",
    hint: "Documents and workspace knowledge",
  },
  {
    href: "/connectors",
    icon: Plug,
    label: "Connectors",
    hint: "Memory, Slack, Notion, GitHub",
  },
  {
    href: "/keys",
    icon: KeyRound,
    label: "API keys",
    hint: "Keys for the SDK and the CLI",
  },
  {
    href: "/home",
    icon: ListChecks,
    label: "Setup",
    hint: "Onboarding checklist for this workspace",
  },
  {
    href: "/docs/sdk",
    icon: BookOpen,
    label: "Docs",
    hint: "SDK, connectors, and API reference",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    hint: "Workspace, IDs, and account",
  },
] as const;

/** Routes that own their own scrolling — the shell must not pad or Lenis them. */
const FULL_BLEED = ["/dashboard", "/playground"];

function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  return nav.find((item) => navActive(pathname, item.href))?.label ?? "nmemo";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  useEffect(() => {
    if (isPending || !session?.user) return;
    if (pathname === "/create-workspace") return;

    let cancelled = false;
    void getWorkspace()
      .then(() => {
        /* workspace exists */
      })
      .catch(() => {
        if (!cancelled) router.replace("/create-workspace");
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, session, router, pathname]);

  if (isPending || !session?.user) {
    return <AppShellSkeleton />;
  }

  return (
    <ConnectorsProvider userId={session.user.id}>
      <AppShellChrome
        userName={session.user.name || "Workspace"}
        pathname={pathname}
      >
        {children}
      </AppShellChrome>
    </ConnectorsProvider>
  );
}

function AppShellChrome({
  userName,
  pathname,
  children,
}: {
  userName: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const commandItems = useMemo<CommandItem[]>(
    () =>
      nav.map((item) => ({
        id: `page-${item.href}`,
        label: item.label,
        hint: item.hint,
        href: item.href,
        group: "Pages" as const,
      })),
    [],
  );

  const fullBleed = FULL_BLEED.some((href) => navActive(pathname, href));
  const title = pageTitle(pathname);

  return (
    <div className="product-shell fixed inset-0 z-40 flex flex-col overflow-hidden bg-surface text-foreground">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Icon rail. `bg-rail`, not a neutral step — the ramp inverts in dark,
            the rail doesn't. */}
        <aside className="hidden w-12 shrink-0 flex-col items-center gap-2 bg-rail py-3 md:flex">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex size-8 items-center justify-center rounded-sm transition-colors",
                  active
                    ? "bg-ink/15 text-ink"
                    : "text-neutral-400 hover:bg-ink/10 hover:text-ink",
                )}
                aria-label={item.label}
                title={item.label}
              >
                <Icon size={16} strokeWidth={1.75} />
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-auto w-full border-t border-ink/10 pt-3 text-[0.5625rem] font-semibold uppercase tracking-widest text-neutral-500 transition-colors hover:text-ink"
          >
            Out
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-surface">
          {/* Mobile header — tap the title to open the nav drawer */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="min-w-0 flex-1 rounded-sm px-1 py-1 text-left hover:bg-foreground/5"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span className="flex items-center gap-1.5">
                <span className="font-heading truncate text-sm font-semibold tracking-[-0.02em]">
                  {userName}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "shrink-0 text-neutral-400 transition-transform",
                    menuOpen && "rotate-180",
                  )}
                />
              </span>
              <span className="block truncate text-[10px] font-semibold text-neutral-500">
                {title}
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <SearchTrigger onClick={() => setSearchOpen(true)} />
            </div>
          </div>

          {/* Desktop tabs */}
          <div className="hidden items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4 md:flex">
            <div className="flex items-center gap-4 overflow-x-auto">
              {nav.map((item) => {
                const active = navActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 pb-2 pt-1 font-heading text-xs font-semibold tracking-[-0.01em] transition-colors",
                      active
                        ? "border-b-2 border-foreground text-foreground"
                        : "text-neutral-500 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          <div className="relative min-h-0 flex-1">
            {fullBleed ? (
              <div className="relative z-[1] h-full min-h-0 overflow-hidden bg-transparent p-0">
                {children}
              </div>
            ) : (
              <ReactLenis
                className="relative z-[1] h-full min-h-0 overflow-auto bg-transparent p-4 sm:p-6"
                options={{ autoRaf: true }}
              >
                {children}
              </ReactLenis>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" id="mobile-nav-drawer">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(18rem,86vw)] flex-col bg-surface-soft shadow-[8px_0_40px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="min-w-0"
              >
                <p className="font-heading truncate text-sm font-semibold tracking-[-0.02em]">
                  {userName}
                </p>
                <p className="truncate text-[10px] font-semibold text-neutral-500">
                  Workspace &amp; IDs →
                </p>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-sm text-neutral-500 hover:bg-foreground/5 hover:text-foreground"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-auto p-2" data-lenis-prevent>
              <ul className="space-y-0.5">
                {nav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-start gap-2.5 rounded-sm px-2 py-2 text-left hover:bg-foreground/5",
                          navActive(pathname, item.href) &&
                            "bg-foreground/10",
                        )}
                      >
                        <Icon
                          size={14}
                          strokeWidth={1.75}
                          className="mt-0.5 shrink-0 text-neutral-500"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-medium leading-snug text-neutral-500">
                            {item.hint}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-border px-2 py-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-neutral-500 hover:bg-foreground/5 hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CommandSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        items={commandItems}
      />
    </div>
  );
}
