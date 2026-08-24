import { ContactRecord, ContactStatus, DuplicateAnalysisResult, NumberProcessResult, OperatorName, RepeatedGroup } from '../types';

export const GAMCEL_PREFIX = '9';
export const GAMTEL_LANDLINE_PREFIXES = ['42', '43', '44', '47', '48', '56', '57'];

export interface MigrationRuleConfig {
  name: OperatorName;
  prefixes1: string[];
  prefixes2: string[];
  add: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const MIGRATION_RULES: MigrationRuleConfig[] = [
  {
    name: 'QCell',
    prefixes1: ['3'],
    prefixes2: ['50', '51', '52', '53', '54', '55', '58', '59'],
    add: '83',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
  },
  {
    name: 'Comium',
    prefixes1: ['6'],
    prefixes2: ['84', '85', '86', '87'],
    add: '86',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/50',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-200 dark:border-orange-800',
  },
  {
    name: 'Africell',
    prefixes1: ['7', '2'],
    prefixes2: ['40', '41', '45'],
    add: '87',
    badgeBg: 'bg-red-50 dark:bg-red-950/50',
    badgeText: 'text-red-700 dark:text-red-300',
    badgeBorder: 'border-red-200 dark:border-red-800',
  },
];

/**
 * Escapes HTML characters to prevent injection.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Decodes Quoted-Printable strings and repairs Mojibake UTF-8 strings commonly found in VCF files.
 * Handles strings like '=F0=9F=98=AC', 'ðŸ˜¬', 'Ã©', and mixed quoted-printable line continuations.
 */
export function decodeQuotedPrintable(str: string): string {
  if (!str) return '';

  let cleaned = str.trim();

  // 1. If string has vCard quoted-printable markers or =XX sequences
  // First join soft line breaks '= \r\n', '=\r\n', '=\n', '=\r', or trailing '='
  cleaned = cleaned.replace(/=\r?\n/g, '').replace(/=$/g, '');

  if (/(=[0-9A-Fa-f]{2})+/.test(cleaned)) {
    // Attempt percent-decoding for UTF-8 sequences
    try {
      const uriEncoded = cleaned.replace(/=([0-9A-Fa-f]{2})/g, '%$1');
      cleaned = decodeURIComponent(uriEncoded);
    } catch {
      // Fallback byte-by-byte
      try {
        const matches: number[] = [];
        let cursor = 0;
        let built = '';
        while (cursor < cleaned.length) {
          if (cleaned[cursor] === '=' && cursor + 2 < cleaned.length && /^[0-9A-Fa-f]{2}$/.test(cleaned.substring(cursor + 1, cursor + 3))) {
            const byteVal = parseInt(cleaned.substring(cursor + 1, cursor + 3), 16);
            matches.push(byteVal);
            cursor += 3;
          } else {
            if (matches.length > 0) {
              const u8 = new Uint8Array(matches);
              built += new TextDecoder('utf-8', { fatal: false }).decode(u8);
              matches.length = 0;
            }
            built += cleaned[cursor];
            cursor++;
          }
        }
        if (matches.length > 0) {
          const u8 = new Uint8Array(matches);
          built += new TextDecoder('utf-8', { fatal: false }).decode(u8);
        }
        cleaned = built;
      } catch {
        // preserve
      }
    }
  }

  // 2. Check and repair Mojibake (where UTF-8 byte stream was read as Latin1 / Windows-1252)
  // Characteristic indicators: 'ðŸ', 'Ã', 'â', etc.
  if (/[ðÃâÂéëïöü]/.test(cleaned)) {
    try {
      const bytes: number[] = [];
      let canDecode = true;
      for (let i = 0; i < cleaned.length; i++) {
        const code = cleaned.charCodeAt(i);
        if (code <= 0xFF) {
          bytes.push(code);
        } else {
          canDecode = false;
          break;
        }
      }

      if (canDecode && bytes.length > 0) {
        const uint8Array = new Uint8Array(bytes);
        const recovered = new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
        if (recovered && recovered.length > 0) {
          cleaned = recovered;
        }
      }
    } catch {
      // If decoding fails, keep cleaned as is
    }
  }

  // Clean remaining unescaped vCard delimiter escapes
  return cleaned
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .replace(/=$/g, '')
    .trim();
}

/**
 * Normalizes phone numbers by stripping formatting characters and Gambian country codes.
 */
export function cleanPhoneNumber(raw: string): string {
  if (!raw) return '';
  let cleaned = String(raw).trim().replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+220')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('00220')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('220') && cleaned.length > 7) {
    cleaned = cleaned.substring(3);
  }
  return cleaned;
}

