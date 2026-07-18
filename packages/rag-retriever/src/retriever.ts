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
    // siteId filter left unset so legacy "default" docs remain searchable.
    const hits = await search(query, {
      limit: opts.limit ?? 5,
    });

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
