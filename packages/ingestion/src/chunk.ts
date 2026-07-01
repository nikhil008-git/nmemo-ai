import type { DocumentChunk, ParsedDocument } from "./types.js";

const TARGET_TOKENS = 650;
const OVERLAP_RATIO = 0.12;

function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
}

export function chunkDocument(doc: ParsedDocument): DocumentChunk[] {
  const words = doc.content.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const wordsPerChunk = Math.max(1, Math.floor(TARGET_TOKENS / 1.3));
  const overlapWords = Math.floor(wordsPerChunk * OVERLAP_RATIO);
  const step = Math.max(1, wordsPerChunk - overlapWords);
  const chunks: DocumentChunk[] = [];

  for (let i = 0, index = 0; i < words.length; i += step, index += 1) {
    const slice = words.slice(i, i + wordsPerChunk);
    if (slice.length === 0) break;

    chunks.push({
      source_url: doc.source_url,
      title: doc.title,
      section: doc.section,
      chunk_index: index,
      text: slice.join(" "),
    });

    if (i + wordsPerChunk >= words.length) break;
  }

  return chunks;
}

export function chunkDocuments(docs: ParsedDocument[]): DocumentChunk[] {
  return docs.flatMap(chunkDocument);
}

/** @internal for tests */
export { estimateTokens };
