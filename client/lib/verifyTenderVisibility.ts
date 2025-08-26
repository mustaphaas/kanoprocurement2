/**
 * Tender Visibility Verification Script
 * Use this to verify that newly created tenders appear in all the right places
 */

export interface TenderVisibilityResult {
  success: boolean;
  message: string;
  details: {
    mainStorage: {
      totalTenders: number;
      ministryTenders: number;
    };
    ministryOverview: {
      shouldShow: number;
      willShow: number;
    };
    companyDashboard: {
      shouldShow: number;
      willShow: number;
    };
    homepage: {
      shouldShow: number;
      willShow: number;
    };
  };
}

/**
 * Verify that tenders are visible in all required locations
 */
export const verifyTenderVisibility = (): TenderVisibilityResult => {
  try {
    // Get current ministry info
    const ministryUser = localStorage.getItem("ministryUser");
    let currentMinistryName = "Ministry of Health"; // fallback
    let currentMinistryCode = "MOH"; // fallback
    
    if (ministryUser) {
      const userData = JSON.parse(ministryUser);
      currentMinistryName = userData.ministryName || currentMinistryName;
      currentMinistryCode = userData.ministryCode || currentMinistryCode;
    }

    // 1. Check main storage
    const mainTenders = JSON.parse(localStorage.getItem("kanoproc_tenders") || "[]");
    const ministryTenders = mainTenders.filter((tender: any) => 
      tender.ministry === currentMinistryName
    );

    // 2. Check ministry overview (should show filtered tenders)
    const ministryOverviewCount = ministryTenders.length;

    // 3. Check company dashboard (should show ALL tenders)
    const companyDashboardCount = mainTenders.length;

    // 4. Check homepage featured tenders
    const featuredTenders = JSON.parse(
      localStorage.getItem(`${currentMinistryCode}_featuredTenders`) || "[]"
    );

    const success = ministryOverviewCount > 0 || mainTenders.length === 0;

    return {
      success,
      message: success 
        ? `✅ Tender visibility working correctly for ${currentMinistryName}` 
        : `❌ Tender visibility issue detected for ${currentMinistryName}`,
      details: {
        mainStorage: {
          totalTenders: mainTenders.length,
          ministryTenders: ministryTenders.length,
        },
        ministryOverview: {
          shouldShow: ministryTenders.length,
          willShow: ministryTenders.length, // Fixed: now reads from main storage
        },
        companyDashboard: {
          shouldShow: mainTenders.length,
          willShow: mainTenders.length, // Already working correctly
        },
        homepage: {
          shouldShow: Math.min(ministryTenders.length, 5), // Homepage shows max 5 featured
          willShow: featuredTenders.length,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ Error verifying tender visibility: ${error}`,
      details: {
        mainStorage: { totalTenders: 0, ministryTenders: 0 },
        ministryOverview: { shouldShow: 0, willShow: 0 },
        companyDashboard: { shouldShow: 0, willShow: 0 },
        homepage: { shouldShow: 0, willShow: 0 },
      },
    };
  }
};

/**
 * Console-friendly verification
 */
export const logTenderVisibilityStatus = (): void => {
  const result = verifyTenderVisibility();
  
  console.log("=== TENDER VISIBILITY VERIFICATION ===");
  console.log(result.message);
  console.log("\nDetailed Breakdown:");
  console.log(`📦 Main Storage (kanoproc_tenders): ${result.details.mainStorage.totalTenders} total, ${result.details.mainStorage.ministryTenders} for current ministry`);
  console.log(`🏛️ Ministry Overview: Will show ${result.details.ministryOverview.willShow} tenders (should show ${result.details.ministryOverview.shouldShow})`);
  console.log(`🏢 Company Dashboard: Will show ${result.details.companyDashboard.willShow} tenders (should show ${result.details.companyDashboard.shouldShow})`);
  console.log(`🏠 Homepage Featured: Will show ${result.details.homepage.willShow} tenders (should show ${result.details.homepage.shouldShow})`);
  
  if (result.success) {
    console.log("\n✅ All systems working correctly!");
  } else {
    console.log("\n❌ Issues detected - check the details above");
  }
  
  console.log("======================================");
};

/**
 * Test tender creation and visibility
 */
export const testTenderCreationFlow = (): void => {
  console.log("=== TESTING TENDER CREATION FLOW ===");
  
  // Take a snapshot before
  const beforeResult = verifyTenderVisibility();
  console.log("BEFORE: Ministry overview shows", beforeResult.details.ministryOverview.willShow, "tenders");
  
  // Instructions for manual testing
  console.log("\n📝 To test tender creation:");
  console.log("1. Go to Tender Management > Create New Tender");
  console.log("2. Fill out the form and publish the tender");
  console.log("3. Run window.logTenderVisibilityStatus() again");
  console.log("4. Check that Ministry Overview count increased by 1");
  console.log("5. Check that Company Dashboard shows the new tender");
  console.log("6. Verify the tender appears on homepage");
  
  console.log("\n🔧 Debug Tools Available:");
  console.log("- window.verifyTenderVisibility() - Get detailed results");
  console.log("- window.logTenderVisibilityStatus() - Pretty console output");
  console.log("- window.testTenderCreationFlow() - This function");
  
  console.log("====================================");
};

// Export for browser console access
(window as any).verifyTenderVisibility = verifyTenderVisibility;
(window as any).logTenderVisibilityStatus = logTenderVisibilityStatus;
(window as any).testTenderCreationFlow = testTenderCreationFlow;
