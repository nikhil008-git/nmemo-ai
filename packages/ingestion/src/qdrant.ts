import type { EmbeddedChunk } from "./embed.js";

const COLLECTION = "nmemo_docs";

export async function upsertToQdrant(chunks: EmbeddedChunk[]): Promise<void> {
  const url = process.env.QDRANT_URL ?? "http://localhost:6333";
  if (chunks.length === 0) {
    console.log("[ingestion] no chunks to upsert");
    return;
  }

  // TODO: ensure collection exists, batch upsert with metadata payload
  console.log(`[ingestion] would upsert ${chunks.length} chunks to ${url}/${COLLECTION}`);
}
