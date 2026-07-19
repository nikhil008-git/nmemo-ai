import { Router } from "express";
import { ensureDefaultWorkspace, prisma } from "@repo/db";
import { requireSession } from "../middleware/requireSession.js";
import { generateApiKey } from "../lib/hash.js";
import {
  providerConfigured,
  publicConnectorConfig,
  type OAuthProvider,
} from "../lib/oauth.js";
import { validateConnectorToken } from "../lib/validate-connector-token.js";
import { encryptConnectorConfig } from "../lib/secrets.js";

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
  return {
    id: c.id,
    type: c.type,
    status: c.status,
    config: publicConnectorConfig(c.type, c.config),
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
    oauthConfigured: OAUTH_TYPES.has(c.type as OAuthProvider)
      ? providerConfigured(c.type as OAuthProvider)
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

    // mem0 / groq: save API key (encrypted at rest)
    if (
      (type === "mem0" || type === "groq") &&
      config?.apiKey &&
      typeof config.apiKey === "string"
    ) {
      const updated = await prisma.connector.update({
        where: { workspaceId_type: { workspaceId: workspace.id, type } },
        data: {
          status: "connected",
          config: encryptConnectorConfig({
            apiKey: config.apiKey,
            provider: type,
          }) as object,
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

    // GitHub / Slack / Notion: paste token (live) or disconnect; OAuth via /oauth/.../start
    if (OAUTH_TYPES.has(type as OAuthProvider)) {
      if (status === "disconnected") {
        const updated = await prisma.connector.update({
          where: { workspaceId_type: { workspaceId: workspace.id, type } },
          data: { status: "disconnected", config: {} },
        });
        res.json({ connector: mapConnector(updated) });
        return;
      }

      const rawToken =
        typeof config?.accessToken === "string"
          ? config.accessToken
          : typeof config?.apiKey === "string"
            ? config.apiKey
            : null;
      if (rawToken) {
        try {
          const verified = await validateConnectorToken(
            type as OAuthProvider,
            rawToken,
          );
          const updated = await prisma.connector.update({
            where: { workspaceId_type: { workspaceId: workspace.id, type } },
            data: {
              status: "connected",
              config: encryptConnectorConfig({
                ...verified,
                authMode: "token",
              }) as object,
            },
          });
          res.json({ connector: mapConnector(updated) });
          return;
        } catch (err) {
          res.status(400).json({
            error: err instanceof Error ? err.message : "Token rejected",
          });
          return;
        }
      }

      res.status(400).json({
        error: `Paste an accessToken for ${type}, or connect via OAuth when platform apps are configured.`,
      });
      return;
    }

    if ((type === "mem0" || type === "groq") && status === "disconnected") {
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

/** Simple usage meter for the current workspace (last 30 days). */
workspaceRouter.get("/usage", async (req, res) => {
  try {
    const workspace = await ensureDefaultWorkspace(req.user!.id, req.user!.name);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = await prisma.usageEvent.findMany({
      where: { workspaceId: workspace.id, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    const totals = events.reduce(
      (acc, e) => {
        acc.calls += 1;
        acc.tokens += e.tokens;
        acc.byRoute[e.route] = (acc.byRoute[e.route] ?? 0) + 1;
        return acc;
      },
      { calls: 0, tokens: 0, byRoute: {} as Record<string, number> },
    );
    res.json({ since, totals, recent: events.slice(0, 50) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load usage" });
  }
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
