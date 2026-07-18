"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  createApiKey,
  getWorkspace,
  listApiKeys,
  revokeApiKey,
  type ApiKeyRow,
} from "@/lib/api";
import { CtaButton } from "@/components/ui/cta-button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const sdkSnippet = `import { createEngine } from "@contextengine/sdk";

const engine = createEngine({
  apiKey: process.env.NMEMO_API_KEY!,
  baseUrl: "http://localhost:8080", // your API
});

const ctx = await engine.getContext({
  query: "What did we decide about billing?",
  userId: "user_123",
  workspaceId: "WORKSPACE_ID",
});

// Feed ctx.prompt to your LLM — citations in ctx.citations
`;

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([listApiKeys(), getWorkspace()])
      .then(([keysRes, ws]) => {
        setKeys(keysRes.apiKeys);
        setWorkspaceId(ws.id);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreatedSecret(null);
    try {
      const { apiKey } = await createApiKey(newName || "SDK key");
      setKeys((prev) => [
        {
          id: apiKey.id,
          name: apiKey.name,
          prefix: apiKey.prefix,
          createdAt: apiKey.createdAt,
        },
        ...prev,
      ]);
      setCreatedSecret(apiKey.secret);
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(id: string) {
    setBusy(true);
    setError(null);
    try {
      await revokeApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Keys & SDK</h1>
        <p className="max-w-xl text-sm font-medium text-muted-foreground">
          Same engine as the{" "}
          <Link href="/playground" className="underline underline-offset-4">
            Playground
          </Link>
          . Create a key, call{" "}
          <code className="text-foreground/80">getContext()</code> from your
          agent.{" "}
          <Link href="/docs/sdk" className="underline underline-offset-4">
            SDK docs
          </Link>
          .
        </p>
        {workspaceId && (
          <p className="text-xs text-muted-foreground">
            Workspace ID ·{" "}
            <code className="text-foreground/80">{workspaceId}</code>
          </p>
        )}
      </header>

      {error && <p className="break-words text-sm text-red-500">{error}</p>}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide">API keys</h2>
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Key name"
            className="min-w-0 flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
          <CtaButton type="submit" disabled={busy} size="compact">
            Create key
          </CtaButton>
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
                </p>
              </div>
              <CtaButton
                type="button"
                variant="outline"
                size="compact"
                disabled={busy}
                onClick={() => void handleRevoke(key.id)}
                className="self-start"
              >
                Revoke
              </CtaButton>
            </li>
          ))}
          {keys.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No keys yet. Create one to call the SDK.
            </li>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide">Quick start</h2>
        <pre className="overflow-x-auto border border-border bg-input/50 p-4 text-xs leading-relaxed">
          <code>
            {sdkSnippet.replace(
              "WORKSPACE_ID",
              workspaceId ?? "your_workspace_id",
            )}
          </code>
        </pre>
        <p className="text-sm text-muted-foreground">
          Test the same call in the{" "}
          <Link href="/playground" className="underline underline-offset-4">
            Playground
          </Link>{" "}
          first.
        </p>
      </section>
    </main>
  );
}
