import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Workspace } from './components/Workspace';
import { Toast, ToastMessage } from './components/Toast';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

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

  return (
    <>
      <Toast toasts={toasts} />
      {currentView === 'landing' ? (
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
      ) : (
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900" />
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
      )}
      <PwaInstallPrompt />
    </>
  );
}
