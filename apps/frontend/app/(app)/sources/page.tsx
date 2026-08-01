"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  PageHeader,
  SectionLabel,
  appFieldClass,
  appPanelClass,
} from "@/components/app/page-header";
import { CtaButton } from "@/components/ui/cta-button";
import { DocumentsTableSkeleton } from "@/components/ui/loading-states";
import { Spinner } from "@/components/ui/spinner";
import { deleteDocument, ingestPdfFile, listDocuments } from "@/lib/api";
import type { IngestedDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [deletingSource, setDeletingSource] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async (fresh = true) => {
    setLoading(true);
    setError(null);
    try {
      const { documents } = await listDocuments({ fresh });
      setDocs(documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) || d.source.toLowerCase().includes(q),
    );
  }, [docs, filter]);

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
                  id: `src:${result.source}`,
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
        const message = err instanceof Error ? err.message : "Ingest failed";
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

    void refresh(true);
  }

  async function removeDocument(doc: IngestedDocument) {
    if (doc.status === "pending") return;
    const ok = window.confirm(
      `Delete “${doc.title}”? This removes all chunks from the workspace.`,
    );
    if (!ok) return;

    setDeletingSource(doc.source);
    setError(null);
    try {
      await deleteDocument(doc.source);
      setDocs((prev) => prev.filter((d) => d.source !== doc.source));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingSource(null);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Documents"
        description={
          <>
            Upload PDFs as workspace knowledge, available in{" "}
            <Link
              href="/playground"
              className="text-foreground underline underline-offset-4"
            >
              Playground
            </Link>{" "}
            and your agents.
          </>
        }
        actions={
          docs.some((d) => d.status === "ready") ? (
            <CtaButton href="/playground" size="compact">
              Open Playground
            </CtaButton>
          ) : null
        }
      />

      {error && (
        <p className="break-words text-sm font-semibold text-red-500">
          {error}
        </p>
      )}

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
        className={cn(
          "flex flex-col items-start gap-3 rounded-sm border border-border px-4 py-8 transition-colors",
          dragging
            ? "border-neutral-400 bg-neutral-100"
            : "border-border bg-neutral-50/50",
        )}
      >
        <p className="text-sm font-semibold text-neutral-500">
          Drop PDF files here for this workspace.
        </p>
        <CtaButton
          type="button"
          size="compact"
          onClick={() => inputRef.current?.click()}
        >
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionLabel>
            Ingested{" "}
            {!loading ? (
              <span className="font-semibold text-neutral-400">
                ({docs.length})
              </span>
            ) : null}
          </SectionLabel>
          <div className="flex flex-wrap items-center gap-2">
            {docs.length > 0 ? (
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter documents…"
                className={cn(appFieldClass, "max-w-xs !py-1.5 text-xs")}
              />
            ) : null}
            <button
              type="button"
              onClick={() => void refresh(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
            >
              {loading && docs.length > 0 ? <Spinner size={12} /> : null}
              Refresh
            </button>
          </div>
        </div>

        {loading && docs.length === 0 ? (
          <DocumentsTableSkeleton />
        ) : docs.length === 0 ? (
          <p className="text-sm font-semibold text-neutral-500">
            No documents yet. Upload a PDF, then open Playground.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm font-semibold text-neutral-500">
            No documents match “{filter}”.
          </p>
        ) : (
          <div className={cn(appPanelClass, "overflow-x-auto")}>
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Chunks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((doc) => {
                  const deleting = deletingSource === doc.source;
                  return (
                    <tr key={doc.id} className="hover:bg-neutral-50/80">
                      <td className="px-4 py-3 font-semibold">{doc.title}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 font-semibold text-neutral-500">
                        {doc.source}
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-500">
                        {doc.chunkCount || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-500">
                        {formatTime(doc.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {doc.status !== "pending" ? (
                          <button
                            type="button"
                            disabled={deleting || deletingSource != null}
                            onClick={() => void removeDocument(doc)}
                            className="text-xs font-semibold text-neutral-500 underline-offset-4 hover:text-red-600 hover:underline disabled:opacity-40"
                          >
                            {deleting ? "Deleting…" : "Delete"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: IngestedDocument["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
        <Spinner size={12} className="text-neutral-500" />
        Pending
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-[11px] font-bold uppercase tracking-wider",
        status === "ready" ? "text-foreground" : "text-red-500",
      )}
    >
      {status === "ready" ? "Ready" : "Failed"}
    </span>
  );
}
