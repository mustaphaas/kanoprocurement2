import React from "react";
import { getDashboardConfig, type CompanyStatus } from "@/lib/dashboardConfig";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Ban,
  Shield,
  Zap,
  TrendingUp,
  Users,
  FileText,
  Award,
  RefreshCw,
  AlertCircle,
  Info,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface DynamicDashboardHeaderProps {
  status: CompanyStatus;
  companyName: string;
  companyData: {
    totalAdverts: number;
    bidsExpressedInterest: number;
    activeBids: number;
    notActiveBids: number;
    totalContractValue: string;
    suspensionReason?: string;
    blacklistReason?: string;
  };
  onSectionChange: (section: string) => void;
}

export const DynamicDashboardHeader: React.FC<DynamicDashboardHeaderProps> = ({
  status,
  companyName,
  companyData,
  onSectionChange,
}) => {
  const config = getDashboardConfig(status);

  // Status-specific configurations
  const statusConfigs = {
    Pending: {
      icon: Clock,
      bgGradient: "from-blue-50 to-indigo-50",
      actionColor: "blue",
      primaryAction: { text: "Complete Verification", section: "my-documents" },
      secondaryAction: { text: "View Requirements", section: "my-profile" },
    },
    Approved: {
      icon: CheckCircle,
      bgGradient: "from-green-50 to-emerald-50",
      actionColor: "green",
      primaryAction: { text: "Browse Tenders", section: "tender-ads" },
      secondaryAction: { text: "View Contracts", section: "contracts-awarded" },
    },
    Suspended: {
      icon: AlertTriangle,
      bgGradient: "from-orange-50 to-amber-50",
      actionColor: "orange",
      primaryAction: { text: "Fix Issues Now", section: "my-documents" },
      secondaryAction: {
        text: "View Compliance",
        section: "detailed-compliance",
      },
    },
    Blacklisted: {
      icon: Ban,
      bgGradient: "from-red-50 to-rose-50",
      actionColor: "red",
      primaryAction: { text: "Submit Appeal", section: "grievance" },
      secondaryAction: { text: "View Restrictions", section: "my-profile" },
    },
  };

  const currentConfig = statusConfigs[status];
  const StatusIcon = currentConfig.icon;

  // Get metrics based on status
  const getStatusSpecificMetrics = () => {
    const baseMetrics = [
      {
        label: "Available Opportunities",
        value: companyData.totalAdverts.toString(),
        description: "Active tenders in the portal",
        icon: FileText,
        color: "blue",
      },
    ];

    switch (status) {
      case "Pending":
        return [
          ...baseMetrics,
          {
            label: "Verification Progress",
            value: "60%",
            description: "Documents uploaded",
            icon: Shield,
            color: "blue",
          },
          {
            label: "Review Status",
            value: "In Progress",
            description: "BPP is reviewing your application",
            icon: Clock,
            color: "blue",
          },
          {
            label: "Expected Approval",
            value: "3-5 days",
            description: "Estimated time remaining",
            icon: TrendingUp,
            color: "blue",
          },
        ];

      case "Approved":
        return [
          ...baseMetrics,
          {
            label: "Active Interests",
            value: companyData.bidsExpressedInterest.toString(),
            description: "Tenders you're tracking",
            icon: TrendingUp,
            color: "green",
          },
          {
            label: "Pending Evaluations",
            value: companyData.activeBids.toString(),
            description: "Bids under review",
            icon: Clock,
            color: "orange",
          },
          {
            label: "Contract Value",
            value: companyData.totalContractValue,
            description: "Total awarded value",
            icon: Award,
            color: "purple",
          },
        ];

      case "Suspended":
        return [
          ...baseMetrics,
          {
            label: "Previous Interests",
            value: companyData.bidsExpressedInterest.toString(),
            description: "Before suspension",
            icon: Clock,
            color: "orange",
          },
          {
            label: "Suspended Bids",
            value: companyData.notActiveBids.toString(),
            description: "Affected by suspension",
            icon: AlertTriangle,
            color: "orange",
          },
          {
            label: "Days Suspended",
            value: "15",
            description: "Since suspension date",
            icon: RefreshCw,
            color: "red",
          },
        ];

      case "Blacklisted":
        return [
          ...baseMetrics,
          {
            label: "Restricted Access",
            value: "Full",
            description: "All procurement activities",
            icon: Ban,
            color: "red",
          },
          {
            label: "Appeal Status",
            value: "Available",
            description: "You can submit an appeal",
            icon: ExternalLink,
            color: "blue",
          },
          {
            label: "Support Contact",
            value: "BPP Office",
            description: "For assistance",
            icon: Users,
            color: "gray",
          },
        ];

      default:
        return baseMetrics;
    }
  };

  const metrics = getStatusSpecificMetrics();

  const getStatusAlert = () => {
    const alertConfigs = {
      Pending: {
        title: "Account Under Review",
        message:
          "Your company registration is being processed by the Bureau of Public Procurement.",
        type: "info" as const,
        details: companyData.suspensionReason,
      },
      Approved: {
        title: "Account Active",
        message:
          "Your company has full access to all procurement opportunities.",
        type: "success" as const,
        details: null,
      },
      Suspended: {
        title: "Account Suspended",
        message: "Immediate action required to restore full access.",
        type: "warning" as const,
        details: companyData.suspensionReason,
      },
      Blacklisted: {
        title: "Account Restricted",
        message:
          "Your company is currently blacklisted from state procurements.",
        type: "error" as const,
        details: companyData.blacklistReason,
      },
    };

    const alert = alertConfigs[status];
    const alertStyles = {
      info: "bg-blue-50 border-blue-400 text-blue-800",
      success: "bg-green-50 border-green-400 text-green-800",
      warning: "bg-orange-50 border-orange-400 text-orange-800",
      error: "bg-red-50 border-red-400 text-red-800",
    };

    const alertIcons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
    };

    const AlertIcon = alertIcons[alert.type];

    return (
      <div className={`border-l-4 p-4 rounded-r-lg ${alertStyles[alert.type]}`}>
        <div className="flex items-start">
          <AlertIcon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold">{alert.title}</h3>
            <p className="mt-1 text-sm">{alert.message}</p>
            {alert.details && (
              <p className="mt-2 text-sm font-medium">
                Details: {alert.details}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div
        className={`bg-gradient-to-r ${currentConfig.bgGradient} rounded-lg p-6`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-lg bg-white shadow-sm`}>
                <StatusIcon
                  className={`h-6 w-6 text-${currentConfig.actionColor}-600`}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {config.welcomeMessage}
                </h1>
                <p className="text-gray-700 font-medium">{companyName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Your Status
                </h3>
                <p className="text-sm text-gray-700">
                  {config.statusDescription}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Next Actions
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {config.nextSteps.slice(0, 2).map((step, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() =>
                  onSectionChange(currentConfig.primaryAction.section)
                }
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-${currentConfig.actionColor}-600 hover:bg-${currentConfig.actionColor}-700 shadow-sm`}
              >
                <Zap className="h-4 w-4 mr-2" />
                {currentConfig.primaryAction.text}
              </button>
              <button
                onClick={() =>
                  onSectionChange(currentConfig.secondaryAction.section)
                }
                className={`inline-flex items-center px-4 py-2 border border-${currentConfig.actionColor}-300 text-sm font-medium rounded-md text-${currentConfig.actionColor}-700 bg-white hover:bg-${currentConfig.actionColor}-50`}
              >
                {currentConfig.secondaryAction.text}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {getStatusAlert()}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const MetricIcon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </p>
                  <p
                    className={`text-3xl font-bold text-${metric.color}-600 mt-1`}
                  >
                    {metric.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metric.description}
                  </p>
                </div>
                <MetricIcon className={`h-8 w-8 text-${metric.color}-600`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicDashboardHeader;
