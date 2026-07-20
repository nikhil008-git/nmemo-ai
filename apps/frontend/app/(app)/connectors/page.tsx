import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { ConnectorsClient } from "./connectors-client";

function ConnectorsFallback() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 py-6">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="mx-auto h-4 w-64" />
        <Skeleton className="mx-auto h-4 w-36" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}

export default function ConnectorsPage() {
  return (
    <Suspense fallback={<ConnectorsFallback />}>
      <ConnectorsClient />
    </Suspense>
  );
}
