import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  PlusCircle,
  ChevronDown,
  Check,
  Layers,
  Zap,
  AlertTriangle,
  Globe2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  FilterX,
  CopyCheck,
  PhoneOff,
  ArrowDownAZ,
  ArrowUpZA,
  ListOrdered,
  Signal,
  Trash2,
  GitMerge
} from 'lucide-react';
import { FilterOption, SortOption } from '../types';
import { OperatorLogo } from './OperatorLogo';

interface ReviewToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  filterOption: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  selectedCount: number;
  totalCount: number;
  showingCount: number;
  upgradedCount: number;
  reviewCount: number;
  onOpenAddModal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  undoSnapshots: { description: string }[];
  redoSnapshots: { description: string }[];
  onUndoToSnapshot: (index: number) => void;
  onRedoToSnapshot: (index: number) => void;
  onClearWorkspace?: () => void;
}

interface FilterItem {
  value: FilterOption;
  label: string;
  icon: React.ReactNode;
  category?: 'general' | 'gsm' | 'duplicates';
}

const FILTER_ITEMS: FilterItem[] = [
  {
    value: 'all',
    label: 'All Networks & Statuses',
    icon: <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />,
    category: 'general',
  },
  {
    value: 'upgraded',
    label: 'Upgraded Only (QCell, Comium, Africell)',
    icon: <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500 shrink-0" />,
    category: 'general',
  },
  {
    value: 'review',
    label: 'Review / Deferred Only',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    category: 'general',
  },
  {
    value: 'qcell',
    label: 'QCell Contacts (+83)',
    icon: <OperatorLogo operator="qcell" size="sm" className="shrink-0" />,
    category: 'gsm',
  },
  {
    value: 'comium',
    label: 'Comium Contacts (+86)',
    icon: <OperatorLogo operator="comium" size="sm" className="shrink-0" />,
    category: 'gsm',
  },
  {
    value: 'africell',
    label: 'Africell Contacts (+87)',
    icon: <OperatorLogo operator="africell" size="sm" className="shrink-0" />,
    category: 'gsm',
  },
  {
    value: 'gamcel',
    label: 'Gamcel Contacts (Deferred)',
    icon: <OperatorLogo operator="gamcel" size="sm" className="shrink-0" />,
    category: 'gsm',
  },
  {
    value: 'gamtel',
    label: 'Gamtel Fixed-Line (Deferred)',
    icon: <OperatorLogo operator="gamtel" size="sm" className="shrink-0" />,
    category: 'gsm',
  },
  {
    value: 'international',
    label: 'Foreign / International',
    icon: <Globe2 className="w-4 h-4 text-sky-500 shrink-0" />,
    category: 'gsm',
  },
  {
    value: 'duplicate-exact',
    label: 'Exact Duplicates (Same Name & Number)',
    icon: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />,
    category: 'duplicates',
  },
  {
    value: 'duplicate-shared',
    label: 'Shared Numbers (Different Names)',
    icon: <RefreshCw className="w-4 h-4 text-purple-500 shrink-0" />,
    category: 'duplicates',
  },
  {
    value: 'repeated-number',
    label: 'Repeated Numbers within Contact',
    icon: <CopyCheck className="w-4 h-4 text-pink-500 shrink-0" />,
    category: 'duplicates',
  },
  {
    value: 'missing-phone',
    label: 'Missing / No Phone Number',
    icon: <PhoneOff className="w-4 h-4 text-rose-500 shrink-0" />,
    category: 'duplicates',
  },
];

const SORT_LABELS: Record<SortOption, string> = {
  'name-asc': 'Name (A → Z)',
  'name-desc': 'Name (Z → A)',
  'original': 'Original Import Order',
  'operator-asc': 'Network Operator',
  'status-asc': 'Upgrade Status',
  'duplicate-group': 'Group Duplicates (Shared & Exact)',
};

interface SortItem {
  value: SortOption;
  label: string;
  icon: React.ReactNode;
}

