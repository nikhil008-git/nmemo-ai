import { QdrantClient } from "@qdrant/js-client-rest";
import { VECTOR_SIZE } from "./embed.js";

export const COLLECTION = process.env.QDRANT_COLLECTION ?? "documents";
const configuredTimeout = Number(process.env.QDRANT_TIMEOUT_MS ?? 5000);

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL ?? "http://localhost:6333",
  // The client defaults to five minutes. A missing vector service should fail
  // quickly enough for the UI to show a useful source error instead of a
  // seemingly endless page loader.
  timeout:
    Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 5000,
  checkCompatibility: false,
  ...(process.env.QDRANT_API_KEY ? { apiKey: process.env.QDRANT_API_KEY } : {}),
});

function qdrantUnreachableMessage(err: unknown) {
  const url = process.env.QDRANT_URL ?? "http://localhost:6333";
  const cause =
    err && typeof err === "object" && "cause" in err
      ? (err as { cause?: { code?: string } }).cause
      : undefined;
  const code =
    cause?.code ??
    (err && typeof err === "object" && "code" in err
      ? String((err as { code?: unknown }).code)
      : "");
  if (code === "ECONNREFUSED" || /fetch failed/i.test(String(err))) {
    return `Qdrant is not reachable at ${url}. Start it with: docker run -d -p 6333:6333 --name qdrant qdrant/qdrant`;
  }
  return formatQdrantError(err);
}

/** Surface Qdrant body detail instead of bare "Bad Request". */
export function formatQdrantError(err: unknown): string {
  if (!err || typeof err !== "object") {
    return err instanceof Error ? err.message : "Qdrant request failed";
  }
  const e = err as {
    message?: string;
    statusText?: string;
    data?: unknown;
    status?: number;
  };
  const data = e.data;
  let detail = "";
  if (typeof data === "string") detail = data;
  else if (data && typeof data === "object") {
    const d = data as { status?: { error?: string }; error?: string };
    detail = d.status?.error || d.error || JSON.stringify(data).slice(0, 240);
  }
  const base =
    e.message && e.message !== "Bad Request"
      ? e.message
      : e.statusText && e.statusText !== "Bad Request"
        ? e.statusText
        : "Qdrant request failed";
  if (detail && !base.includes(detail)) {
    return `${base}: ${detail}`;
  }
  if (base === "Bad Request" || base === "Qdrant request failed") {
    return `Qdrant Bad Request${detail ? `: ${detail}` : ""}. Collection "${COLLECTION}" must use vector size ${VECTOR_SIZE} (Voyage). Delete/recreate it or set QDRANT_COLLECTION to a new name.`;
  }
  return base;
}

function vectorSizeFromCollection(info: {
  config?: {
    params?: {
      vectors?:
        | { size?: number }
        | Record<string, { size?: number } | undefined>
        | null;
    };
  };
}): number | null {
  const vectors = info.config?.params?.vectors;
  if (!vectors || typeof vectors !== "object") return null;
  if ("size" in vectors && typeof vectors.size === "number") {
    return vectors.size;
  }
  // Named vectors — take first size
  for (const v of Object.values(vectors)) {
    if (v && typeof v === "object" && typeof v.size === "number") {
      return v.size;
    }
  }
  return null;
}

export async function ensureCollection() {
  try {
    const { collections } = await qdrant.getCollections();
    const exists = collections.some((c) => c.name === COLLECTION);
    if (!exists) {
      await qdrant.createCollection(COLLECTION, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      try {
        await qdrant.createPayloadIndex(COLLECTION, {
          field_name: "site_id",
          field_schema: "keyword",
        });
      } catch {
        /* index may already exist on retry */
      }
      return;
    }

    const info = await qdrant.getCollection(COLLECTION);
    const size = vectorSizeFromCollection(info);
    if (size != null && size !== VECTOR_SIZE) {
      throw new Error(
        `Qdrant collection "${COLLECTION}" has vector size ${size}, but Voyage embeddings need ${VECTOR_SIZE}. Delete that collection in Qdrant (or set QDRANT_COLLECTION to a new empty name) and upload again.`,
      );
    }
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("vector size") ||
        err.message.includes("Voyage embeddings"))
    ) {
      throw err;
    }
    throw new Error(qdrantUnreachableMessage(err));
  }
}
