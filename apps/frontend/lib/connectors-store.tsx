"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getConnectors, updateConnector, type Connector } from "@/lib/api";

const CACHE_KEY = "nmemo:connectors-v1";
const CACHE_TTL_MS = 5 * 60_000;

type CachePayload = {
  at: number;
  userId: string;
  connectors: Connector[];
};

type ConnectorsContextValue = {
  connectors: Connector[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<Connector[]>;
  upsert: (connector: Connector) => void;
  setAll: (connectors: Connector[]) => void;
  patchConnector: (
    type: string,
    data: { status?: string; config?: Record<string, unknown> },
  ) => Promise<Connector>;
};

const ConnectorsContext = createContext<ConnectorsContextValue | null>(null);

function readCache(userId: string): Connector[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload;
    if (parsed.userId !== userId) return null;
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    if (!Array.isArray(parsed.connectors)) return null;
    return parsed.connectors;
  } catch {
    return null;
  }
}

function writeCache(userId: string, connectors: Connector[]) {
  try {
    const payload: CachePayload = {
      at: Date.now(),
      userId,
      connectors,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function ConnectorsProvider({
  userId,
  initialConnectors,
  children,
}: {
  userId: string;
  initialConnectors?: Connector[];
  children: React.ReactNode;
}) {
  const [connectors, setConnectors] = useState<Connector[]>(() => {
    if (typeof window === "undefined") return [];
    return readCache(userId) ?? initialConnectors ?? [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !readCache(userId) && !initialConnectors;
  });
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<Promise<Connector[]> | null>(null);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const setAll = useCallback((next: Connector[]) => {
    setConnectors(next);
    writeCache(userIdRef.current, next);
  }, []);

  const upsert = useCallback((connector: Connector) => {
    setConnectors((prev) => {
      const next = [
        ...prev.filter((c) => c.type !== connector.type),
        connector,
      ];
      writeCache(userIdRef.current, next);
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current;

    const run = (async () => {
      setError(null);
      try {
        const r = await getConnectors();
        setAll(r.connectors);
        return r.connectors;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load";
        if (/no workspace/i.test(msg)) {
          setAll([]);
          return [];
        }
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
        inflight.current = null;
      }
    })();

    inflight.current = run;
    return run;
  }, [setAll]);

  const patchConnector = useCallback(
    async (
      type: string,
      data: { status?: string; config?: Record<string, unknown> },
    ) => {
      const { connector } = await updateConnector(type, data);
      upsert(connector);
      return connector;
    },
    [upsert],
  );

  useEffect(() => {
    const seeded = readCache(userId) ?? initialConnectors;
    if (seeded) {
      setAll(seeded);
      setLoading(false);
      return;
    }

    setLoading(true);
    void refresh().catch(() => {
      /* error already stored */
    });
  }, [userId, initialConnectors, refresh, setAll]);

  const value = useMemo(
    () => ({
      connectors,
      loading,
      error,
      refresh,
      upsert,
      setAll,
      patchConnector,
    }),
    [connectors, loading, error, refresh, upsert, setAll, patchConnector],
  );

  return (
    <ConnectorsContext.Provider value={value}>
      {children}
    </ConnectorsContext.Provider>
  );
}

export function useConnectors() {
  const ctx = useContext(ConnectorsContext);
  if (!ctx) {
    throw new Error("useConnectors must be used within ConnectorsProvider");
  }
  return ctx;
}

/** Optional — pages outside the provider can fall back. */
export function useConnectorsOptional() {
  return useContext(ConnectorsContext);
}
