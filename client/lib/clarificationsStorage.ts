export type ClarificationStatus = "Pending Response" | "Responded" | "Closed";

export interface ClarificationRecord {
  id: string;
  tender: string; // e.g., "TB001 - Road Construction ..."
  subject: string;
  category: string;
  message: string;
  urgent: boolean;
  submittedDate: string; // ISO date string
  responseDate: string | null;
  response: string | null;
  status: ClarificationStatus;
  vendorEmail: string;
  vendorName: string;
  ministryCode: string;
}

import {
  MINISTRY_SPECIFIC_KEYS,
  getMinistryCodesWithData,
  readMinistryData,
  writeMinistryData,
} from "./ministryStorageHelper";

const CENTRAL_KEY = "centralClarifications";

// Get clarifications for a specific ministry (isolated)
export const getMinistryClarifications = (
  ministryCode: string,
): ClarificationRecord[] => {
  try {
    return readMinistryData<ClarificationRecord[]>(
      MINISTRY_SPECIFIC_KEYS.CLARIFICATIONS,
      [],
      ministryCode,
    );
  } catch (e) {
    console.error("Failed to read ministry clarifications", e);
    return [];
  }
};

// Save clarifications for a specific ministry
const saveMinistryClarifications = (
  ministryCode: string,
  items: ClarificationRecord[],
) => {
  writeMinistryData(MINISTRY_SPECIFIC_KEYS.CLARIFICATIONS, items, ministryCode);
};

// Central aggregator for superuser views; merges all ministry buckets and legacy central
export const getCentralClarifications = (): ClarificationRecord[] => {
  try {
    const codes = getMinistryCodesWithData(MINISTRY_SPECIFIC_KEYS.CLARIFICATIONS);
    const aggregated: ClarificationRecord[] = [];
    codes.forEach((code) => {
      const list = getMinistryClarifications(code);
      aggregated.push(...list);
    });

    // Merge with legacy central list if present (preserve any items not in ministry buckets)
    const legacyRaw = localStorage.getItem(CENTRAL_KEY);
    const legacy = legacyRaw ? (JSON.parse(legacyRaw) as ClarificationRecord[]) : [];
    const byId: Record<string, ClarificationRecord> = {};
    [...legacy, ...aggregated].forEach((c) => {
      byId[c.id] = { ...byId[c.id], ...c } as ClarificationRecord;
    });
    return Object.values(byId);
  } catch (e) {
    console.error("Failed to build central clarifications", e);
    return [];
  }
};

export const saveCentralClarifications = (items: ClarificationRecord[]) => {
  localStorage.setItem(CENTRAL_KEY, JSON.stringify(items));
};

export const addClarification = (
  item: ClarificationRecord,
): ClarificationRecord[] => {
  // Write to ministry-specific storage (source of truth)
  const currentMinistry = getMinistryClarifications(item.ministryCode);
  const updatedMinistry = [item, ...currentMinistry];
  saveMinistryClarifications(item.ministryCode, updatedMinistry);

  // Also update central aggregator for superuser
  const central = getCentralClarifications();
  const byId: Record<string, ClarificationRecord> = {};
  [item, ...central].forEach((c) => (byId[c.id] = { ...byId[c.id], ...c } as ClarificationRecord));
  const merged = Object.values(byId);
  saveCentralClarifications(merged);

  return merged;
};

export const getCompanyClarifications = (
  vendorEmail: string,
): ClarificationRecord[] => {
  // Companies can see their clarifications across ministries via central view
  return getCentralClarifications().filter(
    (c) => c.vendorEmail.toLowerCase() === vendorEmail.toLowerCase(),
  );
};

export const getClarificationById = (
  id: string,
): ClarificationRecord | null => {
  const all = getCentralClarifications();
  return all.find((c) => c.id === id) || null;
};

export const updateClarification = (
  id: string,
  patch: Partial<ClarificationRecord>,
): ClarificationRecord[] => {
  // Update central
  const currentCentral = getCentralClarifications();
  const target = currentCentral.find((c) => c.id === id) || null;
  const updatedCentral = currentCentral.map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveCentralClarifications(updatedCentral);

  // Update ministry bucket if we can resolve ministryCode
  const ministryCode = patch.ministryCode || target?.ministryCode;
  if (ministryCode) {
    const currentMinistry = getMinistryClarifications(ministryCode);
    const updatedMinistry = currentMinistry.map((c) => (c.id === id ? { ...c, ...patch } : c));
    saveMinistryClarifications(ministryCode, updatedMinistry);
  }

  return updatedCentral;
};
