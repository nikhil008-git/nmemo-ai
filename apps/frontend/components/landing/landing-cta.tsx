import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";

const orangeStage = {
  background: `
    radial-gradient(ellipse 90% 70% at 12% 20%, rgba(255, 190, 120, 0.95) 0%, transparent 55%),
    radial-gradient(ellipse 70% 55% at 88% 18%, rgba(255, 150, 80, 0.85) 0%, transparent 50%),
    radial-gradient(ellipse 85% 55% at 45% 100%, rgba(249, 115, 22, 0.7) 0%, transparent 55%),
    radial-gradient(ellipse 45% 35% at 65% 55%, rgba(254, 215, 170, 0.85) 0%, transparent 45%),
    linear-gradient(165deg, #fff7ed 0%, #ffedd5 35%, #fb923c 72%, #ea580c 100%)
  `,
} as const;

export function LandingCta() {
  return (
    <div className="mt-24 w-full">
      <div className="min-w-0 max-w-2xl text-left">
        <h2 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-balance leading-[1.15] sm:text-3xl md:text-[2.35rem]">
          Playground to production.
          <span className="mt-1.5 block font-semibold text-neutral-400">
            Same call everywhere.
          </span>
        </h2>
        <p className="mt-4 max-w-md text-sm font-semibold leading-relaxed text-neutral-500">
          Docs, agents, voice, and real-time — the same context decisions,
          everywhere you ship.
        </p>
      </div>

      <section className="relative mt-12 w-full overflow-hidden rounded-sm">
        <div className="absolute inset-0" style={orangeStage} aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-50 blur-2xl"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4), transparent 55%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:radial-gradient(circle,rgba(0,0,0,0.55)_0.7px,transparent_0.8px)] [background-size:6px_6px]"
          aria-hidden
        />

        <div className="relative flex flex-col items-center px-6 py-20 text-center sm:py-24 md:py-28">
          <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-950">
            <Logo size={18} />
            / Get started today
          </p>

          <h3 className="mt-5 max-w-xl text-[1.85rem] font-semibold tracking-[-0.03em] leading-[1.15] text-neutral-950 sm:text-3xl md:text-[2.5rem]">
            Decide context for every agent
          </h3>

          <Link
            href="/sign-in"
            className="mt-8 inline-flex items-center gap-1.5 rounded-sm bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            <ArrowUpRight size={15} strokeWidth={2} />
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
