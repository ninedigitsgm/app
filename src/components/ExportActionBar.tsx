import React from 'react';
import { CopyCheck, Trash2, Download, FileSpreadsheet, GitMerge } from 'lucide-react';

interface ExportActionBarProps {
  includeCountryCode: boolean;
  onToggleCountryCode: () => void;
  selectedCount: number;
  totalCount: number;
  onAnalyzeDuplicates: () => void;
  onDeleteSelected: () => void;
  onMergeSelected: () => void;
  onExportVCF: () => void;
  onExportCSV: () => void;
}

export const ExportActionBar: React.FC<ExportActionBarProps> = ({
  includeCountryCode,
  onToggleCountryCode,
  selectedCount,
  totalCount,
  onAnalyzeDuplicates,
  onDeleteSelected,
  onMergeSelected,
  onExportVCF,
  onExportCSV,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 mt-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        {/* Prefix Toggle */}
        <label className="toggle-group flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <input
            type="checkbox"
            id="countryCodePrefixToggle"
            checked={includeCountryCode}
            onChange={onToggleCountryCode}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Include +220 Country Code Prefix</span>
        </label>

        {/* Deduplicate Button */}
        <button
          id="analyzeDuplicatesBtn"
          onClick={onAnalyzeDuplicates}
          className="px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <CopyCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Analyze Duplicates</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Merge Selected (Visible & Highlighted when 2+ selected) */}
        {selectedCount >= 2 && (
          <button
            id="mergeSelectedBtn"
            onClick={onMergeSelected}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer animate-fade-in"
          >
            <GitMerge className="w-4 h-4" />
            <span>🔀 Merge Selected ({selectedCount})</span>
          </button>
        )}

        {/* Delete Selected */}
        <button
          id="deleteSelectedBtn"
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>🗑️ Delete Selected {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
        </button>

        {/* Export VCF */}
        <button
          id="exportVcfBtn"
          onClick={onExportVCF}
          disabled={totalCount === 0}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Updated Contacts (.VCF)</span>
        </button>

        {/* Export CSV */}
        <button
          id="exportCsvBtn"
          onClick={onExportCSV}
          disabled={totalCount === 0}
          className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download Results (.CSV)</span>
        </button>
      </div>
    </div>
  );
};
