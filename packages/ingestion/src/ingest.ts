import { readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";

config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

export type Chunk = {
  source_url: string;
  title: string;
  chunk_index: number;
  text: string;
};

type EmbeddedChunk = Chunk & { vector: number[] };

const TARGET_TOKENS = 650;
const OVERLAP_RATIO = 0.12;
const COLLECTION = process.env.QDRANT_COLLECTION ?? "help-docs";

function chunkText(
  text: string,
  meta: Pick<Chunk, "source_url" | "title">,
): Chunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const wordsPerChunk = Math.max(1, Math.floor(TARGET_TOKENS / 1.3));
  const overlapWords = Math.floor(wordsPerChunk * OVERLAP_RATIO);
  const step = Math.max(1, wordsPerChunk - overlapWords);
  const chunks: Chunk[] = [];

  for (let i = 0, index = 0; i < words.length; i += step, index += 1) {
    const slice = words.slice(i, i + wordsPerChunk);
    if (slice.length === 0) break;

    chunks.push({ ...meta, chunk_index: index, text: slice.join(" ") });
    if (i + wordsPerChunk >= words.length) break;
  }

  return chunks;
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const voyageKey = process.env.VOYAGE_API_KEY;
  if (voyageKey) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${voyageKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: texts, model: "voyage-3" }),
    });
    if (!res.ok) throw new Error(`Voyage embed failed: ${await res.text()}`);
    const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return data.data.map((d) => d.embedding);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: texts, model: "text-embedding-3-large" }),
    });
    if (!res.ok) throw new Error(`OpenAI embed failed: ${await res.text()}`);
    const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return data.data.map((d) => d.embedding);
  }

  throw new Error("Set VOYAGE_API_KEY or OPENAI_API_KEY");
}


// update if exisit else create
async function upsertToQdrant(chunks: EmbeddedChunk[]): Promise<void> {
  if (chunks.length === 0) return;

  const url = process.env.QDRANT_URL ?? "http://localhost:6333";
  const client = new QdrantClient({ url, apiKey: process.env.QDRANT_API_KEY });

  const vectorSize = chunks[0]!.vector.length;
  const { collections } = await client.getCollections();
  if (!collections.some((c) => c.name === COLLECTION)) {
    await client.createCollection(COLLECTION, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
  }

  await client.upsert(COLLECTION, {
    wait: true,
    points: chunks.map((chunk) => ({
      id: crypto.randomUUID(),
      vector: chunk.vector,
      payload: {
        source_url: chunk.source_url,
        title: chunk.title,
        chunk_index: chunk.chunk_index,
        text: chunk.text,
      },
    })),
  });
}

export async function runIngestion(filePath: string): Promise<void> {
  console.log(`[ingestion] reading ${filePath}`);

  const text = await readFile(filePath, "utf-8");
  const meta = { source_url: filePath, title: basename(filePath) };

  const chunks = chunkText(text, meta);
  console.log(`[ingestion] ${chunks.length} chunks`);

  const vectors = await embedTexts(chunks.map((c) => c.text));
  const embedded = chunks.map((chunk, i) => ({ ...chunk, vector: vectors[i]! }));

  await upsertToQdrant(embedded);
  console.log(`[ingestion] upserted ${embedded.length} chunks to ${COLLECTION}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = process.argv[2] ?? "./corpus/sample.md";
  runIngestion(input).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}   