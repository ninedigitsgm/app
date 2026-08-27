import React from 'react';
import { BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { OperatorLogo } from './OperatorLogo';

export const PuraRulesGuide: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          1. PURA Migration Rules & Operator Guide
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        Standard 7-digit mobile numbers expand to 9 digits with assigned operator prefixes.
        Gamcel mobile and Gamtel fixed landlines remain unchanged in Phase 1:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* QCell */}
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <OperatorLogo operator="QCell" size="sm" />
                <span>QCell (+220 83...)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
                Add 83
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-snug">
              Applies to 7-digit numbers starting with:
              <br />
              <b className="text-amber-950 dark:text-amber-200">3</b> (30–39) or{' '}
              <b className="text-amber-950 dark:text-amber-200">50, 51, 52, 53, 54, 55, 58, 59</b>
            </p>
          </div>
          <div className="mt-2 text-[11px] font-mono text-amber-900 dark:text-amber-300/90 bg-amber-100/70 dark:bg-amber-900/40 px-2 py-1 rounded">
            3123456 → <b>+220 833123456</b>
          </div>
        </div>

        {/* Comium */}
        <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                <OperatorLogo operator="Comium" size="sm" />
                <span>Comium (+220 86...)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-[#EB222A] dark:bg-red-950/80 dark:text-red-200 border border-red-200 dark:border-red-800">
                Add 86
              </span>
            </div>
            <p className="text-xs text-red-800/90 dark:text-red-300/80 leading-snug">
              Applies to 7-digit numbers starting with:
              <br />
              <b className="text-red-950 dark:text-red-200">6</b> (60–69) or{' '}
              <b className="text-red-950 dark:text-red-200">84, 85, 86, 87</b>
            </p>
          </div>
          <div className="mt-2 text-[11px] font-mono text-red-900 dark:text-red-300/90 bg-red-100/70 dark:bg-red-900/40 px-2 py-1 rounded">
            6123456 → <b>+220 866123456</b>
          </div>
        </div>

        {/* Africell */}
        <div className="p-3.5 rounded-xl border border-[#9D207E]/20 dark:border-[#9D207E]/40 bg-[#9D207E]/5 dark:bg-[#9D207E]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-[#9D207E] dark:text-[#F3B3EB] flex items-center gap-1.5">
                <OperatorLogo operator="Africell" size="sm" />
                <span>Africell (+220 87...)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#9D207E]/15 text-[#9D207E] dark:bg-[#9D207E]/30 dark:text-[#F3B3EB] border border-[#9D207E]/30">
                Add 87
              </span>
            </div>
            <p className="text-xs text-[#9D207E]/90 dark:text-[#F3B3EB]/90 leading-snug">
              Applies to 7-digit numbers starting with:
              <br />
              <b className="text-[#9D207E] dark:text-[#F3B3EB]">7</b> (70–79),{' '}
              <b className="text-[#9D207E] dark:text-[#F3B3EB]">2</b> (20–29), or{' '}
              <b className="text-[#9D207E] dark:text-[#F3B3EB]">40, 41, 45</b>
            </p>
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#9D207E] dark:text-[#F3B3EB] bg-[#9D207E]/10 dark:bg-[#9D207E]/25 px-2 py-1 rounded">
            4055994 → <b>+220 874055994</b>
          </div>
        </div>

        {/* Gamcel (Deferred) */}
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <OperatorLogo operator="Gamcel" size="sm" />
                <span>Gamcel (+220 9...)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200">
                Phase 1 Deferred (7-Digit)
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300/80 leading-snug">
              Mobile numbers starting with <b className="text-emerald-950 dark:text-emerald-200">9</b> are Phase 1 differed and remain 7 digits. Labeled to accurately identify Gamcel contacts.
            </p>
          </div>
          <div className="mt-2 text-[11px] font-mono text-emerald-900 dark:text-emerald-300/90 bg-emerald-100/70 dark:bg-emerald-900/40 px-2 py-1 rounded">
            9912345 → <b>+220 9912345</b>
          </div>
        </div>

        {/* Gamtel Landline (Deferred) */}
        <div className="sm:col-span-2 p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                <OperatorLogo operator="Gamtel" size="sm" />
                <span>Gamtel Fixed Landlines (+220 4... / 5...)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-200 text-sky-900 dark:bg-sky-900/80 dark:text-sky-200">
                Phase 1 Deferred (7-Digit)
              </span>
            </div>
            <p className="text-xs text-sky-800/90 dark:text-sky-300/80 leading-snug">
              Gamtel landline ranges starting with <b className="text-sky-950 dark:text-sky-200">42, 43, 44, 47, 48, 56, 57</b> remain standard 7-digit numbers for Phase 1.
            </p>
          </div>
          <div className="mt-2 text-[11px] font-mono text-sky-900 dark:text-sky-300/90 bg-sky-100/70 dark:bg-sky-900/40 px-2 py-1 rounded">
            4291224 → <b>+220 4291224</b> (Banjul/Serekunda lines)
          </div>
        </div>
      </div>
    </div>
  );
};
