export type DocumentChunk = {
  source_url: string;
  title: string;
  section: string;
  chunk_index: number;
  text: string;
};

export type ParsedDocument = {
  source_url: string;
  title: string;
  section: string;
  content: string;
};
