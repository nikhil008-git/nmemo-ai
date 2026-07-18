import { Suspense } from "react";

import { ConnectorsClient } from "./connectors-client";

export default function ConnectorsPage() {
  return (
    <Suspense
      fallback={
        <p className="mt-8 text-center text-muted-foreground">Loading…</p>
      }
    >
      <ConnectorsClient />
    </Suspense>
  );
}
