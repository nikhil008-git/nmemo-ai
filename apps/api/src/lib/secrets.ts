import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "enc:v1:";
const SECRET_KEYS = ["accessToken", "apiKey", "refreshToken"] as const;

function encryptionKey(): Buffer {
  const raw =
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.BETTER_AUTH_SECRET ||
    "dev-token-encryption-key";
  // Always derive 32 bytes so any secret length works.
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plain: string): string {
  if (!plain || plain.startsWith(PREFIX)) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptSecret(value: string): string {
  if (!value || !value.startsWith(PREFIX)) return value;
  const body = value.slice(PREFIX.length);
  const [ivB64, tagB64, dataB64] = body.split(".");
  if (!ivB64 || !tagB64 || !dataB64) return value;
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Encrypt known secret fields before writing connector config to DB. */
export function encryptConnectorConfig(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...config };
  for (const key of SECRET_KEYS) {
    const v = out[key];
    if (typeof v === "string" && v && !v.startsWith(PREFIX)) {
      out[key] = encryptSecret(v);
    }
  }
  return out;
}

/** Decrypt secret fields for retrievers / mem0 calls. */
export function decryptConnectorConfig(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...config };
  for (const key of SECRET_KEYS) {
    const v = out[key];
    if (typeof v === "string" && v) {
      try {
        out[key] = decryptSecret(v);
      } catch {
        // leave as-is if key rotated / corrupt
      }
    }
  }
  return out;
}

export function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== "production") return;
  const missing: string[] = [];
  if (!process.env.BETTER_AUTH_SECRET) missing.push("BETTER_AUTH_SECRET");
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.TOKEN_ENCRYPTION_KEY && !process.env.BETTER_AUTH_SECRET) {
    missing.push("TOKEN_ENCRYPTION_KEY");
  }
  if (missing.length) {
    throw new Error(
      `Missing required production env: ${missing.join(", ")}`,
    );
  }
}
