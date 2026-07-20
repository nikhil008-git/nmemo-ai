"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getConnectors,
  oauthStartUrl,
  updateConnector,
  type Connector,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type ConnectorKind = "oauth" | "key" | "soon";

type CatalogItem = {
  type: string;
  name: string;
  description: string;
  kind: ConnectorKind;
  tokenHint?: string;
  tokenPlaceholder?: string;
  helpHref?: string;
};

const LIVE: CatalogItem[] = [
  {
    type: "mem0",
    name: "Memory",
    description: "Long-term preferences and facts.",
    kind: "key",
    tokenPlaceholder: "API key",
    helpHref: "https://app.mem0.ai",
  },
  {
    type: "slack",
    name: "Slack",
    description: "Search messages for context.",
    kind: "oauth",
    tokenHint: "User token (xoxp-) with search:read — not a bot xoxb- token.",
    tokenPlaceholder: "xoxp-…",
    helpHref: "https://api.slack.com/apps",
  },
  {
    type: "notion",
    name: "Notion",
    description: "Pull pages into context.",
    kind: "oauth",
    tokenHint: "Internal integration secret.",
    tokenPlaceholder: "ntn_… or secret_…",
    helpHref: "https://www.notion.so/my-integrations",
  },
  {
    type: "github",
    name: "GitHub",
    description: "Issues and PRs for context.",
    kind: "oauth",
    tokenHint: "Classic PAT with repo scope.",
    tokenPlaceholder: "ghp_…",
    helpHref: "https://github.com/settings/tokens",
  },
];

