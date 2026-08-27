import React, { useState } from 'react';
import { PhoneOff, Trash2, Edit3, Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { ContactRecord } from '../types';

interface MissingPhoneGroup {
  contactIndex: number;
  contactId: string;
  name: string;
}

interface MissingPhoneWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingGroups: MissingPhoneGroup[];
  allRecords: ContactRecord[];
  onAddPhoneToContact: (contactId: string, phone: string) => void;
  onDeleteContact: (contactId: string) => void;
  onPurgeAllMissing: () => void;
  includeCountryCode: boolean;
}

export const MissingPhoneWizardModal: React.FC<MissingPhoneWizardModalProps> = ({
  isOpen,
  onClose,
  missingGroups,
  allRecords,
  onAddPhoneToContact,
  onDeleteContact,
  onPurgeAllMissing,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputPhone, setInputPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  if (!isOpen || missingGroups.length === 0) return null;

  const activeIndex = Math.min(currentIdx, missingGroups.length - 1);
  const currentGroup = missingGroups[activeIndex];
  const targetRecord = allRecords.find((r) => r.id === currentGroup.contactId) || allRecords[currentGroup.contactIndex];

  if (!targetRecord) return null;

  const handleNext = () => {
    setInputPhone('');
    setPhoneError('');
    if (activeIndex < missingGroups.length - 1) {
      setCurrentIdx(activeIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setInputPhone('');
    setPhoneError('');
    if (activeIndex > 0) {
      setCurrentIdx(activeIndex - 1);
    }
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputPhone.trim();
    if (!trimmed) {
      setPhoneError('Please enter a valid phone number or choose Delete.');
      return;
    }
    onAddPhoneToContact(targetRecord.id, trimmed);
    setInputPhone('');
    setPhoneError('');

    if (missingGroups.length <= 1) {
      onClose();
    }
  };

  const handleDeleteCurrent = () => {
    onDeleteContact(targetRecord.id);
    setInputPhone('');
    setPhoneError('');

    if (missingGroups.length <= 1) {
      onClose();
    }
  };

  return (
    <div
      id="missingPhoneWizardModal"
      className="fixed inset-0 bg-slate-900/75 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 z-60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-slate-700/80 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <PhoneOff className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Missing Phone Wizard
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                  Contact {activeIndex + 1} of {missingGroups.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Resolve contacts with blank or missing telephone numbers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close missing phone wizard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900 overscroll-contain">
          {/* Target Info */}
          <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
            <div className="text-xs font-semibold text-rose-900 dark:text-rose-300 mb-1">
              Contact Without Number:
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {targetRecord.name || 'Untitled Contact'}
              </span>
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-md">
                No telephone number stored
              </span>
            </div>
            <p className="text-[11px] text-rose-800/80 dark:text-rose-300/70 mt-1">
              This contact cannot be formatted for 9-digit Gambian dialling without a phone number. Provide a number or delete the record.
            </p>
          </div>

          {/* Option A: Assign / Add Phone Number */}
          <form onSubmit={handleSavePhone} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Option A: Provide Phone Number</span>
            </div>

            <div>
              <input
                type="text"
                value={inputPhone}
                onChange={(e) => {
                  setInputPhone(e.target.value);
                  setPhoneError('');
                }}
                placeholder="e.g. 7123456 or 3012345 or +220..."
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-mono"
              />
              {phoneError && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {phoneError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Upgrade Number</span>
            </button>
          </form>

          {/* Option B: Delete This Contact Record */}
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-red-900 dark:text-red-300">
                Option B: Remove Contact Entry
              </div>
              <div className="text-[11px] text-red-700/80 dark:text-red-300/70">
                Delete "{targetRecord.name || 'Untitled'}" from your contact list.
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Contact</span>
            </button>
          </div>

          {/* Bulk Purge Action Tip */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2">
            <div className="text-slate-600 dark:text-slate-300">
              Delete all {missingGroups.length} contacts missing numbers at once?
            </div>
            <button
              onClick={() => {
                onPurgeAllMissing();
                onClose();
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs transition flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Purge All</span>
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
              disabled={activeIndex >= missingGroups.length - 1}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Skip
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer transition"
          >
            Finish / Close
          </button>
        </div>
      </div>
    </div>
  );
};
