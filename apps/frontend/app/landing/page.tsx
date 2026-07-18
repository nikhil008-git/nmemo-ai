"use client";

import Link from "next/link";

import Microinteraction from "@/components/landing/microinteraction";

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      /> 

      <section className="relative mx-auto flex w-full max-w-5xl flex-col px-6 pb-12 pt-28 sm:pt-32">
        <div className="hero-copy flex w-full flex-col gap-10 sm:flex-row sm:items-end sm:justify-between sm:gap-16">
          <div className="min-w-0 max-w-lg flex-1"> 
            {/* cyna as secondary color and background color */}
            <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl md:text-[2.15rem]">
                Cited answers.
              <span className="mt-1.5 block font-medium text-foreground/55">
                Fewer{" "}
                <span className="rounded-md bg-blue-500/10 px-1 py-0.5 text-blue-500">
                  gaps
                </span>
                .
              </span>
            </h1>
          </div>

          <div className="flex w-full max-w-xs shrink-0 flex-col gap-6 sm:items-start ">
            <p className="text-sm text-neutral-400  leading-relaxed tracking-wide text-foreground">
              Answers from your docs with citations. Surfaces what&apos;s
              missing.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
              <Link
                href="#product"
                className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-foreground/5"
              >
                See product
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-visual mt-12 w-full sm:mt-14">
          {/* Drop a screenshot or video of the working site chat tab here */}
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-dashed border-border bg-input/40">
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <p className="text-xs font-light tracking-widest uppercase text-muted-foreground/50">
                Preview
              </p>
            </div>
          </div>
        </div>
      </section>

    <Microinteraction />
    </main>
  );
}
