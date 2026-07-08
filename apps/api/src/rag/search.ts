import { embed } from "./embed.js";
import { qdrant, COLLECTION } from "./qdrant.js";

export type SearchHit = {
  text: string;
  source: string;
  title: string;
  chunk_index: number;
  score: number;
};

export async function search(
  question: string,
  opts = { limit: 5, siteId?: string }
): Promise<SearchHit[]> {
  const [vector] = await embed([question], "query");

  const filter = opts.siteId
    ? {
        must: [{ key: "site_id", match: { value: opts.siteId } }],
      }
    : undefined;

  const results = await qdrant.search(COLLECTION, {
    vector,
    limit: opts.limit,
    filter,
    with_payload: true,
  });

  return results.map((r) => ({
    text: r.payload?.text as string,
    source: r.payload?.source as string,
    title: r.payload?.title as string,
    chunk_index: r.payload?.chunk_index as number,
    score: r.score ?? 0,
  }));
}