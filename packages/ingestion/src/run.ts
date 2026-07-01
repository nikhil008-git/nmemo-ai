import { chunkDocuments } from "./chunk.js";
import { embedChunks } from "./embed.js";
import { parseMarkdown } from "./parse.js";
import { upsertToQdrant } from "./qdrant.js";

export async function runIngestion(inputPath: string): Promise<void> {
  console.log(`[ingestion] starting ingest for ${inputPath}`);

  const doc = parseMarkdown(
    "# Sample\n\nPlaceholder content until corpus is wired.",
    {
      source_url: inputPath,
      title: "Sample doc",
      section: "intro",
    },
  );

  const chunks = chunkDocuments([doc]);
  const embedded = await embedChunks(chunks);
  await upsertToQdrant(embedded);

  console.log(`[ingestion] done — ${chunks.length} chunks processed`);
}

if (process.argv[1]?.endsWith("run.js")) {
  const input = process.argv[2] ?? "./corpus/sample.md";
  runIngestion(input).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
