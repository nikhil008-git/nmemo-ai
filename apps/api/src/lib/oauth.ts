import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export type OAuthProvider = "github" | "slack" | "notion";

export type OAuthState = {
  provider: OAuthProvider;
  workspaceId: string;
  userId: string;
  exp: number;
  nonce: string;
};

function secret() {
  return (
    process.env.BETTER_AUTH_SECRET ||
    process.env.OAUTH_STATE_SECRET ||
    "dev-oauth-state-secret"
  );
}

export function signState(payload: Omit<OAuthState, "nonce" | "exp">): string {
  const state: OAuthState = {
    ...payload,
    exp: Date.now() + 10 * 60 * 1000,
    nonce: randomBytes(8).toString("hex"),
  };
  const body = Buffer.from(JSON.stringify(state)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyState(raw: string): OAuthState | null {
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const state = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as OAuthState;
    if (state.exp < Date.now()) return null;
    return state;
  } catch {
    return null;
  }
}

export function frontendUrl() {
  return (process.env.FRONTEND_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function apiPublicUrl() {
  return (
    process.env.OAUTH_REDIRECT_BASE ||
    process.env.API_PUBLIC_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

export function providerConfigured(provider: OAuthProvider): boolean {
  if (provider === "github") {
    return Boolean(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
    );
  }
  if (provider === "slack") {
    return Boolean(
      process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET,
    );
  }
  return Boolean(
    process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET,
  );
}

export function authorizeUrl(provider: OAuthProvider, state: string): string {
  const redirectUri = `${apiPublicUrl()}/oauth/${provider}/callback`;
  if (provider === "github") {
    const u = new URL("https://github.com/login/oauth/authorize");
    u.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
    u.searchParams.set("redirect_uri", redirectUri);
    u.searchParams.set("scope", "repo read:user");
    u.searchParams.set("state", state);
    return u.toString();
  }
  if (provider === "slack") {
    const u = new URL("https://slack.com/oauth/v2/authorize");
    u.searchParams.set("client_id", process.env.SLACK_CLIENT_ID!);
    u.searchParams.set("redirect_uri", redirectUri);
    u.searchParams.set(
      "scope",
      "channels:history,channels:read,groups:history,search:read,users:read",
    );
    u.searchParams.set("state", state);
    return u.toString();
  }
  const u = new URL("https://api.notion.com/v1/oauth/authorize");
  u.searchParams.set("client_id", process.env.NOTION_CLIENT_ID!);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("owner", "user");
  u.searchParams.set("state", state);
  return u.toString();
}

export async function exchangeCode(
  provider: OAuthProvider,
  code: string,
): Promise<Record<string, unknown>> {
  const redirectUri = `${apiPublicUrl()}/oauth/${provider}/callback`;

  if (provider === "github") {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const data = (await res.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };
    if (!data.access_token) {
      throw new Error(data.error_description || data.error || "GitHub OAuth failed");
    }
    const me = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "context-engine",
      },
    });
    const user = (await me.json()) as { login?: string; id?: number };
    return {
      accessToken: data.access_token,
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      ...(typeof data.expires_in === "number"
        ? { expiresAt: Date.now() + data.expires_in * 1000 }
        : {}),
      accountLogin: user.login,
      accountId: user.id,
      provider: "github",
      authMode: "oauth",
    };
  }

  if (provider === "slack") {
    const body = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    });
    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      access_token?: string;
      team?: { id?: string; name?: string };
      authed_user?: { id?: string };
    };
    if (!data.ok || !data.access_token) {
      throw new Error(data.error || "Slack OAuth failed");
    }
    return {
      accessToken: data.access_token,
      teamId: data.team?.id,
      teamName: data.team?.name,
      authedUserId: data.authed_user?.id,
      provider: "slack",
    };
  }

  // Notion
  const basic = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = (await res.json()) as {
    access_token?: string;
    workspace_id?: string;
    workspace_name?: string;
    error?: string;
  };
  if (!data.access_token) {
    throw new Error(data.error || "Notion OAuth failed");
  }
  return {
    accessToken: data.access_token,
    workspaceId: data.workspace_id,
    workspaceName: data.workspace_name,
    provider: "notion",
  };
}

/** Strip secrets before sending connector config to the browser. */
export function publicConnectorConfig(
  type: string,
  config: unknown,
): Record<string, unknown> {
  const c =
    config && typeof config === "object"
      ? (config as Record<string, unknown>)
      : {};
  if (type === "qdrant") {
    return {
      url: c.url,
      collection: c.collection,
    };
  }
  if (type === "mem0" || type === "groq") {
    return {
      // True for plaintext or encrypted-at-rest secrets — never send the value.
      hasApiKey: typeof c.apiKey === "string" && c.apiKey.length > 0,
    };
  }
  return {
    hasToken: Boolean(c.accessToken),
    authMode: c.authMode ?? (c.mock ? "mock" : c.accessToken ? "oauth" : undefined),
    mock: Boolean(c.mock),
    accountLogin: c.accountLogin,
    teamName: c.teamName,
    workspaceName: c.workspaceName,
    provider: c.provider ?? type,
    expiresAt: c.expiresAt,
  };
}
