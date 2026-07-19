import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { getContext, writeMemoryAsync } from "@contextengine/core";
import {
  deleteDocument,
  ingestPdf,
  listDocuments,
} from "@contextengine/rag-retriever";
import { ensureDefaultWorkspace } from "@repo/db";
import { requireSession } from "./middleware/requireSession.js";
import { completeFromPrompt } from "./lib/llm.js";
import { pipeAskStream } from "./lib/stream-ask.js";
import { contextRouter } from "./routes/context.js";
import { oauthRouter } from "./routes/oauth.js";
import { workspaceRouter } from "./routes/workspace.js";
import {
  apiLimiter,
  contextLimiter,
  ingestLimiter,
} from "./middleware/rateLimit.js";
import { assertProductionSecrets } from "./lib/secrets.js";
import { connectorsForContext } from "./lib/refresh-token.js";
import { recordUsageAsync } from "./lib/usage.js";

function lastUserText(messages: unknown): string | null {
  if (!Array.isArray(messages)) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i] as {
      role?: string;
      content?: string;
      parts?: { type?: string; text?: string }[];
    };
    if (m?.role !== "user") continue;
    if (typeof m.content === "string" && m.content.trim()) {
      return m.content.trim();
    }
    const text = (m.parts ?? [])
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text!)
      .join("");
    if (text.trim()) return text.trim();
  }
  return null;
}

assertProductionSecrets();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const port = Number(process.env.PORT ?? 8080);

const corsOrigins = (process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "development",
  });
});

app.use(apiLimiter);

app.get("/protected", requireSession, (_req, res) => {
  res.json({ message: "Protected route" });
});

app.use("/context", contextRouter);
app.use("/workspaces", workspaceRouter);
app.use("/oauth", oauthRouter);

app.get("/documents", requireSession, async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(
      req.user!.id,
      req.user!.name,
    );
    const documents = await listDocuments(workspace.id);
    res.json({ documents });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "list documents failed";
    res.status(500).json({ error: message });
  }
});

app.delete("/documents", requireSession, async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(
      req.user!.id,
      req.user!.name,
    );
    const source =
      typeof req.query.source === "string"
        ? req.query.source
        : typeof req.body?.source === "string"
          ? req.body.source
          : "";
    if (!source.trim()) {
      res.status(400).json({ error: "source required" });
      return;
    }
    const result = await deleteDocument(workspace.id, source);
    res.json(result);
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "delete document failed";
    res.status(500).json({ error: message });
  }
});

app.post(
  "/ingest",
  requireSession,
  ingestLimiter,
  upload.single("file"),
  async (req, res) => {
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
        recordUsageAsync({
          workspaceId: workspace.id,
          route: "/ingest",
          userId: req.user!.id,
          tokens: result.chunkCount,
          sources: 1,
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
      recordUsageAsync({
        workspaceId: workspace.id,
        route: "/ingest",
        userId: req.user!.id,
        tokens: result.chunkCount,
        sources: 1,
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
  },
);

async function prepareAsk(req: express.Request, question: string) {
  const workspace = await ensureDefaultWorkspace(
    req.user!.id,
    req.user!.name,
  );

  const connectorRefs = await connectorsForContext(workspace.connectors);
  const connected = connectorRefs
    .filter((c) => c.status === "connected")
    .map((c) => c.type);

  const groq = connectorRefs.find(
    (c) => c.type === "groq" && c.status === "connected",
  );
  const groqKey =
    typeof groq?.config?.apiKey === "string" ? groq.config.apiKey : null;
  if (!groqKey) {
    return {
      error:
        "Add your Groq API key in the Playground to chat. Get a free key at https://console.groq.com/keys",
    } as const;
  }

  const context = await getContext({
    query: question,
    userId: req.user!.id,
    workspaceId: workspace.id,
    tokenBudget: Number(process.env.CONTEXT_TOKEN_BUDGET ?? 6000),
    connectors: connectorRefs.filter((c) => c.type !== "groq"),
  });

  const hasContext =
    context.documents.length > 0 || context.memories.length > 0;
  const discarded = context.diagnostics.discarded
    .map((d) => `${d.id}: ${d.reason}`)
    .join("; ");
  const sourcesLabel =
    connected.filter((t) => t !== "groq").join(", ") || "none";
  const fallbackText = discarded
    ? `No context retrieved from connected sources (${sourcesLabel}). Errors — ${discarded}`
    : `No context retrieved. Connected: ${sourcesLabel}. Upload docs and/or reconnect GitHub/Slack/Notion with a live token.`;

  return {
    workspace,
    connectorRefs,
    groqKey,
    context,
    hasContext,
    fallbackText,
  } as const;
}

app.post("/ask", requireSession, contextLimiter, async (req, res) => {
  try {
    const { question } = req.body as { question?: string };
    if (!question?.trim()) {
      res.status(400).json({ error: "question required" });
      return;
    }

    const prepared = await prepareAsk(req, question.trim());
    if ("error" in prepared) {
      res.status(400).json({ error: prepared.error });
      return;
    }

    const { workspace, connectorRefs, groqKey, context, hasContext, fallbackText } =
      prepared;

    const answer = hasContext
      ? await completeFromPrompt(context.prompt, groqKey, question.trim())
      : fallbackText;

    if (hasContext) {
      writeMemoryAsync({
        userId: req.user!.id,
        messages: [
          { role: "user", content: question.trim() },
          { role: "assistant", content: answer },
        ],
        connectors: connectorRefs,
      });
    }

    recordUsageAsync({
      workspaceId: workspace.id,
      route: "/ask",
      userId: req.user!.id,
      tokens: context.tokenUsage.total,
      sources: context.sources.filter((s) => s.queried).length,
    });

    const avgScore =
      context.documents.length === 0
        ? 0
        : context.documents.reduce((s, d) => s + d.score, 0) /
          context.documents.length;

    res.json({
      answer,
      citations: context.citations.map((c) => ({
        source_url:
          c.url ?? (c.source.startsWith("http") ? c.source : `file://${c.source}`),
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

/** Vercel AI SDK UI message stream for the playground (useChat). */
app.post("/ask/stream", requireSession, contextLimiter, async (req, res) => {
  try {
    const body = req.body as {
      messages?: unknown;
      question?: string;
    };
    const question =
      lastUserText(body.messages) ??
      (typeof body.question === "string" ? body.question.trim() : "");
    if (!question) {
      res.status(400).json({ error: "question required" });
      return;
    }

    const prepared = await prepareAsk(req, question);
    if ("error" in prepared) {
      res.status(400).json({ error: prepared.error });
      return;
    }

    const { workspace, connectorRefs, groqKey, context, hasContext, fallbackText } =
      prepared;

    recordUsageAsync({
      workspaceId: workspace.id,
      route: "/ask/stream",
      userId: req.user!.id,
      tokens: context.tokenUsage.total,
      sources: context.sources.filter((s) => s.queried).length,
    });

    pipeAskStream({
      res,
      question,
      groqKey,
      context,
      hasContext,
      fallbackText,
      onFinishText: (text) => {
        if (!hasContext || !text.trim()) return;
        writeMemoryAsync({
          userId: req.user!.id,
          messages: [
            { role: "user", content: question },
            { role: "assistant", content: text },
          ],
          connectors: connectorRefs,
        });
      },
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "ask stream failed";
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
