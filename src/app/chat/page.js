"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, LogOut, Terminal, Cpu, Sun, Moon, Check, Copy, Edit2 } from "lucide-react";

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
          type="button"
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

  // States for dynamic inline session title modification
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (status === "authenticated" && !currentSessionId) {
      generateNewSessionToken();
    }
  }, [status, currentSessionId]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSessions();
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

  const generateNewSessionToken = () => {
    const uniqueId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(uniqueId);
  };

  const fetchSessions = () => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => setChatSessions(data || []))
      .catch(() => {});
  };

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
    const trackingInput = input; // Snapshot reference
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Track if this message is initiating a fresh historical thread sequence
    const isBrandNewSession = !chatSessions.some(s => s.session_id === currentSessionId);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.srv1769884.hstgr.cloud/webhook/chat";

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trackingInput,
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

      // Reactive Step: Append session metadata to sidebar instantly without page refreshing
      if (isBrandNewSession) {
        const structuralSessionMock = {
          id: Date.now(), // Local key identifier placeholder
          session_id: currentSessionId,
          title: trackingInput.substring(0, 24) || "New Active Session",
          user_email: session?.user?.email || "anonymous"
        };
        setChatSessions((prev) => [structuralSessionMock, ...prev]);
        setActiveSessionId(currentSessionId);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Runtime Error: Failed to connect to core intelligence pipeline." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Triggers title rename actions locally & saves updates back downstream
  const submitRename = async (sessionId) => {
    if (!renameValue.trim()) return;
    
    // Update frontend state instantaneously
    setChatSessions((prev) =>
      prev.map((s) => (s.session_id === sessionId ? { ...s, title: renameValue } : s))
    );
    setEditingSessionId(null);

    try {
      await fetch("/api/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, title: renameValue }),
      });
    } catch (err) {
      console.error("Failed to commit session title update:", err);
    }
  };

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
      
      {/* Side Control/Navigation Workspace Column */}
      <div className={`w-66 border-r flex flex-col justify-between p-4 transition-colors duration-300 ${
        isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-100"
      }`}>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-orange-500 font-bold text-xl tracking-tight">
              <Cpu size={22} className="animate-pulse text-orange-500" />
              <span>Z-engine</span>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              type="button"
              className={`p-2 rounded-xl transition-all duration-200 border ${
                isDarkMode 
                  ? "bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700" 
                  : "bg-zinc-200 border-zinc-300 text-indigo-600 hover:bg-zinc-300"
              }`}
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <div className={`text-[11px] font-mono uppercase tracking-wider ${
              isDarkMode ? "text-zinc-500" : "text-zinc-400"
            }`}>Active Dev Sessions</div>
            <button 
              onClick={() => { setMessages([]); generateNewSessionToken(); setActiveSessionId(null); }}
              className="text-[11px] font-mono text-orange-500 hover:text-orange-400 px-1 rounded transition-colors"
            >
              + New
            </button>
          </div>
          
          {/* Historical Memory Scroll Container Area */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {chatSessions.map((chat) => (
              <div 
                key={chat.id} 
                className={`group flex items-center justify-between p-2 text-xs rounded-lg border font-mono transition-all duration-200 ${
                  currentSessionId === chat.session_id 
                    ? isDarkMode
                      ? "bg-zinc-800 border-orange-500/40 text-zinc-100 shadow-md shadow-orange-500/5"
                      : "bg-white border-orange-500 text-zinc-900 shadow-sm"
                    : isDarkMode
                      ? "bg-zinc-800/20 hover:bg-zinc-800/60 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                      : "bg-white/40 hover:bg-white border-zinc-200/60 text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {editingSessionId === chat.session_id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => submitRename(chat.session_id)}
                    onKeyDown={(e) => e.key === "Enter" && submitRename(chat.session_id)}
                    autoFocus
                    className="w-full bg-zinc-950 text-zinc-100 border border-orange-500/50 rounded px-1.5 py-0.5 outline-none font-mono text-[11px]"
                  />
                ) : (
                  <>
                    <span 
                      onClick={() => handleSelectSession(chat.session_id)} 
                      className="truncate flex-1 cursor-pointer select-none"
                    >
                      {chat.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setEditingSessionId(chat.session_id); setRenameValue(chat.title); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-500 hover:text-orange-500 transition-all shrink-0 ml-1"
                    >
                      <Edit2 size={12} />
                    </button>
                  </>
                )}
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
            type="button"
            className={`p-1.5 rounded-lg transition-colors duration-200 ${
              isDarkMode ? "text-zinc-500 hover:text-red-400 hover:bg-zinc-800" : "text-zinc-400 hover:text-red-500 hover:bg-zinc-200"
            }`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Chat Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <Terminal size={36} className={`animate-pulse ${isDarkMode ? "text-zinc-800" : "text-zinc-300"}`} />
              <h3 className={`text-md font-mono font-semibold uppercase tracking-wider ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>Z-engine Core Console</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}>Inject scripts, manage container orchestration schemas, or launch debug sequences seamlessly.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl rounded-xl px-4 py-2.5 text-sm leading-relaxed transition-all duration-200 border ${
                msg.role === "user" 
                  ? isDarkMode
                    ? "bg-zinc-800/90 text-zinc-100 border-zinc-700/80 shadow-sm" 
                    : "bg-white text-zinc-800 border-zinc-200 shadow-sm"
                  : isDarkMode
                    ? "bg-zinc-900/40 text-zinc-200 border-zinc-850/80 font-mono" 
                    : "bg-zinc-100 text-zinc-800 border-zinc-200/60 font-mono"
              }`}>
                {msg.role === "user" ? msg.text : renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className={`border rounded-xl px-4 py-2.5 text-xs font-mono animate-pulse transition-colors duration-200 ${
                isDarkMode ? "bg-zinc-900/80 text-zinc-500 border-zinc-850" : "bg-zinc-100 text-zinc-400 border-zinc-200"
              }`}>
                Executing runtime lookup...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Control Console Bar */}
        <form onSubmit={handleSendMessage} className={`p-4 border-t transition-colors duration-300 ${
          isDarkMode ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-200 bg-zinc-100/50"
        }`}>
          <div className="max-w-4xl mx-auto flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject statement or coding prompt..."
              className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 font-mono transition-all duration-200 ${
                isDarkMode 
                  ? "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-700" 
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
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}