import "dotenv/config";
import express from "express";
import cors from "cors";
import { requireSession } from "./middleware/requireSession.js";
import { ingestPdf } from "./rag/ingest.js";
import { ask } from "./rag/llm.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/protected", requireSession, (_req, res) => {
  res.json({ message: "Protected route" });
});

// body: { filePath, title?, siteId? }
app.post("/ingest", async (req, res) => {
  try {
    const { filePath, title, siteId } = req.body as {
      filePath?: string;
      title?: string;
      siteId?: string;
    };
    if (!filePath) {
      res.status(400).json({ error: "filePath required" });
      return;
    }
    const result = await ingestPdf(filePath, {
      source: filePath,
      title: title ?? filePath,
      ...(siteId ? { siteId } : {}),
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ingest failed" });
  }
});

// body: { question, siteId? }
app.post("/ask", async (req, res) => {
  try {
    const { question, siteId } = req.body as {
      question?: string;
      siteId?: string;
    };
    if (!question) {
      res.status(400).json({ error: "question required" });
      return;
    }
    const result = await ask(question, siteId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ask failed" });
  }
});

app.listen(8080, () => {
  console.log("Backend running on http://localhost:8080");
});