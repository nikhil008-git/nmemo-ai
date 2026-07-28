"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import {
  ArrowRight,
  AudioLines,
  FileText,
  GitBranch,
  Languages,
  MessageSquare,
  Mic,
  NotebookPen,
  Square,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { CitationList } from "@/components/citation";
import { DiagnosticsPanel } from "@/components/diagnostics-panel";
import { Logo } from "@/components/logo";
import { updateConnector } from "@/lib/api";
import { useConnectorsOptional } from "@/lib/connectors-store";
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

const SOON_ACTIONS = [
  { id: "voice", label: "Voice", icon: Mic },
  { id: "realtime", label: "Real-time", icon: AudioLines },
  { id: "languages", label: "Languages", icon: Languages },
] as const;

function SoonIconButton({
  label,
  icon: Icon,
  size = "md",
}: {
  label: string;
  icon: typeof Mic;
  size?: "sm" | "md";
}) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-foreground/10 hover:text-foreground",
          size === "sm" ? "size-7 sm:size-8" : "size-8 sm:size-9",
        )}
        aria-label={`${label}, coming soon`}
      >
        <Icon
          size={size === "sm" ? 14 : 15}
          strokeWidth={1.75}
        />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold tracking-[-0.01em] text-secondary-foreground opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.18)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        Soon
      </span>
    </span>
  );
}

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
  const connectorsCtx = useConnectorsOptional();
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
      const message = err.message || "Something went wrong";
      setError(message);
      if (/invalid.?api.?key/i.test(message)) {
        setGroqReady(false);
        writeGroqReadyCache(false);
        setKeyModalOpen(true);
      }
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
    const connectors = connectorsCtx?.connectors;
    if (!connectors) return;

    const groq = connectors.find((c) => c.type === "groq");
    const ready =
      groq?.status === "connected" && Boolean(groq.config?.hasApiKey);
    setGroqReady(ready);
    writeGroqReadyCache(ready);
  }, [connectorsCtx?.connectors]);

  useEffect(() => {
    if (connectorsCtx) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      setGroqReady((prev) => (prev === null ? false : prev));
    }, 2500);

    void import("@/lib/api")
      .then(({ getConnectors }) => getConnectors())
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
  }, [connectorsCtx]);

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    // Scroll only the chat pane — never the window (landing embeds this UI).
    const scroller = el.closest<HTMLElement>("[data-playground-scroll]");
    if (scroller) {
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
      connectorsCtx?.upsert(connector);
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
    return <div className="h-full min-h-0 bg-surface" />;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-surface">
      {keyModalOpen ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4"
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
            className="w-full max-w-sm rounded-2xl border border-border bg-surface-raised p-4 shadow-[0_16px_40px_rgba(0,0,0,0.24)] sm:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id="groq-key-title"
                  className="font-heading text-sm font-semibold tracking-[-0.02em]"
                >
                  {groqReady ? "Update Groq API key" : "Add Groq API key"}
                </p>
                <p className="mt-1 text-[12px] font-medium text-neutral-500">
                  {groqReady
                    ? "Paste a new key from console.groq.com. Saved on your workspace."
                    : "Paste a free key from console.groq.com to chat."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setKeyModalOpen(false);
                  setPendingAsk(null);
                  setError(null);
                }}
                className="inline-flex size-7 items-center justify-center rounded-full text-neutral-400 hover:bg-foreground/10 hover:text-foreground"
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
                className="w-full rounded-xl border border-border bg-panel px-3.5 py-2.5 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-foreground/30"
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
                      ? "bg-secondary text-secondary-foreground"
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
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
          <div className="flex w-full max-w-2xl flex-col items-center">
            <h1 className="text-center font-heading text-[1.45rem] font-semibold tracking-[-0.035em] text-balance leading-[1.15] text-foreground sm:text-[2.35rem] md:text-[2.6rem]">
              See what context your agents get
            </h1>
            <p className="mt-2 max-w-md text-center text-[12px] font-medium leading-relaxed text-neutral-500 sm:mt-3 sm:text-[13px]">
              Ask a question to try{" "}
              <span className="text-neutral-700">getContext()</span>. The reply
              is a demo — use Show context to inspect sources, citations, and
              ranking.
            </p>

            <form
              onSubmit={(e) => void onSubmit(e)}
              className="relative mt-5 w-full rounded-2xl border border-border bg-panel px-3.5 pb-3 pt-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:mt-8 sm:rounded-[1.75rem] sm:px-5 sm:pb-4 sm:pt-4"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => {
                  if (groqReady === false) openKeyModal();
                }}
                placeholder="Ask something your sources should know…"
                disabled={busy}
                rows={3}
                className="min-h-[5rem] w-full resize-none bg-transparent pr-10 text-[13px] font-medium leading-relaxed text-foreground outline-none placeholder:text-neutral-400 disabled:opacity-50 sm:min-h-[7.5rem] sm:pr-12 sm:text-[15px]"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-0.5">
                  {SOON_ACTIONS.map(({ id, label, icon }) => (
                    <SoonIconButton key={id} label={label} icon={icon} />
                  ))}
                </div>
                {busy ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    className="inline-flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-opacity hover:opacity-90 sm:size-9"
                    aria-label="Stop"
                  >
                    <Square size={11} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canSend}
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-full transition-colors sm:size-9",
                      canSend
                        ? "bg-secondary text-secondary-foreground hover:opacity-90"
                        : "bg-neutral-200/80 text-neutral-500",
                    )}
                    aria-label="Send"
                  >
                    <ArrowRight size={14} strokeWidth={2} className="sm:hidden" />
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      className="hidden sm:block"
                    />
                  </button>
                )}
              </div>
            </form>

            {error && groqReady !== false ? (
              <p className="mt-3 w-full break-words text-center text-xs font-semibold text-red-500">
                {error}
              </p>
            ) : null}

            <div className="mt-3.5 flex w-full flex-wrap items-center justify-center gap-1.5 sm:mt-5 sm:gap-2">
              {CHIPS.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  type="button"
                  disabled={busy}
                  onClick={() => void ask(prompt)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-foreground/25 hover:bg-foreground/5 disabled:opacity-40 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[13px]"
                >
                  <Icon
                    size={12}
                    strokeWidth={1.75}
                    className="text-neutral-500 sm:hidden"
                  />
                  <Icon
                    size={14}
                    strokeWidth={1.75}
                    className="hidden text-neutral-500 sm:block"
                  />
                  {label}
                </button>
              ))}
            </div>

            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] font-semibold text-neutral-400 sm:mt-6 sm:text-[12px]">
              <button
                type="button"
                onClick={() => openKeyModal()}
                className="underline decoration-neutral-300 underline-offset-2 hover:text-foreground"
              >
                {groqReady ? "Update Groq key" : "Add Groq key"}
              </button>
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
          <div
            data-playground-scroll
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6"
          >
            <div className="mx-auto max-w-2xl space-y-5 py-5 sm:space-y-7 sm:py-8">
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
                      "flex gap-2 sm:gap-3",
                      isUser ? "justify-end" : "justify-start",
                    )}
                  >
                    {!isUser ? (
                      <Logo
                        size={22}
                        className="mt-0.5 rounded-[6px] sm:hidden"
                      />
                    ) : null}
                    {!isUser ? (
                      <Logo
                        size={26}
                        className="mt-0.5 hidden rounded-[7px] sm:block"
                      />
                    ) : null}
                    <div
                      className={cn(
                        "min-w-0 max-w-[90%] space-y-1.5 sm:max-w-[88%] sm:space-y-2",
                        isUser && "text-right",
                      )}
                    >
                      {isUser ? (
                        <p className="inline-block rounded-xl bg-panel px-3 py-2 text-left text-[13px] font-medium leading-relaxed sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm">
                          {text}
                        </p>
                      ) : (
                        <div className="space-y-1 text-left sm:space-y-1.5">
                          <p className="font-heading text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400 sm:text-[10px]">
                            nmemo
                          </p>
                          <p className="whitespace-pre-wrap text-[13px] font-medium leading-[1.6] text-foreground sm:text-[0.9375rem] sm:leading-[1.65]">
                            {text}
                            {streamingHere ? (
                              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-foreground align-middle sm:h-3.5" />
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
                <div className="flex items-center gap-2 sm:gap-3">
                  <Logo size={22} className="rounded-[6px] sm:hidden" />
                  <Logo size={26} className="hidden rounded-[7px] sm:block" />
                  <p className="text-[13px] font-semibold text-neutral-500 sm:text-sm">
                    Gathering context…
                  </p>
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 px-3 pb-3 pt-1.5 sm:px-6 sm:pb-5 sm:pt-2">
            <div className="mx-auto max-w-2xl space-y-2">
              {error && groqReady !== false ? (
                <p className="break-words text-xs font-semibold text-red-500">
                  {error}
                </p>
              ) : null}

              <form
                onSubmit={(e) => void onSubmit(e)}
                className="relative rounded-2xl border border-border bg-panel px-3 pb-2.5 pt-2.5 sm:rounded-[1.5rem] sm:px-4 sm:pb-3 sm:pt-3"
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
                  className="min-h-[2.75rem] w-full resize-none bg-transparent pr-10 text-[13px] font-medium leading-relaxed outline-none placeholder:text-neutral-400 disabled:opacity-50 sm:min-h-[3.25rem] sm:pr-12 sm:text-[15px]"
                />
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                    {SOON_ACTIONS.map(({ id, label, icon }) => (
                      <SoonIconButton
                        key={id}
                        label={label}
                        icon={icon}
                        size="sm"
                      />
                    ))}
                    <div className="ml-1 flex items-center gap-2.5 sm:ml-1.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDetails((v) => !v)}
                        className="text-[10px] font-semibold text-neutral-400 hover:text-foreground sm:text-[11px]"
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
                          className="text-[10px] font-semibold text-neutral-400 hover:text-foreground sm:text-[11px]"
                        >
                          New chat
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => openKeyModal()}
                        className="hidden text-[10px] font-semibold text-neutral-400 hover:text-foreground sm:inline sm:text-[11px]"
                      >
                        {groqReady ? "Update Groq key" : "Add Groq key"}
                      </button>
                    </div>
                  </div>
                  {busy ? (
                    <button
                      type="button"
                      onClick={() => stop()}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground sm:size-9"
                      aria-label="Stop"
                    >
                      <Square size={11} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!canSend}
                      className={cn(
                        "inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors sm:size-9",
                        canSend
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-neutral-200/80 text-neutral-500",
                      )}
                      aria-label="Send"
                    >
                      <ArrowRight size={14} strokeWidth={2} className="sm:hidden" />
                      <ArrowRight
                        size={16}
                        strokeWidth={2}
                        className="hidden sm:block"
                      />
                    </button>
                  )}
                </div>
              </form>

              {showDetails && inspectorContext ? (
                <div className="space-y-3 rounded-2xl border border-border bg-surface-raised px-3.5 py-3">
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
