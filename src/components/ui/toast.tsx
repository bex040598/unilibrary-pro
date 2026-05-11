"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

type ToastRecord = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

const ToastContext = createContext<{
  push: (toast: Omit<ToastRecord, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const push = useCallback((toast: Omit<ToastRecord, "id">) => {
    const next = { ...toast, id: crypto.randomUUID() };
    setToasts((current) => [next, ...current].slice(0, 4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== next.id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-3xl border px-4 py-3 shadow-soft",
              toast.tone === "success" && "border-emerald-200 bg-white",
              toast.tone === "error" && "border-rose-200 bg-white",
              toast.tone === "info" && "border-cyan-200 bg-white"
            )}
          >
            <div className="mb-2">
              <Badge tone={toast.tone === "success" ? "emerald" : toast.tone === "error" ? "rose" : "cyan"}>
                {toast.tone}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-ink">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-sm text-slate-600">{toast.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
