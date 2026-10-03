import React, { useState, useEffect } from 'react';

// A super basic toast implementation for now to satisfy the auth files.
// Real production app would use react-hot-toast or similar.
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let toastCounter = 0;
let addToastFn: ((msg: ToastMessage) => void) | null = null;

export const toast = {
  success: (message: string) => addToastFn?.({ id: toastCounter++, message, type: 'success' }),
  error: (message: string) => addToastFn?.({ id: toastCounter++, message, type: 'error' }),
  info: (message: string) => addToastFn?.({ id: toastCounter++, message, type: 'info' }),
  warning: (message: string) => addToastFn?.({ id: toastCounter++, message, type: 'warning' }),
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 5000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-md shadow-lg text-white text-sm font-medium ${
            t.type === 'success' ? 'bg-emerald-600' :
            t.type === 'error' ? 'bg-red-600' :
            t.type === 'warning' ? 'bg-amber-600' : 'bg-slate-800'
          } animate-in slide-in-from-bottom-5`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};
