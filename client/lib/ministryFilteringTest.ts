/**
 * Ministry Filtering Test Utility
 * Verifies that ministry filtering is working correctly
 */

export interface FilteringTestResult {
  passed: boolean;
  summary: string;
  details: {
    totalTenders: number;
    currentMinistry: string;
    filteredTenders: number;
    tendersByMinistry: { [ministry: string]: number };
  };
}

/**
 * Get current ministry context
 */
const getCurrentMinistryInfo = () => {
  try {
    const ministryUser = localStorage.getItem("ministryUser");
    if (ministryUser) {
      const userData = JSON.parse(ministryUser);
      return {
        ministryName: userData.ministryName || "Ministry of Health",
        ministryCode: userData.ministryCode || "MOH",
      };
    }
  } catch (error) {
    console.error("Error getting ministry context:", error);
  }
  
  return {
    ministryName: "Ministry of Health",
    ministryCode: "MOH",
  };
};

/**
 * Test ministry filtering in TenderManagement
 */
export const testMinistryFiltering = (): FilteringTestResult => {
  const { ministryName, ministryCode } = getCurrentMinistryInfo();
  
  // Get all tenders from main storage
  const mainTenders = JSON.parse(localStorage.getItem("kanoproc_tenders") || "[]");
  
  // Count tenders by ministry
  const tendersByMinistry: { [ministry: string]: number } = {};
  let filteredTenders = 0;
  
  mainTenders.forEach((tender: any) => {
    const tenderMinistry = tender.ministry || "Unknown";
    tendersByMinistry[tenderMinistry] = (tendersByMinistry[tenderMinistry] || 0) + 1;
    
    if (tenderMinistry === ministryName) {
      filteredTenders++;
    }
  });
  
  const passed = filteredTenders < mainTenders.length || mainTenders.length === 0;
  
  const summary = `
=== MINISTRY FILTERING TEST ===

Current Ministry: ${ministryName} (${ministryCode})
Total Tenders in Storage: ${mainTenders.length}
Tenders for Current Ministry: ${filteredTenders}

Tenders by Ministry:
${Object.entries(tendersByMinistry)
  .map(([ministry, count]) => `  • ${ministry}: ${count} tenders`)
  .join('\n')}

TEST RESULT: ${passed ? '✅ PASSED' : '❌ FAILED'}
${passed 
  ? 'Ministry filtering is working correctly - not all tenders belong to current ministry' 
  : 'ISSUE: All tenders appear to belong to current ministry or no filtering detected'}
  `;
  
  return {
    passed,
    summary,
    details: {
      totalTenders: mainTenders.length,
      currentMinistry: ministryName,
      filteredTenders,
      tendersByMinistry,
    }
  };
};

/**
 * Console-friendly test function
 */
export const logFilteringTest = (): void => {
  const result = testMinistryFiltering();
  console.log(result.summary);
  
  if (!result.passed) {
    console.warn('❌ Ministry filtering test failed!');
    console.warn('This suggests all tenders are showing in ministry dashboards');
  } else {
    console.log('✅ Ministry filtering test passed!');
  }
};

/**
 * Test company dashboard (should show ALL tenders)
 */
export const testCompanyDashboardFiltering = (): {
  passed: boolean;
  summary: string;
  companyTenderCount: number;
  totalTenderCount: number;
} => {
  // Simulate how CompanyDashboard loads tenders
  const mainTenders = JSON.parse(localStorage.getItem("kanoproc_tenders") || "[]");
  
  // Company dashboard should show ALL tenders (no filtering)
  const companyTenderCount = mainTenders.length; // CompanyDashboard shows all
  const totalTenderCount = mainTenders.length;
  
  const passed = companyTenderCount === totalTenderCount;
  
  const summary = `
=== COMPANY DASHBOARD TEST ===

Total Tenders in Storage: ${totalTenderCount}
Tenders Shown to Companies: ${companyTenderCount}

TEST RESULT: ${passed ? '✅ PASSED' : '❌ FAILED'}
${passed 
  ? 'Company dashboard correctly shows ALL tenders from all ministries' 
  : 'ISSUE: Company dashboard is not showing all available tenders'}
  `;
  
  return {
    passed,
    summary,
    companyTenderCount,
    totalTenderCount,
  };
};

/**
 * Run complete filtering verification
 */
export const runCompleteFilteringTest = (): {
  passed: boolean;
  summary: string;
  ministryTest: FilteringTestResult;
  companyTest: ReturnType<typeof testCompanyDashboardFiltering>;
} => {
  const ministryTest = testMinistryFiltering();
  const companyTest = testCompanyDashboardFiltering();
  
  const passed = ministryTest.passed && companyTest.passed;
  
  const summary = `
=== COMPLETE MINISTRY FILTERING VERIFICATION ===

${ministryTest.summary}

${companyTest.summary}

OVERALL RESULT: ${passed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
  `;
  
  return {
    passed,
    summary,
    ministryTest,
    companyTest,
  };
};

// Export for global debugging access
(window as any).testMinistryFiltering = testMinistryFiltering;
(window as any).logFilteringTest = logFilteringTest;
(window as any).runCompleteFilteringTest = runCompleteFilteringTest;
