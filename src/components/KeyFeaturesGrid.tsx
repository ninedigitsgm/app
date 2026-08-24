import React, { useState } from 'react';
import { 
  Lock,
  PlayCircle,
  Sparkles, 
  SearchCheck, 
  Globe2, 
  ShieldAlert, 
  Smile, 
  SortAsc, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const KeyFeaturesGrid: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const features = [
    {
      icon: <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: '100% Private & Stays on Your Device',
      desc: 'Your contacts never leave your phone or computer. Everything is updated directly in your browser with zero server uploads or external data storage.',
    },
    {
      icon: <PlayCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: 'Live Sandbox & Quick-Test',
      desc: 'Try out any single phone number instantly or click 1-tap operator test buttons (QCell, Comium, Africell, Gamcel, Gamtel) to see the live conversion in real-time before importing files.',
    },
    {
      icon: <SearchCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'Dedicated Deduplication',
      desc: 'Separate dual-layer analysis for identical contacts (Same Name & Number) and shared phone numbers across multiple different names.',
    },
    {
      icon: <Globe2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'Foreign Number Protection',
      desc: 'Protects non-Gambian numbers (e.g. Senegal +221, UK +44, USA +1) from accidental alteration or corrupt prefixing.',
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: 'Gamcel & Gamtel Protected',
      desc: 'Gamcel mobile numbers (9-series) and Gamtel landlines (42, 43, 44, 47, 48, 56, 57 ranges) remain protected as 7-digit numbers.',
    },
    {
      icon: <Smile className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'Emoji & UTF-8 Quoted-Printable',
      desc: 'Decodes Quoted-Printable strings (=4A=20...), special characters, and embedded emojis in names from iOS and Android address books.',
    },
    {
      icon: <SortAsc className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      title: 'A-Z Jump Sidebar & Sorting',
      desc: 'Quick alphabetical jump strip with live letter magnification overlay, plus sorting by Name (A-Z, Z-A) or original import order.',
    },
    {
      icon: <SlidersHorizontal className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      title: 'Prefix Toggle & Filter Matrix',
      desc: 'Filter by operator, duplicate status, and export cleanly formatted with or without the +220 country code prefix.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Key Application Features
          </h2>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
        >
          {isCollapsed ? (
            <>
              Show Details <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              Collapse <ChevronUp className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2 hover:border-blue-300 dark:hover:border-blue-700 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {f.title}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
