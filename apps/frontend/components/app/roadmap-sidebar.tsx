import { cn } from "@/lib/utils";
import {
  pipelineRoadmap,
  retrieverRoadmap,
  type RoadmapItem,
} from "@/lib/roadmap";

function RoadmapList({
  label,
  items,
  compact,
}: {
  label: string;
  items: RoadmapItem[];
  compact?: boolean;
}) {
  return (
    <div>
      <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <div
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs font-semibold text-neutral-500",
                compact && "py-1",
              )}
              title={item.short}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn("size-2 shrink-0 rounded-full opacity-50", item.tone)}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-neutral-400">
                Soon
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Quick sidebar blocks for pipeline + upcoming retrievers. */
export function RoadmapSidebar({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-4">
      <RoadmapList
        label="Pipeline"
        items={pipelineRoadmap}
        compact={compact}
      />
      <RoadmapList
        label="Coming sources"
        items={retrieverRoadmap}
        compact={compact}
      />
    </div>
  );
}
