"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CtaButton } from "@/components/ui/cta-button";
import { signUp } from "@/lib/auth-client";

const fieldClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const formData = new FormData(e.currentTarget);
    const first = String(formData.get("firstName") ?? "").trim();
    const last = String(formData.get("lastName") ?? "").trim();
    const name = [first, last].filter(Boolean).join(" ");

    const res = await signUp.email({
      name,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    setBusy(false);

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      router.push("/home");
    }
  }

  return (
    <div className="space-y-6 text-foreground">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Sign up
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Start building with nmemo
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold text-foreground">
              First name
            </span>
            <input
              name="firstName"
              placeholder="Ada"
              required
              className={fieldClass}
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold text-foreground">
              Last name
            </span>
            <input
              name="lastName"
              placeholder="Lovelace"
              required
              className={fieldClass}
            />
          </label>
        </div>

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
            placeholder="At least 8 characters"
            required
            minLength={8}
            className={fieldClass}
          />
        </label>

        <CtaButton type="submit" fullWidth loading={busy}>
          {busy ? "Creating account" : "Continue"}
        </CtaButton>
      </form>

      <p className="text-center text-sm font-medium text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-secondary hover:opacity-80"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
