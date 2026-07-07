"use client";
import { signIn } from "next-auth/react";
import { Cpu, Github, Terminal, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 overflow-hidden bg-cover bg-center bg-no-repeat selection:bg-orange-500/20"
      style={{ backgroundImage: "url('/down.gif')" }}
    >
      {/* Heavy futuristic dark overlay vignette with slight backdrop blur */}
      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-950/85 to-zinc-900/70 backdrop-blur-[1px] z-0" />
      
      {/* Interactive scanning scanline grid mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

      {/* Main Console Frame Box */}
      <div className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/75 p-8 shadow-[0_0_50px_-12px_rgba(249,115,22,0.12)] backdrop-blur-xl z-10 transition-all duration-300 hover:border-zinc-700/60">
        
        {/* Top Accent Tech Bar */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        
        <div className="text-center space-y-3">
          {/* Animated Core Core Engine Badge */}
          <div className="mx-auto h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group">
            <Cpu size={24} className="text-orange-500 animate-pulse group-hover:scale-110 transition-transform duration-300" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-3xl font-mono font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400">
              Z-engine
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-orange-500/80 bg-orange-500/5 border border-orange-500/10 px-2 py-0.5 rounded-full w-fit mx-auto">
              <Terminal size={10} />
              <span>System Core v2.0.4</span>
            </div>
          </div>
          
          <p className="text-xs text-zinc-400 max-w-xs mx-auto font-sans leading-relaxed">
            Isolated cloud computing array optimized for localized predictive script compilation and rapid hardware orchestration debugging templates.
          </p>
        </div>

        {/* Action Controls Group */}
        <div className="mt-8 space-y-3">
          {/* Primary Call-to-Action authentication trigger */}
          <button
            onClick={() => signIn("github", { callbackUrl: "/chat" })}
            type="button"
            className="group flex w-full items-center justify-between rounded-xl bg-zinc-50 px-4 py-3.5 text-sm font-semibold font-sans text-zinc-950 transition-all duration-200 hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <Github size={18} className="text-zinc-900" />
              <span>Initialize Terminal Stack</span>
            </div>
            <ArrowRight size={16} className="text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-900" />
          </button>

          {/* Secondary External GitHub Reference Link Button */}
          <a
            href="https://github.com/ultraRAPIDfire"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs font-mono text-zinc-400 transition-all duration-200 hover:border-zinc-700/80 hover:text-zinc-200 hover:bg-zinc-950"
          >
            <Github size={14} className="text-zinc-500" />
            <span>Access ultraRAPIDfire Directory</span>
          </a>
        </div>

        {/* Console Footprint Hash Identifier Matrix */}
        <div className="mt-8 pt-4 border-t border-zinc-800/40 flex justify-between items-center text-[9px] font-mono text-zinc-600 tracking-tight">
          <span>HOST // SECURE_SHELL</span>
          <span>SYS_STATUS: OPERATIONAL</span>
        </div>
      </div>
    </div>
  );
}