import Link from "next/link";

import { ResumePacketPanel } from "@/components/landing/mockups";
import { WallpaperPlate } from "@/components/landing/wallpaper";
import { Logo } from "@/components/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen bg-background">
      {/* Form column */}
      <div className="relative flex w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[15px] font-medium tracking-tight text-white"
        >
          <Logo size={20} priority className="rounded-[5px]" />
          nmemo
        </Link>

        <div className="flex flex-1 flex-col justify-center py-12">
          <div className="mx-auto w-full max-w-[360px]">{children}</div>
        </div>

        <p className="text-center text-[13px] text-white/30 lg:text-left">
          © {new Date().getFullYear()} nmemo
        </p>
      </div>

      {/*
        Product half. The same wallpaper the landing mockups sit on, carrying the
        one artefact that explains nmemo at a glance: the resume packet.
      */}
      <div className="relative hidden min-h-screen w-1/2 border-l border-white/[0.06] lg:block">
        <WallpaperPlate>
          <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-10 xl:px-16">
            <ResumePacketPanel className="max-w-[26rem]" />
            <p className="max-w-[26rem] text-[13px] leading-relaxed text-white/40">
              Pick an unfinished task back up in any coding agent — decisions,
              dead ends, and the next step already verified against the
              repository.
            </p>
          </div>
        </WallpaperPlate>
      </div>
    </main>
  );
}
