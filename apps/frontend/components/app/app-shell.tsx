"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Filter,
  Home,
  Inbox,
  Search,
  Settings,
  SortAsc,
  Sparkles,
  Star,
} from "lucide-react";

import { getConnectors, type Connector } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const rail = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/playground", icon: Star, label: "Playground" },
  { href: "/connectors", icon: Inbox, label: "Connectors" },
  { href: "/sources", icon: Bell, label: "Sources" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

const tabs = [
  { href: "/home", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/sources", label: "Sources" },
  { href: "/connectors", label: "Connectors" },
  { href: "/keys", label: "API" },
  { href: "/docs", label: "Docs" },
  { href: "/settings", label: "Settings" },
] as const;

const sourceCatalog = [
  { type: "qdrant", name: "Documents", tone: "bg-orange-400", href: "/sources" },
  { type: "slack", name: "Slack", tone: "bg-pink-400", href: "/connectors" },
  { type: "notion", name: "Notion", tone: "bg-sky-400", href: "/connectors" },
  { type: "github", name: "GitHub", tone: "bg-emerald-400", href: "/connectors" },
  { type: "mem0", name: "mem0", tone: "bg-lime-400", href: "/connectors" },
  { type: "mcp", name: "MCP", tone: "bg-violet-400", href: "/connectors" },
] as const;

function tabActive(pathname: string, href: string) {
  if (href === "/docs") {
    return pathname === "/docs" || pathname.startsWith("/docs/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  useEffect(() => {
    if (!session?.user) return;
    void getConnectors()
      .then((r) => setConnectors(r.connectors))
      .catch(() => setConnectors([]));
  }, [session?.user]);

  const connected = useMemo(
    () => connectors.filter((c) => c.status === "connected"),
    [connectors],
  );

  if (isPending || !session?.user) {
    return (
      <p className="mt-8 text-center text-muted-foreground">Loading…</p>
    );
  }

  const { user } = session;
  const railIndex = Math.max(
    0,
    rail.findIndex((item) => tabActive(pathname, item.href)),
  );

  return (
    <div className="fixed inset-0 z-40 flex overflow-hidden bg-white">
      {/* Thin dark rail */}
      <aside className="flex w-12 shrink-0 flex-col items-center gap-3 bg-neutral-900 py-3">
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
      </aside>

      {/* Light sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-neutral-50">
        <div className="flex items-center justify-between px-3 py-3">
          <p className="truncate text-sm font-semibold">
            {user.name || "Workspace"}
          </p>
          <Link
            href="/playground"
            className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[10px] font-semibold text-foreground"
          >
            <Sparkles size={11} className="text-secondary" />
            Ask
          </Link>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-2 pb-3">
          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Inbox
            </p>
            <ul className="mt-1 space-y-0.5">
              <li>
                <Link
                  href="/connectors"
                  className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-black/5"
                >
                  <span>All sources</span>
                  <span className="text-[10px] text-muted-foreground">
                    {connected.length}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/home"
                  className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-black/5"
                >
                  <span>My context</span>
                  <span className="text-[10px] text-muted-foreground">0</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Sources
            </p>
            <ul className="mt-1 space-y-0.5">
              {sourceCatalog.map((item) => {
                const on = connectors.some(
                  (c) => c.type === item.type && c.status === "connected",
                );
                return (
                  <li key={item.type}>
                    <Link
                      href={item.href}
                      className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-black/5"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            on ? item.tone : "bg-neutral-300",
                          )}
                        />
                        {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {on ? 1 : 0}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              View
            </p>
            <ul className="mt-1 space-y-0.5">
              {[
                { href: "/playground", name: "Playground" },
                { href: "/keys", name: "Keys" },
                { href: "/docs", name: "Docs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-medium hover:bg-black/5",
                      tabActive(pathname, item.href)
                        ? "bg-secondary/10 text-secondary"
                        : "text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-neutral-400" />
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">0</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border px-2 py-2">
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-muted-foreground hover:bg-black/5 hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main pane */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            {tabs.map((t) => {
              const active = tabActive(pathname, t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "shrink-0 pb-2 pt-1 text-xs font-semibold transition-colors",
                    active
                      ? "border-b-2 border-foreground text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-black/5 hover:text-foreground"
            >
              <SortAsc size={12} />
              Sort
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-black/5 hover:text-foreground"
            >
              <Filter size={12} />
              Filter
            </button>
            <label className="flex items-center gap-1.5 rounded-sm border border-border bg-neutral-50 px-2 py-1">
              <Search size={12} className="text-muted-foreground" />
              <input
                type="search"
                placeholder="Search"
                className="w-28 bg-transparent text-[11px] font-medium outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded-sm border border-border bg-white px-1 text-[9px] font-semibold text-muted-foreground">
                F
              </kbd>
            </label>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-white p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
