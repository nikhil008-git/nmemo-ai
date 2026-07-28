"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

import {
  PageHeader,
  SectionLabel,
  appPanelClass,
} from "@/components/app/page-header";
import { WorkspaceIdsCard } from "@/components/app/workspace-ids";
import { CtaButton } from "@/components/ui/cta-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getWorkspace,
  updateWorkspace,
  type Workspace,
} from "@/lib/api";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Media",
  "Retail",
  "Other",
] as const;

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
] as const;

const fieldClass =
  "w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-foreground/30";

function asIndustry(value: string | null | undefined) {
  if (value && (INDUSTRIES as readonly string[]).includes(value)) {
    return value as (typeof INDUSTRIES)[number];
  }
  return "Other";
}

function asCompanySize(value: string | null | undefined) {
  if (value && (COMPANY_SIZES as readonly string[]).includes(value)) {
    return value as (typeof COMPANY_SIZES)[number];
  }
  return "1-10 employees";
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] =
    useState<(typeof INDUSTRIES)[number]>("Other");
  const [companySize, setCompanySize] =
    useState<(typeof COMPANY_SIZES)[number]>("1-10 employees");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canDelete =
    Boolean(user?.email) &&
    confirmText.trim().toLowerCase() === user!.email!.toLowerCase();

  useEffect(() => {
    void getWorkspace()
      .then((ws) => {
        setWorkspace(ws);
        setName(ws.name);
        setDomain(ws.domain ?? "");
        setIndustry(asIndustry(ws.industry));
        setCompanySize(asCompanySize(ws.companySize));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load workspace"),
      )
      .finally(() => setLoading(false));
  }, []);

  async function saveCompanyDetails(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setSaveError("Enter a workspace name");
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await updateWorkspace({
        name: trimmed,
        ...(domain.trim() ? { domain: domain.trim() } : {}),
        industry,
        companySize,
      });
      setWorkspace(updated);
      setName(updated.name);
      setDomain(updated.domain ?? "");
      setIndustry(asIndustry(updated.industry));
      setCompanySize(asCompanySize(updated.companySize));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save company details",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        throw new Error(body?.error || "Failed to delete account");
      }
      await signOut();
      router.replace("/");
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account",
      );
      setDeleting(false);
    }
  }

  return (
    <main className="space-y-8">
      <PageHeader
        title="Account"
        description={
          <>
            Profile, company details, and workspace IDs. Keys live under{" "}
            <Link
              href="/keys"
              className="text-foreground underline underline-offset-4"
            >
              API
            </Link>
            .
          </>
        }
      />

      {error ? (
        <p className="text-sm font-semibold text-red-500">{error}</p>
      ) : null}

      <section className="space-y-3">
        <SectionLabel>Profile</SectionLabel>
        <div className={`${appPanelClass} space-y-2 px-4 py-4 text-sm`}>
          <p className="font-semibold">
            <span className="text-neutral-500">Name · </span>
            {user?.name || "—"}
          </p>
          <p className="font-semibold">
            <span className="text-neutral-500">Email · </span>
            {user?.email || "—"}
          </p>
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-40 w-full rounded-sm" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-28 w-full rounded-sm" />
        </div>
      ) : workspace ? (
        <>
          <section className="space-y-3">
            <div className="space-y-1">
              <SectionLabel>Company details</SectionLabel>
              <p className="max-w-xl text-sm font-semibold leading-relaxed text-neutral-500">
                Same details you set when creating the workspace.
              </p>
            </div>

            <form
              onSubmit={(e) => void saveCompanyDetails(e)}
              className={`${appPanelClass} space-y-4 px-4 py-4`}
            >
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-neutral-500">
                  Company domain
                </span>
                <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-1.5 focus-within:border-foreground/30">
                  <Link2 className="size-4 shrink-0 text-neutral-400" />
                  <input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="acme.com"
                    disabled={saving}
                    className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm font-medium outline-none placeholder:text-neutral-400"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-neutral-500">
                  Workspace name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your workspace name"
                  maxLength={80}
                  disabled={saving}
                  className={fieldClass}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-neutral-500">
                    Industry
                  </span>
                  <select
                    value={industry}
                    onChange={(e) =>
                      setIndustry(e.target.value as (typeof INDUSTRIES)[number])
                    }
                    disabled={saving}
                    className={fieldClass}
                  >
                    {INDUSTRIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-neutral-500">
                    Company size
                  </span>
                  <select
                    value={companySize}
                    onChange={(e) =>
                      setCompanySize(
                        e.target.value as (typeof COMPANY_SIZES)[number],
                      )
                    }
                    disabled={saving}
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

              {saveError ? (
                <p className="text-sm font-semibold text-red-500">{saveError}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <CtaButton
                  type="submit"
                  size="compact"
                  loading={saving}
                  disabled={saving}
                >
                  Save changes
                </CtaButton>
                {saved ? (
                  <span
                    className={cn(
                      "text-xs font-semibold text-emerald-600",
                    )}
                  >
                    Saved
                  </span>
                ) : null}
              </div>
            </form>
          </section>

          <WorkspaceIdsCard
            workspaceName={workspace.name}
            workspaceId={workspace.id}
            accountUserId={user?.id}
          />
        </>
      ) : null}

      <section className="space-y-3">
        <SectionLabel>Shortcuts</SectionLabel>
        <div className="flex flex-wrap gap-2">
          <CtaButton href="/keys" variant="outline" size="compact">
            API keys
          </CtaButton>
          <CtaButton href="/connectors" variant="outline" size="compact">
            Connectors
          </CtaButton>
          <CtaButton href="/playground" size="compact">
            Playground
          </CtaButton>
        </div>
      </section>

      <section className="space-y-3">
        <SectionLabel>Danger zone</SectionLabel>
        <div className={`${appPanelClass} space-y-4 border-red-500/40 px-4 py-4`}>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Delete account permanently
            </p>
            <p className="text-xs font-semibold leading-relaxed text-neutral-500">
              Removes your profile, sessions, API keys, and sole-owned
              workspaces. This cannot be undone.
            </p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-neutral-500">
              Type your email to confirm
            </span>
            <input
              type="email"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={user?.email || "you@example.com"}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-foreground/30"
            />
          </label>
          {deleteError ? (
            <p className="text-sm font-semibold text-red-500">{deleteError}</p>
          ) : null}
          <CtaButton
            type="button"
            variant="outline"
            size="compact"
            loading={deleting}
            disabled={!canDelete || deleting}
            onClick={() => void deleteAccount()}
            className="!border-red-500/50 !text-red-500 hover:!bg-red-500/10"
          >
            Delete account forever
          </CtaButton>
        </div>
      </section>
    </main>
  );
}
