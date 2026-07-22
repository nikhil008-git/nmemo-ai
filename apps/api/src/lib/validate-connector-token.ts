import type { OAuthProvider } from "./oauth.js";

export type ValidatedToken = {
  accessToken: string;
  authMode: "token";
  provider: OAuthProvider;
  accountLogin?: string;
  teamName?: string;
  workspaceName?: string;
};

/** Verify a pasted token can talk to the provider before saving. */
export async function validateConnectorToken(
  provider: OAuthProvider,
  accessToken: string,
): Promise<ValidatedToken> {
  const token = accessToken.trim();
  if (!token || token.length < 10) {
    throw new Error("Paste a valid access token.");
  }
  if (token === "dev-mock-token") {
    throw new Error("Mock tokens are not allowed. Paste a real token.");
  }

  if (provider === "github") {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "context-engine",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      throw new Error(
        "GitHub token rejected. Use a classic PAT with repo scope (or fine-grained Issues read).",
      );
    }
    const user = (await res.json()) as { login?: string };
    const out: ValidatedToken = {
      accessToken: token,
      authMode: "token",
      provider: "github",
    };
    if (user.login) out.accountLogin = user.login;
    return out;
  }

  if (provider === "slack") {
    if (token.startsWith("xoxb-")) {
      throw new Error(
        "Bot tokens (xoxb-) cannot search messages. Paste a user token (xoxp-) with search:read, or use Connect.",
      );
    }
    const res = await fetch("https://slack.com/api/auth.test", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      team?: string;
      user?: string;
    };
    if (!data.ok) {
      throw new Error(
        data.error === "invalid_auth"
          ? "Slack token rejected. Use a user token (xoxp-) with search:read."
          : data.error || "Slack token rejected.",
      );
    }
    const out: ValidatedToken = {
      accessToken: token,
      authMode: "token",
      provider: "slack",
    };
    if (data.team) out.teamName = data.team;
    if (data.user) out.accountLogin = data.user;
    return out;
  }

  // Notion — internal integration secret or OAuth access token
  const res = await fetch("https://api.notion.com/v1/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
    },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) {
    throw new Error(
      "Notion token rejected. Create an internal integration at notion.so/my-integrations and share pages with it.",
    );
  }
  const me = (await res.json()) as {
    name?: string;
    bot?: { owner?: { workspace?: boolean; user?: { name?: string } } };
  };
  return {
    accessToken: token,
    authMode: "token",
    provider: "notion",
    workspaceName: me.name || me.bot?.owner?.user?.name || "Notion",
  };
}
