"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { ingestPdfFile } from "@/lib/api";
import { CtaButton } from "@/components/ui/cta-button";
import type { IngestedDocument } from "@/lib/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SourcesPage() {
  const [docs, setDocs] = useState<IngestedDocument[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ingestFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const pdfs = Array.from(files).filter(
      (f) =>
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (!pdfs.length) {
      setError("Only PDF files are supported for now.");
      return;
    }

    for (const file of pdfs) {
      const id = `doc-${crypto.randomUUID().slice(0, 8)}`;
      const pending: IngestedDocument = {
        id,
        title: file.name.replace(/\.pdf$/i, ""),
        source: file.name,
        chunkCount: 0,
        status: "pending",
        updatedAt: new Date().toISOString(),
      };
      setDocs((prev) => [pending, ...prev]);

      try {
        const result = await ingestPdfFile(file, { title: pending.title });
        setDocs((prev) =>
          prev.map((d) =>
            d.id === id
              ? {
                  ...d,
                  title: result.title,
                  source: result.source,
                  chunkCount: result.chunkCount,
                  status: "ready",
                  updatedAt: new Date().toISOString(),
                }
              : d,
          ),
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Ingest failed";
        setError(message);
        setDocs((prev) =>
          prev.map((d) =>
            d.id === id
              ? { ...d, status: "failed", updatedAt: new Date().toISOString() }
              : d,
          ),
        );
      }
    }
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Documents</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Document RAG for this workspace. Used by the{" "}
          <Link href="/playground" className="underline underline-offset-4">
            Playground
          </Link>{" "}
          and SDK via{" "}
          <code className="text-foreground/80">getContext()</code>.
        </p>
      </header>

      {error && <p className="text-sm text-red-500 break-words">{error}</p>}

      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void ingestFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-start gap-3 border border-dashed px-4 py-8 transition-colors ${
          dragging ? "border-foreground/50 bg-foreground/5" : "border-border"
        }`}
      >
        <p className="text-sm text-muted-foreground">
          Drop PDF files here. Ingest requires a session cookie (sign in) and
          API on :8080.
        </p>
        <CtaButton type="button" size="compact" onClick={() => inputRef.current?.click()}>
          Choose PDFs
        </CtaButton>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            void ingestFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold tracking-wide">Ingested</h2>
          {docs.some((d) => d.status === "ready") && (
            <Link
              href="/playground"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Open Playground →
            </Link>
          )}
        </div>

        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents yet this session. Upload a PDF, then open Playground.
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
