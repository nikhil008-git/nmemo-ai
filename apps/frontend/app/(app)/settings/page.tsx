"use client";

import Link from "next/link";

import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Account</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Profile for this workspace. API keys live under{" "}
          <Link href="/keys" className="underline underline-offset-4">
            API
          </Link>
          .
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide">Shortcuts</h2>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <Link href="/keys" className="underline-offset-4 hover:underline">
            API keys →
          </Link>
          <Link
            href="/connectors"
            className="underline-offset-4 hover:underline"
          >
            Connectors →
          </Link>
          <Link href="/playground" className="underline-offset-4 hover:underline">
            Playground →
          </Link>
        </div>
      </section>
    </main>
  );
}
