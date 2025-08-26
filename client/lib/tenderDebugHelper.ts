import { tenderStatusChecker, tenderSettingsManager } from "./tenderSettings";

export const debugSpecificTender = () => {
  console.log("=== TENDER STATUS DEBUGGING ===");

  // Check current settings
  const settings = tenderSettingsManager.getSettings();
  console.log("Current Settings:", settings);

  // Test with the user's specific tender deadline
  const testDeadline = "8/27/2025";
  const daysUntil =
    tenderStatusChecker.calculateDaysUntilDeadline(testDeadline);
  console.log(`Days until deadline (${testDeadline}):`, daysUntil);

  // Test status determination
  const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
    "Active",
    testDeadline,
  );
  console.log("Automatic status would be:", automaticStatus);

  // Check current date
  const now = new Date();
  console.log("Current date:", now.toISOString().split("T")[0]);
  console.log("Current datetime:", now.toISOString());

  // Test date parsing
  const parsedDeadline = new Date(testDeadline);
  console.log("Parsed deadline:", parsedDeadline.toISOString());

  // Manual calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(testDeadline);
  deadline.setHours(23, 59, 59, 999);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  console.log("Manual calculation - days until deadline:", diffDays);

  return {
    settings,
    daysUntil,
    automaticStatus,
    currentDate: now.toISOString().split("T")[0],
    parsedDeadline: parsedDeadline.toISOString(),
    manualDaysCalculation: diffDays,
  };
};

// Make available globally for browser console debugging
(window as any).debugSpecificTender = debugSpecificTender;
