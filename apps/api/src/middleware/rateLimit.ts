import rateLimit from "express-rate-limit";
import type { Request } from "express";

function clientKey(req: Request): string {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ") && auth.length > 20) {
    // Hash-ish: use prefix of key so we don't store full secret in memory maps.
    return `key:${auth.slice(7, 23)}`;
  }
  return `ip:${req.ip ?? "unknown"}`;
}

/** Expensive context / ask paths. */
export const contextLimiter = rateLimit({
  windowMs: 60_000,
  max: Number(process.env.RATE_LIMIT_CONTEXT_MAX ?? 60),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  validate: { keyGeneratorIpFallback: false },
  message: { error: "Too many requests. Slow down and retry shortly." },
});

/** Ingest / uploads. */
export const ingestLimiter = rateLimit({
  windowMs: 60_000,
  max: Number(process.env.RATE_LIMIT_INGEST_MAX ?? 20),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  validate: { keyGeneratorIpFallback: false },
  message: { error: "Too many uploads. Slow down and retry shortly." },
});

/** General API burst protection. */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: Number(process.env.RATE_LIMIT_API_MAX ?? 300),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientKey,
  validate: { keyGeneratorIpFallback: false },
  message: { error: "Too many requests." },
});
