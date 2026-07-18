"use client";

import { AppShell } from "@/components/app/app-shell";
import { useSession } from "@/lib/auth-client";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <p className="mt-8 text-center text-muted-foreground">Loading…</p>
    );
  }

  if (session?.user) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <div className="flex flex-1 flex-col pt-20">
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16">{children}</div>
    </div>
  );
}
