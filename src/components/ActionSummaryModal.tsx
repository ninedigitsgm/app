import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  GitMerge, 
  Sparkles, 
  CopyCheck, 
  UserCheck, 
  Edit3, 
  Info, 
  Search, 
  Eye,
  ArrowLeftRight
} from 'lucide-react';
import { ActionSummaryData } from '../types';

interface ActionSummaryModalProps {
  isOpen?: boolean;
  data: ActionSummaryData | null;
  onClose: () => void;
  onViewInTable?: () => void;
}

export const ActionSummaryModal: React.FC<ActionSummaryModalProps> = ({
  isOpen = true,
  data,
  onClose,
  onViewInTable,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !data) {
    return null;
  }

  const getActionIcon = () => {
    switch (data.actionType) {
      case 'bulk-merge':
      case 'merge':
        return <GitMerge className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />;
      case 'clean-repeated':
        return <CopyCheck className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />;
      case 'deduplicate':
        return <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />;
      case 'edit':
        return <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />;
      case 'add':
      case 'add-phone':
        return <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getActionBadgeColor = () => {
    switch (data.actionType) {
      case 'bulk-merge':
      case 'merge':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'clean-repeated':
        return 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'deduplicate':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'edit':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'add':
      case 'add-phone':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const filteredContacts = data.affectedContacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.originalPhone && c.originalPhone.toLowerCase().includes(q)) ||
      c.upgradedPhone.toLowerCase().includes(q) ||
      (c.changeNote && c.changeNote.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-[220] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl my-auto max-h-[85vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl border ${getActionBadgeColor()} shrink-0`}>
              {getActionIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {data.title}
                </h2>
                <span className="text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>{data.affectedContacts.length} Contact{data.affectedContacts.length === 1 ? '' : 's'} Affected</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {data.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Notice Strip */}
        <div className="px-3.5 sm:px-4 py-2 bg-red-50/80 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/40 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-red-900 dark:text-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>
              All <b>{data.affectedContacts.length}</b> affected contacts are now highlighted in <b>faint red</b> on the main table for quick identification.
            </span>
          </div>
          {data.stats && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {data.stats.removedOrMergedCount !== undefined && data.stats.removedOrMergedCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Consolidated: <b>{data.stats.removedOrMergedCount}</b>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Optional Search Filter inside modal if > 4 contacts */}
        {data.affectedContacts.length > 4 && (
          <div className="px-3.5 sm:px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search affected contacts by name, number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        )}

        {/* Mobile & Tablet Horizontal Scroll Guidance Banner */}
        {filteredContacts.length > 0 && (
          <div className="lg:hidden bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 px-3.5 py-1.5 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2 shrink-0">
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 animate-pulse" />
            <span>
              Scroll/slide left and right to view other columns such as <b>Upgraded result</b> and <b>Action Details</b>.
            </span>
          </div>
        )}

        {/* Content Body / List of Affected Contacts */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
          {filteredContacts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No contacts match your filter search.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[520px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <th className="py-2.5 px-2.5 w-10 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[180px]">Contact Name</th>
                      <th className="py-2.5 px-3 min-w-[140px]">Upgraded Result</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Action Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredContacts.map((contact, idx) => (
                      <tr 
                        key={`summary-contact-${contact.id || 'idx'}-${idx}`}
                        className="hover:bg-red-50/40 dark:hover:bg-red-950/20 bg-red-50/20 dark:bg-red-950/10 transition"
                      >
                        <td className="py-2.5 px-2.5 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                            <span>{contact.name}</span>
                          </div>
                          {contact.previousNames && contact.previousNames.length > 1 && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Merged from: {contact.previousNames.join(', ')}
                            </div>
                          )}
                          {contact.originalPhone && contact.originalPhone !== contact.upgradedPhone && (
                            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                              Original: {contact.originalPhone}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-emerald-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{contact.upgradedPhone}</span>
                            {contact.status === 'ok' && (
                              <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] font-medium leading-relaxed">
                            {contact.changeNote || 'Updated & standardized to 9-digits'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 bg-white dark:bg-slate-900 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Faint red highlights remain active until cleared or next session.</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {onViewInTable && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewInTable();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View in Table</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Close</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
