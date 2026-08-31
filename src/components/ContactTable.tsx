import React, { useRef, useState, useMemo } from 'react';
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
  PhoneOff,
  Eye,
  ArrowLeftRight
} from 'lucide-react';
import { ContactRecord, OperatorName, ContactStatus, FilterOption, DuplicateAnalysisResult } from '../types';
import { getRelatedContactsForMerge, isMissingPhone, processSingleNumber } from '../lib/puraEngine';
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
  onCleanAllSharedNumbers?: () => void;
  onRemoveExactDuplicates?: () => void;
  filterOption?: FilterOption;
  onFilterChange?: (filter: FilterOption) => void;
  isLoading?: boolean;
  searchQuery?: string;
  modifiedContactIds?: Set<string>;
  onClearModifiedHighlights?: () => void;
  duplicateAnalysis?: DuplicateAnalysisResult;
  onOpenDuplicateAnalysis?: () => void;
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
  onCleanAllSharedNumbers,
  onRemoveExactDuplicates,
  filterOption = 'all',
  onFilterChange,
  isLoading = false,
  searchQuery = '',
  modifiedContactIds,
  onClearModifiedHighlights,
  onOpenDuplicateAnalysis,
}) => {
  const [activeLetterPopup, setActiveLetterPopup] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to highlight matching search query segments
  const highlightText = (text: string, query: string) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-200 dark:bg-amber-500/40 text-slate-900 dark:text-amber-200 px-0.5 rounded-sm font-bold shadow-2xs"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const totalLoaded = allRecords ? allRecords.length : records.length;
  const isFilteredEmpty = totalLoaded > 0 && records.length === 0;

  const handleEmptyStateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
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

  const validModifiedCount = useMemo(() => {
    if (!modifiedContactIds || modifiedContactIds.size === 0) return 0;
    let count = 0;
    records.forEach((r) => {
      if (modifiedContactIds.has(r.id)) count++;
    });
    return count;
  }, [records, modifiedContactIds]);

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
        .split(/[,]/)
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
        baseLabel = (st === 'ok' || st === 'already') ? 'QCell (+83)' : 'QCell (Standard)';
      } else if (op === 'Comium') {
        bg = 'bg-red-100 dark:bg-red-950/80 text-[#EB222A] dark:text-red-300 border-red-300 dark:border-red-800';
        baseLabel = (st === 'ok' || st === 'already') ? 'Comium (+86)' : 'Comium (Standard)';
      } else if (op === 'Africell') {
        bg = 'bg-[#9D207E]/15 dark:bg-[#9D207E]/30 text-[#9D207E] dark:text-[#F3B3EB] border-[#9D207E]/30 dark:border-[#9D207E]/50';
        baseLabel = (st === 'ok' || st === 'already') ? 'Africell (+87)' : 'Africell (Standard)';
      } else if (op === 'Gamcel') {
        bg = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
        baseLabel = 'Gamcel (Phase 1 Deferred (7-Digit))';
      } else if (op === 'Gamtel') {
        bg = 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800';
        baseLabel = 'Gamtel (Phase 1 Deferred (7-Digit))';
      } else if (op === 'International') {
        bg = 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
        baseLabel = 'Foreign / International';
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
  const totalSharedCount = sharedDuplicateIds ? sharedDuplicateIds.size : 0;
  const totalExactCount = exactDuplicateIds ? exactDuplicateIds.size : 0;

  return (
    <div className="space-y-2">
      {/* 1. Exact Duplicates (Same Name & Same Number) Notification Banner */}
      {totalExactCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-xs shadow-xs animate-in fade-in text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-950 dark:text-amber-200 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Found <b>{totalExactCount}</b> exact duplicate contact{totalExactCount > 1 ? 's' : ''} (same name &amp; same phone number).
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onFilterChange?.(filterOption === 'duplicate-exact' ? 'all' : 'duplicate-exact')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap ${
                filterOption === 'duplicate-exact'
                  ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-100'
                  : 'bg-white hover:bg-slate-50 border-amber-200 text-amber-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>{filterOption === 'duplicate-exact' ? 'Showing Filtered' : 'View Contacts'}</span>
            </button>
            {onRemoveExactDuplicates && (
              <button
                type="button"
                onClick={onRemoveExactDuplicates}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
                title="Automatically deduplicate exact duplicate contacts, keeping 1 clean copy of each"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Auto-Deduplicate ({totalExactCount})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Shared Numbers Notification Banner */}
      {totalSharedCount > 0 && onCleanAllSharedNumbers && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs shadow-xs animate-in fade-in text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-950 dark:text-indigo-200 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Found <b>{totalSharedCount}</b> contact{totalSharedCount > 1 ? 's' : ''} with the same telephone number.
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onFilterChange?.(filterOption === 'duplicate-shared' ? 'all' : 'duplicate-shared')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap ${
                filterOption === 'duplicate-shared'
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-900 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-100'
                  : 'bg-white hover:bg-slate-50 border-indigo-200 text-indigo-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>{filterOption === 'duplicate-shared' ? 'Showing Filtered' : 'View Contacts'}</span>
            </button>
            <button
              type="button"
              onClick={onCleanAllSharedNumbers}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
              title="Bulk merge shared duplicate contacts keeping the 1st contact name"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Clean Shared ({totalSharedCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Missing Phone Numbers Notification Banner */}
      {totalMissingPhoneCount > 0 && onDeleteAllMissingPhoneContacts && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-xs shadow-xs animate-in fade-in text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-rose-950 dark:text-rose-200 font-medium">
            <PhoneOff className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              Found <b>{totalMissingPhoneCount}</b> contact{totalMissingPhoneCount > 1 ? 's' : ''} with no telephone number.
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onFilterChange?.(filterOption === 'missing-phone' ? 'all' : 'missing-phone')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap ${
                filterOption === 'missing-phone'
                  ? 'bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-100'
                  : 'bg-white hover:bg-slate-50 border-rose-200 text-rose-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>{filterOption === 'missing-phone' ? 'Showing Filtered' : 'View Contacts'}</span>
            </button>
            <button
              type="button"
              onClick={onDeleteAllMissingPhoneContacts}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Delete All ({totalMissingPhoneCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Repeated Numbers Notification Banner */}
      {totalRepeatedCount > 0 && onCleanAllRepeatedNumbers && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800/80 text-xs shadow-xs animate-in fade-in text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-pink-950 dark:text-pink-200 font-medium">
            <CopyCheck className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
            <span>
              Found <b>{totalRepeatedCount}</b> contact{totalRepeatedCount > 1 ? 's' : ''} containing redundant repeated telephone numbers.
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onFilterChange?.(filterOption === 'repeated-number' ? 'all' : 'repeated-number')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap ${
                filterOption === 'repeated-number'
                  ? 'bg-pink-100 border-pink-300 text-pink-900 dark:bg-pink-900/40 dark:border-pink-700 dark:text-pink-100'
                  : 'bg-white hover:bg-slate-50 border-pink-200 text-pink-700 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/60'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>{filterOption === 'repeated-number' ? 'Showing Filtered' : 'View Contacts'}</span>
            </button>
            <button
              type="button"
              onClick={onCleanAllRepeatedNumbers}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>Clean All ({totalRepeatedCount})</span>
            </button>
          </div>
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

      {/* Analyze Duplicates & Conflicts Button (Underneath Found Suggestions) */}
      {onOpenDuplicateAnalysis && (allRecords || records).length > 0 && (
        <div className="pt-0.5 pb-1">
          <button
            id="analyzeDuplicatesBtn"
            type="button"
            onClick={onOpenDuplicateAnalysis}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center justify-between sm:justify-start gap-2.5 shadow-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CopyCheck className="w-4 h-4 shrink-0" />
              <span>Analyze All Duplicates and Conflict Categories</span>
            </div>
            {totalExactCount + totalSharedCount + totalRepeatedCount + totalMissingPhoneCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 text-[10px] font-bold shadow-xs">
                {totalExactCount + totalSharedCount + totalRepeatedCount + totalMissingPhoneCount} flagged
              </span>
            )}
          </button>
        </div>
      )}

      <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Modified Contacts Notice Banner */}
        {validModifiedCount > 0 && (
          <div className="bg-red-50/90 dark:bg-red-950/40 border-b border-red-100 dark:border-red-900/50 px-3.5 py-1.5 text-xs text-red-900 dark:text-red-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span>
                <b>{validModifiedCount}</b> contact{validModifiedCount === 1 ? '' : 's'} updated by recent action highlighted in <b>faint red</b>.
              </span>
            </div>
            {onClearModifiedHighlights && (
              <button
                type="button"
                onClick={onClearModifiedHighlights}
                className="text-[11px] font-bold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline cursor-pointer shrink-0"
              >
                Dismiss Highlights
              </button>
            )}
          </div>
        )}

        {/* Mobile & Tablet Horizontal Scroll Guidance Banner */}
        {records.length > 0 && !isLoading && (
          <div className="lg:hidden bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 px-3.5 py-2 text-[11px] sm:text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" />
              <span>
                Scroll/slide left and right to view other columns such as <b>Upgraded result</b>, <b>Status/Network</b>, and <b>Actions</b>.
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-row flex-1 overflow-hidden">
          {records.length === 0 && !isLoading ? (
          /* Dedicated Centered Empty State Container */
          <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
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
                      <span>Load Sample Contacts</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Table Scroll Area */
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
                {isLoading ? (
                  [1, 2, 3, 4, 5, 6].map((n) => (
                    <tr key={`skeleton-${n}`} className="animate-pulse">
                      <td className="p-3 text-center">
                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                      </td>
                      <td className="p-3">
                        <div className="w-6 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                      </td>
                      <td className="p-3">
                        <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    {records.map((r, index) => {
                  const isSelected = selectedIds.has(r.id);
                  const isModified = modifiedContactIds ? modifiedContactIds.has(r.id) : false;
                  const isExactDuplicate = exactDuplicateIds.has(r.originalIndex);
                  const isSharedNumber = sharedDuplicateIds.has(r.originalIndex);
                  const isRepeatedNumber = r.hasRepeatedNumbers || (repeatedDuplicateIds && repeatedDuplicateIds.has(r.originalIndex));
                  const isMissing = isMissingPhone(r) || (missingPhoneIds && missingPhoneIds.has(r.originalIndex));
                  const firstLetter = (r.name.trim().charAt(0) || '#').toUpperCase();

                  return (
                    <tr
                      key={`row-${r.id}-${index}`}
                      data-letter-prefix={firstLetter}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition group ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/40'
                          : isModified
                          ? 'bg-red-50/80 dark:bg-red-950/40 border-l-4 border-l-red-500 hover:bg-red-100/70 dark:hover:bg-red-900/30'
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
                          <span>{highlightText(r.name, searchQuery)}</span>
                          {isModified && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1 shrink-0 animate-in fade-in duration-300"
                              title="This contact was modified by the most recent action"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              <span>Modified</span>
                            </span>
                          )}
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
                              title="Multiple entries share the same name & number: click to merge"
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
                              title="Different contacts share this phone number: click to merge"
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
                              title="Contact has repeated identical phone numbers: click to delete redundant numbers"
                            >
                              <CopyCheck className="w-3 h-3 text-pink-600 dark:text-pink-400 shrink-0" />
                              <span>Repeat Number</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Original Raw */}
                      <td className="p-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {r.raw ? highlightText(r.raw, searchQuery) : <span className="text-slate-300 italic">None</span>}
                      </td>

                      {/* Upgraded Result */}
                      <td className="p-3 font-mono text-xs font-bold text-slate-900 dark:text-emerald-400">
                        <div className="flex items-center gap-2">
                          <span>{highlightText(r.result, searchQuery)}</span>
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
                })}
                  </>
                )}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive A-Z Jump Sidebar */}
      {records.length > 0 && !isLoading && (
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
      )}
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
