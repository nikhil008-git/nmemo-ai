import { Router } from "express";
import { prisma, ensureDefaultWorkspace } from "@repo/db";
import { resolveSessionUser } from "../middleware/requireSession.js";
import {
  authorizeUrl,
  exchangeCode,
  frontendUrl,
  providerConfigured,
  signState,
  verifyState,
  type OAuthProvider,
} from "../lib/oauth.js";

export const oauthRouter = Router();

const PROVIDERS = new Set<OAuthProvider>(["github", "slack", "notion"]);

oauthRouter.get("/:provider/start", async (req, res) => {
  try {
    const user = await resolveSessionUser(req);
    if (!user) {
      res.redirect(
        `${frontendUrl()}/sign-in?next=${encodeURIComponent("/connectors")}`,
      );
      return;
    }

    const provider = req.params.provider as OAuthProvider;
    if (!PROVIDERS.has(provider)) {
      res.redirect(`${frontendUrl()}/connectors?error=unknown_provider`);
      return;
    }
    const workspace = await ensureDefaultWorkspace(user.id, user.name);

    // Local/dev: no OAuth app keys yet → mark connected so the dashboard flow works.
    if (!providerConfigured(provider)) {
      if (process.env.NODE_ENV === "production") {
        res.redirect(
          `${frontendUrl()}/connectors?error=${encodeURIComponent(
            `${provider} is not available yet (platform OAuth not configured).`,
          )}`,
        );
        return;
      }
      await prisma.connector.update({
        where: {
          workspaceId_type: { workspaceId: workspace.id, type: provider },
        },
        data: {
          status: "connected",
          config: {
            provider,
            mock: true,
            accessToken: "dev-mock-token",
            ...(provider === "slack"
              ? { teamName: "Dev Slack" }
              : provider === "github"
                ? { accountLogin: "dev-user" }
                : { workspaceName: "Dev Notion" }),
          },
        },
      });
      res.redirect(
        `${frontendUrl()}/connectors?connected=${provider}&dev=1`,
      );
      return;
    }

    const state = signState({
      provider,
      workspaceId: workspace.id,
      userId: user.id,
    });
    res.redirect(authorizeUrl(provider, state));
  } catch (err) {
    console.error(err);
    res.redirect(
      `${frontendUrl()}/connectors?error=${encodeURIComponent("OAuth start failed")}`,
    );
  }
});

oauthRouter.get("/:provider/callback", async (req, res) => {
  const provider = req.params.provider as OAuthProvider;
  const front = frontendUrl();
  try {
    if (!PROVIDERS.has(provider)) {
      res.redirect(`${front}/connectors?error=unknown_provider`);
      return;
    }
    const { code, state, error } = req.query as {
      code?: string;
      state?: string;
      error?: string;
    };
    if (error) {
      res.redirect(
        `${front}/connectors?error=${encodeURIComponent(error)}`,
      );
      return;
    }
    if (!code || !state) {
      res.redirect(`${front}/connectors?error=missing_code`);
      return;
    }
    const parsed = verifyState(state);
    if (!parsed || parsed.provider !== provider) {
      res.redirect(`${front}/connectors?error=invalid_state`);
      return;
    }

    const config = await exchangeCode(provider, code);
    await prisma.connector.update({
      where: {
        workspaceId_type: {
          workspaceId: parsed.workspaceId,
          type: provider,
        },
      },
      data: {
        status: "connected",
        config: config as object,
      },
    });

    res.redirect(`${front}/connectors?connected=${provider}`);
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "oauth_failed";
    res.redirect(
      `${front}/connectors?error=${encodeURIComponent(message)}`,
    );
  }
});
