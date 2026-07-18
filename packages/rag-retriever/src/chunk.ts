export function chunkText(
  text: string,
  opts = { targetWords: 500, overlapRatio: 0.15 },
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const size = opts.targetWords;
  const step = Math.max(1, Math.floor(size * (1 - opts.overlapRatio)));
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += step) {
    chunks.push(words.slice(i, i + size).join(" "));
    if (i + size >= words.length) break;
  }
  return chunks;
}
