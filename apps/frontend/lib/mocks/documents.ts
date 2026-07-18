import type { IngestedDocument } from "./types";

export const initialDocuments: IngestedDocument[] = [
  {
    id: "doc-1",
    title: "Project Spec",
    source: "docs/context-engine/PROJECT_SPEC.md",
    chunkCount: 24,
    status: "ready",
    updatedAt: "2026-07-16T10:00:00.000Z",
  },
  {
    id: "doc-2",
    title: "Build UI guide",
    source: "apps/frontend/BUILD_UI.md",
    chunkCount: 8,
    status: "ready",
    updatedAt: "2026-07-17T14:30:00.000Z",
  },
  {
    id: "doc-3",
    title: "Refund policy (draft)",
    source: "uploads/refund-policy.pdf",
    chunkCount: 0,
    status: "pending",
    updatedAt: "2026-07-18T08:15:00.000Z",
  },
];

export function createPendingDocument(fileName: string): IngestedDocument {
  return {
    id: `doc-${crypto.randomUUID().slice(0, 8)}`,
    title: fileName.replace(/\.[^.]+$/, "") || fileName,
    source: `uploads/${fileName}`,
    chunkCount: 0,
    status: "pending",
    updatedAt: new Date().toISOString(),
  };
}

export function markDocumentReady(doc: IngestedDocument): IngestedDocument {
  return {
    ...doc,
    status: "ready",
    chunkCount: Math.max(4, Math.floor(Math.random() * 20) + 4),
    updatedAt: new Date().toISOString(),
  };
}
