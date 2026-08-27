import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Play, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { parseCSV } from '../lib/puraEngine';
import { OperatorLogo } from './OperatorLogo';
import { SAMPLE_RAW_DATA } from '../lib/demoData';

interface BatchRawTesterProps {
  onProcessRawAndLaunch?: (rawText: string) => void;
  includeCountryCode?: boolean;
}

export const BatchRawTester: React.FC<BatchRawTesterProps> = ({
  onProcessRawAndLaunch,
  includeCountryCode = true,
}) => {
  const [rawText, setRawText] = useState<string>(SAMPLE_RAW_DATA);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse lines in real time
  const parsedRecords = useMemo(() => {
    if (!rawText.trim()) return [];
    return parseCSV(rawText, includeCountryCode);
  }, [rawText, includeCountryCode]);

  const upgradedCount = useMemo(() => {
    return parsedRecords.filter((r) => r.status === 'ok' || r.status === 'already').length;
  }, [parsedRecords]);

  const lineCount = rawText ? rawText.split('\n').filter(Boolean).length : 0;

  const handleCopyConverted = () => {
    if (parsedRecords.length === 0) return;
    const output = parsedRecords
      .map((r) => `${r.name}, ${r.result}`)
      .join('\n');
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = () => {
    if (onProcessRawAndLaunch && rawText.trim()) {
      onProcessRawAndLaunch(rawText);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Batch Raw Contacts & Text Sandbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste raw contact lines or quick notes to preview instant PURA conversion in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
          {parsedRecords.length > 0 && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {upgradedCount} / {parsedRecords.length} upgraded
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-4">
        {/* Left: Input Textarea */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <label htmlFor="landingRawInput" className="font-semibold text-slate-700 dark:text-slate-300">
                Input (Name, Phone Number)
              </label>
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_RAW_DATA)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                Reset Sample Data
              </button>
            </div>

            <textarea
              id="landingRawInput"
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  const nextText = rawText.substring(0, start) + '\t' + rawText.substring(end);
                  setRawText(nextText);
                  setTimeout(() => {
                    target.selectionStart = target.selectionEnd = start + 1;
                  }, 0);
                }
              }}
              placeholder="Fatou Jobe, 7123456&#10;Baboucarr Sallah, 3123456&#10;Modou Lamin Ceesay, 6889900&#10;Lamin Touray, 9912345&#10;Gamtel HQ, 4291224"
              className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-inner"
            />

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Format: <b>Contact Name, Phone Number</b> (separated by comma)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {onProcessRawAndLaunch && (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={!rawText.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <span>Open in App Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyConverted}
              disabled={parsedRecords.length === 0}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Converted Output</span>
                </>
              )}
            </button>

            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 ml-auto cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Conversion Preview */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Live Conversion Stream</span>
            <span className="text-[10px] text-slate-400 font-normal">Real-time Preview</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex-1 flex flex-col justify-between overflow-hidden min-h-[220px]">
            {parsedRecords.length > 0 ? (
              <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                {parsedRecords.slice(0, 6).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        {rec.name || 'Unnamed Contact'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {rec.raw}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {rec.result}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <OperatorLogo operator={rec.operator} className="w-3 h-3" />
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                          {rec.operator}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {parsedRecords.length > 6 && (
                  <div className="text-center py-1 text-[10px] text-slate-400 italic">
                    + {parsedRecords.length - 6} more records parsed
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1.5" />
                <p className="text-xs">Paste contacts on the left to see instant conversion results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
