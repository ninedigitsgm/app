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
            iOS handles bulk contact card files in a unique way. To successfully save and upgrade your entire contact list without losing any names, please follow these exact steps:
          </p>

          <div className="space-y-4 pl-1.5 border-l-2 border-blue-400 dark:border-blue-600">
            {/* Step 1 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 1: Download the File
              </span>
              <p className="text-xs sm:text-sm">
                Tap <strong>"Initiate File Download"</strong> in the next screen. Safari will show a clean prompt asking to download the contact list. Tap <strong>"Download"</strong>, and it will save directly into your local storage Downloads folder.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                Step 2: Clean Old Contacts (Highly Recommended)
              </span>
              <p className="text-xs sm:text-sm text-slate-655 dark:text-slate-350">
                Open your iPhone <strong>Contacts</strong> app and delete your old list first. This ensures you do not get duplicate, un-upgraded entries or old 7-digit numbers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 3: Open File in Apple Files App
              </span>
              <p className="text-xs sm:text-sm">
                Open the native <strong>Files</strong> app on your iPhone, go to <strong>Locations</strong> (or <strong>On My iPhone</strong>), open the <strong>Downloads</strong> folder, and tap the <strong>"GM_PURA_Upgraded_Contacts.vcf"</strong> file. <em className="text-slate-500 dark:text-slate-400 font-medium">Note: iOS will initially show only one contact on your screen, this is completely normal!</em>
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 4: Tap Share and Choose Contacts
              </span>
              <p className="text-xs sm:text-sm">
                Tap the <strong>Share</strong> button at the bottom-left corner of that single contact preview screen, then select the <strong>"Contacts"</strong> app icon from your share choices.
              </p>
            </div>

            {/* Step 5 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Step 5: Tap Save to Import All
              </span>
              <p className="text-xs sm:text-sm">
                Your full list of upgraded contacts will suddenly be displayed! Tap the <strong>"Save"</strong> button at the very top right of your screen. All your upgraded 9-digit contacts are now perfectly saved into your phonebook.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 p-3.5 text-xs text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">✨ Apple Device Secret:</p>
            Sharing the opened file from inside your Files app into the Contacts app is the golden iOS workaround that forces Safari and Apple to import all contacts simultaneously!
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
