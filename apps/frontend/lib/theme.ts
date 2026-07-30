/** Shared theme constants — imported by the pre-paint script and the toggle. */
export const THEME_STORAGE_KEY = "nmemo:theme";

export type Theme = "light" | "dark";

/**
 * Runs before first paint, inlined into the document head as a string.
 *
 * It has to be self-contained (no imports, no bundler help) and it has to be
 * cheap: read the stored choice, fall back to the OS, stamp `data-theme` on
 * <html> so the CSS in globals.css resolves correctly on the very first frame.
 */
export const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`.trim();
