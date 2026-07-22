"use client";

import Link from "next/link";

import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { useConnectors } from "@/lib/connectors-store";

const steps = [
  {
    href: "/connectors",
    label: "Connect your sources",
    description:
      "Bring Slack, Notion, GitHub, memory, and more into one place.",
  },
  {
    href: "/sources",
    label: "Add workspace knowledge",
    description:
      "Give your agents the docs and knowledge they should reason over.",
  },
  {
    href: "/playground",
    label: "See context in action",
    description: "Ask a question and see which context gets used.",
  },
  {
    href: "/keys",
    label: "Ship it to your agents",
    description: "Use the same context in whatever agents you already run.",
  },
] as const;

export function HomeView() {
  const { data: session } = useSession();
  const { connectors, loading } = useConnectors();

  const connected = connectors.filter(
    (c) =>
      c.status === "connected" &&
      c.type !== "qdrant" &&
      c.type !== "groq",
  );
  const user = session?.user;
  const showSkeleton = loading && connectors.length === 0;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-5 px-1 py-4 sm:gap-6 sm:px-0 sm:py-6">
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-[1.5rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-[1.75rem] md:text-3xl">
          {user?.name ? `Hey, ${user.name}` : "Your workspace"}
        </h1>
        <p className="px-1 text-sm font-semibold leading-relaxed text-neutral-500">
          Orchestrate the right context for your agents, across every source.
        </p>
        {showSkeleton ? (
          <div className="flex justify-center">
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <p className="break-words px-1 text-sm font-semibold leading-relaxed text-neutral-500">
            <span className="text-foreground">{connected.length}</span> source
            {connected.length === 1 ? "" : "s"} connected
            {connected.length > 0
              ? ` · ${connected.map((c) => c.type).join(", ")}`
              : ""}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <CtaButton href="/playground" fullWidth>
          Open chat
        </CtaButton>
        <CtaButton href="/connectors" variant="outline" fullWidth>
          Connect sources
        </CtaButton>
      </div>

      <ul className="space-y-1.5 text-left">
        {steps.map((step, i) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex gap-3 rounded-sm border border-border px-3 py-2.5 transition-colors hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-50"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-neutral-900 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="font-heading block text-sm font-semibold tracking-[-0.02em]">
                  {step.label}
                </span>
                <span className="mt-0.5 block text-xs font-semibold leading-relaxed text-neutral-500">
                  {step.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="pb-2 text-center text-xs font-semibold text-neutral-500">
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

export default function HomePage() {
  return <HomeView />;
}
