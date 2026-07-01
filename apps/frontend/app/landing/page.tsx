"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 text-black">
      <div className="max-w-5xl space-y-3 text-center">
        <p className="text-sm font-light tracking-widest uppercase text-neutral-400">
          Welcome to
        </p>
        
        <h1 className="text-5xl font-black tracking-tight">nmemo</h1>
        <p className="mx-auto max-w-sm text-lg font-light text-neutral-500">
          Your knowledge workspace — sign in or create an account to get started.
        </p>
      </div>
    </main>
  );
}