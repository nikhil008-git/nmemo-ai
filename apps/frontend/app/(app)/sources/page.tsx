"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import {
  createPendingDocument,
  initialDocuments,
  markDocumentReady,
  type IngestedDocument,
} from "@/lib/mocks";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SourcesPage() {
  const [docs, setDocs] = useState<IngestedDocument[]>(initialDocuments);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function ingestFiles(files: FileList | null) {
    if (!files?.length) return;
    const pending = Array.from(files).map((f) => createPendingDocument(f.name));
    setDocs((prev) => [...pending, ...prev]);

    for (const doc of pending) {
      window.setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) => (d.id === doc.id ? markDocumentReady(d) : d)),
        );
      }, 1200 + Math.random() * 800);
    }
  }

  return (
    <main className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Sources
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm font-light text-muted-foreground">
          Upload docs to mock ingest. Wire to{" "}
          <code className="text-foreground/80">POST /ingest</code> later.
        </p>
      </header>

      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          ingestFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-start gap-3 border border-dashed px-4 py-8 transition-colors ${
          dragging ? "border-foreground/50 bg-foreground/5" : "border-border"
        }`}
      >
        <p className="text-sm text-muted-foreground">
          Drop files here, or choose files to mock-ingest.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            ingestFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold tracking-wide">Ingested</h2>
          {docs.some((d) => d.status === "ready") && (
            <Link
              href="/chat"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Try chat →
            </Link>
          )}
        </div>

        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents yet. Upload something to get started, then open Chat.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Chunks</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3 font-medium">{doc.title}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                      {doc.source}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {doc.chunkCount || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatTime(doc.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: IngestedDocument["status"] }) {
  const label =
    status === "ready" ? "Ready" : status === "pending" ? "Pending" : "Failed";
  return (
    <span
      className={`text-xs font-medium uppercase tracking-wider ${
        status === "ready"
          ? "text-foreground"
          : status === "pending"
            ? "animate-pulse text-muted-foreground"
            : "text-red-500"
      }`}
    >
      {label}
    </span>
  );
}
