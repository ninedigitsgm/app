import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const LegalModal: React.FC<LegalModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer" aria-label="Close dialog">
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-slate-700 dark:text-slate-200 text-sm leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
