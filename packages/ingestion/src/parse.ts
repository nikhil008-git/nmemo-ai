import type { ParsedDocument } from "./types.js";

export function parseMarkdown(
  content: string,
  meta: Pick<ParsedDocument, "source_url" | "title" | "section">,
): ParsedDocument {
  return { ...meta, content: content.trim() };
}

export function parseHtml(
  html: string,
  meta: Pick<ParsedDocument, "source_url" | "title" | "section">,
): ParsedDocument {
  const content = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { ...meta, content };
}
