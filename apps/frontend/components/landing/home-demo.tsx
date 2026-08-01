import {
  WorkspacePageHeader,
  WorkspaceSidebar,
} from "@/components/app/app-shell";
import { HomeDashboard } from "@/components/app/home-dashboard";
import { WallpaperPlate } from "@/components/landing/wallpaper";

const demoSources = [
  { type: "documents" },
  { type: "slack" },
  { type: "notion" },
  { type: "github" },
] as const;

export function HomeDemo() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] shadow-[var(--bezel-shadow)] sm:aspect-[5/2]">
      <WallpaperPlate>
        <div className="product-shell absolute left-1/2 top-1/2 h-[90%] w-[92%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-surface text-foreground shadow-[var(--panel-shadow)] sm:w-[62%]">
          <div className="landing-home-demo-canvas flex">
            <WorkspaceSidebar
              userName="Nikhil Rajpurohit"
              pathname="/home"
              connectedTypes={demoSources.map((source) => source.type)}
              connectedCount={demoSources.length}
              demo
            />

            <div className="flex min-w-0 flex-1 flex-col bg-surface">
              <WorkspacePageHeader title="Dashboard" />
              <div className="relative min-h-0 flex-1 overflow-hidden bg-transparent p-4 sm:p-6">
                <HomeDashboard
                  userName="Nikhil Rajpurohit"
                  connectedSources={demoSources}
                />
              </div>
            </div>
          </div>
        </div>
      </WallpaperPlate>
    </div>
  );
}
