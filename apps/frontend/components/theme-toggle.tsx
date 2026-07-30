"use client";

import { useEffect, useState } from "react";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * The half-filled disc: one glyph that reads as "this page has two states"
 * without committing to a sun or a moon. The fill flips with the theme.
 */
function ThemeMark({ theme }: { theme: Theme }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4"
      aria-hidden
      // Flipped, not animated — the switch is instant on click.
      style={{ transform: theme === "light" ? "rotate(180deg)" : undefined }}
    >
      <circle
        cx="8"
        cy="8"
        r="6.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
    </svg>
  );
}

/**
 * Reads the theme back off <html> rather than from storage: the pre-paint
 * script has already resolved storage vs. OS preference, so the DOM is the
 * single source of truth and the two can never disagree.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  // Follow the OS while the reader has never made an explicit choice.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      const next: Theme = event.matches ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode — the choice just won't outlive the tab.
    }
  }

  const classes = cn(
    "inline-flex size-8 items-center justify-center rounded-full text-ink/45 transition-colors hover:text-foreground",
    className,
  );

  // Until mount, the client can't know which glyph the server rendered — hold
  // the space so the row doesn't reflow when it appears.
  if (!theme) return <span className={classes} aria-hidden />;

  return (
    <button
      type="button"
      onClick={toggle}
      className={classes}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <ThemeMark theme={theme} />
    </button>
  );
}
