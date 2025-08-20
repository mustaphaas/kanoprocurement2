import React from "react";
import { MDAOverviewSection } from "./MDAOverviewSection";
import { ProcurementActivitySummary } from "./ProcurementActivitySummary";
import { ComplianceOversightSection } from "./ComplianceOversightSection";
import { UserCommitteeActivity } from "./UserCommitteeActivity";
import { NotificationsAlerts } from "./NotificationsAlerts";
import { AnalyticsReports } from "./AnalyticsReports";

interface SuperUserData {
  // MDA Overview Data
  mdaData: {
    totalMDAs: number;
    activeMDAs: number;
    inactiveMDAs: number;
    recentlyAdded: Array<{
      id: string;
      name: string;
      activationDate: string;
      status: "active" | "inactive" | "pending";
    }>;
  };

  // Procurement Activity Data
  procurementData: {
    totalTenders: number;
    ongoingTenders: number;
    evaluatedTenders: number;
    awardedTenders: number;
    pendingNOC: number;
    approvedNOC: number;
    rejectedNOC: number;
    highValueContracts: Array<{
      id: string;
      title: string;
      mda: string;
      value: string;
      status: string;
      dateAwarded: string;
    }>;
  };

  // Compliance & Oversight Data
  complianceData: {
    pendingProcurementPlans: number;
    delayedNOCRequests: number;
    flaggedTenders: number;
    contractsWithVariations: number;
    pendingApprovals: Array<{
      id: string;
      type: "procurement_plan" | "noc_request" | "contract_variation";
      mda: string;
      title: string;
      daysOverdue: number;
    }>;
  };

  // User & Committee Activity Data
  userActivityData: {
    totalUsers: number;
    roleDistribution: {
      procurementOfficers: number;
      accountants: number;
      evaluators: number;
      admins: number;
    };
    activeCommittees: number;
    assignedMembers: number;
    committees: Array<{
      id: string;
      name: string;
      mda: string;
      memberCount: number;
      status: "active" | "inactive";
    }>;
  };

  // Notifications & Alerts Data
  alertsData: {
    tenderDelays: number;
    overdueNOCs: number;
    contractIssues: number;
    urgentAlerts: Array<{
      id: string;
      type: "tender_delay" | "overdue_noc" | "contract_issue" | "system_alert";
      title: string;
      description: string;
      priority: "low" | "medium" | "high" | "urgent";
      timestamp: string;
      mda?: string;
    }>;
    mdaMessages: Array<{
      id: string;
      from: string;
      mda: string;
      subject: string;
      preview: string;
      timestamp: string;
      isUnread: boolean;
    }>;
  };

  // Analytics & Reports Data
  analyticsData: {
    totalSpend: string;
    spendByMDA: Array<{
      mda: string;
      spend: string;
      percentage: number;
    }>;
    vendorPerformance: Array<{
      vendor: string;
      contractsWon: number;
      completionRate: number;
      averageRating: number;
    }>;
    mdaPerformance: Array<{
      mda: string;
      timeliness: number;
      compliance: number;
      efficiency: number;
      status: "high" | "medium" | "low";
    }>;
  };
}

interface EnhancedSuperUserOverviewProps {
  data: SuperUserData;
  onDrillDown?: (mda: string) => void;
  onFilterChange?: (filters: any) => void;
}

export function EnhancedSuperUserOverview({
  data,
  onDrillDown,
  onFilterChange,
}: EnhancedSuperUserOverviewProps) {
  return (
    <div className="space-y-6">
      {/* MDA Overview Section */}
      <MDAOverviewSection data={data.mdaData} onDrillDown={onDrillDown} />

      {/* Procurement Activity Summary */}
      <ProcurementActivitySummary
        data={data.procurementData}
        onFilterChange={onFilterChange}
      />

      {/* Compliance & Oversight */}
      <ComplianceOversightSection
        data={data.complianceData}
        onFilterChange={onFilterChange}
      />

      {/* User & Committee Activity */}
      <UserCommitteeActivity data={data.userActivityData} />

      {/* Notifications & Alerts */}
      <NotificationsAlerts data={data.alertsData} />

      {/* Analytics & Reports */}
      <AnalyticsReports data={data.analyticsData} onDrillDown={onDrillDown} />
    </div>
  );
}
