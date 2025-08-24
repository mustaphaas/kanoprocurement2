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
 * Get the next tender number for the current year
 */
const getNextTenderNumber = (): number => {
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${currentYear}`;

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
 * Generate a properly formatted tender ID
 * Format: KS-YYYY-XXX (e.g., KS-2024-001)
 *
 * @returns {string} The generated tender ID
 */
export const generateTenderId = (): string => {
  const year = getCurrentYear();
  const number = getNextTenderNumber();
  const paddedNumber = number.toString().padStart(3, "0");

  return `KS-${year}-${paddedNumber}`;
};

/**
 * Reset the tender counter for the current year (for testing/admin purposes)
 */
export const resetTenderCounter = (): void => {
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${currentYear}`;
  localStorage.removeItem(counterKey);
};

/**
 * Get the current tender count for the year
 */
export const getCurrentTenderCount = (): number => {
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${currentYear}`;

  try {
    const storedCounter = localStorage.getItem(counterKey);
    return storedCounter ? parseInt(storedCounter, 10) : 0;
  } catch (error) {
    console.error("Error reading tender counter:", error);
    return 0;
  }
};

/**
 * Initialize the tender counter based on existing tenders in storage
 * This ensures we don't create duplicate IDs when upgrading from timestamp-based IDs
 */
export const initializeTenderCounter = (): void => {
  const currentYear = getCurrentYear();
  const counterKey = `${TENDER_COUNTER_KEY}_${currentYear}`;

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
                // Extract number from KS-YYYY-XXX format
                const match = tender.id.match(/^KS-(\d{4})-(\d{3})$/);
                if (match) {
                  const yearFromId = parseInt(match[1], 10);
                  const numberFromId = parseInt(match[2], 10);

                  // Only count tenders from current year
                  if (yearFromId === currentYear && numberFromId > maxNumber) {
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
      `Initialized tender counter for ${currentYear} to ${maxNumber}`,
    );
  }
};
