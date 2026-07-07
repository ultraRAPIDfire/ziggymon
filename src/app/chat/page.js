"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, LogOut, Terminal, Cpu } from "lucide-react";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Protect client side path routing
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">Loading Environment...</div>;
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId: session?.user?.email || "anonymous_session",
        }),
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.response || "No response received." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Runtime Error: Failed to connect to core intelligence pipeline." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar Layout */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-xl">
            <Cpu size={24} />
            <span>Ziggymon Engine</span>
          </div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Active Dev Session</div>
        </div>
        
        <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-[140px] truncate">
            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-mono text-amber-500 border border-zinc-700">
              {session?.user?.name?.[0] || "U"}
            </div>
            <span className="text-sm font-medium truncate">{session?.user?.name}</span>
          </div>
          <button onClick={() => signOut()} className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <Terminal size={40} className="text-zinc-700 animate-pulse" />
              <h3 className="text-lg font-semibold text-zinc-300">Workspace Standard Terminal</h3>
              <p className="text-sm text-zinc-500">Ask architectural design queries, source syntax corrections, or initiate debug routines.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user" ? "bg-zinc-800 text-zinc-100 border border-zinc-700" : "bg-zinc-900 text-zinc-200 border border-zinc-850 font-mono"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 text-zinc-500 border border-zinc-850 rounded-xl px-4 py-3 text-sm font-mono animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* System Payload Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="max-w-4xl mx-auto flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject statement or coding prompt..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 placeholder-zinc-600 font-mono"
            />
            <button type="submit" disabled={loading} className="p-3 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 rounded-xl disabled:opacity-50 transition">
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}