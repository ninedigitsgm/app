import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Users, 
  CopyCheck, 
  Trash2, 
  Eye, 
  GitMerge, 
  Sparkles, 
  ArrowRight,
  Layers,
  Wand2,
  PhoneOff
} from 'lucide-react';
import { DuplicateAnalysisResult, InstructionProgressState } from '../types';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DuplicateAnalysisResult;
  totalLoadedContacts?: number;
  instructionProgress?: InstructionProgressState | null;
  onFilterExact: () => void;
  onFilterShared: () => void;
  onFilterRepeated?: () => void;
  onFilterMissing?: () => void;
  onRemoveExactDuplicates: () => void;
  onCleanRepeatedNumbers?: () => void;
  onClearMissingContacts?: () => void;
  onMergeGroup?: (indices: number[]) => void;
  onStartSequentialMerge?: () => void;
  onStartExactWizard?: () => void;
  onStartRepeatedWizard?: () => void;
  onStartMissingPhoneWizard?: () => void;
  onBulkMergeShared?: (strategy: 'slash' | 'and' | 'first') => void;
}

export const DuplicateModal: React.FC<DuplicateModalProps> = ({
  isOpen,
  onClose,
  analysis,
  totalLoadedContacts = 0,
  instructionProgress,
  onFilterExact,
  onFilterShared,
  onFilterRepeated,
  onFilterMissing,
  onRemoveExactDuplicates,
  onCleanRepeatedNumbers,
  onClearMissingContacts,
  onMergeGroup,
  onStartSequentialMerge,
  onStartExactWizard,
  onStartRepeatedWizard,
  onStartMissingPhoneWizard,
  onBulkMergeShared,
}) => {
  const [mergeStrategy, setMergeStrategy] = useState<'slash' | 'and' | 'first'>('slash');

  if (!isOpen) return null;

  const totalDuplicates = analysis.exactCount + analysis.sharedCount + (analysis.repeatedCount || 0) + (analysis.missingPhoneCount || 0);

  // Helper flags for individual action button loading states
  const isExactLoading = !!(instructionProgress && instructionProgress.title === 'Auto-Deduplicate Exact Matches' && instructionProgress.status === 'running');
  const isBulkMergeLoading = !!(instructionProgress && instructionProgress.title.startsWith('Bulk Merge Shared Groups') && instructionProgress.status === 'running');
  const isCleanRepeatedLoading = !!(instructionProgress && instructionProgress.title === 'Clean All Repeated Internal Numbers' && instructionProgress.status === 'running');
  const isPurgeLoading = !!(instructionProgress && instructionProgress.title === 'Purge Contacts Without Phone Numbers' && instructionProgress.status === 'running');
  const isAnyLoading = isExactLoading || isBulkMergeLoading || isCleanRepeatedLoading || isPurgeLoading;

  return (
    <div
      id="duplicateModal"
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="closeModalBtn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <CopyCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Duplicate & Number Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deep scan for exact duplicates, shared numbers, and repeated digits in contact cards
            </p>
          </div>
        </div>

        {totalLoadedContacts === 0 ? (
          <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-center space-y-2 my-4">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              ⚠️ Please load contacts first!
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-400">
              Import a .vcf/.csv file or paste contacts in the boxes above to run duplicate analysis.
            </p>
          </div>
        ) : totalDuplicates === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-2 my-4">
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              ✨ Clean Dataset! No duplicates or repeated numbers found
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
              Every contact record in memory has a unique name, distinct phone numbers, and no repeated internal digits.
            </p>
          </div>
        ) : (
          <div id="duplicateModalBody" className="space-y-4 my-4">
            {/* Section 1: Exact Matches */}
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                    Exact Duplicates (Same Name & Number)
                  </h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  {analysis.exactCount} records ({analysis.exactGroups.length} groups)
                </span>
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mb-3 leading-relaxed">
                Identical contact cards that have both the exact same contact name and telephone numbers.
              </p>

              {/* Exact Duplicate Wizard Launcher */}
              {analysis.exactGroups.length > 0 && onStartExactWizard && (
                <div className="p-3 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200">Exact Duplicates Wizard</span>
                  </div>
                  <button
                    onClick={() => {
                      onStartExactWizard();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Start Wizard ({analysis.exactGroups.length})
                  </button>
                </div>
              )}

              {analysis.exactCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="viewExactBtn"
                    onClick={() => {
                      onFilterExact();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View in Table</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!isAnyLoading) onRemoveExactDuplicates();
                    }}
                    disabled={isAnyLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
                      isExactLoading
                        ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-300 cursor-wait'
                        : isAnyLoading
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                        : 'bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 cursor-pointer'
                    }`}
                  >
                    {isExactLoading ? (
                      <span className="loader text-amber-600 dark:text-amber-400 shrink-0" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{isExactLoading ? 'Auto-Deduplicating...' : 'Auto-Deduplicate (Keep 1 copy)'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Section 2: Shared Numbers */}
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-300">
                    Shared Phone Numbers (Different Names)
                  </h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                  {analysis.sharedCount} records ({analysis.sharedGroups.length} shared lines)
                </span>
              </div>
              <p className="text-xs text-purple-800/90 dark:text-purple-300/80 mb-3 leading-relaxed">
                Cases where multiple contact names share the exact same phone number.
              </p>
              
              {/* Sequential Merge Wizard */}
              {analysis.sharedGroups.length > 0 && onStartSequentialMerge && (
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Shared Number Merge Assistant</span>
                  </div>
                  <button
                    onClick={() => {
                      onStartSequentialMerge();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Start Wizard
                  </button>
                </div>
              )}

              {/* Shared Groups breakdown */}
              {analysis.sharedGroups.length > 0 && (
                <div className="space-y-2 mb-3 max-h-44 overflow-y-auto pr-1">
                  {analysis.sharedGroups.map((group, gIdx) => (
                    <div
                      key={`shared-group-${gIdx}-${group.phone}`}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-900/80 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-bold text-purple-700 dark:text-purple-300">
                          {group.phone}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 truncate">
                          Names: <span className="font-semibold">{group.names.join(', ')}</span>
                        </div>
                      </div>
                      {onMergeGroup && (
                        <button
                          onClick={() => {
                            onMergeGroup(group.indices);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-xs transition cursor-pointer"
                        >
                          <GitMerge className="w-3 h-3" />
                          <span>Merge</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {analysis.sharedCount > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
                  <div className="flex items-center gap-2">
                    <button
                      id="viewSharedBtn"
                      onClick={() => {
                        onFilterShared();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View in Table</span>
                    </button>
                  </div>

                  {onBulkMergeShared && (
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={mergeStrategy}
                          disabled={isAnyLoading}
                          onChange={(e) => setMergeStrategy(e.target.value as any)}
                          className={`text-xs font-medium bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 shadow-sm transition ${
                            isAnyLoading ? 'opacity-60 cursor-not-allowed border-slate-300 dark:border-slate-700' : 'cursor-pointer border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500'
                          }`}
                        >
                          <option value="slash">Combine Names with " / "</option>
                          <option value="and">Combine Names with " & "</option>
                          <option value="first">Keep 1st Contact Name</option>
                        </select>
                        <button
                          onClick={() => {
                            if (!isAnyLoading) onBulkMergeShared(mergeStrategy);
                          }}
                          disabled={isAnyLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition shrink-0 ${
                            isBulkMergeLoading
                              ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 cursor-wait'
                              : isAnyLoading
                              ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                          }`}
                          title="Merges contacts sharing the same number per group without mixing unrelated contacts"
                        >
                          {isBulkMergeLoading ? (
                            <span className="loader text-indigo-600 dark:text-indigo-400 shrink-0" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {isBulkMergeLoading 
                              ? 'Merging Related Groups...' 
                              : `Bulk Merge Related Groups (${analysis.sharedGroups.length})`}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: Repeated Numbers within Contact Card */}
            <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/60 dark:bg-pink-950/20">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <CopyCheck className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-pink-900 dark:text-pink-300">
                    Repeated Numbers (Within Single Contact)
                  </h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-200 dark:bg-pink-900 text-pink-900 dark:text-pink-200">
                  {analysis.repeatedCount || 0} contacts ({analysis.repeatedGroups?.length || 0} flagged)
                </span>
              </div>
              <p className="text-xs text-pink-800/90 dark:text-pink-300/80 mb-3 leading-relaxed">
                Contact cards containing redundant, duplicate telephone numbers inside the same entry.
              </p>

              {/* Repeated Numbers Wizard Launcher */}
              {(analysis.repeatedGroups?.length || 0) > 0 && onStartRepeatedWizard && (
                <div className="p-3 rounded-lg bg-pink-100/60 dark:bg-pink-950/40 border border-pink-300 dark:border-pink-800 mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-pink-700 dark:text-pink-400" />
                    <span className="text-xs font-bold text-pink-950 dark:text-pink-200">Repeated Numbers Wizard</span>
                  </div>
                  <button
                    onClick={() => {
                      onStartRepeatedWizard();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Start Wizard ({analysis.repeatedGroups?.length || 0})
                  </button>
                </div>
              )}

              {(analysis.repeatedCount || 0) > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {onFilterRepeated && (
                    <button
                      onClick={() => {
                        onFilterRepeated();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View in Table</span>
                    </button>
                  )}

                  {onCleanRepeatedNumbers && (
                    <button
                      onClick={() => {
                        if (!isAnyLoading) onCleanRepeatedNumbers();
                      }}
                      disabled={isAnyLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
                        isCleanRepeatedLoading
                          ? 'bg-pink-100 dark:bg-pink-950/40 border-pink-400 text-pink-900 dark:text-pink-300 cursor-wait'
                          : isAnyLoading
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-white dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-950 border border-pink-300 dark:border-pink-800 text-pink-900 dark:text-pink-200 cursor-pointer'
                      }`}
                    >
                      {isCleanRepeatedLoading ? (
                        <span className="loader text-pink-600 dark:text-pink-400 shrink-0" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-pink-600" />
                      )}
                      <span>{isCleanRepeatedLoading ? 'Cleaning Repeated Numbers...' : 'Clean All Repeated Numbers'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Missing / No Phone Numbers */}
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <PhoneOff className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-300">
                    No Telephone Number
                  </h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">
                  {analysis.missingPhoneCount || 0} contacts
                </span>
              </div>
              <p className="text-xs text-rose-800/90 dark:text-rose-300/80 mb-3 leading-relaxed">
                Contact entries with blank or invalid phone number fields that cannot be upgraded.
              </p>

              {/* Missing Phone Numbers Wizard Launcher */}
              {(analysis.missingPhoneCount || 0) > 0 && onStartMissingPhoneWizard && (
                <div className="p-3 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                    <span className="text-xs font-bold text-rose-950 dark:text-rose-200">Missing Phone Wizard</span>
                  </div>
                  <button
                    onClick={() => {
                      onStartMissingPhoneWizard();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Start Wizard ({analysis.missingPhoneCount || 0})
                  </button>
                </div>
              )}

              {(analysis.missingPhoneCount || 0) > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {onFilterMissing && (
                    <button
                      onClick={() => {
                        onFilterMissing();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View in Table</span>
                    </button>
                  )}

                  {onClearMissingContacts && (
                    <button
                      onClick={() => {
                        if (!isAnyLoading) onClearMissingContacts();
                      }}
                      disabled={isAnyLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
                        isPurgeLoading
                          ? 'bg-rose-100 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-300 cursor-wait'
                          : isAnyLoading
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-white dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 cursor-pointer'
                      }`}
                    >
                      {isPurgeLoading ? (
                        <span className="loader text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{isPurgeLoading ? 'Deleting Empty Contacts...' : 'Delete All Empty Contacts'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
