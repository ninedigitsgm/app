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
  Compass,
  Wifi,
  Undo2,
  Redo2,
  Eye,
  GitCompare,
  History,
  Trash2,
  Heart,
  Share2
} from 'lucide-react';
import { OperatorLogo } from './OperatorLogo';
import { ScrollReveal } from './ScrollReveal';
import { BackToTop } from './BackToTop';

// Code-split heavy below-the-fold components and modals for high mobile performance
const LiveSandbox = React.lazy(() => import('./LiveSandbox').then(m => ({ default: m.LiveSandbox })));
const BatchRawTester = React.lazy(() => import('./BatchRawTester').then(m => ({ default: m.BatchRawTester })));
const PuraRulesGuide = React.lazy(() => import('./PuraRulesGuide').then(m => ({ default: m.PuraRulesGuide })));
const GettingStartedTutorial = React.lazy(() => import('./GettingStartedTutorial').then(m => ({ default: m.GettingStartedTutorial })));
const SecurityModal = React.lazy(() => import('./SecurityModal').then(m => ({ default: m.SecurityModal })));
const DonateModal = React.lazy(() => import('./DonateModal').then(m => ({ default: m.DonateModal })));
const LegalModal = React.lazy(() => import('./LegalModal').then(m => ({ default: m.LegalModal })));

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
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleShareApp = () => {
    const shareUrl = window.location.origin;
    const shareText = 'Upgrade all Gambian 7-digit contacts to 9-digits safely and for free';
    if (navigator.share) {
      navigator.share({
        title: 'Automatic 9-Digits Contacts Upgrader',
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2200);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  // Track active section for navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['how-it-works', 'tutorial', 'features', 'pura-rules', 'live-tester', 'donate', 'share', 'faq'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          const absoluteTop = rect.top + window.scrollY;
          if (scrollPosition >= absoluteTop) {
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
    { label: 'Donate', href: '#donate', icon: Heart, id: 'donate' },
    { label: 'Share', href: '#share', icon: Share2, id: 'share' },
    { label: 'FAQ', href: '#faq', icon: HelpCircle, id: 'faq' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    setActiveSection(targetId);

    const performScroll = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 60;
        const flagBarHeight = 6;
        const extraPadding = 16;
        const totalOffset = headerHeight + flagBarHeight + extraPadding;

        const elementRect = element.getBoundingClientRect();
        const targetScrollY = elementRect.top + window.scrollY - totalOffset;

        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'smooth'
        });
      }
    };

    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      // Wait for React to collapse the mobile menu drawer so measurements reflect true document flow
      setTimeout(performScroll, 50);
    } else {
      performScroll();
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
      a: "You can import .vcf (vCard from iPhone/Android/Google Contacts) or .csv (Comma Separated Values) files. You can export back to native .VCF format or clean .CSV format."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none text-xs font-bold transition"
      >
        Skip to main content
      </a>

      {/* Gambia Flag Accent Top Bar */}
      <div className="h-1 sm:h-1.5 flex w-full sticky top-0 z-50">
        <div className="flex-[6] bg-[#CE1126]" />
        <div className="flex-[1] bg-white" />
        <div className="flex-[4] bg-[#0C1C8C]" />
        <div className="flex-[1] bg-white" />
        <div className="flex-[6] bg-[#3A7728]" />
      </div>

      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1 flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src={darkMode ? `${import.meta.env.BASE_URL}logo-for-darkmode.svg` : `${import.meta.env.BASE_URL}logo-for-lightmode.svg`}
              alt="Auto Contacts Upgrader Logo"
              width="240"
              height="48"
              className="h-10 sm:h-12 w-auto max-w-[180px] sm:max-w-[240px] object-contain transition-transform group-hover:scale-[1.01]"
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
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold border border-slate-200/60 dark:border-slate-700/60'
                      : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`} />
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

      {/* Decorative Strip - Gambia Flag Gradient (Red - White - Blue - White - Green) */}
      <div
        className="h-1.5 sm:h-2 w-full bg-[linear-gradient(to_right,#CE1126_0%,#CE1126_32%,#FFFFFF_38%,#0C1C8C_44%,#0C1C8C_56%,#FFFFFF_62%,#3A7728_68%,#3A7728_100%)] shadow-[0_4px_14px_rgba(0,0,0,0.22)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.7)] relative z-20"
        aria-hidden="true"
      />

      {/* Main Landmark: Primary Landing Page Content */}
      <main id="main-content">
        {/* Hero Section */}
      <section className="relative overflow-visible pt-1 lg:pt-2 pb-0 sm:pb-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero Header (Full Width on Large Screens) */}
          <div className="mb-4 lg:mb-5 text-left space-y-2 lg:space-y-2.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Upgrade All Your Contacts to{' '}
              <span className="text-emerald-700 dark:text-emerald-400">
                9 Digits Automatically For Free
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-700 dark:text-slate-200 leading-relaxed font-normal max-w-4xl lg:max-w-5xl">
              Our smart tool cleans, formats, and upgrades your contacts to the new Gambian 9-digit numbering format in seconds. Accurate, fast, and 100% automatic.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 lg:items-start items-center mb-4">
            {/* Left Column: Checklists & CTAs */}
            <div className="lg:col-span-5 space-y-5 text-left">
              {/* Checkmark List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>1st Step is a Safe Backup:</b> Exporting creates an instant safety copy on your device (easy recovery, zero panic)</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>No Direct Phonebook Edits:</b> Operates in a safe staging sandbox where contacts on your phone are never altered directly</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>Automatic 9-Digit Upgrades:</b> Supports QCell (+83), Comium (+86), Africell (+87)</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>Already 9 Digits Untouched:</b> Leaves contacts that are already 9 digits untouched</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>Before &amp; After Previews:</b> Displays all number changes clearly and merges duplicate contacts with 1 click</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>Undo &amp; Redo Protection:</b> Made a mistake? Revert or re-apply edits instantly without restarting the whole process</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>Gamcel, Gamtel &amp; Foreign Protection:</b> Preserves non-Phase 1 contacts and foreign international numbers</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>Works Online &amp; Offline:</b> 100% on-device PWA privacy, zero server uploads &amp; zero mobile data consumption</span>
                </div>

                <div className="flex items-start gap-3 text-base text-slate-800 dark:text-slate-100">
                  <div className="w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="leading-relaxed"><b>Universal Device Support:</b> Accessible on any device (smartphones, tablets, and computers)</span>
                </div>
              </div>

              {/* Main Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  id="landingHeroUploadBtn"
                  onClick={onLaunchApp}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <span>Upload & Upgrade Contacts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  id="landingHeroDemoBtn"
                  onClick={onTryDemo}
                  className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Try Live Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column: Multi-Device Responsive Mockup */}
            <div className="lg:col-span-7 relative flex items-start justify-center lg:justify-end mt-6 sm:mt-8 lg:mt-0 w-full overflow-visible">
              {/* Responsive Device Mockups */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full flex items-start justify-center lg:justify-end lg:-mt-4"
              >
                <picture>
                  <source srcSet={`${import.meta.env.BASE_URL}consolidated-mockups.webp`} type="image/webp" />
                  <img
                    src={`${import.meta.env.BASE_URL}consolidated-mockups.png`}
                    alt="Gambia 9-Digit Upgrade Device Mockups"
                    width="1200"
                    height="868"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-auto max-w-full drop-shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
                  />
                </picture>
              </motion.div>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div id="how-it-works" className="mb-14 scroll-mt-24 sm:scroll-mt-28">
            <div className="text-center mb-8">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                HOW IT WORKS
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Upgrade Safely in <span className="text-emerald-700 dark:text-emerald-300">3 Simple Steps</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto mt-1.5">
                Safe on-device process with automatic phonebook backup, undo/redo controls, and clean re-importing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              {/* Step 1 - Red */}
              <div className="bg-red-50/60 dark:bg-red-950/25 p-6 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm text-center flex flex-col items-center justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center mb-3 shadow-sm shadow-red-500/20 mx-auto">
                    1
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 shadow-xs mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                    1. Export from Phone (Instant Backup)
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Export your contacts (.vcf or .csv). <b>This file is your safety backup</b>, so you can restore anytime. No panic, complete peace of mind!
                  </p>
                </div>
                <div className="mt-3 px-2.5 py-1 rounded-full bg-red-100/80 dark:bg-red-900/40 text-[11px] font-bold text-red-700 dark:text-red-300 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span>Safe &amp; Reversible Backup</span>
                </div>
              </div>

              {/* Step 2 - Blue */}
              <div className="bg-blue-50/60 dark:bg-blue-950/25 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 shadow-sm text-center flex flex-col items-center justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3 shadow-sm shadow-blue-500/20 mx-auto">
                    2
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-xs mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                    2. Import, Clean &amp; Undo/Redo
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Operates in a safe staging area (doesn't modify your phonebook directly). View all before/after changes, merge duplicates, and use <b>Undo &amp; Redo</b> if you make a mistake without restarting.
                  </p>
                </div>
                <div className="mt-3 px-2.5 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-[11px] font-bold text-blue-700 dark:text-blue-300 inline-flex items-center gap-1.5">
                  <Undo2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Undo/Redo &amp; Live Previews</span>
                </div>
              </div>

              {/* Step 3 - Green */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/25 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm text-center flex flex-col items-center justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3 shadow-sm shadow-emerald-500/20 mx-auto">
                    3
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-xs mx-auto">
                    <Download className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">
                    3. Export &amp; Clean Re-Import
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    Download your clean 9-digit file. <b>Pro-Tip:</b> Delete old contacts on your phone before re-importing to prevent duplicate Non-Gambian, Gamcel/Gamtel, or old 7-digit numbers!
                  </p>
                </div>
                <div className="mt-3 px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                  <span>Zero Duplicate Clutter</span>
                </div>
              </div>
            </div>

            {/* Anti-Duplication & Golden Safety Rule Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-blue-950/40 border border-amber-300/60 dark:border-amber-700/60 rounded-2xl p-4 sm:p-5 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>The Golden Re-Import Rule: Delete Old Contacts Before Re-importing</span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 rounded-full">
                      Important
                    </span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
                    Since your exported file from Step 1 is already saved safely on your device as a backup, always delete your existing contacts on your phone before re-importing the upgraded file. This ensures you avoid duplicates of <b>Non-Gambian numbers</b>, <b>Gamcel &amp; Gamtel numbers</b>, and <b>old 7-digit entries</b>.
                  </p>
                </div>
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
                <div className="text-[11px] text-emerald-100 font-medium">Successful Upgrade</div>
              </div>
            </div>
          </div>

          {/* Getting Started Tutorial Guide */}
          <ScrollReveal>
            <div id="tutorial" className="mb-16 scroll-mt-24 sm:scroll-mt-28">
              <React.Suspense fallback={<div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse flex items-center justify-center text-xs text-slate-400">Loading guide...</div>}>
                <GettingStartedTutorial />
              </React.Suspense>
            </div>
          </ScrollReveal>

          {/* Key Features Section */}
          <ScrollReveal>
            <div id="features" className="mb-16 scroll-mt-24 sm:scroll-mt-28">
              <div className="text-center mb-8">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  PLATFORM ADVANTAGES
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Engineered Specifically for Gambian Phonebooks
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl mx-auto mt-2">
                  Everything you need to upgrade safely with full operator compatibility, intelligent deduplication, and zero data leakage.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. 100% Client-Side Privacy */}
                <ScrollReveal delay={0}>
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-xs">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        100% Client-Side Privacy
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        Your address book never leaves your phone or computer. All processing runs entirely inside local browser memory with zero server uploads.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Zero Server Uploads
                    </div>
                  </div>
                </ScrollReveal>

                {/* 2. Works Online & Offline (2nd position as requested) */}
                <ScrollReveal delay={50}>
                  <div className="bg-cyan-50/50 dark:bg-cyan-950/20 p-5 rounded-2xl border border-cyan-100 dark:border-cyan-900/30 shadow-xs flex flex-col justify-between hover:border-cyan-400 dark:hover:border-cyan-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3 shadow-xs">
                        <Wifi className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Works Online &amp; Offline
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Installable Progressive Web App (PWA) operating seamlessly with or without internet. Clean, convert, and export anywhere with zero mobile data charges.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Full PWA &amp; Offline Support
                    </div>
                  </div>
                </ScrollReveal>

                {/* 3. Export as Instant Safety Backup */}
                <ScrollReveal delay={100}>
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-xs flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Instant Backup &amp; Safe Recovery
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        The 1st step exports your contacts to your device, creating a permanent safety backup. Restoration is always effortless with zero panic.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Reversible &amp; Stress-Free
                    </div>
                  </div>
                </ScrollReveal>

                {/* 4. Safe Staging / No Direct Phonebook Alteration */}
                <ScrollReveal delay={150}>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-xs flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-xs">
                        <Eye className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Safe Sandbox &amp; Live Previews
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Doesn't modify your phonebook directly. Imports into a safe staging area where all prefix transformations and changes are displayed transparently.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Non-Destructive Preview
                    </div>
                  </div>
                </ScrollReveal>

                {/* 5. Undo & Redo Safeguard */}
                <ScrollReveal delay={200}>
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Undo &amp; Redo Action History
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Made a mistaken edit or accidental delete? Revert or step forward instantly with multi-step Undo &amp; Redo without restarting from scratch.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Full History Rollback
                    </div>
                  </div>
                </ScrollReveal>

                {/* 6. Dual-Layer Duplicate Cleanup & Merging */}
                <ScrollReveal delay={250}>
                  <div className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-xs flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 shadow-xs">
                        <SearchCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Cleanup &amp; Merge Duplicates
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Detects duplicate names, identical numbers, and shared lines across multiple entries with interactive 1-click merge resolutions.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Clutter-Free Address Books
                    </div>
                  </div>
                </ScrollReveal>

                {/* 7. Clean Re-Import Best Practice */}
                <ScrollReveal delay={300}>
                  <div className="bg-rose-50/50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-xs flex flex-col justify-between hover:border-rose-400 dark:hover:border-rose-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 shadow-xs">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Clean Re-Import Safety Guide
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Step-by-step guidance to delete previous contacts before re-importing, preventing duplicate Non-Gambian, Gamcel/Gamtel, and old 7-digit numbers.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Zero Ghost Duplicates
                    </div>
                  </div>
                </ScrollReveal>

                {/* 8. Gamcel & Gamtel Phase 1 Compliance */}
                <ScrollReveal delay={350}>
                  <div className="bg-orange-50/50 dark:bg-orange-950/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-xs flex flex-col justify-between hover:border-orange-400 dark:hover:border-orange-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3 shadow-xs">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Gamcel &amp; Gamtel Safeguards
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Gamcel 9-series mobile numbers and Gamtel fixed landlines remain properly preserved as 7 digits per official PURA Phase 1 guidelines.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Phase 1 Compliant
                    </div>
                  </div>
                </ScrollReveal>

                {/* 10. Security Verified (SRI) */}
                <ScrollReveal delay={450}>
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-xs flex flex-col justify-between hover:border-emerald-400 dark:hover:border-emerald-600 transition h-full">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-xs">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                        Security Verified (SRI)
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        Cryptographically signed subresource integrity hashes ensure that every script and asset is tamper-proof, verified, and secure.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Cryptographic Integrity
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>

          {/* PURA Rules Guide Section */}
          <ScrollReveal>
            <div id="pura-rules" className="mb-16 scroll-mt-24 sm:scroll-mt-28">
              <React.Suspense fallback={<div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse flex items-center justify-center text-xs text-slate-500">Loading PURA rules...</div>}>
                <PuraRulesGuide />
              </React.Suspense>
            </div>
          </ScrollReveal>

          {/* Interactive Live Sandbox Section */}
          <ScrollReveal>
            <div id="live-tester" className="mb-16 scroll-mt-24 sm:scroll-mt-28 space-y-6">
              <div className="text-center mb-6">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  INSTANT TESTER & SANDBOX
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Test any Gambian Number Right Now
                </h2>
              </div>
              <React.Suspense fallback={<div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse flex items-center justify-center text-xs text-slate-400">Loading tester...</div>}>
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
              </React.Suspense>
            </div>
          </ScrollReveal>

          {/* Donate / Support the Creator Section */}
          <ScrollReveal>
            <div id="donate" className="mb-16 scroll-mt-24 sm:scroll-mt-28 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/60 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2.5 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                      <span>Support &amp; Show Appreciation</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Love This Free Gambian Tool?
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                      This project was built independently with care for the Gambian people to make the PURA 9-digit transition seamless, 100% private, and effortless. If this saved you hours of work, consider sending a small tip to show appreciation.
                    </p>

                    <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-[#1DA1F2]" />
                        <span>Wave: <b>+220 310 1010</b></span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>QMoney / Afrimoney</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Card / PayPal</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDonateModalOpen(true)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Donate / Support Creator</span>
                    </button>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      100% optional, always free
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Share Section - "Share This Much-Needed Tool" */}
          <ScrollReveal>
            <div id="share" className="mb-16 scroll-mt-24 sm:scroll-mt-28 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50/85 via-white to-teal-50/70 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2.5 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 text-xs font-bold border border-blue-200 dark:border-blue-800">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Spread the Word</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Share This Much-Needed Tool
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 max-w-xl leading-relaxed">
                      Share this much-needed tool with friends, family, and colleagues across The Gambia! Help every one get access to this tool to upgrade their phonebook safely, effortlessly, and with 100% privacy.
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShareApp}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                      <span>{copiedShare ? 'Link Copied!' : 'Share App Now'}</span>
                    </button>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      {copiedShare ? 'Link copied to clipboard!' : 'Instant share via Whatsapp, Facebook or your favourite apps'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* FAQ Accordion */}
          <ScrollReveal>
            <div id="faq" className="mb-16 scroll-mt-24 sm:scroll-mt-28 max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
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
                      <ChevronRight className={`w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-90 text-emerald-700 dark:text-emerald-300' : ''}`} />
                    </button>
                    {activeFaq === idx && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
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
      </main>

      {/* Decorative Strip - Gambia Flag Gradient (Red - White - Blue - White - Green) */}
      <div
        className="h-1.5 sm:h-2 w-full bg-[linear-gradient(to_right,#CE1126_0%,#CE1126_32%,#FFFFFF_38%,#0C1C8C_44%,#0C1C8C_56%,#FFFFFF_62%,#3A7728_68%,#3A7728_100%)] shadow-[0_-4px_14px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.22)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.55),0_4px_18px_rgba(0,0,0,0.7)] relative z-20"
        aria-hidden="true"
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-center text-xs text-slate-700 dark:text-slate-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
              title="Go to Home"
            >
              <img
                src={darkMode ? `${import.meta.env.BASE_URL}logo-for-darkmode.svg` : `${import.meta.env.BASE_URL}logo-for-lightmode.svg`}
                alt="Auto Contacts Upgrader Logo"
                width="240"
                height="56"
                loading="lazy"
                decoding="async"
                className="h-12 sm:h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[linear-gradient(to_right,#CE1126_0%,#CE1126_32%,#FFFFFF_38%,#0C1C8C_44%,#0C1C8C_56%,#FFFFFF_62%,#3A7728_68%,#3A7728_100%)] border border-white/40 dark:border-white/20 text-white font-bold text-xs shadow-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">🇬🇲 Built with love for Our Homeland</span>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsPrivacyModalOpen(true)} className="text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer font-medium">Privacy Policy</button>
              <span className="text-slate-400 dark:text-slate-500">·</span>
              <button onClick={() => setIsTermsModalOpen(true)} className="text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer font-medium">Terms & Conditions</button>
            </div>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">© Copyright 2026 All Rights Reserved</p>
          </div>
        </div>
      </footer>

      {/* Legal Modals (Deferred) */}
      {isPrivacyModalOpen && (
        <React.Suspense fallback={null}>
          <LegalModal
            title="Privacy Policy"
            isOpen={isPrivacyModalOpen}
            onClose={() => setIsPrivacyModalOpen(false)}
          >
            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-4">Last Updated: September 1, 2026</p>
            <h3 className="font-bold text-slate-900 dark:text-white">1. No Data Collection</h3>
            <p>The Automatic 9-Digits Contacts Upgrader is designed to respect your privacy completely. We do not collect, store, share, or transmit any personal data, phone numbers, or contact details.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">2. Local Browser Processing (PWA)</h3>
            <p>This application is a Progressive Web App (PWA). All contact modifications, processing, and file upgrades happen 100% locally inside your web browser using client-side JavaScript. No contact lists or files are ever sent over the internet to our servers or any third-party servers.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">3. Offline Capabilities and Caching</h3>
            <p>As a PWA, this application utilizes standard browser storage technologies (like Service Workers and Cache Storage) strictly to allow the application to work offline and load faster. This metadata does not contain personal contact information.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">4. Third-Party Hosting</h3>
            <p>This website is hosted utilizing GitHub Pages. While the application code itself does not track you, GitHub may automatically collect server access logs (such as your IP address and web browser type) for security, debugging, and operational purposes. You can review the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" className="text-emerald-700 dark:text-emerald-300 hover:underline" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a> for details.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">5. Contact Us</h3>
            <p>If you have questions about this short-term project, you can contact the developer at <a href="mailto:ninedigitsgm@gmail.com" className="text-emerald-700 dark:text-emerald-300 hover:underline">ninedigitsgm@gmail.com</a></p>
          </LegalModal>
        </React.Suspense>
      )}

      {isTermsModalOpen && (
        <React.Suspense fallback={null}>
          <LegalModal
            title="Terms and Conditions"
            isOpen={isTermsModalOpen}
            onClose={() => setIsTermsModalOpen(false)}
          >
            <p className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-4">Last Updated: September 1, 2026</p>
            <h3 className="font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
            <p>By accessing and using ninedigits.gm, you agree to be bound by these simple Terms and Conditions. If you do not agree, please do not use the tool.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">2. Purpose of the Tool</h3>
            <p>This web utility is provided as a free, short-term valuable tool intended to assist individuals in formatting telephone contacts to the standard 9-digit dialing system.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">3. "As-Is" Service & Disclaimer of Warranties</h3>
            <p>This PWA tool is provided entirely "AS-IS" and "AS-AVAILABLE" without warranties of any kind, either express or implied. While we make every effort to ensure formatting accuracy, we do not guarantee that the tool will work flawlessly or be compatible with every mobile device or address book file format.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">4. Limitation of Liability</h3>
            <p>Important: You are solely responsible for protecting your data. You are strongly advised to safely store/keep the Exported file in Step one, as its the vCard/CSV file or alternatively Google Contacts / iCloud, if you backed up your contacts to those online storage tools; you can use those methods to recover your contacts if any unforeseen circumstances occur. Extra care only needs to be taken when deleting your contacts in your phone, getting ready to reimport the upgraded vCard/CSV, as you won't be cleaning, editing, merging, deleting contacts directly. So please confirm the Backup/Exported file is still safely kept and available in the location it's saved in. Under no circumstances shall the developers or hosts of this project be held liable for any data loss, corrupted contacts, accidental duplicates, or incorrectly formatted phone numbers resulting from the use of this software.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">5. Intellectual Property and Proprietary Rights</h3>
            <p>All code, design layouts, custom scripts, text, and visual assets featured on ninedigits.gm are the exclusive intellectual property of the project developers and are protected by local & international copyright laws. While the underlying repository is publicly visible on GitHub solely to satisfy platform hosting requirements, this software is closed-source and proprietary. You are granted a limited right to execute the application within your browser for personal use. You may not copy, redistribute, modify, or host duplicate versions of this code without explicit written permission.</p>
            <h3 className="font-bold text-slate-900 dark:text-white">6. Short-Term Project Lifecycle</h3>
            <p>This is a temporary utility project built for the immediate 9-digit number transition phase scheduled for 4th of September 2026, with dual support of both 7 digits and 9 Digits until the grace period ends on November 30, 2026. The developers reserve the right to alter, discontinue, or completely take down the website and domain name at any time without prior notice.</p>
          </LegalModal>
        </React.Suspense>
      )}

      {/* Security Verification Details Modal */}
      {isSecurityModalOpen && (
        <React.Suspense fallback={null}>
          <SecurityModal
            isOpen={isSecurityModalOpen}
            onClose={() => setIsSecurityModalOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Donate / Support Modal */}
      {isDonateModalOpen && (
        <React.Suspense fallback={null}>
          <DonateModal
            isOpen={isDonateModalOpen}
            onClose={() => setIsDonateModalOpen(false)}
            triggerSource="section"
          />
        </React.Suspense>
      )}

      {/* Mobile-only Scroll-to-Top Button near end of page */}
      <BackToTop />
    </div>
  );
};