const SOON: CatalogItem[] = [
  {
    type: "mcp",
    name: "MCP",
    description: "Many tools through one standard.",
    kind: "soon",
  },
  {
    type: "gmail",
    name: "Gmail / Drive",
    description: "Email and Drive context.",
    kind: "soon",
  },
  {
    type: "linear",
    name: "Linear / Jira",
    description: "Tickets alongside your code.",
    kind: "soon",
  },
  {
    type: "sql",
    name: "SQL",
    description: "Query business databases.",
    kind: "soon",
  },
  {
    type: "crm",
    name: "CRM",
    description: "Customer context from your CRM.",
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

const fieldClass =
  "min-w-0 w-full rounded-sm border border-border bg-white px-3 py-2 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-foreground/30 disabled:opacity-50";

export function ConnectorsClient() {
  const search = useSearchParams();
  const [byType, setByType] = useState<Record<string, Connector>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyType, setBusyType] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [openType, setOpenType] = useState<string | null>(null);
  const [showSoon, setShowSoon] = useState(false);

  const refresh = useCallback(async () => {
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
    if (connected) {
      setNotice(`${connected} connected.`);
      void refresh();
    }
    if (err) setError(decodeURIComponent(err));
  }, [search, refresh]);

  const rows = useMemo(
    () =>
      LIVE.map((meta) => ({
        meta,
        connector: byType[meta.type] ?? placeholder(meta.type),
      })),
    [byType],
  );

  const connectedCount = useMemo(
    () => rows.filter((r) => r.connector.status === "connected").length,
    [rows],
  );

  const connectedTypes = useMemo(
    () =>
      rows
        .filter((r) => r.connector.status === "connected")
        .map((r) => r.meta.type)
        .join(", "),
    [rows],
  );

  function upsert(connector: Connector) {
    setByType((prev) => ({ ...prev, [connector.type]: connector }));
  }

  async function disconnect(type: string) {
    setBusyType(type);
    setError(null);
    try {
      const { connector } = await updateConnector(type, {
        status: "disconnected",
      });
      upsert(connector);
      setOpenType(null);
      setNotice(`${type} disconnected.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    } finally {
      setBusyType(null);
    }
  }

  async function connectWithToken(type: string, e: React.FormEvent) {
    e.preventDefault();
    const value = (tokens[type] ?? "").trim();
    if (!value) return;
    setBusyType(type);
    setError(null);
    try {
      const config =
        type === "mem0" || type === "groq"
          ? { apiKey: value }
          : { accessToken: value };
      const { connector } = await updateConnector(type, { config });
      upsert(connector);
      setTokens((prev) => ({ ...prev, [type]: "" }));
      setOpenType(null);
      setNotice(`${type} connected.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connect failed");
    } finally {
      setBusyType(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 py-6">
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl">
          Connectors
        </h1>
        <p className="text-sm font-semibold leading-relaxed text-neutral-500">
          Paste a token once, saved on your workspace.
        </p>
        {loading ? (
          <div className="flex justify-center">
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <p className="text-sm font-semibold leading-relaxed text-neutral-500">
            <span className="text-foreground">{connectedCount}</span> source
            {connectedCount === 1 ? "" : "s"} connected
            {connectedCount > 0 ? ` · ${connectedTypes}` : ""}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <CtaButton href="/playground" fullWidth>
          See it work
        </CtaButton>
        <CtaButton href="/sources" variant="outline" fullWidth>
          Add documents
        </CtaButton>
      </div>

      {notice ? (
        <p className="text-center text-xs font-semibold text-neutral-500">
          {notice}
        </p>
      ) : null}
      {error ? (
        <div className="space-y-1 text-center">
          <p className="break-words text-sm font-semibold text-red-500">
            {error}
          </p>
          {needsSignIn ? (
            <Link
              href="/sign-in"
              className="inline-block text-sm font-semibold underline underline-offset-4"
            >
              Sign in →
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void refresh()}
              className="text-sm font-semibold underline underline-offset-4"
            >
              Retry
            </button>
          )}
        </div>
      ) : null}

      <ul className="space-y-1.5 text-left">
        {rows.map(({ meta, connector: c }, i) => {
          const connected = c.status === "connected";
          const oauthReady = c.oauthConfigured === true;
          const expanded = openType === meta.type;
          const tokenValue = tokens[meta.type] ?? "";
          const busy = busyType === meta.type;

          return (
            <li key={meta.type}>
              <div
                className={cn(
                  "rounded-sm border border-border px-3 py-2.5 transition-colors",
                  expanded && "border-neutral-300 bg-neutral-50",
                )}
              >
                <div className="flex gap-3">
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold",
                      connected
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-500",
                    )}
                  >
                    {connected ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading text-sm font-semibold tracking-[-0.02em]">
                          {meta.name}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold leading-relaxed text-neutral-500">
                          {meta.description}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 pt-0.5 text-xs font-semibold">
                        {(meta.kind === "oauth" || meta.kind === "key") &&
                        connected ? (
                          <button
                            type="button"
                            disabled={needsSignIn || busy}
                            onClick={() => void disconnect(meta.type)}
                            className="text-neutral-500 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-40"
                          >
                            {busy ? "…" : "Off"}
                          </button>
                        ) : null}

                        {(meta.kind === "oauth" || meta.kind === "key") &&
                        !connected ? (
                          <>
                            {meta.kind === "oauth" && oauthReady ? (
                              <Link
                                href={
                                  needsSignIn
                                    ? "/sign-in"
                                    : oauthStartUrl(
                                        meta.type as
                                          | "github"
                                          | "slack"
                                          | "notion",
                                      )
                                }
                                className="text-neutral-500 underline-offset-4 hover:text-foreground hover:underline"
                              >
                                OAuth
                              </Link>
                            ) : null}
                            <button
                              type="button"
                              disabled={needsSignIn}
                              onClick={() =>
                                setOpenType((t) =>
                                  t === meta.type ? null : meta.type,
                                )
                              }
                              className="text-foreground underline-offset-4 hover:underline disabled:opacity-40"
                            >
                              {expanded ? "Cancel" : "Connect"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {expanded &&
                    (meta.kind === "oauth" || meta.kind === "key") &&
                    !connected ? (
                      <form
                        onSubmit={(e) => void connectWithToken(meta.type, e)}
                        className="mt-3 space-y-2 border-t border-border pt-3"
                      >
                        <p className="text-[11px] font-semibold text-neutral-500">
                          {meta.tokenHint ?? "Paste your key."}{" "}
                          {meta.helpHref ? (
                            <a
                              href={meta.helpHref}
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-2"
                            >
                              Get key
                            </a>
                          ) : null}
                        </p>
                        <div className="flex gap-2">
                          <input
                            value={tokenValue}
                            onChange={(e) =>
                              setTokens((prev) => ({
                                ...prev,
                                [meta.type]: e.target.value,
                              }))
                            }
                            type="password"
                            placeholder={
                              meta.tokenPlaceholder ?? "Access token"
                            }
                            disabled={needsSignIn}
                            autoComplete="off"
                            autoFocus
                            className={fieldClass}
                          />
                          <button
                            type="submit"
                            disabled={
                              !tokenValue.trim() || needsSignIn || busy
                            }
                            className="shrink-0 rounded-sm bg-neutral-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            {busy ? "…" : "Save"}
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setShowSoon((v) => !v)}
          className="w-full text-center text-xs font-semibold text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-foreground"
        >
          {showSoon ? "Hide coming soon" : "Coming soon"}
        </button>
        {showSoon ? (
          <ul className="space-y-1.5 text-left">
            {SOON.map((meta) => (
              <li
                key={meta.type}
                className="flex gap-3 rounded-sm border border-border px-3 py-2.5 opacity-70"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-[9px] font-bold uppercase text-neutral-400">
                  Soon
                </span>
                <span className="min-w-0">
                  <span className="font-heading block text-sm font-semibold tracking-[-0.02em] text-neutral-500">
                    {meta.name}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold leading-relaxed text-neutral-400">
                    {meta.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className="text-center text-xs font-semibold text-neutral-500">
        Building agents already?{" "}
        <Link
          href="/docs/sdk"
          className="text-foreground underline underline-offset-4"
        >
          Integrate in code
        </Link>
      </p>
    </div>
  );
}
