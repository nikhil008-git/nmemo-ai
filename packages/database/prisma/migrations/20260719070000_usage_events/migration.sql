-- CreateTable
CREATE TABLE "usage_event" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "userId" TEXT,
    "route" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "sources" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usage_event_workspaceId_createdAt_idx" ON "usage_event"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "usage_event_route_createdAt_idx" ON "usage_event"("route", "createdAt");

-- AddForeignKey
ALTER TABLE "usage_event" ADD CONSTRAINT "usage_event_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
