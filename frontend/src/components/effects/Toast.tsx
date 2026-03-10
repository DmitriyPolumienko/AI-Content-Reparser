"use client";

import { useState, useCallback, useEffect } from "react";
import { createContext, useContext, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const colors = {
    success: "border-green-500/30 text-green-400",
    error: "border-red-500/30 text-red-400",
    info: "border-blue-500/30 text-blue-400",
  };

  const type = toast.type ?? "success";

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl glass border ${colors[type]} min-w-[220px] cursor-pointer`}
      onClick={onRemove}
    >
      <span className="text-lg font-bold">{icons[type]}</span>
      <span className="text-white/90 text-sm font-medium">{toast.message}</span>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
