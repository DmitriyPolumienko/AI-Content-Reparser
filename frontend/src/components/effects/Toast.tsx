'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  visible?: boolean;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'text-emerald-400 border-emerald-500/30',
  error: 'text-red-400 border-red-500/30',
  warning: 'text-amber-400 border-amber-500/30',
  info: 'text-cyan-400 border-cyan-500/30',
};

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  visible = true,
}: ToastProps) {
  const [show, setShow] = useState(visible);
  const Icon = icons[type];

  useEffect(() => {
    setShow(visible);
  }, [visible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div
      className={clsx(
        'fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl glass border',
        colors[type],
        'animate-toast-enter shadow-card'
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-sm font-medium text-white">{message}</p>
      {onClose && (
        <button
          onClick={() => { setShow(false); onClose(); }}
          className="ml-2 text-white/50 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* Hook for programmatic toast usage */
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastComponent };
}
