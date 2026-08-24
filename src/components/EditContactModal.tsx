import React, { useEffect, useState } from 'react';
import { X, Save, Edit3, Sparkles } from 'lucide-react';
import { ContactRecord } from '../types';
import { processSingleNumber } from '../lib/puraEngine';

interface EditContactModalProps {
  record: ContactRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newName: string, newPhone: string) => void;
  includeCountryCode: boolean;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
  includeCountryCode,
}) => {
  const [name, setName] = useState('');
  const [rawPhone, setRawPhone] = useState('');

  useEffect(() => {
    if (record) {
      setName(record.name);
      setRawPhone(record.raw);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const phoneParts = rawPhone.split(/[,;\/]/).map((s) => s.trim()).filter(Boolean);
  const previews = phoneParts.map((p) => processSingleNumber(p, includeCountryCode));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(record.id, name.trim(), rawPhone.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Edit Contact Details
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modify contact name or telephone numbers
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Name:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fatou Ceesay"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number(s) (separate multiple by comma):
            </label>
            <input
              type="text"
              value={rawPhone}
              onChange={(e) => setRawPhone(e.target.value)}
              placeholder="e.g. 7123456, 3987654"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Live Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Live Migration Result Preview
            </div>
            {previews.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No number entered</span>
            ) : (
              previews.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">{p.originalRaw}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {p.result || 'Invalid'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
