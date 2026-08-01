"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listDocuments } from "@/lib/api";
import { useConnectors } from "@/lib/connectors-store";
import {
  readStoredContext,
  toContextView,
  type ContextView,
} from "@/lib/context-view";
import type { IngestedDocument } from "@/lib/types";

export function WorkspaceDashboard({
  workspaceName,
  userName,
}: {
  workspaceName: string;
  userName: string;
}) {
  const { connectors, loading } = useConnectors();
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [lastContext, setLastContext] = useState<ContextView | null>(null);

  useEffect(() => {
    const stored = readStoredContext();
    if (stored) setLastContext(toContextView(stored));
    void listDocuments()
      .then(({ documents: docs }) => setDocuments(docs))
      .catch(() => undefined);
  }, []);

  const connected = connectors.filter(
    (connector) => connector.status === "connected",
  ).length;
  const responding =
    lastContext?.sources.filter((source) => source.responded).length ?? 0;
  const firstName = userName.trim().split(/\s+/)[0] || "there";

  return (
    <main className="min-h-full bg-surface-soft px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <header className="text-center">
          <p className="text-[12px] text-ink/30">{workspaceName}</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]">
            Welcome, {firstName}.
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] font-medium leading-relaxed text-ink/45">
            Your context workspace is ready. Connect knowledge, test retrieval,
            and integrate it into your agents.
          </p>
        </header>

        <section className="mt-6 grid grid-cols-3 py-3 text-center">
          <Metric value={loading ? "—" : String(connected)} label="Sources" />
          <Metric value={String(documents.length)} label="Documents" />
          <Metric
            value={lastContext ? String(responding) : "—"}
            label="Last run"
          />
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium text-ink/30">
                CONTEXT ENGINE
              </p>
              <h2 className="mt-1 text-[16px] font-semibold text-ink">
                {lastContext
                  ? "Latest context package"
                  : "Run your first context query"}
              </h2>
            </div>
            {lastContext ? (
              <p className="text-[12px] text-ink/35">
                {lastContext.budget.used.toLocaleString()} tokens
              </p>
            ) : null}
          </div>

          {lastContext ? (
            <div className="mt-4 rounded-lg bg-ink/[0.025] px-3.5 py-3.5">
              <div className="flex h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                {lastContext.layers.map((layer) => (
                  <span
                    key={layer.label}
                    className={layer.bar}
                    style={{
                      width: `${Math.min(100, (layer.tokens / lastContext.budget.total) * 100)}%`,
                    }}
                  />
                ))}
              </div>
              <p className="mt-3 text-[13px] text-ink/45">
                {responding} source{responding === 1 ? "" : "s"} responded ·{" "}
                {lastContext.citations.length} citation
                {lastContext.citations.length === 1 ? "" : "s"} ·{" "}
                {lastContext.discarded} discarded
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[13px] leading-relaxed text-ink/40">
              Ask a question in the playground to inspect selected sources,
              citations, and token usage here.
            </p>
          )}

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <Link
              href="/playground"
              className="rounded-full bg-ink px-4 py-2.5 text-center text-[13px] font-medium text-background transition-colors hover:bg-ink/85"
            >
              Try the playground
            </Link>
            <Link
              href={connected || documents.length ? "/keys" : "/connectors"}
              className="rounded-full bg-ink/[0.05] px-4 py-2.5 text-center text-[13px] font-medium text-ink transition-colors hover:bg-ink/[0.08]"
            >
              {connected || documents.length
                ? "Integrate with API"
                : "Connect a source"}
            </Link>
          </div>
        </section>

        <footer className="mt-7 flex items-center justify-center gap-4 text-[12px] font-medium text-ink/35">
          <Link href="/sources" className="transition-colors hover:text-ink">
            Documents
          </Link>
          <Link href="/connectors" className="transition-colors hover:text-ink">
            Connectors
          </Link>
          <Link href="/docs/sdk" className="transition-colors hover:text-ink">
            SDK docs
          </Link>
        </footer>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-ink/35">{label}</p>
    </div>
  );
}
