"use client";

import { useRef, useState } from "react";

import { CitationList } from "@/components/citation";
import { DiagnosticsPanel } from "@/components/diagnostics-panel";
import { ToolCallIndicator } from "@/components/tool-call-indicator";
import {
  getMockContextForQuery,
  mockRetrieveProgress,
  mockStreamAnswer,
  type ChatMessage,
  type SourceStatus,
} from "@/lib/mocks";

const examples = [
  "What does getContext return?",
  "How do retrievers handle timeouts?",
  "When should I use getContextFast?",
];

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [retrieving, setRetrieving] = useState<SourceStatus[] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(query: string) {
    const trimmed = query.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: `u-${crypto.randomUUID().slice(0, 8)}`,
      role: "user",
      content: trimmed,
    };
    const assistantId = `a-${crypto.randomUUID().slice(0, 8)}`;

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);
    setRetrieving([]);

    try {
      for await (const step of mockRetrieveProgress()) {
        setRetrieving(step);
      }

      const context = getMockContextForQuery(trimmed);
      setRetrieving(null);

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          citations: context.citations,
          diagnostics: context.diagnostics,
          tokenUsage: context.tokenUsage,
          sources: context.sources,
        },
      ]);

      let assembled = "";
      for await (const chunk of mockStreamAnswer(context.answer)) {
        assembled += chunk;
        const content = assembled;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content } : m)),
        );
      }
    } finally {
      setBusy(false);
      setRetrieving(null);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <header className="mb-6 space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Chat
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Context demo</h1>
        <p className="text-sm font-light text-muted-foreground">
          Mock stream with citations and diagnostics — no live API yet.
        </p>
      </header>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-4">
        {messages.length === 0 && !retrieving && (
          <div className="space-y-3 border border-dashed border-border px-4 py-8">
            <p className="text-sm text-muted-foreground">
              Try an example question
            </p>
            <ul className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    onClick={() => send(ex)}
                    className="rounded-md border border-border px-3 py-1.5 text-left text-sm transition-colors hover:border-foreground/40"
                  >
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <article key={m.id} className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {m.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {m.content || (busy ? "…" : "")}
            </p>
            {m.role === "assistant" && m.citations && (
              <CitationList citations={m.citations} />
            )}
            {m.role === "assistant" && m.diagnostics && (
              <DiagnosticsPanel
                diagnostics={m.diagnostics}
                tokenUsage={m.tokenUsage}
              />
            )}
          </article>
        ))}

        {retrieving && <ToolCallIndicator sources={retrieving} />}
        <div ref={bottomRef} />
      </div>

      <form
        className="sticky bottom-0 flex gap-2 border-t border-border bg-background pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your context…"
          disabled={busy}
          className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
