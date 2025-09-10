import { useState, useCallback } from "react";
import Toast, { type ToastProps } from "../components/ui/Toast";

/**
 * Hook to display transient toast notifications.
 *
 * Provides helpers for common toast variants and a `ToastContainer` component
 * you should render once near the root of the app.
 */
export function useToast() {
    const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);
  
    /** Add a toast to the queue */
    const addToast = useCallback((toast: Omit<ToastProps, "onClose">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = {
        ...toast,
        id,
        onClose: () => removeToast(id),
      };
      setToasts((prev) => [...prev, newToast]);
    }, []);
  
    /** Remove a toast by id */
    const removeToast = useCallback((id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
  
    /** Show a success toast */
    const showSuccess = useCallback((message: string, duration?: number) =>
      addToast({ message, type: "success", duration }), [addToast]);
    /** Show an error toast */
    const showError = useCallback((message: string, duration?: number) =>
      addToast({ message, type: "error", duration }), [addToast]);
    /** Show an info toast */
    const showInfo = useCallback((message: string, duration?: number) =>
      addToast({ message, type: "info", duration }), [addToast]);
    /** Show a warning toast */
    const showWarning = useCallback((message: string, duration?: number) =>
      addToast({ message, type: "warning", duration }), [addToast]);
  
    /**
     * React component that renders all active toasts.
     * Place this once, typically inside your app layout.
     */
    const ToastContainer = useCallback(() => (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    ), [toasts]);
  
    return {
      showSuccess,
      showError,
      showInfo,
      showWarning,
      ToastContainer,
    };
  }
  