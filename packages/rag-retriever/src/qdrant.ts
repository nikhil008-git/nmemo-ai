import { QdrantClient } from "@qdrant/js-client-rest";
import { VECTOR_SIZE } from "./embed.js";

export const COLLECTION = process.env.QDRANT_COLLECTION ?? "documents";

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL ?? "http://localhost:6333",
  ...(process.env.QDRANT_API_KEY
    ? { apiKey: process.env.QDRANT_API_KEY }
    : {}),
});

export async function ensureCollection() {
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
}
