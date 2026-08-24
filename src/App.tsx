import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { KeyFeaturesGrid } from './components/KeyFeaturesGrid';
import { PuraRulesGuide } from './components/PuraRulesGuide';
import { LiveSandbox } from './components/LiveSandbox';
import { ImportSection, ImportProgressState } from './components/ImportSection';
import { ReviewToolbar } from './components/ReviewToolbar';
import { ContactTable } from './components/ContactTable';
import { ExportActionBar } from './components/ExportActionBar';
import { DuplicateModal } from './components/DuplicateModal';
import { EditContactModal } from './components/EditContactModal';
import { AddContactModal } from './components/AddContactModal';
import { MergeContactsModal } from './components/MergeContactsModal';
import { InstructionProgressBar } from './components/InstructionProgressBar';
import { Toast, ToastMessage } from './components/Toast';
import { ContactRecord, FilterOption, SortOption, InstructionProgressState } from './types';
import { 
  analyzeDuplicates, 
  generateCSV, 
  generateVCF, 
  parseCSV, 
  parseVCF, 
  processFullContact, 
  triggerDownload,
  bulkMergeExactDuplicates,
  bulkMergeSharedGroups,
  removeInternalRepeatedNumbers,
  isMissingPhone
} from './lib/puraEngine';
import { SAMPLE_RAW_DATA } from './lib/demoData';
import { ArrowLeft, Home, Sparkles, Moon, Sun, Smartphone, ShieldCheck } from 'lucide-react';

