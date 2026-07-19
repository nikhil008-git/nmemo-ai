import { qdrant, COLLECTION, ensureCollection, formatQdrantError } from "./qdrant.js";

async function deleteBySiteAndSource(siteId: string, source: string) {
  await qdrant.delete(COLLECTION, {
    wait: true,
    filter: {
      must: [
        { key: "site_id", match: { value: siteId } },
        { key: "source", match: { value: source } },
      ],
    },
  });
}

/**
 * Remove all Qdrant chunks for a document (by source filename) in a workspace.
 * Also clears legacy site_id "default" points with the same source when present.
 */
export async function deleteDocument(
  siteId: string,
  source: string,
): Promise<{ deleted: true; source: string }> {
  const trimmed = source.trim();
  if (!trimmed) {
    throw new Error("source required");
  }

  await ensureCollection();

  try {
    await deleteBySiteAndSource(siteId, trimmed);
    if (siteId !== "default") {
      // Legacy uploads used site_id "default" before workspace scoping.
      await deleteBySiteAndSource("default", trimmed);
    }
  } catch (err) {
    throw new Error(formatQdrantError(err));
  }

  return { deleted: true, source: trimmed };
}
