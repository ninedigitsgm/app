import React from 'react';
import { ShieldCheck, PhoneCall } from 'lucide-react';

interface HeaderProps {
  totalContacts: number;
  upgradedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalContacts,
  upgradedCount,
}) => {
  return (
    <header className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden border border-slate-800">
      {/* Decorative Gambia flag top stripe accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex">
        <div className="flex-1 bg-red-600"></div>
        <div className="w-6 bg-white"></div>
        <div className="flex-1 bg-blue-600"></div>
        <div className="w-6 bg-white"></div>
        <div className="flex-1 bg-emerald-600"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              PURA Phase 1 Compliant (v85)
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              🇬🇲 The Gambia
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-blue-400 inline-block" />
            GM 9-Digit Contact Upgrader
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Instantly convert Gambian 7-digit GSM mobile numbers to the new 9-digit format assigned by PURA.
            Safeguards Gamcel, Gamtel landlines, and international numbers with lossless VCF/CSV exports.
          </p>
        </div>

        {totalContacts > 0 && (
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="flex flex-col text-right pr-3 border-r border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Ready in memory</span>
              <span className="text-sm font-bold text-emerald-400">
                {upgradedCount} / {totalContacts} upgraded
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
