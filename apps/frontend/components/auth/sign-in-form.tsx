"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { CtaButton } from "@/components/ui/cta-button";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/home";
  return raw;
}

const fieldClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30";

export function SignInForm({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const formData = new FormData(e.currentTarget);

    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setBusy(false);

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      router.push(safeNext(search.get("next")));
    }
  }

  if (compact) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center space-y-3 text-foreground",
          className,
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Account
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
        <p className="text-center text-sm font-medium text-muted-foreground">
          Welcome back. Enter your details below.
        </p>
        {error && (
          <p className="text-sm font-medium text-red-600">{error}</p>
        )}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-2 w-full max-w-sm space-y-3"
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-sm border border-border bg-input px-3 py-2.5 text-sm font-medium outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-sm border border-border bg-input px-3 py-2.5 text-sm font-medium outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
          <CtaButton type="submit" fullWidth disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </CtaButton>
        </form>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 text-foreground", className)}>
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Welcome back to nmemo
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-foreground">
            Work email
          </span>
          <input
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            className={fieldClass}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold text-foreground">
            Password
          </span>
          <input
            name="password"
            type="password"
            placeholder="Your password"
            required
            className={fieldClass}
          />
        </label>

        <CtaButton type="submit" fullWidth disabled={busy}>
          {busy ? "Signing in…" : "Continue"}
        </CtaButton>
      </form>

      <p className="text-center text-sm font-medium text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-secondary hover:opacity-80"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
