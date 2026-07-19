import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="font-heading text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm font-semibold leading-relaxed text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-heading text-sm font-semibold tracking-[-0.02em] text-foreground",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Shared app input styling — matches landing radius / weight. */
export const appFieldClass =
  "min-w-0 w-full rounded-sm border border-border bg-input px-3 py-2.5 text-sm font-medium outline-none placeholder:text-neutral-400 focus:border-foreground/30 disabled:opacity-50";

export const appPanelClass = "rounded-sm border border-border bg-white";

export const appMetaClass = "text-xs font-semibold text-neutral-500";
