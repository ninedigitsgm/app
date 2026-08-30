import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
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
import { ExactDuplicateWizardModal } from './components/ExactDuplicateWizardModal';
import { RepeatedNumbersWizardModal } from './components/RepeatedNumbersWizardModal';
import { MissingPhoneWizardModal } from './components/MissingPhoneWizardModal';
import { ExportPreviewModal } from './components/ExportPreviewModal';
import { ActionSummaryModal } from './components/ActionSummaryModal';
import { CleanSharedModal } from './components/CleanSharedModal';
import { InstructionProgressBar } from './components/InstructionProgressBar';
import { ScrollReveal } from './components/ScrollReveal';
import { BackToTop } from './components/BackToTop';
import { OperatorDistributionChart } from './components/OperatorDistributionChart';
import { Toast, ToastMessage } from './components/Toast';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { PwaSplashScreen } from './components/PwaSplashScreen';
import { 
  ContactRecord, 
  FilterOption, 
  SortOption, 
  InstructionProgressState,
  ActionSummaryData,
  AffectedContactItem 
} from './types';
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
  MergeStrategy,
  removeInternalRepeatedNumbers,
  isMissingPhone,
  getCanonicalPhoneKey
} from './lib/puraEngine';
import { SAMPLE_RAW_DATA } from './lib/demoData';
import { ArrowLeft, Home, Sparkles, Moon, Sun, Smartphone, ShieldCheck, CopyCheck, GitMerge, Trash2 } from 'lucide-react';

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
  const [includeCountryCode, setIncludeCountryCode] = useState<boolean>(false);
  const [showReference, setShowReference] = useState<boolean>(false);
  interface HistoryState {
    records: ContactRecord[];
    description: string;
  }

  const [records, setRecordsState] = useState<ContactRecord[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  // Custom setRecords helper that records history with labels
  const setRecords = (
    next: ContactRecord[] | ((prev: ContactRecord[]) => ContactRecord[]),
    actionName?: string
  ) => {
    setRecordsState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      
      // Auto-detect action description if none provided
      let desc = actionName;
      if (!desc) {
        if (prev.length === 0 && resolved.length > 0) {
          desc = `Imported ${resolved.length} Contacts`;
        } else if (resolved.length > prev.length) {
          desc = `Added ${resolved.length - prev.length} Contact(s)`;
        } else if (resolved.length < prev.length) {
          desc = `Deleted ${prev.length - resolved.length} Contact(s)`;
        } else {
          desc = "Updated Contacts State";
        }
      }

      setHistory((prevHistory) => {
        // Prevent duplicate snapshots in history
        if (prevHistory.length > 0 && JSON.stringify(prevHistory[prevHistory.length - 1].records) === JSON.stringify(prev)) {
          return prevHistory;
        }
        const nextHistory = [...prevHistory, { records: prev, description: desc || "Action State" }];
        if (nextHistory.length > 10) {
          return nextHistory.slice(nextHistory.length - 10);
        }
        return nextHistory;
      });
      setRedoStack([]); // clear redo stack on new action
      return resolved;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastHistory = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => {
      const updated = [...prev, { records, description: lastHistory.description }];
      if (updated.length > 10) return updated.slice(updated.length - 10);
      return updated;
    });
    setRecordsState(lastHistory.records);
    setSelectedIds(new Set());
    setModifiedContactIds(new Set());
    addToast(`Undo: ${lastHistory.description}`, 'info');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lastRedo = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => {
      const updated = [...prev, { records, description: lastRedo.description }];
      if (updated.length > 10) return updated.slice(updated.length - 10);
      return updated;
    });
    setRecordsState(lastRedo.records);
    setSelectedIds(new Set());
    setModifiedContactIds(new Set());
    addToast(`Redo: ${lastRedo.description}`, 'info');
  };

  const handleUndoToSnapshot = (historyIndex: number) => {
    if (historyIndex < 0 || historyIndex >= history.length) return;
    const targetSnapshot = history[historyIndex];
    
    // History split
    const newHistory = history.slice(0, historyIndex);
    
    // Undone items go to redo stack in proper sequence
    const undoneItems = history.slice(historyIndex + 1).map(h => ({
      records: h.records,
      description: h.description
    }));
    const newRedoItem = { records, description: history[historyIndex].description };
    const itemsForRedo = [...undoneItems, newRedoItem];

    setRedoStack(prev => {
      const combined = [...prev, ...itemsForRedo];
      if (combined.length > 10) return combined.slice(combined.length - 10);
      return combined;
    });

    setHistory(newHistory);
    setRecordsState(targetSnapshot.records);
    setSelectedIds(new Set());
    setModifiedContactIds(new Set());
    addToast(`Reverted back to: ${targetSnapshot.description}`, 'info');
  };

  const handleRedoToSnapshot = (redoIndex: number) => {
    if (redoIndex < 0 || redoIndex >= redoStack.length) return;
    const targetSnapshot = redoStack[redoIndex];

    // Redo split
    const newRedoStack = redoStack.slice(0, redoIndex);

    // Redone items go to history stack in proper sequence
    const redoneItems = redoStack.slice(redoIndex + 1).map(r => ({
      records: r.records,
      description: r.description
    }));
    const newHistoryItem = { records, description: targetSnapshot.description };
    const itemsForHistory = [newHistoryItem, ...redoneItems];

    setHistory(prev => {
      const combined = [...prev, ...itemsForHistory];
      if (combined.length > 10) return combined.slice(combined.length - 10);
      return combined;
    });

    setRedoStack(newRedoStack);
    setRecordsState(targetSnapshot.records);
    setSelectedIds(new Set());
    setModifiedContactIds(new Set());
    addToast(`Restored state to: ${targetSnapshot.description}`, 'info');
  };
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  
  // Modals & Flows state
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isExactWizardOpen, setIsExactWizardOpen] = useState(false);
  const [isRepeatedWizardOpen, setIsRepeatedWizardOpen] = useState(false);
  const [isMissingPhoneWizardOpen, setIsMissingPhoneWizardOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ContactRecord | null>(null);
  const [mergingContacts, setMergingContacts] = useState<ContactRecord[] | null>(null);
  const [sequentialGroupIndex, setSequentialGroupIndex] = useState<number | null>(null);
  const [skippedGroupKeys, setSkippedGroupKeys] = useState<Set<string>>(new Set());

  // Export Preview state
  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'CSV' | 'VCF'>('CSV');

  // Clean Shared Modal state
  const [isCleanSharedModalOpen, setIsCleanSharedModalOpen] = useState(false);

  // Modified Contacts Highlights & Action Summary Modal state
  const [modifiedContactIds, setModifiedContactIds] = useState<Set<string>>(new Set());
  const [actionSummaryData, setActionSummaryData] = useState<ActionSummaryData | null>(null);

  // Import Progress state
  const [importProgress, setImportProgress] = useState<ImportProgressState | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

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

    // Realistic delay 1 (900ms)
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

      // Realistic delay 2 (1100ms)
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

        // Auto dismiss after 1.5 seconds
        setTimeout(() => {
          setInstructionProgress((prev) => (prev?.title === title ? null : prev));
        }, 1500);
      }, 1100);
    }, 900);
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

  const fallbackCopyText = (text: string, onSuccess: () => void, onFail: () => void) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        onSuccess();
      } else {
        onFail();
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      onFail();
    }
  };

  const handleCopyText = (text: string) => {
    const showSuccessToast = () => {
      addToast(`Copied "${text}" to clipboard`);
    };

    const showFailToast = () => {
      addToast(`Failed to copy "${text}" to clipboard`, 'warn');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(showSuccessToast)
        .catch((err) => {
          console.warn("Navigator clipboard write failed, trying fallback:", err);
          fallbackCopyText(text, showSuccessToast, showFailToast);
        });
    } else {
      fallbackCopyText(text, showSuccessToast, showFailToast);
    }
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
    setIsAnalyzing(true);
    setTimeout(() => {
      const parsed = parseCSV(SAMPLE_RAW_DATA, includeCountryCode);
      setRecords(parsed, "Load Sample Contacts");
      setSelectedIds(new Set());
      setModifiedContactIds(new Set());
      setActionSummaryData(null);
      setIsAnalyzing(false);
      addToast(`Loaded ${parsed.length} sample contacts`);
      scrollToReviewSection();
    }, 450);
  };

  // Re-process when prefix toggle changes
  const handleToggleCountryCode = () => {
    const nextVal = !includeCountryCode;
    setIncludeCountryCode(nextVal);
    setRecords(
      (prev) =>
        prev.map((r, i) => processFullContact(r.name, r.raw, nextVal, i, r.id)),
      `Toggle +220 Prefix (${nextVal ? 'ON' : 'OFF'})`
    );
    setModifiedContactIds(new Set());
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
        setRecords(parsed, `Import from ${filename}`);
        setSelectedIds(new Set());
        setModifiedContactIds(new Set());
        setActionSummaryData(null);
        setImportProgress(null);
        addToast(`Successfully loaded ${parsed.length} contacts from ${filename}`);
        scrollToReviewSection();
      }, 250);
    }, 150);
  };

  const handleProcessRaw = (rawText: string) => {
    const parsed = parseCSV(rawText, includeCountryCode);
    setRecords(parsed, "Pasted Raw Contacts");
    setSelectedIds(new Set());
    setModifiedContactIds(new Set());
    setActionSummaryData(null);
    addToast(`Successfully processed ${parsed.length} pasted contacts`);
    scrollToReviewSection();
  };

  const handleClearAll = () => {
    setRecords([], "Clear All Contacts");
    setSelectedIds(new Set());
    setModifiedContactIds(new Set());
    setActionSummaryData(null);
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
    setRecords((prev) => [newRecord, ...prev], `Add Contact: ${name}`);
    setModifiedContactIds(new Set([newRecord.id]));
    setActionSummaryData({
      actionType: 'add',
      title: 'New Contact Added',
      description: `Added "${name}" formatted to 9-digit Gambian dialling standards.`,
      affectedContacts: [
        {
          id: newRecord.id,
          name: newRecord.name,
          originalPhone: newRecord.raw,
          upgradedPhone: newRecord.result,
          operator: newRecord.operator,
          status: newRecord.status,
          changeNote: 'New contact entry standardized & created',
        }
      ],
      stats: {
        totalAffected: 1,
      }
    });
    addToast(`Added "${name}" to contact list`);
    scrollToReviewSection();
  };

  // Edit Contact
  const handleSaveEdit = (id: string, newName: string, newPhone: string) => {
    const updatedRecord = processFullContact(newName, newPhone, includeCountryCode, 0, id);
    setRecords(
      (prev) =>
        prev.map((r, idx) =>
          r.id === id
            ? processFullContact(newName, newPhone, includeCountryCode, idx, id)
            : r
        ),
      `Edit Contact: ${newName}`
    );
    setModifiedContactIds(new Set([id]));
    setActionSummaryData({
      actionType: 'edit',
      title: 'Contact Details Updated',
      description: `Successfully modified information for "${newName}".`,
      affectedContacts: [
        {
          id,
          name: newName,
          originalPhone: newPhone,
          upgradedPhone: updatedRecord.result,
          operator: updatedRecord.operator,
          status: updatedRecord.status,
          changeNote: 'Contact name and phone number updated',
        }
      ],
      stats: {
        totalAffected: 1,
      }
    });
    addToast('Contact updated successfully');
  };

  // Delete single contact
  const handleDeleteContact = (id: string) => {
    const contact = records.find((r) => r.id === id);
    const label = contact ? `Delete Contact: ${contact.name}` : 'Delete Contact';
    setRecords((prev) => prev.filter((r) => r.id !== id), label);
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
    setRecords(
      (prev) => prev.filter((r) => !selectedIds.has(r.id)),
      `Bulk Delete ${count} Contacts`
    );
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
    const groupRecords = indices
      .map((i) => records[i])
      .filter((r): r is ContactRecord => Boolean(r));
    if (groupRecords.length >= 2) {
      setMergingContacts(groupRecords);
    }
  };

  // Sequential Merge Flow Launcher
  const handleStartSequentialMerge = () => {
    setSkippedGroupKeys(new Set());
    const freshAnalysis = analyzeDuplicates(records);
    if (freshAnalysis.sharedGroups.length === 0) {
      addToast('No shared duplicate groups to merge', 'info');
      return;
    }
    setSequentialGroupIndex(1);
    const firstGroup = freshAnalysis.sharedGroups[0];
    const groupRecords = firstGroup.indices.map((i) => records[i]).filter(Boolean);
    setMergingContacts(groupRecords);
  };

  // Bulk Merge Handler
  const handleBulkMergeShared = (strategy: MergeStrategy = 'first') => {
    setIsCleanSharedModalOpen(false);
    executeInstructionWithProgress(
      `Bulk Merge Shared Groups (${
        strategy === 'first' 
          ? 'Keep 1st Name' 
          : strategy === 'second' 
          ? 'Keep 2nd Name' 
          : strategy === 'and' 
          ? 'Ampersand &' 
          : 'Slash /'
      })`,
      [
        'Analyzing contacts sharing identical phone lines...',
        'Consolidating names and resolving duplicate lines...',
        'Shared duplicate groups merged successfully!'
      ],
      () => {
        const res = bulkMergeSharedGroups(records, includeCountryCode, strategy);
        setRecords(res.updatedRecords, `Bulk Merge Duplicates (${strategy})`);
        setSelectedIds(new Set());
        
        const affectedIds = new Set(res.affectedRecords.map((r) => r.id));
        setModifiedContactIds(affectedIds);

        const affectedItems: AffectedContactItem[] = res.mergedDetails.map((d) => ({
          id: d.resultRecord.id,
          name: d.resultRecord.name,
          originalPhone: d.resultRecord.raw,
          upgradedPhone: d.resultRecord.result,
          operator: d.resultRecord.operator,
          status: d.resultRecord.status,
          previousNames: d.originalNames,
          changeNote: strategy === 'first' 
            ? `Merged ${d.originalNames.length} contacts (${d.originalNames.join(' + ')}) keeping 1st name "${d.resultRecord.name}"`
            : strategy === 'second'
            ? `Merged ${d.originalNames.length} contacts (${d.originalNames.join(' + ')}) keeping 2nd name "${d.resultRecord.name}"`
            : `Merged ${d.originalNames.length} contacts (${d.originalNames.join(' + ')}) into 1 unified record`,
        }));

        setActionSummaryData({
          actionType: 'bulk-merge',
          title: 'Bulk Merge Shared Duplicates',
          description: `Consolidated ${res.mergedGroupsCount} shared duplicate group${res.mergedGroupsCount === 1 ? '' : 's'} into ${res.affectedRecords.length} contacts (${res.reducedCount} contact${res.reducedCount === 1 ? '' : 's'} combined).`,
          affectedContacts: affectedItems,
          stats: {
            totalAffected: res.affectedRecords.length,
            removedOrMergedCount: res.reducedCount,
          },
        });

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
        setRecords(res.updatedRecords, "Clean Internal Repeated Numbers");

        const affectedIds = new Set(res.affectedRecords.map((r) => r.id));
        setModifiedContactIds(affectedIds);

        const affectedItems: AffectedContactItem[] = res.affectedRecords.map((r) => ({
          id: r.id,
          name: r.name,
          originalPhone: r.raw,
          upgradedPhone: r.result,
          operator: r.operator,
          status: r.status,
          changeNote: 'Deduplicated redundant identical numbers from contact',
        }));

        setActionSummaryData({
          actionType: 'clean-repeated',
          title: 'Cleaned Repeated Internal Numbers',
          description: `Cleaned redundant duplicate numbers across ${res.cleanedContactsCount} contact${res.cleanedContactsCount === 1 ? '' : 's'} (${res.removedNumbersCount} duplicate number${res.removedNumbersCount === 1 ? '' : 's'} removed).`,
          affectedContacts: affectedItems,
          stats: {
            totalAffected: res.affectedRecords.length,
            removedOrMergedCount: res.removedNumbersCount,
          },
        });

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
          const updatedRec = res.updatedRecords[0];
          setRecords(
            (prev) => prev.map((r) => (r.id === record.id ? updatedRec : r)),
            `Clean Numbers: ${record.name}`
          );
          setModifiedContactIds(new Set([record.id]));

          setActionSummaryData({
            actionType: 'clean-repeated',
            title: `Cleaned Numbers for "${record.name}"`,
            description: `Removed redundant duplicate phone numbers from "${record.name}".`,
            affectedContacts: [
              {
                id: updatedRec.id,
                name: updatedRec.name,
                originalPhone: updatedRec.raw,
                upgradedPhone: updatedRec.result,
                operator: updatedRec.operator,
                status: updatedRec.status,
                changeNote: `Cleaned redundant internal duplicate phone digits`,
              }
            ],
            stats: {
              totalAffected: 1,
              removedOrMergedCount: res.removedNumbersCount,
            },
          });

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
    if (sequentialGroupIndex !== null && mergingContacts && mergingContacts.length > 0) {
      const currentPhone = mergingContacts[0]?.raw || mergingContacts[0]?.result || '';
      const canonicalKey = getCanonicalPhoneKey(currentPhone);
      const nextSkipped = new Set(skippedGroupKeys);
      if (canonicalKey) nextSkipped.add(canonicalKey);
      setSkippedGroupKeys(nextSkipped);

      const freshAnalysis = analyzeDuplicates(records);
      const remainingGroups = freshAnalysis.sharedGroups.filter(
        (g) => !nextSkipped.has(getCanonicalPhoneKey(g.phone))
      );

      if (remainingGroups.length > 0) {
        const nextGroup = remainingGroups[0];
        const nextRecords = nextGroup.indices.map((i) => records[i]).filter(Boolean);
        setSequentialGroupIndex((prev) => (prev ? prev + 1 : 1));
        setMergingContacts(nextRecords);
        addToast(`Skipped conflict`, 'info');
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
      'Delete Contacts Without Phone Numbers',
      [
        'Scanning for blank or empty telephone entries...',
        'Removing unupgradable records from memory...',
        'All empty contacts deleted!'
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
        setRecords(updated, `Delete Empty Phone Contacts (${count})`);
        setSelectedIds(new Set());
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
    let savedMergedId = '';

    records.forEach((r) => {
      if (idsSet.has(r.id)) {
         if (!replaced) {
           savedMergedId = r.id;
           updatedRecords.push({ ...newRecord, originalIndex: updatedRecords.length, id: r.id });
           replaced = true;
         }
      } else {
         updatedRecords.push({ ...r, originalIndex: updatedRecords.length });
      }
    });

    if (!replaced) {
      savedMergedId = newRecord.id;
      updatedRecords.push(newRecord);
    }

    setRecords(updatedRecords, `Merge into: ${mergedData.name}`);

    // Clean up selected IDs
    setSelectedIds((prev) => {
      const next = new Set(prev);
      idsToRemove.forEach((id) => next.delete(id));
      return next;
    });

    const targetMerged = updatedRecords.find((r) => r.id === savedMergedId) || newRecord;
    setModifiedContactIds(new Set([targetMerged.id]));

    const originalNames = (mergingContacts || []).map((c) => c.name);
    setActionSummaryData({
      actionType: 'merge',
      title: 'Contacts Merged Successfully',
      description: `Consolidated ${idsToRemove.length} contact records into "${mergedData.name}".`,
      affectedContacts: [
        {
          id: targetMerged.id,
          name: targetMerged.name,
          originalPhone: targetMerged.raw,
          upgradedPhone: targetMerged.result,
          operator: targetMerged.operator,
          status: targetMerged.status,
          previousNames: originalNames.length > 0 ? originalNames : undefined,
          changeNote: `Merged ${idsToRemove.length} contacts into 1 unified 9-digit standardized record`,
        }
      ],
      stats: {
        totalAffected: 1,
        removedOrMergedCount: idsToRemove.length - 1,
      }
    });

    // Advance sequential flow if active
    if (sequentialGroupIndex !== null) {
      const freshAnalysis = analyzeDuplicates(updatedRecords);
      const remainingGroups = freshAnalysis.sharedGroups.filter(
        (g) => !skippedGroupKeys.has(getCanonicalPhoneKey(g.phone))
      );

      if (remainingGroups.length > 0) {
        const nextGroup = remainingGroups[0];
        const nextRecords = nextGroup.indices.map((i) => updatedRecords[i]).filter(Boolean);
        setSequentialGroupIndex((prev) => (prev ? prev + 1 : 1));
        setMergingContacts(nextRecords);
        addToast(`Merged! Next conflict remaining (${remainingGroups.length} left)`);
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

  const missingPhoneGroups = useMemo(() => {
    return Array.from(duplicateAnalysis.missingPhoneIndices).map((idx) => {
      const rec = records[idx];
      return {
        contactIndex: idx,
        contactId: rec?.id || `idx-${idx}`,
        name: rec?.name || 'Untitled Contact',
      };
    });
  }, [duplicateAnalysis.missingPhoneIndices, records]);

  const operatorData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      counts[r.operator] = (counts[r.operator] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
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
        const res = bulkMergeExactDuplicates(records, includeCountryCode);
        setRecords(res.updatedRecords, `Auto-Deduplicate Exact Matches (${res.removedCount})`);
        setSelectedIds(new Set());

        const affectedIds = new Set(res.affectedRecords.map((r) => r.id));
        setModifiedContactIds(affectedIds);

        const affectedItems: AffectedContactItem[] = res.affectedRecords.map((r) => ({
          id: r.id,
          name: r.name,
          originalPhone: r.raw,
          upgradedPhone: r.result,
          operator: r.operator,
          status: r.status,
          changeNote: 'Preserved primary copy; purged identical duplicate entries',
        }));

        setActionSummaryData({
          actionType: 'deduplicate',
          title: 'Exact Duplicates Deduplicated',
          description: `Removed ${res.removedCount} duplicate contact${res.removedCount === 1 ? '' : 's'} while preserving 1 clean copy of each.`,
          affectedContacts: affectedItems,
          stats: {
            totalAffected: res.affectedRecords.length,
            removedOrMergedCount: res.removedCount,
          },
        });

        addToast(`Removed ${res.removedCount} duplicate contacts (kept 1 copy of each)`);
      }
    );
  };

  // Exact Duplicate Wizard Single Resolution Handler
  const handleKeepExactRecord = (_groupKey: string, _keepRecordId: string, removeRecordIds: string[]) => {
    const removeSet = new Set(removeRecordIds);
    const keptRec = records.find((r) => r.id === _keepRecordId);

    setRecords(
      (prev) => prev.filter((r) => !removeSet.has(r.id)),
      `Resolve Exact Duplicate Copies (${removeRecordIds.length} removed)`
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      removeRecordIds.forEach((id) => next.delete(id));
      return next;
    });

    if (keptRec) {
      setModifiedContactIds(new Set([_keepRecordId]));
      setActionSummaryData({
        actionType: 'deduplicate',
        title: 'Duplicate Copies Resolved',
        description: `Kept primary copy of "${keptRec.name}" and removed ${removeRecordIds.length} duplicate copy(ies).`,
        affectedContacts: [
          {
            id: keptRec.id,
            name: keptRec.name,
            originalPhone: keptRec.raw,
            upgradedPhone: keptRec.result,
            operator: keptRec.operator,
            status: keptRec.status,
            changeNote: `Preserved primary contact; removed ${removeRecordIds.length} redundant duplicate copies`,
          }
        ],
        stats: {
          totalAffected: 1,
          removedOrMergedCount: removeRecordIds.length,
        }
      });
    }

    addToast(`Removed ${removeRecordIds.length} redundant duplicate copies`, 'info');
  };

  // Repeated Numbers Wizard Single Resolution Handler
  const handleSaveContactPhones = (contactId: string, updatedRawPhone: string) => {
    const targetRec = records.find((r) => r.id === contactId);
    const updatedRec = processFullContact(
      targetRec?.name || 'Contact',
      updatedRawPhone,
      includeCountryCode,
      0,
      contactId
    );

    setRecords(
      (prev) =>
        prev.map((r, idx) =>
          r.id === contactId
            ? processFullContact(r.name, updatedRawPhone, includeCountryCode, idx, r.id)
            : r
        ),
      'Clean Internal Repeated Numbers'
    );
    setModifiedContactIds(new Set([contactId]));
    setActionSummaryData({
      actionType: 'clean-repeated',
      title: 'Cleaned Repeated Numbers',
      description: `Updated phone numbers for "${updatedRec.name}".`,
      affectedContacts: [
        {
          id: updatedRec.id,
          name: updatedRec.name,
          originalPhone: updatedRec.raw,
          upgradedPhone: updatedRec.result,
          operator: updatedRec.operator,
          status: updatedRec.status,
          changeNote: 'Redundant repeated phone numbers removed',
        }
      ],
      stats: {
        totalAffected: 1,
      }
    });

    addToast('Removed duplicate phone numbers from contact', 'info');
  };

  // Missing Phone Wizard Single Resolution Handler
  const handleAddPhoneToContact = (contactId: string, phone: string) => {
    const targetRec = records.find((r) => r.id === contactId);
    const updatedRec = processFullContact(
      targetRec?.name || 'Contact',
      phone,
      includeCountryCode,
      0,
      contactId
    );

    setRecords(
      (prev) =>
        prev.map((r, idx) =>
          r.id === contactId
            ? processFullContact(r.name, phone, includeCountryCode, idx, r.id)
            : r
        ),
      'Add Number to Blank Contact'
    );
    setModifiedContactIds(new Set([contactId]));
    setActionSummaryData({
      actionType: 'add-phone',
      title: 'Phone Number Assigned',
      description: `Assigned standardized phone number to "${updatedRec.name}".`,
      affectedContacts: [
        {
          id: updatedRec.id,
          name: updatedRec.name,
          originalPhone: updatedRec.raw,
          upgradedPhone: updatedRec.result,
          operator: updatedRec.operator,
          status: updatedRec.status,
          changeNote: 'New phone number formatted & assigned',
        }
      ],
      stats: {
        totalAffected: 1,
      }
    });

    addToast('Phone number added and formatted for Gambian dialling', 'info');
  };

  // Filtered and Sorted Records
  const displayRecords = useMemo(() => {
    let list = [...records];
    const q = searchQuery.toLowerCase().trim();

    // Fast O(1) mapping from contact ID to current position in records array
    const idToRecordIndex = new Map<string, number>(records.map((r, i) => [r.id, i]));
    const getRecordIndex = (r: ContactRecord): number => idToRecordIndex.get(r.id) ?? r.originalIndex;

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
      list = list.filter((r) => duplicateAnalysis.exactIndices.has(getRecordIndex(r)));
    } else if (filterOption === 'duplicate-shared') {
      list = list.filter((r) => duplicateAnalysis.sharedIndices.has(getRecordIndex(r)));
    } else if (filterOption === 'repeated-number') {
      list = list.filter((r) => r.hasRepeatedNumbers || duplicateAnalysis.repeatedIndices.has(getRecordIndex(r)));
    } else if (filterOption === 'missing-phone') {
      list = list.filter((r) => isMissingPhone(r) || duplicateAnalysis.missingPhoneIndices.has(getRecordIndex(r)));
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

    // 3. Sorting & Grouping
    if (filterOption === 'duplicate-shared') {
      // Group records by shared telephone number so contacts sharing the line are strictly adjacent
      const indexToGroup = new Map<number, { phone: string; groupIdx: number }>();
      duplicateAnalysis.sharedGroups.forEach((g, gIdx) => {
        g.indices.forEach((idx) => {
          if (!indexToGroup.has(idx)) {
            indexToGroup.set(idx, { phone: g.phone, groupIdx: gIdx });
          }
        });
      });

      const groupMap = new Map<string, ContactRecord[]>();
      const groupOrder: string[] = [];

      list.forEach((r) => {
        const gInfo = indexToGroup.get(getRecordIndex(r));
        const groupKey = gInfo ? `shared-${gInfo.groupIdx}-${gInfo.phone}` : `other-${r.result || r.raw}`;
        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, []);
          groupOrder.push(groupKey);
        }
        groupMap.get(groupKey)!.push(r);
      });

      // Sort contacts within each shared group
      groupOrder.forEach((key) => {
        const members = groupMap.get(key)!;
        if (sortOption === 'name-desc') {
          members.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base' }));
        } else {
          members.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        }
      });

      // Sort the groups themselves
      if (sortOption === 'name-desc') {
        groupOrder.sort((aKey, bKey) => {
          const firstA = groupMap.get(aKey)![0]?.name || '';
          const firstB = groupMap.get(bKey)![0]?.name || '';
          return firstB.localeCompare(firstA, undefined, { sensitivity: 'base' });
        });
      } else if (sortOption === 'original') {
        groupOrder.sort((aKey, bKey) => {
          const firstA = groupMap.get(aKey)![0]?.originalIndex ?? 0;
          const firstB = groupMap.get(bKey)![0]?.originalIndex ?? 0;
          return firstA - firstB;
        });
      } else {
        groupOrder.sort((aKey, bKey) => {
          const firstA = groupMap.get(aKey)![0]?.name || '';
          const firstB = groupMap.get(bKey)![0]?.name || '';
          return firstA.localeCompare(firstB, undefined, { sensitivity: 'base' });
        });
      }

      const groupedList: ContactRecord[] = [];
      const seenGroupedIds = new Set<string>();
      groupOrder.forEach((key) => {
        groupMap.get(key)!.forEach((item) => {
          if (!seenGroupedIds.has(item.id)) {
            seenGroupedIds.add(item.id);
            groupedList.push(item);
          }
        });
      });
      return groupedList;
    }

    if (filterOption === 'duplicate-exact') {
      // Group records by exact duplicate key so duplicate copies are strictly adjacent
      const indexToExactKey = new Map<number, string>();
      duplicateAnalysis.exactGroups.forEach((g, gIdx) => {
        g.indices.forEach((idx) => {
          if (!indexToExactKey.has(idx)) {
            indexToExactKey.set(idx, `exact-${gIdx}-${g.key}`);
          }
        });
      });

      const groupMap = new Map<string, ContactRecord[]>();
      const groupOrder: string[] = [];

      list.forEach((r) => {
        const key = indexToExactKey.get(getRecordIndex(r)) || `exact-single-${r.name.toLowerCase()}||${r.result}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, []);
          groupOrder.push(key);
        }
        groupMap.get(key)!.push(r);
      });

      if (sortOption === 'name-desc') {
        groupOrder.sort((aKey, bKey) => {
          const firstA = groupMap.get(aKey)![0]?.name || '';
          const firstB = groupMap.get(bKey)![0]?.name || '';
          return firstB.localeCompare(firstA, undefined, { sensitivity: 'base' });
        });
      } else if (sortOption === 'original') {
        groupOrder.sort((aKey, bKey) => {
          const firstA = groupMap.get(aKey)![0]?.originalIndex ?? 0;
          const firstB = groupMap.get(bKey)![0]?.originalIndex ?? 0;
          return firstA - firstB;
        });
      } else {
        groupOrder.sort((aKey, bKey) => {
          const firstA = groupMap.get(aKey)![0]?.name || '';
          const firstB = groupMap.get(bKey)![0]?.name || '';
          return firstA.localeCompare(firstB, undefined, { sensitivity: 'base' });
        });
      }

      const groupedList: ContactRecord[] = [];
      const seenGroupedIds = new Set<string>();
      groupOrder.forEach((key) => {
        groupMap.get(key)!.forEach((item) => {
          if (!seenGroupedIds.has(item.id)) {
            seenGroupedIds.add(item.id);
            groupedList.push(item);
          }
        });
      });
      return groupedList;
    }

    if (sortOption === 'duplicate-group') {
      const sharedIndices = duplicateAnalysis.sharedIndices;
      const exactIndices = duplicateAnalysis.exactIndices;
      const repeatedIndices = duplicateAnalysis.repeatedIndices;
      const missingIndices = duplicateAnalysis.missingPhoneIndices;

      const sharedRecords = list.filter((r) => sharedIndices.has(getRecordIndex(r)));
      const exactRecords = list.filter((r) => exactIndices.has(getRecordIndex(r)) && !sharedIndices.has(getRecordIndex(r)));
      const repeatedRecords = list.filter((r) => (r.hasRepeatedNumbers || repeatedIndices.has(getRecordIndex(r))) && !sharedIndices.has(getRecordIndex(r)) && !exactIndices.has(getRecordIndex(r)));
      const missingRecords = list.filter((r) => (isMissingPhone(r) || missingIndices.has(getRecordIndex(r))) && !sharedIndices.has(getRecordIndex(r)) && !exactIndices.has(getRecordIndex(r)) && !repeatedIndices.has(getRecordIndex(r)) && !r.hasRepeatedNumbers);
      const regularRecords = list.filter((r) => !sharedIndices.has(getRecordIndex(r)) && !exactIndices.has(getRecordIndex(r)) && !r.hasRepeatedNumbers && !repeatedIndices.has(getRecordIndex(r)) && !isMissingPhone(r) && !missingIndices.has(getRecordIndex(r)));

      // Group sharedRecords by shared phone
      const indexToSharedGroup = new Map<number, number>();
      duplicateAnalysis.sharedGroups.forEach((g, gIdx) => {
        g.indices.forEach((idx) => indexToSharedGroup.set(idx, gIdx));
      });
      const sharedMap = new Map<number, ContactRecord[]>();
      const sharedGroupOrder: number[] = [];
      sharedRecords.forEach((r) => {
        const gIdx = indexToSharedGroup.get(getRecordIndex(r)) ?? -1;
        if (!sharedMap.has(gIdx)) {
          sharedMap.set(gIdx, []);
          sharedGroupOrder.push(gIdx);
        }
        sharedMap.get(gIdx)!.push(r);
      });
      const sortedShared: ContactRecord[] = [];
      sharedGroupOrder.forEach((gIdx) => {
        const members = sharedMap.get(gIdx)!;
        members.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        sortedShared.push(...members);
      });

      // Group exactRecords by exact key
      const indexToExactGroup = new Map<number, number>();
      duplicateAnalysis.exactGroups.forEach((g, gIdx) => {
        g.indices.forEach((idx) => indexToExactGroup.set(idx, gIdx));
      });
      const exactMap = new Map<number, ContactRecord[]>();
      const exactGroupOrder: number[] = [];
      exactRecords.forEach((r) => {
        const gIdx = indexToExactGroup.get(getRecordIndex(r)) ?? -1;
        if (!exactMap.has(gIdx)) {
          exactMap.set(gIdx, []);
          exactGroupOrder.push(gIdx);
        }
        exactMap.get(gIdx)!.push(r);
      });
      const sortedExact: ContactRecord[] = [];
      exactGroupOrder.forEach((gIdx) => {
        const members = exactMap.get(gIdx)!;
        members.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        sortedExact.push(...members);
      });

      regularRecords.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

      const combinedGrouped = [...sortedShared, ...sortedExact, ...repeatedRecords, ...missingRecords, ...regularRecords];
      const seenCombinedIds = new Set<string>();
      const uniqueCombined: ContactRecord[] = [];
      combinedGrouped.forEach((item) => {
        if (!seenCombinedIds.has(item.id)) {
          seenCombinedIds.add(item.id);
          uniqueCombined.push(item);
        }
      });
      return uniqueCombined;
    }

    // 3. Regular Individual Sorting
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

    // Final safety deduplication
    const finalSeenIds = new Set<string>();
    const finalList: ContactRecord[] = [];
    list.forEach((item) => {
      if (!finalSeenIds.has(item.id)) {
        finalSeenIds.add(item.id);
        finalList.push(item);
      }
    });
    return finalList;
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
    setExportFormat('VCF');
    setIsExportPreviewOpen(true);
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      addToast('No contacts available to export', 'warn');
      return;
    }
    setExportFormat('CSV');
    setIsExportPreviewOpen(true);
  };

  const handleConfirmExport = () => {
    setIsExportPreviewOpen(false);
    if (exportFormat === 'VCF') {
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
          addToast(`Success: ${records.length} contacts exported in VCF format`, 'success');
        }
      );
    } else {
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
          addToast(`Success: ${records.length} contacts exported in CSV format`, 'success');
        }
      );
    }
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
          onProcessRaw={(rawText) => {
            handleProcessRaw(rawText);
            navigateToApp();
          }}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
          totalContactsCount={totalCount}
          upgradedCount={upgradedCount}
          deferredCount={reviewCount}
        />
        <PwaInstallPrompt />
        <PwaSplashScreen onEnterWorkspace={navigateToApp} onEnterLanding={navigateToLanding} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toast toasts={toasts} />

      {/* Top Application Workspace Navigation Bar */}
      <div className="sticky top-0 z-[100] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-md">
        {/* Gambia flag top stripe accent */}
        <div className="h-1 sm:h-1.5 flex w-full">
          <div className="flex-[6] bg-[#CE1126]" />
          <div className="flex-[1] bg-white" />
          <div className="flex-[4] bg-[#0C1C8C]" />
          <div className="flex-[1] bg-white" />
          <div className="flex-[6] bg-[#3A7728]" />
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 min-h-[64px] sm:min-h-[72px] flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              id="backToLandingBtn"
              onClick={navigateToLanding}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer shrink-0"
              title="Return Home"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block shrink-0" />

            <div className="flex items-center">
              <button
                type="button"
                onClick={navigateToLanding}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
                title="Go to Home"
              >
                <img
                  src={darkMode ? `${import.meta.env.BASE_URL}logo-for-darkmode.svg` : `${import.meta.env.BASE_URL}logo-for-lightmode.svg`}
                  alt="Auto Contacts Upgrader Logo"
                  className="h-12 sm:h-14 md:h-16 w-auto max-w-[200px] sm:max-w-[280px] object-contain transition-all"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {totalCount > 0 && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {upgradedCount} / {totalCount} upgraded
              </span>
            )}

            <button
              type="button"
              onClick={handleLoadSampleContacts}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Load demo Gambian contacts"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="inline">Load Sample</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100/70 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Decorative Strip - Gambia Flag Gradient (Red - White - Blue - White - Green) */}
        <div
          className="h-1.5 sm:h-2 w-full bg-[linear-gradient(to_right,#CE1126_0%,#CE1126_32%,#FFFFFF_38%,#0C1C8C_44%,#0C1C8C_56%,#FFFFFF_62%,#3A7728_68%,#3A7728_100%)] shadow-[0_4px_14px_rgba(0,0,0,0.22)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.7)] relative z-20"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Workspace Banner */}
        <Header
          totalContacts={totalCount}
          upgradedCount={upgradedCount}
          showReference={showReference}
          onToggleReference={() => setShowReference(!showReference)}
        />

        {/* Optional Collapsible Reference Guide & Tester */}
        {showReference && (
          <div className="space-y-6 mb-6">
            <PuraRulesGuide />
            <LiveSandbox
              includeCountryCode={includeCountryCode}
              onAddContact={handleAddContact}
            />
          </div>
        )}


        {/* 1 & 2. Import File and Paste Raw records */}
        <ScrollReveal>
          <ImportSection
            onImportFile={handleImportFile}
            onProcessRaw={handleProcessRaw}
            onClearAll={handleClearAll}
            onFileError={(msg) => addToast(msg, 'warn')}
            totalRecords={totalCount}
            importProgress={importProgress}
          />
        </ScrollReveal>

        {/* 2. Review & Filter */}
        <ScrollReveal>
          <div
            ref={reviewSectionRef}
            id="section-review-and-filter"
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm scroll-mt-24 mb-6"
          >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                2. Review & Filter
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Interactive Table
            </span>
          </div>

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
            canUndo={history.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            undoSnapshots={history}
            redoSnapshots={redoStack}
            onUndoToSnapshot={handleUndoToSnapshot}
            onRedoToSnapshot={handleRedoToSnapshot}
            onClearWorkspace={handleClearAll}
          />

          <ContactTable
            records={displayRecords}
            allRecords={records}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={(record) => setEditingRecord(record)}
            onDelete={handleDeleteContact}
            onCopyText={handleCopyText}
            exactDuplicateIds={duplicateAnalysis.exactIndices}
            sharedDuplicateIds={duplicateAnalysis.sharedIndices}
            repeatedDuplicateIds={duplicateAnalysis.repeatedIndices}
            missingPhoneIds={duplicateAnalysis.missingPhoneIndices}
            duplicateAnalysis={duplicateAnalysis}
            modifiedContactIds={modifiedContactIds}
            onClearModifiedHighlights={() => setModifiedContactIds(new Set())}
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
            onCleanAllSharedNumbers={() => setIsCleanSharedModalOpen(true)}
            onRemoveExactDuplicates={handleRemoveExactDuplicates}
            filterOption={filterOption}
            onFilterChange={setFilterOption}
            onOpenDuplicateAnalysis={handleOpenDuplicateAnalysis}
            isLoading={Boolean(importProgress?.isProcessing || isAnalyzing)}
            searchQuery={searchQuery}
          />

          {totalCount > 0 && (
            <div className="mt-6 mb-6">
              <ScrollReveal>
                <OperatorDistributionChart data={operatorData} />
              </ScrollReveal>
            </div>
          )}

          {/* Section 2 Footer Actions / Workspace & Selection Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/80">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {totalCount > 0 && (
                <button
                  id="clearBtn"
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Workspace ({totalCount})</span>
                </button>
              )}

              {records.length > 0 && (duplicateAnalysis.exactCount + duplicateAnalysis.sharedCount + duplicateAnalysis.repeatedCount + duplicateAnalysis.missingPhoneCount === 0) && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  No duplicate conflicts
                </span>
              )}
            </div>

            {/* Batch Selection Operations */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedIds.size >= 2 && (
                <button
                  id="mergeSelectedBtn"
                  onClick={handleOpenMergeForSelected}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer animate-fade-in"
                >
                  <GitMerge className="w-4 h-4" />
                  <span>Merge Selected ({selectedIds.size})</span>
                </button>
              )}

              {selectedIds.size > 0 && (
                <button
                  id="deleteSelectedBtn"
                  onClick={handleDeleteSelected}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedIds.size})</span>
                </button>
              )}

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 cursor-pointer"
                >
                  Deselect all
                </button>
              )}
            </div>
          </div>
          </div>
        </ScrollReveal>

        {/* 3. Format Exports */}
        <ScrollReveal>
          <div
            id="section-format-exports"
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                3. Format & Export
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {upgradedCount} / {totalCount} Ready
              </span>
            </div>

            <ExportActionBar
              includeCountryCode={includeCountryCode}
              onToggleCountryCode={handleToggleCountryCode}
              selectedCount={selectedIds.size}
              totalCount={totalCount}
              onExportVCF={handleExportVCF}
              onExportCSV={handleExportCSV}
            />
          </div>
        </ScrollReveal>
      </div>

      <BackToTop />

      {/* Duplicate Analysis Modal */}
      <DuplicateModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        analysis={duplicateAnalysis}
        totalLoadedContacts={records.length}
        instructionProgress={instructionProgress}
        onFilterExact={() => {
          setIsDuplicateModalOpen(false);
          setSearchQuery('');
          setFilterOption('duplicate-exact');
          scrollToReviewSection();
          addToast(`Filtered table to show Exact Duplicates (${duplicateAnalysis.exactCount} records)`, 'info');
        }}
        onFilterShared={() => {
          setIsDuplicateModalOpen(false);
          setSearchQuery('');
          setFilterOption('duplicate-shared');
          scrollToReviewSection();
          addToast(`Filtered table to show Shared Phone Numbers (${duplicateAnalysis.sharedCount} records)`, 'info');
        }}
        onFilterRepeated={() => {
          setIsDuplicateModalOpen(false);
          setSearchQuery('');
          setFilterOption('repeated-number');
          scrollToReviewSection();
          addToast(`Filtered table to show Repeated Numbers (${duplicateAnalysis.repeatedCount} records)`, 'info');
        }}
        onFilterMissing={() => {
          setIsDuplicateModalOpen(false);
          setSearchQuery('');
          setFilterOption('missing-phone');
          scrollToReviewSection();
          addToast(`Filtered table to show No Telephone Number contacts (${duplicateAnalysis.missingPhoneCount} records)`, 'info');
        }}
        onRemoveExactDuplicates={handleRemoveExactDuplicates}
        onMergeGroup={(indices) => {
          setIsDuplicateModalOpen(false);
          handleOpenMergeForIndices(indices);
        }}
        onCleanRepeatedNumbers={handleCleanAllRepeatedNumbers}
        onBulkMergeShared={handleBulkMergeShared}
        onStartSequentialMerge={() => {
          setIsDuplicateModalOpen(false);
          handleStartSequentialMerge();
        }}
        onStartExactWizard={() => {
          setIsDuplicateModalOpen(false);
          setIsExactWizardOpen(true);
        }}
        onStartRepeatedWizard={() => {
          setIsDuplicateModalOpen(false);
          setIsRepeatedWizardOpen(true);
        }}
        onStartMissingPhoneWizard={() => {
          setIsDuplicateModalOpen(false);
          setIsMissingPhoneWizardOpen(true);
        }}
        onClearMissingContacts={handleDeleteAllMissingPhoneContacts}
      />

      {/* Exact Duplicate Wizard Modal */}
      <ExactDuplicateWizardModal
        isOpen={isExactWizardOpen}
        onClose={() => setIsExactWizardOpen(false)}
        groups={duplicateAnalysis.exactGroups}
        allRecords={records}
        onKeepRecord={handleKeepExactRecord}
        onBulkResolveAll={handleRemoveExactDuplicates}
        includeCountryCode={includeCountryCode}
      />

      {/* Repeated Numbers Wizard Modal */}
      <RepeatedNumbersWizardModal
        isOpen={isRepeatedWizardOpen}
        onClose={() => setIsRepeatedWizardOpen(false)}
        repeatedGroups={duplicateAnalysis.repeatedGroups}
        allRecords={records}
        onSaveContactPhones={handleSaveContactPhones}
        onCleanAllRepeated={handleCleanAllRepeatedNumbers}
        includeCountryCode={includeCountryCode}
      />

      {/* Missing Phone Wizard Modal */}
      <MissingPhoneWizardModal
        isOpen={isMissingPhoneWizardOpen}
        onClose={() => setIsMissingPhoneWizardOpen(false)}
        missingGroups={missingPhoneGroups}
        allRecords={records}
        onAddPhoneToContact={handleAddPhoneToContact}
        onDeleteContact={handleDeleteContact}
        onPurgeAllMissing={handleDeleteAllMissingPhoneContacts}
        includeCountryCode={includeCountryCode}
      />

      {/* Merge Contacts Modal */}
      <MergeContactsModal
        key={mergingContacts ? mergingContacts.map((c) => c.id).join('-') : 'none'}
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

      {/* Export Preview Modal */}
      <ExportPreviewModal
        isOpen={isExportPreviewOpen}
        onClose={() => setIsExportPreviewOpen(false)}
        format={exportFormat}
        records={records}
        onConfirmExport={handleConfirmExport}
        includeCountryCode={includeCountryCode}
      />

      {/* Clean Shared Numbers Options Modal */}
      <CleanSharedModal
        isOpen={isCleanSharedModalOpen}
        onClose={() => setIsCleanSharedModalOpen(false)}
        totalSharedCount={duplicateAnalysis.sharedCount}
        sharedGroupsCount={duplicateAnalysis.sharedGroups.length}
        sampleGroup={duplicateAnalysis.sharedGroups[0] || null}
        onConfirm={(strat) => handleBulkMergeShared(strat)}
        isLoading={!!(instructionProgress && instructionProgress.title.startsWith('Bulk Merge Shared Groups') && instructionProgress.status === 'running')}
      />

      {/* Action Summary & Affected Contacts Modal */}
      <ActionSummaryModal
        isOpen={Boolean(actionSummaryData)}
        onClose={() => setActionSummaryData(null)}
        data={actionSummaryData}
        onViewInTable={() => {
          scrollToReviewSection();
        }}
      />

      {/* PWA Install Prompt & Offline Notification */}
      <PwaInstallPrompt />
      <PwaSplashScreen onEnterWorkspace={navigateToApp} onEnterLanding={navigateToLanding} />
    </div>
  );
}
