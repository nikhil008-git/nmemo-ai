"use client";

import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <p className="mt-8 text-center text-muted-foreground">Loading…</p>
      }
    >
      <AuthShell>
        <SignInForm />
      </AuthShell>
    </Suspense>
  );
}
