import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Toast, ToastMessage } from './components/Toast';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Sparkles } from 'lucide-react';

// Dynamically code-split the entire heavy Contact Upgrader Workspace so the landing page bundle is minimal
const Workspace = React.lazy(() => import('./components/Workspace').then(m => ({ default: m.Workspace })));

export default function App() {
  // Page view routing: 'landing' or 'app'
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#app' || path.includes('app.html') || path.endsWith('/app')) {
        return 'app';
      }
    }
    return 'landing';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gm_pura_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
    }
    return false;
  });

  const [pendingAction, setPendingAction] = useState<{ type: 'demo' } | { type: 'raw'; text: string } | null>(null);
  const [stats, setStats] = useState<{ total: number; upgraded: number; deferred: number }>({
    total: 0,
    upgraded: 0,
    deferred: 0,
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Memoized stats update handler with explicit value checks to guarantee breaking loop chains
  const handleStatsChange = useCallback((newStats: { total: number; upgraded: number; deferred: number }) => {
    setStats((prev) => {
      if (
        prev.total === newStats.total &&
        prev.upgraded === newStats.upgraded &&
        prev.deferred === newStats.deferred
      ) {
        return prev;
      }
      return newStats;
    });
  }, []);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#app') {
        setCurrentView('app');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Theme synchronization
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('gm_pura_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('gm_pura_theme', 'light');
    }
  }, [darkMode]);

  // Idle prefetching: quietly load Workspace code in the background when browser is idle
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(
        () => {
          import('./components/Workspace');
        },
        { timeout: 3500 }
      );
      return () => (window as any).cancelIdleCallback(idleId);
    }
  }, []);

  const navigateToApp = () => {
    setCurrentView('app');
    window.location.hash = '#app';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLanding = () => {
    setCurrentView('landing');
    window.location.hash = '#landing';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'landing') {
    return (
      <>
        <Toast toasts={toasts} />
        <LandingPage
          onLaunchApp={navigateToApp}
          onTryDemo={() => {
            setPendingAction({ type: 'demo' });
            navigateToApp();
          }}
          onProcessRaw={(rawText) => {
            setPendingAction({ type: 'raw', text: rawText });
            navigateToApp();
          }}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
          totalContactsCount={stats.total}
          upgradedCount={stats.upgraded}
          deferredCount={stats.deferred}
        />
        <PwaInstallPrompt />
      </>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center animate-pulse mb-4">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Opening Gambia PURA Workspace...
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Loading secure local formatting engine and contact review tools
          </p>
        </div>
      }
    >
      <Workspace
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onNavigateHome={navigateToLanding}
        initialAction={pendingAction}
        onClearInitialAction={() => setPendingAction(null)}
        onStatsChange={handleStatsChange}
      />
    </Suspense>
  );
}
