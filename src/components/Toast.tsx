import React from 'react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warn';
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 sm:top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none items-center px-4 w-full max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/15 flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-slide-down backdrop-blur-md max-w-full"
        >
          {t.type === 'warn' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : t.type === 'info' ? (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="leading-tight break-words">{t.text}</span>
        </div>
      ))}
    </div>
  );
};
