import { Router, type Request, type Response, type NextFunction } from "express";
import {
  getContext,
  getContextFast,
  writeMemory,
  writeMemoryAsync,
} from "@contextengine/core";
import { prisma, ensureDefaultWorkspace } from "@repo/db";
import { requireApiKey } from "../middleware/requireApiKey.js";
import { requireSession } from "../middleware/requireSession.js";
import { contextLimiter } from "../middleware/rateLimit.js";
import { connectorsForContext } from "../lib/refresh-token.js";
import { recordUsageAsync } from "../lib/usage.js";

export const contextRouter = Router();

contextRouter.use(contextLimiter);

async function resolveWorkspace(opts: {
  userId?: string;
  workspaceId?: string;
  apiWorkspaceId?: string;
}) {
  if (opts.apiWorkspaceId) {
    return prisma.workspace.findUnique({
      where: { id: opts.apiWorkspaceId },
      include: { connectors: true },
    });
  }
  if (!opts.userId) return null;
  if (opts.workspaceId) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: opts.workspaceId,
          userId: opts.userId,
        },
      },
    });
    if (!member) return null;
    return prisma.workspace.findUnique({
      where: { id: opts.workspaceId },
      include: { connectors: true },
    });
  }
  return ensureDefaultWorkspace(opts.userId);
}

async function handleContext(req: Request, res: Response, fast: boolean) {
  try {
    const body = req.body as {
      query?: string;
      userId?: string;
      workspaceId?: string;
      conversationId?: string;
      agent?: string;
      /** After context is built, also persist this turn to mem0 (SDK convenience). */
      persistMemory?: {
        messages: { role?: string; content?: string }[];
      };
    };

    if (!body.query?.trim()) {
      res.status(400).json({ error: "query required" });
      return;
    }

    const apiWorkspaceId = req.apiKeyAuth?.workspaceId;
    const sessionUserId = req.user?.id;
    const userId = body.userId ?? sessionUserId ?? "api-key-user";

    const workspace = await resolveWorkspace({
      ...(sessionUserId ? { userId: sessionUserId } : {}),
      ...(body.workspaceId ? { workspaceId: body.workspaceId } : {}),
      ...(apiWorkspaceId ? { apiWorkspaceId } : {}),
    });

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    const connectorRefs = await connectorsForContext(workspace.connectors);
    const fn = fast ? getContextFast : getContext;
    const tokenBudget = Number(process.env.CONTEXT_TOKEN_BUDGET ?? 6000);
    const result = await fn({
      query: body.query.trim(),
      userId,
      workspaceId: workspace.id,
      ...(body.conversationId ? { conversationId: body.conversationId } : {}),
      ...(body.agent ? { agent: body.agent } : {}),
      tokenBudget,
      connectors: connectorRefs,
    });

    // Optional: persist a completed turn (user + assistant) in the same request.
    const persistMessages = (body.persistMemory?.messages ?? [])
      .filter(
        (m) =>
          m.content?.trim() &&
          (m.role === "user" || m.role === "assistant" || m.role === "system"),
      )
      .map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content!.trim(),
      }));
    if (persistMessages.length > 0) {
      writeMemoryAsync({
        userId,
        messages: persistMessages,
        connectors: connectorRefs,
      });
    }

    recordUsageAsync({
      workspaceId: workspace.id,
      route: fast ? "/context/fast" : "/context",
      ...(req.apiKeyAuth?.apiKeyId
        ? { apiKeyId: req.apiKeyAuth.apiKeyId }
        : {}),
      userId,
      tokens: result.tokenUsage.total,
      sources: result.sources.filter((s) => s.queried).length,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "context failed";
    res.status(500).json({ error: message });
  }
}

async function authContext(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return requireApiKey(req, res, next);
  }
  return requireSession(req, res, next);
}

contextRouter.post("/", authContext, (req, res) => {
  void handleContext(req, res, false);
});

contextRouter.post("/fast", authContext, (req, res) => {
  void handleContext(req, res, true);
});

/** Persist a chat turn into mem0 (when connected). */
contextRouter.post("/memory", authContext, async (req, res) => {
  try {
    const body = req.body as {
      userId?: string;
      workspaceId?: string;
      messages?: { role?: string; content?: string }[];
    };

    const messages = (body.messages ?? [])
      .filter(
        (m) =>
          m.content?.trim() &&
          (m.role === "user" || m.role === "assistant" || m.role === "system"),
      )
      .map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content!.trim(),
      }));

    if (messages.length === 0) {
      res.status(400).json({ error: "messages required" });
      return;
    }

    const apiWorkspaceId = req.apiKeyAuth?.workspaceId;
    const sessionUserId = req.user?.id;
    const userId = body.userId ?? sessionUserId ?? "api-key-user";

    const workspace = await resolveWorkspace({
      ...(sessionUserId ? { userId: sessionUserId } : {}),
      ...(body.workspaceId ? { workspaceId: body.workspaceId } : {}),
      ...(apiWorkspaceId ? { apiWorkspaceId } : {}),
    });

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    const connectorRefs = await connectorsForContext(workspace.connectors);
    const written = await writeMemory({
      userId,
      messages,
      connectors: connectorRefs,
    });

    recordUsageAsync({
      workspaceId: workspace.id,
      route: "/context/memory",
      ...(req.apiKeyAuth?.apiKeyId
        ? { apiKeyId: req.apiKeyAuth.apiKeyId }
        : {}),
      userId,
      tokens: 0,
      sources: written ? 1 : 0,
    });

    res.json({
      ok: true,
      written,
      skipped: !written ? "mem0 not connected" : undefined,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "memory write failed";
    res.status(500).json({ error: message });
  }
});
