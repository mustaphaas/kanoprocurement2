// System settings for tender management
export interface TenderSystemSettings {
  closingSoonThresholdDays: number;
  autoTransitionEnabled: boolean;
  autoEvaluationStartEnabled: boolean;
  lastUpdated: string;
}

const DEFAULT_SETTINGS: TenderSystemSettings = {
  closingSoonThresholdDays: 5,
  autoTransitionEnabled: true,
  autoEvaluationStartEnabled: true,
  lastUpdated: new Date().toISOString(),
};

const SETTINGS_STORAGE_KEY = "kanoproc_tender_settings";

export class TenderSettingsManager {
  private static instance: TenderSettingsManager;
  private settings: TenderSystemSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): TenderSettingsManager {
    if (!TenderSettingsManager.instance) {
      TenderSettingsManager.instance = new TenderSettingsManager();
    }
    return TenderSettingsManager.instance;
  }

  private loadSettings(): TenderSystemSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error("Error loading tender settings:", error);
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(): void {
    try {
      this.settings.lastUpdated = new Date().toISOString();
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error("Error saving tender settings:", error);
    }
  }

  public getSettings(): TenderSystemSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<TenderSystemSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getClosingSoonThreshold(): number {
    return this.settings.closingSoonThresholdDays;
  }

  public setClosingSoonThreshold(days: number): void {
    if (days < 1 || days > 30) {
      throw new Error("Closing soon threshold must be between 1 and 30 days");
    }
    this.updateSettings({ closingSoonThresholdDays: days });
  }

  public isAutoTransitionEnabled(): boolean {
    return this.settings.autoTransitionEnabled;
  }

  public setAutoTransitionEnabled(enabled: boolean): void {
    this.updateSettings({ autoTransitionEnabled: enabled });
  }

  public isAutoEvaluationStartEnabled(): boolean {
    return this.settings.autoEvaluationStartEnabled;
  }

  public setAutoEvaluationStartEnabled(enabled: boolean): void {
    this.updateSettings({ autoEvaluationStartEnabled: enabled });
  }

  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }
}

// Utility functions for tender status management
export type TenderStatus =
  | "Draft"
  | "Published"
  | "Active"
  | "Closing Soon"
  | "Closed"
  | "Evaluated"
  | "NOC Pending"
  | "NOC Approved"
  | "NOC Rejected"
  | "Contract Created"
  | "Contract Signed"
  | "Implementation"
  | "Completed";

export interface TenderStatusInfo {
  status: TenderStatus;
  canExpressInterest: boolean;
  canSubmitBid: boolean;
  isActive: boolean;
  description: string;
  nextStage?: string;
}

export class TenderStatusChecker {
  private static settingsManager = TenderSettingsManager.getInstance();

  public static calculateDaysUntilDeadline(closingDate: string): number {
    const closing = new Date(closingDate);
    const today = new Date();
    // Set time to start of day for accurate day calculation
    closing.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  public static determineAutomaticStatus(
    currentStatus: TenderStatus,
    closingDate: string,
    publishedDate?: string,
  ): TenderStatus {
    const settings = this.settingsManager.getSettings();

    if (!settings.autoTransitionEnabled) {
      return currentStatus;
    }

    // Don't auto-transition if already in post-closure stages
    if (
      [
        "Closed",
        "Evaluated",
        "NOC Pending",
        "NOC Approved",
        "NOC Rejected",
        "Contract Created",
        "Contract Signed",
        "Implementation",
        "Completed",
      ].includes(currentStatus)
    ) {
      return currentStatus;
    }

    const daysUntilDeadline = this.calculateDaysUntilDeadline(closingDate);

    // Past deadline - should be Closed
    if (daysUntilDeadline < 0) {
      return "Closed";
    }

    // Within closing soon threshold
    if (daysUntilDeadline <= settings.closingSoonThresholdDays) {
      return "Closing Soon";
    }

    // Active if published and not yet closing soon
    if (
      currentStatus === "Published" ||
      currentStatus === "Open" ||
      currentStatus === "Active"
    ) {
      return "Active";
    }

    return currentStatus;
  }

  public static getStatusInfo(
    status: TenderStatus,
    closingDate?: string,
  ): TenderStatusInfo {
    let canExpressInterest = false;
    let canSubmitBid = false;
    let isActive = false;
    let description = "";
    let nextStage: string | undefined;

    switch (status) {
      case "Draft":
        description = "Tender is being prepared and not yet published";
        break;

      case "Published":
      case "Open":
      case "Active":
        canExpressInterest = true;
        canSubmitBid = true;
        isActive = true;
        description = "Tender is open for vendor participation";
        nextStage = closingDate ? "Closing Soon" : undefined;
        break;

      case "Closing Soon":
        canExpressInterest = true;
        canSubmitBid = true;
        isActive = true;
        description = "Tender deadline is approaching - limited time remaining";
        nextStage = "Closed";
        break;

      case "Closed":
        description =
          "Tender deadline has passed - no new submissions accepted";
        nextStage = "Evaluated";
        break;

      case "Evaluated":
        description = "Tender evaluation completed - awaiting NOC process";
        nextStage = "NOC Pending";
        break;

      case "NOC Pending":
        description = "Awaiting No Objection Certificate from oversight body";
        nextStage = "NOC Approved";
        break;

      case "NOC Approved":
        description = "NOC approved - proceeding to contract creation";
        nextStage = "Contract Created";
        break;

      case "NOC Rejected":
        description = "NOC rejected - review required";
        break;

      case "Contract Created":
        description = "Contract documents prepared - awaiting signature";
        nextStage = "Contract Signed";
        break;

      case "Contract Signed":
        description = "Contract executed - project implementation beginning";
        nextStage = "Implementation";
        break;

      case "Implementation":
        description = "Project implementation in progress";
        nextStage = "Completed";
        break;

      case "Completed":
        description = "Project completed successfully";
        break;
    }

    return {
      status,
      canExpressInterest,
      canSubmitBid,
      isActive,
      description,
      nextStage,
    };
  }

  public static shouldStartEvaluation(status: TenderStatus): boolean {
    const settings = this.settingsManager.getSettings();
    return settings.autoEvaluationStartEnabled && status === "Closed";
  }
}

// Export singleton instance for easy access
export const tenderSettingsManager = TenderSettingsManager.getInstance();
export const tenderStatusChecker = TenderStatusChecker;
