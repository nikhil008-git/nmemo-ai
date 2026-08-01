import { getDirectApiBaseUrl } from "@/lib/api";

type WarmupStorage = Pick<Storage, "getItem" | "setItem">;
type WarmupFetch = (input: string, init: RequestInit) => PromiseLike<unknown>;

type BackendWarmupOptions = {
  apiBaseUrl: string;
  fetcher: WarmupFetch;
  storage?: WarmupStorage;
};

/**
 * Creates a fire-and-forget backend warmer.
 *
 * The in-memory flag deduplicates repeated intent events, while sessionStorage
 * keeps client-side route changes and reloads in the same tab from waking the
 * same backend again.
 */
export function createBackendWarmup({
  apiBaseUrl,
  fetcher,
  storage,
}: BackendWarmupOptions) {
  const healthUrl = `${apiBaseUrl.replace(/\/$/, "")}/health`;
  const storageKey = `nmemo:backend-warmup:${healthUrl}`;
  let started = false;

  return function warmBackend() {
    if (started) return false;

    try {
      if (storage?.getItem(storageKey) === "1") {
        started = true;
        return false;
      }
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }

    started = true;

    try {
      storage?.setItem(storageKey, "1");
    } catch {
      // The in-memory flag still deduplicates this page load.
    }

    try {
      void fetcher(healthUrl, {
        method: "GET",
        credentials: "omit",
        cache: "no-store",
        keepalive: true,
      }).then(undefined, () => undefined);
    } catch {
      // A warm-up is opportunistic and must never affect rendering or actions.
    }

    return true;
  };
}

let browserWarmup: (() => boolean) | undefined;

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

/** Starts the Render backend once for the lifetime of the current browser tab. */
export function warmRenderBackend() {
  if (typeof window === "undefined") return false;

  browserWarmup ??= createBackendWarmup({
    apiBaseUrl: getDirectApiBaseUrl(),
    fetcher: window.fetch.bind(window),
    storage: getSessionStorage(),
  });

  return browserWarmup();
}
