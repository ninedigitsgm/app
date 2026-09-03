import React from 'react';
import { X, Smartphone, Check, Download } from 'lucide-react';

interface IOSGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const IOSGuideModal: React.FC<IOSGuideModalProps> = ({
  isOpen,
  onClose,
  onProceed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="iosGuideModal"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-150 dark:border-slate-800 transition-all transform scale-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 sm:p-5 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              iPhone / iPad Saving Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            When you initiate the download on iOS, your device will show a file option prompt. To save and restore your full upgraded contacts list easily, follow these quick steps:
          </p>

          <div className="space-y-3.5 pl-1.5 border-l-2 border-blue-400 dark:border-blue-600">
            {/* Step 1 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 1: Open Share Menu
              </span>
              <p className="text-xs sm:text-sm">
                Tap the <strong>Share</strong> button (the square icon with an arrow pointing up at the bottom of Safari) or tap <strong>"More..."</strong> under the file icon on your screen.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 2: Choose Save to Files
              </span>
              <p className="text-xs sm:text-sm">
                Scroll down through the listed iOS actions and tap on <strong>"Save to Files"</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 3: Save locally to "On My iPhone"
              </span>
              <p className="text-xs sm:text-sm">
                Under the <strong>Locations</strong> sidebar, tap on <strong>"On My iPhone"</strong>, then tap <strong>"Save"</strong> at the top right. This completely avoids iCloud storage limit errors!
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 4: Open and Import Contacts
              </span>
              <p className="text-xs sm:text-sm">
                Open your built-in Apple <strong>Files</strong> app, go to <strong>On My iPhone</strong>, and tap the <strong>"GM_PURA_Upgraded_Contacts.vcf"</strong> file to instantly load and add all your upgraded 9-digit contacts!
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-3.5 text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">💡 Pro Tip:</p>
            Saving locally on your physical device bypasses all iCloud limitations and imports the contact list instantly.
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>OK, Got It! Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
