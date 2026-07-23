"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { SectionLabel, appPanelClass } from "@/components/app/page-header";
import { cn } from "@/lib/utils";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1 text-[11px] font-bold text-neutral-500 transition-colors hover:text-foreground"
      aria-label="Copy"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function IdRow({
  label,
  value,
  hint,
  mono = true,
}: {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-0.5">
        <p className="font-heading text-xs font-semibold text-foreground">
          {label}
        </p>
        {hint ? (
          <p className="text-[11px] font-semibold leading-relaxed text-neutral-500">
            {hint}
          </p>
        ) : null}
        <p
          className={cn(
            "break-all text-sm font-semibold text-foreground",
            mono && "font-mono text-xs font-medium",
          )}
        >
          {value}
        </p>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

export function WorkspaceIdsCard({
  workspaceName,
  workspaceId,
  accountUserId,
}: {
  workspaceName: string;
  workspaceId: string;
  accountUserId?: string | null;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <SectionLabel>Workspace & IDs</SectionLabel>
        <p className="max-w-xl text-sm font-semibold leading-relaxed text-neutral-500">
          Workspace = your sources. User = who is asking.
        </p>
      </div>

      <div className={appPanelClass}>
        <IdRow
          label="Workspace name"
          value={workspaceName}
          hint="Your workspace. Connectors and keys live here."
          mono={false}
        />
        <IdRow
          label="workspaceId"
          value={workspaceId}
          hint="Which workspace’s sources to use in your agents."
        />
        {accountUserId ? (
          <IdRow
            label="Your account userId"
            value={accountUserId}
            hint="Your login id. In your product, pass each end-user’s id instead."
          />
        ) : null}
      </div>

      <ul className="space-y-1.5 text-sm font-semibold text-neutral-500">
        <li>
          <span className="text-foreground">userId</span>: who is chatting
          (scopes memory).
        </li>
        <li>
          <span className="text-foreground">conversationId</span>: optional
          thread id.
        </li>
      </ul>
    </section>
  );
}
