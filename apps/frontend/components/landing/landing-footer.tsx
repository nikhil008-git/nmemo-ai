import Link from "next/link";

import { Logo } from "@/components/logo";

const exploreLinks = [
  { href: "/#product", label: "Product" },
  { href: "/docs", label: "Docs" },
  { href: "/docs/sdk", label: "SDK" },
  { href: "/docs/playground", label: "Playground" },
] as const;

export function LandingFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-6 pb-12 pt-16 md:pt-20">
      <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4 md:max-w-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-heading text-[15px] font-semibold tracking-tight text-foreground"
          >
            <Logo size={26} className="rounded-[6px]" />
            <span>nmemo</span>
          </Link>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            The context decision layer for AI agents. Context your agents
            actually need.
          </p>
        </div>

        <div className="flex flex-col gap-12 sm:flex-row sm:gap-16 md:gap-20">
          <div>
            <p className="font-heading text-base font-semibold text-foreground">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-heading text-base font-semibold text-foreground">
              Get in touch
            </p>
            <a
              href="mailto:rajpurohitnikhil008@gmail.com"
              className="mt-4 block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              rajpurohitnikhil008@gmail.com
            </a>
          </div>
        </div>
      </div>

      <p className="mt-14 text-center text-xs font-medium text-muted-foreground">
        Copyright © {new Date().getFullYear()} nmemo. All rights reserved.
      </p>
    </footer>
  );
}
