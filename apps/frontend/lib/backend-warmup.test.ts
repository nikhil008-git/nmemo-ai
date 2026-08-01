import assert from "node:assert/strict";
import test from "node:test";

import { createBackendWarmup } from "./backend-warmup";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

test("sends one non-blocking health request", async () => {
  const requests: { input: string; init: RequestInit }[] = [];
  const warm = createBackendWarmup({
    apiBaseUrl: "https://api.example.com/",
    storage: memoryStorage(),
    fetcher: async (input, init) => {
      requests.push({ input, init });
    },
  });

  assert.equal(warm(), true);
  assert.equal(warm(), false);
  await Promise.resolve();

  assert.deepEqual(requests, [
    {
      input: "https://api.example.com/health",
      init: {
        method: "GET",
        credentials: "omit",
        cache: "no-store",
        keepalive: true,
      },
    },
  ]);
});

test("deduplicates across warmers in the same tab session", () => {
  const storage = memoryStorage();
  let requests = 0;
  const options = {
    apiBaseUrl: "https://api.example.com",
    storage,
    fetcher: async () => {
      requests += 1;
    },
  };

  assert.equal(createBackendWarmup(options)(), true);
  assert.equal(createBackendWarmup(options)(), false);
  assert.equal(requests, 1);
});

test("silently handles synchronous and asynchronous fetch errors", async () => {
  const syncWarm = createBackendWarmup({
    apiBaseUrl: "https://api.example.com",
    fetcher: () => {
      throw new Error("offline");
    },
  });
  const asyncWarm = createBackendWarmup({
    apiBaseUrl: "https://api.example.com",
    fetcher: async () => {
      throw new Error("cold start timeout");
    },
  });

  assert.doesNotThrow(() => syncWarm());
  assert.doesNotThrow(() => asyncWarm());
  await Promise.resolve();
});
