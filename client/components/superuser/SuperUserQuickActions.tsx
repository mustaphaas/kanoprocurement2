import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  Building2,
  Shield,
  Settings,
  FileText,
  BarChart3,
  Download,
  Upload,
  MessageSquare,
  Eye,
  Zap,
  Award,
  CheckCircle,
  AlertTriangle,
  Globe,
  Database,
  Calendar,
  Flag,
  RefreshCw,
  Search,
  Bell,
  Lock,
  UserCheck,
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: "system" | "mda" | "user" | "oversight" | "reporting";
  onClick: () => void;
  shortcut?: string;
  badge?: string;
  disabled?: boolean;
}

interface SuperUserQuickActionsProps {
  onCreateMDA: () => void;
  onManageUsers: () => void;
  onSystemSettings: () => void;
  onViewAuditLogs: () => void;
  onGenerateReport: () => void;
  onManageCompanies: () => void;
  onReviewNOCs: () => void;
  onSystemHealth: () => void;
  onBulkImport: () => void;
  onViewAnalytics: () => void;
  onManagePermissions: () => void;
  onBackupSystem: () => void;
}

export const SuperUserQuickActions: React.FC<SuperUserQuickActionsProps> = ({
  onCreateMDA,
  onManageUsers,
  onSystemSettings,
  onViewAuditLogs,
  onGenerateReport,
  onManageCompanies,
  onReviewNOCs,
  onSystemHealth,
  onBulkImport,
  onViewAnalytics,
  onManagePermissions,
  onBackupSystem,
}) => {
  const quickActions: QuickAction[] = [
    {
      id: "create-mda",
      title: "Create New MDA",
      description: "Add a new Ministry, Department or Agency",
      icon: Building2,
      color: "green",
      category: "mda",
      onClick: onCreateMDA,
      shortcut: "Ctrl+M",
      badge: "New",
    },
    {
      id: "manage-users",
      title: "Manage System Users",
      description: "Add, edit, or remove user accounts",
      icon: Users,
      color: "blue",
      category: "user",
      onClick: onManageUsers,
      shortcut: "Ctrl+U",
    },
    {
      id: "review-nocs",
      title: "Review NOC Requests",
      description: "Approve or reject NOC applications",
      icon: CheckCircle,
      color: "orange",
      category: "oversight",
      onClick: onReviewNOCs,
      badge: "15 Pending",
    },
    {
      id: "manage-companies",
      title: "Company Management",
      description: "Approve/suspend company registrations",
      icon: Shield,
      color: "purple",
      category: "oversight",
      onClick: onManageCompanies,
      badge: "4 Pending",
    },
    {
      id: "system-settings",
      title: "System Settings",
      description: "Configure global system parameters",
      icon: Settings,
      color: "gray",
      category: "system",
      onClick: onSystemSettings,
    },
    {
      id: "view-audit-logs",
      title: "Audit Logs",
      description: "View system activity and security logs",
      icon: FileText,
      color: "indigo",
      category: "oversight",
      onClick: onViewAuditLogs,
    },
    {
      id: "system-health",
      title: "System Health Monitor",
      description: "Check system performance and status",
      icon: RefreshCw,
      color: "teal",
      category: "system",
      onClick: onSystemHealth,
    },
    {
      id: "view-analytics",
      title: "System Analytics",
      description: "View comprehensive system analytics",
      icon: BarChart3,
      color: "cyan",
      category: "reporting",
      onClick: onViewAnalytics,
    },
    {
      id: "generate-report",
      title: "Generate Reports",
      description: "Create system-wide reports",
      icon: Download,
      color: "emerald",
      category: "reporting",
      onClick: onGenerateReport,
    },
    {
      id: "bulk-import",
      title: "Bulk Data Import",
      description: "Import MDAs, users, or data in bulk",
      icon: Upload,
      color: "violet",
      category: "system",
      onClick: onBulkImport,
    },
    {
      id: "manage-permissions",
      title: "Role & Permissions",
      description: "Configure user roles and permissions",
      icon: Lock,
      color: "pink",
      category: "user",
      onClick: onManagePermissions,
    },
    {
      id: "backup-system",
      title: "System Backup",
      description: "Create system backup and restore",
      icon: Database,
      color: "yellow",
      category: "system",
      onClick: onBackupSystem,
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
    system: "System Management",
    mda: "MDA Management",
    user: "User Management",
    oversight: "Oversight & Compliance",
    reporting: "Reports & Analytics",
  };

  const categoryIcons = {
    system: Settings,
    mda: Building2,
    user: Users,
    oversight: Shield,
    reporting: BarChart3,
  };

  return (
    <Card className="w-full border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          SuperUser Quick Actions
          <span className="text-sm text-muted-foreground font-normal ml-2">
            ({quickActions.length} administrative shortcuts)
          </span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Essential administrative actions for system-wide management
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedActions).map(([category, actions]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h3>
                  <div className="h-px bg-border flex-1 ml-2" />
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
                            <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                              {action.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {action.description}
                            </p>

                            <div className="flex items-center justify-between">
                              {action.shortcut && (
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
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
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">Most Used Actions</h4>
            <span className="text-xs text-muted-foreground">Click to execute</span>
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
