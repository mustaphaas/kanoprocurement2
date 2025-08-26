/**
 * Company Tender Aggregator - Helps companies see all available tenders from all ministries
 * This is needed because companies should see opportunities from all ministries
 */

/**
 * Dynamically discover all ministry codes with tender data
 */
const discoverMinistryCodesWithTenders = (): string[] => {
  const ministryCodes: string[] = [];

  // Scan all localStorage keys for pattern *_recentTenders
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith("_recentTenders")) {
      const ministryCode = key.replace("_recentTenders", "");
      if (ministryCode.length <= 10) {
        // Reasonable ministry code length
        ministryCodes.push(ministryCode);
      }
    }
  }

  console.log(
    `🔍 Discovered ministry codes with tender data: ${ministryCodes.join(", ")}`,
  );
  return ministryCodes;
};

/**
 * Get tenders from a specific ministry
 */
export const getMinistryTenders = (ministryCode: string) => {
  const ministryKey = `${ministryCode}_recentTenders`;
  const storedTenders = localStorage.getItem(ministryKey);

  if (storedTenders) {
    try {
      const parsedTenders = JSON.parse(storedTenders);
      console.log(
        `📋 Found ${parsedTenders.length} tenders for ministry ${ministryCode}`,
      );
      return parsedTenders;
    } catch (error) {
      console.error(
        `❌ Error parsing tenders for ministry ${ministryCode}:`,
        error,
      );
      return [];
    }
  }

  console.log(`📋 No tenders found for ministry ${ministryCode}`);
  return [];
};

/**
 * Get all storage keys that match the ministry tender pattern
 */
export const getMinistryStorageKey = (
  ministryCode: string,
  keyType: string,
): string => {
  return `${ministryCode}_${keyType}`;
};

/**
 * Aggregate tenders from all ministries for company dashboard
 */
export const getAggregatedMinistryTenders = () => {
  // Dynamically discover all ministry codes with tender data
  const ministryCodesWithData = discoverMinistryCodesWithTenders();

  let allMinistryTenders: any[] = [];

  ministryCodesWithData.forEach((ministryCode) => {
    const tenders = getMinistryTenders(ministryCode);
    if (tenders.length > 0) {
      // Add ministry source info to each tender
      const tendersWithSource = tenders.map((tender: any) => ({
        ...tender,
        sourceMinistry: ministryCode,
      }));
      allMinistryTenders = [...allMinistryTenders, ...tendersWithSource];
    }
  });

  // Remove duplicates based on tender ID
  const uniqueTenders = allMinistryTenders.filter(
    (tender, index, self) =>
      index === self.findIndex((t) => t.id === tender.id),
  );

  console.log(
    `✅ Aggregated ${uniqueTenders.length} unique tenders from ${ministryCodesWithData.length} ministries`,
  );
  return uniqueTenders;
};

/**
 * Get ministry-specific tenders (for individual ministry dashboards)
 */
export const getMinistrySpecificTenders = (ministryCode: string) => {
  return getMinistryTenders(ministryCode);
};
