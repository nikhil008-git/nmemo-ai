import type { SVGProps } from "react";

/**
 * The mockups need icons that hold up at 12px inside a fake terminal, which
 * rules out anything with a 2px stroke. One hairline set, drawn here so the
 * product windows never wait on an icon package to hydrate.
 */
type Icon = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const GitHub: Icon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.5l-.01-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9l-.01 2.82c0 .28.18.6.69.5A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
  </svg>
);

export const XMark: Icon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M17.3 3h3.02l-6.6 7.55L21.5 21h-6.08l-4.76-6.23L5.2 21H2.18l7.06-8.07L2.5 3h6.24l4.3 5.69L17.3 3Zm-1.06 16.2h1.67L7.84 4.71H6.05L16.24 19.2Z" />
  </svg>
);

/** Points right at rest; rotate it -90° for the "open" arrow on a CTA. */
export const ArrowDownTray: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <path d="M12 3.5v11m0 0 3.5-3.5M12 14.5 8.5 11" />
    <path d="M4.5 16.5v1.75A2.25 2.25 0 0 0 6.75 20.5h10.5a2.25 2.25 0 0 0 2.25-2.25V16.5" />
  </svg>
);

export const TerminalIcon: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="M7.5 9.5 10.5 12l-3 2.5M13 15h4" />
  </svg>
);

export const Check: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const Plus: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Folder: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <path d="M3.5 6.75A1.75 1.75 0 0 1 5.25 5h3.4c.5 0 .97.21 1.3.58l.9.99h7.9c.97 0 1.75.78 1.75 1.75v9.43c0 .96-.78 1.75-1.75 1.75H5.25a1.75 1.75 0 0 1-1.75-1.75V6.75Z" />
  </svg>
);

export const Branch: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <circle cx="7" cy="5.5" r="2.25" />
    <circle cx="7" cy="18.5" r="2.25" />
    <circle cx="17" cy="9" r="2.25" />
    <path d="M7 7.75v8.5M17 11.25c0 3-2.4 4.1-5.2 4.6" />
  </svg>
);

export const ChevronRight: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
);

export const ChevronDown: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const Copy: Icon = (props) => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden {...props}>
    <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
    <path d="M15 6.5V5.75A2.25 2.25 0 0 0 12.75 3.5H5.75A2.25 2.25 0 0 0 3.5 5.75v7A2.25 2.25 0 0 0 5.75 15h.75" />
  </svg>
);
