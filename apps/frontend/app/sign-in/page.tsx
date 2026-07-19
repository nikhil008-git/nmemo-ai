"use client";

import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthFormSkeleton } from "@/components/ui/loading-states";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthShell>
          <AuthFormSkeleton />
        </AuthShell>
      }
    >
      <AuthShell>
        <SignInForm />
      </AuthShell>
    </Suspense>
  );
}
