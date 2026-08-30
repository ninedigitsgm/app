import React, { useState } from 'react';
import { Layers, Trash2, CheckCircle2, ChevronRight, Sparkles, X, ArrowRight, UserCheck } from 'lucide-react';
import { ContactRecord } from '../types';

interface ExactDuplicateGroup {
  key: string;
  indices: number[];
  name: string;
  phone: string;
}

interface ExactDuplicateWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: ExactDuplicateGroup[];
  allRecords: ContactRecord[];
  onKeepRecord: (groupKey: string, keepRecordId: string, removeRecordIds: string[]) => void;
  onBulkResolveAll: () => void;
  includeCountryCode: boolean;
}

export const ExactDuplicateWizardModal: React.FC<ExactDuplicateWizardModalProps> = ({
  isOpen,
  onClose,
  groups,
  allRecords,
  onKeepRecord,
  onBulkResolveAll,
}) => {
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [selectedKeepId, setSelectedKeepId] = useState<string>('');

  if (!isOpen || groups.length === 0) return null;

  // Safe boundary
  const activeIndex = Math.min(currentGroupIdx, groups.length - 1);
  const currentGroup = groups[activeIndex];

  // Records for this group
  const groupRecords = currentGroup.indices
    .map((idx) => allRecords[idx])
    .filter((r): r is ContactRecord => Boolean(r));

  // Determine the record with the most phone numbers
  const getPhoneCount = (r: ContactRecord) => {
    if (r.phoneNumbers && r.phoneNumbers.length > 0) return r.phoneNumbers.length;
    if (r.raw) return r.raw.split(/[,;/]/).length;
    return 1;
  };

  const maxPhoneCount = Math.max(...groupRecords.map(getPhoneCount), 1);

  // If selectedKeepId is not in groupRecords, default to the record with the most numbers (first in groupRecords)
  const currentKeepId = groupRecords.some((r) => r.id === selectedKeepId)
    ? selectedKeepId
    : groupRecords[0]?.id || '';

  const handleNext = () => {
    setSelectedKeepId('');
    if (activeIndex < groups.length - 1) {
      setCurrentGroupIdx(activeIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setSelectedKeepId('');
    if (activeIndex > 0) {
      setCurrentGroupIdx(activeIndex - 1);
    }
  };

  const handleResolveCurrent = () => {
    const keepId = currentKeepId;
    const removeIds = groupRecords.filter((r) => r.id !== keepId).map((r) => r.id);
    onKeepRecord(currentGroup.key, keepId, removeIds);
    setSelectedKeepId('');

    if (groups.length <= 1) {
      onClose();
    }
  };

  return (
    <div
      id="exactDuplicateWizardModal"
      className="fixed inset-0 bg-slate-900/75 dark:bg-slate-950/85 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto z-[200]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-xl my-auto shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-slate-700/80 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Exact Duplicates Wizard
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                  Conflict {activeIndex + 1} of {groups.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Identical name & phone repeated across multiple entries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close exact duplicates wizard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900 overscroll-contain">
          {/* Target Info */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
            <div className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
              Duplicate Match:
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentGroup.name || 'Untitled Contact'}
              </span>
              <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-md">
                {currentGroup.phone}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/70 mt-1">
              {groupRecords.length} duplicate records found. Choose which copy to retain and discard the rest.
            </p>
          </div>

          {/* List of Copies */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select which copy to keep:
            </span>
            <div className="space-y-2">
              {groupRecords.map((rec, rIdx) => {
                const isSelected = currentKeepId === rec.id;
                return (
                  <div
                    key={`exact-copy-${rec.id}-${rIdx}`}
                    onClick={() => setSelectedKeepId(rec.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="keep_record"
                          checked={isSelected}
                          onChange={() => setSelectedKeepId(rec.id)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                          <span>Copy #{rIdx + 1}</span>
                          <span className="text-[10px] font-normal text-slate-400">(Index {rec.originalIndex + 1})</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            getPhoneCount(rec) === maxPhoneCount && maxPhoneCount > 1
                              ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {getPhoneCount(rec)} {getPhoneCount(rec) === 1 ? 'phone' : 'phones'}
                            {getPhoneCount(rec) === maxPhoneCount && maxPhoneCount > 1 ? ' (Most Complete)' : ''}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                              Will Keep
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          Name: <span className="font-semibold">{rec.name || 'Blank Name'}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {rec.result || rec.raw}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Retain</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-1 rounded-lg border border-red-200 dark:border-red-800">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Bulk Action Tip */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2">
            <div className="text-slate-600 dark:text-slate-300">
              Want to remove all {groups.length} exact duplicates at once?
            </div>
            <button
              onClick={() => {
                onBulkResolveAll();
                onClose();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Resolve All</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 sm:py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex >= groups.length - 1}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Skip
            </button>
          </div>

          <button
            type="button"
            onClick={handleResolveCurrent}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md active:scale-98 transition"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Keep Selected & Remove Duplicates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
