import React, { useState, useEffect } from 'react';
import { X, GitMerge, Check, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { ContactRecord } from '../types';
import { processSingleNumber, getCanonicalPhoneKey, processFullContact } from '../lib/puraEngine';

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

function extractUniqueNames(records: ContactRecord[]): string[] {
  return Array.from(new Set(records.map((c) => c.name?.trim()))).filter(Boolean);
}

function extractDistinctPhones(records: ContactRecord[]): string[] {
  const phoneMap = new Map<string, string>();
  records.forEach((c) => {
    const rawList =
      c.phoneNumbers && c.phoneNumbers.length > 0
        ? c.phoneNumbers.map((p) => p.originalRaw || p.result || p.cleaned)
        : (c.raw || '').split(/[,;/|\n]|\s+and\s+|\s+&\s+/i).map((s) => s.trim());

    rawList.filter(Boolean).forEach((num) => {
      const key = getCanonicalPhoneKey(num);
      if (key && !phoneMap.has(key)) {
        phoneMap.set(key, num);
      }
    });
  });
  const list = Array.from(phoneMap.values());
  if (list.length === 0 && records[0]?.raw) {
    list.push(records[0].raw);
  }
  return list;
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
  const [activeContacts, setActiveContacts] = useState<ContactRecord[]>(contacts || []);
  const [isMerging, setIsMerging] = useState(false);

  // Derive initial values from contacts directly
  const initialNames = extractUniqueNames(contacts || []);
  const initialPhones = extractDistinctPhones(contacts || []);

  const [selectedNameMode, setSelectedNameMode] = useState<string>(initialNames[0] || '');
  const [customName, setCustomName] = useState<string>(initialNames[0] || '');
  const [selectedPhone, setSelectedPhone] = useState<string>(initialPhones[0] || '');

  // Synchronize state directly when contacts or modal open state changes
  useEffect(() => {
    setActiveContacts(contacts || []);
    setIsMerging(false);
    const freshNames = extractUniqueNames(contacts || []);
    const freshPhones = extractDistinctPhones(contacts || []);
    const defaultName = freshNames[0] || '';
    setSelectedNameMode(defaultName);
    setCustomName(defaultName);
    setSelectedPhone(freshPhones[0] || '');
  }, [contacts, isOpen]);

  // Unique names from currently active contacts
  const uniqueNames = extractUniqueNames(activeContacts);
  const slashCombined = uniqueNames.join(' / ');
  const andCombined = uniqueNames.join(' & ');

  // Distinct phone numbers extracted from active contacts
  const distinctPhones = extractDistinctPhones(activeContacts);
  const combinedPhones = distinctPhones.join(', ');

  if (!isOpen || !contacts || contacts.length === 0) return null;

  // Handler to remove a contact from the merge pool
  const handleRemoveContact = (id: string) => {
    const updated = activeContacts.filter(c => c.id !== id);
    if (updated.length < 2) {
      onClose();
    } else {
      setActiveContacts(updated);
      const updatedNames = extractUniqueNames(updated);
      const updatedPhones = extractDistinctPhones(updated);
      if (
        !updatedNames.includes(selectedNameMode) &&
        selectedNameMode !== 'slash' &&
        selectedNameMode !== 'and' &&
        selectedNameMode !== 'custom'
      ) {
        setSelectedNameMode(updatedNames[0] || '');
        setCustomName(updatedNames[0] || '');
      }
      if (!updatedPhones.includes(selectedPhone) && selectedPhone !== updatedPhones.join(', ')) {
        setSelectedPhone(updatedPhones[0] || '');
      }
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

  // Preview full contact record result
  const previewContact = processFullContact(
    finalName || 'Preview',
    selectedPhone,
    includeCountryCode
  );

  const handleMerge = () => {
    if (!finalName || activeContacts.length < 2 || isMerging) return;
    setIsMerging(true);
    const idsToRemove = activeContacts.map((c) => c.id);
    onConfirmMerge(
      {
        name: finalName,
        rawPhone: selectedPhone,
      },
      idsToRemove
    );
    setIsMerging(false);
  };

  // Distinct phone numbers among the active contacts
  const uniquePhones = Array.from(new Set(activeContacts.map((c) => c.raw.trim()))).filter(Boolean);

  return (
    <div
      id="mergeModal"
      className="fixed inset-0 bg-slate-900/75 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 z-60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed (No Scroll) */}
        <div className="p-3.5 sm:px-5 sm:py-3.5 border-b border-slate-200 dark:border-slate-700/80 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
              <GitMerge className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Merge Contacts
                </h3>
                {isSequential && groupIndex !== undefined && totalGroups !== undefined && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                    Conflict {groupIndex} of {totalGroups}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Consolidating {activeContacts.length} duplicate records into 1 unified contact
              </p>
            </div>
          </div>

          <button
            id="closeMergeModalBtn"
            onClick={onClose}
            aria-label="Close merge wizard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white dark:bg-slate-900 overscroll-contain">
          {/* List of Contacts in Merge Group */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Contacts in this Conflict ({activeContacts.length}):
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Click &times; to exclude
              </span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              {activeContacts.map((c, i) => (
                <div
                  key={`merge-contact-${c.id}-${i}`}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">#{i + 1}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] hidden sm:inline">{c.raw}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {c.result}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(c.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-800 ml-1"
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
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Choose Name for Merged Contact:
            </label>

            <div className="space-y-1.5 text-xs">
              {/* Individual Names */}
              {uniqueNames.map((name, nIdx) => (
                <label
                  key={`opt-name-${nIdx}-${name}`}
                  className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition ${
                    selectedNameMode === name
                      ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-semibold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
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
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 shrink-0"
                  />
                  <span className="truncate">Keep: <strong className="font-bold">{name}</strong></span>
                </label>
              ))}

              {/* Combined Options if different names */}
              {uniqueNames.length > 1 && (
                <>
                  <label
                    className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition ${
                      selectedNameMode === 'slash'
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
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
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 shrink-0"
                    />
                    <span className="truncate">Combine with slash: <strong className="font-bold">{slashCombined}</strong></span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition ${
                      selectedNameMode === 'and'
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
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
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 shrink-0"
                    />
                    <span className="truncate">Combine with & : <strong className="font-bold">{andCombined}</strong></span>
                  </label>
                </>
              )}

              {/* Custom Edit Option */}
              <label
                className={`flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition ${
                  selectedNameMode === 'custom'
                    ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <input
                  type="radio"
                  name="mergeNameChoice"
                  checked={selectedNameMode === 'custom'}
                  onChange={() => setSelectedNameMode('custom')}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 mt-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
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

          {/* Step 2: Phone number choices */}
          {distinctPhones.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Phone Number(s):
              </label>
              <div className="space-y-1.5 text-xs">
                {distinctPhones.map((phone, pIdx) => (
                  <label
                    key={`opt-phone-${pIdx}-${phone}`}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                      selectedPhone === phone
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 font-semibold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mergePhoneChoice"
                      checked={selectedPhone === phone}
                      onChange={() => setSelectedPhone(phone)}
                      className="w-3.5 h-3.5 text-purple-600 focus:ring-purple-500 shrink-0"
                    />
                    <span className="font-mono text-xs truncate">{phone}</span>
                  </label>
                ))}

                <label
                  className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition ${
                    selectedPhone === combinedPhones
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 font-semibold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="mergePhoneChoice"
                    checked={selectedPhone === combinedPhones}
                    onChange={() => setSelectedPhone(combinedPhones)}
                    className="w-3.5 h-3.5 text-purple-600 focus:ring-purple-500 shrink-0"
                  />
                  <span className="font-mono text-xs text-purple-700 dark:text-purple-300 truncate">
                    Combine all numbers ({combinedPhones})
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Preview of Final Merged Card */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/90 dark:border-purple-900/70 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Final Merged Contact Preview:</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm truncate">
                  {finalName || <span className="text-red-500 italic">Please enter a name</span>}
                </div>
                <div className="font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate text-[11px]">
                  Original: {selectedPhone}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                  {previewContact.result}
                </div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200/90 dark:bg-purple-900 text-purple-900 dark:text-purple-200 mt-0.5">
                  {previewContact.operator}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer - Always visible, never scrolled */}
        <div className="p-3 sm:px-5 sm:py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="cancelMergeBtn"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition cursor-pointer shadow-2xs"
            >
              Cancel
            </button>

            {isSequential && onSkip && (
              <button
                type="button"
                id="skipConflictBtn"
                onClick={onSkip}
                className="px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 transition cursor-pointer shadow-2xs"
              >
                Skip Conflict
              </button>
            )}
          </div>

          <button
            type="button"
            id="confirmMergeBtn"
            onClick={handleMerge}
            disabled={!finalName || isMerging}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isMerging
                ? 'bg-purple-500 cursor-wait text-white/90'
                : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-sm hover:shadow-md active:scale-98'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <GitMerge className="w-4 h-4 shrink-0" />
            <span>Merge into 1 Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
};
