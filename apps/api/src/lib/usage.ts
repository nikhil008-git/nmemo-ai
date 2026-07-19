import { prisma } from "@repo/db";

export type RecordUsageInput = {
  workspaceId: string;
  route: string;
  apiKeyId?: string;
  userId?: string;
  tokens?: number;
  sources?: number;
};

/** Fire-and-forget usage event for billing / metering. */
export function recordUsageAsync(input: RecordUsageInput): void {
  void prisma.usageEvent
    .create({
      data: {
        workspaceId: input.workspaceId,
        route: input.route,
        ...(input.apiKeyId ? { apiKeyId: input.apiKeyId } : {}),
        ...(input.userId ? { userId: input.userId } : {}),
        tokens: input.tokens ?? 0,
        sources: input.sources ?? 0,
      },
    })
    .catch((err) => {
      console.error("[usage]", err instanceof Error ? err.message : err);
    });
}
