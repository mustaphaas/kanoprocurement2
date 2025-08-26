/**
 * Global Key Cleanup Utility
 * Removes legacy global localStorage keys to prevent data contamination
 * between ministries and ensure proper data isolation
 */

const LEGACY_GLOBAL_KEYS = [
  'recentTenders',
  'featuredTenders',
  'tenders', // Generic tenders key
];

/**
 * Remove all legacy global keys that might cause data contamination
 */
export const cleanupLegacyGlobalKeys = (): void => {
  console.log('🧹 Starting cleanup of legacy global keys...');
  
  let cleanedCount = 0;
  
  LEGACY_GLOBAL_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      localStorage.removeItem(key);
      cleanedCount++;
      console.log(`🗑️  Removed legacy global key: ${key}`);
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`✅ Cleanup complete: Removed ${cleanedCount} legacy global keys`);
  } else {
    console.log('✅ No legacy global keys found - system is clean');
  }
};

/**
 * Check if any legacy global keys exist
 */
export const hasLegacyGlobalKeys = (): boolean => {
  return LEGACY_GLOBAL_KEYS.some(key => localStorage.getItem(key) !== null);
};

/**
 * Get a report of existing legacy keys
 */
export const getLegacyKeysReport = (): { key: string; size: number }[] => {
  const report: { key: string; size: number }[] = [];
  
  LEGACY_GLOBAL_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      report.push({
        key,
        size: new Blob([value]).size
      });
    }
  });
  
  return report;
};

/**
 * Initialize cleanup on app startup
 * This should be called early in the app lifecycle
 */
export const initializeGlobalKeyCleanup = (): void => {
  // Check if cleanup has been performed in this session
  const cleanupKey = 'globalKeyCleanupPerformed';
  const sessionCleanupPerformed = sessionStorage.getItem(cleanupKey);

  if (!sessionCleanupPerformed) {
    if (hasLegacyGlobalKeys()) {
      const report = getLegacyKeysReport();
      console.log('⚠️  Legacy global keys detected:', report);
      cleanupLegacyGlobalKeys();
    }

    // Mark cleanup as performed for this session
    sessionStorage.setItem(cleanupKey, 'true');
  }
};

/**
 * Alternative function name for compatibility with existing App.tsx
 */
export const runCleanupIfNeeded = initializeGlobalKeyCleanup;
