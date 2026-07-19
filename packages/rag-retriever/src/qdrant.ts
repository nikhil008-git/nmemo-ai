import { QdrantClient } from "@qdrant/js-client-rest";
import { VECTOR_SIZE } from "./embed.js";

export const COLLECTION = process.env.QDRANT_COLLECTION ?? "documents";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL ?? "http://localhost:6333",
  checkCompatibility: false,
  ...(process.env.QDRANT_API_KEY
    ? { apiKey: process.env.QDRANT_API_KEY }
    : {}),
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
  return err instanceof Error ? err.message : "Qdrant request failed";
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
    }
  } catch (err) {
    throw new Error(qdrantUnreachableMessage(err));
  }
}
