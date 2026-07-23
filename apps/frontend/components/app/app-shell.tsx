"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  Bell,
  ChevronDown,
  Home,
  Inbox,
  Languages,
  Mic,
  Settings,
  Star,
  X,
} from "lucide-react";

import { ReactLenis } from "lenis/react";

import { AppTraceBackdrop } from "@/components/brand/nmemo-traces";
import { ComingSoonBanner } from "@/components/app/coming-soon-banner";
import {
  CommandSearch,
  SearchTrigger,
  type CommandItem,
} from "@/components/app/command-search";
import { RoadmapSidebar } from "@/components/app/roadmap-sidebar";
import { AppShellSkeleton } from "@/components/ui/loading-states";
import {
  ConnectorsProvider,
  useConnectors,
} from "@/lib/connectors-store";
import type { Connector } from "@/lib/api";
import { getWorkspace } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const rail = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/playground", icon: Star, label: "Playground" },
  { href: "/connectors", icon: Inbox, label: "Connectors" },
  { href: "/sources", icon: Bell, label: "Sources" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

/** Upcoming capabilities, rail icons open a banner pop, not a route. */
const upcomingRail = [
  {
    id: "voice",
    icon: Mic,
    label: "Voice",
    message: "Voice context is next, low-latency turns for live agents.",
  },
  {
    id: "realtime",
    icon: AudioLines,
    label: "Real-time",
    message: "Real-time turns are next, stream context as the conversation moves.",
  },
  {
    id: "languages",
    icon: Languages,
    label: "Languages",
    message: "Multi-language context is next, same getContext() across locales.",
  },
] as const;

const tabs = [
  { href: "/home", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/sources", label: "Sources" },
  { href: "/connectors", label: "Connectors" },
  { href: "/keys", label: "API" },
  { href: "/docs/sdk", label: "SDK" },
  { href: "/settings", label: "Settings" },
] as const;

const sourceCatalog = [
  { type: "qdrant", name: "Documents", tone: "bg-stone-500", href: "/sources" },
  { type: "slack", name: "Slack", tone: "bg-pink-400", href: "/connectors" },
  { type: "notion", name: "Notion", tone: "bg-sky-400", href: "/connectors" },
  { type: "github", name: "GitHub", tone: "bg-emerald-400", href: "/connectors" },
  { type: "mem0", name: "mem0", tone: "bg-lime-400", href: "/connectors" },
  { type: "mcp", name: "MCP", tone: "bg-violet-400", href: "/connectors", soon: true },
  { type: "gmail", name: "Gmail / Drive", tone: "bg-red-400", href: "/connectors", soon: true },
  { type: "linear", name: "Linear / Jira", tone: "bg-blue-400", href: "/connectors", soon: true },
  { type: "sql", name: "SQL", tone: "bg-cyan-400", href: "/connectors", soon: true },
  { type: "crm", name: "CRM", tone: "bg-fuchsia-400", href: "/connectors", soon: true },
] as const;

function tabActive(pathname: string, href: string) {
  if (href === "/docs/sdk") {
    return pathname === "/docs/sdk" || pathname.startsWith("/docs/sdk/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string) {
  const hit = tabs.find((t) => tabActive(pathname, t.href));
  return hit?.label ?? "nmemo";
}

type NavBodyProps = {
  pathname: string;
  userName: string;
  connectedCount: number;
  connectors: Connector[];
  filteredSources: typeof sourceCatalog | typeof sourceCatalog[number][];
  onNavigate?: () => void;
  onSoon?: (message: string) => void;
  showRailLinks?: boolean;
};

function SidebarNavBody({
  pathname,
  userName,
  connectedCount,
  connectors,
  filteredSources,
  onNavigate,
  onSoon,
  showRailLinks = false,
}: NavBodyProps) {
  return (
    <>
      <div className="px-3 py-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="min-w-0 block"
        >
          <p className="font-heading truncate text-sm font-semibold tracking-[-0.02em]">
            {userName || "Workspace"}
          </p>
          <p className="truncate text-[10px] font-semibold text-neutral-500">
            Workspace & IDs →
          </p>
        </Link>
      </div>

      <div className="flex-1 space-y-4 overflow-auto px-2 pb-3" data-lenis-prevent>
        {showRailLinks ? (
          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Navigate
            </p>
            <ul className="mt-1 space-y-0.5">
              {rail.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs font-semibold hover:bg-black/5",
                        tabActive(pathname, item.href)
                          ? "bg-black/5 text-foreground"
                          : "text-foreground",
                      )}
                    >
                      <Icon size={14} strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              {upcomingRail.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSoon?.(item.message);
                        onNavigate?.();
                      }}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-xs font-semibold text-neutral-500 hover:bg-black/5 hover:text-foreground"
                    >
                      <Icon size={14} strokeWidth={1.75} />
                      {item.label}
                      <span className="ml-auto text-[10px]">Soon</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Inbox
          </p>
          <ul className="mt-1 space-y-0.5">
            <li>
              <Link
                href="/connectors"
                onClick={onNavigate}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold hover:bg-black/5",
                  tabActive(pathname, "/connectors")
                    ? "bg-black/5 text-foreground"
                    : "text-foreground",
                )}
              >
                <span>All sources</span>
                <span className="text-[10px] text-neutral-500">
                  {connectedCount}
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/home"
                onClick={onNavigate}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold hover:bg-black/5",
                  tabActive(pathname, "/home")
                    ? "bg-black/5 text-foreground"
                    : "text-foreground",
                )}
              >
                <span>My context</span>
                <span className="text-[10px] text-neutral-500">
                  {connectedCount}
                </span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Sources
          </p>
          <ul className="mt-1 space-y-0.5">
            {filteredSources.map((item) => {
              const soon = "soon" in item && item.soon;
              const on =
                !soon &&
                connectors.some(
                  (c) => c.type === item.type && c.status === "connected",
                );
              return (
                <li key={item.type}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-foreground hover:bg-black/5"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          on ? item.tone : "bg-neutral-300",
                          soon && "opacity-50",
                        )}
                      />
                      {item.name}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {soon ? "Soon" : on ? 1 : 0}
                    </span>
                  </Link>
                </li>
              );
            })}
            {filteredSources.length === 0 ? (
              <li className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400">
                No matches
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            View
          </p>
          <ul className="mt-1 space-y-0.5">
            {[
              { href: "/playground", name: "Playground" },
              { href: "/keys", name: "Keys" },
              { href: "/docs/sdk", name: "SDK" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold hover:bg-black/5",
                    tabActive(pathname, item.href)
                      ? "bg-black/5 text-foreground"
                      : "text-foreground",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-neutral-400" />
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <RoadmapSidebar compact />
      </div>

      <div className="border-t border-border px-2 py-2">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void signOut();
          }}
          className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-neutral-500 hover:bg-black/5 hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soonPop, setSoonPop] = useState<string | null>(null);

  useEffect(() => {
    if (!soonPop) return;
    const t = window.setTimeout(() => setSoonPop(null), 3200);
    return () => window.clearTimeout(t);
  }, [soonPop]);

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
        query={query}
        setQuery={setQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        soonPop={soonPop}
        setSoonPop={setSoonPop}
      >
        {children}
      </AppShellChrome>
    </ConnectorsProvider>
  );
}

function AppShellChrome({
  userName,
  pathname,
  query,
  setQuery,
  searchOpen,
  setSearchOpen,
  menuOpen,
  setMenuOpen,
  soonPop,
  setSoonPop,
  children,
}: {
  userName: string;
  pathname: string;
  query: string;
  setQuery: (q: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  soonPop: string | null;
  setSoonPop: (message: string | null) => void;
  children: React.ReactNode;
}) {
  const { connectors } = useConnectors();

  const connected = useMemo(
    () =>
      connectors.filter(
        (c) =>
          c.status === "connected" &&
          c.type !== "qdrant" &&
          c.type !== "groq",
      ),
    [connectors],
  );

  const q = query.trim().toLowerCase();
  const filteredSources = useMemo(
    () =>
      q
        ? sourceCatalog.filter((item) => item.name.toLowerCase().includes(q))
        : sourceCatalog,
    [q],
  );

  const commandItems = useMemo<CommandItem[]>(
    () => [
      ...tabs.map((t) => ({
        id: `page-${t.href}`,
        label: t.label,
        hint: t.href,
        href: t.href,
        group: "Pages" as const,
      })),
      ...sourceCatalog.map((s) => ({
        id: `source-${s.type}`,
        label: s.name,
        hint: "soon" in s && s.soon ? "Soon" : s.type,
        href: s.href,
        group: "Sources" as const,
      })),
    ],
    [],
  );

  const railIndex = Math.max(
    0,
    rail.findIndex((item) => tabActive(pathname, item.href)),
  );
  const onPlayground = tabActive(pathname, "/playground");
  const title = pageTitle(pathname);

  const navProps: NavBodyProps = {
    pathname,
    userName,
    connectedCount: connected.length,
    connectors,
    filteredSources,
    onSoon: setSoonPop,
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white">
      <ComingSoonBanner />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop icon rail */}
        <aside className="hidden w-12 shrink-0 flex-col items-center gap-3 bg-neutral-900 py-3 md:flex">
          {rail.map((item, i) => {
            const Icon = item.icon;
            const active = tabActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex size-8 items-center justify-center rounded-sm transition-colors",
                  active || railIndex === i
                    ? "bg-white/15 text-white"
                    : "text-neutral-400 hover:bg-white/10 hover:text-white",
                )}
                aria-label={item.label}
              >
                <Icon size={16} strokeWidth={1.75} />
              </Link>
            );
          })}

          <div className="mt-auto flex w-full flex-col items-center gap-2 border-t border-white/10 pt-3">
            {upcomingRail.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSoonPop(item.message)}
                  className="flex size-8 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={`${item.label}, coming soon`}
                  title={`${item.label}, coming soon`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Desktop sidebar */}
        <aside className="relative hidden w-56 shrink-0 flex-col border-r border-border bg-neutral-50 md:flex">
          <div
            className="pointer-events-none absolute bottom-8 right-4 top-16 w-px border-r border-dashed border-neutral-300/35"
            aria-hidden
          />
          <SidebarNavBody {...navProps} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Mobile header — tap title/workspace to open full nav */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="min-w-0 flex-1 rounded-sm px-1 py-1 text-left hover:bg-neutral-50"
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

            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          {/* Desktop tabs */}
          <div className="hidden items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4 md:flex">
            <div className="flex items-center gap-4 overflow-x-auto">
              {tabs.map((t) => {
                const active = tabActive(pathname, t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    className={cn(
                      "shrink-0 pb-2 pt-1 font-heading text-xs font-semibold tracking-[-0.01em] transition-colors",
                      active
                        ? "border-b-2 border-foreground text-foreground"
                        : "text-neutral-500 hover:text-foreground",
                    )}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          <div className="relative min-h-0 flex-1">
            <AppTraceBackdrop />

            {onPlayground ? (
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
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-neutral-50 shadow-[8px_0_40px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <p className="font-heading text-sm font-semibold tracking-[-0.02em]">
                Menu
              </p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex size-8 items-center justify-center rounded-sm text-neutral-500 hover:bg-black/5 hover:text-foreground"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <SidebarNavBody
                {...navProps}
                showRailLinks
                onNavigate={() => setMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <CommandSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        items={commandItems}
        onQueryChange={setQuery}
      />

      {soonPop ? (
        <div
          role="status"
          className="pointer-events-none absolute bottom-4 left-4 z-50 w-[min(18rem,calc(100vw-2rem))] rounded-sm border border-black/8 bg-neutral-900 px-3.5 py-2.5 text-[11px] font-medium leading-snug text-neutral-200 shadow-[0_12px_40px_rgba(0,0,0,0.28)] md:left-16"
        >
          <p className="font-heading text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
            Next up
          </p>
          <p className="mt-1 tracking-[-0.01em]">{soonPop}</p>
        </div>
      ) : null}
    </div>
  );
}
