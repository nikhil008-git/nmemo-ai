import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { getContext } from "@contextengine/core";
import { ingestPdf } from "@contextengine/rag-retriever";
import { ensureDefaultWorkspace } from "@repo/db";
import { requireSession } from "./middleware/requireSession.js";
import { completeFromPrompt } from "./lib/llm.js";
import { contextRouter } from "./routes/context.js";
import { oauthRouter } from "./routes/oauth.js";
import { workspaceRouter } from "./routes/workspace.js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/protected", requireSession, (_req, res) => {
  res.json({ message: "Protected route" });
});

app.use("/context", contextRouter);
app.use("/workspaces", workspaceRouter);
app.use("/oauth", oauthRouter);

app.post("/ingest", requireSession, upload.single("file"), async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(
      req.user!.id,
      req.user!.name,
    );
    const siteId = workspace.id;

    if (req.file) {
      if (req.file.mimetype !== "application/pdf") {
        res.status(400).json({ error: "Only PDF uploads are supported" });
        return;
      }
      const title =
        (typeof req.body?.title === "string" && req.body.title) ||
        req.file.originalname;
      const result = await ingestPdf(req.file.buffer, {
        source: req.file.originalname,
        title,
        siteId,
      });
      res.json({
        chunkCount: result.chunkCount,
        title,
        source: req.file.originalname,
      });
      return;
    }

    const { filePath, title } = req.body as {
      filePath?: string;
      title?: string;
    };
    if (!filePath) {
      res.status(400).json({ error: "file (multipart) or filePath required" });
      return;
    }
    const result = await ingestPdf(filePath, {
      source: filePath,
      title: title ?? filePath,
      siteId,
    });
    res.json({
      chunkCount: result.chunkCount,
      title: title ?? filePath,
      source: filePath,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "ingest failed";
    const status =
      message.includes("429") || message.includes("rate") ? 429 : 500;
    res.status(status).json({ error: message });
  }
});

app.post("/ask", requireSession, async (req, res) => {
  try {
    const { question } = req.body as { question?: string };
    if (!question?.trim()) {
      res.status(400).json({ error: "question required" });
      return;
    }

    const workspace = await ensureDefaultWorkspace(
      req.user!.id,
      req.user!.name,
    );

    const context = await getContext({
      query: question.trim(),
      userId: req.user!.id,
      workspaceId: workspace.id,
      connectors: workspace.connectors.map((c) => ({
        type: c.type,
        status: c.status,
        config:
          c.config && typeof c.config === "object"
            ? (c.config as Record<string, unknown>)
            : {},
      })),
    });

    const answer =
      context.documents.length === 0
        ? "I couldn't find anything in the docs about that."
        : await completeFromPrompt(context.prompt);

    const avgScore =
      context.documents.length === 0
        ? 0
        : context.documents.reduce((s, d) => s + d.score, 0) /
          context.documents.length;

    res.json({
      answer,
      citations: context.citations.map((c) => ({
        source_url: c.url ?? (c.source.startsWith("http") ? c.source : `file://${c.source}`),
        title: c.title,
        snippet: c.snippet,
      })),
      groundingScore: Math.round(avgScore * 100),
      context,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "ask failed";
    res.status(500).json({ error: message });
  }
});

app.listen(8080, () => {
  console.log("Backend running on http://localhost:8080");
});
