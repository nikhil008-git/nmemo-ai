import { createHash, randomBytes } from "crypto";

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey(): { raw: string; prefix: string; keyHash: string } {
  const secret = randomBytes(24).toString("hex");
  const prefix = `ce_live_${secret.slice(0, 8)}`;
  const raw = `${prefix}_${secret.slice(8)}`;
  return { raw, prefix, keyHash: hashApiKey(raw) };
}
