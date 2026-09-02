import React from 'react';
import { ShieldCheck, BookOpen, Lock, Wifi, Smartphone } from 'lucide-react';

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
    <div role="region" aria-label="Workspace Status Banner" className="bg-gradient-to-r from-blue-950 via-teal-950 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-md mb-6 relative overflow-hidden border border-slate-700/50">
      {/* Subtle ambient gradient glows */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Wifi className="w-3 h-3" />
              Works Online &amp; Offline
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Smartphone className="w-3 h-3" />
              iOS &amp; Android Ready
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Contacts Upgrade Workspace
          </h1>

          <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl leading-relaxed">
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
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/20'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showReference ? 'Hide Rules Guide' : 'PURA Rules & Sandbox'}</span>
            </button>
          )}

          {totalContacts > 0 && (
            <div className="flex flex-col text-right pl-3 border-l border-white/20">
              <span className="text-[10px] text-slate-300 font-medium">Loaded in memory</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300">
                {upgradedCount} / {totalContacts} upgraded
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

