import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Wifi, WifiOff, RefreshCw, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
    }
    return false;
  });

  const isIos = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(true);
      setTimeout(() => setShowOfflineToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    const handleCheckEvent = () => {
      handleCheckForUpdates();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-update-available', handleUpdate);
    window.addEventListener('pwa-check-updates', handleCheckEvent);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-available', handleUpdate);
      window.removeEventListener('pwa-check-updates', handleCheckEvent);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos && !isStandalone) {
      setShowIosGuide(true);
    }
  };

  const handleCheckForUpdates = () => {
    setCheckingUpdate(true);
    setUpdateMessage('Checking for updates...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update().then(() => {
            setCheckingUpdate(false);
            if (reg.waiting || reg.installing) {
              setUpdateAvailable(true);
              setUpdateMessage('Latest update is available!');
            } else {
              setUpdateMessage('This is the latest Update, Check Later!');
              setTimeout(() => setUpdateMessage(null), 4000);
            }
          }).catch(() => {
            setCheckingUpdate(false);
            setUpdateMessage('This is the latest Update, Check Later!');
            setTimeout(() => setUpdateMessage(null), 4000);
          });
        } else {
          setCheckingUpdate(false);
          setUpdateMessage('This is the latest Update, Check Later!');
          setTimeout(() => setUpdateMessage(null), 4000);
        }
      });
    } else {
      setCheckingUpdate(false);
      setUpdateMessage('This is the latest Update, Check Later!');
      setTimeout(() => setUpdateMessage(null), 4000);
    }
  };

  const handleRefreshApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Offline / Online Status Indicator Toast */}
      {showOfflineToast && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2.5 border transition-all animate-in fade-in duration-300 ${
          isOnline
            ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/40 backdrop-blur-md shadow-emerald-950/50'
            : 'bg-slate-900/95 text-amber-300 border-amber-500/40 backdrop-blur-md shadow-slate-950/50'
        }`}>
          {isOnline ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">Working Online</span>
                <span className="text-emerald-300/80 text-[11px] hidden sm:inline">• Connected & Ready</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">Working Offline</span>
                <span className="text-amber-300/80 text-[11px] hidden sm:inline">• 100% on-device & zero data usage</span>
              </div>
            </>
          )}
          <button onClick={() => setShowOfflineToast(false)} className="ml-1 opacity-70 hover:opacity-100 cursor-pointer p-0.5" aria-label="Close notification">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Update Check Status Toast Banner */}
      {updateMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 border border-indigo-500/50 rounded-2xl shadow-2xl text-xs font-semibold backdrop-blur-md animate-in slide-in-from-top-4 duration-300 flex items-center gap-2.5">
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${checkingUpdate ? 'animate-spin' : ''}`} />
          <span>{updateMessage}</span>
          <button onClick={() => setUpdateMessage(null)} className="ml-2 opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* New Version Update Urgent Notification Modal Popup */}
      {updateAvailable && (
        <div className="fixed inset-0 z-[400] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/60 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400 block">PWA Update Available</span>
                <h3 className="text-lg font-extrabold text-white">Latest Version Ready</h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A new updated version of 9Digits is ready. Please update now to get the latest features, bug fixes, and security improvements!
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRefreshApp}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Update Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent floating / bottom install banner if installable and not dismissed */}
      {!isInstalled && !dismissed && (deferredPrompt || (isIos && !isStandalone)) && (
        <div className="fixed bottom-4 right-4 z-[190] max-w-sm w-[calc(100%-2rem)] bg-slate-900/95 dark:bg-slate-950/95 text-white border border-blue-500/30 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shrink-0 flex items-center justify-center shadow-md">
              <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="9Digits GM" className="w-full h-full object-contain rounded-[10px]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                <span>Install 9Digits App</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">PWA</span>
              </h4>
              <p className="text-[11px] text-slate-300 truncate">
                Fast, works offline with zero data usage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Install Step-by-Step Modal */}
      {showIosGuide && (
        <div 
          className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowIosGuide(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 text-white shadow-2xl relative animate-in slide-in-from-bottom-6 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Install on iPhone / iPad</h3>
              </div>
              <button 
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs sm:text-sm text-slate-200">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 font-bold shrink-0">1</div>
                <div>
                  <p className="font-semibold text-white">Tap the Share button</p>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    Look for the <Share className="w-3.5 h-3.5 text-blue-400 inline" /> icon in Safari's bottom toolbar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 font-bold shrink-0">2</div>
                <div>
                  <p className="font-semibold text-white">Select "Add to Home Screen"</p>
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                    Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> <b>Add to Home Screen</b>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 font-bold shrink-0">3</div>
                <div>
                  <p className="font-semibold text-white">Tap "Add" in top right</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Launch directly from your home screen anytime with full offline speed!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
