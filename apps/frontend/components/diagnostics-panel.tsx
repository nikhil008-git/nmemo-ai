"use client";

import { useState } from "react";

import type { Diagnostics, TokenUsage } from "@/lib/types";

type Props = {
  diagnostics: Diagnostics;
  tokenUsage?: TokenUsage;
};

export function DiagnosticsPanel({
  diagnostics,
  tokenUsage,
  defaultOpen = false,
}: Props & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-3 border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        Diagnostics
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-border px-3 py-3 text-xs text-muted-foreground">
          {tokenUsage && (
            <div>
              <p className="mb-1 font-medium text-foreground">Token usage</p>
              <p>
                Total {tokenUsage.total.toLocaleString()} · memory{" "}
                {tokenUsage.memory} · docs {tokenUsage.documents} · workspace{" "}
                {tokenUsage.workspace} · instructions {tokenUsage.instructions}
              </p>
            </div>
          )}

          <div>
            <p className="mb-1 font-medium text-foreground">Latency by source</p>
            <ul className="space-y-0.5">
              {Object.entries(diagnostics.latencyBySource).map(
                ([source, ms]) => (
                  <li key={source}>
                    {source}: {ms}ms
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <p className="mb-1 font-medium text-foreground">Ranking scores</p>
            <ul className="space-y-0.5">
              {diagnostics.rankingScores.map((r) => (
                <li key={r.id}>
                  {r.id} · {r.score.toFixed(2)} — {r.reason}
                </li>
              ))}
            </ul>
          </div>

          {diagnostics.discarded.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-foreground">Discarded</p>
              <ul className="space-y-0.5">
                {diagnostics.discarded.map((d) => (
                  <li key={d.id}>
                    {d.id} — {d.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {diagnostics.conflicts.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-foreground">Conflicts</p>
              <ul className="space-y-0.5">
                {diagnostics.conflicts.map((c) => (
                  <li key={c.id}>
                    {c.summary} → {c.resolution}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