export default function App() {
  // Page view routing: 'landing' or 'app'
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#app' || path.includes('app.html') || path.endsWith('/app')) {
        return 'app';
      }
    }
    return 'landing';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gm_pura_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
    }
    return false;
  });
  const [includeCountryCode, setIncludeCountryCode] = useState<boolean>(true);
  const [records, setRecords] = useState<ContactRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  
  // Modals & Flows state
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ContactRecord | null>(null);
  const [mergingContacts, setMergingContacts] = useState<ContactRecord[] | null>(null);
  const [sequentialGroupIndex, setSequentialGroupIndex] = useState<number | null>(null);

  // Import Progress state
  const [importProgress, setImportProgress] = useState<ImportProgressState | null>(null);

  // Instruction Execution Progress state
  const [instructionProgress, setInstructionProgress] = useState<InstructionProgressState | null>(null);

  // Helper to execute an instruction with clear progress bar feedback
  const executeInstructionWithProgress = (
    title: string,
    steps: string[],
    action: () => void,
    onComplete?: () => void
  ) => {
    const totalSteps = steps.length;
    setInstructionProgress({
      title,
      detail: steps[0] || 'Executing instruction...',
      step: 1,
      totalSteps,
      percent: Math.round(100 / (totalSteps + 1)),
      status: 'running',
    });

    setTimeout(() => {
      if (totalSteps >= 2) {
        setInstructionProgress({
          title,
          detail: steps[1] || 'Processing contacts...',
          step: 2,
          totalSteps,
          percent: Math.round((2 * 100) / (totalSteps + 1)),
          status: 'running',
        });
      }

      setTimeout(() => {
        // Execute the actual mutation / action
        action();

        setInstructionProgress({
          title,
          detail: steps[steps.length - 1] || 'Instruction executed successfully!',
          step: totalSteps,
          totalSteps,
          percent: 100,
          status: 'completed',
        });

        if (onComplete) onComplete();

        // Auto dismiss after 3.2 seconds
        setTimeout(() => {
          setInstructionProgress((prev) => (prev?.title === title ? null : prev));
        }, 3200);
      }, 220);
    }, 180);
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#app') {
        setCurrentView('app');
      } else if (hash === '#landing' || hash === '' || hash === '#') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToApp = () => {
    setCurrentView('app');
    window.location.hash = '#app';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    window.location.hash = '#landing';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Theme synchronization
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('gm_pura_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('gm_pura_theme', 'light');
    }
  }, [darkMode]);

  // Handle loading sample contacts
  const handleLoadSampleContacts = () => {
    const parsed = parseCSV(SAMPLE_RAW_DATA, includeCountryCode);
    setRecords(parsed);
    setSelectedIds(new Set());
    addToast(`Loaded ${parsed.length} sample contacts`);
    scrollToReviewSection();
  };

  // Re-process when prefix toggle changes
  const handleToggleCountryCode = () => {
    const nextVal = !includeCountryCode;
    setIncludeCountryCode(nextVal);
    setRecords((prev) =>
      prev.map((r, i) => processFullContact(r.name, r.raw, nextVal, i, r.id))
    );
    addToast(
      nextVal ? 'Country code (+220) enabled for exports' : 'Country code prefix removed',
      'info'
    );
  };

  // Import handlers
  const handleImportFile = (content: string, filename: string) => {
    const isVcf = filename.toLowerCase().endsWith('.vcf');
    setImportProgress({
      isProcessing: true,
      current: 0,
      total: 100,
      filename,
    });

    setTimeout(() => {
      const parsed = isVcf
        ? parseVCF(content, includeCountryCode)
        : parseCSV(content, includeCountryCode);

      setImportProgress({
        isProcessing: true,
        current: parsed.length,
        total: parsed.length,
        filename,
      });

      setTimeout(() => {
        setRecords(parsed);
        setSelectedIds(new Set());
        setImportProgress(null);
        addToast(`Successfully loaded ${parsed.length} contacts from ${filename}`);
        scrollToReviewSection();
      }, 250);
    }, 150);
  };

  const handleProcessRaw = (rawText: string) => {
    const parsed = parseCSV(rawText, includeCountryCode);
    setRecords(parsed);
    setSelectedIds(new Set());
    addToast(`Successfully processed ${parsed.length} pasted contacts`);
    scrollToReviewSection();
  };

  const handleClearAll = () => {
    setRecords([]);
    setSelectedIds(new Set());
    setSequentialGroupIndex(null);
    setMergingContacts(null);
    addToast('All contacts cleared from memory', 'info');
  };

  // Add Contact
  const handleAddContact = (name: string, phone: string) => {
    const newRecord = processFullContact(
      name,
      phone,
      includeCountryCode,
      records.length
    );
    setRecords((prev) => [newRecord, ...prev]);
    addToast(`Added "${name}" to contact list`);
    scrollToReviewSection();
  };

  // Edit Contact
  const handleSaveEdit = (id: string, newName: string, newPhone: string) => {
    setRecords((prev) =>
      prev.map((r, idx) =>
        r.id === id
          ? processFullContact(newName, newPhone, includeCountryCode, idx, id)
          : r
      )
    );
    addToast('Contact updated successfully');
  };

  // Delete single contact
  const handleDeleteContact = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    addToast('Contact removed', 'info');
  };

  // Delete selected contacts
  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    setRecords((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    addToast(`Deleted ${count} selected contacts`, 'warn');
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Merge selected contacts handler
  const handleOpenMergeForSelected = () => {
    const selected = records.filter((r) => selectedIds.has(r.id));
    if (selected.length >= 2) {
      setMergingContacts(selected);
    } else {
      addToast('Select at least 2 contacts to merge', 'warn');
    }
  };

  // Merge by group indices handler (e.g. from duplicates modal)
  const handleOpenMergeForIndices = (indices: number[]) => {
    const groupRecords = records.filter((r) => indices.includes(r.originalIndex));
    if (groupRecords.length >= 2) {
      setMergingContacts(groupRecords);
    }
  };

  // Sequential Merge Flow Launcher
  const handleStartSequentialMerge = () => {
    if (duplicateAnalysis.sharedGroups.length === 0) {
      addToast('No shared duplicate groups to merge', 'info');
      return;
    }
    setSequentialGroupIndex(0);
    const firstGroup = duplicateAnalysis.sharedGroups[0];
    const groupRecords = firstGroup.indices.map((i) => records[i]).filter(Boolean);
    setMergingContacts(groupRecords);
  };

  // Bulk Merge Handler
  const handleBulkMergeShared = (strategy: 'slash' | 'and' | 'first') => {
    executeInstructionWithProgress(
      `Bulk Merge Shared Groups (${strategy === 'slash' ? 'Slash /' : strategy === 'and' ? 'Ampersand &' : 'Keep 1st Name'})`,
      [
        'Analyzing contacts sharing identical phone lines...',
        'Consolidating names and resolving duplicate lines...',
        'Shared duplicate groups merged successfully!'
      ],
      () => {
        const res = bulkMergeSharedGroups(records, includeCountryCode, strategy);
        setRecords(res.updatedRecords);
        setSelectedIds(new Set());
        setIsDuplicateModalOpen(false);
        addToast(`Bulk merged ${res.mergedGroupsCount} shared groups (${res.reducedCount} contacts consolidated)`);
      }
    );
  };

  // Clean all repeated numbers within contacts
  const handleCleanAllRepeatedNumbers = () => {
    executeInstructionWithProgress(
      'Clean All Repeated Internal Numbers',
      [
        'Scanning contacts for internal redundant numbers...',
        'Deduplicating duplicate numbers inside each contact card...',
        'Cleaned all internal repeated digits!'
      ],
      () => {
        const res = removeInternalRepeatedNumbers(records, includeCountryCode);
        setRecords(res.updatedRecords);
        setIsDuplicateModalOpen(false);
        addToast(`Cleaned redundant numbers in ${res.cleanedContactsCount} contacts (${res.removedNumbersCount} numbers removed)`);
      }
    );
  };

  // Clean repeated numbers on a single contact
  const handleCleanSingleContactRepeated = (record: ContactRecord) => {
    executeInstructionWithProgress(
      `Clean Redundant Numbers: ${record.name}`,
      [
        'Scanning internal phone numbers for this contact...',
        'Deduplicating internal repeated digits...',
        'Removed redundant digits successfully!'
      ],
      () => {
        const res = removeInternalRepeatedNumbers([record], includeCountryCode);
        if (res.updatedRecords.length > 0) {
          setRecords((prev) => prev.map((r) => (r.id === record.id ? res.updatedRecords[0] : r)));
          addToast(`Removed redundant numbers from "${record.name}"`);
        }
      }
    );
  };

  // Completely cancel merge flow and close modal
  const handleCancelMergeModal = () => {
    setSequentialGroupIndex(null);
    setMergingContacts(null);
  };

  // Skip current conflict in sequential flow
  const handleSkipMergeModal = () => {
    if (sequentialGroupIndex !== null) {
      const nextIdx = sequentialGroupIndex + 1;
      if (nextIdx < duplicateAnalysis.sharedGroups.length) {
        setSequentialGroupIndex(nextIdx);
        const nextGroup = duplicateAnalysis.sharedGroups[nextIdx];
        const nextRecords = nextGroup.indices.map((i) => records[i]).filter(Boolean);
        setMergingContacts(nextRecords);
        addToast(`Skipped to conflict (${nextIdx + 1}/${duplicateAnalysis.sharedGroups.length})`, 'info');
        return;
      } else {
        setSequentialGroupIndex(null);
        setMergingContacts(null);
        addToast('Finished sequential merge flow', 'info');
      }
    } else {
      setMergingContacts(null);
    }
  };

  // Delete all contacts missing telephone numbers
  const handleDeleteAllMissingPhoneContacts = () => {
    executeInstructionWithProgress(
      'Purge Contacts Without Phone Numbers',
      [
        'Scanning for blank or empty telephone entries...',
        'Purging unupgradable records from memory...',
        'All empty contacts purged!'
      ],
      () => {
        const toKeep = records.filter(
          (r) => !isMissingPhone(r) && !duplicateAnalysis.missingPhoneIndices.has(r.originalIndex)
        );
        const count = records.length - toKeep.length;
        if (count === 0) {
          addToast('No empty phone contacts found', 'info');
          return;
        }
        const updated = toKeep.map((r, i) => ({ ...r, originalIndex: i }));
        setRecords(updated);
        setSelectedIds(new Set());
        setIsDuplicateModalOpen(false);
        addToast(`Deleted ${count} contact${count > 1 ? 's' : ''} with no phone number`);
      }
    );
  };

  // Perform contact merge
  const handleConfirmMerge = (
    mergedData: { name: string; rawPhone: string },
    idsToRemove: string[]
  ) => {
    const idsSet = new Set(idsToRemove);
    const newRecord = processFullContact(
      mergedData.name,
      mergedData.rawPhone,
      includeCountryCode,
      records.length
    );

    // Place the new merged record in the position of the first removed contact
    let replaced = false;
    const updatedRecords: ContactRecord[] = [];

    records.forEach((r) => {
      if (idsSet.has(r.id)) {
        if (!replaced) {
          updatedRecords.push({ ...newRecord, originalIndex: updatedRecords.length, id: r.id });
          replaced = true;
        }
      } else {
        updatedRecords.push({ ...r, originalIndex: updatedRecords.length });
      }
    });

    if (!replaced) {
      updatedRecords.push(newRecord);
    }

    setRecords(updatedRecords);

    // Clean up selected IDs
    setSelectedIds((prev) => {
      const next = new Set(prev);
      idsToRemove.forEach((id) => next.delete(id));
      return next;
    });

    // Advance sequential flow if active
    if (sequentialGroupIndex !== null) {
      const nextIdx = sequentialGroupIndex + 1;
      if (nextIdx < duplicateAnalysis.sharedGroups.length) {
        setSequentialGroupIndex(nextIdx);
        const nextGroup = duplicateAnalysis.sharedGroups[nextIdx];
        const nextRecords = nextGroup.indices.map((i) => updatedRecords[i] || records[i]).filter(Boolean);
        setMergingContacts(nextRecords);
        addToast(`Merged! Next conflict (${nextIdx + 1}/${duplicateAnalysis.sharedGroups.length})`);
        return;
      } else {
        setSequentialGroupIndex(null);
        setMergingContacts(null);
        addToast('All shared duplicate conflicts resolved!');
        return;
      }
    }

    setMergingContacts(null);
    addToast(`Successfully merged contacts into "${mergedData.name}"`);
  };

  // Open Duplicate Analysis Handler
  const handleOpenDuplicateAnalysis = () => {
    if (records.length === 0) {
      addToast('Please load contacts first!', 'warn');
      return;
    }
    executeInstructionWithProgress(
      'Analyze Duplicates & Phone Intelligence',
      [
        'Scanning all contact records in memory...',
        'Matching exact duplicates, shared numbers, and repeated digits...',
        'Duplicate analysis complete!'
      ],
      () => {
        setIsDuplicateModalOpen(true);
      }
    );
  };

  // Duplicate analysis
  const duplicateAnalysis = useMemo(() => {
    return analyzeDuplicates(records);
  }, [records]);

  // Section 4 Ref for smooth scrolling
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const scrollToReviewSection = () => {
    setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  // Remove exact duplicates (keep 1 copy)
  const handleRemoveExactDuplicates = () => {
    executeInstructionWithProgress(
      'Auto-Deduplicate Exact Matches',
      [
        'Scanning identical contact names and phone numbers...',
        'Consolidating records and keeping 1 primary copy...',
        'Exact duplicates deduplicated successfully!'
      ],
      () => {
        const res = bulkMergeExactDuplicates(records);
        setRecords(res.updatedRecords);
        setSelectedIds(new Set());
        setIsDuplicateModalOpen(false);
        addToast(`Removed ${res.removedCount} duplicate contacts (kept 1 copy of each)`);
      }
    );
  };

  // Filtered and Sorted Records
  const displayRecords = useMemo(() => {
    let list = [...records];
    const q = searchQuery.toLowerCase().trim();

    // 1. Search Query
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.raw.toLowerCase().includes(q) ||
          r.result.toLowerCase().includes(q) ||
          r.operator.toLowerCase().includes(q) ||
          (r.phoneNumbers && r.phoneNumbers.some((p) => p.operator.toLowerCase().includes(q) || p.result.toLowerCase().includes(q)))
      );
    }

    // 2. Filter Dropdown
    if (filterOption === 'upgraded') {
      list = list.filter((r) => r.status === 'ok');
    } else if (filterOption === 'review') {
      list = list.filter((r) => r.status === 'review' || r.status === 'already');
    } else if (filterOption === 'duplicate-exact') {
      list = list.filter((r) => duplicateAnalysis.exactIndices.has(r.originalIndex));
    } else if (filterOption === 'duplicate-shared') {
      list = list.filter((r) => duplicateAnalysis.sharedIndices.has(r.originalIndex));
    } else if (filterOption === 'repeated-number') {
      list = list.filter((r) => r.hasRepeatedNumbers || duplicateAnalysis.repeatedIndices.has(r.originalIndex));
    } else if (filterOption === 'missing-phone') {
      list = list.filter((r) => isMissingPhone(r) || duplicateAnalysis.missingPhoneIndices.has(r.originalIndex));
    } else if (filterOption === 'qcell') {
      list = list.filter((r) => r.operator === 'QCell' || (r.phoneNumbers && r.phoneNumbers.some((p) => p.operator === 'QCell')));
    } else if (filterOption === 'comium') {
      list = list.filter((r) => r.operator === 'Comium' || (r.phoneNumbers && r.phoneNumbers.some((p) => p.operator === 'Comium')));
    } else if (filterOption === 'africell') {
      list = list.filter((r) => r.operator === 'Africell' || (r.phoneNumbers && r.phoneNumbers.some((p) => p.operator === 'Africell')));
    } else if (filterOption === 'gamcel') {
      list = list.filter((r) => r.operator === 'Gamcel' || (r.phoneNumbers && r.phoneNumbers.some((p) => p.operator === 'Gamcel')));
    } else if (filterOption === 'gamtel') {
      list = list.filter((r) => r.operator === 'Gamtel' || (r.phoneNumbers && r.phoneNumbers.some((p) => p.operator === 'Gamtel')));
    } else if (filterOption === 'international') {
      list = list.filter((r) => r.operator === 'International' || (r.phoneNumbers && r.phoneNumbers.some((p) => p.operator === 'International')));
    }

    // 3. Sorting
    if (sortOption === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }));
    } else if (sortOption === 'operator-asc') {
      list.sort((a, b) => a.operator.localeCompare(b.operator));
    } else if (sortOption === 'status-asc') {
      list.sort((a, b) => a.status.localeCompare(b.status));
    } else if (sortOption === 'original') {
      list.sort((a, b) => a.originalIndex - b.originalIndex);
    }

    return list;
  }, [records, searchQuery, filterOption, sortOption, duplicateAnalysis]);

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allDisplayIds = new Set(displayRecords.map((r) => r.id));
      setSelectedIds(allDisplayIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  // Export handlers
  const handleExportVCF = () => {
    if (records.length === 0) {
      addToast('No contacts available to export', 'warn');
      return;
    }
    executeInstructionWithProgress(
      'Generate & Download VCF Contact Book',
      [
        'Compiling vCard 3.0 standard specifications...',
        'Formatting PURA 9-digit numbers and prefixes...',
        'VCF contact book downloaded successfully!'
      ],
      () => {
        const vcf = generateVCF(records);
        triggerDownload(vcf, 'GM_PURA_Upgraded_Contacts.vcf', 'text/vcard');
        addToast(`Exported ${records.length} contacts to VCF file!`);
      }
    );
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      addToast('No contacts available to export', 'warn');
      return;
    }
    executeInstructionWithProgress(
      'Generate & Download CSV Spreadsheet',
      [
        'Formatting spreadsheet columns and UTF-8 characters...',
        'Structuring Gambian operator categorization...',
        'CSV spreadsheet downloaded successfully!'
      ],
      () => {
        const csv = generateCSV(records);
        triggerDownload(csv, 'GM_PURA_Upgraded_Contacts.csv', 'text/csv');
        addToast(`Exported ${records.length} contacts to CSV spreadsheet!`);
      }
    );
  };

  // Stats calculation
  const totalCount = records.length;
  const upgradedCount = records.filter((r) => r.status === 'ok').length;
  const reviewCount = records.filter((r) => r.status === 'review' || r.status === 'already').length;

  if (currentView === 'landing') {
    return (
      <>
        <Toast toasts={toasts} />
        <LandingPage
          onLaunchApp={navigateToApp}
          onTryDemo={() => {
            handleLoadSampleContacts();
            navigateToApp();
          }}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
          totalContactsCount={totalCount}
          upgradedCount={upgradedCount}
          deferredCount={reviewCount}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toast toasts={toasts} />

      {/* Top Application Workspace Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Gambia flag top stripe accent */}
        <div className="h-1 flex w-full">
          <div className="flex-1 bg-red-600" />
          <div className="w-4 bg-white" />
          <div className="flex-1 bg-blue-600" />
          <div className="w-4 bg-white" />
          <div className="flex-1 bg-emerald-600" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="backToLandingBtn"
              onClick={navigateToLanding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                9
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white hidden md:inline">
                PURA Contact Upgrader
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {totalCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {upgradedCount} / {totalCount} upgraded
              </span>
            )}

            <button
              type="button"
              onClick={handleLoadSampleContacts}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition cursor-pointer"
              title="Load demo Gambian contacts"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Load Sample</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <Header
          totalContacts={totalCount}
          upgradedCount={upgradedCount}
        />

        {/* Key Features Overview */}
        <KeyFeaturesGrid />

        {/* 1. PURA Rules Guide */}
        <PuraRulesGuide />

        {/* Live Sandbox & Quick Test */}
        <LiveSandbox
          includeCountryCode={includeCountryCode}
          onAddContact={handleAddContact}
        />

        {/* 2 & 3. Import File and Paste Raw records */}
        <ImportSection
          onImportFile={handleImportFile}
          onProcessRaw={handleProcessRaw}
          onClearAll={handleClearAll}
          onFileError={(msg) => addToast(msg, 'warn')}
          totalRecords={totalCount}
          importProgress={importProgress}
        />

        {/* 4. Review, Filter, Table & Format Exports */}
        <div
          ref={reviewSectionRef}
          id="section-review-and-export"
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm scroll-mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              4. Review, Filter & Format Exports
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Interactive Table
            </span>
          </div>

          {/* Real-time instruction execution progress bar */}
          {instructionProgress && (
            <div className="mb-4">
              <InstructionProgressBar 
                progress={instructionProgress} 
                onDismiss={() => setInstructionProgress(null)} 
              />
            </div>
          )}

          <ReviewToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            filterOption={filterOption}
            onFilterChange={setFilterOption}
            selectedCount={selectedIds.size}
            totalCount={totalCount}
            showingCount={displayRecords.length}
            upgradedCount={upgradedCount}
            reviewCount={reviewCount}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />

          <ContactTable
            records={displayRecords}
            allRecords={records}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={(record) => setEditingRecord(record)}
            onDelete={handleDeleteContact}
            onCopyText={(text) => addToast(`Copied "${text}" to clipboard`)}
            exactDuplicateIds={duplicateAnalysis.exactIndices}
            sharedDuplicateIds={duplicateAnalysis.sharedIndices}
            repeatedDuplicateIds={duplicateAnalysis.repeatedIndices}
            missingPhoneIds={duplicateAnalysis.missingPhoneIndices}
            onLoadSample={handleLoadSampleContacts}
            onImportFile={handleImportFile}
            onMerge={(contacts) => setMergingContacts(contacts)}
            onDeleteSelected={handleDeleteSelected}
            onClearFilters={() => {
              setFilterOption('all');
              setSearchQuery('');
              setSortOption('name-asc');
            }}
            onCleanRepeatedNumbers={handleCleanSingleContactRepeated}
            onCleanAllRepeatedNumbers={handleCleanAllRepeatedNumbers}
            onDeleteAllMissingPhoneContacts={handleDeleteAllMissingPhoneContacts}
          />

          <ExportActionBar
            includeCountryCode={includeCountryCode}
            onToggleCountryCode={handleToggleCountryCode}
            selectedCount={selectedIds.size}
            totalCount={totalCount}
            onAnalyzeDuplicates={handleOpenDuplicateAnalysis}
            onMergeSelected={handleOpenMergeForSelected}
            onDeleteSelected={handleDeleteSelected}
            onExportVCF={handleExportVCF}
            onExportCSV={handleExportCSV}
          />
        </div>
      </div>

      {/* Duplicate Analysis Modal */}
      <DuplicateModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        analysis={duplicateAnalysis}
        totalLoadedContacts={records.length}
        instructionProgress={instructionProgress}
        onFilterExact={() => setFilterOption('duplicate-exact')}
        onFilterShared={() => setFilterOption('duplicate-shared')}
        onFilterRepeated={() => setFilterOption('repeated-number')}
        onFilterMissing={() => setFilterOption('missing-phone')}
        onRemoveExactDuplicates={handleRemoveExactDuplicates}
        onMergeGroup={handleOpenMergeForIndices}
        onCleanRepeatedNumbers={handleCleanAllRepeatedNumbers}
        onBulkMergeShared={handleBulkMergeShared}
        onStartSequentialMerge={handleStartSequentialMerge}
        onClearMissingContacts={handleDeleteAllMissingPhoneContacts}
      />

      {/* Merge Contacts Modal */}
      <MergeContactsModal
        isOpen={!!mergingContacts && mergingContacts.length >= 2}
        contacts={mergingContacts || []}
        onClose={handleCancelMergeModal}
        onSkip={handleSkipMergeModal}
        isSequential={sequentialGroupIndex !== null}
        groupIndex={sequentialGroupIndex ?? undefined}
        totalGroups={duplicateAnalysis.sharedGroups.length}
        onConfirmMerge={handleConfirmMerge}
        includeCountryCode={includeCountryCode}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        record={editingRecord}
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEdit}
        includeCountryCode={includeCountryCode}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
        includeCountryCode={includeCountryCode}
      />
    </div>
  );
}
