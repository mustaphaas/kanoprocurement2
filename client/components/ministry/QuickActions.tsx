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
        bg: "bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100",
        icon: "text-teal-600",
        border: "border-teal-200",
        button: "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700",
      },
      green: {
        bg: "bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100",
        icon: "text-emerald-600",
        border: "border-emerald-200",
        button: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
      },
      orange: {
        bg: "bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100",
        icon: "text-amber-600",
        border: "border-amber-200",
        button: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100",
        icon: "text-purple-600",
        border: "border-purple-200",
        button: "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
      },
      indigo: {
        bg: "bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100",
        icon: "text-indigo-600",
        border: "border-indigo-200",
        button: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
      },
      teal: {
        bg: "bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100",
        icon: "text-teal-600",
        border: "border-teal-200",
        button: "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700",
      },
      pink: {
        bg: "bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100",
        icon: "text-pink-600",
        border: "border-pink-200",
        button: "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
      },
      gray: {
        bg: "bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100",
        icon: "text-slate-600",
        border: "border-slate-200",
        button: "bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700",
      },
      cyan: {
        bg: "bg-gradient-to-br from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100",
        icon: "text-cyan-600",
        border: "border-cyan-200",
        button: "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700",
      },
      emerald: {
        bg: "bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100",
        icon: "text-emerald-600",
        border: "border-emerald-200",
        button: "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
      },
      violet: {
        bg: "bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100",
        icon: "text-violet-600",
        border: "border-violet-200",
        button: "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
      },
      yellow: {
        bg: "bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100",
        icon: "text-yellow-600",
        border: "border-yellow-200",
        button: "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.teal;
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
