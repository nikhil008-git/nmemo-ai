"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { CitationList } from "@/components/citation";
import { DiagnosticsPanel } from "@/components/diagnostics-panel";
import { ToolCallIndicator } from "@/components/tool-call-indicator";
import { CtaButton } from "@/components/ui/cta-button";
import { askQuestion } from "@/lib/api";
import type { ChatMessage, SourceStatus } from "@/lib/types";

function mapCitations(
  citations: { source_url: string; title: string; snippet: string }[],
) {
  return citations.map((c, i) => ({
    id: `c-${i}`,
    source: c.source_url,
    title: c.title,
    ...(c.source_url.startsWith("file://") ? {} : { url: c.source_url }),
    snippet: c.snippet,
  }));
}

export function Playground() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [retrieving, setRetrieving] = useState<SourceStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"sources" | "diagnostics">(
    "sources",
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

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
    setError(null);
    setInspectorTab("sources");
    setRetrieving([
      {
        id: "engine",
        name: "getContext()",
        queried: true,
        responded: false,
        latencyMs: 0,
      },
    ]);

    try {
      const result = await askQuestion(trimmed);
      setRetrieving(null);

      const diagnostics = result.context?.diagnostics ?? {
        rankingScores: [
          {
            id: "rag",
            score: result.groundingScore / 100,
            reason: "Avg retrieval score",
          },
        ],
        discarded: [],
        conflicts: [],
        latencyBySource: {},
      };

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: result.answer,
          citations: mapCitations(result.citations),
          diagnostics,
          tokenUsage: result.context?.tokenUsage,
          sources: result.context?.sources,
        },
      ]);
    } catch (err) {
      setRetrieving(null);
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: `Could not reach the API: ${message}`,
        },
      ]);
    } finally {
      setBusy(false);
      setRetrieving(null);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Playground</h1>
        <p className="max-w-2xl text-sm font-medium text-muted-foreground">
          Ask once. Inspect every source, score, and what{" "}
          <code className="text-foreground/80">getContext()</code> assembled.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Ask pane */}
        <section className="flex min-h-[28rem] flex-col border border-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Ask
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !retrieving && (
              <p className="border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                Connect Sources or Connectors, then ask anything. We&apos;ll
                show which brains we used.
              </p>
            )}

            {error && (
              <p className="break-words text-sm text-red-500">{error}</p>
            )}

            {messages.map((m) => (
              <article key={m.id} className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {m.role === "user" ? "You" : "via getContext()"}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {m.content || (busy ? "…" : "")}
                </p>
                {m.role === "assistant" && m.citations && (
                  <CitationList citations={m.citations} />
                )}
              </article>
            ))}

            {retrieving && <ToolCallIndicator sources={retrieving} />}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex gap-2 border-t border-border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask across connected sources…"
              disabled={busy}
              className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
            />
            <CtaButton
              type="submit"
              size="compact"
              disabled={busy || !input.trim()}
            >
              Run
            </CtaButton>
          </form>
        </section>

        {/* Inspector pane */}
        <section className="flex min-h-[28rem] flex-col border border-border">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Context inspector
            </p>
            <div className="flex gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setInspectorTab("sources")}
                className={
                  inspectorTab === "sources"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                Sources
              </button>
              <button
                type="button"
                onClick={() => setInspectorTab("diagnostics")}
                className={
                  inspectorTab === "diagnostics"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                Diagnostics
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-sm">
            {!lastAssistant && !retrieving && (
              <p className="text-muted-foreground">
                After a run, you&apos;ll see which sources were queried,
                latency, ranking, discarded context, and token budget — the
                differentiator vs a plain chat box.
              </p>
            )}

            {retrieving && (
              <p className="text-muted-foreground">Retrieving context…</p>
            )}

            {lastAssistant && inspectorTab === "sources" && (
              <div className="space-y-4">
                <ul className="divide-y divide-border border border-border">
                  {(lastAssistant.sources ?? []).length === 0 ? (
                    <li className="px-3 py-3 text-muted-foreground">
                      No source status returned for this run.
                    </li>
                  ) : (
                    lastAssistant.sources!.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5"
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.responded ? `${s.latencyMs}ms` : "no response"}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
                <p className="text-xs text-muted-foreground">
                  This is what your agent gets with one SDK call.{" "}
                  <Link href="/keys" className="underline underline-offset-4">
                    Create an API key →
                  </Link>
                </p>
              </div>
            )}

            {lastAssistant?.diagnostics && inspectorTab === "diagnostics" && (
              <DiagnosticsPanel
                diagnostics={lastAssistant.diagnostics}
                tokenUsage={lastAssistant.tokenUsage}
                defaultOpen
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
