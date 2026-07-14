"use client";
import { useCallback, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

let idCounter = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const pushToast = useCallback((message, variant = "error") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);
    timers.current[id] = setTimeout(() => dismissToast(id), 4000);
    return id;
  }, [dismissToast]);

  return { toasts, pushToast, dismissToast };
}

const VARIANT_STYLES = {
  error: { icon: AlertCircle, classes: "border-red-500/30 bg-red-950/40 text-red-200", iconClass: "text-red-400" },
  success: { icon: CheckCircle2, classes: "border-emerald-500/30 bg-emerald-950/40 text-emerald-200", iconClass: "text-emerald-400" },
  info: { icon: Info, classes: "border-orange-500/30 bg-orange-950/30 text-orange-200", iconClass: "text-orange-400" },
};

export function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-xs sm:max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none">
      {toasts.map((toast) => {
        const variant = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.error;
        const Icon = variant.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl font-mono text-[11px] leading-relaxed ${variant.classes} ${
              toast.leaving ? "animate-toastOut" : "animate-toastIn"
            }`}
          >
            <Icon size={14} className={`shrink-0 mt-0.5 ${variant.iconClass}`} />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              type="button"
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
