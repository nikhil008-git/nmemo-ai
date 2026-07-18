"use client";

import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingIntegrations } from "@/components/landing/landing-integrations";
import { LandingPlayground } from "@/components/landing/landing-playground";
import Microinteraction from "@/components/landing/microinteraction";
import { CtaButton, CtaButtonRow } from "@/components/ui/cta-button";

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-12 pt-28 sm:pt-32">
        <div className="hero-copy flex w-full flex-col gap-6">
          <div className="min-w-0 max-w-2xl space-y-3">
            <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl md:text-[2.35rem]">
              Context your agents
              <span className="mt-1.5 block font-semibold text-neutral-400">
                actually need.
              </span>
            </h1>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-6">
            <p className="text-sm font-semibold leading-relaxed text-neutral-500">
              Pull in your docs, Slack, Notion, and GitHub. Get the right context
              for every answer, with clear sources, ready for your AI. Try it in the
              Playground first.
            </p>

            <CtaButtonRow>
              <CtaButton href="/sign-up" variant="primary">
                Get started
              </CtaButton>
              <CtaButton href="/docs" variant="secondary">
                Read docs
              </CtaButton>
            </CtaButtonRow>
          </div>
        </div>

        <div className="mt-12 w-full sm:mt-14" id="product">
          <LandingPlayground />
        </div>

        <Microinteraction />
        <LandingFeatures />
        <LandingIntegrations />
      </section>
    </main>
  );
}
