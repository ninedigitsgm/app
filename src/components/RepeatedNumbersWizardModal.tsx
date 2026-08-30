import React, { useState } from 'react';
import { CopyCheck, Trash2, CheckCircle2, Sparkles, X, UserCheck, ShieldAlert } from 'lucide-react';
import { ContactRecord, RepeatedGroup } from '../types';
import { getCanonicalPhoneKey, processFullContact } from '../lib/puraEngine';

interface RepeatedNumbersWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  repeatedGroups: RepeatedGroup[];
  allRecords: ContactRecord[];
  onSaveContactPhones: (contactId: string, updatedRawPhone: string) => void;
  onCleanAllRepeated: () => void;
  includeCountryCode: boolean;
}

export const RepeatedNumbersWizardModal: React.FC<RepeatedNumbersWizardModalProps> = ({
  isOpen,
  onClose,
  repeatedGroups,
  allRecords,
  onSaveContactPhones,
  onCleanAllRepeated,
  includeCountryCode,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!isOpen || repeatedGroups.length === 0) return null;

  const activeIndex = Math.min(currentIdx, repeatedGroups.length - 1);
  const currentGroup = repeatedGroups[activeIndex];
  const targetRecord = allRecords.find((r) => r.id === currentGroup.contactId) || allRecords[currentGroup.contactIndex];

  if (!targetRecord) return null;

  // Split raw phone numbers into individual segments
  const rawParts = (targetRecord.raw || '')
    .split(/[,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Identify which ones are redundant
  const seenKeys = new Set<string>();
  const classifiedParts: Array<{ phone: string; isDuplicate: boolean; key: string }> = [];

  rawParts.forEach((part) => {
    const key = getCanonicalPhoneKey(part);
    if (!key) {
      classifiedParts.push({ phone: part, isDuplicate: false, key: '' });
      return;
    }
    if (seenKeys.has(key)) {
      classifiedParts.push({ phone: part, isDuplicate: true, key });
    } else {
      seenKeys.add(key);
      classifiedParts.push({ phone: part, isDuplicate: false, key });
    }
  });

  const handleNext = () => {
    if (activeIndex < repeatedGroups.length - 1) {
      setCurrentIdx(activeIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setCurrentIdx(activeIndex - 1);
    }
  };

  const handleCleanCurrent = () => {
    // Keep only unique numbers
    const uniqueList: string[] = [];
    const seen = new Set<string>();
    rawParts.forEach((part) => {
      const key = getCanonicalPhoneKey(part);
      if (key) {
        if (!seen.has(key)) {
          seen.add(key);
          uniqueList.push(part);
        }
      } else {
        uniqueList.push(part);
      }
    });

    const newRaw = uniqueList.join(', ');
    onSaveContactPhones(targetRecord.id, newRaw);

    if (repeatedGroups.length <= 1) {
      onClose();
    }
  };

  const previewCleanedRecord = processFullContact(
    targetRecord.name,
    classifiedParts.filter((p) => !p.isDuplicate).map((p) => p.phone).join(', '),
    includeCountryCode,
    targetRecord.originalIndex,
    targetRecord.id
  );

  return (
    <div
      id="repeatedNumbersWizardModal"
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
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 shrink-0">
              <CopyCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Repeated Numbers Wizard
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 shrink-0">
                  Entry {activeIndex + 1} of {repeatedGroups.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Remove internal duplicate numbers saved inside a single contact card
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close repeated numbers wizard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900 overscroll-contain">
          {/* Target Contact Summary */}
          <div className="p-3 rounded-xl bg-pink-50/80 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/60">
            <div className="text-xs font-semibold text-pink-900 dark:text-pink-300 mb-1">
              Flagged Contact Entry:
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {targetRecord.name || 'Untitled Contact'}
              </span>
              <span className="text-[11px] font-bold text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/50 px-2 py-0.5 rounded-md">
                {rawParts.length} Phone Numbers Stored
              </span>
            </div>
          </div>

          {/* Numbers Inspection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Numbers Found Inside This Contact:
            </label>
            <div className="space-y-2">
              {classifiedParts.map((item, idx) => (
                <div
                  key={`repeated-part-${idx}-${item.phone}`}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    item.isDuplicate
                      ? 'border-pink-300 dark:border-pink-900 bg-pink-50/60 dark:bg-pink-950/40 text-pink-900 dark:text-pink-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-slate-400 text-[11px]">#{idx + 1}</span>
                    <span className="font-mono font-bold">{item.phone}</span>
                  </div>
                  <div className="shrink-0">
                    {item.isDuplicate ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                        <Trash2 className="w-3 h-3" />
                        <span>Duplicate / Remove</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Keep Primary</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cleaned Result Preview */}
          <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/90 dark:border-purple-900/70 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cleaned Contact Preview:</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-800/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {previewCleanedRecord.name}
                </div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs truncate">
                  {previewCleanedRecord.result}
                </div>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200/80 dark:bg-purple-900 text-purple-900 dark:text-purple-200 shrink-0">
                {previewCleanedRecord.operator}
              </span>
            </div>
          </div>

          {/* Bulk Action Tip */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2">
            <div className="text-slate-600 dark:text-slate-300">
              Clean all {repeatedGroups.length} contacts with repeated numbers?
            </div>
            <button
              onClick={() => {
                onCleanAllRepeated();
                onClose();
              }}
              className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Clean All Now</span>
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
              disabled={activeIndex >= repeatedGroups.length - 1}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Skip
            </button>
          </div>

          <button
            type="button"
            onClick={handleCleanCurrent}
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md active:scale-98 transition"
          >
            <CopyCheck className="w-4 h-4 shrink-0" />
            <span>Clean Redundant Numbers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
