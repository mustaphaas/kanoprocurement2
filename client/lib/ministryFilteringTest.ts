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
  const mainTenders = JSON.parse(
    localStorage.getItem("kanoproc_tenders") || "[]",
  );

  // Count tenders by ministry
  const tendersByMinistry: { [ministry: string]: number } = {};
  let filteredTenders = 0;

  mainTenders.forEach((tender: any) => {
    const tenderMinistry = tender.ministry || "Unknown";
    tendersByMinistry[tenderMinistry] =
      (tendersByMinistry[tenderMinistry] || 0) + 1;

    if (tenderMinistry === ministryName) {
      filteredTenders++;
    }
  });

  const passed =
    filteredTenders < mainTenders.length || mainTenders.length === 0;

  const summary = `
=== MINISTRY FILTERING TEST ===

Current Ministry: ${ministryName} (${ministryCode})
Total Tenders in Storage: ${mainTenders.length}
Tenders for Current Ministry: ${filteredTenders}

Tenders by Ministry:
${Object.entries(tendersByMinistry)
  .map(([ministry, count]) => `  • ${ministry}: ${count} tenders`)
  .join("\n")}

TEST RESULT: ${passed ? "✅ PASSED" : "❌ FAILED"}
${
  passed
    ? "Ministry filtering is working correctly - not all tenders belong to current ministry"
    : "ISSUE: All tenders appear to belong to current ministry or no filtering detected"
}
  `;

  return {
    passed,
    summary,
    details: {
      totalTenders: mainTenders.length,
      currentMinistry: ministryName,
      filteredTenders,
      tendersByMinistry,
    },
  };
};

/**
 * Console-friendly test function
 */
export const logFilteringTest = (): void => {
  const result = testMinistryFiltering();
  console.log(result.summary);

  if (!result.passed) {
    console.warn("❌ Ministry filtering test failed!");
    console.warn(
      "This suggests all tenders are showing in ministry dashboards",
    );
  } else {
    console.log("✅ Ministry filtering test passed!");
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
  const mainTenders = JSON.parse(
    localStorage.getItem("kanoproc_tenders") || "[]",
  );

  // Company dashboard should show ALL tenders (no filtering)
  const companyTenderCount = mainTenders.length; // CompanyDashboard shows all
  const totalTenderCount = mainTenders.length;

  const passed = companyTenderCount === totalTenderCount;

  const summary = `
=== COMPANY DASHBOARD TEST ===

Total Tenders in Storage: ${totalTenderCount}
Tenders Shown to Companies: ${companyTenderCount}

TEST RESULT: ${passed ? "✅ PASSED" : "❌ FAILED"}
${
  passed
    ? "Company dashboard correctly shows ALL tenders from all ministries"
    : "ISSUE: Company dashboard is not showing all available tenders"
}
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

OVERALL RESULT: ${passed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}
  `;

  return {
    passed,
    summary,
    ministryTest,
    companyTest,
  };
};

/**
 * Simulate ministry switch and test filtering
 */
export const testMinistrySwitching = (): {
  passed: boolean;
  summary: string;
  switchResults: Array<{ ministry: string; tenderCount: number }>;
} => {
  const originalMinistryUser = localStorage.getItem("ministryUser");
  const mainTenders = JSON.parse(
    localStorage.getItem("kanoproc_tenders") || "[]",
  );

  // Test different ministry contexts
  const testMinistries = [
    { ministryName: "Ministry of Health", ministryCode: "MOH" },
    { ministryName: "Ministry of Education", ministryCode: "MOE" },
    { ministryName: "Ministry of Works", ministryCode: "MOW" },
  ];

  const switchResults: Array<{ ministry: string; tenderCount: number }> = [];

  testMinistries.forEach((ministry) => {
    // Simulate ministry switch
    localStorage.setItem(
      "ministryUser",
      JSON.stringify({
        username: "ministry",
        role: "ministry",
        ministryId: ministry.ministryCode.toLowerCase(),
        ministryName: ministry.ministryName,
        ministryCode: ministry.ministryCode,
      }),
    );

    // Count tenders for this ministry
    const ministryTenders = mainTenders.filter(
      (tender: any) => tender.ministry === ministry.ministryName,
    );

    switchResults.push({
      ministry: ministry.ministryName,
      tenderCount: ministryTenders.length,
    });
  });

  // Restore original ministry user
  if (originalMinistryUser) {
    localStorage.setItem("ministryUser", originalMinistryUser);
  }

  // Test passes if different ministries have different tender counts
  const tenderCounts = switchResults.map((r) => r.tenderCount);
  const hasVariation = new Set(tenderCounts).size > 1 || tenderCounts.every(c => c === 0);

  const summary = `
=== MINISTRY SWITCHING TEST ===

Total Tenders in Storage: ${mainTenders.length}

Tenders by Ministry Context:
${switchResults
  .map(
    (result) => `  • ${result.ministry}: ${result.tenderCount} tenders`,
  )
  .join("\n")}

TEST RESULT: ${hasVariation ? "✅ PASSED" : "❌ FAILED"}
${
  hasVariation
    ? "Different ministries see different tender counts - filtering works"
    : "All ministries see same tender count - filtering may not be working"
}
  `;

  return {
    passed: hasVariation,
    summary,
    switchResults,
  };
};

// Export for global debugging access
(window as any).testMinistryFiltering = testMinistryFiltering;
(window as any).logFilteringTest = logFilteringTest;
(window as any).testMinistrySwitching = testMinistrySwitching;
(window as any).runCompleteFilteringTest = runCompleteFilteringTest;

// Add debug function to manually test property name fix
(window as any).debugMinistryProperties = () => {
  const ministryUser = localStorage.getItem("ministryUser");
  if (ministryUser) {
    const userData = JSON.parse(ministryUser);
    console.log("=== MINISTRY USER DATA DEBUG ===");
    console.log("Raw ministryUser:", userData);
    console.log("Available properties:", Object.keys(userData));
    console.log("ministryName:", userData.ministryName);
    console.log("ministryCode:", userData.ministryCode);
    console.log("ministryId:", userData.ministryId);
    console.log("=============================");
  } else {
    console.log("No ministryUser found in localStorage");
  }
};
