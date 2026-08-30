export type OperatorName = 'QCell' | 'Comium' | 'Africell' | 'Gamcel' | 'Gamtel' | 'International' | 'Standard' | 'Unknown';

export type ContactStatus = 'ok' | 'already' | 'review';

export interface NumberProcessResult {
  cleaned: string;
  result: string;
  status: ContactStatus;
  label: string;
  operator: OperatorName;
  addedPrefix?: string;
  originalRaw: string;
}

export interface ContactRecord {
  id: string;
  name: string;
  raw: string;
  result: string;
  status: ContactStatus;
  operator: OperatorName;
  phoneNumbers: NumberProcessResult[];
  originalIndex: number;
  hasRepeatedNumbers?: boolean;
  extraVcardLines?: string[];
  extraCsvColumns?: string[];
  csvHeaders?: string[];
  csvRowValues?: string[];
}

export interface RepeatedGroup {
  contactIndex: number;
  contactId: string;
  name: string;
  repeatedPhones: string[];
}

export interface DuplicateAnalysisResult {
  exactIndices: Set<number>;
  sharedIndices: Set<number>;
  repeatedIndices: Set<number>;
  missingPhoneIndices: Set<number>;
  exactCount: number;
  sharedCount: number;
  repeatedCount: number;
  missingPhoneCount: number;
  exactGroups: Array<{ key: string; indices: number[]; name: string; phone: string }>;
  sharedGroups: Array<{ phone: string; indices: number[]; names: string[] }>;
  repeatedGroups: RepeatedGroup[];
  missingPhoneGroups: Array<{ contactIndex: number; contactId: string; name: string }>;
}

export type SortOption = 
  | 'name-asc' 
  | 'name-desc' 
  | 'original' 
  | 'operator-asc' 
  | 'status-asc'
  | 'duplicate-group';

export type FilterOption = 
  | 'all' 
  | 'qcell' 
  | 'comium' 
  | 'africell' 
  | 'gamcel' 
  | 'gamtel' 
  | 'international'
  | 'upgraded' 
  | 'review' 
  | 'duplicate-exact' 
  | 'duplicate-shared'
  | 'repeated-number'
  | 'missing-phone';

export interface InstructionProgressState {
  title: string;
  detail: string;
  step: number;
  totalSteps: number;
  percent: number;
  status: 'running' | 'completed';
}

export interface AffectedContactItem {
  id: string;
  name: string;
  originalPhone?: string;
  upgradedPhone: string;
  operator: OperatorName;
  status: ContactStatus;
  changeNote?: string;
  previousNames?: string[];
}

export interface ActionSummaryData {
  title: string;
  description: string;
  actionType: 'merge' | 'bulk-merge' | 'edit' | 'add' | 'deduplicate' | 'clean-repeated' | 'add-phone' | 'general';
  affectedContacts: AffectedContactItem[];
  stats?: {
    totalBefore?: number;
    totalAfter?: number;
    removedOrMergedCount?: number;
    cleanedCount?: number;
  };
}



