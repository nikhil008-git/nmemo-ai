import type { DocumentChunk } from "./types.js";

export type EmbeddedChunk = DocumentChunk & {
  vector: number[];
};

export async function embedChunks(chunks: DocumentChunk[]): Promise<EmbeddedChunk[]> {
  // TODO: call Voyage voyage-3 or OpenAI text-embedding-3-large
  return chunks.map((chunk) => ({
    ...chunk,
    vector: [],
  }));
}
