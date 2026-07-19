import { prisma } from "@repo/db";
import { decryptConnectorConfig, encryptConnectorConfig } from "./secrets.js";

type ConnectorRow = {
  id: string;
  type: string;
  status: string;
  config: unknown;
};

/**
 * Refresh OAuth access tokens when near expiry and a refresh_token exists.
 * GitHub/Slack/Notion paste-tokens and non-expiring OAuth tokens are no-ops.
 */
export async function ensureFreshConnector(
  connector: ConnectorRow,
): Promise<Record<string, unknown>> {
  const raw =
    connector.config && typeof connector.config === "object"
      ? (connector.config as Record<string, unknown>)
      : {};
  const config = decryptConnectorConfig(raw);

  const expiresAt =
    typeof config.expiresAt === "number"
      ? config.expiresAt
      : typeof config.expiresAt === "string"
        ? Date.parse(config.expiresAt)
        : null;
  const refreshToken =
    typeof config.refreshToken === "string" ? config.refreshToken : null;

  const needsRefresh =
    Boolean(refreshToken) &&
    expiresAt != null &&
    !Number.isNaN(expiresAt) &&
    expiresAt < Date.now() + 5 * 60 * 1000;

  if (!needsRefresh) return config;

  try {
    const refreshed = await refreshProviderToken(connector.type, refreshToken!);
    if (!refreshed) return config;

    const next = encryptConnectorConfig({
      ...config,
      ...refreshed,
    });
    await prisma.connector.update({
      where: { id: connector.id },
      data: { config: next as object },
    });
    return decryptConnectorConfig(next);
  } catch (err) {
    console.error("[token-refresh]", connector.type, err);
    return config;
  }
}

async function refreshProviderToken(
  type: string,
  refreshToken: string,
): Promise<Record<string, unknown> | null> {
  if (type === "github") {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
    };
    if (!data.access_token) return null;
    return {
      accessToken: data.access_token,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      ...(data.expires_in
        ? { expiresAt: Date.now() + data.expires_in * 1000 }
        : {}),
    };
  }

  if (type === "slack") {
    // Slack bot tokens typically do not expire; refresh endpoint is uncommon.
    return null;
  }

  if (type === "notion") {
    // Notion internal/public tokens generally do not expire via refresh.
    return null;
  }

  return null;
}

export async function connectorsForContext(
  connectors: ConnectorRow[],
): Promise<{ type: string; status: string; config: Record<string, unknown> }[]> {
  return Promise.all(
    connectors.map(async (c) => ({
      type: c.type,
      status: c.status,
      config: await ensureFreshConnector(c),
    })),
  );
}
