import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Upload,
  Send,
  FileSpreadsheet,
  Eye,
  Zap,
  FileText,
  Building2,
  Award,
  Users,
  Settings,
  Download,
  Calendar,
  BarChart3,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: "procurement" | "tender" | "contract" | "management" | "reporting";
  onClick: () => void;
  shortcut?: string;
  badge?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
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
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreatePlan,
  onCreateTender,
  onSubmitNOC,
  onUploadEvaluation,
  onViewContracts,
  onManageUsers,
  onGenerateReport,
  onViewAnalytics,
  onBulkUpload,
  onScheduleTender,
  onManageCommittees,
  onViewNotifications,
}) => {
  const quickActions: QuickAction[] = [
    {
      id: "create-plan",
      title: "Create Procurement Plan",
      description: "Start a new procurement planning process",
      icon: FileText,
      color: "blue",
      category: "procurement",
      onClick: onCreatePlan,
      shortcut: "Ctrl+P",
    },
    {
      id: "create-tender",
      title: "Create New Tender",
      description: "Publish a new tender opportunity",
      icon: Plus,
      color: "green",
      category: "tender",
      onClick: onCreateTender,
      shortcut: "Ctrl+T",
      badge: "Hot",
    },
    {
      id: "submit-noc",
      title: "Submit NOC Request",
      description: "Request No Objection Certificate",
      icon: Send,
      color: "orange",
      category: "procurement",
      onClick: onSubmitNOC,
    },
    {
      id: "upload-evaluation",
      title: "Upload Evaluation Report",
      description: "Submit tender evaluation results",
      icon: Upload,
      color: "purple",
      category: "tender",
      onClick: onUploadEvaluation,
      badge: "3 Pending",
    },
    {
      id: "view-contracts",
      title: "View Active Contracts",
      description: "Monitor ongoing contracts and milestones",
      icon: Eye,
      color: "indigo",
      category: "contract",
      onClick: onViewContracts,
    },
    {
      id: "bulk-upload",
      title: "Bulk Tender Upload",
      description: "Upload multiple tenders via Excel",
      icon: FileSpreadsheet,
      color: "teal",
      category: "tender",
      onClick: onBulkUpload,
    },
    {
      id: "schedule-tender",
      title: "Schedule Publication",
      description: "Schedule tender for future publication",
      icon: Calendar,
      color: "pink",
      category: "tender",
      onClick: onScheduleTender,
    },
    {
      id: "manage-users",
      title: "Manage Users",
      description: "Add and manage ministry users",
      icon: Users,
      color: "gray",
      category: "management",
      onClick: onManageUsers,
    },
    {
      id: "view-analytics",
      title: "Performance Analytics",
      description: "View detailed procurement analytics",
      icon: BarChart3,
      color: "cyan",
      category: "reporting",
      onClick: onViewAnalytics,
    },
    {
      id: "generate-report",
      title: "Generate Reports",
      description: "Create procurement reports",
      icon: Download,
      color: "emerald",
      category: "reporting",
      onClick: onGenerateReport,
    },
    {
      id: "manage-committees",
      title: "Evaluation Committees",
      description: "Manage evaluation committee members",
      icon: Users,
      color: "violet",
      category: "management",
      onClick: onManageCommittees,
    },
    {
      id: "notifications",
      title: "View Notifications",
      description: "Check latest system notifications",
      icon: MessageSquare,
      color: "yellow",
      category: "management",
      onClick: onViewNotifications,
      badge: "New",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50 hover:bg-blue-100",
        icon: "text-blue-600",
        border: "border-blue-200",
        button: "bg-blue-600 hover:bg-blue-700",
      },
      green: {
        bg: "bg-green-50 hover:bg-green-100",
        icon: "text-green-600",
        border: "border-green-200",
        button: "bg-green-600 hover:bg-green-700",
      },
      orange: {
        bg: "bg-orange-50 hover:bg-orange-100",
        icon: "text-orange-600",
        border: "border-orange-200",
        button: "bg-orange-600 hover:bg-orange-700",
      },
      purple: {
        bg: "bg-purple-50 hover:bg-purple-100",
        icon: "text-purple-600",
        border: "border-purple-200",
        button: "bg-purple-600 hover:bg-purple-700",
      },
      indigo: {
        bg: "bg-indigo-50 hover:bg-indigo-100",
        icon: "text-indigo-600",
        border: "border-indigo-200",
        button: "bg-indigo-600 hover:bg-indigo-700",
      },
      teal: {
        bg: "bg-teal-50 hover:bg-teal-100",
        icon: "text-teal-600",
        border: "border-teal-200",
        button: "bg-teal-600 hover:bg-teal-700",
      },
      pink: {
        bg: "bg-pink-50 hover:bg-pink-100",
        icon: "text-pink-600",
        border: "border-pink-200",
        button: "bg-pink-600 hover:bg-pink-700",
      },
      gray: {
        bg: "bg-gray-50 hover:bg-gray-100",
        icon: "text-gray-600",
        border: "border-gray-200",
        button: "bg-gray-600 hover:bg-gray-700",
      },
      cyan: {
        bg: "bg-cyan-50 hover:bg-cyan-100",
        icon: "text-cyan-600",
        border: "border-cyan-200",
        button: "bg-cyan-600 hover:bg-cyan-700",
      },
      emerald: {
        bg: "bg-emerald-50 hover:bg-emerald-100",
        icon: "text-emerald-600",
        border: "border-emerald-200",
        button: "bg-emerald-600 hover:bg-emerald-700",
      },
      violet: {
        bg: "bg-violet-50 hover:bg-violet-100",
        icon: "text-violet-600",
        border: "border-violet-200",
        button: "bg-violet-600 hover:bg-violet-700",
      },
      yellow: {
        bg: "bg-yellow-50 hover:bg-yellow-100",
        icon: "text-yellow-600",
        border: "border-yellow-200",
        button: "bg-yellow-600 hover:bg-yellow-700",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const groupedActions = quickActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  const categoryNames = {
    procurement: "Procurement Planning",
    tender: "Tender Management",
    contract: "Contract Management",
    management: "User Management",
    reporting: "Reports & Analytics",
  };

  const categoryIcons = {
    procurement: FileText,
    tender: Building2,
    contract: Award,
    management: Users,
    reporting: BarChart3,
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Quick Actions
          <span className="text-sm text-gray-500 font-normal ml-2">
            ({quickActions.length} available shortcuts)
          </span>
        </CardTitle>
        <div className="text-sm text-gray-600">
          Frequently used actions for faster procurement management
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedActions).map(([category, actions]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h3>
                  <div className="h-px bg-gray-200 flex-1 ml-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {actions.map((action) => {
                    const colors = getColorClasses(action.color);
                    const IconComponent = action.icon;

                    return (
                      <div
                        key={action.id}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${colors.bg} ${colors.border} ${
                          action.disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
                        }`}
                        onClick={() => !action.disabled && action.onClick()}
                      >
                        {/* Badge */}
                        {action.badge && (
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {action.badge}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Action Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white border ${colors.border}`}>
                            <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                          </div>

                          {/* Action Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                              {action.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                              {action.description}
                            </p>

                            <div className="flex items-center justify-between">
                              {action.shortcut && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {action.shortcut}
                                </span>
                              )}
                              
                              <Button
                                size="sm"
                                className={`${colors.button} text-white text-xs px-3 py-1 h-7 ml-auto`}
                                disabled={action.disabled}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!action.disabled) action.onClick();
                                }}
                              >
                                {action.disabled ? "Disabled" : "Execute"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Access Bar */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Most Used Actions</h4>
            <span className="text-xs text-gray-500">Click to execute</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.slice(0, 6).map((action) => {
              const colors = getColorClasses(action.color);
              const IconComponent = action.icon;
              
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 ${colors.bg} ${colors.border} hover:shadow-md`}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <IconComponent className={`h-4 w-4 ${colors.icon}`} />
                  {action.title}
                  {action.badge && (
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {action.badge}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
