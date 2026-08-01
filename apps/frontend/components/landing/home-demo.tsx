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
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] shadow-[var(--bezel-shadow)] sm:rounded-[20px] md:aspect-[16/10] lg:aspect-[5/2]">
      <WallpaperPlate>
        <div className="product-shell absolute left-1/2 top-1/2 h-[90%] w-[94%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-surface text-foreground shadow-[var(--panel-shadow)] md:w-[82%] lg:w-[62%]">
          <div className="landing-home-demo-canvas flex">
            <WorkspaceSidebar
              userName="Nikhil Rajpurohit"
              pathname="/home"
              connectedTypes={demoSources.map((source) => source.type)}
              connectedCount={demoSources.length}
              demo
              forceDesktop
            />

            <div className="flex min-w-0 flex-1 flex-col bg-surface">
              <WorkspacePageHeader title="Dashboard" forceDesktop />
              <div className="relative min-h-0 flex-1 overflow-hidden bg-transparent p-4 sm:p-6">
                <HomeDashboard
                  userName="Nikhil Rajpurohit"
                  connectedSources={demoSources}
                  forceDesktop
                />
              </div>
            </div>
          </div>
        </div>
      </WallpaperPlate>
    </div>
  );
}
