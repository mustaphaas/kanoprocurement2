/**
 * Tender Migration Utility
 * Helps test and verify the new ministry-aware tender ID system
 */

import {
  initializeTenderCounter,
  generateTenderId,
  migrateTenderData,
} from "./tenderIdGenerator";

/**
 * Clear old inconsistent data and trigger migration
 */
export const performFullMigration = (): void => {
  console.log("🚀 Starting full tender system migration...");

  // Clear old counter keys that used the KS- format
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      key.includes("kano_tender_counter") &&
      !key.includes("MOH") &&
      !key.includes("MOWI") &&
      !key.includes("MOE")
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    console.log(`🗑️ Removing old counter key: ${key}`);
    localStorage.removeItem(key);
  });

  // Trigger the migration and initialization
  initializeTenderCounter();

  console.log("✅ Full migration completed!");
};

/**
 * Test the new tender ID generation system
 */
export const testTenderIdGeneration = (): void => {
  console.log("🧪 Testing new tender ID generation system...");

  // Simulate different ministry contexts
  const testMinistries = [
    { id: "ministry", name: "Ministry of Health", expectedCode: "MOH" },
    { id: "ministry2", name: "Ministry of Works", expectedCode: "MOWI" },
    { id: "ministry3", name: "Ministry of Education", expectedCode: "MOE" },
  ];

  testMinistries.forEach((ministry) => {
    // Temporarily set ministry context
    const originalData = localStorage.getItem("ministryUser");
    localStorage.setItem(
      "ministryUser",
      JSON.stringify({
        ministryId: ministry.id,
        ministryName: ministry.name,
      }),
    );

    // Generate test ID
    const testId = generateTenderId();
    console.log(`  ${ministry.name}: Generated ID = ${testId}`);

    // Verify format
    const expectedPattern = new RegExp(
      `^${ministry.expectedCode}-\\d{4}-\\d{3}$`,
    );
    if (expectedPattern.test(testId)) {
      console.log(`  ✅ ${testId} matches expected pattern`);
    } else {
      console.log(
        `  ❌ ${testId} does NOT match expected pattern ${ministry.expectedCode}-YYYY-XXX`,
      );
    }

    // Restore original context
    if (originalData) {
      localStorage.setItem("ministryUser", originalData);
    } else {
      localStorage.removeItem("ministryUser");
    }
  });

  console.log("🎯 Testing completed!");
};

/**
 * Debug function to show current tender data across all storage keys
 */
export const debugTenderData = (): void => {
  console.log("🔍 Current tender data across storage:");

  const storageKeys = [
    "featuredTenders",
    "recentTenders",
    "ministryTenders",
    "kanoproc_tenders",
  ];

  storageKeys.forEach((key) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const tenders = JSON.parse(data);
        console.log(`\n📁 ${key}: ${tenders.length} tenders`);
        tenders.slice(0, 3).forEach((tender: any) => {
          console.log(`  - ${tender.id}: ${tender.title}`);
        });
      } catch (error) {
        console.log(`  ❌ Error parsing ${key}:`, error);
      }
    } else {
      console.log(`\n📁 ${key}: (empty)`);
    }
  });
};

// Make functions available globally for testing
(window as any).performFullMigration = performFullMigration;
(window as any).testTenderIdGeneration = testTenderIdGeneration;
(window as any).debugTenderData = debugTenderData;
