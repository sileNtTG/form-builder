import { defineStore } from "pinia";
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";

export interface Toast {
  id: string;
  title?: string;
  text: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  closable?: boolean;
}

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const newToast: Toast = {
      ...toast,
      id: uuidv4(),
      duration: toast.duration ?? 4000,
      closable: toast.closable ?? true,
    };

    toasts.value.push(newToast);

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.duration);
    }

    return newToast.id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAllToasts = () => {
    toasts.value = [];
  };

  // Convenience methods for different toast types
  const showSuccess = (text: string, title?: string) => {
    return addToast({ type: "success", text, title });
  };

  const showError = (text: string, title?: string) => {
    return addToast({ type: "error", text, title });
  };

  const showWarning = (text: string, title?: string) => {
    return addToast({ type: "warning", text, title });
  };

  const showInfo = (text: string, title?: string) => {
    return addToast({ type: "info", text, title });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
});
