"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_STORAGE_KEY = "nmemo:dismiss-coming-soon-banner";

type Props = {
  /** Separate dismiss state for marketing vs app shell. */
  storageKey?: string;
};

export function ComingSoonBanner({
  storageKey = DEFAULT_STORAGE_KEY,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="flex h-7 shrink-0 items-center justify-center gap-3 border-b border-border bg-panel px-3 text-[11px] font-medium text-neutral-500">
      <p className="truncate text-center tracking-[-0.01em]">
        Next up: voice context, real-time turns, and multi-language
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-foreground/10 hover:text-foreground"
        aria-label="Dismiss banner"
      >
        <X size={12} strokeWidth={2} />
      </button>
    </div>
  );
}
