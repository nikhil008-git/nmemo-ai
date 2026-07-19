"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, FileText, LayoutGrid, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  group: "Pages" | "Sources";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  onQueryChange?: (query: string) => void;
};

function isModK(e: KeyboardEvent) {
  return (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
}

function useIsApple() {
  const [apple, setApple] = useState(true);
  useEffect(() => {
    setApple(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);
  return apple;
}

/** Clean ⌘K / Ctrl+K mark — sans for the symbol, not mono. */
function ShortcutMark({ className }: { className?: string }) {
  const apple = useIsApple();

  if (apple) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[10px] font-semibold tracking-tight text-neutral-500",
          className,
        )}
        aria-label="Command K"
      >
        <span className="font-sans text-[11px] leading-none">⌘</span>
        <span className="leading-none">K</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-[10px] font-semibold tracking-tight text-neutral-500",
        className,
      )}
      aria-label="Control K"
    >
      Ctrl+K
    </span>
  );
}

export function SearchTrigger({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-7 items-center gap-2 rounded-sm border border-border bg-white px-2 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50",
        className,
      )}
    >
      <Search
        size={12}
        strokeWidth={1.75}
        className="shrink-0 text-neutral-400 group-hover:text-neutral-600"
      />
      <span className="hidden text-[11px] font-semibold text-neutral-400 sm:inline">
        Search
      </span>
      <span className="rounded-[3px] bg-neutral-100 px-1.5 py-0.5">
        <ShortcutMark />
      </span>
    </button>
  );
}

export function CommandSearch({
  open,
  onOpenChange,
  items,
  onQueryChange,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.hint?.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isModK(e)) return;
      e.preventDefault();
      onOpenChange(!open);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Close when navigating via sidebar / tabs / links
  useEffect(() => {
    if (open) onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only pathname
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      onQueryChange?.("");
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open, onQueryChange]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-cmd-index="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  if (!open) return null;

  const groups = (["Pages", "Sources"] as const)
    .map((group) => ({
      group,
      items: filtered.filter((i) => i.group === group),
    }))
    .filter((g) => g.items.length > 0);

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[min(16vh,6.5rem)]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/20"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-border bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14)]">
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
          <Search size={15} strokeWidth={1.75} className="text-neutral-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onQueryChange?.(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onOpenChange(false);
                return;
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) =>
                  filtered.length ? Math.min(i + 1, filtered.length - 1) : 0,
                );
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                const item = filtered[active];
                if (item) go(item.href);
              }
            }}
            placeholder="Search pages and sources…"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-neutral-400"
          />
        </div>

        <ul
          ref={listRef}
          className="max-h-[min(20rem,50vh)] overflow-auto py-1.5"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-xs font-semibold text-neutral-400">
              No matches
            </li>
          ) : (
            groups.map(({ group, items: groupItems }) => (
              <li key={group}>
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                  {group}
                </p>
                <ul>
                  {groupItems.map((item) => {
                    flatIndex += 1;
                    const index = flatIndex;
                    const selected = index === active;
                    const Icon = group === "Sources" ? FileText : LayoutGrid;
                    return (
                      <li key={item.id} className="px-1.5">
                        <button
                          type="button"
                          data-cmd-index={index}
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(item.href)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm font-semibold",
                            selected
                              ? "bg-neutral-900 text-white"
                              : "text-foreground hover:bg-neutral-100",
                          )}
                        >
                          <Icon
                            size={14}
                            strokeWidth={1.75}
                            className={
                              selected ? "text-neutral-400" : "text-neutral-500"
                            }
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {item.hint ? (
                            <span
                              className={cn(
                                "max-w-[40%] truncate text-[11px] font-medium",
                                selected
                                  ? "text-neutral-500"
                                  : "text-neutral-400",
                              )}
                            >
                              {item.hint}
                            </span>
                          ) : null}
                          {selected ? (
                            <ArrowRight
                              size={13}
                              strokeWidth={2}
                              className="shrink-0 text-neutral-500"
                            />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
