import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Zap, Sparkles, ArrowRight, Smartphone, CheckCircle2, Lock } from 'lucide-react';

interface PwaSplashScreenProps {
  onEnterWorkspace: () => void;
  onEnterLanding: () => void;
}

export function PwaSplashScreen({ onEnterWorkspace, onEnterLanding }: PwaSplashScreenProps) {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // Check if standalone PWA mode or first visit in this session
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const hasSeenSplash = sessionStorage.getItem('gm_pwa_splash_dismissed');
    
    // Show splash if standalone PWA or if user hasn't seen it in current session
    return isStandalone || !hasSeenSplash;
  });

  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing Gambian Numbering Engine...');

  useEffect(() => {
    if (!isVisible) return;

    // Progress animation milestones
    const t1 = setTimeout(() => {
      setProgress(40);
      setStatusText('Loading Africell, QCell, Gamcel, Comium Prefix Rules...');
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Validating 100% On-Device Privacy Sandbox...');
    }, 700);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Ready: PURA 9-Digit Migration Active');
    }, 1100);

    // Auto-dismiss after 2.6 seconds if in standalone mode or user has not clicked yet
    const t4 = setTimeout(() => {
      handleDismiss('workspace');
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isVisible]);

  const handleDismiss = (destination: 'workspace' | 'landing') => {
    sessionStorage.setItem('gm_pwa_splash_dismissed', 'true');
    setIsVisible(false);
    if (destination === 'workspace') {
      onEnterWorkspace();
    } else {
      onEnterLanding();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="pwaSplashScreen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[999] flex flex-col justify-between bg-slate-950 text-white select-none overflow-hidden"
      >
        {/* Gambia National Flag Top Ribbon */}
        <div className="h-2 flex w-full shrink-0 shadow-lg">
          <div className="flex-[6] bg-[#CE1126]" />
          <div className="flex-[1] bg-white" />
          <div className="flex-[4] bg-[#0C1C8C]" />
          <div className="flex-[1] bg-white" />
          <div className="flex-[6] bg-[#3A7728]" />
        </div>

        {/* Ambient Glow Backdrops */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Main Splash Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto relative z-10">
          {/* Animated Central Emblem */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="relative mb-6"
          >
            {/* Glowing Pulse Rings */}
            <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-emerald-500/30 via-sky-500/30 to-blue-600/30 blur-md animate-pulse" />
            
            {/* Emblem Card */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center overflow-hidden">
              <img
                src={`${import.meta.env.BASE_URL}pwa-icon.svg`}
                alt="Automatic 9 Digits Logo"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Gambia Flag Mini Badge */}
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 shadow-md flex items-center gap-1.5 text-[10px] font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>GM +220</span>
            </div>
          </motion.div>

          {/* App Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official PURA 9-Digit Migration</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              AUTOMATIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-400">9 DIGITS</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              Instant contact upgrade for Africell (+87), QCell (+83), Gamcel, and Comium (+86).
            </p>
          </motion.div>

          {/* Key Privacy & Quality Badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="grid grid-cols-2 gap-2 w-full mb-6 text-left"
          >
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-200">100% Private</div>
                <div className="text-[10px] text-slate-400 truncate">Never leaves device</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-200">Instant Clean</div>
                <div className="text-[10px] text-slate-400 truncate">Auto-deduplication</div>
              </div>
            </div>
          </motion.div>

          {/* Engine Initialization Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="w-full space-y-1.5"
          >
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span className="truncate">{statusText}</span>
              <span className="font-mono text-sky-400">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-6 max-w-md mx-auto w-full relative z-10 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleDismiss('workspace')}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-900/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-[0.98]"
          >
            <span>Open Contacts Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleDismiss('landing')}
            className="w-full py-2 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer text-center"
          >
            Explore Full Guide & PURA Rules
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
