import { CtaButton, CtaButtonRow } from "@/components/ui/cta-button";

export function LandingBookDemo() {
  return (
    <section className="mx-auto mt-20 w-full max-w-2xl px-6 py-16 text-center sm:py-20">
      <div className="space-y-5">
        <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl md:text-[2.15rem]">
          See multi-source
          <span className="mt-1.5 block font-semibold text-neutral-400">
            orchestration on every ask.
          </span>
        </h2>
        <p className="mx-auto max-w-md text-sm font-semibold leading-relaxed text-neutral-500">
          Walk through retrieval, ranking, and orchestration, plus what&apos;s
          next for voice, real-time, and deeper paths.
        </p>
        <div className="mx-auto max-w-sm pt-1">
          <CtaButtonRow>
            <CtaButton href="/sign-in" variant="primary">
              Get started
            </CtaButton>
            <CtaButton href="/docs/sdk" variant="secondary">
              SDK
            </CtaButton>
          </CtaButtonRow>
        </div>
      </div>
    </section>
  );
}
