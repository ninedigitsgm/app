import React from 'react';
import { Download } from 'lucide-react';

interface ExportActionBarProps {
  includeCountryCode: boolean;
  onToggleCountryCode: () => void;
  selectedCount?: number;
  totalCount: number;
  onExportVCF: () => void;
}

export const ExportActionBar: React.FC<ExportActionBarProps> = ({
  includeCountryCode,
  onToggleCountryCode,
  totalCount,
  onExportVCF,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      {/* Prefix Toggle */}
      <label htmlFor="countryCodePrefixToggle" className="toggle-group flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition">
        <input
          type="checkbox"
          id="countryCodePrefixToggle"
          checked={includeCountryCode}
          onChange={onToggleCountryCode}
          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
        />
        <span>Include <b>+220</b> Country Code Prefix</span>
      </label>

      {/* Export Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Export VCF */}
        <button
          id="exportVcfBtn"
          onClick={onExportVCF}
          disabled={totalCount === 0}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download Upgraded Contacts (.VCF)</span>
        </button>
      </div>
    </div>
  );
};

