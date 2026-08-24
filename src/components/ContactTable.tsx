import React, { useRef, useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  UserCheck, 
  Play, 
  GitMerge, 
  UploadCloud, 
  FilterX, 
  RotateCcw,
  CopyCheck,
  Search,
  PhoneOff
} from 'lucide-react';
import { ContactRecord, OperatorName } from '../types';
import { getRelatedContactsForMerge, isMissingPhone } from '../lib/puraEngine';
import { OperatorLogo } from './OperatorLogo';

interface ContactTableProps {
  records: ContactRecord[];
  allRecords?: ContactRecord[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onEdit: (record: ContactRecord) => void;
  onDelete: (id: string) => void;
  onCopyText: (text: string) => void;
  exactDuplicateIds: Set<number>;
  sharedDuplicateIds: Set<number>;
  repeatedDuplicateIds?: Set<number>;
  missingPhoneIds?: Set<number>;
  onLoadSample?: () => void;
  onImportFile?: (content: string, filename: string) => void;
  onMerge?: (contacts: ContactRecord[]) => void;
  onDeleteSelected?: () => void;
  onClearFilters?: () => void;
  onCleanRepeatedNumbers?: (record: ContactRecord) => void;
  onCleanAllRepeatedNumbers?: () => void;
  onDeleteAllMissingPhoneContacts?: () => void;
}

const ALPHABET = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export const ContactTable: React.FC<ContactTableProps> = ({
  records,
  allRecords,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onCopyText,
  exactDuplicateIds,
  sharedDuplicateIds,
  repeatedDuplicateIds,
  missingPhoneIds,
  onLoadSample,
  onImportFile,
  onMerge,
  onDeleteSelected,
  onClearFilters,
  onCleanRepeatedNumbers,
  onCleanAllRepeatedNumbers,
  onDeleteAllMissingPhoneContacts,
}) => {
  const [activeLetterPopup, setActiveLetterPopup] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalLoaded = allRecords ? allRecords.length : records.length;
  const isFilteredEmpty = totalLoaded > 0 && records.length === 0;

  const handleEmptyStateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && onImportFile) {
        onImportFile(content, file.name);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id));
  const someSelected = records.some((r) => selectedIds.has(r.id)) && !allSelected;

  const handleCopy = (id: string, text: string) => {
    onCopyText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLetterJump = (letter: string) => {
    setActiveLetterPopup(letter);
    setTimeout(() => setActiveLetterPopup(null), 700);

    if (!tableContainerRef.current) return;

    if (letter === '#') {
      tableContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Find first contact starting with letter
    const targetElement = document.querySelector(`[data-letter-prefix="${letter}"]`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleMergeForRecord = (record: ContactRecord) => {
    if (!onMerge) return;
    const listToSearch = allRecords || records;
    const sharing = getRelatedContactsForMerge(record, listToSearch);
    if (sharing.length > 1) {
      onMerge(sharing);
    } else {
      const selectedRecords = listToSearch.filter((c) => selectedIds.has(c.id));
      if (selectedRecords.length >= 2) {
        onMerge(selectedRecords);
      } else {
        onMerge([record]);
      }
    }
  };

  const renderOperatorPills = (record: ContactRecord) => {
    if (isMissingPhone(record)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700">
          <PhoneOff className="w-3 h-3 text-slate-400" />
          <span>No Phone</span>
        </span>
      );
    }

    // Extract all numbers or fallback
    let phoneItems = record.phoneNumbers;
    if (!phoneItems || phoneItems.length === 0) {
      const rawParts = (record.raw || record.result || '')
        .split(/[,;\/]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (rawParts.length === 0) {
        phoneItems = [processSingleNumber('', true)];
      } else {
        phoneItems = rawParts.map((p) => processSingleNumber(p, true));
      }
    }

    const validItems = phoneItems.filter((p) => p.cleaned || p.result || p.originalRaw);
    const itemsToProcess = validItems.length > 0 ? validItems : phoneItems;

    interface GroupedPill {
      operator: OperatorName;
      status: ContactStatus;
      baseLabel: string;
      count: number;
      bg: string;
      hasLogo: boolean;
    }

    const groupMap = new Map<string, GroupedPill>();

    itemsToProcess.forEach((p) => {
      const op = p.operator;
      const st = p.status;
      let baseLabel = op as string;
      let bg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

      if (op === 'QCell') {
        bg = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
        baseLabel = st === 'ok' ? 'QCell (+83)' : 'QCell (Standard)';
      } else if (op === 'Comium') {
        bg = 'bg-red-100 dark:bg-red-950/80 text-[#EB222A] dark:text-red-300 border-red-300 dark:border-red-800';
        baseLabel = st === 'ok' ? 'Comium (+86)' : 'Comium (Standard)';
      } else if (op === 'Africell') {
        bg = 'bg-[#9D207E]/15 dark:bg-[#9D207E]/30 text-[#9D207E] dark:text-[#F3B3EB] border-[#9D207E]/30 dark:border-[#9D207E]/50';
        baseLabel = st === 'ok' ? 'Africell (+87)' : 'Africell (Standard)';
      } else if (op === 'Gamcel') {
        bg = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
        baseLabel = 'Gamcel (Phase 2 Deferred)';
      } else if (op === 'Gamtel') {
        bg = 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800';
        baseLabel = 'Gamtel (Phase 2 Deferred)';
      } else if (op === 'International') {
        bg = 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
        baseLabel = 'Foreign International';
      } else if (st === 'review') {
        bg = 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
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

    const groups = Array.from(groupMap.values());

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {groups.map((g, idx) => (
          <span
            key={`${g.operator}-${g.baseLabel}-${idx}`}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${g.bg} whitespace-nowrap shadow-2xs`}
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
    );
  };

  const selectedRecords = (allRecords || records).filter((r) => selectedIds.has(r.id));
  const selectedRepeatedRecords = selectedRecords.filter(
    (r) => r.hasRepeatedNumbers || (repeatedDuplicateIds && repeatedDuplicateIds.has(r.originalIndex))
  );
  const totalRepeatedCount = repeatedDuplicateIds ? repeatedDuplicateIds.size : (allRecords || records).filter((r) => r.hasRepeatedNumbers).length;
  const totalMissingPhoneCount = missingPhoneIds ? missingPhoneIds.size : (allRecords || records).filter((r) => isMissingPhone(r)).length;

  return (
    <div className="space-y-2">
      {/* Missing Phone Numbers Notification Banner */}
      {totalMissingPhoneCount > 0 && onDeleteAllMissingPhoneContacts && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-950 dark:text-rose-200 font-medium">
            <PhoneOff className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              Found <b>{totalMissingPhoneCount}</b> contact{totalMissingPhoneCount > 1 ? 's' : ''} with no telephone number.
            </span>
          </div>
          <button
            type="button"
            onClick={onDeleteAllMissingPhoneContacts}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Empty Contacts ({totalMissingPhoneCount})</span>
          </button>
        </div>
      )}

      {/* Repeated Numbers Notification Banner */}
      {totalRepeatedCount > 0 && onCleanAllRepeatedNumbers && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/80 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-pink-950 dark:text-pink-200 font-medium">
            <CopyCheck className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
            <span>
              Found <b>{totalRepeatedCount}</b> contact{totalRepeatedCount > 1 ? 's' : ''} containing redundant repeated telephone numbers.
            </span>
          </div>
          <button
            type="button"
            onClick={onCleanAllRepeatedNumbers}
            className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean All Repeated Numbers ({totalRepeatedCount})</span>
          </button>
        </div>
      )}

      {/* Floating Multi-select Quick Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>{selectedIds.size} contact{selectedIds.size > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedRepeatedRecords.length > 0 && onCleanRepeatedNumbers && (
              <button
                type="button"
                onClick={() => {
                  selectedRepeatedRecords.forEach((r) => onCleanRepeatedNumbers(r));
                }}
                className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Remove repeated numbers within selected contacts"
              >
                <CopyCheck className="w-3.5 h-3.5" />
                <span>Clean Repeat Numbers ({selectedRepeatedRecords.length})</span>
              </button>
            )}

            {selectedIds.size >= 2 && onMerge && (
              <button
                id="quickMergeBtn"
                onClick={() => onMerge(selectedRecords)}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Merge selected contacts into 1 unified contact"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Merge Selected ({selectedIds.size})</span>
              </button>
            )}

            {onDeleteSelected && (
              <button
                onClick={onDeleteSelected}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={() => onToggleSelectAll(false)}
              className="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-row">
        {/* Table Scroll Area */}
        <div ref={tableContainerRef} className="flex-1 overflow-x-auto max-h-[560px] overflow-y-auto">
          <table id="contactsTable" className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 shadow-xs">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    id="selectAllCheckbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-12 text-slate-500 font-medium">#</th>
                <th className="p-3 font-semibold text-slate-800 dark:text-slate-200">Contact Name</th>
                <th className="p-3 font-semibold text-slate-800 dark:text-slate-200">Original Number</th>
                <th className="p-3 font-semibold text-slate-800 dark:text-slate-200">Upgraded Result</th>
                <th className="p-3 font-semibold text-slate-800 dark:text-slate-200">Status / Network</th>
                <th className="p-3 text-center font-semibold text-slate-800 dark:text-slate-200 w-32">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/80">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    {isFilteredEmpty ? (
                      /* Filter-Aware Empty State */
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto py-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                          <FilterX className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-base text-slate-800 dark:text-slate-100">
                            No matching contacts found
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            No contacts in your {totalLoaded} loaded records match the active search or network filter.
                          </p>
                        </div>
                        {onClearFilters && (
                          <button
                            type="button"
                            onClick={onClearFilters}
                            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Clear All Filters</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* No Contacts Loaded State */
                      <div className="flex flex-col items-center justify-center gap-3.5 max-w-lg mx-auto py-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700/70 border border-blue-100 dark:border-slate-600/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                          <UserCheck className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-base text-slate-800 dark:text-slate-100">
                            No contacts loaded yet
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                            Upload your exported <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[11px]">.vcf</code> or <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[11px]">.csv</code> file, paste raw contacts, or load our pre-built test dataset.
                          </p>
                        </div>
                        {/* Upload vCard / CSV & Sample Contacts Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-3 flex-wrap justify-center">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".vcf,.vcard,.csv,.txt"
                            onChange={handleEmptyStateFileChange}
                            className="hidden"
                            id="emptyStateFileInput"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 transition cursor-pointer"
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload vCard (.vcf) or CSV</span>
                          </button>

                          {onLoadSample && (
                            <button
                              type="button"
                              onClick={onLoadSample}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current text-blue-600 dark:text-blue-400" />
                              <span>Load 20 Sample Contacts</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                records.map((r, index) => {
                  const isSelected = selectedIds.has(r.id);
                  const isExactDuplicate = exactDuplicateIds.has(r.originalIndex);
                  const isSharedNumber = sharedDuplicateIds.has(r.originalIndex);
                  const isRepeatedNumber = r.hasRepeatedNumbers || (repeatedDuplicateIds && repeatedDuplicateIds.has(r.originalIndex));
                  const isMissing = isMissingPhone(r) || (missingPhoneIds && missingPhoneIds.has(r.originalIndex));
                  const firstLetter = (r.name.trim().charAt(0) || '#').toUpperCase();

                  return (
                    <tr
                      key={r.id}
                      data-letter-prefix={firstLetter}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition group ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/40'
                          : isMissing
                          ? 'bg-rose-50/30 dark:bg-rose-950/20'
                          : isExactDuplicate
                          ? 'bg-amber-50/30 dark:bg-amber-950/20'
                          : isSharedNumber
                          ? 'bg-purple-50/20 dark:bg-purple-950/20'
                          : isRepeatedNumber
                          ? 'bg-pink-50/20 dark:bg-pink-950/20'
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(r.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Row Index */}
                      <td className="p-3 text-xs text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      {/* Name */}
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{r.name}</span>
                          {isMissing && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1 shrink-0"
                              title="No telephone number found"
                            >
                              <PhoneOff className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                              <span>No Phone</span>
                            </span>
                          )}
                          {isExactDuplicate && !isMissing && (
                            <button
                              type="button"
                              onClick={() => handleMergeForRecord(r)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900 transition cursor-pointer flex items-center gap-1 shrink-0"
                              title="Multiple entries share the same name & number — click to merge"
                            >
                              <GitMerge className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Duplicate</span>
                            </button>
                          )}
                          {isSharedNumber && !isExactDuplicate && !isMissing && (
                            <button
                              type="button"
                              onClick={() => handleMergeForRecord(r)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900 transition cursor-pointer flex items-center gap-1 shrink-0"
                              title="Different contacts share this phone number — click to merge"
                            >
                              <GitMerge className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                              <span>Shared</span>
                            </button>
                          )}
                          {isRepeatedNumber && !isExactDuplicate && !isSharedNumber && !isMissing && (
                            <button
                              type="button"
                              onClick={() => onCleanRepeatedNumbers && onCleanRepeatedNumbers(r)}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-200 border border-pink-300 dark:border-pink-800 hover:bg-pink-200 dark:hover:bg-pink-900 transition cursor-pointer flex items-center gap-1 shrink-0"
                              title="Contact has repeated identical phone numbers — click to delete redundant numbers"
                            >
                              <CopyCheck className="w-3 h-3 text-pink-600 dark:text-pink-400 shrink-0" />
                              <span>Repeat Number</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Original Raw */}
                      <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {r.raw || <span className="text-slate-300 italic">None</span>}
                      </td>

                      {/* Upgraded Result */}
                      <td className="p-3 font-mono text-xs font-bold text-slate-900 dark:text-emerald-400">
                        <div className="flex items-center gap-2">
                          <span>{r.result}</span>
                          {r.status === 'ok' && (
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                      </td>

                      {/* Status / Operator */}
                      <td className="p-3">
                        {renderOperatorPills(r)}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                          {isRepeatedNumber && onCleanRepeatedNumbers && (
                            <button
                              onClick={() => onCleanRepeatedNumbers(r)}
                              className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900 border border-pink-200 dark:border-pink-800/80 transition cursor-pointer"
                              title="Delete repeated numbers from this contact"
                            >
                              <CopyCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {(isSharedNumber || isExactDuplicate) && (
                            <button
                              onClick={() => handleMergeForRecord(r)}
                              className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 transition cursor-pointer"
                              title="Merge with other contacts sharing this number"
                            >
                              <GitMerge className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleCopy(r.id, r.result)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="Copy upgraded result"
                          >
                            {copiedId === r.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => onEdit(r)}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition cursor-pointer"
                            title="Edit Contact"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition cursor-pointer"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Interactive A-Z Jump Sidebar */}
        <div
          id="azSidebar"
          className="w-7 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col items-center justify-between py-2 select-none text-[10px] font-bold text-slate-500 dark:text-slate-400"
        >
          <button
            onClick={() => handleLetterJump('#')}
            className="hover:text-blue-600 hover:scale-125 transition cursor-pointer"
            title="Scroll to top"
          >
            ▲
          </button>

          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterJump(letter)}
              className="w-full text-center hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 py-0.5 rounded cursor-pointer transition font-mono"
            >
              {letter}
            </button>
          ))}

          <button
            onClick={() => {
              if (tableContainerRef.current) {
                tableContainerRef.current.scrollTo({
                  top: tableContainerRef.current.scrollHeight,
                  behavior: 'smooth',
                });
              }
            }}
            className="hover:text-blue-600 hover:scale-125 transition cursor-pointer"
            title="Scroll to bottom"
          >
            ▼
          </button>
        </div>

        {/* Active Letter Popup Banner Overlay */}
        {activeLetterPopup && (
          <div
            id="azPopup"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-900/90 dark:bg-slate-800/95 text-white text-5xl font-black rounded-2xl flex items-center justify-center z-50 pointer-events-none shadow-2xl backdrop-blur-xs border border-white/10 animate-scale-in"
          >
            {activeLetterPopup}
          </div>
        )}
      </div>
    </div>
  );
};
