import React from "react";
import { OverviewSummaryCards } from "./OverviewSummaryCards";
import { ProcurementLifecycleStatus } from "./ProcurementLifecycleStatus";
import { LatestUpdates } from "./LatestUpdates";
import { PerformanceAnalytics } from "./PerformanceAnalytics";
import { QuickActions } from "./QuickActions";
import { AuditComplianceSnapshot } from "./AuditComplianceSnapshot";

interface MinistryData {
  // Summary Cards Data
  summaryData: {
    totalProcurementPlans: number;
    tendersCreated: number;
    tendersUnderEvaluation: number;
    nocPending: number;
    nocApproved: number;
    nocRejected: number;
    contractsActive: number;
    contractsClosed: number;
    budgetUtilization: number;
    totalBudget: string;
    utilizedBudget: string;
  };

  // Lifecycle Status Data
  lifecycleData: {
    procurementPlans: { count: number; status: "completed" | "active" | "pending" | "delayed" };
    tenderManagement: { count: number; status: "completed" | "active" | "pending" | "delayed" };
    nocRequest: { count: number; status: "completed" | "active" | "pending" | "delayed" };
    contractAward: { count: number; status: "completed" | "active" | "pending" | "delayed" };
  };

  // Updates Data
  updatesData: Array<{
    id: string;
    type: "noc_feedback" | "tender_status" | "contract_milestone" | "system_alert";
    title: string;
    description: string;
    timestamp: string;
    priority: "low" | "medium" | "high" | "urgent";
    status?: "approved" | "rejected" | "clarification_needed" | "completed" | "pending";
    actionRequired?: boolean;
    relatedId?: string;
    relatedType?: "tender" | "contract" | "noc" | "compliance";
  }>;

  // Performance Analytics Data
  analyticsData: {
    budgetData: Array<{
      month: string;
      budget: number;
      expenditure: number;
      variance: number;
    }>;
    tenderStatusData: Array<{
      status: string;
      count: number;
      value: number;
      color: string;
    }>;
    timelineData: Array<{
      category: string;
      averageDays: number;
      target: number;
      status: "good" | "warning" | "critical";
    }>;
    nocProcessingData: Array<{
      month: string;
      averageTime: number;
      approved: number;
      rejected: number;
    }>;
  };

  // Compliance Data
  complianceData: {
    complianceIssues: Array<{
      id: string;
      type: "tender" | "contract" | "noc" | "process";
      title: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      status: "open" | "in_progress" | "resolved" | "escalated";
      relatedId: string;
      relatedTitle: string;
      assignedTo?: string;
      dueDate: string;
      createdDate: string;
      tags: string[];
    }>;
    coiStatuses: Array<{
      committeeId: string;
      committeeName: string;
      totalMembers: number;
      clearedMembers: number;
      pendingMembers: number;
      flaggedMembers: number;
      lastReviewDate: string;
      nextReviewDate: string;
      status: "compliant" | "warning" | "critical";
    }>;
    upcomingDeadlines: Array<{
      id: string;
      type: "tender_closing" | "contract_expiry" | "review_due" | "compliance_check";
      title: string;
      description: string;
      dueDate: string;
      daysRemaining: number;
      priority: "low" | "medium" | "high" | "urgent";
      actionRequired: boolean;
      relatedId: string;
    }>;
  };
}

interface EnhancedMinistryOverviewProps {
  data: MinistryData;
  onQuickAction?: {
    onCreatePlan: () => void;
    onCreateTender: () => void;
    onSubmitNOC: () => void;
    onUploadEvaluation: () => void;
    onViewContracts: () => void;
    onManageUsers: () => void;
    onGenerateReport: () => void;
    onViewAnalytics: () => void;
    onBulkUpload: () => void;
    onScheduleTender: () => void;
    onManageCommittees: () => void;
    onViewNotifications: () => void;
  };
  onUpdateClick?: (update: any) => void;
  onIssueClick?: (issue: any) => void;
  onDeadlineClick?: (deadline: any) => void;
  onCOIClick?: (status: any) => void;
}

export const EnhancedMinistryOverview: React.FC<EnhancedMinistryOverviewProps> = ({
  data,
  onQuickAction,
  onUpdateClick,
  onIssueClick,
  onDeadlineClick,
  onCOIClick,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ministry Dashboard - Overview
        </h1>
        <p className="text-gray-600">
          Comprehensive procurement management dashboard with real-time insights and analytics
        </p>
      </div>

      {/* 1. Procurement Summary Cards */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Procurement Summary
        </h2>
        <OverviewSummaryCards data={data.summaryData} />
      </section>

      {/* 2. Procurement Lifecycle Status */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Procurement Workflow Tracker
        </h2>
        <ProcurementLifecycleStatus stages={data.lifecycleData} />
      </section>

      {/* 3. Two Column Layout: Updates & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Updates */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Latest Updates & Notifications
          </h2>
          <LatestUpdates 
            updates={data.updatesData} 
            onUpdateClick={onUpdateClick}
          />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          {onQuickAction && (
            <QuickActions
              onCreatePlan={onQuickAction.onCreatePlan}
              onCreateTender={onQuickAction.onCreateTender}
              onSubmitNOC={onQuickAction.onSubmitNOC}
              onUploadEvaluation={onQuickAction.onUploadEvaluation}
              onViewContracts={onQuickAction.onViewContracts}
              onManageUsers={onQuickAction.onManageUsers}
              onGenerateReport={onQuickAction.onGenerateReport}
              onViewAnalytics={onQuickAction.onViewAnalytics}
              onBulkUpload={onQuickAction.onBulkUpload}
              onScheduleTender={onQuickAction.onScheduleTender}
              onManageCommittees={onQuickAction.onManageCommittees}
              onViewNotifications={onQuickAction.onViewNotifications}
            />
          )}
        </section>
      </div>

      {/* 4. Ministry Procurement Performance */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Performance Analytics
        </h2>
        <PerformanceAnalytics
          budgetData={data.analyticsData.budgetData}
          tenderStatusData={data.analyticsData.tenderStatusData}
          timelineData={data.analyticsData.timelineData}
          nocProcessingData={data.analyticsData.nocProcessingData}
        />
      </section>

      {/* 5. Audit & Compliance Snapshot */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Audit & Compliance
        </h2>
        <AuditComplianceSnapshot
          complianceIssues={data.complianceData.complianceIssues}
          coiStatuses={data.complianceData.coiStatuses}
          upcomingDeadlines={data.complianceData.upcomingDeadlines}
          onIssueClick={onIssueClick}
          onDeadlineClick={onDeadlineClick}
          onCOIClick={onCOIClick}
        />
      </section>

      {/* Footer Summary */}
      <section className="bg-gray-50 rounded-lg p-6 border">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Synchronization Status
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            All data automatically syncs across Procurement Planning, Tender Management, 
            NOC Module, and Contract Management. Last updated: {new Date().toLocaleString()}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600">Live Sync Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-blue-600">Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-purple-600">Auto-refresh Enabled</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
