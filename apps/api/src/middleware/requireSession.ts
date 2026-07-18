import type { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { auth } from "../lib/auth.js";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

function sessionTokensFromCookie(
  cookieHeader: string | undefined,
): string[] {
  if (!cookieHeader) return [];
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const tokens: string[] = [];
  for (const name of [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
  ]) {
    const hit = parts.find((p) => p.startsWith(`${name}=`));
    if (!hit) continue;
    const value = decodeURIComponent(hit.slice(name.length + 1));
    if (!value) continue;
    tokens.push(value);
    const unsigned = value.split(".")[0];
    if (unsigned && unsigned !== value) tokens.push(unsigned);
  }
  return tokens;
}

export async function resolveSessionUser(
  req: Request,
): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });
    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      };
    }
  } catch {
    // fall through
  }

  const tokens = sessionTokensFromCookie(req.headers.cookie);
  for (const token of tokens) {
    const row = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (row && row.expiresAt >= new Date()) {
      return {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
      };
    }
  }
  return null;
}

export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = await resolveSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized — sign in to continue" });
    return;
  }
  req.user = user;
  next();
}
