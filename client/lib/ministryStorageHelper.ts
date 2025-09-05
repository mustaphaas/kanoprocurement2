/**
 * Ministry Storage Helper - Enforces data isolation between ministries
 * All ministry-specific data should use this helper to prevent cross-contamination
 */

import { getMinistryById } from "@shared/ministries";

export interface MinistryContext {
  ministryId: string;
  ministryCode: string;
  ministryName: string;
}

/**
 * Get current ministry context from localStorage
 */
export const getCurrentMinistryContext = (): MinistryContext => {
  try {
    const ministryUser = localStorage.getItem("ministryUser");
    if (ministryUser) {
      const userData = JSON.parse(ministryUser);
      const cfg = getMinistryById(userData.ministryId);
      return {
        ministryId: userData.ministryId,
        ministryCode: userData.ministryCode || cfg?.code || "MOH",
        ministryName: userData.ministryName || cfg?.name || "Ministry of Health",
      };
    }
  } catch (error) {
    console.error("Error parsing ministry user data:", error);
  }

  // Default fallback to MOH
  return {
    ministryId: "ministry",
    ministryCode: "MOH",
    ministryName: "Ministry of Health",
  };
};

/**
 * Generate ministry-scoped localStorage key
 */
export const getMinistryStorageKey = (
  key: string,
  ministryCode?: string,
): string => {
  const context = ministryCode ? { ministryCode } : getCurrentMinistryContext();
  return `${context.ministryCode}_${key}`;
};

/**
 * Read ministry-specific data from localStorage
 */
export const readMinistryData = <T>(
  key: string,
  defaultValue: T,
  ministryCode?: string,
): T => {
  try {
    const storageKey = getMinistryStorageKey(key, ministryCode);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error reading ministry data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Write ministry-specific data to localStorage
 */
export const writeMinistryData = <T>(
  key: string,
  data: T,
  ministryCode?: string,
): void => {
  try {
    const storageKey = getMinistryStorageKey(key, ministryCode);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ministry data for key ${key}:`, error);
  }
};

/**
 * Remove ministry-specific data from localStorage
 */
export const removeMinistryData = (
  key: string,
  ministryCode?: string,
): void => {
  try {
    const storageKey = getMinistryStorageKey(key, ministryCode);
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error(`Error removing ministry data for key ${key}:`, error);
  }
};

/**
 * Get all ministry codes that have data for a specific key
 */
export const getMinistryCodesWithData = (key: string): string[] => {
  const ministryCodes: string[] = [];

  // Check all localStorage keys for the pattern
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i);
    if (storageKey && storageKey.endsWith(`_${key}`)) {
      const ministryCode = storageKey.replace(`_${key}`, "");
      if (ministryCode.length <= 10) {
        // Reasonable ministry code length
        ministryCodes.push(ministryCode);
      }
    }
  }

  return ministryCodes;
};

/**
 * Migrate global data to ministry-specific storage
 * Use this to fix existing contaminated data
 */
export const migrateGlobalToMinistryData = <T>(
  globalKey: string,
  ministryKey: string,
  defaultMinistryCode: string = "MOH",
  dataProcessor?: (data: T, ministryCode: string) => T,
): void => {
  try {
    const globalData = localStorage.getItem(globalKey);
    if (!globalData) return;

    const parsedData = JSON.parse(globalData) as T;
    const processedData = dataProcessor
      ? dataProcessor(parsedData, defaultMinistryCode)
      : parsedData;

    writeMinistryData(ministryKey, processedData, defaultMinistryCode);

    console.log(
      `Migrated ${globalKey} to ${getMinistryStorageKey(ministryKey, defaultMinistryCode)}`,
    );
  } catch (error) {
    console.error(
      `Error migrating ${globalKey} to ministry-specific storage:`,
      error,
    );
  }
};

/**
 * Clear all mock/test data for a ministry
 */
export const clearMinistryMockData = (ministryCode?: string): void => {
  const mockKeys = [
    "mockProcurementPlan",
    "mockTender",
    "mockNOCRequest",
    "mockContract",
    "mockUsers",
  ];

  mockKeys.forEach((key) => removeMinistryData(key, ministryCode));
  console.log(
    `Cleared mock data for ministry ${ministryCode || getCurrentMinistryContext().ministryCode}`,
  );
};

/**
 * Storage keys that should be ministry-specific
 */
export const MINISTRY_SPECIFIC_KEYS = {
  TENDERS: "tenders",
  COMMITTEE_TEMPLATES: "committeeTemplates",
  COMMITTEE_ASSIGNMENTS: "tenderCommitteeAssignments",
  MEMBER_POOL: "memberPool",
  CLOSED_TENDERS: "closedTenders",
  NOC_REQUESTS: "NOCRequests",
  COMMITTEES: "committees",
  EVALUATION_SESSIONS: "evaluationSessions",
  FEATURED_TENDERS: "featuredTenders",
  RECENT_TENDERS: "recentTenders",
  CLARIFICATIONS: "clarifications",
  MOCK_PROCUREMENT_PLAN: "mockProcurementPlan",
  MOCK_TENDER: "mockTender",
  MOCK_NOC_REQUEST: "mockNOCRequest",
  MOCK_CONTRACT: "mockContract",
  MOCK_USERS: "mockUsers",
} as const;
