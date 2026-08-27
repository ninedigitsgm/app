import React from 'react';
import { ShieldCheck, BookOpen, Lock } from 'lucide-react';

interface HeaderProps {
  totalContacts: number;
  upgradedCount: number;
  showReference?: boolean;
  onToggleReference?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalContacts,
  upgradedCount,
  showReference,
  onToggleReference,
}) => {
  return (
    <header className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md mb-6 relative overflow-hidden border border-slate-800">
      {/* Decorative Gambia flag top stripe accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="flex-1 bg-red-600"></div>
        <div className="w-6 bg-white"></div>
        <div className="flex-1 bg-blue-600"></div>
        <div className="w-6 bg-white"></div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              PURA Phase 1 Compliant
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Lock className="w-3 h-3" />
              100% Client-Side Privacy
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Contacts Upgrade Workspace
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Upload your contact file to automatically convert 7-digit GSM numbers to Gambian 9-digit format while protecting foreign & landline numbers.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
          {onToggleReference && (
            <button
              type="button"
              onClick={onToggleReference}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                showReference
                  ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showReference ? 'Hide Rules Guide' : 'PURA Rules & Sandbox'}</span>
            </button>
          )}

          {totalContacts > 0 && (
            <div className="flex flex-col text-right pl-3 border-l border-slate-700">
              <span className="text-[10px] text-slate-400 font-medium">Loaded in memory</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">
                {upgradedCount} / {totalContacts} upgraded
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

