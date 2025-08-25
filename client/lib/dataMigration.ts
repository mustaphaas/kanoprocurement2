/**
 * Data Migration Utility
 * Converts global localStorage data to ministry-specific keys
 * Run this once to fix existing contaminated data
 */

import { getCurrentMinistryContext } from "./ministryStorageHelper";

interface MigrationResult {
  key: string;
  success: boolean;
  fromKey: string;
  toKey: string;
  itemCount?: number;
  error?: string;
}

/**
 * Migrate global tender data to ministry-specific storage
 */
export const migrateTenderData = (): MigrationResult[] => {
  const { ministryCode } = getCurrentMinistryContext();
  const results: MigrationResult[] = [];

  // Keys to migrate
  const migrationMap = {
    ministryTenders: `${ministryCode}_tenders`,
    recentTenders: `${ministryCode}_recentTenders`,
    featuredTenders: `${ministryCode}_featuredTenders`,
  };

  Object.entries(migrationMap).forEach(([fromKey, toKey]) => {
    try {
      const globalData = localStorage.getItem(fromKey);

      if (globalData) {
        const parsedData = JSON.parse(globalData);

        // Filter data to only include current ministry's items
        const filteredData = Array.isArray(parsedData)
          ? parsedData.filter((item: any) => {
              // Check if item belongs to current ministry
              const idMatches =
                item.id && item.id.toUpperCase().startsWith(ministryCode);
              const ministryMatches =
                item.ministry &&
                item.ministry.includes(
                  getCurrentMinistryContext().ministryName || "",
                );
              const procuringMatches =
                item.procuringEntity &&
                item.procuringEntity.includes(
                  getCurrentMinistryContext().ministryName || "",
                );

              return idMatches || ministryMatches || procuringMatches;
            })
          : parsedData;

        // Store in ministry-specific key
        localStorage.setItem(toKey, JSON.stringify(filteredData));

        results.push({
          key: fromKey,
          success: true,
          fromKey,
          toKey,
          itemCount: Array.isArray(filteredData) ? filteredData.length : 1,
        });

        console.log(
          `✅ Migrated ${fromKey} to ${toKey}: ${Array.isArray(filteredData) ? filteredData.length : 1} items`,
        );
      } else {
        results.push({
          key: fromKey,
          success: true,
          fromKey,
          toKey,
          itemCount: 0,
        });
        console.log(`ℹ️ No data found for ${fromKey}`);
      }
    } catch (error) {
      results.push({
        key: fromKey,
        success: false,
        fromKey,
        toKey,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error(`❌ Failed to migrate ${fromKey}:`, error);
    }
  });

  return results;
};

/**
 * Migrate mock data to ministry-specific storage
 */
export const migrateMockData = (): MigrationResult[] => {
  const { ministryCode } = getCurrentMinistryContext();
  const results: MigrationResult[] = [];

  const mockKeys = [
    "mockProcurementPlan",
    "mockTender",
    "mockNOCRequest",
    "mockContract",
    "mockUsers",
  ];

  mockKeys.forEach((key) => {
    try {
      const mockData = localStorage.getItem(key);

      if (mockData) {
        const toKey = `${ministryCode}_${key}`;
        localStorage.setItem(toKey, mockData);

        results.push({
          key,
          success: true,
          fromKey: key,
          toKey,
          itemCount: 1,
        });

        console.log(`✅ Migrated ${key} to ${toKey}`);
      } else {
        results.push({
          key,
          success: true,
          fromKey: key,
          toKey: `${ministryCode}_${key}`,
          itemCount: 0,
        });
      }
    } catch (error) {
      results.push({
        key,
        success: false,
        fromKey: key,
        toKey: `${ministryCode}_${key}`,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error(`❌ Failed to migrate ${key}:`, error);
    }
  });

  return results;
};

/**
 * Clean up global keys after successful migration
 * Only call this after confirming migration worked correctly
 */
export const cleanupGlobalKeys = (confirm: boolean = false): void => {
  if (!confirm) {
    console.warn(
      "⚠️ cleanupGlobalKeys requires explicit confirmation. Pass true as parameter.",
    );
    return;
  }

  const keysToCleanup = [
    "ministryTenders",
    "recentTenders",
    "featuredTenders",
    "mockProcurementPlan",
    "mockTender",
    "mockNOCRequest",
    "mockContract",
    "mockUsers",
  ];

  let cleanedCount = 0;
  keysToCleanup.forEach((key) => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleanedCount++;
      console.log(`🗑️ Removed global key: ${key}`);
    }
  });

  console.log(`✅ Cleanup complete: removed ${cleanedCount} global keys`);
};

/**
 * Run complete migration process
 */
export const runCompleteMigration = (): {
  tenderResults: MigrationResult[];
  mockResults: MigrationResult[];
  summary: string;
} => {
  console.log("🚀 Starting data migration to ministry-specific storage...");

  const { ministryCode, ministryName } = getCurrentMinistryContext();
  console.log(`📍 Current ministry: ${ministryName} (${ministryCode})`);

  const tenderResults = migrateTenderData();
  const mockResults = migrateMockData();

  const totalItems = [...tenderResults, ...mockResults].reduce(
    (sum, result) => sum + (result.itemCount || 0),
    0,
  );

  const failures = [...tenderResults, ...mockResults].filter(
    (result) => !result.success,
  );

  const summary =
    failures.length > 0
      ? `⚠️ Migration completed with ${failures.length} failures. ${totalItems} items migrated successfully.`
      : `✅ Migration completed successfully! ${totalItems} items migrated to ministry-specific storage.`;

  console.log(summary);

  if (failures.length === 0) {
    console.log(
      "💡 You can now run cleanupGlobalKeys(true) to remove the old global keys.",
    );
  }

  return {
    tenderResults,
    mockResults,
    summary,
  };
};

/**
 * Check if migration is needed
 */
export const checkMigrationNeeded = (): boolean => {
  const globalKeys = [
    "ministryTenders",
    "recentTenders",
    "featuredTenders",
    "mockProcurementPlan",
    "mockTender",
    "mockNOCRequest",
    "mockContract",
    "mockUsers",
  ];

  return globalKeys.some((key) => localStorage.getItem(key) !== null);
};
