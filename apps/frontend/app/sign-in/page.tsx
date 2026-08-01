import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthFormSkeleton } from "@/components/ui/loading-states";
import { auth } from "@/lib/auth";

function signedInDestination(raw: string | string[] | undefined) {
  if (
    typeof raw !== "string" ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw === "/" ||
    raw.startsWith("/sign-in") ||
    raw.startsWith("/sign-up")
  ) {
    return "/home";
  }

  return raw;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const search = await searchParams;
    redirect(signedInDestination(search.next));
  }

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
