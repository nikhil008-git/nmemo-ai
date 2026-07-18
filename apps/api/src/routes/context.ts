import { Router, type Request, type Response, type NextFunction } from "express";
import { getContext, getContextFast } from "@contextengine/core";
import { prisma, ensureDefaultWorkspace } from "@repo/db";
import { requireApiKey } from "../middleware/requireApiKey.js";
import { requireSession } from "../middleware/requireSession.js";

export const contextRouter = Router();

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

    const fn = fast ? getContextFast : getContext;
    const result = await fn({
      query: body.query.trim(),
      userId,
      workspaceId: workspace.id,
      ...(body.conversationId ? { conversationId: body.conversationId } : {}),
      ...(body.agent ? { agent: body.agent } : {}),
      connectors: workspace.connectors.map((c) => ({
        type: c.type,
        status: c.status,
        config:
          c.config && typeof c.config === "object"
            ? (c.config as Record<string, unknown>)
            : {},
      })),
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