/**
 * Core PURA migration processor for a single telephone string.
 */
export function processSingleNumber(raw: string, includeCountryCode = true): NumberProcessResult {
  const originalRaw = String(raw || '').trim();
  const cleaned = cleanPhoneNumber(originalRaw);

  if (!cleaned) {
    return {
      cleaned: '',
      result: '',
      status: 'review',
      label: 'Invalid / Empty',
      operator: 'Unknown',
      originalRaw,
    };
  }

  // Check for non-Gambian foreign international number (starts with + or 00 and not +220)
  if (
    (originalRaw.startsWith('+') && !originalRaw.startsWith('+220')) ||
    (originalRaw.startsWith('00') && !originalRaw.startsWith('00220'))
  ) {
    return {
      cleaned,
      result: originalRaw,
      status: 'already',
      label: 'Foreign / International',
      operator: 'International',
      originalRaw,
    };
  }

  const prefix = includeCountryCode ? '+220 ' : '';

  // Upgraded 9-digit Gambian numbers (must begin with assigned 83, 86, or 87 operator code)
  if (cleaned.length === 9) {
    if (cleaned.startsWith('83')) {
      return {
        cleaned,
        result: `${prefix}${cleaned}`,
        status: 'already',
        label: 'QCell (Already 9-Digit)',
        operator: 'QCell',
        originalRaw,
      };
    }
    if (cleaned.startsWith('86')) {
      return {
        cleaned,
        result: `${prefix}${cleaned}`,
        status: 'already',
        label: 'Comium (Already 9-Digit)',
        operator: 'Comium',
        originalRaw,
      };
    }
    if (cleaned.startsWith('87')) {
      return {
        cleaned,
        result: `${prefix}${cleaned}`,
        status: 'already',
        label: 'Africell (Already 9-Digit)',
        operator: 'Africell',
        originalRaw,
      };
    }

    // 9-digit number without valid 83/86/87 prefix is malformed (e.g. 385762666 with 9 digits starting with 3)
    return {
      cleaned,
      result: originalRaw,
      status: 'review',
      label: 'Review Needed (Invalid 9-digit Gambian number — missing 83/86/87 prefix)',
      operator: 'Unknown',
      originalRaw,
    };
  }

  // 7-digit Gambian subscriber number
  if (cleaned.length === 7) {
    const first1 = cleaned.substring(0, 1);
    const first2 = cleaned.substring(0, 2);

    // Gamcel mobile numbers (9 series) -> Deferred in Phase 1
    if (first1 === GAMCEL_PREFIX) {
      return {
        cleaned,
        result: `${prefix}${cleaned}`,
        status: 'already',
        label: 'Gamcel (Phase 2 Deferred)',
        operator: 'Gamcel',
        originalRaw,
      };
    }

    // Gamtel Fixed-Line Landlines (42, 43, 44, 47, 48, 56, 57) -> Deferred in Phase 1
    if (GAMTEL_LANDLINE_PREFIXES.includes(first2)) {
      return {
        cleaned,
        result: `${prefix}${cleaned}`,
        status: 'already',
        label: 'Gamtel Fixed (Phase 2 Deferred)',
        operator: 'Gamtel',
        originalRaw,
      };
    }

    // Check operators for 83, 86, 87 prefix assignment
    for (const rule of MIGRATION_RULES) {
      const match1 = rule.prefixes1.includes(first1);
      const match2 = rule.prefixes2.includes(first2);

      if (match1 || match2) {
        const upgraded = `${rule.add}${cleaned}`;
        return {
          cleaned,
          result: `${prefix}${upgraded}`,
          status: 'ok',
          label: `${rule.name} (+${rule.add})`,
          operator: rule.name,
          addedPrefix: rule.add,
          originalRaw,
        };
      }
    }
  }

  // Handle other non-standard lengths with informative labels
  let reviewReason = 'Review Needed (Non-standard length)';
  if (cleaned.length < 7) {
    reviewReason = `Review Needed (Too short: ${cleaned.length} digits)`;
  } else if (cleaned.length === 8) {
    reviewReason = 'Review Needed (8 digits — unrecognized length)';
  } else if (cleaned.length > 9) {
    reviewReason = `Review Needed (Too long: ${cleaned.length} digits)`;
  }

  return {
    cleaned,
    result: originalRaw,
    status: 'review',
    label: reviewReason,
    operator: 'Unknown',
    originalRaw,
  };
}

