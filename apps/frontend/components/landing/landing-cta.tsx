import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { stageBackground } from "@/lib/stage-backgrounds";

export function LandingCta() {
  return (
    <div className="mt-32 w-full">
      <div className="min-w-0 max-w-2xl text-left">
        <h2 className="display-lg font-normal text-balance">
          Playground to production.
          <span className="mt-1.5 block font-normal text-neutral-400">
            Same call everywhere.
          </span>
        </h2>
        <p className="mt-4 max-w-md text-sm font-semibold leading-relaxed text-neutral-500">
          Docs, agents, voice, and real-time — the same context decisions,
          everywhere you ship.
        </p>
      </div>

      {/*
        Grainy mesh slab — saturated in both themes, so its tokens are pinned
        dark and every child renders light-on-colour.
      */}
      <section
        data-theme="dark"
        className="relative mt-12 w-full overflow-hidden rounded-2xl"
      >
        <div
          className="absolute -inset-6 blur-[5px]"
          style={{ background: stageBackground }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 42% 38%, rgba(255,255,255,0.18), transparent 58%)",
          }}
          aria-hidden
        />
        {/* Halftone grain, same treatment as the hero backdrop. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle,rgba(0,0,0,0.5)_0.7px,transparent_0.8px)] [background-size:6px_6px]"
          aria-hidden
        />

        <div className="relative flex flex-col items-center px-6 py-28 text-center sm:py-32 md:py-40">
          <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/80">
            <Logo size={18} />
            / Get started today
          </p>

          <h3 className="display-lg mt-5 max-w-2xl font-normal text-white">
            Decide context for every agent
          </h3>

          <Link
            href="/sign-in"
            // Literal ink: the section pins dark tokens, so `text-neutral-900`
            // would resolve light here and vanish on the white pill.
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#131316] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            <ArrowUpRight size={15} strokeWidth={2} />
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
