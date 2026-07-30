"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Link2, Plus } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { CtaButton } from "@/components/ui/cta-button";
import { AuthFormSkeleton } from "@/components/ui/loading-states";
import { createWorkspace, getWorkspace } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  "AI",
  "Developer Tools",
  "Infrastructure",
  "B2B SaaS",
  "Consumer",
  "Fintech",
  "HealthTech",
  "EdTech",
  "Robotics",
  "Research",
  "Open Source",
  "Other",
] as const;

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
] as const;

const INVITE_ROLES = ["Member", "Admin"] as const;

type InviteRow = {
  id: string;
  email: string;
  role: (typeof INVITE_ROLES)[number];
};

const fieldClass =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm font-semibold outline-none placeholder:text-neutral-400 focus:border-foreground";

function normalizeDomain(raw: string) {
  return (
    raw
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      ?.toLowerCase() ?? ""
  );
}

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [step, setStep] = useState<"details" | "invite">("details");
  const [checking, setChecking] = useState(true);

  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] =
    useState<(typeof INDUSTRIES)[number]>("Other");
  const [companySize, setCompanySize] =
    useState<(typeof COMPANY_SIZES)[number]>("1-10 employees");

  const [invites, setInvites] = useState<InviteRow[]>([
    { id: "1", email: "", role: "Member" },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in?next=/create-workspace");
      return;
    }

    void getWorkspace()
      .then(() => {
        router.replace("/home");
      })
      .catch(() => {
        setChecking(false);
      });
  }, [isPending, session, router]);

  async function onContinueDetails(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a workspace name");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const host = normalizeDomain(domain);
      await createWorkspace({
        name: trimmed,
        ...(host ? { domain: host } : {}),
        industry,
        companySize,
      });
      setStep("invite");
      setBusy(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create workspace",
      );
      setBusy(false);
    }
  }

  function goHome() {
    router.replace("/home");
    router.refresh();
  }

  function onSendInvites(e: React.FormEvent) {
    e.preventDefault();
    // Frontend-only for now — invites are not persisted.
    goHome();
  }

  if (isPending || checking || !session?.user) {
    return (
      <AuthShell>
        <AuthFormSkeleton />
      </AuthShell>
    );
  }

  if (step === "invite") {
    return (
      <AuthShell>
        <div className="relative space-y-6 text-foreground">

          <form onSubmit={onSendInvites} className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Almost there
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Collaborate with your team
              </h1>
              <p className="text-sm font-medium text-neutral-600">
                The more your teammates use nmemo, the more powerful it becomes.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Invite your teammates</p>
              {invites.map((row, index) => (
                <div key={row.id} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={row.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInvites((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, email: value } : r,
                        ),
                      );
                    }}
                    placeholder="name@company.com"
                    className={cn(fieldClass, "sm:flex-1")}
                    autoFocus={index === 0}
                  />
                  <select
                    value={row.role}
                    onChange={(e) => {
                      const value = e.target
                        .value as (typeof INVITE_ROLES)[number];
                      setInvites((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, role: value } : r,
                        ),
                      );
                    }}
                    className={cn(fieldClass, "sm:w-32")}
                  >
                    {INVITE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setInvites((prev) => [
                    ...prev,
                    {
                      id: String(Date.now()),
                      email: "",
                      role: "Member",
                    },
                  ])
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-background px-3 py-2.5 text-sm font-semibold hover:bg-neutral-50"
              >
                <Plus className="size-4" />
                Add more
              </button>
            </div>

            <div className="space-y-3">
              <CtaButton type="submit" fullWidth>
                Send Invites
              </CtaButton>
              <button
                type="button"
                onClick={goHome}
                className="block w-full text-center text-sm font-medium text-neutral-500 hover:text-foreground"
              >
                I&apos;ll invite later in workspace settings
              </button>
            </div>
          </form>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="relative space-y-6 text-foreground">

        <form onSubmit={onContinueDetails} className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Almost there
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Company Details
            </h1>
            <p className="text-sm font-medium text-neutral-600">
              Tell us about your company so we can set up your workspace.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Company domain
            </label>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-1.5 focus-within:border-foreground">
              <Link2 className="size-4 shrink-0 text-neutral-400" />
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://nmemo.cloud"
                disabled={busy}
                className="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-sm font-semibold outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="relative flex items-center gap-3 py-0.5">
            <div className="h-px flex-1 border-t border-dashed border-border" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Or
            </span>
            <div className="h-px flex-1 border-t border-dashed border-border" />
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Workspace name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your workspace name"
              maxLength={80}
              disabled={busy}
              className={fieldClass}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Industry
              </span>
              <select
                value={industry}
                onChange={(e) =>
                  setIndustry(e.target.value as (typeof INDUSTRIES)[number])
                }
                disabled={busy}
                className={fieldClass}
              >
                {INDUSTRIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Company size
              </span>
              <select
                value={companySize}
                onChange={(e) =>
                  setCompanySize(
                    e.target.value as (typeof COMPANY_SIZES)[number],
                  )
                }
                disabled={busy}
                className={fieldClass}
              >
                {COMPANY_SIZES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? (
            <p className="text-sm font-semibold text-red-500">{error}</p>
          ) : null}

          <CtaButton type="submit" fullWidth loading={busy} disabled={busy}>
            Continue
          </CtaButton>
        </form>
      </div>
    </AuthShell>
  );
}
