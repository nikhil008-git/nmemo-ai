"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  PageHeader,
  SectionLabel,
  appFieldClass,
  appPanelClass,
} from "@/components/app/page-header";
import { IdRow } from "@/components/app/workspace-ids";
import { CtaButton } from "@/components/ui/cta-button";
import { KeysListSkeleton } from "@/components/ui/loading-states";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createApiKey,
  getWorkspace,
  revokeApiKey,
  type ApiKeyRow,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const sdkSnippet = `import { createEngine } from "nmemo-sdk"

const engine = createEngine({
  apiKey: process.env.NMEMO_API_KEY!,
})

const context = await engine.getContext({
  query: "What is our refund policy?",
  userId: "user_123",
  workspaceId: "WORKSPACE_ID",
  conversationId: "conv_123",
})

// Give context.prompt to your agent
`;

export function KeysView({ preview = false }: { preview?: boolean }) {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(!preview);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    if (preview) return;
    void getWorkspace()
      .then((ws) => {
        setKeys(ws.apiKeys);
        setWorkspaceId(ws.id);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [preview]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreatedSecret(null);
    try {
      const { apiKey } = await createApiKey(newName || "API key");
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
    setRevokingId(id);
    setError(null);
    try {
      await revokeApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <main className="space-y-8">
      <PageHeader
        title="API keys"
        description={
          <>
            Same context as{" "}
            <Link
              href="/playground"
              className="text-foreground underline underline-offset-4"
            >
              Playground
            </Link>
            , for your own agents.{" "}
            <Link
              href="/docs/sdk"
              className="text-foreground underline underline-offset-4"
            >
              Integration docs
            </Link>
            .
          </>
        }
      />

      {error && !preview ? (
        <p className="break-words text-sm font-semibold text-red-500">
          {error}
        </p>
      ) : null}

      {!preview && loading ? (
        <Skeleton className="h-16 w-full rounded-sm" />
      ) : !preview && workspaceId ? (
        <div className={appPanelClass}>
          <IdRow
            label="workspaceId"
            value={workspaceId}
            hint="Use this workspace in your agents. Full profile IDs live under Account."
          />
        </div>
      ) : null}
      {!preview && !loading && workspaceId ? (
        <p className="-mt-4 text-xs font-semibold text-neutral-500">
          Need userId too?{" "}
          <Link
            href="/settings"
            className="text-foreground underline underline-offset-4"
          >
            Open Account
          </Link>
        </p>
      ) : null}

      <section className="space-y-4">
        <SectionLabel>API keys</SectionLabel>
        <form
          onSubmit={(e) => {
            if (preview) {
              e.preventDefault();
              return;
            }
            void handleCreate(e);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Key name"
            disabled={loading || preview}
            readOnly={preview}
            className={appFieldClass}
          />
          <CtaButton
            type="submit"
            loading={busy}
            disabled={loading || preview}
            size="compact"
          >
            Create key
          </CtaButton>
        </form>
        {createdSecret && (
          <p className="rounded-sm border border-border bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-600">
            Copy now (shown once):{" "}
            <code className="break-all text-foreground">{createdSecret}</code>
          </p>
        )}
        {loading && !preview ? (
          <KeysListSkeleton />
        ) : (
          <ul className={cn(appPanelClass, "divide-y divide-border")}>
            {keys.map((key) => (
              <li
                key={key.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="text-sm">
                  <p className="font-heading font-semibold">{key.name}</p>
                  <p className="text-xs font-semibold text-neutral-500">
                    {key.prefix}… · created {formatDate(key.createdAt)}
                  </p>
                </div>
                <CtaButton
                  type="button"
                  variant="outline"
                  size="compact"
                  loading={revokingId === key.id}
                  disabled={busy || revokingId !== null || preview}
                  onClick={() => void handleRevoke(key.id)}
                  className="self-start"
                >
                  Revoke
                </CtaButton>
              </li>
            ))}
            {keys.length === 0 && (
              <li className="px-4 py-3 text-sm font-semibold text-neutral-500">
                No keys yet. Create one for your agents.
              </li>
            )}
          </ul>
        )}
      </section>

      {!preview ? (
        <section className="space-y-3">
          <SectionLabel>Example</SectionLabel>
          <pre
            className={cn(
              appPanelClass,
              "overflow-x-auto bg-neutral-50 p-4 text-xs font-medium leading-relaxed",
            )}
          >
            <code>
              {sdkSnippet.replace(
                "WORKSPACE_ID",
                workspaceId ?? "your_workspace_id",
              )}
            </code>
          </pre>
        </section>
      ) : null}
    </main>
  );
}

export default function KeysPage() {
  return <KeysView />;
}
