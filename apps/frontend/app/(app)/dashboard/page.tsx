"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { signOut, useSession } from "@/lib/auth-client";
import { hubLinks, mockDashboard } from "@/lib/mocks";

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <p className="mt-8 text-center text-muted-foreground">Loading…</p>
    );
  }
  if (!session?.user) {
    return (
      <p className="mt-8 text-center text-muted-foreground">Redirecting…</p>
    );
  }

  const { user } = session;
  const stats = mockDashboard;

  return (
    <main className="space-y-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user.name || "User"}
          </h1>
          <p className="text-sm font-light text-muted-foreground">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="self-start rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          Sign out
        </button>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        <Stat label="Context calls" value={stats.contextCalls.toLocaleString()} />
        <Stat label="Tokens used" value={formatTokens(stats.tokensUsed)} />
        <Stat label="Connected sources" value={String(stats.connectedSources)} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide">Go to</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {hubLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group border border-border px-4 py-4 transition-colors hover:border-foreground/40"
            >
              <p className="text-sm font-semibold group-hover:underline">
                {link.label}
              </p>
              <p className="mt-1 text-sm font-light text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide">
          Recent context calls
        </h2>
        <ul className="divide-y divide-border border border-border">
          {stats.recentCalls.map((call) => (
            <li
              key={call.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm">{call.query}</p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {call.latencyMs}ms · {call.sourceCount} sources ·{" "}
                {formatTime(call.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border pt-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
