import React, { useState, useRef } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Upload, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  FileSpreadsheet, 
  Users, 
  ShieldCheck, 
  HelpCircle, 
  FolderOpen, 
  RefreshCw, 
  FileText,
  RotateCcw,
  Undo2,
  Redo2,
  Trash2,
  AlertTriangle,
  Lock,
  Check
} from 'lucide-react';

export const GettingStartedTutorial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'android' | 'iphone' | 'tablet' | 'desktop'>('android');
  const [activeStep, setActiveStep] = useState<number>(1);
  const stepBoxRef = useRef<HTMLDivElement>(null);

  const goToStep = (stepNumber: number) => {
    setActiveStep(stepNumber);
    setTimeout(() => {
      if (stepBoxRef.current) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 60;
        const flagBarHeight = 6;
        const offset = headerHeight + flagBarHeight + 16;
        const rect = stepBoxRef.current.getBoundingClientRect();
        const targetScrollY = rect.top + window.scrollY - offset;
        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'smooth'
        });
      }
    }, 10);
  };

  const steps = [
    {
      num: 1,
      title: "Step 1: Export Your Contacts (Instant Safe Backup)",
      subtitle: "Saves a complete backup file so recovery is easy with zero panic",
      icon: Upload,
      color: "emerald"
    },
    {
      num: 2,
      title: "Step 2: Upload to Safe Staging Sandbox",
      subtitle: "Does NOT touch your phonebook directly; 100% on-device",
      icon: RefreshCw,
      color: "blue"
    },
    {
      num: 3,
      title: "Step 3: Review, Diffs, Undo/Redo & Clean",
      subtitle: "Inspect side-by-side changes, merge duplicates, use Undo/Redo",
      icon: Sparkles,
      color: "amber"
    },
    {
      num: 4,
      title: "Step 4: Download Upgraded File",
      subtitle: "Save your ready-to-import vCard (.vcf) or CSV when happy",
      icon: Download,
      color: "purple"
    },
    {
      num: 5,
      title: "Step 5: Delete Old Contacts & Re-Import",
      subtitle: "Delete old entries first to prevent non-Gambian & 7-digit duplicates",
      icon: CheckCircle2,
      color: "teal"
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-10 shadow-lg relative overflow-hidden">
      {/* Header Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          COMPLETE BEGINNER'S GUIDE
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
          How to Get Started (Step-by-Step)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
          No technical knowledge needed! Follow this plain-English guide covering your safety backup, live change preview, and clean re-importing.
        </p>

        {/* Device Tabs for Step 1 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 p-1.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android Phone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('iphone')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'iphone'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>iPhone / Apple</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tablet')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tablet'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet (iPad / Tab)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Desktop / Laptop</span>
          </button>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => goToStep(s.num)}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              activeStep === s.num
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500/30'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                activeStep === s.num ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {s.num}
              </span>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Step {s.num} of 5</span>
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm line-clamp-1">{s.title.split(': ')[1]}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">{s.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Detailed Step Content Box */}
      <div ref={stepBoxRef} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[380px]">
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: Exporting Your Contacts ({activeTab === 'android' ? 'Android Phone' : activeTab === 'iphone' ? 'iPhone' : activeTab === 'tablet' ? 'Tablet' : 'Desktop / Laptop'})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Exporting saves a permanent copy to your device, acting as an instant safety backup.
                </p>
              </div>
            </div>

            {/* Safety Backup Callout */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Step 1 Doubles as Your Safety Backup: </span>
                When you export your contacts, that file is saved safely on your device as a 100% untouched backup. If you ever want to revert or recover, you have the original file right in your Downloads folder for easy recovery with zero panic!
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {activeTab === 'android' && (
                <>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> Method A: Google Contacts or Default Contacts App
                    </div>
                    <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                      <li>Open the <b>Google Contacts</b> app or the <b>default Contacts app</b> your phone came with (such as Samsung Contacts, Xiaomi, Tecno, etc.).</li>
                      <li>Tap your <b>Profile Picture</b>, the 3-dots menu, or <b>Fix &amp; manage / Settings</b>.</li>
                      <li>Tap <b>Export contacts</b> or <b>Manage contacts</b> &rarr; <b>Export to .vcf file</b>.</li>
                      <li>Select all contacts and save the file to your phone's <b>Downloads</b> folder.</li>
                    </ol>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" /> Method B: If Backed Up to Google Contacts
                    </div>
                    <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                      <li>If you have backed up your contacts to Google Contacts, open any web browser and go to <a href="https://contacts.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">contacts.google.com</a>.</li>
                      <li>Sign in with your Google account.</li>
                      <li>Click <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600"><Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Export</span> on the left navigation menu.</li>
                      <li>Choose <b>Google CSV</b> or <b>vCard for Android or iOS</b>, then click <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600"><Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Export</span>.</li>
                    </ol>
                  </div>
                </>
              )}

              {activeTab === 'iphone' && (
                <>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> Method A: Using iCloud (Recommended for iPhones)
                    </div>
                    <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                      <li>On your iPhone or computer, open Safari and go to <a href="https://www.icloud.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">icloud.com</a>.</li>
                      <li>Sign in with your Apple ID and open <b>Contacts</b>.</li>
                      <li>Click the gear/settings icon in the bottom-left corner and click <b>Select All</b>.</li>
                      <li>Click the gear icon again and choose <b>Export vCard...</b> to save the file.</li>
                    </ol>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" /> Method B: Direct Sharing from Contacts App
                    </div>
                    <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                      <li>Open the <b>Contacts</b> app on iPhone.</li>
                      <li>Tap and hold a contact list or share contacts to Files app as vCard.</li>
                    </ol>
                  </div>
                </>
              )}

              {activeTab === 'tablet' && (
                <div className="col-span-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Tablet className="w-4 h-4" /> Tablet Export Guide (iPad / Android Tablet)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Just like phones, you can export your tablet address book by logging into <a href="https://contacts.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">contacts.google.com</a> (for Android tablets) or <a href="https://www.icloud.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">icloud.com</a> (for iPads) in your web browser, clicking <b>Export</b>, and saving the `.vcf` or `.csv` file to your tablet.
                  </p>
                </div>
              )}

              {activeTab === 'desktop' && (
                <div className="col-span-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4" /> Desktop & Laptop Export Guide (Mac / Windows PC)
                  </div>
                  <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                    <li><b>Mac (Apple Contacts App):</b> Open Contacts app &rarr; Select all contacts (Cmd + A) &rarr; Click File &rarr; Export &rarr; Export vCard...</li>
                    <li><b>Windows PC / Web:</b> Open <a href="https://contacts.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">contacts.google.com</a> in Chrome/Edge &rarr; Click Export &rarr; Download as vCard or CSV.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 2: Upload to Safe Staging Sandbox
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Non-destructive staging area: contacts on your phone are NEVER changed directly.
                </p>
              </div>
            </div>

            {/* Privacy & Non-Destructive Reassurance */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero Direct Phonebook Modification: </span>
                This app operates as an independent staging sandbox. It does not alter, delete, or modify contacts directly inside your phone's address book while you work. Everything runs in local browser memory.
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-200 space-y-2.5 leading-relaxed">
                <li>Click the <b>"Upload &amp; Upgrade Contacts"</b> button at the top of the page.</li>
                <li>Drag and drop your exported <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-emerald-600">.vcf</code> or <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-emerald-600">.csv</code> file into the upload box (or click to browse your files).</li>
                <li>Our tool instantly parses every contact on your device with 100% on-device speed.</li>
              </ol>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 3: Review Changes, Merge Duplicates &amp; Use Undo/Redo
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Inspect before-and-after number previews, merge duplicate records, and undo mistakes freely.
                </p>
              </div>
            </div>

            {/* Undo/Redo & Visual Diff Callout */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
              <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Undo &amp; Redo Protection: </span>
                Made a mistaken edit or deleted a contact accidentally? Simply click the <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs"><Undo2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Undo</span> or <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs"><Redo2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Redo</span> buttons in the toolbar. You never have to restart the whole process from scratch!
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">1. QCell (+83), Comium (+86), Africell (+87)</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  All upgraded numbers are clearly displayed side-by-side with original prefixes highlighted in bright green.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-xs text-amber-600 dark:text-amber-400">2. Gamcel &amp; Gamtel Preserved</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Gamcel 9-series numbers and Gamtel landlines remain 7 digits per official PURA Phase 1 guidelines.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-xs text-purple-600 dark:text-purple-400">3. Duplicate Merging &amp; Cleanup</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Detects duplicate names or shared numbers and merges them into unified records with 1 click.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 4: Review &amp; Download Your Upgraded File
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Inspect the preview and download when you are 100% happy with all changes.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-200 space-y-2 leading-relaxed">
                <li>Toggle whether you want the <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-bold">+220</code> country code included in your numbers.</li>
                <li>Click <b>"Download Upgraded Contacts (.VCF)"</b> to download a clean vCard file compatible with iPhone, Android, and WhatsApp.</li>
                <li>Alternatively, click <b>"Download Contacts (.CSV)"</b> for clean CSV format.</li>
                <li>The file downloads directly to your device's <b>Downloads</b> folder.</li>
              </ol>
            </div>
          </div>
        )}

        {activeStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">
                5
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 5: Delete Old Contacts &amp; Re-Import Upgraded File
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Follow the anti-duplication rule to ensure a clean, clutter-free address book.
                </p>
              </div>
            </div>

            {/* Critical Warning: Delete Before Re-Import */}
            <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Critical Step: Delete All Existing Contacts Before Re-importing!</span>
                </div>
                <p className="leading-relaxed">
                  Because your original export from <b>Step 1</b> is already saved on your device as a safety backup, <b>you must delete your existing contacts from your phone / Google Contacts / iCloud before re-importing</b>.
                </p>
                <p className="mt-1.5 leading-relaxed font-semibold">
                  Why? If you don't delete them first, your phone will merge both old and new lists, causing duplicate entries of:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium">
                  <li><b>Non-Gambian numbers</b> (international contacts)</li>
                  <li><b>Non-Phase 1 contacts</b> (Gamcel &amp; Gamtel landlines)</li>
                  <li><b>Old 7-digit numbers</b> alongside new 9-digit numbers</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Android Method A: Google Contacts or Default Contacts App
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <li>Open the <b>Files</b> or <b>Downloads</b> app on your Android phone.</li>
                  <li>Tap your downloaded upgraded <code className="bg-slate-100 dark:bg-slate-900 px-1">.vcf</code> file.</li>
                  <li>Select <b>Google Contacts</b> or the <b>default Contacts app</b> your phone came with to import.</li>
                  <li>Alternatively, open your Contacts app &rarr; <b>Settings / Fix &amp; manage</b> &rarr; <b>Import from file</b>.</li>
                </ol>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4" /> Android Method B: If Backed Up to Google Contacts
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <li>If you have backed up your contacts to Google Contacts, go to <a href="https://contacts.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">contacts.google.com</a>.</li>
                  <li>Select all old contacts and click the <b>Trash / Delete</b> icon (your Step 1 file is your safe backup).</li>
                  <li>Click <b>Import</b> on the left menu and select your downloaded upgraded <code className="bg-slate-100 dark:bg-slate-900 px-1">.vcf</code> file.</li>
                  <li>Your phone and WhatsApp will sync with clean 9-digit contacts within seconds!</li>
                </ol>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> iPhone &amp; iCloud Re-Import
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <li>On <a href="https://www.icloud.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">icloud.com</a> &rarr; Contacts, select all old contacts and delete them.</li>
                  <li>Open the <b>Files</b> app on your iPhone, tap your downloaded upgraded <code className="bg-slate-100 dark:bg-slate-900 px-1">.vcf</code> file.</li>
                  <li>Tap <b>Add All Contacts</b> to import your clean 9-digit address book.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons between steps */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => goToStep(Math.max(1, activeStep - 1))}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeStep === 1
                ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
                : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 cursor-pointer'
            }`}
          >
            Previous
          </button>

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center whitespace-nowrap px-2">
            Step {activeStep} of 5
          </span>

          <button
            type="button"
            disabled={activeStep === 5}
            onClick={() => goToStep(Math.min(5, activeStep + 1))}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
              activeStep === 5
                ? 'opacity-40 cursor-not-allowed bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
