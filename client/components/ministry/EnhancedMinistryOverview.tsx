import React from "react";
import { OverviewSummaryCards } from "./OverviewSummaryCards";
import { ProcurementLifecycleStatus } from "./ProcurementLifecycleStatus";
import { LatestUpdates } from "./LatestUpdates";
import { PerformanceAnalytics } from "./PerformanceAnalytics";
import { QuickActions } from "./QuickActions";
import { AuditComplianceSnapshot } from "./AuditComplianceSnapshot";
import { FileText, Activity, MessageSquare, Zap, BarChart3, Shield } from "lucide-react";

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
      {/* Enhanced Header with Turquoise Theme */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg p-8 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Ministry Dashboard - Overview
        </h1>
        <p className="text-teal-100">
          Comprehensive procurement management dashboard with real-time insights and analytics
        </p>
        <div className="mt-4 flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Last Updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-sm font-medium">Status: Active</span>
          </div>
        </div>
      </div>

      {/* 1. Procurement Summary Cards */}
      <section className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-100 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Procurement Summary
          </h2>
        </div>
        <OverviewSummaryCards data={data.summaryData} />
      </section>

      {/* 2. Procurement Lifecycle Status */}
      <section className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-100 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Procurement Workflow Tracker
          </h2>
        </div>
        <ProcurementLifecycleStatus stages={data.lifecycleData} />
      </section>

      {/* 3. Latest Updates & Notifications */}
      <section className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-100 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Latest Updates & Notifications
          </h2>
        </div>
        <LatestUpdates
          updates={data.updatesData}
          onUpdateClick={onUpdateClick}
        />
      </section>

      {/* 4. Quick Actions - Full Width Card */}
      <section className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-100 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quick Actions
          </h2>
          <div className="ml-auto text-sm text-gray-600">
            Streamlined workflow shortcuts
          </div>
        </div>
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

      {/* 5. Ministry Procurement Performance */}
      <section className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-100 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Performance Analytics
          </h2>
        </div>
        <PerformanceAnalytics
          budgetData={data.analyticsData.budgetData}
          tenderStatusData={data.analyticsData.tenderStatusData}
          timelineData={data.analyticsData.timelineData}
          nocProcessingData={data.analyticsData.nocProcessingData}
        />
      </section>

      {/* 6. Audit & Compliance Snapshot */}
      <section className="bg-white/70 backdrop-blur-sm rounded-xl border border-teal-100 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Audit & Compliance
          </h2>
        </div>
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
      <section className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 shadow-lg p-6">
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
