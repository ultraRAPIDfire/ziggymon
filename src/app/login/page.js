"use client";
import { signIn } from "next-auth/react";
import { Cpu, Terminal, ArrowRight } from "lucide-react";

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
              {/* Native GitHub SVG Path instead of library component */}
              <svg className="h-[18px] w-[18px] text-zinc-900 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
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
            <svg className="h-3.5 w-3.5 text-zinc-500 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
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