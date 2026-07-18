"use client";

import { Suspense, useState } from "react";
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

import { SignInForm } from "@/components/auth/sign-in-form";
import { cn } from "@/lib/utils";

const railIcons = [Home, Star, Inbox, Bell, Settings] as const;

const sourceGroups = [
  {
    label: "Sources",
    items: [
      { name: "Documents", tone: "bg-orange-400", count: 12 },
      { name: "Slack", tone: "bg-pink-400", count: 4 },
      { name: "Notion", tone: "bg-sky-400", count: 7 },
      { name: "GitHub", tone: "bg-emerald-400", count: 3 },
      { name: "mem0", tone: "bg-lime-400", count: 1 },
    ],
  },
  {
    label: "View",
    items: [
      { name: "Playground", tone: "bg-neutral-400", count: 0 },
      { name: "Keys", tone: "bg-neutral-400", count: 0 },
      { name: "Docs", tone: "bg-neutral-400", count: 0 },
    ],
  },
] as const;

const tabs = ["Sign in", "Playground", "Sources"] as const;

export function LandingPlayground({
  variant = "landing",
}: {
  variant?: "landing" | "auth";
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Sign in");
  const [rail, setRail] = useState(0);
  const isAuth = variant === "auth";

  return (
    <div
      className={
        isAuth
          ? "relative h-full min-h-screen w-full overflow-hidden rounded-l-2xl"
          : "hero-visual relative w-full overflow-hidden rounded-sm border border-orange-200/40 shadow-[0_24px_70px_rgba(234,88,12,0.18)]"
      }
    >
      {/* Orangish mix stage — subtle radius */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 12% 20%, rgba(255, 190, 120, 0.95) 0%, transparent 55%),
            radial-gradient(ellipse 70% 55% at 88% 18%, rgba(255, 150, 80, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 85% 55% at 45% 100%, rgba(249, 115, 22, 0.65) 0%, transparent 55%),
            radial-gradient(ellipse 45% 35% at 65% 55%, rgba(254, 215, 170, 0.85) 0%, transparent 45%),
            linear-gradient(165deg, #fff7ed 0%, #ffedd5 42%, #fdba74 100%)
          `,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* Landing: full page scaled to fit. Auth: zoomed-in crop like Conduit */}
      <div
        className={
          isAuth
            ? "absolute inset-0 overflow-hidden"
            : "relative flex items-center justify-center px-4 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16"
        }
      >
        <div
          className={
            isAuth
              ? "absolute left-[6%] top-[8%] h-[720px] w-[1180px]"
              : "h-[calc(640px*0.42)] w-[calc(1080px*0.42)] sm:h-[calc(640px*0.68)] sm:w-[calc(1080px*0.68)] lg:h-[calc(640px*0.82)] lg:w-[calc(1080px*0.82)]"
          }
        >
          <div
            className={
              isAuth
                ? "flex h-[720px] w-[1180px] overflow-hidden rounded-md border border-black/8 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
                : "flex h-[640px] w-[1080px] origin-top-left scale-[0.42] overflow-hidden rounded-sm border border-black/8 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)] sm:scale-[0.68] lg:scale-[0.82]"
            }
          >
          {/* Thin dark rail */}
          <aside className="flex w-12 shrink-0 flex-col items-center gap-3 bg-neutral-900 py-3">
            {railIcons.map((Icon, i) => (
              <button
                key={Icon.displayName ?? i}
                type="button"
                onClick={() => setRail(i)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-sm transition-colors",
                  rail === i
                    ? "bg-white/15 text-white"
                    : "text-neutral-400 hover:bg-white/10 hover:text-white",
                )}
                aria-label={Icon.displayName ?? "nav"}
              >
                <Icon size={16} strokeWidth={1.75} />
              </button>
            ))}
          </aside>

          {/* Light sidebar — always visible at desktop frame size */}
          <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-neutral-50">
            <div className="flex items-center justify-between px-3 py-3">
              <p className="text-sm font-semibold">Workspace</p>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[10px] font-semibold text-foreground"
              >
                <Sparkles size={11} className="text-secondary" />
                Ask
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-auto px-2 pb-3">
              <div>
                <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Inbox
                </p>
                <ul className="mt-1 space-y-0.5">
                  {["All sources", "My context"].map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-black/5"
                      >
                        <span>{label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          0
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {sourceGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.name}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-medium text-foreground hover:bg-black/5"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "size-2 rounded-full",
                                item.tone,
                              )}
                            />
                            {item.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.count}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Main pane */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4">
              <div className="flex items-center gap-4">
                {tabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      "pb-2 pt-1 text-xs font-semibold transition-colors",
                      tab === t
                        ? "border-b-2 border-foreground text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
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

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-white p-4 sm:p-8">
              {tab === "Sign in" ? (
                <div className="w-full max-w-sm">
                  <Suspense
                    fallback={
                      <p className="text-center text-sm text-muted-foreground">
                        Loading…
                      </p>
                    }
                  >
                    <SignInForm compact className="!p-0" />
                  </Suspense>
                </div>
              ) : tab === "Playground" ? (
                <div className="max-w-sm space-y-2 text-center">
                  <p className="text-lg font-semibold">Playground</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ask once. Inspect sources, scores, and the final prompt.
                  </p>
                </div>
              ) : (
                <div className="max-w-sm space-y-2 text-center">
                  <p className="text-lg font-semibold">Sources</p>
                  <p className="text-sm font-medium text-muted-foreground">
                    Connect Slack, Notion, GitHub, docs — then ship with
                    getContext().
                  </p>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
