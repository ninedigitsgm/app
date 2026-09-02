import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, FileCode, Cpu, X } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 id="security-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Security & Data Integrity Verified
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                W3C Subresource Integrity (SRI) & Private Client Architecture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close Security Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs text-slate-700 dark:text-slate-200">
          {/* Card 1: SRI Hashes */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <FileCode className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
              <span>Cryptographic Subresource Integrity (SRI)</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Every production JavaScript script and CSS stylesheet is fingerprinted with cryptographic SHA-384 integrity hashes during build. Your web browser strictly verifies these checksums before executing code, preventing transit tampering or proxy injections.
            </p>
          </div>

          {/* Card 2: 100% Client-Side Private Processing */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Cpu className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              <span>100% Local In-Memory Processing</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Your contact files (VCF / CSV) are parsed, analyzed, upgraded, and exported entirely within your browser memory. No contact names, numbers, or personal notes are ever transmitted across the network or stored on any remote server.
            </p>
          </div>

          {/* Card 3: Injection & Leak Defenses */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Lock className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              <span>Spreadsheet Injection & Content Security Defenses</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Exported CSVs are automatically sanitized against CSV Formula Injection (CWE-1236). Active Content Security Policy (CSP) headers block unauthorized external scripts and inline evaluations.
            </p>
          </div>

          {/* Verification Badges List */}
          <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              W3C SRI (SHA-384)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Zero Outbound Telemetry
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Offline PWA Ready
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
