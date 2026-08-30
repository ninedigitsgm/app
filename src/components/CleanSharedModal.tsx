import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Split
} from 'lucide-react';
import { MergeStrategy } from '../lib/puraEngine';

interface CleanSharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalSharedCount: number;
  sharedGroupsCount: number;
  sampleGroup?: { phone: string; names: string[] } | null;
  onConfirm: (strategy: MergeStrategy) => void;
  isLoading?: boolean;
}

export const CleanSharedModal: React.FC<CleanSharedModalProps> = ({
  isOpen,
  onClose,
  totalSharedCount,
  sharedGroupsCount,
  sampleGroup,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<MergeStrategy>('first');

  if (!isOpen) return null;

  const sampleNames = sampleGroup && sampleGroup.names.length >= 2 
    ? sampleGroup.names 
    : ['Fatoumatta Jallow', 'Fatou Jallow', 'F. Jallow'];

  const getResultPreview = (strat: MergeStrategy): string => {
    if (strat === 'first') return sampleNames[0] || '1st Contact Name';
    if (strat === 'second') return sampleNames[1] || sampleNames[0] || '2nd Contact Name';
    if (strat === 'and') return sampleNames.slice(0, 3).join(' & ');
    if (strat === 'slash') return sampleNames.slice(0, 3).join(' / ');
    return sampleNames[0];
  };

  const options: Array<{
    id: MergeStrategy;
    title: string;
    description: string;
    badge?: string;
    preview: string;
  }> = [
    {
      id: 'first',
      title: '1st Contact Name',
      description: 'Preserves the earliest contact name in the group and discards other aliases.',
      badge: 'Default / Recommended',
      preview: getResultPreview('first'),
    },
    {
      id: 'second',
      title: '2nd Contact Name',
      description: 'Preserves the second contact name in the group (or fallback if single alias).',
      preview: getResultPreview('second'),
    },
    {
      id: 'and',
      title: 'Combine with " & "',
      description: 'Merges all distinct names into one unified contact entry using an ampersand.',
      preview: getResultPreview('and'),
    },
    {
      id: 'slash',
      title: 'Combine with " / "',
      description: 'Merges all distinct names into one unified contact entry using a forward slash.',
      preview: getResultPreview('slash'),
    },
  ];

  return (
    <div className="fixed inset-0 z-[210] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg my-auto max-h-[85vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Clean Shared Contacts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Merge contacts that share identical phone lines
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Notice */}
        <div className="px-4 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            Found <b>{totalSharedCount}</b> contacts across <b>{sharedGroupsCount}</b> shared telephone group{sharedGroupsCount === 1 ? '' : 's'}.
          </span>
        </div>

        {/* Content Body / Options */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] space-y-3.5 bg-slate-50/40 dark:bg-slate-900/40">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Select Name Merge Option:
          </label>

          <div className="space-y-2.5">
            {options.map((opt) => {
              const isSelected = selectedStrategy === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedStrategy(opt.id)}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {opt.title}
                      </span>
                    </div>

                    {opt.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {opt.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 ml-6.5 leading-relaxed">
                    {opt.description}
                  </p>

                  {/* Sample Outcome preview */}
                  <div className="mt-2.5 ml-6.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold uppercase">
                      Preview:
                    </span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">
                      "{opt.preview}"
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real Live Transformation Preview */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-[11px]">
              <Split className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Example Transformation (Sample Group):</span>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-500 dark:text-slate-400 line-through">
                {sampleNames.join(', ')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {getResultPreview(selectedStrategy)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(selectedStrategy)}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <span className="loader text-white shrink-0" />
                <span>Merging...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Clean & Merge Shared ({sharedGroupsCount})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
