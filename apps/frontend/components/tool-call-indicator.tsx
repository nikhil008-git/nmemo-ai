import type { SourceStatus } from "@/lib/types";

type Props = {
  sources: SourceStatus[];
};

export function ToolCallIndicator({ sources }: Props) {
  const active = sources.filter((s) => s.queried);

  if (!active.length) return null;

  return (
    <div className="space-y-2 rounded-md border border-border px-3 py-3 text-xs">
      <p className="font-medium uppercase tracking-widest text-muted-foreground">
        Retrieving
      </p>
      <ul className="space-y-1.5">
        {active.map((s) => {
          const state = !s.queried
            ? "skipped"
            : s.responded
              ? "done"
              : "loading";
          return (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 text-muted-foreground"
            >
              <span className="text-foreground/90">{s.name}</span>
              <span>
                {state === "loading" && (
                  <span className="animate-pulse">searching…</span>
                )}
                {state === "done" && `${s.latencyMs}ms`}
                {state === "skipped" && "skipped"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
