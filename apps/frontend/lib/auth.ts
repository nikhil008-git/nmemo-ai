import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name]?.trim() || fallback;
  if (!value) {
    throw new Error(
      `Missing required env: ${name}. Set it in Vercel Project Settings → Environment Variables, then redeploy.`,
    );
  }
  return value;
}

const betterAuthUrl =
  process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";

// Prisma adapter needs this at runtime (Vercel does not load repo-root .env).
requiredEnv("DATABASE_URL");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: requiredEnv("BETTER_AUTH_SECRET"),
  baseURL: betterAuthUrl,
  socialProviders: {
    google: {
      clientId: requiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      prompt: "select_account",
    },
  },
  trustedOrigins: [
    betterAuthUrl,
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080",
  ],
  // Default /sign-in* rule is 3/10s — too tight while debugging OAuth.
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/social": {
        window: 60,
        max: 20,
      },
    },
  },
});
