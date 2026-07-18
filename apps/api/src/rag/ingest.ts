// ingest will be called by the backend when a new pdf is uploaded
import { randomUUID } from "crypto";
import fs from "fs/promises";
import pdf from "pdf-parse";
import { chunkText } from "./chunk.js";
import { embed } from "./embed.js";
import { qdrant, COLLECTION, ensureCollection } from "./qdrant.js";
import type { ChunkPayload } from "./types.js";

export async function ingestPdf(
  input: string | Buffer,
  meta: { source: string; title: string; siteId?: string }
) {
  await ensureCollection();

  const buffer = typeof input === "string" ? await fs.readFile(input) : input;

  let parsed: { text: string };
  try {
    parsed = await pdf(buffer);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "parse error";
    throw new Error(
      `Could not parse PDF (${detail}). Try another PDF or re-export it.`,
    );
  }

  const text = parsed.text?.trim() ?? "";
  if (!text) {
    throw new Error(
      "PDF has no extractable text (it may be image-only / scanned).",
    );
  }

  const chunks = chunkText(text);
  if (!chunks.length) {
    throw new Error("PDF produced no chunks after splitting.");
  }

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
