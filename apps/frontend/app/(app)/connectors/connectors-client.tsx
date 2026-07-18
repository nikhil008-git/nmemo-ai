"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getConnectors,
  oauthStartUrl,
  updateConnector,
  type Connector,
} from "@/lib/api";
import { CtaButton } from "@/components/ui/cta-button";

type ConnectorKind = "oauth" | "key" | "toggle" | "soon";

type CatalogItem = {
  type: string;
  name: string;
  description: string;
  kind: ConnectorKind;
};

const CATALOG: CatalogItem[] = [
  {
    type: "qdrant",
    name: "Documents (Qdrant)",
    description: "Upload PDFs on Sources — retrieved into getContext().",
    kind: "toggle",
  },
  {
    type: "mem0",
    name: "mem0",
    description: "Long-term memory. Paste your API key from app.mem0.ai.",
    kind: "key",
  },
  {
    type: "slack",
    name: "Slack",
    description: "Channels and message search via OAuth.",
    kind: "oauth",
  },
  {
    type: "notion",
    name: "Notion",
    description: "Workspace pages via OAuth.",
    kind: "oauth",
  },
  {
    type: "github",
    name: "GitHub",
    description: "Issues and pull requests via OAuth.",
    kind: "oauth",
  },
  {
    type: "mcp",
    name: "MCP",
    description: "Generic MCP server connector.",
    kind: "soon",
  },
];

function placeholder(type: string): Connector {
  return {
    id: `local-${type}`,
    type,
    status: "disconnected",
    config: {},
    updatedAt: new Date(0).toISOString(),
  };
}