/**
 * Processes a full contact name & raw phone string (which may contain multiple comma/slash separated numbers).
 */
export function processFullContact(
  name: string,
  phoneString: string,
  includeCountryCode = true,
  index = 0,
  customId?: string
): ContactRecord {
  const decodedName = decodeQuotedPrintable(name || '').trim() || 'Unnamed Contact';
  
  // Split multiple phone numbers if present
  const rawParts = (phoneString || '')
    .split(/[,;\/]/)
    .map(s => s.trim())
    .filter(Boolean);

  if (rawParts.length === 0) {
    const single = processSingleNumber('', includeCountryCode);
    return {
      id: customId || `contact-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: decodedName,
      raw: phoneString || '',
      result: single.result,
      status: single.status,
      operator: single.operator,
      phoneNumbers: [single],
      originalIndex: index,
      hasRepeatedNumbers: false,
    };
  }

  const phoneResults = rawParts.map(p => processSingleNumber(p, includeCountryCode));
  const combinedResult = phoneResults.map(r => r.result).filter(Boolean).join(', ');

  // Detect repeated numbers within this contact
  const seenCanonical = new Set<string>();
  let hasRepeatedNumbers = false;
  for (const p of phoneResults) {
    const key = getCanonicalPhoneKey(p.originalRaw || p.result);
    if (key) {
      if (seenCanonical.has(key)) {
        hasRepeatedNumbers = true;
      } else {
        seenCanonical.add(key);
      }
    }
  }

  // Primary status: if any number is 'ok' (upgraded), primary status is 'ok'.
  // Else if any is 'review', primary is 'review', else 'already'.
  let primaryStatus: ContactStatus = 'already';
  if (phoneResults.some(r => r.status === 'ok')) {
    primaryStatus = 'ok';
  } else if (phoneResults.some(r => r.status === 'review')) {
    primaryStatus = 'review';
  }

  // Primary operator from first upgraded or first recognized
  const prioritizedOperator = phoneResults.find(r => r.operator !== 'Unknown')?.operator || phoneResults[0].operator;

  return {
    id: customId || `contact-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: decodedName,
    raw: phoneString,
    result: combinedResult,
    status: primaryStatus,
    operator: prioritizedOperator,
    phoneNumbers: phoneResults,
    originalIndex: index,
    hasRepeatedNumbers,
  };
}

/**
 * Computes a canonical representation of a phone number for exact/shared duplicate grouping:
 * - Gambian numbers (7 or 9 digits, with or without +220/00220/spaces) map to their upgraded Gambian key: "GM:877123456"
 * - Foreign international numbers map to their normalized full international key: "INTL:+221771234567"
 * - Empty / invalid fallback to raw.
 */
export function getCanonicalPhoneKey(phone: string): string {
  if (!phone) return '';
  const trimmed = String(phone).trim();
  const processed = processSingleNumber(trimmed, false);

  if (processed.operator === 'International') {
    let intl = trimmed.replace(/[\s\-\(\)\.]/g, '');
    if (intl.startsWith('00')) intl = '+' + intl.substring(2);
    else if (!intl.startsWith('+')) intl = '+' + intl;
    return `INTL:${intl}`;
  }

  // Gambian numbers - use the 9-digit / standard normalized number
  if (processed.result) {
    const digits = processed.result.replace(/\D/g, '');
    if (digits.startsWith('220') && digits.length > 7) {
      return `GM:${digits.substring(3)}`;
    }
    return `GM:${digits}`;
  }

  return `RAW:${trimmed.replace(/\s+/g, '')}`;
}

/**
 * Finds all contacts from the pool that share the same telephone number as the target contact.
 * Uses strict canonical phone key matching to prevent foreign numbers from mistakenly matching.
 */
export function getRelatedContactsForMerge(
  targetRecord: ContactRecord,
  allRecords: ContactRecord[]
): ContactRecord[] {
  const targetKeys = new Set<string>();
  const phoneList = targetRecord.phoneNumbers.length > 0
    ? targetRecord.phoneNumbers.map(p => p.originalRaw || p.cleaned || p.result)
    : [targetRecord.raw || targetRecord.result];

  phoneList.forEach(p => {
    const key = getCanonicalPhoneKey(p);
    if (key) targetKeys.add(key);
  });

  if (targetKeys.size === 0) return [targetRecord];

  return allRecords.filter((c) => {
    if (c.id === targetRecord.id) return true;
    const cPhoneList = c.phoneNumbers.length > 0
      ? c.phoneNumbers.map(p => p.originalRaw || p.cleaned || p.result)
      : [c.raw || c.result];

    return cPhoneList.some(p => {
      const k = getCanonicalPhoneKey(p);
      return k && targetKeys.has(k);
    });
  });
}

/**
 * Deduplication & repeated number analysis across all loaded records:
 * 1. exactGroups & exactIndices: Same normalized name AND same normalized canonical phone number.
 * 2. sharedGroups & sharedIndices: Different names sharing the exact same normalized canonical phone number.
 * 3. repeatedGroups & repeatedIndices: Single contact records containing duplicate/repeated phone numbers.
 */
/**
 * Checks whether a contact record has no valid phone number or has empty telephone digits.
 */
export function isMissingPhone(record: ContactRecord): boolean {
  if (!record) return true;
  const rawClean = (record.raw || '').trim();
  if (!rawClean) {
    if (!record.phoneNumbers || record.phoneNumbers.length === 0) return true;
    return record.phoneNumbers.every((p) => !p.cleaned || !p.cleaned.trim());
  }
  const digits = rawClean.replace(/\D/g, '');
  if (digits.length === 0) return true;
  return false;
}

/**
 * Enhanced duplicate & intelligence detector:
 * 1. exactGroups & exactIndices: Same normalized name AND same normalized canonical phone number.
 * 2. sharedGroups & sharedIndices: Different names sharing the exact same normalized canonical phone number.
 * 3. repeatedGroups & repeatedIndices: Single contact records containing duplicate/repeated phone numbers.
 * 4. missingPhoneGroups & missingPhoneIndices: Single contact records with no phone number.
 */
export function analyzeDuplicates(records: ContactRecord[]): DuplicateAnalysisResult {
  const exactIndices = new Set<number>();
  const sharedIndices = new Set<number>();
  const repeatedIndices = new Set<number>();
  const missingPhoneIndices = new Set<number>();
  const repeatedGroups: RepeatedGroup[] = [];
  const missingPhoneGroups: Array<{ contactIndex: number; contactId: string; name: string }> = [];

  if (!records || !Array.isArray(records) || records.length === 0) {
    return {
      exactIndices,
      sharedIndices,
      repeatedIndices,
      missingPhoneIndices,
      exactCount: 0,
      sharedCount: 0,
      repeatedCount: 0,
      missingPhoneCount: 0,
      exactGroups: [],
      sharedGroups: [],
      repeatedGroups: [],
      missingPhoneGroups: [],
    };
  }

  const exactMap = new Map<string, { indices: number[]; name: string; phone: string }>();
  const phoneToContacts = new Map<string, { displayPhone: string; nameMap: Map<string, number[]> }>();

  records.forEach((r, idx) => {
    // Check if missing phone number
    if (isMissingPhone(r)) {
      missingPhoneIndices.add(idx);
      missingPhoneGroups.push({
        contactIndex: idx,
        contactId: r.id,
        name: r.name,
      });
    }

    const normName = (r.name || '').toLowerCase().trim();
    const phoneList = r.phoneNumbers.length > 0 
      ? r.phoneNumbers.map(p => p.originalRaw || p.cleaned || p.result).filter(Boolean)
      : [r.raw || r.result].filter(Boolean);

    // Repeated numbers within this single contact
    const seenInContact = new Set<string>();
    const repeatsInThisContact: string[] = [];

    phoneList.forEach(phoneStr => {
      const canonicalKey = getCanonicalPhoneKey(phoneStr);
      if (!canonicalKey) return;

      if (seenInContact.has(canonicalKey)) {
        repeatsInThisContact.push(phoneStr);
      } else {
        seenInContact.add(canonicalKey);
      }

      // 1. Exact match check (distinct contacts sharing same name & phone)
      const exactKey = `${normName}||${canonicalKey}`;
      if (!exactMap.has(exactKey)) {
        exactMap.set(exactKey, { indices: [], name: r.name, phone: phoneStr });
      }
      const exactEntry = exactMap.get(exactKey)!;
      if (!exactEntry.indices.includes(idx)) {
        exactEntry.indices.push(idx);
      }

      // 2. Phone mapping for shared numbers across distinct contacts
      if (!phoneToContacts.has(canonicalKey)) {
        phoneToContacts.set(canonicalKey, {
          displayPhone: phoneStr,
          nameMap: new Map(),
        });
      }
      const entry = phoneToContacts.get(canonicalKey)!;
      if (!entry.nameMap.has(normName)) {
        entry.nameMap.set(normName, []);
      }
      const nameIndices = entry.nameMap.get(normName)!;
      if (!nameIndices.includes(idx)) {
        nameIndices.push(idx);
      }
    });

    if (repeatsInThisContact.length > 0 || r.hasRepeatedNumbers) {
      repeatedIndices.add(idx);
      repeatedGroups.push({
        contactIndex: idx,
        contactId: r.id,
        name: r.name,
        repeatedPhones: repeatsInThisContact.length > 0 ? repeatsInThisContact : phoneList,
      });
    }
  });

  const exactGroups: Array<{ key: string; indices: number[]; name: string; phone: string }> = [];
  exactMap.forEach((entry, key) => {
    if (entry.indices.length > 1) {
      exactGroups.push({ key, ...entry });
      entry.indices.forEach(i => exactIndices.add(i));
    }
  });

  const sharedGroups: Array<{ phone: string; indices: number[]; names: string[] }> = [];
  phoneToContacts.forEach((entry) => {
    if (entry.nameMap.size > 1) {
      const allIndices: number[] = [];
      const distinctNames: string[] = [];
      entry.nameMap.forEach((indices) => {
        allIndices.push(...indices);
        indices.forEach(i => sharedIndices.add(i));
        const sampleRecord = records[indices[0]];
        if (sampleRecord && !distinctNames.includes(sampleRecord.name)) {
          distinctNames.push(sampleRecord.name);
        }
      });
      sharedGroups.push({
        phone: entry.displayPhone,
        indices: allIndices,
        names: distinctNames,
      });
    }
  });

  return {
    exactIndices,
    sharedIndices,
    repeatedIndices,
    missingPhoneIndices,
    exactCount: exactIndices.size,
    sharedCount: sharedIndices.size,
    repeatedCount: repeatedIndices.size,
    missingPhoneCount: missingPhoneIndices.size,
    exactGroups,
    sharedGroups,
    repeatedGroups,
    missingPhoneGroups,
  };
}

/**
 * Removes internal repeated numbers from contacts by preserving only unique phone numbers per contact.
 */
export function removeInternalRepeatedNumbers(
  records: ContactRecord[],
  includeCountryCode = true
): { updatedRecords: ContactRecord[]; cleanedContactsCount: number; removedNumbersCount: number } {
  let cleanedContactsCount = 0;
  let removedNumbersCount = 0;

  const updatedRecords = records.map((record, idx) => {
    const rawParts = (record.raw || '')
      .split(/[,;\/]/)
      .map(s => s.trim())
      .filter(Boolean);

    if (rawParts.length <= 1) {
      return { ...record, originalIndex: idx };
    }

    const seenCanonical = new Set<string>();
    const uniqueRawParts: string[] = [];

    for (const part of rawParts) {
      const key = getCanonicalPhoneKey(part);
      if (key) {
        if (!seenCanonical.has(key)) {
          seenCanonical.add(key);
          uniqueRawParts.push(part);
        } else {
          removedNumbersCount++;
        }
      } else {
        uniqueRawParts.push(part);
      }
    }

    if (uniqueRawParts.length < rawParts.length) {
      cleanedContactsCount++;
      const newRaw = uniqueRawParts.join(', ');
      return processFullContact(record.name, newRaw, includeCountryCode, idx, record.id);
    }

    return { ...record, originalIndex: idx };
  });

  return {
    updatedRecords,
    cleanedContactsCount,
    removedNumbersCount,
  };
}

/**
 * Bulk deduplication: automatically keeps 1 copy of every exact duplicate contact (matching name & canonical phone).
 */
export function bulkMergeExactDuplicates(records: ContactRecord[]): {
  updatedRecords: ContactRecord[];
  removedCount: number;
} {
  const seen = new Set<string>();
  const filtered: ContactRecord[] = [];
  let removedCount = 0;

  records.forEach((r) => {
    const normName = (r.name || '').toLowerCase().trim();
    const phoneList = r.phoneNumbers.length > 0
      ? r.phoneNumbers.map(p => getCanonicalPhoneKey(p.originalRaw || p.result)).filter(Boolean)
      : [getCanonicalPhoneKey(r.raw || r.result)].filter(Boolean);

    const primaryKey = `${normName}||${phoneList.sort().join(';')}`;
    if (seen.has(primaryKey)) {
      removedCount++;
    } else {
      seen.add(primaryKey);
      filtered.push({ ...r, originalIndex: filtered.length });
    }
  });

  return {
    updatedRecords: filtered,
    removedCount,
  };
}

/**
 * Bulk merge of all shared phone number groups using a selected name combination strategy.
 */
export function bulkMergeSharedGroups(
  records: ContactRecord[],
  includeCountryCode = true,
  strategy: 'slash' | 'and' | 'first' = 'slash'
): { updatedRecords: ContactRecord[]; mergedGroupsCount: number; reducedCount: number } {
  const analysis = analyzeDuplicates(records);
  if (analysis.sharedGroups.length === 0) {
    return { updatedRecords: records, mergedGroupsCount: 0, reducedCount: 0 };
  }

  const indicesToReplace = new Map<number, ContactRecord>();
  const indicesToRemove = new Set<number>();

  analysis.sharedGroups.forEach((group) => {
    const groupRecords = group.indices.map(i => records[i]).filter(Boolean);
    if (groupRecords.length < 2) return;

    const uniqueNames = Array.from(new Set(groupRecords.map(r => r.name.trim()))).filter(Boolean);
    let chosenName = uniqueNames[0] || 'Merged Contact';
    if (strategy === 'slash') {
      chosenName = uniqueNames.join(' / ');
    } else if (strategy === 'and') {
      chosenName = uniqueNames.join(' & ');
    }

    // Collect all unique phone strings
    const allPhones = Array.from(new Set(groupRecords.flatMap(r => 
      r.phoneNumbers.map(p => p.originalRaw || p.result).filter(Boolean)
    )));
    const combinedPhoneStr = allPhones.join(', ') || group.phone;

    const mergedRecord = processFullContact(
      chosenName,
      combinedPhoneStr,
      includeCountryCode,
      group.indices[0],
      groupRecords[0].id
    );

    // Primary index gets replaced, subsequent indices get removed
    indicesToReplace.set(group.indices[0], mergedRecord);
    for (let i = 1; i < group.indices.length; i++) {
      indicesToRemove.add(group.indices[i]);
    }
  });

  const updatedRecords: ContactRecord[] = [];
  records.forEach((r, idx) => {
    if (indicesToRemove.has(idx)) {
      return;
    }
    if (indicesToReplace.has(idx)) {
      updatedRecords.push({ ...indicesToReplace.get(idx)!, originalIndex: updatedRecords.length });
    } else {
      updatedRecords.push({ ...r, originalIndex: updatedRecords.length });
    }
  });

  return {
    updatedRecords,
    mergedGroupsCount: analysis.sharedGroups.length,
    reducedCount: records.length - updatedRecords.length,
  };
}

/**
 * Strips embedded profile images (PHOTO and LOGO properties, including multi-line base64 payloads)
 * from vCard text to optimize processing speed and eliminate payload bloat.
 */
export function stripVcardPhotos(vcfText: string): string {
  if (!vcfText) return '';
  const lines = vcfText.split(/\r?\n/);
  const cleanedLines: string[] = [];
  let isSkippingPhoto = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isContinuation = /^[ \t]/.test(line);

    if (isContinuation) {
      if (isSkippingPhoto) {
        // Skip continuation line of a PHOTO/LOGO property
        continue;
      }
      cleanedLines.push(line);
      continue;
    }

    // New property line
    const upper = line.toUpperCase().trim();
    if (
      upper.startsWith('PHOTO:') ||
      upper.startsWith('PHOTO;') ||
      upper.startsWith('LOGO:') ||
      upper.startsWith('LOGO;')
    ) {
      isSkippingPhoto = true;
      continue;
    }

    isSkippingPhoto = false;
    cleanedLines.push(line);
  }

  return cleanedLines.join('\r\n');
}

