import React, { useState, useEffect } from 'react';

export const BackToTop: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mobile viewport check (< 640px)
      const isMobile = window.innerWidth < 640;
      if (!isMobile) {
        setShowScrollTop(false);
        return;
      }

      // Show ONLY towards the very end of the page (within last 350px of document height)
      const scrollBottom = window.innerHeight + window.scrollY;
      const totalHeight = document.documentElement.scrollHeight;
      const isNearEnd = totalHeight > window.innerHeight && scrollBottom >= totalHeight - 350;

      setShowScrollTop(isNearEnd);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (!showScrollTop) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="sm:hidden fixed bottom-5 right-5 z-50 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 animate-fade-in"
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

