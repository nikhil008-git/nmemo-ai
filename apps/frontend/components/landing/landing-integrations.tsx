import { Blocks, Briefcase, Database } from "lucide-react";
import type { ReactNode } from "react";
import {
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

type Logo = {
  name: string;
  mark: (props: { className?: string }) => ReactNode;
  wordmarkClass?: string;
  soon?: boolean;
};

/** Live connectors + the coming sources we surface in the app. */
const logos: Logo[] = [
  { name: "Slack", mark: SlackMark, wordmarkClass: "font-bold tracking-[-0.02em]" },
  { name: "Notion", mark: (p) => <SiNotion {...p} />, wordmarkClass: "font-semibold tracking-tight" },
  { name: "GitHub", mark: (p) => <SiGithub {...p} />, wordmarkClass: "font-semibold tracking-tight" },
  {
    name: "Gmail",
    mark: (p) => <SiGmail {...p} />,
    wordmarkClass: "font-medium tracking-tight",
    soon: true,
  },
  {
    name: "Drive",
    mark: (p) => <SiGoogledrive {...p} />,
    wordmarkClass: "font-medium tracking-tight",
    soon: true,
  },
  {
    name: "Linear",
    mark: (p) => <SiLinear {...p} />,
    wordmarkClass: "font-semibold tracking-tight",
    soon: true,
  },
  {
    name: "Jira",
    mark: (p) => <SiJira {...p} />,
    wordmarkClass: "font-bold tracking-tight",
    soon: true,
  },
  {
    name: "MCP",
    mark: (p) => <Blocks {...p} size={22} strokeWidth={1.75} />,
    wordmarkClass: "font-bold tracking-widest uppercase text-[11px]",
    soon: true,
  },
  {
    name: "SQL",
    mark: (p) => <Database {...p} size={22} strokeWidth={1.75} />,
    wordmarkClass: "font-bold tracking-tight",
    soon: true,
  },
  {
    name: "CRM",
    mark: (p) => <Briefcase {...p} size={22} strokeWidth={1.75} />,
    wordmarkClass: "font-semibold tracking-tight",
    soon: true,
  },
];

export function LandingIntegrations() {
  return (
    <section className="mt-12 w-full sm:mt-14">
      <p className="text-center text-sm font-medium text-neutral-500">
        Every source feeds the decision. More connectors shipping next.
      </p>

      <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-2 sm:grid-cols-5">
        {logos.map((logo, i) => {
          const Mark = logo.mark;
          return (
            <li
              key={logo.name}
              className={cn(
                "relative flex h-[4.25rem] items-center justify-center px-3 text-neutral-800 sm:h-20",
                i % 2 !== 0 && "border-l border-border",
                i % 5 !== 0
                  ? "sm:border-l sm:border-border"
                  : "sm:border-l-0",
                logo.soon && "opacity-70",
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
              {logo.soon ? (
                <span className="absolute right-2 top-2 text-[8px] font-semibold uppercase tracking-wide text-neutral-400">
                  Soon
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
