import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";


export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await auth.api.getSession({
    headers: req.headers as HeadersInit,
  });

  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  (req as any).user = session.user;
  next();
}