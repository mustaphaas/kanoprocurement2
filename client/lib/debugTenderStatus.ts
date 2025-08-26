/**
 * Debug utility to check tender status transitions and date logic
 */

import { tenderStatusChecker } from "./tenderSettings";

export const debugTenderStatus = (tender: any) => {
  console.log("=== TENDER STATUS DEBUG ===");
  console.log("Tender Details:", {
    id: tender.id,
    title: tender.title,
    originalStatus: tender.status,
    closingDate: tender.closingDate,
    deadline: tender.deadline,
    publishedDate: tender.publishedDate || tender.publishDate,
    createdDate: tender.createdDate,
  });

  // Check what the current date is
  const now = new Date();
  console.log("Current Date:", now.toISOString().split("T")[0]);

  // Check the closing date parsing
  const closingDate = tender.closingDate || tender.deadline;
  console.log("Closing Date String:", closingDate);

  if (closingDate) {
    const closingDateObj = new Date(closingDate);
    console.log(
      "Closing Date Parsed:",
      closingDateObj.toISOString().split("T")[0],
    );

    // Check days until deadline
    const daysUntil =
      tenderStatusChecker.calculateDaysUntilDeadline(closingDate);
    console.log("Days Until Deadline:", daysUntil);

    // Check automatic status determination
    const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
      tender.status,
      closingDate,
      tender.publishedDate || tender.publishDate,
    );
    console.log("Automatic Status Would Be:", automaticStatus);

    // Check status info
    const statusInfo = tenderStatusChecker.getStatusInfo(
      automaticStatus,
      closingDate,
    );
    console.log("Status Info:", {
      canExpressInterest: statusInfo.canExpressInterest,
      canSubmitBid: statusInfo.canSubmitBid,
      isActive: statusInfo.isActive,
      description: statusInfo.description,
    });
  } else {
    console.log("❌ No closing date found!");
  }

  console.log("=== END DEBUG ===");
};

// Make it available globally for easy debugging
(window as any).debugTenderStatus = debugTenderStatus;
