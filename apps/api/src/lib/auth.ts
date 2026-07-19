import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";

/** Session resolution only — sign-in lives on the frontend auth server. */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});
