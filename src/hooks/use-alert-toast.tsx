import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertToast } from "@/components/ui/alert-toast";

type ToastVariant = "success" | "warning" | "info" | "error";
type ToastStyleVariant = "default" | "filled";

interface Toast {
  id: string;
  title: string;
  description: string;
  variant: ToastVariant;
  styleVariant?: ToastStyleVariant;
}

interface AlertToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const AlertToastContext = createContext<AlertToastContextType | undefined>(undefined);

export function AlertToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const success = useCallback((title: string, description = "") => {
    showToast({ title, description, variant: "success", styleVariant: "default" });
  }, [showToast]);

  const error = useCallback((title: string, description = "") => {
    showToast({ title, description, variant: "error", styleVariant: "default" });
  }, [showToast]);

  const warning = useCallback((title: string, description = "") => {
    showToast({ title, description, variant: "warning", styleVariant: "default" });
  }, [showToast]);

  const info = useCallback((title: string, description = "") => {
    showToast({ title, description, variant: "info", styleVariant: "default" });
  }, [showToast]);

  return (
    <AlertToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <AlertToast
              key={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              styleVariant={toast.styleVariant}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </AlertToastContext.Provider>
  );
}

export function useAlertToast() {
  const context = useContext(AlertToastContext);
  if (!context) {
    throw new Error("useAlertToast must be used within an AlertToastProvider");
  }
  return context;
}
