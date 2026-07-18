import { Router } from "express";
import { ensureDefaultWorkspace, prisma } from "@repo/db";
import { requireSession } from "../middleware/requireSession.js";
import { generateApiKey } from "../lib/hash.js";
import {
  providerConfigured,
  publicConnectorConfig,
  type OAuthProvider,
} from "../lib/oauth.js";

export const workspaceRouter = Router();

workspaceRouter.use(requireSession);

const OAUTH_TYPES = new Set<OAuthProvider>(["github", "slack", "notion"]);

function mapConnector(c: {
  id: string;
  type: string;
  status: string;
  config: unknown;
  updatedAt: Date;
  createdAt: Date;
}) {
  const oauth =
    OAUTH_TYPES.has(c.type as OAuthProvider) &&
    providerConfigured(c.type as OAuthProvider);
  return {
    id: c.id,
    type: c.type,
    status: c.status,
    config: publicConnectorConfig(c.type, c.config),
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
    // In non-production, Connect always works (dev mock if keys missing).
    oauthConfigured: OAUTH_TYPES.has(c.type as OAuthProvider)
      ? oauth || process.env.NODE_ENV !== "production"
      : undefined,
  };
}

workspaceRouter.get("/current", async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(
      req.user!.id,
      req.user!.name,
    );
    res.json({
      id: workspace.id,
      name: workspace.name,
      connectors: workspace.connectors.map(mapConnector),
      apiKeys: workspace.apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        prefix: k.prefix,
        createdAt: k.createdAt,
        revokedAt: k.revokedAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load workspace" });
  }
});

workspaceRouter.get("/connectors", async (req, res) => {
  const workspace = await ensureDefaultWorkspace(req.user!.id, req.user!.name);
  res.json({ connectors: workspace.connectors.map(mapConnector) });
});

workspaceRouter.patch("/connectors/:type", async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(req.user!.id, req.user!.name);
    const type = req.params.type;
    const { status, config } = req.body as {
      status?: string;
      config?: Record<string, unknown>;
    };

    const existing = await prisma.connector.findUnique({
      where: { workspaceId_type: { workspaceId: workspace.id, type } },
    });
    if (!existing) {
      res.status(404).json({ error: "Connector not found" });
      return;
    }

    const prev =
      existing.config && typeof existing.config === "object"
        ? (existing.config as Record<string, unknown>)
        : {};

    // mem0: save API key
    if (type === "mem0" && config?.apiKey && typeof config.apiKey === "string") {
      const updated = await prisma.connector.update({
        where: { workspaceId_type: { workspaceId: workspace.id, type } },
        data: {
          status: "connected",
          config: { apiKey: config.apiKey, provider: "mem0" },
        },
      });
      res.json({ connector: mapConnector(updated) });
      return;
    }

    // qdrant: toggle / config
    if (type === "qdrant") {
      const data: { status?: string; config?: object } = {};
      if (status) data.status = status;
      if (config) data.config = { ...prev, ...config };
      const updated = await prisma.connector.update({
        where: { workspaceId_type: { workspaceId: workspace.id, type } },
        data,
      });
      res.json({ connector: mapConnector(updated) });
      return;
    }

    // OAuth sources: disconnect only via PATCH (connect via /oauth/.../start)
    if (["github", "slack", "notion"].includes(type)) {
      if (status === "disconnected") {
        const updated = await prisma.connector.update({
          where: { workspaceId_type: { workspaceId: workspace.id, type } },
          data: { status: "disconnected", config: {} },
        });
        res.json({ connector: mapConnector(updated) });
        return;
      }
      res.status(400).json({
        error: `Connect ${type} via OAuth: GET /oauth/${type}/start`,
      });
      return;
    }

    if (type === "mem0" && status === "disconnected") {
      const updated = await prisma.connector.update({
        where: { workspaceId_type: { workspaceId: workspace.id, type } },
        data: { status: "disconnected", config: {} },
      });
      res.json({ connector: mapConnector(updated) });
      return;
    }

    res.status(400).json({ error: `Unsupported update for ${type}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update connector" });
  }
});

workspaceRouter.get("/api-keys", async (req, res) => {
  const workspace = await ensureDefaultWorkspace(req.user!.id, req.user!.name);
  const keys = await prisma.apiKey.findMany({
    where: { workspaceId: workspace.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    apiKeys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      createdAt: k.createdAt,
    })),
  });
});

workspaceRouter.post("/api-keys", async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(req.user!.id, req.user!.name);
    const name =
      typeof req.body?.name === "string" && req.body.name.trim()
        ? req.body.name.trim()
        : "SDK key";
    const { raw, prefix, keyHash } = generateApiKey();
    const key = await prisma.apiKey.create({
      data: {
        workspaceId: workspace.id,
        name,
        prefix,
        keyHash,
      },
    });
    res.status(201).json({
      apiKey: {
        id: key.id,
        name: key.name,
        prefix: key.prefix,
        createdAt: key.createdAt,
        secret: raw,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create API key" });
  }
});

workspaceRouter.delete("/api-keys/:id", async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(req.user!.id, req.user!.name);
    const key = await prisma.apiKey.findFirst({
      where: { id: req.params.id, workspaceId: workspace.id },
    });
    if (!key) {
      res.status(404).json({ error: "API key not found" });
      return;
    }
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { revokedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to revoke API key" });
  }
});