const SORT_ITEMS: SortItem[] = [
  {
    value: 'name-asc',
    label: 'Name (A → Z)',
    icon: <ArrowDownAZ className="w-4 h-4 text-blue-500 shrink-0" />,
  },
  {
    value: 'name-desc',
    label: 'Name (Z → A)',
    icon: <ArrowUpZA className="w-4 h-4 text-blue-500 shrink-0" />,
  },
  {
    value: 'duplicate-group',
    label: 'Group Duplicates (Shared & Exact)',
    icon: <GitMerge className="w-4 h-4 text-purple-500 shrink-0" />,
  },
  {
    value: 'original',
    label: 'Original Import Order',
    icon: <ListOrdered className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />,
  },
  {
    value: 'operator-asc',
    label: 'By Operator',
    icon: <Signal className="w-4 h-4 text-indigo-500 shrink-0" />,
  },
  {
    value: 'status-asc',
    label: 'By Status',
    icon: <Zap className="w-4 h-4 text-emerald-500 shrink-0" />,
  },
];

const getFilterChipStyle = (filter: FilterOption): string => {
  switch (filter) {
    case 'missing-phone':
      return 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800';
    case 'repeated-number':
      return 'bg-pink-100 dark:bg-pink-950/70 text-pink-900 dark:text-pink-200 border-pink-300 dark:border-pink-800';
    case 'duplicate-shared':
      return 'bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800';
    case 'duplicate-exact':
    case 'review':
      return 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800';
    case 'upgraded':
      return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
    case 'africell':
      return 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800';
    case 'qcell':
      return 'bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800';
    case 'gamcel':
      return 'bg-teal-100 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 border-teal-300 dark:border-teal-800';
    case 'comium':
      return 'bg-yellow-100 dark:bg-yellow-950/70 text-yellow-950 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800';
    default:
      return 'bg-blue-100/80 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800';
  }
};

