"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            Ziggymon AI
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            The dedicated programming intelligence suite.
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => signIn("github", { callbackUrl: "/chat" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-zinc-50 px-4 py-3 font-medium text-zinc-950 transition-all hover:bg-zinc-200"
          >
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}