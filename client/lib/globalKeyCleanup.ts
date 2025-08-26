/**
 * Global Key Cleanup - Remove legacy global tender keys to prevent data leakage
 * This ensures complete ministry data isolation
 */

export const cleanupLegacyGlobalKeys = () => {
  const legacyKeys = [
    'recentTenders',
    'featuredTenders'
  ];
  
  console.log('🧹 Cleaning up legacy global tender keys...');
  
  legacyKeys.forEach(key => {
    const existingData = localStorage.getItem(key);
    if (existingData) {
      console.log(`Removing legacy key: ${key} (had ${JSON.parse(existingData).length} items)`);
      localStorage.removeItem(key);
    }
  });
  
  // Mark cleanup as completed
  localStorage.setItem('legacyKeysCleanedUp', 'true');
  console.log('✅ Legacy global tender keys cleanup completed');
};

export const shouldRunCleanup = (): boolean => {
  return !localStorage.getItem('legacyKeysCleanedUp');
};

export const runCleanupIfNeeded = () => {
  if (shouldRunCleanup()) {
    cleanupLegacyGlobalKeys();
  }
};
