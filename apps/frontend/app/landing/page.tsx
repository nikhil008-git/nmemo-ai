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
import { TraceDivider } from "@/components/landing/landing-traces";
import { CtaButton, CtaButtonRow } from "@/components/ui/cta-button";

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden text-foreground">
      <ScrollProgress />

      <section className="relative z-[2] mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
        <div className="flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-16">
          <h1 className="display-xl min-w-0 flex-1 font-normal text-balance md:max-w-[16ch]">
            Context your agents
            <span className="mt-1 block font-normal text-neutral-400 sm:mt-1.5">
              actually need.
            </span>
          </h1>

          <div className="flex w-full max-w-md flex-col gap-5 sm:gap-6 md:items-end md:text-right">
            <p className="max-w-[40ch] text-[0.9375rem] font-medium leading-relaxed text-neutral-500 sm:text-base">
              The context decision layer for AI agents. Route, rank, and budget
              what the model sees from every source, in one call.
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

      <div className="relative z-[2] w-full" id="product">
        <LandingPlayground />
      </div>

      <TraceDivider className="relative z-[2] mt-4" />

      <section className="relative z-[2] mx-auto flex w-full max-w-6xl flex-col px-6 pb-24 pt-24">
        <LandingHow />
      </section>

      <TraceDivider className="relative z-[2]" />

      <section className="relative z-[2] mx-auto flex w-full max-w-6xl flex-col px-6 pb-24 pt-8">
        <LandingIntegrations />
        <Microinteraction />
        <LandingFeatures />
      </section>

      <TraceDivider className="relative z-[2]" />

      <LandingJourney />

      <TraceDivider className="relative z-[2]" />

      <section className="relative z-[2] mx-auto flex w-full max-w-6xl flex-col px-6 pb-24 pt-8">
        <LandingRoadmap />
        <LandingCta />
      </section>

      <TraceDivider className="relative z-[2]" />

      <LandingFooter />
    </main>
  );
}
