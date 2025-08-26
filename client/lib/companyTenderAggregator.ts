/**
 * Company Tender Aggregator - Helps companies see all available tenders from all ministries
 * This is needed because companies should see opportunities from all ministries
 */

export const getAggregatedMinistryTenders = () => {
  const ministries = ["MOH", "MOWI", "MOE"]; // All possible ministries
  let allMinistryTenders: any[] = [];
  
  ministries.forEach(ministryCode => {
    const ministryKey = `${ministryCode}_recentTenders`;
    const storedTenders = localStorage.getItem(ministryKey);
    if (storedTenders) {
      try {
        const parsedTenders = JSON.parse(storedTenders);
        allMinistryTenders = [...allMinistryTenders, ...parsedTenders];
      } catch (error) {
        console.error(`Error parsing tenders for ministry ${ministryCode}:`, error);
      }
    }
  });
  
  // Remove duplicates based on tender ID
  const uniqueTenders = allMinistryTenders.filter((tender, index, self) =>
    index === self.findIndex((t) => t.id === tender.id)
  );
  
  console.log(`Aggregated ${uniqueTenders.length} unique tenders from all ministries`);
  return uniqueTenders;
};

export const getMinistrySpecificTenders = (ministryCode: string) => {
  const ministryKey = `${ministryCode}_recentTenders`;
  const storedTenders = localStorage.getItem(ministryKey);
  
  if (storedTenders) {
    try {
      return JSON.parse(storedTenders);
    } catch (error) {
      console.error(`Error parsing tenders for ministry ${ministryCode}:`, error);
      return [];
    }
  }
  
  return [];
};
