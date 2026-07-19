import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";
import { resolve } from "path";

// Monorepo: load root .env so Google / auth secrets aren't duplicated.
loadEnv({ path: resolve(__dirname, "../../.env") });
loadEnv({ path: resolve(__dirname, ".env") });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
