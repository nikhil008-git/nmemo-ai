import Link from "next/link";

import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const steps = [
  {
    href: "/connectors",
    label: "Connect memory and sources",
    description: "Memory, Slack, Notion, and GitHub are live today.",
  },
  {
    href: "/sources",
    label: "Add workspace knowledge",
    description: "Upload the documents your agents should reason over.",
  },
  {
    href: "/playground",
    label: "Run a question",
    description: "See which context gets selected, and what it costs.",
  },
  {
    href: "/keys",
    label: "Create an API key",
    description: "Call getContext() from the agents you already run.",
  },
] as const;

export function HomeDashboard({
  userName,
  connectedSources,
  loading = false,
  forceDesktop = false,
}: {
  userName?: string | null;
  connectedSources: readonly { type: string }[];
  loading?: boolean;
  forceDesktop?: boolean;
}) {
  const showSkeleton = loading && connectedSources.length === 0;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-5 px-1 py-4 sm:gap-6 sm:px-0 sm:py-6">
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-[1.5rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-[1.75rem] md:text-3xl">
          {userName ? `Welcome, ${userName}` : "Welcome to your workspace"}
        </h1>
        <p className="px-1 text-sm font-semibold leading-relaxed text-neutral-500">
          Four steps to a workspace that hands your agents verified context.
        </p>
        {showSkeleton ? (
          <div className="flex justify-center">
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <p className="break-words px-1 text-sm font-semibold leading-relaxed text-neutral-500">
            <span className="text-foreground">{connectedSources.length}</span>{" "}
            source{connectedSources.length === 1 ? "" : "s"} connected
            {connectedSources.length > 0
              ? ` · ${connectedSources.map((source) => source.type).join(", ")}`
              : ""}
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row",
          forceDesktop && "flex-row",
        )}
      >
        <CtaButton href="/playground" fullWidth>
          See it work
        </CtaButton>
        <CtaButton href="/connectors" variant="outline" fullWidth>
          Connect sources
        </CtaButton>
      </div>

      <ul className="space-y-1.5 text-left">
        {steps.map((step, index) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex gap-3 rounded-sm border border-border px-3 py-2.5 transition-colors hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-50"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary text-[10px] font-bold text-secondary-foreground">
                {index + 1}
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
