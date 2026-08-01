"use client";

/** The logged-in workspace chrome: one useful sidebar and the current page. */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { ReactLenis } from "lenis/react";

import {
  CommandSearch,
  SearchTrigger,
  type CommandItem,
} from "@/components/app/command-search";
import { LayeredRoleLogo } from "@/components/layered-role-logo";
import {
  ConnectorsRoleIcon,
  DocsRoleIcon,
  KeysRoleIcon,
  PlaygroundRoleIcon,
  SettingsRoleIcon,
  SourcesRoleIcon,
} from "@/components/layered-role-icons";
import { AppShellSkeleton } from "@/components/ui/loading-states";
import { ConnectorsProvider, useConnectors } from "@/lib/connectors-store";
import {
  ApiError,
  prefetchAuthenticatedData,
  setApiCacheScope,
  type Workspace,
} from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

/**
 * Every destination in the app, once. The icon rail, the tab row, the mobile
 * drawer, and the command palette all read from this list, so a route can never
 * appear in one and be missing from another.
 */
const nav = [
  {
    href: "/home",
    icon: LayeredRoleLogo,
    label: "Dashboard",
    hint: "Workspace setup and context status",
  },
  {
    href: "/playground",
    icon: PlaygroundRoleIcon,
    label: "Playground",
    hint: "Ask a question and watch context get selected",
  },
  {
    href: "/sources",
    icon: SourcesRoleIcon,
    label: "Sources",
    hint: "Documents and workspace knowledge",
  },
  {
    href: "/connectors",
    icon: ConnectorsRoleIcon,
    label: "Connectors",
    hint: "Memory, Slack, Notion, GitHub",
  },
  {
    href: "/keys",
    icon: KeysRoleIcon,
    label: "API keys",
    hint: "Keys for the SDK and Context API",
  },
  {
    href: "/docs/sdk",
    icon: DocsRoleIcon,
    label: "Docs",
    hint: "SDK, connectors, and API reference",
  },
  {
    href: "/settings",
    icon: SettingsRoleIcon,
    label: "Settings",
    hint: "Workspace, IDs, and account",
  },
] as const;

