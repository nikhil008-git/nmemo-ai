// ingest will be called by the backend when a new pdf is uploaded
import { randomUUID } from "crypto";
import fs from "fs/promises";
import pdf from "pdf-parse";
import { chunkText } from "./chunk.js";
import { embed } from "./embed.js";
import { qdrant, COLLECTION, ensureCollection } from "./qdrant.js";
import type { ChunkPayload } from "./types.js";

export async function ingestPdf(
  filePath: string,
  meta: { source: string; title: string; siteId?: string }
) {
  await ensureCollection();

  const buffer = await fs.readFile(filePath);
  const parsed = await pdf(buffer);
  const chunks = chunkText(parsed.text);

  // Batch embed (example: all at once for small PDFs)
  const vectors = await embed(chunks, "document");

  const points = chunks.map((text, i) => ({
    id: randomUUID(),
    vector: vectors[i]!,
    payload: {
      text,
      source: meta.source,
      title: meta.title,
      chunk_index: i,
      site_id: meta.siteId ?? "default",
    } satisfies ChunkPayload,
  }));

  // upsert : insert or update all the points in one go with collection name
  await qdrant.upsert(COLLECTION, { wait: true, points });
  return { chunkCount: chunks.length };
}