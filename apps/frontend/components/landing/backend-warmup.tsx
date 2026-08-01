"use client";

import { useEffect } from "react";

import { warmRenderBackend } from "@/lib/backend-warmup";

const WARMUP_TARGET = "[data-backend-warmup]";

/** Warms Render after hydration and again on pre-click intent if still needed. */
export function BackendWarmup() {
  useEffect(() => {
    const warmOnIntent = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(WARMUP_TARGET)) {
        warmRenderBackend();
      }
    };

    warmRenderBackend();
    document.addEventListener("mouseover", warmOnIntent, { passive: true });
    document.addEventListener("focusin", warmOnIntent);
    document.addEventListener("touchstart", warmOnIntent, { passive: true });

    return () => {
      document.removeEventListener("mouseover", warmOnIntent);
      document.removeEventListener("focusin", warmOnIntent);
      document.removeEventListener("touchstart", warmOnIntent);
    };
  }, []);

  return null;
}
