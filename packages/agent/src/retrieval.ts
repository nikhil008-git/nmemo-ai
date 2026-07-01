export type RetrievedChunk = {
  source_url: string;
  title: string;
  section: string;
  chunk_index: number;
  text: string;
  score: number;
};

export async function retrieve(_query: string): Promise<RetrievedChunk[]> {
  return [];
}
