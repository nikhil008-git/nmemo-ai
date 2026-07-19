"use client";

import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHow } from "@/components/landing/landing-how";
import { LandingIntegrations } from "@/components/landing/landing-integrations";
import { LandingJourney } from "@/components/landing/landing-journey";
import { LandingPlayground } from "@/components/landing/landing-playground";
import { LandingRoadmap } from "@/components/landing/landing-roadmap";
import Microinteraction from "@/components/landing/microinteraction";
import { ScrollProgress } from "@/components/landing/scroll-progress";
import { CtaButton, CtaButtonRow } from "@/components/ui/cta-button";

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden text-foreground">
      <ScrollProgress />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        aria-hidden="true"
      />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-4 pb-8 pt-28 sm:px-6 sm:pb-10 sm:pt-36">
        <div className="flex w-full flex-col gap-6 sm:gap-8 md:flex-row md:items-end md:justify-between md:gap-16">
          <h1 className="min-w-0 flex-1 text-[1.625rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl md:max-w-[16ch] md:text-[2.35rem]">
            Context your agents
            <span className="mt-1 block font-semibold text-neutral-400 sm:mt-1.5">
              actually need.
            </span>
          </h1>

          <div className="flex w-full max-w-md flex-col gap-5 sm:gap-6 md:items-end md:text-right">
            <p className="max-w-[36ch] text-[0.9375rem] font-semibold leading-relaxed text-neutral-500 sm:max-w-none sm:text-sm">
              The context decision layer for AI agents. Route, rank, and budget
              what the model sees — from every source, in one call.
            </p>

            <CtaButtonRow className="md:justify-end">
              <CtaButton href="/docs" variant="secondary">
                Read the docs
              </CtaButton>
              <CtaButton href="/sign-in" variant="primary">
                Get started
              </CtaButton>
            </CtaButtonRow>
          </div>
        </div>
      </section>

      <div className="relative w-full" id="product">
        <LandingPlayground />
      </div>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-12 pt-12">
        <LandingHow />
      </section>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-12">
        <LandingIntegrations />
        <Microinteraction />
        <LandingFeatures />
      </section>

      <LandingJourney />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-12">
        <LandingRoadmap />
        <LandingCta />
      </section>

      <LandingFooter />
    </main>
  );
}
