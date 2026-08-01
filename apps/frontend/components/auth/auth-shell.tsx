import Link from "next/link";

import {
  WorkspacePageHeader,
  WorkspaceSidebar,
} from "@/components/app/app-shell";
import { HomeDashboard } from "@/components/app/home-dashboard";
import { Logo } from "@/components/logo";

const previewSources = [
  { type: "documents" },
  { type: "slack" },
  { type: "notion" },
  { type: "github" },
] as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen bg-background">
      {/* Form column */}
      <div className="relative flex w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[15px] font-medium tracking-tight text-ink"
        >
          <Logo size={20} priority className="rounded-[5px]" />
          nmemo
        </Link>

        <div className="flex flex-1 flex-col justify-center py-12">
          <div className="mx-auto w-full max-w-[360px]">{children}</div>
        </div>

        <p className="text-center text-[13px] text-ink/30 lg:text-left">
          © {new Date().getFullYear()} nmemo
        </p>
      </div>

      {/* Product half: the real workspace, oversized and clipped like a crop. */}
      <div className="auth-light-preview relative hidden min-h-screen w-1/2 overflow-hidden border-l border-border bg-[#f4f5f6] lg:block">
        <div className="pointer-events-none absolute left-[12%] top-[17%] h-[89%] w-[132%] select-none overflow-hidden rounded-[18px] border border-ink/10 bg-surface shadow-[0_28px_80px_-30px_rgba(15,23,42,0.3)]">
          <div className="product-shell auth-light-preview flex h-full w-full bg-surface text-foreground">
            <WorkspaceSidebar
              userName="Nikhil Rajpurohit"
              pathname="/home"
              connectedTypes={previewSources.map((source) => source.type)}
              connectedCount={previewSources.length}
              demo
            />

            <div className="flex min-w-0 flex-1 flex-col bg-surface">
              <WorkspacePageHeader title="Dashboard" />
              <div className="relative min-h-0 flex-1 overflow-hidden bg-transparent p-6">
                <HomeDashboard
                  userName="Nikhil Rajpurohit"
                  connectedSources={previewSources}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f4f5f6] via-[#f4f5f6]/85 to-transparent" />
      </div>
    </main>
  );
}
