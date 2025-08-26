import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { verifyMinistryPropertyFix } from "@/lib/verifyMinistryFix";
import { runCompleteFilteringTest } from "@/lib/ministryFilteringTest";
import { verifyTenderVisibility, logTenderVisibilityStatus } from "@/lib/verifyTenderVisibility";
import { verifyHooksFix, logHooksFixStatus } from "@/lib/verifyHooksFix";

interface TenderTestHelperProps {
  onTenderCreated: () => void;
}

export const TenderTestHelper: React.FC<TenderTestHelperProps> = ({
  onTenderCreated,
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const createTestTender = () => {
    setIsCreating(true);

    // Create a test tender similar to how MinistryDashboard does it
    const tenderId = `TEST-${Date.now()}`;
    const testTender = {
      id: tenderId,
      title: "Test Tender - Medical Equipment Supply",
      category: "Healthcare",
      value: formatCurrency(5000000), // ₦5M
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now
      location: "Kano State",
      views: 0,
      status: "Open",
      description:
        "Supply of medical equipment for primary healthcare centers across Kano State",
      publishDate: new Date().toISOString().split("T")[0],
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      tenderFee: formatCurrency(25000),
      procuringEntity: "Ministry of Health, Kano State",
      duration: "6 months",
      eligibility:
        "Qualified medical equipment suppliers with relevant experience",
      requirements: [
        "Valid CAC certificate",
        "Tax clearance for last 3 years",
        "Medical equipment supplier license",
        "Evidence of similar supply contracts",
        "Financial capacity documentation",
      ],
      technicalSpecs: [
        "Equipment must meet WHO standards",
        "3-year warranty required",
        "Installation and training included",
        "Maintenance support for 5 years",
      ],
      createdAt: Date.now(),
    };

    // Get current ministry context for proper isolation
    const ministryUser = JSON.parse(
      localStorage.getItem("ministryUser") || "{}",
    );
    const ministryCode =
      ministryUser.ministryCode ||
      ministryUser.ministryId?.toUpperCase() ||
      "MOH";

    // Store in ministry-specific recentTenders to prevent cross-contamination
    const recentTendersKey = `${ministryCode}_recentTenders`;
    const existingRecentTenders =
      localStorage.getItem(recentTendersKey) || "[]";
    const recentTendersList = JSON.parse(existingRecentTenders);
    recentTendersList.unshift(testTender);

    // Keep only the last 10 recent tenders
    const latestRecentTenders = recentTendersList.slice(0, 10);
    localStorage.setItem(recentTendersKey, JSON.stringify(latestRecentTenders));

    // Also store in ministryTenders (what MinistryDashboard looks for)
    const ministryTenderFormat = {
      id: testTender.id,
      title: testTender.title,
      description: testTender.description,
      category: testTender.category,
      estimatedValue: testTender.value,
      status: "Published",
      publishDate: testTender.publishDate,
      closeDate: testTender.closingDate,
      bidsReceived: 0,
      ministry: testTender.procuringEntity,
      procuringEntity: testTender.procuringEntity,
    };

    // Store in ministry-specific tenders to prevent cross-contamination
    const ministryTendersKey = `${ministryCode}_tenders`;
    const existingMinistryTenders =
      localStorage.getItem(ministryTendersKey) || "[]";
    const ministryTendersList = JSON.parse(existingMinistryTenders);
    ministryTendersList.unshift(ministryTenderFormat);

    // Keep only the last 10 ministry tenders
    const latestMinistryTenders = ministryTendersList.slice(0, 10);
    localStorage.setItem(
      ministryTendersKey,
      JSON.stringify(latestMinistryTenders),
    );

    // Also store in featuredTenders for the main index page
    const featuredTenderFormat = {
      id: testTender.id,
      title: testTender.title,
      description: testTender.description,
      value: testTender.value,
      deadline: new Date(testTender.deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: "Open",
      statusColor: "bg-green-100 text-green-800",
      category: testTender.category,
      ministry: testTender.procuringEntity,
      createdAt: Date.now(),
    };

    // Store in ministry-specific featured tenders to prevent cross-contamination
    const featuredTendersKey = `${ministryCode}_featuredTenders`;
    const existingFeaturedTenders =
      localStorage.getItem(featuredTendersKey) || "[]";
    const featuredTendersList = JSON.parse(existingFeaturedTenders);
    featuredTendersList.unshift(featuredTenderFormat);

    // Keep only the last 5 featured tenders
    const latestFeaturedTenders = featuredTendersList.slice(0, 5);
    localStorage.setItem(
      featuredTendersKey,
      JSON.stringify(latestFeaturedTenders),
    );

    console.log("Test tender created:", testTender);
    console.log(
      `Stored in ministry-specific localStorage keys for ${ministryCode}:`,
    );
    console.log(`- '${recentTendersKey}' (for CompanyDashboard)`);
    console.log(`- '${ministryTendersKey}' (for MinistryDashboard)`);
    console.log(`- '${featuredTendersKey}' (for Index page)`);

    setIsCreating(false);
    onTenderCreated();

    alert(
      `Test tender "${testTender.title}" created successfully for ${ministryCode}! Now visible in:\n• Company dashboards (for active users)\n• Ministry dashboard\n• Main index page`,
    );
  };

  const clearAllTenders = () => {
    // Get current ministry context for proper cleanup
    const ministryUser = JSON.parse(
      localStorage.getItem("ministryUser") || "{}",
    );
    const ministryCode =
      ministryUser.ministryCode ||
      ministryUser.ministryId?.toUpperCase() ||
      "MOH";

    const recentTendersKey = `${ministryCode}_recentTenders`;
    const featuredTendersKey = `${ministryCode}_featuredTenders`;
    const ministryTendersKey = `${ministryCode}_tenders`;

    localStorage.removeItem(recentTendersKey);
    localStorage.removeItem(featuredTendersKey);
    localStorage.removeItem(ministryTendersKey);
    onTenderCreated();
    alert(
      `All tenders cleared from ${ministryCode} localStorage:\n• ${recentTendersKey}\n• ${featuredTendersKey}\n• ${ministryTendersKey}`,
    );
  };

  const viewStoredTenders = () => {
    const recentTenders = JSON.parse(
      localStorage.getItem("recentTenders") || "[]",
    );
    const ministryTenders = JSON.parse(
      localStorage.getItem("ministryTenders") || "[]",
    );
    const featuredTenders = JSON.parse(
      localStorage.getItem("featuredTenders") || "[]",
    );

    console.log("=== TENDER STORAGE STATUS ===");
    console.log("recentTenders (CompanyDashboard):", recentTenders);
    console.log("ministryTenders (MinistryDashboard):", ministryTenders);
    console.log("featuredTenders (Index page):", featuredTenders);

    // Also check ministry-specific keys for debugging
    const getMinistryCode = () => {
      try {
        const ministryUser = localStorage.getItem("ministryUser");
        if (ministryUser) {
          const userData = JSON.parse(ministryUser);
          return (
            userData.ministryCode || userData.ministryId?.toUpperCase() || "MOH"
          );
        }
      } catch (error) {
        console.error("Error getting ministry context:", error);
      }
      return "MOH";
    };

    const ministryCode = getMinistryCode();
    const ministryRecentTenders = JSON.parse(
      localStorage.getItem(`${ministryCode}_recentTenders`) || "[]",
    );
    const ministryFeaturedTenders = JSON.parse(
      localStorage.getItem(`${ministryCode}_featuredTenders`) || "[]",
    );

    console.log(`=== ${ministryCode} MINISTRY-SPECIFIC KEYS ===`);
    console.log(`${ministryCode}_recentTenders:`, ministryRecentTenders);
    console.log(`${ministryCode}_featuredTenders:`, ministryFeaturedTenders);

    // Test ministry filtering
    const mainTenders = JSON.parse(
      localStorage.getItem("kanoproc_tenders") || "[]",
    );
    const ministryInfo = JSON.parse(
      localStorage.getItem("ministryUser") || "{}",
    );
    const currentMinistryTenders = mainTenders.filter(
      (t: any) => t.ministry === ministryInfo.ministryName,
    );

    console.log(`=== MINISTRY FILTERING TEST ===`);
    console.log(`Total tenders in kanoproc_tenders: ${mainTenders.length}`);
    console.log(
      `Filtered for ${ministryInfo.ministryName}: ${currentMinistryTenders.length}`,
    );
    console.log(
      `Current ministry tenders:`,
      currentMinistryTenders.map(
        (t: any) => `${t.id}: ${t.title} (${t.ministry})`,
      ),
    );

    alert(
      `Tender Storage & Filtering Status:\n\n🚨 LEGACY GLOBAL KEYS (should be empty):\n• recentTenders: ${recentTenders.length} tenders\n• featuredTenders: ${featuredTenders.length} tenders\n• ministryTenders: ${ministryTenders.length} tenders\n\n✅ MINISTRY-SPECIFIC KEYS (${ministryCode}):\n• ${ministryCode}_recentTenders: ${ministryRecentTenders.length} tenders\n• ${ministryCode}_featuredTenders: ${ministryFeaturedTenders.length} tenders\n\n🎯 MINISTRY FILTERING:\n• Total in kanoproc_tenders: ${mainTenders.length} tenders\n• Filtered for ${ministryInfo.ministryName || ministryCode}: ${currentMinistryTenders.length} tenders\n• Filter working: ${currentMinistryTenders.length < mainTenders.length ? "✅ YES" : "❌ NO"}\n\nCheck console for details.`,
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-3">
        Tender Testing Helper
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Test tender creation and visibility for active users
      </p>

      <div className="space-y-2">
        <button
          onClick={createTestTender}
          disabled={isCreating}
          className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Create Test Tender"}
        </button>

        <button
          onClick={viewStoredTenders}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View Stored Tenders
        </button>

        <button
          onClick={clearAllTenders}
          className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Clear All Tenders
        </button>

        <button
          onClick={() => {
            const result = verifyMinistryPropertyFix();
            alert(`Ministry Property Fix Verification:\n\n${result.success ? "✅ SUCCESS" : "❌ FAILED"}\n\n${result.message}\n\nCheck console for detailed results.`);
            console.log("Ministry Property Fix Result:", result);
          }}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Verify Ministry Fix
        </button>

        <button
          onClick={() => {
            const result = runCompleteFilteringTest();
            alert(`Complete Filtering Test:\n\n${result.passed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}\n\nCheck console for detailed results.`);
            console.log("Complete Filtering Test Result:", result);
          }}
          className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Run Full Test Suite
        </button>

        <button
          onClick={() => {
            const result = verifyTenderVisibility();
            logTenderVisibilityStatus();
            alert(`Tender Visibility Check:\n\n${result.success ? "✅ ALL LOCATIONS WORKING" : "❌ VISIBILITY ISSUES FOUND"}\n\nDetails:\n• Ministry Overview: ${result.details.ministryOverview.willShow} tenders\n• Company Dashboard: ${result.details.companyDashboard.willShow} tenders\n• Main Storage: ${result.details.mainStorage.totalTenders} total\n\nCheck console for full details.`);
          }}
          className="w-full px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Check Tender Visibility
        </button>

        <button
          onClick={() => {
            const result = verifyHooksFix();
            logHooksFixStatus();
            alert(`React Hooks Fix Verification:\n\n${result.success ? "✅ HOOKS ISSUE FIXED" : "❌ HOOKS ISSUES DETECTED"}\n\n${result.message}\n\nCheck console for detailed information and testing instructions.`);
          }}
          className="w-full px-3 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700"
        >
          Verify Hooks Fix
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-gray-600">
        <strong>✅ Scalable System:</strong>
        <div className="mt-1 space-y-1">
          <div>• New user registrations → Start as "Pending"</div>
          <div>• Admin can manage any registered user</div>
          <div>• System works for unlimited users</div>
          <div>• Dynamic status changes affect all users</div>
        </div>
      </div>

      <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <strong>Test Instructions:</strong>
        <ol className="mt-1 space-y-1">
          <li>1. Create a test tender using the button above</li>
          <li>2. Register new users or use test accounts</li>
          <li>3. Admin can change any user's status</li>
          <li>4. Verify tender visibility per user status</li>
        </ol>
      </div>
    </div>
  );
};

export default TenderTestHelper;
