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
  PhoneOff
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
  'operator-asc': 'Network Operator (A → Z)',
  'status-asc': 'Upgrade Status',
};

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
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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

  const currentFilterItem = FILTER_ITEMS.find((item) => item.value === filterOption) || FILTER_ITEMS[0];
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
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Loaded</span>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
            <span id="statTotal">{totalCount}</span>
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              (Showing: <span id="statShowing">{showingCount}</span>)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Upgraded (+83/+86/+87)</span>
          <div id="statUpgraded" className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {upgradedCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Deferred / Review</span>
          <div id="statReview" className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
            {reviewCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Selected for Action</span>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            {selectedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="searchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by contact name, original number, or upgraded digits..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
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

        {/* Sort */}
        <div className="w-full md:w-48">
          <select
            id="sortSelect"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
          >
            <option value="name-asc">🔤 Name (A → Z)</option>
            <option value="name-desc">🔤 Name (Z → A)</option>
            <option value="original">🔢 Original Import Order</option>
            <option value="operator-asc">📶 By Operator</option>
            <option value="status-asc">⚡ By Status</option>
          </select>
        </div>

        {/* Custom Filter Dropdown with Operator Logos */}
        <div className="relative w-full md:w-72" ref={filterDropdownRef}>
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
            } text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-750 transition`}
          >
            <div className="flex items-center gap-2 truncate">
              {currentFilterItem.icon}
              <span className="truncate">{currentFilterItem.label}</span>
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

        {/* Add Contact Button */}
        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>New Contact</span>
        </button>
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
