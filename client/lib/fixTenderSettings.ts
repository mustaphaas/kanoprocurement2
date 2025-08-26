import { tenderSettingsManager } from "./tenderSettings";

export const fixTenderSettingsIssue = () => {
  console.log("🔧 Fixing tender settings issue...");

  // Get current settings
  const currentSettings = tenderSettingsManager.getSettings();
  console.log("Current settings:", currentSettings);

  // Reset to defaults if threshold is 0 or disabled
  if (
    currentSettings.closingSoonThresholdDays === 0 ||
    !currentSettings.autoTransitionEnabled
  ) {
    console.log("❌ Found issue: Threshold is 0 or auto-transition disabled");
    tenderSettingsManager.resetToDefaults();
    console.log(
      "✅ Reset to defaults: closingSoonThresholdDays=5, autoTransitionEnabled=true",
    );
  } else {
    console.log("✅ Settings look correct");
  }

  // Force refresh of tender statuses
  console.log("🔄 Forcing tender status refresh...");
  window.location.reload();
};

// Make available globally
(window as any).fixTenderSettingsIssue = fixTenderSettingsIssue;

console.log("🛠️ Quick fix available: Run fixTenderSettingsIssue() in console");
