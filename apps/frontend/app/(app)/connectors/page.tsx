"use client";

import { useState } from "react";

import { initialConnectors, type Connector } from "@/lib/mocks";

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);

  function toggle(id: Connector["id"]) {
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, connected: !c.connected } : c,
      ),
    );
  }

  return (
    <main className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Connectors
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
        <p className="text-sm font-light text-muted-foreground">
          Connect or disconnect context sources. Demo toggles only — no OAuth
          yet.
        </p>
      </header>

      <ul className="divide-y divide-border border border-border">
        {connectors.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">{c.name}</p>
                <span
                  className={`text-xs uppercase tracking-wider ${
                    c.connected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {c.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <p className="text-sm font-light text-muted-foreground">
                {c.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle(c.id)}
              className={
                c.connected
                  ? "shrink-0 rounded-md border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
                  : "shrink-0 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              }
            >
              {c.connected ? "Disconnect" : "Connect (demo)"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
