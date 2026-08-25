import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  PhoneCall, 
  Check, 
  Layers, 
  Zap,
  RotateCcw,
  Smartphone,
  Laptop,
  Tablet,
  FileSpreadsheet,
  Moon,
  Sun,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  Search,
  Lock,
  Flame
} from 'lucide-react';
import { OperatorLogo } from './OperatorLogo';
import { LiveSandbox } from './LiveSandbox';
import { PuraRulesGuide } from './PuraRulesGuide';

interface LandingPageProps {
  onLaunchApp: () => void;
  onTryDemo: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  totalContactsCount: number;
  upgradedCount: number;
  deferredCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onTryDemo,
  darkMode,
  onToggleTheme,
  totalContactsCount,
  upgradedCount,
  deferredCount,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const displayTotal = totalContactsCount > 0 ? totalContactsCount : 2487;
  const displayUpgraded = totalContactsCount > 0 ? upgradedCount : 2163;
  const displayDeferred = totalContactsCount > 0 ? deferredCount : 137;
  const displayAlready9 = displayTotal - displayUpgraded - displayDeferred > 0 
    ? displayTotal - displayUpgraded - displayDeferred 
    : 187;
  const successRate = Math.round((displayUpgraded / displayTotal) * 100) || 87;

  const faqs = [
    {
      q: "Why is The Gambia migrating from 7-digit to 9-digit numbers?",
      a: "The Public Utilities Regulatory Authority (PURA) of The Gambia has mandated a new national numbering plan to expand telecommunication capacity and support growing mobile subscriber demand across all networks (Africell, QCell, Gamcel, and Comium)."
    },
    {
      q: "Which prefix digits are added to each Gambian network?",
      a: "QCell (3/5) becomes 83 (e.g. 3XXXXXX -> 833XXXXXX), Africell (7/2) becomes 86 (e.g. 7XXXXXX -> 867XXXXXX), Gamcel (9) becomes 87 (e.g. 9XXXXXX -> 879XXXXXX), and Comium (6) becomes 88 (e.g. 6XXXXXX -> 886XXXXXX)."
    },
    {
      q: "Is my contact data uploaded to any remote server?",
      a: "No! 100% of the contact parsing, duplicate matching, and 9-digit conversion runs entirely client-side in your web browser. Your contact book never leaves your device."
    },
    {
      q: "What file formats can I upload and export?",
      a: "You can import .vcf (vCard from iPhone/Android/Google Contacts), CSV files, or Excel (.xlsx) files. You can export back to native .VCF format or clean CSV/Excel spreadsheets."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Gambia Flag Accent Top Bar */}
      <div className="h-1.5 flex w-full sticky top-0 z-50">
        <div className="flex-1 bg-red-600" />
        <div className="w-4 bg-white" />
        <div className="flex-1 bg-blue-600" />
        <div className="w-4 bg-white" />
        <div className="flex-1 bg-emerald-600" />
      </div>

      {/* Sticky Header Navigation */}
      <header className="sticky top-1.5 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-sm">
              9
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                Automatic 9 Digits
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Contacts Upgrader
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">How It Works</a>
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Features</a>
            <a href="#pura-rules" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">PURA Rules</a>
            <a href="#live-tester" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Live Sandbox</a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              type="button"
              onClick={onLaunchApp}
              id="landingNavLaunchBtn"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Gambia Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs mb-6">
            <span className="text-sm">🇬🇲</span>
            <span>Built for The Gambia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
            {/* Left Column */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  Upgrade All Your Contacts to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300">
                    9 Digits
                  </span>{' '}
                  <span className="text-teal-700 dark:text-teal-400">Automatically</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our smart tool cleans, formats, and upgrades your contacts to the new Gambian 9-digit numbering format in seconds. Accurate, fast, and 100% automatic.
                </p>
              </div>

              {/* Checkmark List */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Auto detect & upgrade numbers</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Supports all major Gambian prefixes (+220, +83, +86, +87, +88)</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Safe, secure & your data stays private</span>
                </div>
              </div>

              {/* Main Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  id="landingHeroUploadBtn"
                  onClick={onLaunchApp}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <span>Upload & Upgrade Contacts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="landingHeroDemoBtn"
                  onClick={onTryDemo}
                  className="px-5 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Try Live Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column: Multi-Device Responsive Mockup */}
            <div className="lg:col-span-7 relative flex items-center justify-center">
              {/* Laptop Frame */}
              <div className="relative w-full max-w-xl bg-slate-900 rounded-2xl p-2.5 sm:p-3 shadow-2xl ring-1 ring-slate-800 border border-slate-700/50">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 rounded-t-xl mb-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-slate-300">Dashboard - PURA Contact Upgrader</span>
                  <div className="w-8" />
                </div>

                {/* Dashboard Screen */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 text-slate-800 dark:text-slate-100 text-xs shadow-inner overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">9</div>
                      <span className="font-bold text-xs">Dashboard</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800 text-[10px]">
                      Interactive Table
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800 text-center">
                      <div className="text-[9px] text-slate-400">Total Loaded</div>
                      <div className="text-xs font-bold">2,487</div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded border border-emerald-200 dark:border-emerald-900 text-center">
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400">Upgraded (+83/86)</div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">2,163</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200 dark:border-amber-900 text-center">
                      <div className="text-[9px] text-amber-600 dark:text-amber-400">Deferred / Review</div>
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-300">137</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded border border-blue-200 dark:border-blue-900 text-center">
                      <div className="text-[9px] text-blue-600 dark:text-blue-400">Selected</div>
                      <div className="text-xs font-bold text-blue-700 dark:text-blue-300">0</div>
                    </div>
                  </div>

                  {/* Filter Toolbar Simulation with Clear Filter */}
                  <div className="flex items-center gap-1.5 mb-2 bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                    <div className="flex-1 text-[10px] text-slate-400 truncate">Search contact name, original...</div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-semibold">QCell (+83)</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-semibold border border-rose-200 flex items-center gap-0.5">
                      <RotateCcw className="w-2.5 h-2.5" /> Clear
                    </span>
                  </div>

                  {/* Contact Rows */}
                  <div className="space-y-1 bg-white dark:bg-slate-900 rounded p-1.5 border border-slate-200 dark:border-slate-800 font-mono text-[9px]">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-sans font-semibold text-slate-700 dark:text-slate-200">Baboucarr Sallah</span>
                      <span className="text-slate-400">3123456</span>
                      <span className="text-emerald-600 font-bold">+220 833123456</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[8px] font-sans">QCell (+83)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-sans font-semibold text-slate-700 dark:text-slate-200">Awa Cham</span>
                      <span className="text-slate-400">7987654</span>
                      <span className="text-emerald-600 font-bold">+220 867987654</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[8px] font-sans">Africell (+86)</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="font-sans font-semibold text-slate-700 dark:text-slate-200">Gamcel HQ</span>
                      <span className="text-slate-400">9912345</span>
                      <span className="text-emerald-600 font-bold">+220 879912345</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[8px] font-sans">Gamcel (+87)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Phone Mockup */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 w-36 sm:w-44 bg-slate-950 rounded-2xl p-1.5 shadow-2xl ring-2 ring-slate-800 border border-slate-700 hidden sm:block">
                <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-1.5" />
                <div className="bg-slate-900 rounded-xl p-2 text-[8px] space-y-1.5">
                  <div className="font-bold text-white text-[9px] flex items-center justify-between">
                    <span>Contacts</span>
                    <span className="text-emerald-400">2,163 ready</span>
                  </div>
                  <div className="p-1 rounded bg-slate-800 text-slate-300">
                    <div className="font-semibold text-white">Fatou Jobe</div>
                    <div className="text-emerald-400 font-mono">+220 867123456</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div id="how-it-works" className="mb-14 scroll-mt-20">
            <div className="text-center mb-8">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                HOW IT WORKS
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Upgrade in <span className="text-emerald-600 dark:text-emerald-400">3 Simple Steps</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                  1
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                  Upload Contacts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload your contacts file (CSV, XLSX, VCF) securely.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                  2
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                  Auto Process & Upgrade
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We detect & upgrade numbers to the new 9-digit format.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                  3
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                  Download & Use
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Download your upgraded contacts instantly for iOS and Android.
                </p>
              </div>
            </div>
          </div>

          {/* Full-Width Live Stats Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-teal-600 to-emerald-600 text-white rounded-2xl p-5 sm:p-6 shadow-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-center mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black">{displayTotal.toLocaleString()}+</div>
                <div className="text-[11px] text-emerald-100 font-medium">Total Contacts</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black">{displayUpgraded.toLocaleString()}+</div>
                <div className="text-[11px] text-emerald-100 font-medium">Upgraded Successfully</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black">{displayAlready9.toLocaleString()}+</div>
                <div className="text-[11px] text-emerald-100 font-medium">Already 9 Digits</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black">{displayDeferred.toLocaleString()}+</div>
                <div className="text-[11px] text-emerald-100 font-medium">Deferred / Review</div>
              </div>
            </div>

            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-black">{successRate}%</div>
                <div className="text-[11px] text-emerald-100 font-medium">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Key Features Section */}
          <div id="features" className="mb-16 scroll-mt-20">
            <div className="text-center mb-8">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                PLATFORM ADVANTAGES
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Engineered specifically for Gambian Phonebooks
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  100% Client-Side Privacy
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your contacts are confidential. All parsing, validation, duplicate resolution, and conversion takes place entirely inside your browser memory.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  iOS & Android Ready
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Export standard vCard 3.0 (.vcf) files that import seamlessly into Apple iPhone Contacts, Google Contacts, Samsung, and WhatsApp.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  Intelligent Duplicate Merge
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Finds exact duplicate entries and phonetic duplicate names, consolidating multiple phone numbers under one unified contact.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live Sandbox Section */}
          <div id="live-tester" className="mb-16 scroll-mt-20">
            <div className="text-center mb-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                INSTANT TESTER
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Test any Gambian Number Right Now
              </h2>
            </div>
            <LiveSandbox />
          </div>

          {/* PURA Rules Guide Section */}
          <div id="pura-rules" className="mb-16 scroll-mt-20">
            <PuraRulesGuide />
          </div>

          {/* FAQ Accordion */}
          <div id="faq" className="mb-16 scroll-mt-20 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                GOT QUESTIONS?
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90 text-emerald-600' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 text-center border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                <Flame className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to Upgrade Your Entire Phonebook?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Join thousands of Gambians upgrading their contacts with zero data loss, instant duplicate cleanup, and 100% privacy.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  id="landingBottomCtaBtn"
                  onClick={onLaunchApp}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <span>Launch Contacts Upgrader</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">9</div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Automatic 9 Digits Contacts Upgrader</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Built in compliance with PURA Gambia National Numbering Plan</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
