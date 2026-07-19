"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin top bar that runs on every route change (app, docs, landing).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<number[]>([]);
  const prevPath = useRef(pathname);

  useEffect(() => {
    return () => {
      for (const t of timers.current) window.clearTimeout(t);
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];

    setVisible(true);
    setWidth(12);

    timers.current.push(
      window.setTimeout(() => setWidth(55), 40),
      window.setTimeout(() => setWidth(78), 180),
      window.setTimeout(() => setWidth(92), 360),
      window.setTimeout(() => setWidth(100), 480),
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 640),
    );
  }, [pathname]);

  if (!visible && width === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      aria-hidden
    >
      <div
        className="h-full origin-left bg-secondary transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${width}%`,
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 8px rgba(234, 88, 12, 0.45)",
        }}
      />
    </div>
  );
}
