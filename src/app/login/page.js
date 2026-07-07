"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/down.gif')" }}
    >
      {/* Dark tint overlay to keep the login card readable and high-contrast */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px] z-0" />

      {/* Main Card Frame */}
      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-md z-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
            Z-engine
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            AI agent dedicated for smart programming support
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => signIn("github", { callbackUrl: "/chat" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-zinc-50 px-4 py-3 font-medium text-zinc-950 transition-all hover:bg-zinc-200 shadow-md"
          >
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>
    </div>
  );
}