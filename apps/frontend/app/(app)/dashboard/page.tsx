"use client";

import { useEffect, useState } from "react";

import { WorkspaceDashboard } from "@/components/workspace/workspace-dashboard";
import { getWorkspace } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getWorkspace()
      .then((ws) => {
        if (!cancelled) setName(ws.name);
      })
      .catch(() => {
        /* the shell redirects when there is no workspace */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WorkspaceDashboard
      workspaceName={name ?? session?.user?.name ?? "Workspace"}
    />
  );
}