/** Routes that own their own scrolling — the shell must not pad or Lenis them. */
const FULL_BLEED = ["/playground"];

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
  const [workspaceReadyFor, setWorkspaceReadyFor] = useState<string | null>(
    null,
  );
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const checkingUser = useRef<string | null>(null);

  const userId = session?.user?.id ?? null;
  if (userId) setApiCacheScope(userId);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  useEffect(() => {
    if (isPending || !userId || checkingUser.current === userId) return;

    checkingUser.current = userId;
    setWorkspace(null);

    let cancelled = false;
    void prefetchAuthenticatedData()
      .then((nextWorkspace) => {
        if (!cancelled) {
          setWorkspace(nextWorkspace);
          setWorkspaceReadyFor(userId);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const missing =
          (err instanceof ApiError && err.status === 404) ||
          (err instanceof Error && /no workspace/i.test(err.message));
        if (missing) {
          router.replace("/create-workspace");
          return;
        }

        // A temporary API failure must not misclassify an existing user as new.
        // Let the destination render its own useful error state.
        setWorkspaceReadyFor(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [isPending, userId, router]);

  if (isPending || !session?.user || workspaceReadyFor !== session.user.id) {
    return <AppShellSkeleton />;
  }

  return (
    <ConnectorsProvider
      userId={session.user.id}
      initialConnectors={workspace?.connectors}
    >
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
  const { connectors } = useConnectors();
  const connectedTypes = connectors
    .filter((connector) => connector.status === "connected")
    .map((connector) => connector.type);
  const connectedCount = new Set(connectedTypes).size;

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
    <div className="product-shell app-shell-zoom fixed inset-0 z-40 flex flex-col overflow-hidden bg-surface text-foreground">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <WorkspaceSidebar
          userName={userName}
          pathname={pathname}
          connectedTypes={connectedTypes}
          connectedCount={connectedCount}
        />

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

          <WorkspacePageHeader
            title={title}
            onSearch={() => setSearchOpen(true)}
          />

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

            <nav
              className="min-h-0 flex-1 overflow-auto p-2"
              data-lenis-prevent
            >
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
                          navActive(pathname, item.href) && "bg-foreground/10",
                        )}
                      >
                        <Icon className="mt-0.5 shrink-0 text-neutral-500" />
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

export function WorkspaceSidebar({
  userName,
  pathname,
  connectedTypes,
  connectedCount,
  demo = false,
  forceDesktop = false,
}: {
  userName: string;
  pathname: string;
  connectedTypes: readonly string[];
  connectedCount: number;
  demo?: boolean;
  forceDesktop?: boolean;
}) {
  return (
    <aside
      className={cn(
        "hidden w-56 shrink-0 flex-col border-r border-ink/[0.07] bg-rail px-3 py-4 md:flex",
        forceDesktop && "flex",
      )}
    >
      <Link href="/settings" className="px-2">
        <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink/90">
          {userName}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-ink/35">
          Workspace &amp; IDs →
        </p>
      </Link>

      <SidebarGroup label="Inbox" className="mt-7">
        <SidebarLink
          href="/home"
          label="All sources"
          pathname={pathname}
          count={connectedCount || undefined}
        />
      </SidebarGroup>

      <SidebarGroup label="Sources" className="mt-6">
        <SidebarLink
          href="/sources"
          label="Documents"
          pathname={pathname}
          dot="bg-status-warn"
        />
        <SidebarLink
          href="/connectors"
          label="Slack"
          pathname={pathname}
          dot="bg-status-bad"
          connected={connectedTypes.includes("slack")}
        />
        <SidebarLink
          href="/connectors"
          label="Notion"
          pathname={pathname}
          dot="bg-status-info"
          connected={connectedTypes.includes("notion")}
        />
        <SidebarLink
          href="/connectors"
          label="GitHub"
          pathname={pathname}
          dot="bg-status-ok"
          connected={connectedTypes.includes("github")}
        />
        <SidebarLink
          href="/connectors"
          label="Memory"
          pathname={pathname}
          dot="bg-status-alt"
          connected={connectedTypes.includes("mem0")}
        />
      </SidebarGroup>

      <SidebarGroup label="View" className="mt-6">
        <SidebarLink
          href="/playground"
          label="Playground"
          pathname={pathname}
        />
        <SidebarLink href="/keys" label="Keys" pathname={pathname} />
        <SidebarLink href="/docs/sdk" label="Docs" pathname={pathname} />
      </SidebarGroup>

      <div className="mt-auto space-y-1 border-t border-ink/[0.07] pt-3">
        <SidebarLink href="/settings" label="Settings" pathname={pathname} />
        <button
          type="button"
          onClick={() => {
            if (!demo) void signOut();
          }}
          className="w-full rounded-md px-2 py-1.5 text-left text-[12px] font-medium text-ink/35 transition-colors hover:bg-ink/[0.04] hover:text-ink/70"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function WorkspacePageHeader({
  title,
  onSearch,
  forceDesktop = false,
}: {
  title: string;
  onSearch?: () => void;
  forceDesktop?: boolean;
}) {
  return (
    <div
      className={cn(
        "hidden h-12 items-center justify-between gap-2 border-b border-border px-5 md:flex",
        forceDesktop && "flex",
      )}
    >
      <p className="text-[13px] font-semibold tracking-[-0.015em] text-ink/80">
        {title}
      </p>
      <SearchTrigger onClick={onSearch ?? (() => undefined)} />
    </div>
  );
}

function SidebarGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/25">
        {label}
      </p>
      <div className="mt-2 space-y-0.5">{children}</div>
    </section>
  );
}

function SidebarLink({
  href,
  label,
  pathname,
  count,
  dot,
  connected,
}: {
  href: string;
  label: string;
  pathname: string;
  count?: number;
  dot?: string;
  connected?: boolean;
}) {
  const active = !dot && navActive(pathname, href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[12px] font-medium transition-colors",
        active
          ? "bg-ink/[0.07] text-ink/90"
          : "text-ink/50 hover:bg-ink/[0.04] hover:text-ink/80",
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dot)} /> : null}
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className="ml-auto text-[11px] text-ink/30">{count}</span>
      ) : connected ? (
        <span className="ml-auto text-[10px] text-status-ok/70">on</span>
      ) : null}
    </Link>
  );
}
