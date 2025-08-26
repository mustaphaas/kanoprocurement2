/**
 * Debug utility to check ministry storage state and diagnose tender visibility issues
 */

import { getCurrentMinistryContext } from "./ministryStorageHelper";

export const debugMinistryStorage = () => {
  const context = getCurrentMinistryContext();
  
  console.log("=== MINISTRY STORAGE DEBUG ===");
  console.log("Current Ministry Context:", context);
  
  // Check all possible ministry keys
  const ministries = ["MOH", "MOWI", "MOE"];
  const keyTypes = ["tenders", "recentTenders", "featuredTenders"];
  
  ministries.forEach(ministryCode => {
    console.log(`\n--- ${ministryCode} Ministry ---`);
    keyTypes.forEach(keyType => {
      const key = `${ministryCode}_${keyType}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`${key}: ${parsed.length} items`);
          if (parsed.length > 0) {
            console.log("  First item:", {
              id: parsed[0].id,
              title: parsed[0].title,
              status: parsed[0].status
            });
          }
        } catch (e) {
          console.log(`${key}: Invalid JSON data`);
        }
      } else {
        console.log(`${key}: No data`);
      }
    });
  });
  
  // Check main tender storage
  const mainTenders = localStorage.getItem("kanoproc_tenders");
  if (mainTenders) {
    try {
      const parsed = JSON.parse(mainTenders);
      console.log(`\nMain Storage (kanoproc_tenders): ${parsed.length} items`);
      parsed.forEach((tender: any, index: number) => {
        console.log(`  ${index + 1}. ${tender.title} (${tender.status}) - Ministry: ${tender.ministry}`);
      });
    } catch (e) {
      console.log("Main Storage: Invalid JSON data");
    }
  } else {
    console.log("Main Storage (kanoproc_tenders): No data");
  }
  
  // Check legacy global keys
  const legacyKeys = ["recentTenders", "featuredTenders"];
  legacyKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`\nWARNING: Legacy key '${key}' still exists with data!`);
    }
  });
  
  console.log("=== END DEBUG ===");
};

// Make it available globally for easy debugging
(window as any).debugMinistryStorage = debugMinistryStorage;
