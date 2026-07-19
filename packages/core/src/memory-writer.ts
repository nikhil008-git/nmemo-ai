import type { ConnectorRef } from "./types.js";

export type WriteMemoryInput = {
  userId: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  connectors: ConnectorRef[];
};

function mem0ApiKey(connectors: ConnectorRef[]): string | null {
  const mem0 = connectors.find(
    (c) => c.type === "mem0" && c.status === "connected",
  );
  if (!mem0?.config) return null;
  const key = mem0.config.apiKey;
  return typeof key === "string" && key.trim() ? key.trim() : null;
}

/** Persist a chat turn into mem0. No-op if mem0 is not connected. */
export async function writeMemory(input: WriteMemoryInput): Promise<boolean> {
  const apiKey = mem0ApiKey(input.connectors);
  if (!apiKey) return false;
  if (input.messages.length === 0) return false;

  const res = await fetch("https://api.mem0.ai/v1/memories/", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      user_id: input.userId,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `mem0 write failed (${res.status}): ${text.slice(0, 200)}`,
    );
  }
  return true;
}

/**
 * Fire-and-forget write after a response. Never throws to the caller.
 * Use after the HTTP response is sent / answer is ready.
 */
export function writeMemoryAsync(input: WriteMemoryInput): void {
  void writeMemory(input).catch((err) => {
    console.error(
      "[memory-writer]",
      err instanceof Error ? err.message : err,
    );
  });
}
