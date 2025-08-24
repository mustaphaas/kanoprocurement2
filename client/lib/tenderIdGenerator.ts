/**
 * Tender ID Generator - Creates properly formatted tender IDs
 * Format: KS-YYYY-XXX (e.g., KS-2024-001, KS-2024-002)
 */

// Storage key for tender counter
const TENDER_COUNTER_KEY = "kano_tender_counter";

/**
 * Get the current year
 */
const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * Get the next tender number for the current year and ministry
 */
const getNextTenderNumber = (ministryCode: string): number => {
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${ministryCode}_${currentYear}`;

  try {
    const storedCounter = localStorage.getItem(counterKey);
    const currentCounter = storedCounter ? parseInt(storedCounter, 10) : 0;
    const nextNumber = currentCounter + 1;

    // Store the updated counter
    localStorage.setItem(counterKey, nextNumber.toString());

    return nextNumber;
  } catch (error) {
    console.error("Error managing tender counter:", error);
    // Fallback to a random 3-digit number if localStorage fails
    return Math.floor(Math.random() * 999) + 1;
  }
};

/**
 * Get ministry code from current context
 */
const getMinistryCode = (): string => {
  try {
    const ministryUser = localStorage.getItem("ministryUser");
    if (ministryUser) {
      const userData = JSON.parse(ministryUser);

      // Map ministry IDs to codes
      const ministryMap: Record<string, string> = {
        ministry: "MOH", // Ministry of Health
        ministry2: "MOWI", // Ministry of Works and Infrastructure
        ministry3: "MOE", // Ministry of Education
      };

      return ministryMap[userData.ministryId] || "MOH";
    }
  } catch (error) {
    console.error("Error getting ministry code:", error);
  }

  // Default to MOH if no ministry context
  return "MOH";
};

/**
 * Generate a properly formatted tender ID
 * Format: [MINISTRY]-YYYY-XXX (e.g., MOH-2024-001, MOWI-2024-001, MOE-2024-001)
 *
 * @returns {string} The generated tender ID
 */
export const generateTenderId = (): string => {
  const ministryCode = getMinistryCode();
  const year = getCurrentYear();
  const number = getNextTenderNumber(ministryCode);
  const paddedNumber = number.toString().padStart(3, "0");

  return `${ministryCode}-${year}-${paddedNumber}`;
};

/**
 * Reset the tender counter for the current year and ministry (for testing/admin purposes)
 */
export const resetTenderCounter = (ministryCode?: string): void => {
  const ministry = ministryCode || getMinistryCode();
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${ministry}_${currentYear}`;
  localStorage.removeItem(counterKey);
};

/**
 * Get the current tender count for the year and ministry
 */
export const getCurrentTenderCount = (ministryCode?: string): number => {
  const ministry = ministryCode || getMinistryCode();
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${ministry}_${currentYear}`;

  try {
    const storedCounter = localStorage.getItem(counterKey);
    return storedCounter ? parseInt(storedCounter, 10) : 0;
  } catch (error) {
    console.error("Error reading tender counter:", error);
    return 0;
  }
};

/**
 * Migrate old tender data to new ministry-aware format
 */
export const migrateTenderData = (): void => {
  const storageKeys = [
    "featuredTenders",
    "recentTenders",
    "ministryTenders",
    "kanoproc_tenders",
  ];

  console.log("🔄 Migrating tender data to new ministry-aware format...");

  storageKeys.forEach((key) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const tenders = JSON.parse(stored);
        if (Array.isArray(tenders)) {
          let hasChanges = false;
          const updatedTenders = tenders.map((tender) => {
            if (tender.id && typeof tender.id === "string") {
              // Check if already in new format
              if (tender.id.match(/^(MOH|MOWI|MOE)-\d{4}-\d{3}$/)) {
                return tender; // Already in correct format
              }

              // Convert old KS- format to ministry-specific format
              const oldMatch = tender.id.match(/^KS-(\d{4})-(\d{3})$/);
              if (oldMatch) {
                const year = oldMatch[1];
                const number = oldMatch[2];

                // Determine ministry based on tender category/procuring entity
                let ministryCode = "MOH"; // default
                if (
                  tender.category === "Infrastructure" ||
                  (tender.procuringEntity &&
                    tender.procuringEntity.includes("Works"))
                ) {
                  ministryCode = "MOWI";
                } else if (
                  tender.category === "Education" ||
                  (tender.procuringEntity &&
                    tender.procuringEntity.includes("Education"))
                ) {
                  ministryCode = "MOE";
                } else if (
                  tender.category === "Healthcare" ||
                  (tender.procuringEntity &&
                    tender.procuringEntity.includes("Health"))
                ) {
                  ministryCode = "MOH";
                }

                const newId = `${ministryCode}-${year}-${number}`;
                console.log(`  📝 Migrating: ${tender.id} → ${newId}`);
                hasChanges = true;
                return { ...tender, id: newId };
              }
            }
            return tender;
          });

          if (hasChanges) {
            localStorage.setItem(key, JSON.stringify(updatedTenders));
            console.log(`  ✅ Updated ${key} with new ID format`);
          }
        }
      }
    } catch (error) {
      console.warn(`Error migrating storage key ${key}:`, error);
    }
  });

  console.log("✅ Tender data migration completed");
};

/**
 * Initialize the tender counter based on existing tenders in storage
 * This ensures we don't create duplicate IDs when upgrading from timestamp-based IDs
 */
export const initializeTenderCounter = (): void => {
  // First, migrate any old format tenders
  migrateTenderData();

  const ministryCode = getMinistryCode();
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${ministryCode}_${currentYear}`;

  // Only initialize if counter doesn't exist
  if (!localStorage.getItem(counterKey)) {
    let maxNumber = 0;

    // Check various storage locations for existing tenders
    const storageKeys = [
      "featuredTenders",
      "recentTenders",
      "ministryTenders",
      "kanoproc_tenders",
    ];

    storageKeys.forEach((key) => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const tenders = JSON.parse(stored);
          if (Array.isArray(tenders)) {
            tenders.forEach((tender) => {
              if (tender.id && typeof tender.id === "string") {
                // Extract number from MINISTRY-YYYY-XXX format (MOH-2024-001, MOWI-2024-001, etc.)
                const match = tender.id.match(/^([A-Z]+)-(\d{4})-(\d{3})$/);
                if (match) {
                  const ministryFromId = match[1];
                  const yearFromId = parseInt(match[2], 10);
                  const numberFromId = parseInt(match[3], 10);

                  // Only count tenders from current ministry and year
                  if (
                    ministryFromId === ministryCode &&
                    yearFromId === currentYear &&
                    numberFromId > maxNumber
                  ) {
                    maxNumber = numberFromId;
                  }
                }
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Error checking storage key ${key}:`, error);
      }
    });

    // Set the counter to the highest found number
    localStorage.setItem(counterKey, maxNumber.toString());

    console.log(
      `Initialized tender counter for ${ministryCode} ${currentYear} to ${maxNumber}`,
    );
  }
};
