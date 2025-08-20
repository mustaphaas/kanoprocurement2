/**
 * Debug utility to check NOC tender loading
 */

export const debugNOCTenders = () => {
  console.log('=== NOC TENDER DEBUG ===');
  
  // Check all ministry tender keys
  const ministries = ['MOH', 'MOWI', 'MOE'];
  
  ministries.forEach(ministry => {
    const tendersKey = `${ministry}_tenders`;
    const tenders = localStorage.getItem(tendersKey);
    
    console.log(`\n${ministry} Tenders (${tendersKey}):`);
    if (tenders) {
      try {
        const parsedTenders = JSON.parse(tenders);
        console.log(`Total tenders: ${parsedTenders.length}`);
        
        const evaluatedTenders = parsedTenders.filter((t: any) => t.status === 'Evaluated');
        console.log(`Evaluated tenders: ${evaluatedTenders.length}`);
        
        evaluatedTenders.forEach((tender: any) => {
          console.log(`- ${tender.id}: ${tender.title || tender.projectTitle} (${tender.status})`);
        });
      } catch (e) {
        console.error(`Error parsing ${ministry} tenders:`, e);
      }
    } else {
      console.log('No tenders found in localStorage');
    }
  });
  
  // Check generic tender storage
  console.log('\n=== Generic Tender Storage ===');
  const genericTenders = localStorage.getItem('ministryTenders');
  if (genericTenders) {
    try {
      const parsed = JSON.parse(genericTenders);
      console.log(`Generic tenders count: ${parsed.length}`);
      const evaluated = parsed.filter((t: any) => t.status === 'Evaluated');
      console.log(`Generic evaluated: ${evaluated.length}`);
    } catch (e) {
      console.error('Error parsing generic tenders:', e);
    }
  }
  
  // Check current ministry user
  const ministryUser = localStorage.getItem('ministryUser');
  if (ministryUser) {
    try {
      const user = JSON.parse(ministryUser);
      console.log(`\nCurrent ministry: ${user.ministryId}`);
    } catch (e) {
      console.error('Error parsing ministry user:', e);
    }
  }
};

// Add to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugNOCTenders = debugNOCTenders;
}
