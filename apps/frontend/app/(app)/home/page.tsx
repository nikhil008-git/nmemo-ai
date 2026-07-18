"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getConnectors, type Connector } from "@/lib/api";
import { CtaButton } from "@/components/ui/cta-button";
import { useSession } from "@/lib/auth-client";

const steps = [
  {
    href: "/connectors",
    label: "Link your tools",
    description: "Connect the apps your team already uses.",
  },
  {
    href: "/sources",
    label: "Add your files",
    description: "Upload documents so answers can pull from them.",
  },
  {
    href: "/playground",
    label: "Try it out",
    description: "Ask a question and see where the answer came from.",
  },
  {
    href: "/keys",
    label: "Get an access key",
    description: "Use the same setup in your own product.",
  },
] as const;

export default function HomePage() {
  const { data: session } = useSession();
  const [connectors, setConnectors] = useState<Connector[]>([]);

  useEffect(() => {
    if (!session?.user) return;
    void getConnectors()
      .then((r) => setConnectors(r.connectors))
      .catch(() => setConnectors([]));
  }, [session?.user]);

  const connected = connectors.filter((c) => c.status === "connected");
  const user = session?.user;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center space-y-6 py-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {user?.name ? `Hey, ${user.name}` : "Your workspace"}
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Link your tools, try a question, then take it into your product.
        </p>
        <p className="text-sm font-medium text-muted-foreground">
          <span className="text-foreground">{connected.length}</span> source
          {connected.length === 1 ? "" : "s"} connected
          {connected.length > 0
            ? ` · ${connected.map((c) => c.type).join(", ")}`
            : ""}
        </p>
      </div>

      <CtaButton href="/playground" fullWidth>
        Try it out
      </CtaButton>

      <ul className="space-y-1.5 text-left">
        {steps.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex gap-3 rounded-sm border border-border px-3 py-2.5 transition-colors hover:bg-neutral-50"
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{step.label}</span>
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
