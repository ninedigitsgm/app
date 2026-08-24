import React, { useState, useEffect } from 'react';
import { X, GitMerge, Check, AlertCircle, Sparkles } from 'lucide-react';
import { ContactRecord } from '../types';
import { processSingleNumber } from '../lib/puraEngine';

interface MergeContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  isSequential?: boolean;
  groupIndex?: number;
  totalGroups?: number;
  contacts: ContactRecord[];
  onConfirmMerge: (mergedData: { name: string; rawPhone: string }, idsToRemove: string[]) => void;
  includeCountryCode: boolean;
}

export const MergeContactsModal: React.FC<MergeContactsModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  isSequential,
  groupIndex,
  totalGroups,
  contacts,
  onConfirmMerge,
  includeCountryCode,
}) => {
  const [activeContacts, setActiveContacts] = useState<ContactRecord[]>([]);


  useEffect(() => {
    setActiveContacts(contacts);
  }, [contacts, isOpen]);

  // Unique names from active contacts
  const uniqueNames = Array.from(new Set(activeContacts.map((c) => c.name.trim()))).filter(Boolean);
  
  // Suggested combination names
  const slashCombined = uniqueNames.join(' / ');
  const andCombined = uniqueNames.join(' & ');

  // Primary phone number (first valid number found)
  const defaultPhone = activeContacts[0]?.raw || '';

  const [selectedNameMode, setSelectedNameMode] = useState<string>('first');
  const [customName, setCustomName] = useState<string>(uniqueNames[0] || '');
  const [selectedPhone, setSelectedPhone] = useState<string>(defaultPhone);

  useEffect(() => {
    if (uniqueNames.length > 0) {
      setSelectedNameMode(uniqueNames[0]);
      setCustomName(uniqueNames[0]);
      setSelectedPhone(activeContacts[0]?.raw || '');
    }
  }, [activeContacts]);

  if (!isOpen || contacts.length === 0) return null;

  // Handler to remove a contact from the merge pool
  const handleRemoveContact = (id: string) => {
    const updated = activeContacts.filter(c => c.id !== id);
    if (updated.length < 2) {
      onClose();
    } else {
      setActiveContacts(updated);
    }
  };

  // Determine active chosen name
  const finalName =
    selectedNameMode === 'custom'
      ? customName.trim()
      : selectedNameMode === 'slash'
      ? slashCombined
      : selectedNameMode === 'and'
      ? andCombined
      : selectedNameMode;

  // Process preview
  const processedPhone = processSingleNumber(selectedPhone, includeCountryCode);

  const handleMerge = () => {
    if (!finalName || activeContacts.length < 2) return;
    const idsToRemove = activeContacts.map((c) => c.id);
    onConfirmMerge(
      {
        name: finalName,
        rawPhone: selectedPhone,
      },
      idsToRemove
    );
  };

  // Distinct phone numbers among the active contacts
  const uniquePhones = Array.from(new Set(activeContacts.map((c) => c.raw.trim()))).filter(Boolean);

  return (
    <div
      id="mergeModal"
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="closeMergeModalBtn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <GitMerge className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Merge Contacts</span>
                {isSequential && groupIndex !== undefined && totalGroups !== undefined && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Conflict {groupIndex + 1} of {totalGroups}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Combine {activeContacts.length} duplicate / shared records into 1 unified contact
              </p>
            </div>
          </div>
        </div>

        {/* List of Contacts being merged */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Contacts in this Merge Group ({activeContacts.length}):
            </label>
            <span className="text-[11px] text-slate-400">
              Click &times; to exclude any contact
            </span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
            {activeContacts.map((c, i) => (
              <div
                key={`merge-contact-${c.id}-${i}`}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[10px] text-slate-400">#{i + 1}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  <span className="text-slate-500">{c.raw}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    → {c.result}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(c.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-800"
                    title="Exclude this contact from merge"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Choose or Edit Merged Name */}
        <div className="mb-4 space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Choose Name for Merged Contact:
          </label>

          <div className="space-y-1.5 text-xs">
            {/* Individual Names */}
            {uniqueNames.map((name, nIdx) => (
              <label
                key={`opt-name-${nIdx}-${name}`}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                  selectedNameMode === name
                    ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="mergeNameChoice"
                  checked={selectedNameMode === name}
                  onChange={() => {
                    setSelectedNameMode(name);
                    setCustomName(name);
                  }}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="truncate">Keep: <strong className="font-bold">{name}</strong></span>
              </label>
            ))}

            {/* Combined Options if different names */}
            {uniqueNames.length > 1 && (
              <>
                <label
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    selectedNameMode === 'slash'
                      ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mergeNameChoice"
                    checked={selectedNameMode === 'slash'}
                    onChange={() => {
                      setSelectedNameMode('slash');
                      setCustomName(slashCombined);
                    }}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="truncate">Combine with slash: <strong className="font-bold">{slashCombined}</strong></span>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    selectedNameMode === 'and'
                      ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mergeNameChoice"
                    checked={selectedNameMode === 'and'}
                    onChange={() => {
                      setSelectedNameMode('and');
                      setCustomName(andCombined);
                    }}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="truncate">Combine with & : <strong className="font-bold">{andCombined}</strong></span>
                </label>
              </>
            )}

            {/* Custom Edit Option */}
            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                selectedNameMode === 'custom'
                  ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <input
                type="radio"
                name="mergeNameChoice"
                checked={selectedNameMode === 'custom'}
                onChange={() => setSelectedNameMode('custom')}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 mt-1"
              />
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Custom Name:
                </span>
                <input
                  type="text"
                  value={customName}
                  onFocus={() => setSelectedNameMode('custom')}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setSelectedNameMode('custom');
                  }}
                  placeholder="e.g. Fatou Jobe & Family"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Step 2: Phone number if multiple distinct */}
        {uniquePhones.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Primary Phone Number:
            </label>
            <div className="space-y-1.5 text-xs">
              {uniquePhones.map((phone, pIdx) => (
                <label
                  key={`opt-phone-${pIdx}-${phone}`}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer ${
                    selectedPhone === phone
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 font-semibold'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="mergePhoneChoice"
                    checked={selectedPhone === phone}
                    onChange={() => setSelectedPhone(phone)}
                    className="w-3.5 h-3.5 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-mono text-xs">{phone}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Preview of Final Merged Card */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Final Merged Contact Preview:</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {finalName || <span className="text-red-500 italic">Please enter a name</span>}
              </div>
              <div className="font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                Original: {selectedPhone}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {processedPhone.result}
              </div>
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 mt-0.5">
                {processedPhone.operator}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>

          {isSequential && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 transition cursor-pointer"
            >
              Skip Conflict
            </button>
          )}

          <button
            type="button"
            onClick={handleMerge}
            disabled={!finalName}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <GitMerge className="w-4 h-4" />
            <span>Merge into 1 Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};
