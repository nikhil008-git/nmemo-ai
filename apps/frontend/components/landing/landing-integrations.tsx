import { Blocks } from "lucide-react";
import type { ReactNode } from "react";
import {
  SiConfluence,
  SiDiscord,
  SiDropbox,
  SiGithub,
  SiGmail,
  SiGoogledrive,
  SiJira,
  SiLinear,
  SiNotion,
} from "react-icons/si";

import { cn } from "@/lib/utils";

function SlackMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 3.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

function TeamsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.625 8.5h-3.563v-.875A2.626 2.626 0 0 0 14.438 5H9.562A2.626 2.626 0 0 0 6.938 7.625V8.5H3.375A1.375 1.375 0 0 0 2 9.875v8.75A1.375 1.375 0 0 0 3.375 20h17.25A1.375 1.375 0 0 0 22 18.625v-8.75A1.375 1.375 0 0 0 20.625 8.5zM8.25 7.625c0-.724.588-1.312 1.312-1.312h4.876c.724 0 1.312.588 1.312 1.312V8.5H8.25V7.625zM3.375 9.875h3.563v8.75H3.375v-8.75zm17.25 8.75h-12.25v-8.75h12.25v8.75zM16.5 3.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5zm-9 0a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5z" />
    </svg>
  );
}

type Logo = {
  name: string;
  mark: (props: { className?: string }) => ReactNode;
  wordmarkClass?: string;
};

const logos: Logo[] = [
  { name: "Slack", mark: SlackMark, wordmarkClass: "font-bold tracking-[-0.02em]" },
  { name: "Discord", mark: (p) => <SiDiscord {...p} />, wordmarkClass: "font-bold tracking-tight" },
  { name: "Notion", mark: (p) => <SiNotion {...p} />, wordmarkClass: "font-semibold tracking-tight" },
  { name: "GitHub", mark: (p) => <SiGithub {...p} />, wordmarkClass: "font-semibold tracking-tight" },
  { name: "Drive", mark: (p) => <SiGoogledrive {...p} />, wordmarkClass: "font-medium tracking-tight" },
  { name: "Gmail", mark: (p) => <SiGmail {...p} />, wordmarkClass: "font-medium tracking-tight" },
  { name: "Linear", mark: (p) => <SiLinear {...p} />, wordmarkClass: "font-semibold tracking-tight" },
  { name: "Jira", mark: (p) => <SiJira {...p} />, wordmarkClass: "font-bold tracking-tight" },
  {
    name: "Confluence",
    mark: (p) => <SiConfluence {...p} />,
    wordmarkClass: "font-semibold tracking-tight",
  },
  { name: "Dropbox", mark: (p) => <SiDropbox {...p} />, wordmarkClass: "font-bold tracking-tight" },
  { name: "Teams", mark: TeamsMark, wordmarkClass: "font-semibold tracking-tight" },
  {
    name: "MCP",
    mark: (p) => <Blocks {...p} size={22} strokeWidth={1.75} />,
    wordmarkClass: "font-bold tracking-widest uppercase text-[11px]",
  },
];

export function LandingIntegrations() {
  return (
    <section className="mt-16 w-full pb-8 sm:mt-20 sm:pb-12">
      <p className="text-center text-sm font-medium text-neutral-500">
        Works with the tools your team already uses
      </p>

      <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        {logos.map((logo, i) => {
          const Mark = logo.mark;
          return (
            <li
              key={logo.name}
              className={cn(
                "flex h-[4.25rem] items-center justify-center px-3 text-neutral-800 sm:h-20",
                i % 2 !== 0 && "border-l border-border",
                i % 3 !== 0
                  ? "sm:border-l sm:border-border"
                  : "sm:border-l-0",
                i % 6 !== 0
                  ? "md:border-l md:border-border"
                  : "md:border-l-0",
              )}
            >
              <span className="inline-flex items-center gap-2.5">
                <Mark className="size-[22px] shrink-0" />
                <span
                  className={cn(
                    "text-[15px] leading-none text-neutral-800",
                    logo.wordmarkClass,
                  )}
                >
                  {logo.name}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
