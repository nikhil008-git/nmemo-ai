import { Construction } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";

export default function PlaygroundPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-4 sm:py-8">
      <PageHeader
        title="Playground"
        description="A guided way to inspect retrieval, citations, and context quality."
      />

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-sm border border-dashed border-border bg-surface px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-panel text-neutral-500">
          <Construction size={20} strokeWidth={1.6} aria-hidden="true" />
        </div>
        <p className="mt-5 text-sm font-semibold text-foreground">
          We&apos;re working on the playground.
        </p>
        <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-neutral-500">
          It&apos;ll be available soon with a focused way to explore your workspace context.
        </p>
      </div>
    </section>
  );
}
