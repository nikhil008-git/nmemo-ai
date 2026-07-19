"use client";

import Link from "next/link";

import { LandingPlayground } from "@/components/landing/landing-playground";
import { Logo } from "@/components/logo";

export function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-background">
      {/* Form column */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          <Logo size={28} priority className="rounded-[6px]" />
          nmemo
        </Link>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>

        <p className="text-center text-xs font-medium text-muted-foreground lg:text-left">
          © {new Date().getFullYear()} nmemo
        </p>
      </div>

      {/* Orange half — minimal crop, overflow hidden */}
      <div className="relative hidden min-h-screen w-1/2 overflow-hidden lg:block">
        <LandingPlayground variant="auth" />
      </div>
    </main>
  );
}
