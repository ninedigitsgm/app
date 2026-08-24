import React, { useState } from 'react';
import { FlaskConical, Plus, Copy, Check, ArrowRight } from 'lucide-react';
import { processSingleNumber } from '../lib/puraEngine';
import { OperatorLogo } from './OperatorLogo';
import { ContactStatus, OperatorName } from '../types';

interface LiveSandboxProps {
  includeCountryCode: boolean;
  onAddContact: (name: string, phone: string) => void;
}

export const LiveSandbox: React.FC<LiveSandboxProps> = ({
  includeCountryCode,
  onAddContact,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [copied, setCopied] = useState(false);

  // Support single or multiple comma/slash separated numbers in sandbox
  const rawParts = inputVal.split(/[,;\/]/).map((s) => s.trim()).filter(Boolean);
  const results = rawParts.length > 0
    ? rawParts.map((p) => processSingleNumber(p, includeCountryCode))
    : [processSingleNumber(inputVal, includeCountryCode)];

  const combinedResult = rawParts.length > 0
    ? results.map((r) => r.result).filter(Boolean).join(', ')
    : '';

  const handleCopy = () => {
    if (!combinedResult) return;
    navigator.clipboard.writeText(combinedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = () => {
    if (!inputVal.trim()) return;
    const opLabel = results.map(r => r.operator).filter(o => o !== 'Unknown')[0] || 'Unknown';
    onAddContact(`Sandbox Contact (${opLabel})`, inputVal.trim());
  };

  interface GroupedBadge {
    operator: OperatorName;
    status: ContactStatus;
    baseLabel: string;
    count: number;
    bg: string;
    hasLogo: boolean;
  }

  const groupMap = new Map<string, GroupedBadge>();

  if (inputVal.trim()) {
    results.forEach((res) => {
      const op = res.operator;
      const st = res.status;
      let baseLabel = op as string;
      let bg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

      if (op === 'Gamcel') {
        bg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
        baseLabel = 'Gamcel (Phase 2 Deferred)';
      } else if (op === 'Gamtel') {
        bg = 'bg-sky-100 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800';
        baseLabel = 'Gamtel (Phase 2 Deferred)';
      } else if (op === 'QCell') {
        bg = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
        baseLabel = st === 'ok' ? 'QCell (+83)' : 'QCell (Standard)';
      } else if (op === 'Comium') {
        bg = 'bg-red-100 text-[#EB222A] dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800';
        baseLabel = st === 'ok' ? 'Comium (+86)' : 'Comium (Standard)';
      } else if (op === 'Africell') {
        bg = 'bg-[#9D207E]/15 text-[#9D207E] dark:bg-[#9D207E]/30 dark:text-[#F3B3EB] border-[#9D207E]/30 dark:border-[#9D207E]/50';
        baseLabel = st === 'ok' ? 'Africell (+87)' : 'Africell (Standard)';
      } else if (op === 'International') {
        bg = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
        baseLabel = 'Foreign International';
      } else if (st === 'review') {
        bg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
        baseLabel = 'Review Needed';
      }

      const hasLogo = ['QCell', 'Comium', 'Africell', 'Gamcel', 'Gamtel'].includes(op);
      const key = `${op}__${baseLabel}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          operator: op,
          status: st,
          baseLabel,
          count: 1,
          bg,
          hasLogo,
        });
      } else {
        groupMap.get(key)!.count += 1;
      }
    });
  }

  const badgeGroups = Array.from(groupMap.values());

  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-blue-500/80 dark:border-blue-500/60 rounded-2xl p-5 sm:p-6 mb-6 shadow-md shadow-blue-500/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Live Sandbox & Quick Test
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type any phone number to test real-time PURA Phase 1 conversion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setInputVal('3123456')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            title="Test with a 7-digit QCell number (3xxxxxx -> +220 833xxxxxx)"
          >
            <OperatorLogo operator="QCell" size="xs" />
            <span>Try QCell</span>
          </button>
          <button
            type="button"
            onClick={() => setInputVal('6123456')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-[#EB222A] dark:text-red-300 border border-red-200 dark:border-red-800/80 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            title="Test with a 7-digit Comium number (6xxxxxx -> +220 866xxxxxx)"
          >
            <OperatorLogo operator="Comium" size="xs" />
            <span>Try Comium</span>
          </button>
          <button
            type="button"
            onClick={() => setInputVal('4055994')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#9D207E]/10 hover:bg-[#9D207E]/20 dark:bg-[#9D207E]/20 dark:hover:bg-[#9D207E]/30 text-[#9D207E] dark:text-[#F3B3EB] border border-[#9D207E]/30 dark:border-[#9D207E]/50 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            title="Test with a 7-digit Africell number (4xxxxxx -> +220 874xxxxxx)"
          >
            <OperatorLogo operator="Africell" size="xs" />
            <span>Try Africell</span>
          </button>
          <button
            type="button"
            onClick={() => setInputVal('9912345')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            title="Test with a Gamcel number (9xxxxxx -> Phase 2 Deferred / +220 9xxxxxx)"
          >
            <OperatorLogo operator="Gamcel" size="xs" />
            <span>Try Gamcel</span>
          </button>
          <button
            type="button"
            onClick={() => setInputVal('4291224')}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
            title="Test with a Gamtel Landline number (4291224 -> Phase 2 Deferred / +220 4291224)"
          >
            <OperatorLogo operator="Gamtel" size="xs" />
            <span>Try Gamtel</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Input */}
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Input Raw Gambian or International Number:
          </label>
          <input
            id="sandboxInput"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. 4055994, 3123456, 4291224 or +221..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="hidden md:flex items-center text-slate-400 pt-5">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Output */}
        <div className="flex-[1.4] p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between flex-wrap gap-1">
            <span>Transformed Result:</span>
            {badgeGroups.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {badgeGroups.map((g, idx) => (
                  <span
                    key={`${g.operator}-${g.baseLabel}-${idx}`}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${g.bg}`}
                  >
                    {g.hasLogo && <OperatorLogo operator={g.operator} size="xs" />}
                    <span>{g.baseLabel}</span>
                    {g.count > 1 && (
                      <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 ml-0.5 tracking-tight">
                        x{g.count}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span
              id="sandboxResult"
              className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-emerald-400 break-all"
            >
              {combinedResult || (
                <span className="text-slate-400 dark:text-slate-500 font-normal text-xs sm:text-sm italic">
                  Enter a number above or click an operator quick-test
                </span>
              )}
            </span>

            {combinedResult && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Copy result"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add to list button */}
        <div className="flex items-end">
          <button
            id="sandboxAddBtn"
            onClick={handleAdd}
            disabled={!inputVal.trim()}
            className="w-full md:w-auto h-[46px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add to List</span>
          </button>
        </div>
      </div>
    </div>
  );
};
