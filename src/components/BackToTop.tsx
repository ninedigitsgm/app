import React, { useState, useEffect } from 'react';

export const BackToTop: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        // Show only near the bottom on mobile (within 200px)
        const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;
        setShowScrollTop(isNearBottom);
      } else {
        // Default behavior for desktop
        setShowScrollTop(window.scrollY > 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!showScrollTop) return null;

  return (
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
  );
};
