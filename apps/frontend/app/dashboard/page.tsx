"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect } from "react";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/sign-in");
        }
    }, [isPending, session, router]);

    if (isPending) return <p className="text-center mt-8 text-black font-light text-neutral-500">Loading...</p>;
    if (!session?.user) return <p className="text-center mt-8 text-black font-light text-neutral-500">Redirecting...</p>;

    const { user } = session;

    return (
        <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-black">
            <p className="text-xs font-light tracking-widest uppercase text-neutral-400">Dashboard</p>
            <p className="text-2xl font-bold">Welcome, {user.name || "User"}!</p>
            <p className="text-sm font-light text-neutral-500">{user.email}</p>
            <button
                onClick={() => signOut()}
                className="w-full bg-black text-white font-semibold rounded-md px-4 py-2 hover:bg-neutral-800">
                Sign Out
            </button>

        </main >
    );
}