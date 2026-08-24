import React, { useState } from 'react';

export interface OperatorLogoProps {
  operator: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'badge';
  className?: string;
}

// User-provided direct URLs with robust vector SVG fallback
const OPERATOR_LOGOS: Record<string, { url: string; fallbackBg: string; textColor: string }> = {
  africell: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/AfricellLogo.png',
    fallbackBg: 'bg-[#9D207E]',
    textColor: 'text-white',
  },
  qcell: {
    url: 'https://qcell.gm/wp-content/uploads/2022/02/QCELL-logo-White.svg',
    fallbackBg: 'bg-[#f47c20]',
    textColor: 'text-white',
  },
  gamcel: {
    url: 'https://gamcel.gm/wp-content/uploads/2025/03/Gamcel-1.png',
    fallbackBg: 'bg-emerald-600',
    textColor: 'text-white',
  },
  gamtel: {
    url: 'https://gamtel.gm/wp-content/uploads/2025/03/gam.png',
    fallbackBg: 'bg-sky-600',
    textColor: 'text-white',
  },
  comium: {
    url: 'https://comium.gm/assets/img/logo-rd.svg',
    fallbackBg: 'bg-[#EB222A]',
    textColor: 'text-white',
  },
};

export const OperatorLogo: React.FC<OperatorLogoProps> = ({
  operator,
  size = 'sm',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const opKey = (operator || '').toLowerCase().trim();
  const matchedKey = Object.keys(OPERATOR_LOGOS).find((k) => opKey.includes(k));
  const config = matchedKey ? OPERATOR_LOGOS[matchedKey] : null;

  const sizeClasses = {
    xs: 'w-3.5 h-3.5 min-w-[14px]',
    sm: 'w-4 h-4 min-w-[16px]',
    md: 'w-5 h-5 min-w-[20px]',
    lg: 'w-7 h-7 min-w-[28px]',
    badge: 'w-3.5 h-3.5 min-w-[14px]',
  }[size];

  if (!config) {
    return null;
  }

  // If image loads successfully, render the actual brand logo image
  if (!imgError) {
    const isQCell = matchedKey === 'qcell';
    const isAfricell = matchedKey === 'africell';
    const isGamcel = matchedKey === 'gamcel';
    const isGamtel = matchedKey === 'gamtel';

    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 rounded overflow-hidden ${
          isQCell
            ? 'bg-[#f47c20] p-[1.5px]'
            : isAfricell
            ? 'bg-white p-[1px] shadow-2xs'
            : isGamcel
            ? 'bg-white p-[1px] shadow-2xs'
            : isGamtel
            ? 'bg-white p-[1px] shadow-2xs'
            : 'bg-white p-[1px]'
        } ${sizeClasses} ${className}`}
        title={`${operator} logo`}
      >
        <img
          src={config.url}
          alt={`${operator} logo`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </span>
    );
  }

  // High-fidelity fallback vector glyphs if network is slow/offline
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded ${config.fallbackBg} ${config.textColor} text-[9px] font-black uppercase ${sizeClasses} ${className}`}
      title={operator}
    >
      {matchedKey === 'africell' && (
        <svg viewBox="0 0 24 24" className="w-full h-full p-0.5" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )}
      {matchedKey === 'qcell' && <span>Q</span>}
      {matchedKey === 'gamcel' && <span>G</span>}
      {matchedKey === 'gamtel' && <span>T</span>}
      {matchedKey === 'comium' && <span>C</span>}
    </span>
  );
};
