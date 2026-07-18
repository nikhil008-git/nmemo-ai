import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { hashApiKey } from "../lib/hash.js";

export type ApiKeyAuth = {
  workspaceId: string;
  apiKeyId: string;
};

declare global {
  namespace Express {
    interface Request {
      apiKeyAuth?: ApiKeyAuth;
    }
  }
}

export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Bearer API key" });
    return;
  }
  const raw = header.slice("Bearer ".length).trim();
  if (!raw) {
    res.status(401).json({ error: "Missing Bearer API key" });
    return;
  }

  const keyHash = hashApiKey(raw);
  const key = await prisma.apiKey.findFirst({
    where: { keyHash, revokedAt: null },
  });
  if (!key) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  req.apiKeyAuth = { workspaceId: key.workspaceId, apiKeyId: key.id };
  next();
}
