'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const COLORS: Record<string, string> = {
  info: 'border-polar-accent/40 bg-polar-card',
  success: 'border-polar-success/40 bg-polar-card',
  warning: 'border-amber-500/40 bg-polar-card',
  error: 'border-polar-critical/40 bg-polar-card',
  critical: 'border-polar-critical bg-polar-critical/10',
};

const ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  critical: '🚨',
};

function ToastItem({ toast }: { toast: { id: string; type: string; title: string; message?: string; duration?: number } }) {
  const removeToast = useAppStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border shadow-polar max-w-sm backdrop-blur-md',
        COLORS[toast.type] || COLORS.info
      )}
    >
      {toast.type === 'critical' && (
        <div className="absolute -inset-0.5 rounded-xl bg-polar-critical/20 blur-md -z-10 animate-pulse" />
      )}
      <span className="text-lg flex-shrink-0">{ICONS[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-polar-text">{toast.title}</p>
        {toast.message && <p className="text-xs text-polar-text-dim mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-polar-text-dim hover:text-polar-text flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
