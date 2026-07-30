"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import "lenis/dist/lenis.css";

/**
 * Routes that scroll inside their own overflow containers — the logged-in
 * shell. Root Lenis hijacks the window scroller and breaks them. Docs is not
 * one of them: it scrolls as one document, exactly like the landing page.
 */
const APP_SCROLL_OWNERS = [
  "/home",
  "/playground",
  "/sources",
  "/connectors",
  "/keys",
  "/settings",
  "/chat",
  "/dashboard",
] as const;

function isAppShellPath(pathname: string) {
  return APP_SCROLL_OWNERS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAppShellPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: true }}>
      {children}
    </ReactLenis>
  );
}
