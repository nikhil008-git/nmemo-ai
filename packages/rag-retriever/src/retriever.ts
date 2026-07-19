import { randomUUID } from "crypto";
import type {
  ContextItem,
  RetrieveOpts,
  Retriever,
} from "@contextengine/retriever-interface";
import { search } from "./search.js";

export class RagRetriever implements Retriever {
  readonly id = "qdrant";

  async retrieve(query: string, opts: RetrieveOpts): Promise<ContextItem[]> {
    let hits = await search(query, {
      limit: opts.limit ?? 5,
      siteId: opts.workspaceId,
    });
    // Legacy ingest used site_id "default" before workspace scoping.
    if (hits.length === 0) {
      hits = await search(query, {
        limit: opts.limit ?? 5,
        siteId: "default",
      });
    }

    return hits.map((h) => ({
      id: randomUUID(),
      text: h.text,
      source: h.source,
      title: h.title,
      score: h.score,
      metadata: { chunk_index: h.chunk_index },
    }));
  }
}
