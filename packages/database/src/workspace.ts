import { prisma } from "./client.js";

const CONNECTOR_TYPES = [
  "qdrant",
  "mem0",
  "groq",
  "slack",
  "notion",
  "github",
  "mcp",
] as const;

export type ConnectorType = (typeof CONNECTOR_TYPES)[number];

/** Ensure the user has a default workspace + connector rows. */
export async function ensureDefaultWorkspace(userId: string, userName?: string) {
  const existing = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: {
        include: {
          connectors: true,
          apiKeys: { where: { revokedAt: null } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (existing?.workspace) {
    const have = new Set(existing.workspace.connectors.map((c) => c.type));
    const missing = CONNECTOR_TYPES.filter((type) => !have.has(type));

    // Hot path: workspace already complete — skip extra DB round-trips.
    if (missing.length === 0) {
      return existing.workspace;
    }

    await ensureConnectorRows(existing.workspace.id);
    return prisma.workspace.findUniqueOrThrow({
      where: { id: existing.workspace.id },
      include: { connectors: true, apiKeys: { where: { revokedAt: null } } },
    });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: userName ? `${userName}'s workspace` : "Default workspace",
      members: {
        create: { userId, role: "owner" },
      },
      connectors: {
        create: CONNECTOR_TYPES.map((type) => ({
          type,
          status: type === "qdrant" ? "connected" : "disconnected",
          config:
            type === "qdrant"
              ? {
                  url: process.env.QDRANT_URL ?? "http://localhost:6333",
                  collection: process.env.QDRANT_COLLECTION ?? "documents",
                }
              : {},
        })),
      },
    },
    include: { connectors: true, apiKeys: true },
  });

  return workspace;
}

async function ensureConnectorRows(workspaceId: string) {
  const existing = await prisma.connector.findMany({
    where: { workspaceId },
    select: { type: true },
  });
  const have = new Set(existing.map((c) => c.type));
  const missing = CONNECTOR_TYPES.filter((type) => !have.has(type));
  if (missing.length === 0) return;

  await prisma.connector.createMany({
    data: missing.map((type) => ({
      workspaceId,
      type,
      status: type === "qdrant" ? "connected" : "disconnected",
      config:
        type === "qdrant"
          ? {
              url: process.env.QDRANT_URL ?? "http://localhost:6333",
              collection: process.env.QDRANT_COLLECTION ?? "documents",
            }
          : {},
    })),
  });
}

export async function getWorkspaceForUser(userId: string, workspaceId?: string) {
  if (workspaceId) {
    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member) return null;
    return prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { connectors: true },
    });
  }
  return ensureDefaultWorkspace(userId);
}
