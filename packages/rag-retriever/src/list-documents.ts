import { qdrant, COLLECTION, ensureCollection } from "./qdrant.js";

export type ListedDocument = {
  id: string;
  title: string;
  source: string;
  chunkCount: number;
  status: "ready";
  updatedAt: string;
};

async function scrollGrouped(siteIds: string[]) {
  const bySource = new Map<
    string,
    { title: string; source: string; chunkCount: number }
  >();

  for (const siteId of siteIds) {
    let offset: string | number | Record<string, unknown> | null | undefined;
    for (let page = 0; page < 50; page++) {
      const result = await qdrant.scroll(COLLECTION, {
        filter: {
          must: [{ key: "site_id", match: { value: siteId } }],
        },
        limit: 256,
        with_payload: true,
        with_vector: false,
        ...(offset != null
          ? { offset: offset as string | number | Record<string, unknown> }
          : {}),
      });

      for (const point of result.points) {
        const payload = (point.payload ?? {}) as {
          source?: string;
          title?: string;
        };
        const source = payload.source || String(point.id);
        const title = payload.title || source;
        const prev = bySource.get(source);
        if (prev) {
          prev.chunkCount += 1;
          if (!prev.title && title) prev.title = title;
        } else {
          bySource.set(source, { title, source, chunkCount: 1 });
        }
      }

      offset = result.next_page_offset as
        | string
        | number
        | Record<string, unknown>
        | null
        | undefined;
      if (offset == null) break;
    }
  }

  return bySource;
}

/** Aggregate Qdrant chunks for a workspace into document rows. */
export async function listDocuments(siteId: string): Promise<ListedDocument[]> {
  await ensureCollection();

  // Include legacy "default" site so earlier uploads still show after refresh.
  let bySource = await scrollGrouped([siteId]);
  if (bySource.size === 0 && siteId !== "default") {
    bySource = await scrollGrouped(["default"]);
  }

  const now = new Date().toISOString();
  return [...bySource.values()]
    .map((doc) => ({
      id: `src:${doc.source}`,
      title: doc.title,
      source: doc.source,
      chunkCount: doc.chunkCount,
      status: "ready" as const,
      updatedAt: now,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
