"use client";

import Link from "next/link";
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
import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [workspace, setWorkspace] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getWorkspace()
      .then((ws) => setWorkspace({ id: ws.id, name: ws.name }))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load workspace"),
      )
      .finally(() => setLoading(false));
  }, []);

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
    </main>
  );
}