/**
 * Parses vCard (.vcf) format supporting multiple cards, FN, N, TEL types, Quoted-Printable UTF-8.
 * Automatically strips embedded profile photos before processing.
 */
export function parseVCF(text: string, includeCountryCode = true): ContactRecord[] {
  const sanitizedText = stripVcardPhotos(text);
  const vcards = sanitizedText.split(/END:VCARD/i);
  const results: ContactRecord[] = [];

  vcards.forEach((v, idx) => {
    if (!v.trim()) return;
    const lines = v.split(/\r?\n/);
    let name = '';
    const phones: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // Handle Quoted-Printable soft line break continuations where line ends with '='
      while (line.endsWith('=') && i + 1 < lines.length) {
        i++;
        line = line.slice(0, -1) + lines[i].trim();
      }

      // Handle RFC line unfolding (lines starting with whitespace)
      while (i + 1 < lines.length && (/^[ \t]/.test(lines[i + 1]))) {
        i++;
        line = line + lines[i].trim();
      }

      const upper = line.toUpperCase();
      if (upper.startsWith('FN:') || upper.startsWith('FN;')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          name = decodeQuotedPrintable(line.substring(colonIdx + 1));
        }
      } else if (!name && (upper.startsWith('N:') || upper.startsWith('N;'))) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const rawVal = line.substring(colonIdx + 1);
          const decoded = decodeQuotedPrintable(rawVal);
          const nParts = decoded.split(';').map(s => s.trim()).filter(Boolean);
          if (nParts.length > 0) {
            name = nParts.reverse().join(' ');
          }
        }
      } else if (upper.startsWith('TEL')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const rawVal = line.substring(colonIdx + 1).trim();
          rawVal.split(/[,;\/]/).forEach(p => {
            const cleaned = p.trim();
            if (cleaned) {
              phones.push(cleaned);
            }
          });
        }
      }
    }

    const contactName = name || `Unnamed Contact ${results.length + 1}`;
    const combinedPhones = phones.join(', ');

    results.push(processFullContact(contactName, combinedPhones, includeCountryCode, results.length));
  });

  return results;
}

