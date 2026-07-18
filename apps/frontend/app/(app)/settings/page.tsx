"use client";

import Link from "next/link";
import { useState } from "react";

import { useSession } from "@/lib/auth-client";
import {
  createApiKey,
  initialApiKeys,
  mockUsage,
  type ApiKey,
} from "@/lib/mocks";

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [keys, setKeys] = useState<ApiKey[]>(initialApiKeys);
  const [newName, setNewName] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const key = createApiKey(newName);
    setKeys((prev) => [key, ...prev]);
    setCreatedSecret(`${key.prefix}_${crypto.randomUUID().replace(/-/g, "")}`);
    setNewName("");
  }

  function revoke(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  const usage = mockUsage;
  const sections = [
    { label: "Memory", value: usage.tokensBySection.memory },
    { label: "Documents", value: usage.tokensBySection.documents },
    { label: "Workspace", value: usage.tokensBySection.workspace },
    { label: "Instructions", value: usage.tokensBySection.instructions },
  ];
  const maxSection = Math.max(...sections.map((s) => s.value), 1);

  return (
    <main className="space-y-14">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
        <p className="text-sm font-light text-muted-foreground">
          Profile, API keys, and usage for this demo workspace.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide">Profile</h2>
        <div className="space-y-1 border border-border px-4 py-4 text-sm">
          <p>
            <span className="text-muted-foreground">Name · </span>
            {user?.name || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email · </span>
            {user?.email || "—"}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide">API keys</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Key name"
            className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create key
          </button>
        </form>
        {createdSecret && (
          <p className="border border-border px-3 py-2 text-xs text-muted-foreground">
            Copy now (shown once):{" "}
            <code className="break-all text-foreground">{createdSecret}</code>
          </p>
        )}
        <ul className="divide-y divide-border border border-border">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm">
                <p className="font-medium">{key.name}</p>
                <p className="text-xs text-muted-foreground">
                  {key.prefix}… · created {formatDate(key.createdAt)}
                  {key.lastUsedAt
                    ? ` · last used ${formatDate(key.lastUsedAt)}`
                    : " · never used"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => revoke(key.id)}
                className="self-start rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-foreground/5"
              >
                Revoke
              </button>
            </li>
          ))}
          {keys.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No API keys. Create one for SDK integrations.
            </li>
          )}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide">Usage</h2>
        <p className="text-sm text-muted-foreground">{usage.periodLabel}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-t border-border pt-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Context calls
            </p>
            <p className="mt-1 text-2xl font-bold">
              {usage.contextCalls.toLocaleString()}
            </p>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Tokens
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatTokens(usage.tokensTotal)}
            </p>
          </div>
        </div>
        <ul className="space-y-3">
          {sections.map((s) => (
            <li key={s.label} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{s.label}</span>
                <span>{formatTokens(s.value)}</span>
              </div>
              <div className="h-1.5 bg-foreground/10">
                <div
                  className="h-full bg-foreground/70"
                  style={{ width: `${(s.value / maxSection) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide">Connectors</h2>
        <p className="text-sm text-muted-foreground">
          Manage source connections on the connectors page.
        </p>
        <Link
          href="/connectors"
          className="inline-block text-sm font-medium underline-offset-4 hover:underline"
        >
          Open connectors →
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-red-500/90">
          Danger zone
        </h2>
        <div className="border border-border px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Delete workspace is disabled in this demo.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 cursor-not-allowed rounded-md border border-border px-4 py-2 text-sm opacity-40"
          >
            Delete workspace
          </button>
        </div>
      </section>
    </main>
  );
}
