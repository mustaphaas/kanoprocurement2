import React from "react";
import {
  getDashboardConfig,
  getAvailableFunctions,
  getFunctionsByCategory,
  type CompanyStatus,
  type DashboardFunction,
} from "@/lib/dashboardConfig";
import {
  Search,
  Heart,
  Send,
  FileText,
  Building2,
  Shield,
  Archive,
  MessageSquare,
  Bell,
  Award,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Lock,
  Zap,
} from "lucide-react";

const iconMap = {
  Search,
  Heart,
  Send,
  FileText,
  Building2,
  Shield,
  Archive,
  MessageSquare,
  Bell,
  Award,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Lock,
  Zap,
};

interface DynamicNavigationProps {
  status: CompanyStatus;
  activeSection: string;
  onSectionChange: (section: string) => void;
  companyName: string;
}

interface NavigationGroupProps {
  title: string;
  functions: DashboardFunction[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  status: CompanyStatus;
}

const NavigationGroup: React.FC<NavigationGroupProps> = ({
  title,
  functions,
  activeSection,
  onSectionChange,
  status,
}) => {
  if (functions.length === 0) return null;

  const statusColors = {
    Pending: "text-blue-600",
    Approved: "text-green-600",
    Suspended: "text-orange-600",
    Blacklisted: "text-red-600",
  };

  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-1">
        {functions.map((func) => {
          const IconComponent =
            iconMap[func.icon as keyof typeof iconMap] || FileText;
          const isActive = activeSection === func.route;
          const isEnabled = func.enabled;

          return (
            <button
              key={func.id}
              onClick={() => isEnabled && onSectionChange(func.route)}
              disabled={!isEnabled}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? `bg-green-100 ${statusColors[status]} border-l-4 border-current`
                  : isEnabled
                    ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <IconComponent
                className={`h-5 w-5 mr-3 ${isActive ? statusColors[status] : ""}`}
              />
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="truncate">{func.name}</span>
                  {func.badge && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        func.badge === "Required"
                          ? "bg-red-100 text-red-800"
                          : func.badge === "Action Required"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {func.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {func.description}
                </p>
              </div>
              {!isEnabled && <Lock className="h-4 w-4 ml-2 text-gray-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const DynamicNavigation: React.FC<DynamicNavigationProps> = ({
  status,
  activeSection,
  onSectionChange,
  companyName,
}) => {
  const config = getDashboardConfig(status);
  const availableFunctions = getAvailableFunctions(status);

  // Group functions by category
  const tenderFunctions = getFunctionsByCategory(status, "tender");
  const profileFunctions = getFunctionsByCategory(status, "profile");
  const documentFunctions = getFunctionsByCategory(status, "documents");
  const communicationFunctions = getFunctionsByCategory(
    status,
    "communication",
  );
  const contractFunctions = getFunctionsByCategory(status, "contracts");
  const complianceFunctions = getFunctionsByCategory(status, "compliance");

  const statusConfig = {
    Pending: {
      icon: Shield,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
    },
    Approved: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-600",
    },
    Suspended: {
      icon: AlertTriangle,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      iconColor: "text-orange-600",
    },
    Blacklisted: {
      icon: Lock,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-600",
    },
  };

  const currentStatusConfig = statusConfig[status];
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Company Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {companyName}
            </h2>
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${currentStatusConfig.bgColor} ${currentStatusConfig.borderColor} ${currentStatusConfig.textColor} border`}
            >
              <StatusIcon
                className={`h-3 w-3 mr-1 ${currentStatusConfig.iconColor}`}
              />
              {status}
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div
        className={`m-4 p-4 rounded-lg ${currentStatusConfig.bgColor} ${currentStatusConfig.borderColor} border`}
      >
        <div className="flex items-start space-x-3">
          <StatusIcon
            className={`h-5 w-5 mt-0.5 ${currentStatusConfig.iconColor}`}
          />
          <div className="flex-1">
            <h4
              className={`text-sm font-medium ${currentStatusConfig.textColor}`}
            >
              {config.statusDescription}
            </h4>
            {config.nextSteps.length > 0 && (
              <div className="mt-2">
                <p
                  className={`text-xs ${currentStatusConfig.textColor} font-medium`}
                >
                  Next Steps:
                </p>
                <ul
                  className={`text-xs ${currentStatusConfig.textColor} mt-1 space-y-1`}
                >
                  {config.nextSteps.slice(0, 2).map((step, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        {/* Dashboard Overview */}
        <div className="mb-6">
          <button
            onClick={() => onSectionChange("dashboard")}
            className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeSection === "dashboard"
                ? "bg-green-100 text-green-600 border-l-4 border-green-600"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Zap
              className={`h-5 w-5 mr-3 ${activeSection === "dashboard" ? "text-green-600" : ""}`}
            />
            <span>Dashboard Overview</span>
          </button>
        </div>

        {/* Dynamic Navigation Groups */}
        <NavigationGroup
          title="Tender Management"
          functions={tenderFunctions}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          status={status}
        />

        <NavigationGroup
          title="Company & Profile"
          functions={[...profileFunctions, ...documentFunctions]}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          status={status}
        />

        <NavigationGroup
          title="Communication"
          functions={communicationFunctions}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          status={status}
        />

        <NavigationGroup
          title="Contracts & Performance"
          functions={contractFunctions}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          status={status}
        />

        <NavigationGroup
          title="Compliance & Support"
          functions={complianceFunctions}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          status={status}
        />

        {/* Function Count Summary */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>Available Functions:</span>
              <span className="font-semibold text-green-600">
                {availableFunctions.length}
              </span>
            </div>
            {config.restrictions.length > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span>Restrictions:</span>
                <span className="font-semibold text-red-600">
                  {config.restrictions.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DynamicNavigation;
