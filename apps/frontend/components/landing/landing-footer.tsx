import Link from "next/link";

import { GitHub, XMark } from "@/components/landing/icons";
import { Logo } from "@/components/logo";
import { REPO_URL, X_URL } from "@/lib/site";

const footerLinks = [
  { href: "/#memory", label: "Memory" },
  { href: "/#receipts", label: "Receipts" },
  { href: "/#cli", label: "CLI" },
  { href: "/docs", label: "Docs" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-start gap-6 px-6 sm:flex-row sm:items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={22} className="rounded-[5px]" />
          <span className="text-[14px] text-white/45">
            nmemo — a project continuity layer for AI coding
          </span>
        </Link>

        <div className="flex items-center gap-6 text-[14px] text-white/45 sm:ml-auto">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="nmemo on GitHub"
            className="transition-colors hover:text-white"
          >
            <GitHub className="size-[18px]" />
          </a>
          <a
            href={X_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="nmemo on X"
            className="transition-colors hover:text-white"
          >
            <XMark className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
