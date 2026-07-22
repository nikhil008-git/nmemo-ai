"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import "lenis/dist/lenis.css";

/** Logged-in shell uses its own overflow containers — root Lenis breaks those. */
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
