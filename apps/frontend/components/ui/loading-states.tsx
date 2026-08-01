import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/** Full-screen app chrome placeholder while session resolves. */
export function AppShellSkeleton() {
  return (
    <div
      className="product-shell app-shell-zoom fixed inset-0 z-40 flex overflow-hidden bg-surface"
      role="status"
      aria-label="Loading workspace"
    >
      <aside className="flex w-12 shrink-0 flex-col items-center gap-3 bg-rail py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="size-8 rounded-sm bg-ink/10" />
        ))}
      </aside>

      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-neutral-50">
        <div className="flex items-center justify-between px-3 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="flex-1 space-y-4 overflow-hidden px-2 pb-3">
          {[3, 5, 3].map((count, section) => (
            <div key={section} className="space-y-1.5">
              <Skeleton className="mx-2 h-2.5 w-14" />
              {Array.from({ length: count }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-2 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-2.5 w-4" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-border px-2 py-2">
          <Skeleton className="mx-2 h-3 w-16" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-14" />
            ))}
          </div>
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center bg-surface p-6">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={20} />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Sign-in form placeholder. */
export function AuthFormSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full space-y-5", className)}
      role="status"
      aria-label="Loading form"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="mx-auto h-3 w-36" />
    </div>
  );
}

/** Connectors list rows. */
export function ConnectorsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul
      className="divide-y divide-border border border-border"
      role="status"
      aria-label="Loading connectors"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3.5 w-full max-w-md" />
            <Skeleton className="h-3 w-2/3 max-w-sm" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Documents table. */
export function DocumentsTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden border border-border"
      role="status"
      aria-label="Loading documents"
    >
      <div className="flex gap-4 border-b border-border px-4 py-3">
        {["w-24", "w-20", "w-16", "w-16", "w-20"].map((w, i) => (
          <Skeleton key={i} className={cn("h-3", w)} />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** API keys list. */
export function KeysListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul
      className="divide-y divide-border border border-border"
      role="status"
      aria-label="Loading API keys"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-8 w-16 self-start rounded-md" />
        </li>
      ))}
    </ul>
  );
}

/** Compact inline loading (buttons, status chips). */
export function InlineLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
      role="status"
    >
      <Spinner size={14} />
      {label ? <span>{label}</span> : null}
    </span>
  );
}

/** Centered page / panel fallback. */
export function PageLoader({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16",
        className,
      )}
      role="status"
      aria-label={label}
    >
      <Spinner size={22} />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
