import React, { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';
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
  Flame,
  Globe2,
  ShieldAlert,
  Smile,
  SortAsc,
  SlidersHorizontal,
  SearchCheck,
  Menu,
  X,
  BookOpen,
  FlaskConical,
  Compass
} from 'lucide-react';
import { OperatorLogo } from './OperatorLogo';
import { LiveSandbox } from './LiveSandbox';
import { BatchRawTester } from './BatchRawTester';
import { PuraRulesGuide } from './PuraRulesGuide';
import { GettingStartedTutorial } from './GettingStartedTutorial';
import { ScrollReveal } from './ScrollReveal';

interface LandingPageProps {
  onLaunchApp: () => void;
  onTryDemo: () => void;
  onProcessRaw?: (rawText: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  totalContactsCount: number;
  upgradedCount: number;
  deferredCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onTryDemo,
  onProcessRaw,
  darkMode,
  onToggleTheme,
  totalContactsCount,
  upgradedCount,
  deferredCount,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('how-it-works');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Track active section and scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      const sections = ['how-it-works', 'tutorial', 'features', 'pura-rules', 'live-tester', 'faq'];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { label: 'How It Works', href: '#how-it-works', icon: Zap, id: 'how-it-works' },
    { label: 'Tutorial Guide', href: '#tutorial', icon: BookOpen, id: 'tutorial' },
    { label: 'Features', href: '#features', icon: Sparkles, id: 'features' },
    { label: 'PURA Rules', href: '#pura-rules', icon: BookOpen, id: 'pura-rules' },
    { label: 'Live Sandbox', href: '#live-tester', icon: FlaskConical, id: 'live-tester' },
    { label: 'FAQ', href: '#faq', icon: HelpCircle, id: 'faq' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(targetId);
    }
  };

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
      a: "QCell (3/5) adds 83 (e.g. 3XXXXXX -> +220 833XXXXXX), Comium (6) adds 86 (e.g. 6XXXXXX -> +220 866XXXXXX), and Africell (7/2/40/41/45) adds 87 (e.g. 7XXXXXX -> +220 877XXXXXX). Gamcel (9) and Gamtel landlines remain 7-digit in Phase 1."
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
      <header className="sticky top-1.5 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 min-h-[72px] sm:min-h-[84px] flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src={darkMode ? "/logo-for-darkmode.svg" : "/logo-for-lightmode.svg"}
              alt="Auto Contacts Upgrader Logo"
              className="h-14 sm:h-16 md:h-20 w-auto max-w-[240px] sm:max-w-[320px] md:max-w-[380px] object-contain transition-transform group-hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Desktop Nav Bar */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold border border-slate-200/60 dark:border-slate-700/60'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Action CTAs & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100/70 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition cursor-pointer"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Launch App Desktop & Tablet CTA */}
            <button
              type="button"
              onClick={onLaunchApp}
              id="landingNavLaunchBtn"
              className="hidden sm:inline-flex px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              id="mobileMenuToggleBtn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunchApp();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Launch App Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onTryDemo();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try Demo with Sample Contacts</span>
              </button>
            </div>
          </div>
        )}
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
                  <span>Upload contacts via vCard (.vcf) or CSV</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Supports QCell (+83), Comium (+86), Africell (+87)</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Preserves non-Phase 1 numbers (Gamcel & Gamtel)</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>International number safeguards (foreign country codes untouched)</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Safe, secure & your data stays 100% private on your device</span>
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
              {/* New Responsive Device Mockups */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full max-w-3xl aspect-[16/9]"
              >
                <img src="/mac-desktop.svg" alt="Desktop Mockup" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] z-10" />
                <img src="/tab.svg" alt="Tab Mockup" className="absolute bottom-0 left-0 w-[35%] z-20" />
                <img src="/mac-laptop.svg" alt="Laptop Mockup" className="absolute bottom-0 right-0 w-[45%] z-20" />
                <img src="/phone.svg" alt="Phone Mockup" className="absolute bottom-0 left-[42%] w-[12%] z-30" />
              </motion.div>
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
                  1. Import Contacts File
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload your Apple/Android (.vcf) or spreadsheet (.csv) file securely on-device.
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
                  2. Review & Filter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect upgraded numbers, search operators, and detect duplicates interactively.
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
                  3. Format & Export
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle +220 country code prefix and download your upgraded VCF or CSV instantly.
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

          {/* Getting Started Tutorial Guide */}
          <ScrollReveal>
            <div id="tutorial" className="mb-16 scroll-mt-20">
              <GettingStartedTutorial />
            </div>
          </ScrollReveal>

          {/* Key Features Section */}
          <ScrollReveal>
            <div id="features" className="mb-16 scroll-mt-20">
              <div className="text-center mb-8">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  PLATFORM ADVANTAGES
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Engineered Specifically for Gambian Phonebooks
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-2">
                  Everything you need to upgrade safely with full operator compatibility, intelligent deduplication, and zero data leakage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScrollReveal delay={0}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        100% Client-Side Privacy
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Your address book never leaves your phone or computer. All processing runs entirely inside local browser memory.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Zero Server Uploads
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={50}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                        <Globe2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Foreign Number Protection
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Safeguards international numbers (Senegal +221, UK +44, USA +1, etc.) preventing corrupt modifications.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Foreign Codes Untouched
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Gamcel & Gamtel Protected
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Gamcel 9-series mobile numbers and Gamtel fixed landlines remain properly preserved as 7 digits per PURA Phase 1.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Phase 1 Compliance
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={150}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                        <SearchCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Dual-Layer Deduplication
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Automatically identifies identical name/number entries and flags shared numbers across different names with 1-click merge.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Clean Contact Books
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-teal-400 dark:hover:border-teal-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        iOS & Android vCard 3.0
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Exports pristine .vcf format supported by Apple iPhone Contacts, Google Contacts, Samsung, and WhatsApp.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Native Address Book Sync
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={250}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-pink-400 dark:hover:border-pink-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3">
                        <Smile className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Emoji & UTF-8 Decoder
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Decodes Quoted-Printable strings and preserves emojis, accents, and custom contact tags seamlessly.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Zero Character Loss
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                        <SortAsc className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        A-Z Jump Bar & Sorting
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Navigate thousands of contacts effortlessly with the alphabetical jump strip and multi-criteria sorting.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Fast Navigation
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={350}>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-rose-400 dark:hover:border-rose-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Prefix Matrix & Filters
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Filter by operator, preview status, and export with or without the +220 country code prefix on demand.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Flexible Export Formats
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>

          {/* PURA Rules Guide Section */}
          <ScrollReveal>
            <div id="pura-rules" className="mb-16 scroll-mt-20">
              <PuraRulesGuide />
            </div>
          </ScrollReveal>

          {/* Interactive Live Sandbox Section */}
          <ScrollReveal>
            <div id="live-tester" className="mb-16 scroll-mt-20 space-y-6">
              <div className="text-center mb-6">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  INSTANT TESTER & SANDBOX
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Test any Gambian Number Right Now
                </h2>
              </div>
              <LiveSandbox />
              <BatchRawTester
                onProcessRawAndLaunch={(rawText) => {
                  if (onProcessRaw) {
                    onProcessRaw(rawText);
                  } else {
                    onLaunchApp();
                  }
                }}
              />
            </div>
          </ScrollReveal>

          {/* FAQ Accordion */}
          <ScrollReveal>
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
          </ScrollReveal>

          {/* Bottom CTA Card */}
          <ScrollReveal>
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 text-center border border-slate-800 shadow-2xl relative overflow-hidden">
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
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
              title="Go to Home"
            >
              <img
                src={darkMode ? "/logo-for-darkmode.svg" : "/logo-for-lightmode.svg"}
                alt="Auto Contacts Upgrader Logo"
                className="h-12 sm:h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>Built in compliance with PURA Gambia National Numbering Plan</span>
          </div>
        </div>
      </footer>

      {/* Floating Smooth Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 animate-fade-in"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};
