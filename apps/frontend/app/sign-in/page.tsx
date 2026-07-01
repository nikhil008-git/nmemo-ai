"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        const res = await signIn.email({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        });

        if (res.error) {
            setError(res.error.message || "Something went wrong.");
        } else {
            router.push("/dashboard");
        }
    }

    return (
        <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-black">
            <p className="text-xs font-light tracking-widest uppercase text-neutral-400">Account</p>
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-sm font-light text-neutral-500">Welcome back — enter your details below.</p>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-black font-normal placeholder:font-light placeholder:text-neutral-400"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    className="w-full rounded-md bg-white border border-neutral-300 px-3 py-2 text-black font-normal placeholder:font-light placeholder:text-neutral-400"
                />
                <button
                    type="submit"
                    className="w-full bg-black text-white font-semibold rounded-md px-4 py-2 hover:bg-neutral-800"
                >
                    Sign In
                </button>
            </form>{" "}
        </main>
    );
}