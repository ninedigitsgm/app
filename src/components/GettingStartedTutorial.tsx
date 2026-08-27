import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

export const GettingStartedTutorial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'android' | 'iphone' | 'tablet' | 'desktop'>('android');
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: "Step 1: Export Your Contacts from Your Device",
      subtitle: "How to save a copy of your phonebook as a file",
      icon: Upload,
      color: "emerald"
    },
    {
      num: 2,
      title: "Step 2: Upload File to This Upgrader",
      subtitle: "Secure, instant browser-based 9-digit conversion",
      icon: RefreshCw,
      color: "blue"
    },
    {
      num: 3,
      title: "Step 3: Review, Filter & Clean",
      subtitle: "Inspect QCell, Comium, Africell and remove duplicates",
      icon: Sparkles,
      color: "amber"
    },
    {
      num: 4,
      title: "Step 4: Download Upgraded File",
      subtitle: "Save your ready-to-import vCard (.vcf) or CSV file",
      icon: Download,
      color: "purple"
    },
    {
      num: 5,
      title: "Step 5: Import Back Into Your Phone",
      subtitle: "Enjoy seamless 9-digit calling and WhatsApp integration",
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
          No technical knowledge needed! Follow this plain-English guide from exporting your contacts to importing them back on any device.
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
            onClick={() => setActiveStep(s.num)}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              activeStep === s.num
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500/30'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                activeStep === s.num ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {s.num}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Step {s.num} of 5</span>
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm line-clamp-1">{s.title.split(': ')[1]}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{s.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Detailed Step Content Box */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: Exporting Your Contacts ({activeTab === 'android' ? 'Android Phone' : activeTab === 'iphone' ? 'iPhone' : activeTab === 'tablet' ? 'Tablet' : 'Desktop / Laptop'})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Save your address book to your device as a vCard (.vcf) or CSV file.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {activeTab === 'android' && (
                <>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" /> Method A: Using Google Contacts App
                    </div>
                    <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                      <li>Open the <b>Contacts</b> app on your Android phone.</li>
                      <li>Tap your <b>Profile Picture</b> or Menu icon in the top right.</li>
                      <li>Tap <b>Contact settings</b> or <b>Manage contacts</b>.</li>
                      <li>Tap <b>Export contacts</b> and select <b>Export to .vcf file</b>.</li>
                      <li>Save the file to your phone's <b>Downloads</b> folder.</li>
                    </ol>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4" /> Method B: Via Google Contacts Website
                    </div>
                    <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                      <li>Open web browser and go to <a href="https://contacts.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">contacts.google.com</a>.</li>
                      <li>Sign in with your Google account.</li>
                      <li>Click <b>Export</b> on the left menu.</li>
                      <li>Choose <b>vCard (for iOS contacts)</b> or <b>Google CSV</b>, then click <b>Export</b>.</li>
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
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 2: Upload Your Exported File Here
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bring your contacts into the app securely with zero data leaves your device.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-200 space-y-2 leading-relaxed">
                <li>Click the <b>"Launch App"</b> or <b>"Upload & Upgrade Contacts"</b> button at the top of the page.</li>
                <li>Drag and drop your exported <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-emerald-600">.vcf</code> or <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-emerald-600">.csv</code> file into the upload box (or click to browse your computer or phone folders).</li>
                <li>Alternatively, you can copy and paste raw contact lines directly into the text box.</li>
                <li>Our tool instantly reads every name and phone number on your device — no cloud servers required!</li>
              </ol>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 3: Review, Filter & Clean Your Contacts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect the PURA 9-digit conversions and fix duplicates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400">1. QCell (+83) & Comium (+86) & Africell (+87)</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  The app automatically detects network prefixes and adds <code className="bg-slate-100 dark:bg-slate-900 px-1">83</code>, <code className="bg-slate-100 dark:bg-slate-900 px-1">86</code>, or <code className="bg-slate-100 dark:bg-slate-900 px-1">87</code> correctly.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-xs text-amber-600 dark:text-amber-400">2. Gamcel & Gamtel (Deferred)</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Gamcel 9-series numbers and Gamtel landlines remain 7 digits as per PURA Phase 1 guidelines.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="font-bold text-xs text-purple-600 dark:text-purple-400">3. Duplicate Cleanup</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Click the <b>"Duplicates"</b> tab to review and merge identical contacts with 1 click before exporting.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 4: Download Your Upgraded Contact File
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose your preferred format and save to your device.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-200 space-y-2 leading-relaxed">
                <li>Toggle whether you want the <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-bold">+220</code> country code included in your numbers.</li>
                <li>Click <b>"Export vCard (.vcf)"</b> to download a file compatible with iPhone, Android, and WhatsApp.</li>
                <li>Alternatively, click <b>"Export CSV / Excel"</b> if you prefer spreadsheets.</li>
                <li>The file downloads instantly to your device's <b>Downloads</b> folder.</li>
              </ol>
            </div>
          </div>
        )}

        {activeStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 5: Import Back Into Your Phone or Web Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Get your updated 9-digit contacts back into WhatsApp and your phone book.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Android & Google Contacts Import
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Go to <a href="https://contacts.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">contacts.google.com</a>, click <b>Import</b> on the left menu, and select your downloaded <code className="bg-slate-100 dark:bg-slate-900 px-1">.vcf</code> file. Your phone will sync automatically within seconds!
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> iPhone Import Guide
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Open the <b>Files</b> app on your iPhone, tap your downloaded <code className="bg-slate-100 dark:bg-slate-900 px-1">.vcf</code> file, and tap <b>Add All Contacts</b> to instantly merge them into your iPhone address book.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons between steps */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeStep === 1
                ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
                : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 cursor-pointer'
            }`}
          >
            Previous Step
          </button>

          <span className="text-xs font-semibold text-slate-400">Step {activeStep} of 5</span>

          <button
            type="button"
            disabled={activeStep === 5}
            onClick={() => setActiveStep(Math.min(5, activeStep + 1))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeStep === 5
                ? 'opacity-40 cursor-not-allowed bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
            }`}
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
