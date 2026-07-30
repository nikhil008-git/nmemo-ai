"use client";

/**
 * The left pane: sessions and memory for the current workspace.
 *
 * There is no episodes endpoint yet, so the Sessions list holds only the live
 * run the playground left behind. The onboarding steps that used to
 * be the whole dashboard are the empty state, and disappear once there is real
 * work to list.
 */

import Link from "next/link";
import { ChevronDown, FileText, GitBranch, Folder, Plus, Terminal } from "lucide-react";

import type { IngestedDocument } from "@/lib/types";
import type { Episode } from "@/lib/workspace-view";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/connectors", label: "Connect your sources" },
  { href: "/sources", label: "Add workspace knowledge" },
  { href: "/playground", label: "See context in action" },
  { href: "/keys", label: "Ship it to your agents" },
] as const;

export type RailTab = "sessions" | "memory";

export function SessionsRail({
  tab,
  onTabChange,
  workspaceName,
  episodes,
  documents,
  footer,
  className,
}: {
  tab: RailTab;
  onTabChange: (tab: RailTab) => void;
  workspaceName: string;
  episodes: Episode[];
  documents: IngestedDocument[];
  footer: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col bg-rail", className)}>
      <div className="shrink-0 px-3 pb-3 pt-3">
        <div className="flex rounded-md bg-ink/[0.05] p-0.5 text-[0.6875rem]">
          {(["sessions", "memory"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                "flex-1 rounded py-1 text-center capitalize transition-colors",
                tab === id ? "bg-ink/[0.09] text-ink/90" : "text-ink/35",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 space-y-1 px-3 pb-3 text-[0.8125rem] text-ink/50">
        <Link
          href="/playground"
          className="flex items-center gap-2 transition-colors hover:text-ink/80"
        >
          <Plus size={13} strokeWidth={1.75} /> New task
        </Link>
        <Link
          href="/playground"
          className="flex items-center gap-2 transition-colors hover:text-ink/80"
        >
          <Terminal size={13} strokeWidth={1.75} />
          <span className="tabular-nums">/resume</span>
        </Link>
      </div>

      <p className="shrink-0 px-3 pb-1.5 text-[0.5625rem] font-medium tracking-widest text-ink/25">
        WORKSPACE
      </p>
      <Link
        href="/settings"
        className="mx-2 mb-3 flex shrink-0 items-center gap-2 rounded-md bg-ink/[0.04] px-2 py-1.5 text-[0.8125rem] text-ink/70 transition-colors hover:bg-ink/[0.07]"
      >
        <Folder size={13} strokeWidth={1.75} className="shrink-0 text-ink/40" />
        <span className="truncate">{workspaceName}</span>
        <ChevronDown size={13} className="ml-auto shrink-0 text-ink/30" />
      </Link>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        {tab === "sessions" ? (
          <>
            <p className="px-3 pb-1.5 text-[0.5625rem] font-medium tracking-widest text-ink/25">
              EPISODES
            </p>
            {episodes.length > 0 ? (
              <div className="space-y-px px-2">
                {episodes.map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.8125rem]",
                      e.live ? "bg-ink/[0.06] text-ink/85" : "text-ink/45",
                    )}
                  >
                    <GitBranch
                      size={13}
                      strokeWidth={1.75}
                      className="shrink-0 text-ink/30"
                    />
                    <span className="truncate">{e.title}</span>
                    <span className="ml-auto shrink-0 text-ink/25">
                      {e.meta}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 pb-3">
                <p className="text-[0.8125rem] leading-relaxed text-ink/30">
                  No episodes yet. Sessions are kept once the CLI lands — start
                  here:
                </p>
                <ol className="mt-2 space-y-1">
                  {STEPS.map((step, i) => (
                    <li key={step.href}>
                      <Link
                        href={step.href}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[0.8125rem] text-ink/45 transition-colors hover:bg-ink/[0.04] hover:text-ink/75"
                      >
                        <span className="shrink-0 text-ink/25">
                          {i + 1}
                        </span>
                        <span className="truncate">{step.label}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="px-3 pb-1.5 text-[0.5625rem] font-medium tracking-widest text-ink/25">
              INGESTED
            </p>
            {documents.length === 0 ? (
              <p className="px-3 pb-3 text-[0.8125rem] leading-relaxed text-ink/30">
                Nothing ingested yet.{" "}
                <Link
                  href="/sources"
                  className="text-ink/55 underline underline-offset-4"
                >
                  Add knowledge
                </Link>
              </p>
            ) : (
              <div className="space-y-px px-2">
                {documents.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.8125rem] text-ink/45"
                  >
                    <FileText
                      size={13}
                      strokeWidth={1.75}
                      className="shrink-0 text-ink/25"
                    />
                    <span className="truncate">{d.title}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-ink/20">
                      {d.chunkCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-ink/[0.07] px-3 py-2 text-[0.8125rem] tabular-nums text-ink/30">
        {footer}
      </div>
    </div>
  );
}
