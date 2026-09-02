import React, { useState } from 'react';

export interface OperatorLogoProps {
  operator: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'badge';
  className?: string;
}

// Local SVG assets in public/ with robust vector fallback
const OPERATOR_LOGOS: Record<
  string,
  { url: string; fallbackBg: string; textColor: string; name: string; containerBg: string }
> = {
  africell: {
    url: `${import.meta.env.BASE_URL}africell.svg`,
    fallbackBg: 'bg-[#9D207E]',
    textColor: 'text-white',
    name: 'Africell',
    containerBg: 'bg-white p-[1px] shadow-2xs',
  },
  qcell: {
    url: `${import.meta.env.BASE_URL}qcell.svg`,
    fallbackBg: 'bg-[#f47c20]',
    textColor: 'text-white',
    name: 'QCell',
    containerBg: 'bg-[#f47c20] p-[1.5px]',
  },
  gamcel: {
    url: `${import.meta.env.BASE_URL}gamcel.svg`,
    fallbackBg: 'bg-emerald-600',
    textColor: 'text-white',
    name: 'Gamcel',
    containerBg: 'bg-white p-[1px] shadow-2xs',
  },
  gamtel: {
    url: `${import.meta.env.BASE_URL}gamtel.svg`,
    fallbackBg: 'bg-sky-600',
    textColor: 'text-white',
    name: 'Gamtel',
    containerBg: 'bg-white p-[1px] shadow-2xs',
  },
  comium: {
    url: `${import.meta.env.BASE_URL}comium.svg`,
    fallbackBg: 'bg-[#EB222A]',
    textColor: 'text-white',
    name: 'Comium',
    containerBg: 'bg-white p-[1px] shadow-2xs',
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
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 rounded overflow-hidden ${config.containerBg} ${sizeClasses} ${className}`}
        title={`${config.name} logo`}
      >
        <img
          src={config.url}
          alt={`${config.name} logo`}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          width="24"
          height="24"
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