export const ReviewToolbar: React.FC<ReviewToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  filterOption,
  onFilterChange,
  selectedCount,
  totalCount,
  showingCount,
  upgradedCount,
  reviewCount,
  onOpenAddModal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoSnapshots,
  redoSnapshots,
  onUndoToSnapshot,
  onRedoToSnapshot,
  onClearWorkspace,
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [isUndoDropdownOpen, setIsUndoDropdownOpen] = useState(false);
  const [isRedoDropdownOpen, setIsRedoDropdownOpen] = useState(false);

  const undoRef = useRef<HTMLDivElement>(null);
  const redoRef = useRef<HTMLDivElement>(null);

  // Close undo/redo dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (undoRef.current && !undoRef.current.contains(target)) {
        setIsUndoDropdownOpen(false);
      }
      if (redoRef.current && !redoRef.current.contains(target)) {
        setIsRedoDropdownOpen(false);
      }
    };
    if (isUndoDropdownOpen || isRedoDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isUndoDropdownOpen, isRedoDropdownOpen]);

  // Close dropdown on click outside for filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterDropdownOpen]);

  // Close dropdown on click outside for sort
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortDropdownOpen]);

  const currentFilterItem = FILTER_ITEMS.find((item) => item.value === filterOption) || FILTER_ITEMS[0];
  const currentSortItem = SORT_ITEMS.find((item) => item.value === sortOption) || SORT_ITEMS[0];
  const isSortModified = sortOption !== 'name-asc';
  const isFilterActive = filterOption !== 'all' || searchQuery.trim() !== '' || isSortModified;

  const handleClearAllFilters = () => {
    onSearchChange('');
    onFilterChange('all');
    onSortChange('name-asc');
  };

  return (
    <div className="space-y-4 mb-4">
      {/* Stat Badges Row */}
      <div id="statsRow" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-1.5 sm:p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between min-h-[60px] sm:min-h-[82px]">
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Total Loaded</span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
            <span id="statTotal">{totalCount}</span>
            <span className="text-[10px] sm:text-xs font-normal text-slate-400 ml-1.5 whitespace-nowrap">
              (Showing: <span id="statShowing">{showingCount}</span>)
            </span>
          </div>
        </div>

        <div className="p-1.5 sm:p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between min-h-[60px] sm:min-h-[82px]">
          <span className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-tight">Upgraded (+83/+86/+87)</span>
          <div id="statUpgraded" className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {upgradedCount}
          </div>
        </div>

        <div className="p-1.5 sm:p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col justify-between min-h-[60px] sm:min-h-[82px]">
          <span className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 font-medium leading-tight">Deferred / Review</span>
          <div id="statReview" className="text-lg sm:text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
            {reviewCount}
          </div>
        </div>

        <div className="p-1.5 sm:p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-xs flex flex-col justify-between min-h-[60px] sm:min-h-[82px]">
          <span className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-medium leading-tight">Selected for Action</span>
          <div className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            {selectedCount}
          </div>
        </div>
      </div>

      {/* Filter and Actions Controls Row */}
      <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-3 w-full">
        {/* Sort */}
        <div className="relative w-full md:w-48 lg:w-56 shrink-0" ref={sortDropdownRef}>
          <button
            id="sortSelect"
            type="button"
            onClick={() => setIsSortDropdownOpen((prev) => !prev)}
            aria-expanded={isSortDropdownOpen}
            className={`w-full px-3 py-2.5 rounded-xl border text-left font-medium transition duration-150 ${
              sortOption !== 'name-asc'
                ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-semibold'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            } text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {currentSortItem.icon}
              <span className="whitespace-normal break-words leading-tight">{currentSortItem.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortDropdownOpen && (
            <div
              role="listbox"
              aria-label="Sort contacts list"
              className="absolute z-50 right-0 left-0 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-1.5 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-700/65"
            >
              <div className="py-1">
                {SORT_ITEMS.map((item) => {
                  const isSelected = item.value === sortOption;
                  return (
                    <button
                      key={item.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSortChange(item.value);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {item.icon}
                        <span className="whitespace-normal break-words leading-tight">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom Filter Dropdown with Operator Logos */}
        <div className="relative w-full md:w-64 lg:w-72 shrink-0" ref={filterDropdownRef}>
          <button
            id="filterSelect"
            type="button"
            onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
            aria-expanded={isFilterDropdownOpen}
            aria-haspopup="listbox"
            className={`w-full px-3 py-2.5 rounded-xl border ${
              filterOption !== 'all'
                ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-semibold'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            } text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {currentFilterItem.icon}
              <span className="whitespace-normal break-words leading-tight">{currentFilterItem.label}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {filterOption !== 'all' && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterChange('all');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onFilterChange('all');
                    }
                  }}
                  className="p-0.5 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 cursor-pointer"
                  title="Reset filter to All"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isFilterDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isFilterDropdownOpen && (
            <div
              role="listbox"
              aria-label="Filter contacts by network or status"
              className="absolute z-50 right-0 left-0 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-1.5 text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-700/60"
            >
              {/* General Options */}
              <div className="py-1">
                {FILTER_ITEMS.filter((item) => item.category === 'general').map((item) => {
                  const isSelected = item.value === filterOption;
                  return (
                    <button
                      key={item.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onFilterChange(item.value);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* GSM Operator Networks with Logos */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Operators & Networks
                </div>
                {FILTER_ITEMS.filter((item) => item.category === 'gsm').map((item) => {
                  const isSelected = item.value === filterOption;
                  return (
                    <button
                      key={item.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onFilterChange(item.value);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Duplicates */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Duplicates Analysis
                </div>
                {FILTER_ITEMS.filter((item) => item.category === 'duplicates').map((item) => {
                  const isSelected = item.value === filterOption;
                  return (
                    <button
                      key={item.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onFilterChange(item.value);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions & New Contact Row Container */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full md:w-auto">
          {/* Undo / Redo Actions Group */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs shrink-0 h-[38px] relative gap-0 flex-1 sm:flex-initial">
          
          {/* UNDO SECTION */}
          <div ref={undoRef} className="relative h-full flex items-center">
            {/* Main Undo Action Button */}
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-3 h-full flex items-center gap-1.5 text-xs font-bold transition rounded-l-xl ${
                canUndo 
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer' 
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/40'
              }`}
              title="Undo last action"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>

            {/* Dropdown toggle down arrow */}
            <button
              type="button"
              disabled={!canUndo || undoSnapshots.length === 0}
              onClick={() => setIsUndoDropdownOpen(!isUndoDropdownOpen)}
              className={`px-1.5 h-full flex items-center justify-center border-r border-slate-200 dark:border-slate-700 transition ${
                canUndo && undoSnapshots.length > 0
                  ? 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/40'
              }`}
              title="Undo snapshots dropdown"
            >
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isUndoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* UNDO DROPDOWN LIST */}
            {isUndoDropdownOpen && undoSnapshots.length > 0 && (
              <div className="absolute top-[42px] left-0 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Undo to past actions (max 10)
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {undoSnapshots.map((snap, sIdx) => {
                    const reverseIdx = undoSnapshots.length - 1 - sIdx;
                    return (
                      <button
                        key={`undo-snap-${sIdx}`}
                        type="button"
                        onClick={() => {
                          onUndoToSnapshot(reverseIdx);
                          setIsUndoDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition flex items-center justify-between gap-2 font-medium cursor-pointer"
                      >
                        <span className="truncate pr-1">{undoSnapshots[reverseIdx].description}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 uppercase whitespace-nowrap">
                          -{sIdx + 1} Step{sIdx > 0 ? 's' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* REDO SECTION */}
          <div ref={redoRef} className="relative h-full flex items-center">
            {/* Main Redo Action Button */}
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`px-3 h-full flex items-center gap-1.5 text-xs font-bold transition ${
                canRedo 
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer' 
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/40'
              }`}
              title="Redo next action"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redo</span>
            </button>

            {/* Dropdown toggle down arrow */}
            <button
              type="button"
              disabled={!canRedo || redoSnapshots.length === 0}
              onClick={() => setIsRedoDropdownOpen(!isRedoDropdownOpen)}
              className={`px-1.5 h-full flex items-center justify-center transition rounded-r-xl ${
                canRedo && redoSnapshots.length > 0
                  ? 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer'
                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/40'
              }`}
              title="Redo snapshots dropdown"
            >
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isRedoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* REDO DROPDOWN LIST */}
            {isRedoDropdownOpen && redoSnapshots.length > 0 && (
              <div className="absolute top-[42px] -left-16 sm:left-0 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Redo next actions (max 10)
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {redoSnapshots.map((snap, sIdx) => {
                    const reverseIdx = redoSnapshots.length - 1 - sIdx;
                    return (
                      <button
                        key={`redo-snap-${sIdx}`}
                        type="button"
                        onClick={() => {
                          onRedoToSnapshot(reverseIdx);
                          setIsRedoDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition flex items-center justify-between gap-2 font-medium cursor-pointer"
                      >
                        <span className="truncate pr-1">{redoSnapshots[reverseIdx].description}</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0 uppercase whitespace-nowrap">
                          +{sIdx + 1} Step{sIdx > 0 ? 's' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          </div>

          {/* Add Contact Button */}
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 h-[38px] flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>New Contact</span>
          </button>
        </div>
      </div>

      {/* Search Bar immediately above contacts table */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by contact name, original number, or upgraded digits..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs truncate"
          />
          {searchQuery && (
            <button
              id="clearSearch"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {totalCount > 0 && onClearWorkspace && (
          <button
            id="clearBtnTop"
            onClick={onClearWorkspace}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-95 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Workspace ({totalCount})</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips Bar */}
      {isFilterActive && (
        <div className="flex items-center justify-between gap-2 p-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1.5">
              <FilterX className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Active Filters:
            </span>

            {/* Search Query Chip */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700 text-[11px] font-medium shadow-xs">
                <span>Search: "{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="hover:text-blue-950 dark:hover:text-white cursor-pointer ml-1 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  title="Remove search filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Network / Status / Duplicate Filter Chip */}
            {filterOption !== 'all' && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-xs border ${getFilterChipStyle(filterOption)}`}>
                {currentFilterItem.icon}
                <span>{currentFilterItem.label}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange('all')}
                  className="opacity-70 hover:opacity-100 cursor-pointer ml-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  title="Remove filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Sort Option Chip (when not default name-asc) */}
            {isSortModified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100/90 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 text-[11px] font-medium shadow-xs">
                <span>Sort: {SORT_LABELS[sortOption] || sortOption}</span>
                <button
                  type="button"
                  onClick={() => onSortChange('name-asc')}
                  className="hover:text-indigo-950 dark:hover:text-white cursor-pointer ml-1 p-0.5 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800"
                  title="Reset sort to A-Z"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearAllFilters}
            className="px-2.5 py-1 rounded-lg bg-rose-100/90 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0 ml-2 transition shadow-xs"
            title="Clear all active filters, search query, and sort settings"
          >
            <RotateCcw className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Clear all</span>
          </button>
        </div>
      )}
    </div>
  );
};
