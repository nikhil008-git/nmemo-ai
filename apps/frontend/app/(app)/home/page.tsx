"use client";

import { HomeDashboard } from "@/components/app/home-dashboard";
import { useSession } from "@/lib/auth-client";
import { useConnectors } from "@/lib/connectors-store";

export function HomeView() {
  const { data: session } = useSession();
  const { connectors, loading } = useConnectors();

  const connected = connectors.filter(
    (c) => c.status === "connected" && c.type !== "qdrant" && c.type !== "groq",
  );
  return (
    <HomeDashboard
      userName={session?.user?.name}
      connectedSources={connected}
      loading={loading && connectors.length === 0}
    />
  );
}

export default function HomePage() {
  return <HomeView />;
}
