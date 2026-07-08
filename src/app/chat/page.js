"use client";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Send, LogOut, Terminal, Cpu, Sun, Moon, Check, Copy, Edit2, X, ShieldAlert, Trash2, Menu } from "lucide-react";

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
    <div className="my-3 rounded-lg overflow-hidden border border-zinc-700/40 bg-zinc-950/90 font-mono text-xs shadow-2xl max-w-full transform transition-all duration-300 hover:border-orange-500/30">
      <div className="bg-zinc-900/90 px-4 py-1.5 flex justify-between items-center border-b border-zinc-800/80 text-zinc-400">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-orange-500/80 animate-pulse">{language || "code"}</span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-[11px] hover:text-zinc-200 transition-all py-0.5 px-1.5 rounded bg-zinc-800/40 hover:bg-zinc-800 active:scale-95"
        >
          {copied ? <Check size={12} className="text-green-400 animate-scale" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3 sm:p-4 overflow-x-auto whitespace-pre text-zinc-100 selection:bg-orange-500/20 text-[11px] sm:text-xs custom-scrollbar">
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [isTemporaryMode, setIsTemporaryMode] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated" && !currentSessionId && !isTemporaryMode) {
      generateNewSessionToken();
    }
  }, [status, currentSessionId, isTemporaryMode]);

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
      <div className={`flex h-screen items-center justify-center font-mono transition-colors duration-500 bg-zinc-950 text-orange-500 tracking-widest text-xs animate-pulse`}>
        INITIALIZING CORE INTELLIGENCE INTERFACE...
      </div>
    );
  }

  const handleSelectSession = async (sessionId) => {
    setIsTemporaryMode(false);
    setIsSidebarOpen(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setActiveSessionId(sessionId);
    setCurrentSessionId(sessionId); 
    
    try {
      const res = await fetch(`/api/messages?sessionId=${sessionId}`, {
        signal: controller.signal
      });
      const historicalMessages = await res.json();
      setMessages(historicalMessages || []);
      setLoading(false);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Failed to retrieve chat logs:", error);
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    const trackingInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const isBrandNewSession = !chatSessions.some(s => s.session_id === currentSessionId);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "https://n8n.srv1769884.hstgr.cloud/webhook/chat";

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trackingInput,
          sessionId: isTemporaryMode ? `temp_${Date.now()}` : currentSessionId, 
          userEmail: isTemporaryMode ? "ephemeral_session" : (session?.user?.email || "anonymous"),
          isTemporary: isTemporaryMode 
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

      if (isBrandNewSession && !isTemporaryMode) {
        const structuralSessionMock = {
          id: Date.now(), 
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

  const submitRename = async (sessionId) => {
    if (!renameValue.trim()) {
      setEditingSessionId(null);
      return;
    }
    
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

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm("Confirm removal of this transaction matrix register?")) return;

    setChatSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    
    if (currentSessionId === sessionId) {
      setMessages([]);
      generateNewSessionToken();
      setActiveSessionId(null);
    }

    try {
      await fetch(`/api/sessions?sessionId=${sessionId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear backend target registry:", err);
    }
  };

  const handleDeleteAllSessions = async () => {
    if (!confirm("CRITICAL DESTRUCTION ENVELOPE: Clear ALL saved logs across your profile?")) return;

    setChatSessions([]);
    setMessages([]);
    generateNewSessionToken();
    setActiveSessionId(null);
    setIsSidebarOpen(false);

    try {
      await fetch("/api/sessions?all=true", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to complete global environment batch cleanup:", err);
    }
  };

  const toggleTemporaryMode = () => {
    setIsTemporaryMode(true);
    setMessages([]);
    setActiveSessionId(null);
    setCurrentSessionId("");
    setIsSidebarOpen(false);
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
    <div className={`flex h-screen font-sans overflow-hidden transition-all duration-500 relative ${
      isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    }`}>
      
      {/* Ambient background grid layer matching the login design language */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Mobile Backdrop Overlay Curtain */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
        />
      )}

      {/* Side Control Workspace Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-66 border-r flex flex-col justify-between p-4 z-50 transform lg:transform-none transition-transform duration-300 ease-in-out backdrop-blur-xl ${
        isDarkMode ? "border-zinc-800/80 bg-zinc-900/70" : "border-zinc-200 bg-zinc-100/90"
      } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-orange-500 font-bold text-xl tracking-tight select-none">
              <Cpu size={22} className={isTemporaryMode ? "text-purple-500 animate-bounce" : "animate-spin-slow text-orange-500"} />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400 font-mono font-extrabold">Z-engine</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                type="button"
                className={`p-2 rounded-xl border transition-all duration-200 active:scale-90 ${
                  isDarkMode ? "bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700" : "bg-white border-zinc-300 text-indigo-600 hover:bg-zinc-50"
                }`}
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl border border-zinc-800 text-zinc-400 lg:hidden hover:bg-zinc-800 active:scale-90 transition-all"
              >
                <X size={15} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 mb-5">
            <button
              onClick={() => { setIsTemporaryMode(false); setMessages([]); generateNewSessionToken(); setActiveSessionId(null); setIsSidebarOpen(false); }}
              className={`w-full text-left font-mono text-xs p-2.5 rounded-xl border transition-all duration-300 transform active:scale-[0.98] ${
                !isTemporaryMode && activeSessionId === null
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-500 font-semibold shadow-md shadow-orange-500/5"
                  : isDarkMode ? "bg-zinc-800/30 border-zinc-850 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              + Standard Session
            </button>
            <button
              onClick={toggleTemporaryMode}
              className={`w-full text-left font-mono text-xs p-2.5 rounded-xl border transition-all duration-300 transform active:scale-[0.98] flex items-center justify-between ${
                isTemporaryMode
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-semibold shadow-md shadow-purple-500/5"
                  : isDarkMode ? "bg-zinc-800/30 border-zinc-850 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span className="flex items-center gap-1.5">🕵️ Incognito Temp Shell</span>
              {isTemporaryMode && <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />}
            </button>
          </div>
          
          <div className="flex justify-between items-center mb-2 px-1">
            <div className={`text-[10px] font-mono uppercase tracking-wider ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}>Saved Registers</div>
            {chatSessions.length > 0 && (
              <button onClick={handleDeleteAllSessions} type="button" className="text-[10px] font-mono text-zinc-500 hover:text-red-500 flex items-center gap-0.5 transition-colors">
                <Trash2 size={10} /> Purge All
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {chatSessions.map((chat) => (
              <div 
                key={chat.id} 
                className={`group flex items-center justify-between p-2 text-xs rounded-xl border font-mono transition-all duration-200 transform hover:translate-x-0.5 ${
                  currentSessionId === chat.session_id && !isTemporaryMode
                    ? isDarkMode ? "bg-zinc-800/90 border-orange-500/40 text-zinc-100 shadow-md" : "bg-white border-orange-500 text-zinc-900 shadow-sm"
                    : isDarkMode ? "bg-zinc-800/10 hover:bg-zinc-800/40 border-zinc-850/60 text-zinc-400" : "bg-white/40 hover:bg-white border-zinc-200/60 text-zinc-500"
                }`}
              >
                {editingSessionId === chat.session_id ? (
                  <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitRename(chat.session_id);
                        if (e.key === "Escape") setEditingSessionId(null);
                      }}
                      autoFocus
                      className="flex-1 bg-zinc-950 text-zinc-100 border border-orange-500/50 rounded-lg px-2 py-0.5 outline-none font-mono text-[11px]"
                    />
                    <button onClick={() => submitRename(chat.session_id)} className="text-green-500 p-0.5 hover:bg-zinc-800 rounded"><Check size={12} /></button>
                    <button onClick={() => setEditingSessionId(null)} className="text-zinc-500 p-0.5 hover:bg-zinc-800 rounded"><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <span onClick={() => handleSelectSession(chat.session_id)} className="truncate flex-1 cursor-pointer select-none text-[11px] pr-2">
                      {chat.title}
                    </span>
                    <div className="flex lg:opacity-0 group-hover:opacity-100 items-center gap-1 transition-all shrink-0">
                      <button type="button" onClick={() => { setEditingSessionId(chat.session_id); setRenameValue(chat.title); }} className="p-0.5 text-zinc-500 hover:text-orange-400 transition-colors">
                        <Edit2 size={11} />
                      </button>
                      <button type="button" onClick={(e) => handleDeleteSession(e, chat.session_id)} className="p-0.5 text-zinc-500 hover:text-red-400 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className={`border-t pt-4 flex items-center justify-between mt-auto ${isDarkMode ? "border-zinc-800/60" : "border-zinc-200"}`}>
          <div className="flex items-center gap-2.5 max-w-[140px] truncate">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-mono border shrink-0 transition-transform duration-300 hover:rotate-12 ${
              isDarkMode ? "bg-zinc-800 text-amber-500 border-zinc-700" : "bg-white text-indigo-600 border-zinc-300"
            }`}>
              {session?.user?.name?.[0] || "U"}
            </div>
            <span className={`text-sm font-medium truncate ${isDarkMode ? "text-zinc-300" : "text-zinc-700"}`}>{session?.user?.name}</span>
          </div>
          <button onClick={() => signOut()} type="button" className={`p-2 rounded-xl transition-colors ${isDarkMode ? "text-zinc-500 hover:text-red-400 hover:bg-zinc-800" : "text-zinc-400 hover:text-red-500 hover:bg-zinc-200"}`}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Chat Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10">
        
        {/* Mobile Top Navigation Bar */}
        <div className={`lg:hidden flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors ${
          isDarkMode ? "bg-zinc-950/80 border-zinc-800/80" : "bg-zinc-50/80 border-zinc-200"
        }`}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 rounded-xl border transition-all active:scale-90 ${isDarkMode ? "border-zinc-800 bg-zinc-900/50 text-zinc-300" : "border-zinc-300 bg-white text-zinc-700"}`}
          >
            <Menu size={16} />
          </button>
          <span className="text-sm font-mono font-black tracking-widest text-orange-500 uppercase animate-pulse">Z-engine</span>
          <div className="w-9 h-9" />
        </div>

        {isTemporaryMode && (
          <div className="bg-purple-950/20 border-b border-purple-900/30 px-4 py-2.5 flex items-center gap-2 text-[11px] text-purple-400 font-mono animate-slideDown">
            <ShieldAlert size={13} className="shrink-0 animate-pulse" />
            <span className="truncate">Ephemeral Sandbox Mode Active. Rows bypass permanent registers.</span>
          </div>
        )}

        {/* Message Container Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-full custom-scrollbar bg-transparent">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 px-4 animate-fadeIn">
              <div className="p-4 rounded-full bg-zinc-900/20 border border-zinc-800/30 shadow-inner">
                <Terminal size={32} className={`animate-pulse ${isDarkMode ? "text-zinc-700" : "text-zinc-400"}`} />
              </div>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-widest ${isDarkMode ? "text-zinc-400" : "text-zinc-500"}`}>
                {isTemporaryMode ? "Transient Terminal Shell" : "Z-engine Core Terminal"}
              </h3>
              <p className={`text-[11px] leading-relaxed max-w-xs ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}>
                Inject statements, trace system architectures, or optimize data structures via runtime execution queries.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} max-w-full animate-messageSlide`}>
              <div className={`max-w-[88%] sm:max-w-3xl rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed border shadow-sm transition-all break-words ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 border-zinc-700/80 rounded-br-sm" 
                  : isDarkMode 
                    ? "bg-zinc-900/40 text-zinc-200 border-zinc-850/60 font-mono rounded-bl-sm backdrop-blur-sm" 
                    : "bg-white text-zinc-800 border-zinc-200 font-mono rounded-bl-sm"
              }`}>
                {msg.role === "user" ? msg.text : renderMessageContent(msg.text)}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-messageSlide">
              <div className={`border rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs font-mono tracking-wider animate-pulse ${
                isDarkMode ? "bg-zinc-900/60 text-orange-500/70 border-zinc-850" : "bg-zinc-100 text-zinc-400 border-zinc-200"
              }`}>
                &gt; EXECUTING MATRIX SEARCH...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Footer */}
        <form onSubmit={handleSendMessage} className={`p-3 sm:p-4 border-t backdrop-blur-md transition-colors ${
          isDarkMode ? "border-zinc-800/80 bg-zinc-950/40" : "border-zinc-200 bg-zinc-50/60"
        }`}>
          <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isTemporaryMode ? "Inject sandbox scripts..." : "Inject statements to console..."}
              className={`flex-1 border rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none font-mono transition-all duration-300 min-w-0 ${
                isTemporaryMode
                  ? "focus:border-purple-500/50 bg-zinc-950/80 border-purple-900/30 text-zinc-100 placeholder-purple-900/30"
                  : isDarkMode 
                    ? "bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-orange-500/40 focus:bg-zinc-950 shadow-inner" 
                    : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-orange-500/40"
              }`}
            />
            <button 
              type="submit" 
              disabled={loading} 
              className={`p-3 rounded-xl disabled:opacity-40 transition-all duration-300 shrink-0 transform active:scale-90 ${
                isTemporaryMode 
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/10"
                  : isDarkMode ? "bg-zinc-100 hover:bg-white text-zinc-950 shadow-md" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-50 shadow-sm"
              }`}
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}