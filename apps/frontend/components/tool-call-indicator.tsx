import { Spinner } from "@/components/ui/spinner";
import type { SourceStatus } from "@/lib/types";

type Props = {
  sources: SourceStatus[];
};

export function ToolCallIndicator({ sources }: Props) {
  const active = sources.filter((s) => s.queried);

  if (!active.length) return null;

  return (
    <div className="space-y-2 rounded-sm border border-border px-3 py-3 text-xs">
      <p className="font-heading text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
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
              className="flex items-center justify-between gap-3 font-semibold text-neutral-500"
            >
              <span className="text-foreground/90">{s.name}</span>
              <span className="inline-flex items-center gap-1.5">
                {state === "loading" && (
                  <>
                    <Spinner size={12} className="text-neutral-500" />
                    <span>searching</span>
                  </>
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