/**
 * Parses CSV or raw lines into ContactRecord array.
 */
export function parseCSV(text: string, includeCountryCode = true): ContactRecord[] {
  const lines = text.split(/\r?\n/);
  const results: ContactRecord[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Ignore CSV header if present
    if (idx === 0 && (trimmed.toLowerCase().includes('name') && (trimmed.toLowerCase().includes('phone') || trimmed.toLowerCase().includes('number') || trimmed.toLowerCase().includes('mobile')))) {
      return;
    }

    let name = 'Unnamed Contact';
    let phone = '';

    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (parts.length === 1) {
        phone = parts[0];
      } else if (parts.length === 2) {
        name = parts[0] || 'Unnamed Contact';
        phone = parts[1];
      } else {
        // Last item is phone, previous are name parts
        phone = parts[parts.length - 1];
        name = parts.slice(0, parts.length - 1).join(' ') || 'Unnamed Contact';
      }
    } else if (trimmed.includes('\t')) {
      const parts = trimmed.split('\t').map(s => s.trim());
      if (parts.length >= 2) {
        name = parts[0] || 'Unnamed Contact';
        phone = parts[1];
      } else {
        phone = parts[0];
      }
    } else {
      // Single line phone or name number
      const words = trimmed.split(/\s+/);
      const lastWord = words[words.length - 1];
      if (/^(\+?[0-9\-\(\)]+)$/.test(lastWord)) {
        phone = lastWord;
        name = words.slice(0, words.length - 1).join(' ') || 'Unnamed Contact';
      } else {
        phone = trimmed;
      }
    }

    results.push(processFullContact(name, phone, includeCountryCode, results.length));
  });

  return results;
}

/**
 * Generates standards-compliant vCard 3.0 string.
 */
export function generateVCF(records: ContactRecord[]): string {
  return records.map(r => {
    const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
    lines.push(`FN:${r.name}`);
    
    // Separate TEL entries for each phone number
    const numbers = r.phoneNumbers.length > 0 
      ? r.phoneNumbers.map(p => p.result) 
      : r.result.split(',').map(s => s.trim());
      
    const uniqueNums = [...new Set(numbers.filter(Boolean))];
    uniqueNums.forEach(num => {
      lines.push(`TEL;TYPE=CELL:${num}`);
    });

    lines.push('NOTE:Upgraded to PURA 9-Digit Numbering Plan');
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }).join('\r\n\r\n');
}

/**
 * Generates CSV string for export with simplified "Contact Name" and "Mobile" columns.
 */
export function generateCSV(records: ContactRecord[]): string {
  const rows = ['"Contact Name","Mobile"'];
  records.forEach(r => {
    const escapedName = r.name.replace(/"/g, '""');
    const escapedMobile = r.result.replace(/"/g, '""');
    rows.push(`"${escapedName}","${escapedMobile}"`);
  });
  return rows.join('\r\n');
}

/**
 * Triggers file download in browser.
 */
export function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
