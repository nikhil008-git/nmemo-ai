"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  PageHeader,
  SectionLabel,
  appPanelClass,
} from "@/components/app/page-header";
import { WorkspaceIdsCard } from "@/components/app/workspace-ids";
import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkspace } from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canDelete =
    Boolean(user?.email) &&
    confirmText.trim().toLowerCase() === user!.email!.toLowerCase();

  useEffect(() => {
    void getWorkspace()
      .then((ws) => setWorkspace({ id: ws.id, name: ws.name }))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load workspace"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function deleteAccount() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(body?.error || "Failed to delete account");
      }
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account",
      );
      setDeleting(false);
    }
  }

  return (
    <main className="space-y-8">
      <PageHeader
        title="Account"
        description={
          <>
            Profile and workspace IDs for your agents. Keys live under{" "}
            <Link
              href="/keys"
              className="text-foreground underline underline-offset-4"
            >
              API
            </Link>
            .
          </>
        }
      />

      {error ? (
        <p className="text-sm font-semibold text-red-500">{error}</p>
      ) : null}

      <section className="space-y-3">
        <SectionLabel>Profile</SectionLabel>
        <div className={`${appPanelClass} space-y-2 px-4 py-4 text-sm`}>
          <p className="font-semibold">
            <span className="text-neutral-500">Name · </span>
            {user?.name || "—"}
          </p>
          <p className="font-semibold">
            <span className="text-neutral-500">Email · </span>
            {user?.email || "—"}
          </p>
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-28 w-full rounded-sm" />
        </div>
      ) : workspace ? (
        <WorkspaceIdsCard
          workspaceName={workspace.name}
          workspaceId={workspace.id}
          accountUserId={user?.id}
        />
      ) : null}

      <section className="space-y-3">
        <SectionLabel>Shortcuts</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <CtaButton href="/keys" variant="outline" size="compact">
            API keys
          </CtaButton>
          <CtaButton href="/connectors" variant="outline" size="compact">
            Connectors
          </CtaButton>
          <CtaButton href="/playground" size="compact">
            Playground
          </CtaButton>
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Danger zone</SectionLabel>
        <div className={`${appPanelClass} space-y-4 border-red-200 px-4 py-4`}>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Delete account permanently
            </p>
            <p className="text-xs font-semibold leading-relaxed text-neutral-500">
              Removes your profile, sessions, API keys, and sole-owned
              workspaces. This cannot be undone.
            </p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-neutral-500">
              Type your email to confirm
            </span>
            <input
              type="email"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={user?.email || "you@example.com"}
              className="w-full rounded-sm border border-border bg-white px-3 py-2 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-foreground/30"
            />
          </label>
          {deleteError ? (
            <p className="text-sm font-semibold text-red-500">{deleteError}</p>
          ) : null}
          <CtaButton
            type="button"
            variant="outline"
            size="compact"
            loading={deleting}
            disabled={!canDelete || deleting}
            onClick={() => void deleteAccount()}
            className="!border-red-300 !text-red-600 hover:!bg-red-50"
          >
            Delete account forever
          </CtaButton>
        </div>
      </section>
    </main>
  );
}
