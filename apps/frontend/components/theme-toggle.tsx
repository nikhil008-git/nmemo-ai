"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Square icon button that flips the landing canvas between dark and white. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to white theme" : "Switch to dark theme"}
      title={isDark ? "White theme" : "Dark theme"}
      className={cn(
        "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[11px] border transition-colors",
        isDark
          ? "border-white/10 bg-[#1f1f24] text-[#f7f7f8] hover:bg-[#2a2a30]"
          : "border-black/10 bg-[#f4f2ef] text-[#29251e] hover:bg-[#e7e4df]",
        className,
      )}
    >
      {isDark ? (
        <Sun size={17} strokeWidth={2} aria-hidden />
      ) : (
        <Moon size={16} strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}
