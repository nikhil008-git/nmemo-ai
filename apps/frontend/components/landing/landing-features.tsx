"use client";

import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";

import { HomeView } from "@/app/(app)/home/page";
import { KeysView } from "@/app/(app)/keys/page";
import { Playground } from "@/components/playground";

const orangeStage = {
  background: `
    radial-gradient(ellipse 90% 70% at 12% 20%, rgba(255, 190, 120, 0.9) 0%, transparent 55%),
    radial-gradient(ellipse 70% 55% at 88% 18%, rgba(255, 150, 80, 0.75) 0%, transparent 50%),
    linear-gradient(165deg, #fff7ed 0%, #ffedd5 45%, #fdba74 100%)
  `,
} as const;

function MiniPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-auto h-[148px] overflow-hidden sm:h-[160px]">
      <div className="absolute inset-0" style={orangeStage} aria-hidden />
      <div className="absolute inset-x-3 bottom-0 top-4 overflow-hidden rounded-t-sm border border-b-0 border-black/10 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.1)] sm:inset-x-4">
        <div
          className="origin-top-left pointer-events-none select-none"
          style={{
            width: "182%",
            height: "182%",
            transform: "scale(0.55)",
          }}
          aria-hidden
        >
          <div className="px-4 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

const cards = [
  {
    label: "Home",
    title: "One workspace.",
    body: "Sources and agents in the same shell.",
    href: "/home",
    view: "home" as const,
  },
  {
    label: "Playground",
    title: "See decisions.",
    body: "Ask once. Ranked context, live.",
    href: "/playground",
    view: "playground" as const,
  },
  {
    label: "API",
    title: "Same call.",
    body: "Keys for getContext in your agents.",
    href: "/keys",
    view: "api" as const,
  },
] as const;

function CardView({ view }: { view: (typeof cards)[number]["view"] }) {
  if (view === "home") return <HomeView />;
  if (view === "playground") return <Playground />;
  return <KeysView preview />;
}

export function LandingFeatures() {
  return (
    <section className="mt-10 grid gap-3 md:grid-cols-3 md:gap-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="flex flex-col overflow-hidden rounded-sm bg-neutral-100"
        >
          <div className="flex flex-1 flex-col gap-1.5 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Layers size={13} strokeWidth={1.5} />
              <p className="text-[11px] font-medium">{card.label}</p>
            </div>
            <Link href={card.href} className="group">
              <h2 className="text-[1.15rem] font-semibold leading-tight tracking-tight text-neutral-950 group-hover:underline sm:text-[1.25rem]">
                {card.title}
              </h2>
            </Link>
            <p className="text-[13px] font-medium leading-snug text-neutral-500">
              {card.body}
            </p>
            <Link
              href={card.href}
              className="mt-0.5 inline-flex items-center gap-0.5 text-[12px] font-semibold text-neutral-950"
            >
              Open
              <ArrowUpRight size={12} strokeWidth={2} />
            </Link>
          </div>

          <MiniPreview>
            <CardView view={card.view} />
          </MiniPreview>
        </article>
      ))}
    </section>
  );
}
