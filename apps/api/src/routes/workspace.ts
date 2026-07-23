import { Router } from "express";
import { prisma } from "@repo/db";
import { requireSession } from "../middleware/requireSession.js";
import { generateApiKey } from "../lib/hash.js";
import {
  providerConfigured,
  publicConnectorConfig,
  type OAuthProvider,
} from "../lib/oauth.js";
import { validateConnectorToken } from "../lib/validate-connector-token.js";
import { encryptConnectorConfig } from "../lib/secrets.js";

const workspaceInclude = {
  connectors: true,
  apiKeys: { where: { revokedAt: null } },
} as const;

/** First workspace the user belongs to, or null. Never auto-creates. */
export async function getWorkspaceForUser(userId: string) {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      workspace: { include: workspaceInclude },
    },
  });
  return member?.workspace ?? null;
}

const OAUTH_TYPES = new Set<OAuthProvider>(["github", "slack", "notion"]);

function defaultConnectors() {
  return [
    {
      type: "qdrant",
      status: "connected",
      config: {
        url: process.env.QDRANT_URL ?? "http://localhost:6333",
        collection: process.env.QDRANT_COLLECTION ?? "documents",
      },
    },
    { type: "mem0", status: "disconnected", config: {} },
    { type: "groq", status: "disconnected", config: {} },
    { type: "slack", status: "disconnected", config: {} },
    { type: "notion", status: "disconnected", config: {} },
    { type: "github", status: "disconnected", config: {} },
    { type: "mcp", status: "disconnected", config: {} },
  ];
}

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

function mapWorkspace(workspace: {
  id: string;
  name: string;
  domain?: string | null;
  industry?: string | null;
  companySize?: string | null;
  maxMembers?: number;
  connectors: {
    id: string;
    type: string;
    status: string;
    config: unknown;
    updatedAt: Date;
    createdAt: Date;
  }[];
  apiKeys: {
    id: string;
    name: string;
    prefix: string;
    createdAt: Date;
    revokedAt: Date | null;
  }[];
}) {
  return {
    id: workspace.id,
    name: workspace.name,
    domain: workspace.domain ?? null,
    industry: workspace.industry ?? null,
    companySize: workspace.companySize ?? null,
    maxMembers: workspace.maxMembers ?? 5,
    connectors: workspace.connectors.map(mapConnector),
    apiKeys: workspace.apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      createdAt: k.createdAt,
      revokedAt: k.revokedAt,
    })),
  };
}

export const workspaceRouter = Router();

workspaceRouter.use(requireSession);

/** Create a workspace — user fills company details after sign-in. */
workspaceRouter.post("/", async (req, res) => {
  try {
    const name =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      res.status(400).json({ error: "Workspace name required" });
      return;
    }
    if (name.length > 80) {
      res.status(400).json({ error: "Workspace name is too long" });
      return;
    }

    const domainRaw =
      typeof req.body?.domain === "string" ? req.body.domain.trim() : "";
    const domain = domainRaw
      ? domainRaw
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .split("/")[0]
          ?.toLowerCase() || null
      : null;

    const industry =
      typeof req.body?.industry === "string" && req.body.industry.trim()
        ? req.body.industry.trim()
        : null;
    const companySize =
      typeof req.body?.companySize === "string" && req.body.companySize.trim()
        ? req.body.companySize.trim()
        : null;

    const existing = await getWorkspaceForUser(req.user!.id);
    if (existing) {
      res.status(409).json({
        error: "You already have a workspace",
        workspace: mapWorkspace(existing),
      });
      return;
    }

    if (domain) {
      const taken = await prisma.workspace.findFirst({ where: { domain } });
      if (taken) {
        res.status(409).json({ error: "That domain is already in use" });
        return;
      }
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        ...(domain ? { domain } : {}),
        ...(industry ? { industry } : {}),
        ...(companySize ? { companySize } : {}),
        members: {
          create: {
            userId: req.user!.id,
            role: "owner",
          },
        },
        connectors: { create: defaultConnectors() },
      },
      include: workspaceInclude,
    });

    res.status(201).json(mapWorkspace(workspace));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

workspaceRouter.get("/current", async (req, res) => {
  try {
    const workspace = await getWorkspaceForUser(req.user!.id);
    if (!workspace) {
      res.status(404).json({ error: "No workspace" });
      return;
    }
    res.json(mapWorkspace(workspace));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load workspace" });
  }
});

/** Update company / workspace details. */
workspaceRouter.patch("/current", async (req, res) => {
  try {
    const workspace = await getWorkspaceForUser(req.user!.id);
    if (!workspace) {
      res.status(404).json({ error: "No workspace" });
      return;
    }

    const name =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      res.status(400).json({ error: "Workspace name required" });
      return;
    }
    if (name.length > 80) {
      res.status(400).json({ error: "Workspace name is too long" });
      return;
    }

    const domainRaw =
      typeof req.body?.domain === "string" ? req.body.domain.trim() : "";
    const domain = domainRaw
      ? domainRaw
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .split("/")[0]
          ?.toLowerCase() || null
      : null;

    const industry =
      typeof req.body?.industry === "string" && req.body.industry.trim()
        ? req.body.industry.trim()
        : null;
    const companySize =
      typeof req.body?.companySize === "string" && req.body.companySize.trim()
        ? req.body.companySize.trim()
        : null;

    if (domain && domain !== workspace.domain) {
      const taken = await prisma.workspace.findFirst({
        where: { domain, NOT: { id: workspace.id } },
      });
      if (taken) {
        res.status(409).json({ error: "That domain is already in use" });
        return;
      }
    }

    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        name,
        domain,
        industry,
        companySize,
      },
      include: workspaceInclude,
    });

    res.json(mapWorkspace(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

workspaceRouter.get("/connectors", async (req, res) => {
  const workspace = await getWorkspaceForUser(req.user!.id);
  if (!workspace) {
    res.status(404).json({ error: "No workspace" });
    return;
  }
  res.json({ connectors: workspace.connectors.map(mapConnector) });
});

workspaceRouter.patch("/connectors/:type", async (req, res) => {
  try {
    const workspace = await getWorkspaceForUser(req.user!.id);
    if (!workspace) {
      res.status(404).json({ error: "No workspace" });
      return;
    }
    const type = req.params.type;
    const { status, config } = req.body as {
      status?: string;
      config?: Record<string, unknown>;
    };

    const existing = await prisma.connector.findUnique({
      where: 
      { 
        workspaceId_type: 
        { 
          workspaceId: workspace.id
          , type } },
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
  const workspace = await getWorkspaceForUser(req.user!.id);
  if (!workspace) {
    res.status(404).json({ error: "No workspace" });
    return;
  }
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
    const workspace = await getWorkspaceForUser(req.user!.id);
    if (!workspace) {
      res.status(404).json({ error: "No workspace" });
      return;
    }
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
    const workspace = await getWorkspaceForUser(req.user!.id);
    if (!workspace) {
      res.status(404).json({ error: "No workspace" });
      return;
    }
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
    const workspace = await getWorkspaceForUser(req.user!.id);
    if (!workspace) {
      res.status(404).json({ error: "No workspace" });
      return;
    }
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
