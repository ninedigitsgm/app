import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  BookUser, 
  Check, 
  Copy, 
  FileText, 
  Table, 
  Download, 
  Info, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ContactRecord } from '../types';
import { generateCSV, generateVCF } from '../lib/puraEngine';
import { OperatorLogo } from './OperatorLogo';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: 'CSV' | 'VCF';
  records: ContactRecord[];
  onConfirmExport: () => void;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  format,
  records,
  onConfirmExport,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'raw'>('table');
  const [copied, setCopied] = useState(false);

  // Generate full raw output for accurate line counts and raw preview
  const rawContent = useMemo(() => {
    if (!isOpen) return '';
    return format === 'CSV' ? generateCSV(records) : generateVCF(records);
  }, [format, records, isOpen]);

  // Truncated version of raw output for rendering performance
  const rawContentPreview = useMemo(() => {
    if (!rawContent) return '';
    const lines = rawContent.split(/\r?\n/);
    const limit = format === 'CSV' ? 15 : 24; // Show first 15 lines of CSV or several vCard definitions
    if (lines.length > limit) {
      return lines.slice(0, limit).join('\n') + `\n\n... [${lines.length - limit} lines truncated for preview]`;
    }
    return rawContent;
  }, [rawContent, format]);

  const handleCopyRaw = () => {
    if (!rawContent) return;
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const fileName = format === 'CSV' ? 'GM_PURA_Upgraded_Contacts.csv' : 'GM_PURA_Upgraded_Contacts.vcf';
  const fileMime = format === 'CSV' ? 'text/csv' : 'text/vcard';
  const displayLimit = 8; // Number of items to display in table preview

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col z-10 animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${format === 'CSV' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600'}`}>
              {format === 'CSV' ? (
                <FileSpreadsheet className="w-6 h-6" />
              ) : (
                <BookUser className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Export Preview: {format} format</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 tracking-wider">
                  PRE-DOWNLOAD
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect and verify your upgraded contact entries before generating the final export.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info & Config Details */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Target File Name:</span>
            <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
              {fileName}
            </code>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Total: <strong className="font-extrabold text-slate-900 dark:text-slate-100">{records.length}</strong> contacts
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              Encoding: <strong className="font-extrabold text-slate-900 dark:text-slate-100">UTF-8</strong>
            </span>
          </div>
        </div>

        {/* Tabs Selection */}
        <div className="px-5 pt-3 flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('table')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'table'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Structured Table View</span>
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'raw'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Raw File Content Preview</span>
          </button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 dark:bg-slate-900/40">
          {activeTab === 'table' ? (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Contact Name</th>
                    <th className="p-3">Upgraded Mobile</th>
                    <th className="p-3">Operators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  {records.slice(0, displayLimit).map((rec, idx) => {
                    // Extract operators
                    const ops = rec.phoneNumbers?.map(p => p.operator as string).filter((o) => o !== 'Unknown') || [rec.operator as string];
                    const uniqueOps = Array.from(new Set(ops));

                    return (
                      <tr key={`prev-${rec.id || idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-3 text-center text-slate-400 font-mono font-medium">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{rec.name}</td>
                        <td className="p-3 font-mono font-semibold text-slate-600 dark:text-slate-300 break-all">{rec.result}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {uniqueOps.map((op, oIdx) => {
                              const opStr = op as string;
                              return (
                                <span 
                                  key={`op-${oIdx}`} 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                                >
                                  {['QCell', 'Comium', 'Africell', 'Gamcel', 'Gamtel'].includes(opStr) && (
                                    <OperatorLogo operator={opStr} size="xs" />
                                  )}
                                  <span>{opStr}</span>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {records.length > displayLimit && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Showing first {displayLimit} of {records.length} records in structured preview.</span>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                    <span>+{records.length - displayLimit} more contacts truncated</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed shadow-inner">
              {/* Copy Raw Code Overlay Button */}
              <button
                type="button"
                onClick={handleCopyRaw}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-[10px] font-sans font-bold z-10 shadow-md cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Full Raw File</span>
                  </>
                )}
              </button>

              <pre className="p-4 overflow-x-auto whitespace-pre-wrap max-h-[300px] text-slate-300 overflow-y-auto antialiased">
                {rawContentPreview}
              </pre>
            </div>
          )}
        </div>

        {/* Final checklist warning notice */}
        <div className="mx-5 my-2 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">PURA 9-Digit Number Plan Compliance Verified</span>
            All detected Gambia numbers have been standardized to 9-digits with proper country codes (+220), matching carrier allocations (Africell, QCell, Comium, Gamcel, Gamtel).
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onConfirmExport}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition cursor-pointer ${
              format === 'CSV' 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10'
            }`}
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>Initiate File Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
