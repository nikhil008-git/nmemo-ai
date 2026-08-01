"use client";

import {
  ArrowRight,
  AudioLines,
  FileText,
  GitBranch,
  Languages,
  MessageSquare,
  Mic,
  NotebookPen,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import { Frame } from "@/components/landing/mockups";
import { WallpaperPlate } from "@/components/landing/wallpaper";
import { Logo } from "@/components/logo";
import { useSession } from "@/lib/auth-client";

const chips = [
  ["Documents", FileText, "What is our refund policy?"],
  ["Slack", MessageSquare, "What came up in Slack?"],
  ["Notion", NotebookPen, "Summarize our Notion notes"],
  ["GitHub", GitBranch, "What is open on GitHub?"],
] as const;

export function PlaygroundDemo() {
  const router = useRouter();
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);

  function ask(value?: string) {
    const next = (value ?? input).trim();
    if (!next) return;
    setQuestion(next);
    setInput("");
    setShowContext(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask();
  }

  function openDashboard() {
    router.push(session?.user ? "/home" : "/sign-in?next=/home");
  }

  function handlePreviewClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, form")) return;
    openDashboard();
  }

  return (
    <Frame bezel>
      <div className="relative aspect-[16/10] w-full">
        <WallpaperPlate>
          <div
            role="group"
            tabIndex={0}
            aria-label="Interactive nmemo preview. Press Enter to open the dashboard."
            onClick={handlePreviewClick}
            onKeyDown={(event) => {
              if (
                event.target === event.currentTarget &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                openDashboard();
              }
            }}
            className="product-shell landing-demo-shell absolute flex cursor-pointer overflow-hidden rounded-lg border border-ink/10 bg-surface shadow-[var(--panel-shadow)] outline-none transition-[border-color,box-shadow] duration-200 hover:border-ink/20 focus-visible:ring-2 focus-visible:ring-ink/25"
          >
            <aside className="hidden w-56 shrink-0 flex-col border-r border-ink/[0.07] bg-rail px-3 py-4 sm:flex">
              <p className="truncate rounded-md px-2 py-1 text-[14px] font-semibold tracking-[-0.02em] text-ink/90 transition-colors hover:bg-ink/[0.04]">
                Nikhil Rajpurohit
              </p>
              <p className="mt-0.5 px-2 text-[11px] font-medium text-ink/35">
                Workspace &amp; IDs →
              </p>

              <DemoGroup label="Inbox" className="mt-7">
                <DemoRow label="All sources" value="1" />
              </DemoGroup>
              <DemoGroup label="Sources" className="mt-6">
                <DemoRow label="Documents" dot="bg-status-warn" />
                <DemoRow label="Slack" dot="bg-status-bad" />
                <DemoRow label="Notion" dot="bg-status-info" />
                <DemoRow label="GitHub" dot="bg-status-ok" />
                <DemoRow label="Memory" dot="bg-status-alt" />
              </DemoGroup>
              <DemoGroup label="View" className="mt-6">
                <DemoRow label="Playground" active />
                <DemoRow label="Keys" />
                <DemoRow label="Docs" />
              </DemoGroup>

              <div className="mt-auto space-y-1 border-t border-ink/[0.07] pt-3">
                <DemoRow label="Settings" />
                <DemoRow label="Sign out" />
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-5">
                <span className="text-[13px] font-semibold tracking-[-0.015em] text-ink/80">
                  Playground
                </span>
                <span className="hidden h-7 shrink-0 items-center gap-2 rounded-sm border border-border bg-surface px-2 text-[11px] font-semibold text-neutral-400 transition-colors hover:bg-ink/[0.04] hover:text-ink/70 md:flex">
                  <Search size={12} strokeWidth={1.75} />
                  Search
                  <span className="rounded-[3px] bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
                    ⌘ K
                  </span>
                </span>
              </header>

              {question ? (
                <AnsweredDemo
                  question={question}
                  showContext={showContext}
                  onToggleContext={() => setShowContext((value) => !value)}
                  input={input}
                  onInput={setInput}
                  onSubmit={submit}
                  onReset={() => {
                    setQuestion(null);
                    setShowContext(false);
                  }}
                />
              ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
                  <div className="flex w-full max-w-2xl flex-col items-center">
                    <h2 className="text-balance text-center font-heading text-[1.45rem] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[2.35rem] md:text-[2.6rem]">
                      See what context your agents get
                    </h2>
                    <p className="mt-2 max-w-md text-center text-[12px] font-medium leading-relaxed text-neutral-500 sm:mt-3 sm:text-[13px]">
                      Ask a question to try{" "}
                      <span className="text-neutral-700">getContext()</span>.
                      The reply is a demo — use Show context to inspect sources,
                      citations, and ranking.
                    </p>
                    <Composer
                      input={input}
                      onInput={setInput}
                      onSubmit={submit}
                    />
                    <div className="mt-3.5 flex w-full flex-wrap items-center justify-center gap-1.5 sm:mt-5 sm:gap-2">
                      {chips.map(([label, Icon, prompt]) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => ask(prompt)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-foreground/25 hover:bg-foreground/5 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[13px]"
                        >
                          <Icon
                            size={14}
                            strokeWidth={1.75}
                            className="text-neutral-500"
                          />
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] font-semibold text-neutral-400 sm:mt-6 sm:text-[12px]">
                      <span className="underline decoration-neutral-300 underline-offset-2">
                        Add Groq key
                      </span>
                      <span className="underline decoration-neutral-300 underline-offset-2">
                        Manage sources
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </WallpaperPlate>
      </div>
    </Frame>
  );
}

function DemoGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/25">
        {label}
      </p>
      <div className="mt-2 space-y-0.5">{children}</div>
    </div>
  );
}

function DemoRow({
  label,
  value,
  dot,
  active = false,
}: {
  label: string;
  value?: string;
  dot?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[12px] font-medium ${
        active
          ? "bg-ink/[0.07] text-ink/90"
          : "text-ink/50 transition-colors hover:bg-ink/[0.04] hover:text-ink/80"
      }`}
    >
      {dot ? <span className={`size-1.5 rounded-full ${dot}`} /> : null}
      <span>{label}</span>
      {value ? (
        <span className="ml-auto text-[11px] text-ink/30">{value}</span>
      ) : null}
    </div>
  );
}

function Composer({
  input,
  onInput,
  onSubmit,
}: {
  input: string;
  onInput: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="relative mt-5 w-full rounded-2xl border border-border bg-panel px-3.5 pb-3 pt-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:mt-8 sm:rounded-[1.75rem] sm:px-5 sm:pb-4 sm:pt-4"
    >
      <textarea
        value={input}
        onChange={(event) => onInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder="Ask something your sources should know…"
        rows={3}
        className="min-h-[5rem] w-full resize-none bg-transparent pr-10 text-[13px] font-medium leading-relaxed text-foreground outline-none placeholder:text-neutral-400 sm:min-h-[7.5rem] sm:pr-12 sm:text-[15px]"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 text-neutral-400">
          <DemoActionIcon icon={Mic} label="Voice" />
          <DemoActionIcon icon={AudioLines} label="Real-time" />
          <DemoActionIcon icon={Languages} label="Languages" />
        </div>
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Ask"
          className={`inline-flex size-8 items-center justify-center rounded-full transition-colors sm:size-9 ${
            input.trim()
              ? "bg-secondary text-secondary-foreground hover:opacity-90"
              : "bg-neutral-200/80 text-neutral-500"
          }`}
        >
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </form>
  );
}

function DemoActionIcon({
  icon: Icon,
  label,
}: {
  icon: typeof Mic;
  label: string;
}) {
  return (
    <span
      aria-label={`${label}, coming soon`}
      className="inline-flex size-8 items-center justify-center rounded-full sm:size-9"
    >
      <Icon size={15} strokeWidth={1.75} />
    </span>
  );
}

function AnsweredDemo({
  question,
  showContext,
  onToggleContext,
  input,
  onInput,
  onSubmit,
  onReset,
}: {
  question: string;
  showContext: boolean;
  onToggleContext: () => void;
  input: string;
  onInput: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden px-3 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-5 py-5 sm:space-y-7 sm:py-8">
          <div className="flex justify-end">
            <p className="inline-block max-w-[88%] rounded-2xl bg-panel px-4 py-2.5 text-left text-sm font-medium leading-relaxed text-foreground">
              {question}
            </p>
          </div>
          <div className="flex gap-3">
            <Logo size={26} className="mt-0.5 rounded-[7px]" />
            <div className="min-w-0 max-w-[88%] space-y-1.5 text-left">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                nmemo
              </p>
              <p className="text-[0.9375rem] font-medium leading-[1.65] text-foreground">
                The available context points to a phased rollout, with the
                latest decision confirmed across the product spec and team
                discussion.
              </p>
              <div className="flex gap-1.5 pt-1 text-[11px] font-semibold text-neutral-500">
                <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1">
                  Product spec
                </span>
                <span className="rounded-full bg-foreground/[0.05] px-2.5 py-1">
                  Slack · #product
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-3 pb-3 pt-1.5 sm:px-6 sm:pb-5 sm:pt-2">
        <div className="mx-auto max-w-2xl space-y-2">
          <form
            onSubmit={onSubmit}
            className="relative rounded-[1.5rem] border border-border bg-panel px-4 pb-3 pt-3"
          >
            <textarea
              value={input}
              onChange={(event) => onInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Ask anything across connected sources…"
              rows={2}
              className="min-h-[3.25rem] w-full resize-none bg-transparent pr-12 text-[15px] font-medium leading-relaxed text-foreground outline-none placeholder:text-neutral-400"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5 text-neutral-400">
                <DemoActionIcon icon={Mic} label="Voice" />
                <DemoActionIcon icon={AudioLines} label="Real-time" />
                <DemoActionIcon icon={Languages} label="Languages" />
                <button
                  type="button"
                  onClick={onToggleContext}
                  className="ml-1.5 text-[11px] font-semibold hover:text-foreground"
                >
                  {showContext ? "Hide context" : "Show context"}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="text-[11px] font-semibold hover:text-foreground"
                >
                  New chat
                </button>
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Ask"
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  input.trim()
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-neutral-200/80 text-neutral-500"
                }`}
              >
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </form>

          {showContext ? (
            <div className="rounded-2xl border border-border bg-surface-raised px-3.5 py-3">
              <div className="flex items-center text-xs font-semibold text-foreground">
                <span>Context package</span>
                <span className="ml-auto font-mono text-neutral-500">
                  1,842 / 6,000 tokens
                </span>
              </div>
              <div className="mt-2 flex h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                <span className="w-[22%] bg-status-alt/70" />
                <span className="w-[37%] bg-status-ok/70" />
                <span className="w-[18%] bg-status-info/70" />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-3 text-[11px] font-semibold">
                <ContextLine label="Memory" score="0.94" />
                <ContextLine label="Notion" score="0.91" />
                <ContextLine label="Slack" score="0.87" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ContextLine({ label, score }: { label: string; score: string }) {
  return (
    <div className="flex items-center text-ink/40">
      <span>{label}</span>
      <span className="ml-auto font-mono text-ink/55">{score}</span>
    </div>
  );
}
