import Link from "next/link";

import { GitHub } from "@/components/landing/icons";
import { Logo } from "@/components/logo";
import { REPO_URL } from "@/lib/site";

const footerLinks = [{ href: "/docs/sdk", label: "Docs" }] as const;

export function LandingFooter() {
  return (
    <footer className="py-10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-start gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-start gap-2.5 sm:items-center"
        >
          <Logo size={22} className="shrink-0 rounded-[5px]" />
          <span className="text-[14px] text-ink/45">
            nmemo: the context layer for AI agents
          </span>
        </Link>

        <div className="flex items-center gap-6 text-[14px] text-ink/45 sm:ml-auto">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="nmemo on GitHub"
            className="transition-colors hover:text-ink"
          >
            <GitHub className="size-[18px]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
