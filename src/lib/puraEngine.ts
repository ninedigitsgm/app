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

  // Upgraded 9-digit Gambian numbers (must begin with assigned 83, 86, or 87 operator code and have a valid inner 7-digit subscriber number)
  if (cleaned.length === 9) {
    const inner7 = cleaned.substring(2);
    const inner1 = inner7.substring(0, 1);
    const inner2 = inner7.substring(0, 2);

    if (cleaned.startsWith('83')) {
      const isValid = MIGRATION_RULES[0].prefixes1.includes(inner1) || MIGRATION_RULES[0].prefixes2.includes(inner2);
      if (isValid) {
        return {
          cleaned,
          result: `${prefix}${cleaned}`,
          status: 'already',
          label: 'QCell (Already 9-Digit)',
          operator: 'QCell',
          originalRaw,
        };
      }
    }
    if (cleaned.startsWith('86')) {
      const isValid = MIGRATION_RULES[1].prefixes1.includes(inner1) || MIGRATION_RULES[1].prefixes2.includes(inner2);
      if (isValid) {
        return {
          cleaned,
          result: `${prefix}${cleaned}`,
          status: 'already',
          label: 'Comium (Already 9-Digit)',
          operator: 'Comium',
          originalRaw,
        };
      }
    }
    if (cleaned.startsWith('87')) {
      const isValid = MIGRATION_RULES[2].prefixes1.includes(inner1) || MIGRATION_RULES[2].prefixes2.includes(inner2);
      if (isValid) {
        return {
          cleaned,
          result: `${prefix}${cleaned}`,
          status: 'already',
          label: 'Africell (Already 9-Digit)',
          operator: 'Africell',
          originalRaw,
        };
      }
    }

    // 9-digit number with 83/86/87 but invalid inner 7 digits (reserved, emergency, customer care, or non-GSM series)
    return {
      cleaned,
      result: originalRaw,
      status: 'review',
      label: 'Review Needed (Invalid 9-digit number: inner prefix not part of valid GSM series / reserved service)',
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
        label: 'Gamcel (Phase 1 Deferred (7-Digit))',
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
        label: 'Gamtel Fixed (Phase 1 Deferred (7-Digit))',
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
    reviewReason = 'Review Needed (8 digits: unrecognized length)';
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
  
  // Split multiple phone numbers if present (comma, slash, semicolon, pipe, newlines, and/ampersand)
  const rawParts = (phoneString || '')
    .split(/[,;/|\n]|\s+and\s+|\s+&\s+/i)
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

  const phoneResults: NumberProcessResult[] = [];
  const seenCanonical = new Set<string>();
  let hasRepeatedNumbers = false;

  for (const part of rawParts) {
    const res = processSingleNumber(part, includeCountryCode);
    const key = getCanonicalPhoneKey(res.originalRaw || res.result);
    if (key) {
      if (seenCanonical.has(key)) {
        hasRepeatedNumbers = true;
      } else {
        seenCanonical.add(key);
      }
    }
    phoneResults.push(res);
  }

  if (phoneResults.length === 0) {
    const single = processSingleNumber('', includeCountryCode);
    phoneResults.push(single);
  }

  const combinedResult = phoneResults.map(r => r.result).filter(Boolean).join(', ');
  const combinedRaw = phoneResults.map(r => r.originalRaw || r.result).filter(Boolean).join(', ');

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
    raw: combinedRaw || phoneString,
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
 * - Invalid / empty / non-phone numbers return "" so they are NEVER mistakenly grouped as duplicates.
 */
export function getCanonicalPhoneKey(phone: string): string {
  if (!phone) return '';
  const trimmed = String(phone).trim();
  if (!trimmed) return '';

  // Extract only digits
  const allDigits = trimmed.replace(/\D/g, '');
  if (allDigits.length < 5) return '';

  const processed = processSingleNumber(trimmed, false);

  if (processed.operator === 'International') {
    let intl = trimmed.replace(/[\s\-\(\)\.]/g, '');
    if (intl.startsWith('00')) intl = '+' + intl.substring(2);
    else if (!intl.startsWith('+')) intl = '+' + intl;
    const digitsOnly = intl.replace(/\D/g, '');
    if (digitsOnly.length < 6) return '';
    return `INTL:${intl}`;
  }

  // Gambian numbers - use the 9-digit / standard normalized number
  if (processed.result) {
    const digits = processed.result.replace(/\D/g, '');
    let cleanGm = digits;
    if (cleanGm.startsWith('220')) {
      cleanGm = cleanGm.substring(3);
    }
    // Must be a valid Gambian subscriber length (7 digits or 9 digits)
    if (cleanGm.length === 7 || cleanGm.length === 9) {
      return `GM:${cleanGm}`;
    }
  }

  // If status is review or unparseable, do not group unless digits match and length >= 7
  let gmDigits = allDigits;
  if (gmDigits.startsWith('220')) {
    gmDigits = gmDigits.substring(3);
  }
  if (gmDigits.length === 7 || gmDigits.length === 9) {
    return `GM:${gmDigits}`;
  }

  return '';
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

  // 1. Exact / Same-Name Duplicate Groups with Overlapping or Subset Phone Numbers
  // Group records by normalized name
  const nameToMeta = new Map<string, Array<{
    index: number;
    record: ContactRecord;
    normName: string;
    canonicalKeys: string[];
    displayPhones: string[];
  }>>();

  const metaList: Array<{
    index: number;
    record: ContactRecord;
    normName: string;
    canonicalKeys: string[];
    displayPhones: string[];
  }> = [];

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
    const phoneList = r.phoneNumbers && r.phoneNumbers.length > 0 
      ? r.phoneNumbers.map(p => p.originalRaw || p.cleaned || p.result).filter(Boolean)
      : [r.raw || r.result].filter(Boolean);

    // Repeated numbers within this single contact
    const seenInContact = new Set<string>();
    const repeatsInThisContact: string[] = [];
    const canonicalKeys: string[] = [];
    const displayPhones: string[] = [];

    phoneList.forEach(phoneStr => {
      const canonicalKey = getCanonicalPhoneKey(phoneStr);
      if (!canonicalKey) return;

      canonicalKeys.push(canonicalKey);
      displayPhones.push(phoneStr);

      if (seenInContact.has(canonicalKey)) {
        repeatsInThisContact.push(phoneStr);
      } else {
        seenInContact.add(canonicalKey);
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

    if (repeatsInThisContact.length > 0) {
      repeatedIndices.add(idx);
      repeatedGroups.push({
        contactIndex: idx,
        contactId: r.id,
        name: r.name,
        repeatedPhones: repeatsInThisContact,
      });
    }

    const meta = {
      index: idx,
      record: r,
      normName,
      canonicalKeys,
      displayPhones,
    };
    metaList.push(meta);

    if (normName && canonicalKeys.length > 0) {
      if (!nameToMeta.has(normName)) {
        nameToMeta.set(normName, []);
      }
      nameToMeta.get(normName)!.push(meta);
    }
  });

  const exactGroups: Array<{ key: string; indices: number[]; name: string; phone: string }> = [];

  nameToMeta.forEach((sameNameList, normName) => {
    if (sameNameList.length < 2) return;

    // Build connected components for same-name records that share at least 1 canonical phone key
    const visited = new Set<number>();

    for (let i = 0; i < sameNameList.length; i++) {
      if (visited.has(sameNameList[i].index)) continue;

      const component: typeof sameNameList = [];
      const queue: typeof sameNameList = [sameNameList[i]];
      visited.add(sameNameList[i].index);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        component.push(curr);
        const currKeySet = new Set(curr.canonicalKeys);

        for (let j = 0; j < sameNameList.length; j++) {
          const neighbor = sameNameList[j];
          if (!visited.has(neighbor.index)) {
            const sharesKey = neighbor.canonicalKeys.some(k => currKeySet.has(k));
            if (sharesKey) {
              visited.add(neighbor.index);
              queue.push(neighbor);
            }
          }
        }
      }

      if (component.length > 1) {
        // Sort indices within the group so the record with the most phone numbers comes first,
        // followed by original index
        component.sort((a, b) => {
          const countA = a.canonicalKeys.length;
          const countB = b.canonicalKeys.length;
          if (countB !== countA) return countB - countA;
          return a.index - b.index;
        });

        const groupIndices = component.map(c => c.index);
        groupIndices.forEach(idx => exactIndices.add(idx));

        // Collect unique display phones for the group header
        const uniquePhones: string[] = [];
        const seenPhones = new Set<string>();
        component.forEach(c => {
          c.displayPhones.forEach(p => {
            const k = getCanonicalPhoneKey(p);
            if (k && !seenPhones.has(k)) {
              seenPhones.add(k);
              uniquePhones.push(p);
            }
          });
        });

        exactGroups.push({
          key: `${normName}||${groupIndices.join('-')}`,
          name: component[0].record.name,
          phone: uniquePhones.join(', '),
          indices: groupIndices,
        });
      }
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

export interface MergedGroupDetail {
  resultRecord: ContactRecord;
  originalNames: string[];
  phone: string;
}

/**
 * Removes internal repeated numbers from contacts by preserving only unique phone numbers per contact.
 */
export function removeInternalRepeatedNumbers(
  records: ContactRecord[],
  includeCountryCode = true
): { 
  updatedRecords: ContactRecord[]; 
  cleanedContactsCount: number; 
  removedNumbersCount: number;
  affectedRecords: ContactRecord[];
} {
  let cleanedContactsCount = 0;
  let removedNumbersCount = 0;
  const affectedRecords: ContactRecord[] = [];

  const updatedRecords = records.map((record, idx) => {
    const rawParts = (record.raw || '')
      .split(/[,]/)
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
      const processed = processFullContact(record.name, newRaw, includeCountryCode, idx, record.id);
      affectedRecords.push(processed);
      return processed;
    }

    return { ...record, originalIndex: idx };
  });

  return {
    updatedRecords,
    cleanedContactsCount,
    removedNumbersCount,
    affectedRecords,
  };
}

/**
 * Bulk deduplication: automatically keeps the most complete copy of every exact/same-name duplicate cluster
 * (records with identical name sharing phone numbers). Discards copies with fewer numbers or redundant duplicates,
 * while ensuring no unique phone number is lost.
 */
export function bulkMergeExactDuplicates(
  records: ContactRecord[],
  includeCountryCode = true
): {
  updatedRecords: ContactRecord[];
  removedCount: number;
  affectedRecords: ContactRecord[];
} {
  if (!records || records.length === 0) {
    return { updatedRecords: [], removedCount: 0, affectedRecords: [] };
  }

  const analysis = analyzeDuplicates(records);
  if (analysis.exactGroups.length === 0) {
    return { updatedRecords: [...records], removedCount: 0, affectedRecords: [] };
  }

  // Set of record indices to remove and map of keeper index to updated ContactRecord
  const removeIndexSet = new Set<number>();
  const keeperUpdates = new Map<number, ContactRecord>();
  const affectedRecords: ContactRecord[] = [];
  let removedCount = 0;

  analysis.exactGroups.forEach((group) => {
    // Indices are already sorted with the most complete record first
    const keeperIdx = group.indices[0];
    const keeperRecord = records[keeperIdx];
    const otherIndices = group.indices.slice(1);

    // Collect all phone numbers across all records in the group
    const keeperCanonicalKeys = new Set(
      keeperRecord.phoneNumbers && keeperRecord.phoneNumbers.length > 0
        ? keeperRecord.phoneNumbers.map(p => getCanonicalPhoneKey(p.originalRaw || p.result)).filter(Boolean)
        : [getCanonicalPhoneKey(keeperRecord.raw || keeperRecord.result)].filter(Boolean)
    );

    const extraRawPhones: string[] = [];

    otherIndices.forEach((otherIdx) => {
      removeIndexSet.add(otherIdx);
      removedCount++;

      const otherRec = records[otherIdx];
      const otherPhoneList = otherRec.phoneNumbers && otherRec.phoneNumbers.length > 0
        ? otherRec.phoneNumbers.map(p => p.originalRaw || p.result)
        : [otherRec.raw || otherRec.result];

      otherPhoneList.forEach((phoneStr) => {
        const key = getCanonicalPhoneKey(phoneStr);
        if (key && !keeperCanonicalKeys.has(key)) {
          keeperCanonicalKeys.add(key);
          extraRawPhones.push(phoneStr);
        }
      });
    });

    if (extraRawPhones.length > 0) {
      // Merge any extra phone numbers into keeper so no unique data is lost
      const currentRaw = keeperRecord.raw || '';
      const combinedRaw = [currentRaw, ...extraRawPhones].filter(Boolean).join(', ');
      const upgradedKeeper = processFullContact(
        keeperRecord.name,
        combinedRaw,
        includeCountryCode,
        keeperIdx,
        keeperRecord.id
      );
      keeperUpdates.set(keeperIdx, upgradedKeeper);
      affectedRecords.push(upgradedKeeper);
    } else {
      keeperUpdates.set(keeperIdx, keeperRecord);
      affectedRecords.push(keeperRecord);
    }
  });

  const updatedRecords: ContactRecord[] = [];
  records.forEach((r, idx) => {
    if (removeIndexSet.has(idx)) {
      return; // Omit deleted duplicate copy with fewer contacts/phone numbers
    }
    const finalRec = keeperUpdates.get(idx) || r;
    updatedRecords.push({
      ...finalRec,
      originalIndex: updatedRecords.length,
    });
  });

  return {
    updatedRecords,
    removedCount,
    affectedRecords,
  };
}

export type MergeStrategy = 'first' | 'second' | 'and' | 'slash';

/**
 * Bulk merge of all shared phone number groups using a selected name combination strategy.
 */
export function bulkMergeSharedGroups(
  records: ContactRecord[],
  includeCountryCode = true,
  strategy: MergeStrategy = 'first'
): { 
  updatedRecords: ContactRecord[]; 
  mergedGroupsCount: number; 
  reducedCount: number;
  affectedRecords: ContactRecord[];
  mergedDetails: MergedGroupDetail[];
} {
  const analysis = analyzeDuplicates(records);
  if (analysis.sharedGroups.length === 0) {
    return { updatedRecords: records, mergedGroupsCount: 0, reducedCount: 0, affectedRecords: [], mergedDetails: [] };
  }

  const indicesToReplace = new Map<number, ContactRecord>();
  const indicesToRemove = new Set<number>();
  const mergedDetails: MergedGroupDetail[] = [];

  analysis.sharedGroups.forEach((group) => {
    const groupRecords = group.indices.map(i => records[i]).filter(Boolean);
    if (groupRecords.length < 2) return;

    const uniqueNames = Array.from(new Set(groupRecords.map(r => r.name.trim()))).filter(Boolean);
    let chosenName = uniqueNames[0] || 'Merged Contact';
    if (strategy === 'second') {
      chosenName = uniqueNames[1] || uniqueNames[0] || 'Merged Contact';
    } else if (strategy === 'slash') {
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

    mergedDetails.push({
      resultRecord: mergedRecord,
      originalNames: uniqueNames,
      phone: group.phone,
    });

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

  const affectedRecords = Array.from(indicesToReplace.values());

  return {
    updatedRecords,
    mergedGroupsCount: analysis.sharedGroups.length,
    reducedCount: records.length - updatedRecords.length,
    affectedRecords,
    mergedDetails,
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
    const extraLines: string[] = [];

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
        extraLines.push(line);
      } else if (upper.startsWith('TEL')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const rawVal = line.substring(colonIdx + 1).trim();
          rawVal.split(/[,]/).forEach(p => {
            const cleaned = p.trim();
            if (cleaned) {
              phones.push(cleaned);
            }
          });
        }
      } else if (upper.startsWith('BEGIN:VCARD') || upper.startsWith('VERSION:')) {
        // Skip vCard structural wrapper lines as generateVCF handles them
      } else {
        extraLines.push(line);
      }
    }

    const contactName = name || `Unnamed Contact ${results.length + 1}`;
    const combinedPhones = phones.join(', ');

    const record = processFullContact(contactName, combinedPhones, includeCountryCode, results.length);
    if (extraLines.length > 0) {
      record.extraVcardLines = extraLines;
    }
    results.push(record);
  });

  return results;
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let currentVal = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentVal.trim());
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal.trim());
  return result.map(s => s.replace(/^["']|["']$/g, ''));
}

/**
 * Parses CSV or raw lines into ContactRecord array, with intelligent field mapping for Contact, Mobile, Telephone fields.
 */
export function parseCSV(text: string, includeCountryCode = true): ContactRecord[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const results: ContactRecord[] = [];
  if (lines.length === 0) return results;

  // Check if first line is headers
  const firstLineCols = lines[0].includes('\t') ? lines[0].split('\t').map(s => s.trim()) : parseCSVLine(lines[0]);
  const lowerCols = firstLineCols.map(c => c.toLowerCase());
  
  const hasHeader = lowerCols.some(c => 
    c.includes('name') || c.includes('phone') || c.includes('mobile') || c.includes('telephone') || c.includes('cell') || c.includes('first') || c.includes('last') || c.includes('company') || c.includes('contact')
  );

  let headers: string[] = [];
  let startIndex = 0;

  if (hasHeader) {
    headers = firstLineCols;
    startIndex = 1;
  }

  let nameIdx = -1;
  let firstNameIdx = -1;
  let lastNameIdx = -1;
  let mobileIdx = -1;
  let phoneIdx = -1;
  let telIdx = -1;

  if (headers.length > 0) {
    headers.forEach((h, idx) => {
      const lh = h.toLowerCase();
      if ((lh.includes('name') && !lh.includes('file') && !lh.includes('nick')) || lh === 'name' || lh === 'contact name' || lh === 'display name') {
        if (nameIdx === -1) nameIdx = idx;
      }
      if (lh.includes('first name') || lh === 'first' || lh === 'given name') firstNameIdx = idx;
      if (lh.includes('last name') || lh === 'last' || lh === 'family name' || lh === 'surname') lastNameIdx = idx;
      if (lh.includes('mobile') || lh.includes('cell') || lh.includes('cellular')) {
        if (mobileIdx === -1) mobileIdx = idx;
      }
      if (lh.includes('telephone') || lh === 'tel') {
        if (telIdx === -1) telIdx = idx;
      }
      if (lh.includes('phone') || lh.includes('number') || lh.includes('primary phone') || lh.includes('phone 1') || lh.includes('home phone') || lh.includes('business phone')) {
        if (phoneIdx === -1) phoneIdx = idx;
      }
    });
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.includes('\t') ? line.split('\t').map(s => s.trim().replace(/^["']|["']$/g, '')) : parseCSVLine(line);
    
    if (headers.length > 0) {
      while (cols.length < headers.length) {
        cols.push('');
      }
    }

    let name = '';
    let phone = '';

    if (headers.length > 0) {
      if (firstNameIdx !== -1 || lastNameIdx !== -1) {
        const f = firstNameIdx !== -1 ? cols[firstNameIdx] || '' : '';
        const l = lastNameIdx !== -1 ? cols[lastNameIdx] || '' : '';
        const combined = `${f} ${l}`.trim();
        if (combined) name = combined;
      } 
      if (!name && nameIdx !== -1 && cols[nameIdx]) {
        name = cols[nameIdx];
      }
      if (!name) {
        name = 'Unnamed Contact';
      }

      // Phone extraction priority: mobileIdx -> telIdx -> phoneIdx -> any column with phone pattern
      let rawPhone = '';
      const phoneIndices = [mobileIdx, telIdx, phoneIdx].filter(idx => idx !== -1);
      for (const idx of phoneIndices) {
        if (cols[idx] && cols[idx].trim().length > 0) {
          rawPhone = cols[idx];
          break;
        }
      }

      if (!rawPhone) {
        // Scan all columns for phone-like value
        for (let c = 0; c < cols.length; c++) {
          const val = cols[c];
          if (val && (/^[\+\(\)0-9\-\s]{5,}$/.test(val) || /[0-9]{4,}/.test(val))) {
            const hName = headers[c]?.toLowerCase() || '';
            if (hName.includes('fax') || hName.includes('email') || hName.includes('address') || hName.includes('zip') || hName.includes('postal') || hName.includes('date') || hName.includes('notes') || hName.includes('status') || hName.includes('type')) {
              continue;
            }
            rawPhone = val;
            break;
          }
        }
      }
      phone = rawPhone;
    } else {
      if (cols.length === 1) {
        phone = cols[0];
      } else if (cols.length === 2) {
        name = cols[0] || '';
        phone = cols[1];
      } else if (cols.length > 2) {
        name = cols[0] || '';
        phone = cols[cols.length - 1];
      }
    }

    if (!name) name = 'Unnamed Contact';

    const record = processFullContact(name, phone, includeCountryCode, results.length);
    if (headers.length > 0) {
      record.csvHeaders = headers;
      record.csvRowValues = cols;
    } else if (cols.length > 2) {
      record.extraCsvColumns = cols.slice(1, cols.length - 1);
    }
    results.push(record);
  }

  return results;
}

/**
 * Generates standards-compliant vCard 3.0 string, preserving all extra non-phone fields as is.
 */
export function generateVCF(records: ContactRecord[]): string {
  return records.map(r => {
    const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];
    lines.push(`FN:${r.name}`);
    
    // Preserve extra vCard lines (Email, Address, Notes, Org, Title, etc.) as is
    if (r.extraVcardLines && r.extraVcardLines.length > 0) {
      r.extraVcardLines.forEach(l => {
        const upper = l.toUpperCase();
        if (!upper.startsWith('FN:') && !upper.startsWith('N:') && !upper.startsWith('TEL')) {
          lines.push(l);
        }
      });
    }

    // Separate TEL entries for each phone number
    const numbers = r.phoneNumbers.length > 0 
      ? r.phoneNumbers.map(p => p.result) 
      : r.result.split(',').map(s => s.trim());
      
    const uniqueNums = [...new Set(numbers.filter(Boolean))];
    uniqueNums.forEach(num => {
      lines.push(`TEL;TYPE=CELL:${num}`);
    });

    lines.push('END:VCARD');
    return lines.join('\r\n');
  }).join('\r\n\r\n');
}

/**
 * Sanitizes a single CSV cell value to prevent CSV / Formula Injection attacks (CWE-1236).
 * If a cell begins with =, +, -, @, \t, or \r, it is prefixed with a single quote (') so spreadsheet
 * tools (Excel, LibreOffice, Google Sheets) treat the cell as literal text rather than an executable formula.
 */
export function sanitizeCSVCell(val: string): string {
  if (!val) return '';
  const str = String(val);
  const escapedQuotes = str.replace(/"/g, '""');
  if (/^[=\+\-@\t\r]/.test(str)) {
    return `'${escapedQuotes}`;
  }
  return escapedQuotes;
}

/**
 * Generates CSV string for export, preserving all original columns and headers, and updating only the mobile/telephone number.
 * Fully hardened against CSV / Formula Injection.
 */
export function generateCSV(records: ContactRecord[]): string {
  const firstWithHeader = records.find(r => r.csvHeaders && r.csvHeaders.length > 0 && r.csvRowValues);
  if (firstWithHeader && firstWithHeader.csvHeaders && firstWithHeader.csvRowValues) {
    const headers = firstWithHeader.csvHeaders;
    let mobileIdx = -1;
    let telIdx = -1;
    let phoneIdx = -1;
    headers.forEach((h, idx) => {
      const lh = h.toLowerCase();
      if (lh.includes('mobile') || lh.includes('cell')) {
        if (mobileIdx === -1) mobileIdx = idx;
      }
      if (lh.includes('telephone') || lh === 'tel') {
        if (telIdx === -1) telIdx = idx;
      }
      if (lh.includes('phone') || lh.includes('number')) {
        if (phoneIdx === -1) phoneIdx = idx;
      }
    });
    const targetIdx = mobileIdx !== -1 ? mobileIdx : (telIdx !== -1 ? telIdx : (phoneIdx !== -1 ? phoneIdx : -1));

    const rows = [headers.map(h => `"${sanitizeCSVCell(h)}"`).join(',')];
    records.forEach(r => {
      let rowCols = r.csvRowValues ? [...r.csvRowValues] : [];
      while (rowCols.length < headers.length) {
        rowCols.push('');
      }
      if (targetIdx >= 0 && targetIdx < rowCols.length) {
        rowCols[targetIdx] = r.result;
      } else if (headers.length > 0) {
        rowCols[rowCols.length - 1] = r.result;
      }
      const escapedRow = rowCols.map(c => `"${sanitizeCSVCell(c || '')}"`).join(',');
      rows.push(escapedRow);
    });
    return rows.join('\r\n');
  } else {
    const rows = ['"Contact Name","Mobile"'];
    records.forEach(r => {
      const escapedName = sanitizeCSVCell(r.name);
      const escapedMobile = sanitizeCSVCell(r.result);
      if (r.extraCsvColumns && r.extraCsvColumns.length > 0) {
        const escapedExtra = r.extraCsvColumns.map(c => sanitizeCSVCell(c)).join('","');
        rows.push(`"${escapedName}","${escapedExtra}","${escapedMobile}"`);
      } else {
        rows.push(`"${escapedName}","${escapedMobile}"`);
      }
    });
    return rows.join('\r\n');
  }
}

/**
 * Triggers file download in browser.
 */
export function triggerDownload(content: string, filename: string, mimeType: string): void {
  // If VCF export, route through backend download proxy to bypass iOS Safari's native interception and force a Direct Download
  if (filename.endsWith('.vcf')) {
    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/download-vcf';
      form.style.display = 'none';

      const contentInput = document.createElement('input');
      contentInput.type = 'hidden';
      contentInput.name = 'content';
      contentInput.value = content;
      form.appendChild(contentInput);

      const filenameInput = document.createElement('input');
      filenameInput.type = 'hidden';
      filenameInput.name = 'filename';
      filenameInput.value = filename;
      form.appendChild(filenameInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      return;
    } catch (e) {
      console.warn('Backend download failed, falling back to client-side blob download', e);
    }
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
