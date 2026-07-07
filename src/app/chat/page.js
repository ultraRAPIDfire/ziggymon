"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, LogOut, Terminal, Cpu, Sun, Moon, Check, Copy } from "lucide-react";

// Sub-component to manage copy interaction cleanly for code snippets
function CodeSnippetBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard write blocked:", err);
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-zinc-700/50 bg-zinc-950 font-mono text-xs shadow-inner">
      <div className="bg-zinc-900 px-4 py-1.5 flex justify-between items-center border-b border-zinc-800/80 text-zinc-400">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-orange-500/80">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-zinc-200 transition-colors py-0.5 px-1.5 rounded bg-zinc-800/40 hover:bg-zinc-800"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre text-zinc-100 selection:bg-orange-500/20">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated" && !currentSessionId) {
      const uniqueId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(uniqueId);
    }
  }, [status, currentSessionId]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/sessions")
        .then((res) => res.json())
        .then((data) => setChatSessions(data || []))
        .catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (status === "loading") {
    return (
      <div className={`flex h-screen items-center justify-center font-mono transition-colors duration-300 ${
        isDarkMode ? "bg-zinc-950 text-zinc-400" : "bg-zinc-50 text-zinc-600"
      }`}>
        Loading Environment...
      </div>
    );
  }

  const handleSelectSession = async (sessionId) => {
    setLoading(true);
    setActiveSessionId(sessionId);
    setCurrentSessionId(sessionId); 
    
    try {
      const res = await fetch(`/api/messages?sessionId=${sessionId}`);
      const historicalMessages = await res.json();
      setMessages(historicalMessages || []);
    } catch (error) {
      console.error("Failed to retrieve chat logs:", error);
    } finally {
      setLoading(false); 
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.srv1769884.hstgr.cloud/webhook/chat";

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId: currentSessionId, 
          userEmail: session?.user?.email || "anonymous", 
        }),
      });

      const data = await response.json();
      const payload = Array.isArray(data) ? data[0] : data;
      const aiText = payload?.response || payload?.output || payload?.text || 
                     (typeof payload === "string" ? payload : JSON.stringify(payload));
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: aiText || "No readable string payload returned from network." },
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

  // Text parser algorithm to detect markdown code fences safely
  const renderMessageContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : "";
        const codeContent = match ? match[2] : part.slice(3, -3);
        return <CodeSnippetBlock key={index} code={codeContent.trim()} language={language} />;
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    }`}>
      
      {/* Side Control/Navigation Column */}
      <div className={`w-64 border-r flex flex-col justify-between p-4 transition-colors duration-300 ${
        isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-100"
      }`}>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
              <Cpu size={24} />
              <span>Ziggymon</span>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2 rounded-xl transition-all duration-200 border ${
                isDarkMode 
                  ? "bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700" 
                  : "bg-zinc-200 border-zinc-300 text-indigo-600 hover:bg-zinc-300"
              }`}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          
          <div className={`text-xs font-mono uppercase tracking-wider mb-2 ${
            isDarkMode ? "text-zinc-500" : "text-zinc-400"
          }`}>Active Dev Session</div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {chatSessions.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => handleSelectSession(chat.session_id)}
                className={`p-2 text-xs rounded-lg border cursor-pointer truncate font-mono transition-all duration-200 ${
                  currentSessionId === chat.session_id 
                    ? isDarkMode
                      ? "bg-zinc-800 border-orange-500/50 text-zinc-100 font-semibold shadow-md shadow-orange-500/5"
                      : "bg-white border-orange-500 text-zinc-900 font-semibold shadow-md"
                    : isDarkMode
                      ? "bg-zinc-800/40 hover:bg-zinc-800 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                      : "bg-white/60 hover:bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {chat.title}
              </div>
            ))}
          </div>
        </div>
        
        {/* User Identity Frame */}
        <div className={`border-t pt-4 flex items-center justify-between mt-auto ${
          isDarkMode ? "border-zinc-800" : "border-zinc-200"
        }`}>
          <div className="flex items-center gap-2 max-w-[140px] truncate">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-mono border shrink-0 ${
              isDarkMode ? "bg-zinc-800 text-amber-500 border-zinc-700" : "bg-white text-indigo-600 border-zinc-300"
            }`}>
              {session?.user?.name?.[0] || "U"}
            </div>
            <span className={`text-sm font-medium truncate ${isDarkMode ? "text-zinc-300" : "text-zinc-700"}`}>{session?.user?.name}</span>
          </div>
          <button 
            onClick={() => signOut()} 
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              isDarkMode ? "text-zinc-500 hover:text-red-400 hover:bg-zinc-800" : "text-zinc-400 hover:text-red-500 hover:bg-zinc-200"
            }`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <Terminal size={40} className={`animate-pulse ${isDarkMode ? "text-zinc-800" : "text-zinc-300"}`} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-zinc-300" : "text-zinc-600"}`}>Workspace Standard Terminal</h3>
              <p className={`text-sm ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}>Ask architectural design queries, source syntax corrections, or initiate debug routines.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl rounded-xl px-4 py-3 text-sm leading-relaxed transition-colors duration-200 border ${
                msg.role === "user" 
                  ? isDarkMode
                    ? "bg-zinc-800 text-zinc-100 border-zinc-700" 
                    : "bg-white text-zinc-800 border-zinc-200 shadow-sm"
                  : isDarkMode
                    ? "bg-zinc-900 text-zinc-200 border-zinc-850 font-mono" 
                    : "bg-zinc-100 text-zinc-800 border-zinc-200/60 font-mono"
              }`}>
                {msg.role === "user" ? msg.text : renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className={`border rounded-xl px-4 py-3 text-sm font-mono animate-pulse transition-colors duration-200 ${
                isDarkMode ? "bg-zinc-900 text-zinc-500 border-zinc-850" : "bg-zinc-100 text-zinc-400 border-zinc-200"
              }`}>
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className={`p-4 border-t transition-colors duration-300 ${
          isDarkMode ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-zinc-100/50"
        }`}>
          <div className="max-w-4xl mx-auto flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject statement or coding prompt..."
              className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 font-mono transition-all duration-200 ${
                isDarkMode 
                  ? "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600" 
                  : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400"
              }`}
            />
            <button 
              type="submit" 
              disabled={loading} 
              className={`p-3 rounded-xl disabled:opacity-50 transition-all duration-200 shadow-sm ${
                isDarkMode ? "bg-zinc-50 hover:bg-zinc-200 text-zinc-950" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-50"
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}