export function ConnectorsClient() {
  const search = useSearchParams();
  const [byType, setByType] = useState<Record<string, Connector>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyType, setBusyType] = useState<string | null>(null);
  const [mem0Key, setMem0Key] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsSignIn(false);
    try {
      const r = await getConnectors();
      const next: Record<string, Connector> = {};
      for (const c of r.connectors) next[c.type] = c;
      setByType(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load";
      if (/unauthorized/i.test(msg)) {
        setNeedsSignIn(true);
        setError("Sign in to connect sources.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const connected = search.get("connected");
    const err = search.get("error");
    const isDev = search.get("dev") === "1";
    if (connected) {
      setNotice(
        isDev
          ? `${connected} connected (local mock — add OAuth keys for real ${connected}).`
          : `${connected} connected.`,
      );
      void refresh();
    }
    if (err) setError(decodeURIComponent(err));
  }, [search, refresh]);

  const rows = useMemo(
    () =>
      CATALOG.map((meta) => ({
        meta,
        connector: byType[meta.type] ?? placeholder(meta.type),
      })),
    [byType],
  );

  function upsert(connector: Connector) {
    setByType((prev) => ({ ...prev, [connector.type]: connector }));
  }

  async function toggleQdrant(current: Connector) {
    setBusyType("qdrant");
    setError(null);
    try {
      const next =
        current.status === "connected" ? "disconnected" : "connected";
      const { connector } = await updateConnector("qdrant", { status: next });
      upsert(connector);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyType(null);
    }
  }

  async function disconnect(type: string) {
    setBusyType(type);
    setError(null);
    try {
      const { connector } = await updateConnector(type, {
        status: "disconnected",
      });
      upsert(connector);
      setNotice(`${type} disconnected.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusyType(null);
    }
  }

  async function connectMem0(e: React.FormEvent) {
    e.preventDefault();
    if (!mem0Key.trim()) return;
    setBusyType("mem0");
    setError(null);
    try {
      const { connector } = await updateConnector("mem0", {
        config: { apiKey: mem0Key.trim() },
      });
      upsert(connector);
      setMem0Key("");
      setNotice("mem0 connected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "mem0 connect failed");
    } finally {
      setBusyType(null);
    }
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Connectors</h1>
        <p className="max-w-xl text-sm font-medium text-muted-foreground">
          Opt in which sources{" "}
          <Link href="/docs/sdk" className="underline underline-offset-4">
            getContext()
          </Link>{" "}
          can search. Upload PDFs on{" "}
          <Link href="/sources" className="underline underline-offset-4">
            Sources
          </Link>
          , then prove it in the{" "}
          <Link href="/playground" className="underline underline-offset-4">
            Playground
          </Link>
          .
        </p>
      </header>

      {notice && (
        <p className="border border-border px-3 py-2 text-sm text-foreground/80">
          {notice}
        </p>
      )}
      {error && (
        <div className="space-y-2">
          <p className="break-words text-sm text-red-500">{error}</p>
          {needsSignIn && (
            <Link
              href="/sign-in"
              className="inline-block text-sm font-medium underline underline-offset-4"
            >
              Sign in →
            </Link>
          )}
          {!needsSignIn && (
            <button
              type="button"
              onClick={() => void refresh()}
              className="text-sm font-medium underline underline-offset-4"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">Loading connection status…</p>
      )}

      <ul className="divide-y divide-border border border-border">
        {rows.map(({ meta, connector: c }) => {
          const connected = c.status === "connected";
          const oauthReady = c.oauthConfigured !== false;
          return (
            <li key={meta.type} className="space-y-3 px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold">{meta.name}</p>
                    <span
                      className={`text-xs uppercase tracking-wider ${
                        connected
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {loading && !byType[meta.type]
                        ? "…"
                        : connected
                          ? "Connected"
                          : "Disconnected"}
                    </span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">
                    {meta.description}
                  </p>
                  {connected && c.config?.accountLogin != null && (
                    <p className="text-xs text-muted-foreground">
                      Account · {String(c.config.accountLogin)}
                    </p>
                  )}
                  {connected && c.config?.teamName != null && (
                    <p className="text-xs text-muted-foreground">
                      Team · {String(c.config.teamName)}
                    </p>
                  )}
                  {connected && c.config?.workspaceName != null && (
                    <p className="text-xs text-muted-foreground">
                      Workspace · {String(c.config.workspaceName)}
                    </p>
                  )}
                  {connected && Boolean(c.config?.hasApiKey) && (
                    <p className="text-xs text-muted-foreground">
                      Key · {String(c.config.apiKeyPreview ?? "••••")}
                    </p>
                  )}
                  {meta.kind === "oauth" &&
                    !connected &&
                    c.oauthConfigured === false && (
                      <p className="text-xs text-muted-foreground">
                        Not enabled on this deployment yet.
                      </p>
                    )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {meta.kind === "toggle" && (
                    <>
                      <CtaButton href="/sources" variant="outline" size="compact">
                        Manage docs
                      </CtaButton>
                      <CtaButton
                        type="button"
                        variant={connected ? "outline" : "primary"}
                        size="compact"
                        disabled={busyType === "qdrant" || needsSignIn}
                        onClick={() => void toggleQdrant(c)}
                      >
                        {connected ? "Disconnect" : "Connect"}
                      </CtaButton>
                    </>
                  )}

                  {meta.kind === "oauth" &&
                    (connected ? (
                      <CtaButton
                        type="button"
                        variant="outline"
                        size="compact"
                        disabled={busyType === meta.type || needsSignIn}
                        onClick={() => void disconnect(meta.type)}
                      >
                        Disconnect
                      </CtaButton>
                    ) : oauthReady ? (
                      <CtaButton
                        href={
                          needsSignIn
                            ? "/sign-in"
                            : oauthStartUrl(
                                meta.type as "github" | "slack" | "notion",
                              )
                        }
                        size="compact"
                      >
                        Connect with {meta.name}
                      </CtaButton>
                    ) : (
                      <span className="rounded-md border border-border px-3.5 py-2 text-sm text-muted-foreground">
                        Unavailable
                      </span>
                    ))}

                  {meta.kind === "key" && connected && (
                    <CtaButton
                      type="button"
                      variant="outline"
                      size="compact"
                      disabled={busyType === "mem0" || needsSignIn}
                      onClick={() => void disconnect("mem0")}
                    >
                      Disconnect
                    </CtaButton>
                  )}

                  {meta.kind === "soon" && (
                    <span className="text-sm text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>

              {meta.kind === "key" && !connected && (
                <form
                  onSubmit={(e) => void connectMem0(e)}
                  className="flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    value={mem0Key}
                    onChange={(e) => setMem0Key(e.target.value)}
                    type="password"
                    placeholder="mem0 API key"
                    disabled={needsSignIn}
                    className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-foreground/40 disabled:opacity-40"
                  />
                  <CtaButton
                    type="submit"
                    size="compact"
                    disabled={
                      busyType === "mem0" || !mem0Key.trim() || needsSignIn
                    }
                  >
                    Save key
                  </CtaButton>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
