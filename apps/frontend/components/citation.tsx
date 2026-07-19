import type { Citation as CitationType } from "@/lib/types";

type Props = {
  citations: CitationType[];
};

export function CitationList({ citations }: Props) {
  if (!citations.length) return null;

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {citations.map((c) => (
        <li key={c.id}>
          <a
            href={c.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            title={c.snippet}
            className="inline-flex max-w-xs items-center truncate rounded-sm border border-border px-2.5 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-foreground"
          >
            {c.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
