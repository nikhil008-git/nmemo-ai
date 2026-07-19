"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  ArrowRight,
  FileText,
  GitBranch,
  MessageSquare,
  NotebookPen,
  Square,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { CitationList } from "@/components/citation";
import { DiagnosticsPanel } from "@/components/diagnostics-panel";
import { Logo } from "@/components/logo";
import { getConnectors, updateConnector } from "@/lib/api";
import type {
  Citation,
  Diagnostics,
  SourceStatus,
  TokenUsage,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const GROQ_KEYS_URL = "https://console.groq.com/keys";
const GROQ_READY_KEY = "nmemo:groq-ready";
const CHAT_STORAGE_KEY = "nmemo:playground-messages";
const CONTEXT_STORAGE_KEY = "nmemo:playground-context";

const CHIPS = [
  { label: "Documents", icon: FileText, prompt: "What’s in our documents?" },
  { label: "Slack", icon: MessageSquare, prompt: "What came up in Slack?" },
  { label: "Notion", icon: NotebookPen, prompt: "Summarize our Notion notes" },
  { label: "GitHub", icon: GitBranch, prompt: "What’s open on GitHub?" },
] as const;

type ContextPayload = {
  citations: {
    source_url: string;
    title: string;
    snippet: string;
  }[];
  groundingScore: number;
  context: {
    diagnostics: Diagnostics;
    tokenUsage: TokenUsage;
    sources: SourceStatus[];
  };
};

function readStoredMessages(): UIMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function readStoredContext(): ContextPayload | null {
  try {
    const raw = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContextPayload;
  } catch {
    return null;
  }
}

function writeGroqReadyCache(ready: boolean) {
  try {
    if (ready) localStorage.setItem(GROQ_READY_KEY, "1");
    else localStorage.removeItem(GROQ_READY_KEY);
  } catch {
    /* ignore */
  }
}

function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function contextFromMessage(m: UIMessage): ContextPayload | null {
  for (const part of m.parts) {
    if (
      part.type === "data-context" &&
      part.data &&
      typeof part.data === "object"
    ) {
      return part.data as ContextPayload;
    }
  }
  return null;
}

function mapCitations(
  citations: ContextPayload["citations"],
): Citation[] {
  return citations.map((c, i) => ({
    id: `c-${i}`,
    source: c.source_url,
    title: c.title,
    ...(c.source_url.startsWith("file://") ? {} : { url: c.source_url }),
    snippet: c.snippet,
  }));
}

export function Playground() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  /** null = still checking server; avoid key modal until we know. */
  const [groqReady, setGroqReady] = useState<boolean | null>(() => {
    try {
      return localStorage.getItem(GROQ_READY_KEY) === "1" ? true : null;
    } catch {
      return null;
    }
  });
  const [groqKey, setGroqKey] = useState("");
  const [savingGroq, setSavingGroq] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [pendingAsk, setPendingAsk] = useState<string | null>(null);
  const [latestContext, setLatestContext] = useState<ContextPayload | null>(
    null,
  );
  const [chatHydrated, setChatHydrated] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/proxy/ask/stream",
        credentials: "include",
      }),
    [],
  );

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport,
    onData: (part) => {
      if (part.type === "data-context" && part.data) {
        const data = part.data as ContextPayload;
        setLatestContext(data);
        try {
          localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(data));
        } catch {
          /* ignore */
        }
      }
    },
    onError: (err) => {
      setError(err.message || "Something went wrong");
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const retrieving = status === "submitted";
  const empty = chatHydrated && messages.length === 0 && !retrieving;
  const canSend = Boolean(input.trim()) && !busy && groqReady !== null;
  const canSaveKey = Boolean(groqKey.trim()) && !savingGroq;

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const inspectorContext =
    latestContext ??
    (lastAssistant ? contextFromMessage(lastAssistant) : null);

  useEffect(() => {
    const stored = readStoredMessages();
    if (stored.length) setMessages(stored);
    const ctx = readStoredContext();
    if (ctx) setLatestContext(ctx);
    setChatHydrated(true);
  }, [setMessages]);

  useEffect(() => {
    if (!chatHydrated) return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages, chatHydrated]);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      // Don't block chat forever if the API is slow — open key modal path.
      setGroqReady((prev) => (prev === null ? false : prev));
    }, 2500);

    void getConnectors()
      .then(({ connectors }) => {
        if (cancelled) return;
        const groq = connectors.find((c) => c.type === "groq");
        const ready =
          groq?.status === "connected" && Boolean(groq.config?.hasApiKey);
        setGroqReady(ready);
        writeGroqReadyCache(ready);
      })
      .catch(() => {
        if (!cancelled) {
          // Keep optimistic cache if network blips; only clear when sure.
          try {
            if (localStorage.getItem(GROQ_READY_KEY) !== "1") {
              setGroqReady(false);
            }
          } catch {
            setGroqReady(false);
          }
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (keyModalOpen) {
      keyInputRef.current?.focus();
    }
  }, [keyModalOpen]);

  function openKeyModal(nextAsk?: string) {
    if (nextAsk) setPendingAsk(nextAsk);
    setError(null);
    setKeyModalOpen(true);
  }

  function clearChat() {
    setMessages([]);
    setLatestContext(null);
    setShowDetails(false);
    setError(null);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem(CONTEXT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  async function saveGroqKey(e: React.FormEvent) {
    e.preventDefault();
    const value = groqKey.trim();
    if (!value) return;
    setSavingGroq(true);
    setError(null);
    try {
      const { connector } = await updateConnector("groq", {
        config: { apiKey: value },
      });
      const ready =
        connector.status === "connected" &&
        Boolean(connector.config?.hasApiKey);
      setGroqReady(ready || true);
      writeGroqReadyCache(true);
      setGroqKey("");
      setKeyModalOpen(false);
      const next = pendingAsk;
      setPendingAsk(null);
      if (next) {
        setInput("");
        setLatestContext(null);
        await sendMessage({ text: next });
      } else {
        inputRef.current?.focus();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key");
    } finally {
      setSavingGroq(false);
    }
  }

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (groqReady === null) return;
    if (!groqReady) {
      openKeyModal(trimmed);
      return;
    }
    setInput("");
    setError(null);
    setLatestContext(null);
    await sendMessage({ text: trimmed });
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    await ask(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit();
    }
  }

  if (!chatHydrated) {
    return <div className="h-full min-h-0 bg-[#fafafa]" />;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#fafafa]">
      {keyModalOpen ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 px-4"
          onClick={() => {
            setKeyModalOpen(false);
            setPendingAsk(null);
            setError(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="groq-key-title"
            className="w-full max-w-sm rounded-2xl border border-black/8 bg-white p-5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id="groq-key-title"
                  className="font-heading text-sm font-semibold tracking-[-0.02em]"
                >
                  API key required
                </p>
                <p className="mt-1 text-[12px] font-medium text-neutral-500">
                  Add a key to start chatting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setKeyModalOpen(false);
                  setPendingAsk(null);
                  setError(null);
                }}
                className="inline-flex size-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-foreground"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <form
              onSubmit={(e) => void saveGroqKey(e)}
              className="mt-4 space-y-3"
            >
              <input
                ref={keyInputRef}
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="Paste API key"
                autoComplete="off"
                className="w-full rounded-xl border border-black/8 bg-[#f3f1ee] px-3.5 py-2.5 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-black/15"
              />
              {error ? (
                <p className="text-[12px] font-medium text-red-500">{error}</p>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <a
                  href={GROQ_KEYS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-semibold text-neutral-500 underline underline-offset-2 hover:text-foreground"
                >
                  Get key
                </a>
                <button
                  type="submit"
                  disabled={!canSaveKey}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded-full px-4 text-[12px] font-semibold transition-colors",
                    canSaveKey
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-500",
                  )}
                >
                  {savingGroq ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {empty ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
          <div className="flex w-full max-w-2xl flex-col items-center">
            <h1 className="text-center font-heading text-[1.85rem] font-semibold tracking-[-0.035em] text-balance leading-[1.15] text-neutral-950 sm:text-[2.35rem] md:text-[2.6rem]">
              Ask across your sources
            </h1>

            <form
              onSubmit={(e) => void onSubmit(e)}
              className="relative mt-8 w-full rounded-[1.75rem] border border-black/[0.06] bg-[#f3f1ee] px-5 pb-4 pt-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => {
                  if (groqReady === false) openKeyModal();
                }}
                placeholder="Ask anything across connected sources…"
                disabled={busy}
                rows={4}
                className="min-h-[7.5rem] w-full resize-none bg-transparent pr-12 text-[15px] font-medium leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-50"
              />
              <div className="flex items-end justify-end">
                {busy ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white transition-opacity hover:opacity-90"
                    aria-label="Stop"
                  >
                    <Square size={11} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canSend}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-full transition-colors",
                      canSend
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : "bg-neutral-200/80 text-neutral-500",
                    )}
                    aria-label="Send"
                  >
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            </form>

            {error && groqReady !== false ? (
              <p className="mt-3 w-full break-words text-center text-xs font-semibold text-red-500">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2">
              {CHIPS.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  type="button"
                  disabled={busy}
                  onClick={() => void ask(prompt)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-semibold text-neutral-800 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-colors hover:border-black/20 hover:bg-neutral-50 disabled:opacity-40"
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

            <p className="mt-6 text-center text-[12px] font-semibold text-neutral-400">
              <Link
                href="/connectors"
                className="underline decoration-neutral-300 underline-offset-2 hover:text-foreground"
              >
                Manage sources
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-7 py-8">
              {messages.map((m) => {
                const text = messageText(m);
                const ctx = contextFromMessage(m);
                const isUser = m.role === "user";
                const streamingHere =
                  !isUser && busy && m.id === lastAssistant?.id;

                return (
                  <article
                    key={m.id}
                    className={cn(
                      "flex gap-3",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isUser ? (
                      <Logo size={26} className="mt-0.5 rounded-[7px]" />
                    ) : null}
                    <div
                      className={cn(
                        "min-w-0 max-w-[88%] space-y-2",
                        isUser && "text-right",
                      )}
                    >
                      {isUser ? (
                        <p className="inline-block rounded-2xl bg-[#f3f1ee] px-4 py-2.5 text-left text-sm font-medium leading-relaxed">
                          {text}
                        </p>
                      ) : (
                        <div className="space-y-1.5 text-left">
                          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                            nmemo
                          </p>
                          <p className="whitespace-pre-wrap text-[0.9375rem] font-medium leading-[1.65] text-neutral-900">
                            {text}
                            {streamingHere ? (
                              <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-orange-500 align-middle" />
                            ) : null}
                          </p>
                          {ctx?.citations?.length ? (
                            <CitationList
                              citations={mapCitations(ctx.citations)}
                            />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}

              {retrieving ? (
                <div className="flex items-center gap-3">
                  <Logo size={26} className="rounded-[7px]" />
                  <p className="text-sm font-semibold text-neutral-500">
                    Gathering context…
                  </p>
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 px-4 pb-5 pt-2 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-2">
              {error && groqReady !== false ? (
                <p className="break-words text-xs font-semibold text-red-500">
                  {error}
                </p>
              ) : null}

              <form
                onSubmit={(e) => void onSubmit(e)}
                className="relative rounded-[1.5rem] border border-black/[0.06] bg-[#f3f1ee] px-4 pb-3 pt-3"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  onFocus={() => {
                    if (groqReady === false) openKeyModal();
                  }}
                  placeholder="Ask anything across connected sources…"
                  disabled={busy}
                  rows={2}
                  className="min-h-[3.25rem] w-full resize-none bg-transparent pr-12 text-[15px] font-medium leading-relaxed outline-none placeholder:text-neutral-400 disabled:opacity-50"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDetails((v) => !v)}
                      className="text-[11px] font-semibold text-neutral-400 hover:text-foreground"
                    >
                      {inspectorContext
                        ? showDetails
                          ? "Hide context"
                          : "Show context"
                        : null}
                    </button>
                    {messages.length > 0 ? (
                      <button
                        type="button"
                        onClick={clearChat}
                        className="text-[11px] font-semibold text-neutral-400 hover:text-foreground"
                      >
                        New chat
                      </button>
                    ) : null}
                  </div>
                  {busy ? (
                    <button
                      type="button"
                      onClick={() => stop()}
                      className="inline-flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white"
                      aria-label="Stop"
                    >
                      <Square size={11} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!canSend}
                      className={cn(
                        "inline-flex size-9 items-center justify-center rounded-full transition-colors",
                        canSend
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-200/80 text-neutral-500",
                      )}
                      aria-label="Send"
                    >
                      <ArrowRight size={16} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </form>

              {showDetails && inspectorContext ? (
                <div className="space-y-3 rounded-2xl border border-black/8 bg-white px-3.5 py-3">
                  <ul className="space-y-1.5 text-xs font-semibold">
                    {(inspectorContext.context.sources ?? []).length === 0 ? (
                      <li className="text-neutral-500">No sources used.</li>
                    ) : (
                      inspectorContext.context.sources.map(
                        (s: SourceStatus) => (
                          <li
                            key={s.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <span>{s.name}</span>
                            <span className="text-neutral-500">
                              {s.responded ? `${s.latencyMs}ms` : "—"}
                            </span>
                          </li>
                        ),
                      )
                    )}
                  </ul>
                  <p className="text-[11px] font-semibold text-neutral-500">
                    Grounding · {inspectorContext.groundingScore}%
                  </p>
                  <DiagnosticsPanel
                    diagnostics={inspectorContext.context.diagnostics}
                    tokenUsage={inspectorContext.context.tokenUsage}
                    defaultOpen={false}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
