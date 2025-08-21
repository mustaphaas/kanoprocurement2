import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Calendar,
  FileText,
  Users,
  AlertCircle,
  TrendingUp,
  Flag,
  ExternalLink,
  Download,
  Filter,
} from "lucide-react";

interface ComplianceIssue {
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
}

interface COIStatus {
  committeeId: string;
  committeeName: string;
  totalMembers: number;
  clearedMembers: number;
  pendingMembers: number;
  flaggedMembers: number;
  lastReviewDate: string;
  nextReviewDate: string;
  status: "compliant" | "warning" | "critical";
}

interface UpcomingDeadline {
  id: string;
  type: "tender_closing" | "contract_expiry" | "review_due" | "compliance_check";
  title: string;
  description: string;
  dueDate: string;
  daysRemaining: number;
  priority: "low" | "medium" | "high" | "urgent";
  actionRequired: boolean;
  relatedId: string;
}

interface AuditComplianceSnapshotProps {
  complianceIssues: ComplianceIssue[];
  coiStatuses: COIStatus[];
  upcomingDeadlines: UpcomingDeadline[];
  onIssueClick?: (issue: ComplianceIssue) => void;
  onDeadlineClick?: (deadline: UpcomingDeadline) => void;
  onCOIClick?: (status: COIStatus) => void;
}

export const AuditComplianceSnapshot: React.FC<AuditComplianceSnapshotProps> = ({
  complianceIssues,
  coiStatuses,
  upcomingDeadlines,
  onIssueClick,
  onDeadlineClick,
  onCOIClick,
}) => {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Critical",
        };
      case "high":
        return {
          color: "bg-orange-500",
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          label: "High",
        };
      case "medium":
        return {
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          label: "Medium",
        };
      case "low":
        return {
          color: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          label: "Low",
        };
      default:
        return {
          color: "bg-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: "Unknown",
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return CheckCircle;
      case "in_progress":
        return Clock;
      case "escalated":
        return Flag;
      case "open":
      default:
        return AlertCircle;
    }
  };

  const formatDaysRemaining = (days: number) => {
    if (days < 0) return "Overdue";
    if (days === 0) return "Due Today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const getPriorityColor = (priority: string, daysRemaining: number) => {
    if (daysRemaining < 0) return "text-red-600 bg-red-50";
    if (daysRemaining === 0) return "text-red-600 bg-red-50";
    
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-blue-600 bg-blue-50";
      case "low":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCOIStatusConfig = (status: string) => {
    switch (status) {
      case "compliant":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: CheckCircle,
        };
      case "warning":
        return {
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          icon: AlertTriangle,
        };
      case "critical":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: AlertCircle,
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: Shield,
        };
    }
  };

  const criticalIssues = complianceIssues.filter(issue => issue.severity === "critical" || issue.severity === "high");
  const overdueDeadlines = upcomingDeadlines.filter(deadline => deadline.daysRemaining < 0);
  const urgentDeadlines = upcomingDeadlines.filter(deadline => deadline.daysRemaining >= 0 && deadline.daysRemaining <= 3);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{criticalIssues.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                <p className="text-2xl font-bold text-orange-600">{overdueDeadlines.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Deadlines</p>
                <p className="text-2xl font-bold text-blue-600">{urgentDeadlines.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">COI Compliance</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((coiStatuses.filter(s => s.status === "compliant").length / coiStatuses.length) * 100)}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Flagged Compliance Issues
              {criticalIssues.length > 0 && (
                <Badge variant="destructive">{criticalIssues.length} Critical</Badge>
              )}
            </CardTitle>
            <div className="text-sm text-gray-600">
              Items requiring immediate attention or review
            </div>
          </CardHeader>
          <CardContent>
            {complianceIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <p>No compliance issues found</p>
                <p className="text-sm">All processes are compliant</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {complianceIssues.slice(0, 5).map((issue) => {
                  const severityConfig = getSeverityConfig(issue.severity);
                  const StatusIcon = getStatusIcon(issue.status);

                  return (
                    <div
                      key={issue.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${severityConfig.bgColor} ${severityConfig.borderColor}`}
                      onClick={() => onIssueClick?.(issue)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {issue.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs ${severityConfig.bgColor} ${severityConfig.borderColor} ${severityConfig.textColor}`}
                            >
                              {severityConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {issue.relatedTitle}
                            </span>
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`h-3 w-3 ${severityConfig.textColor}`} />
                              <span className={`text-xs ${severityConfig.textColor}`}>
                                {issue.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {complianceIssues.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View All Issues ({complianceIssues.length})
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* COI Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              COI Committee Status
            </CardTitle>
            <div className="text-sm text-gray-600">
              Conflict of Interest status across evaluation committees
            </div>
          </CardHeader>
          <CardContent>
            {coiStatuses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No committees configured</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {coiStatuses.map((status) => {
                  const statusConfig = getCOIStatusConfig(status.status);
                  const StatusIcon = statusConfig.icon;
                  const compliancePercentage = Math.round((status.clearedMembers / status.totalMembers) * 100);

                  return (
                    <div
                      key={status.committeeId}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${statusConfig.bgColor} ${statusConfig.borderColor}`}
                      onClick={() => onCOIClick?.(status)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{status.committeeName}</h4>
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                          <span className={`text-xs font-medium ${statusConfig.color}`}>
                            {compliancePercentage}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                        <div className="text-center">
                          <div className="font-medium text-green-600">{status.clearedMembers}</div>
                          <div>Cleared</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-orange-600">{status.pendingMembers}</div>
                          <div>Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">{status.flaggedMembers}</div>
                          <div>Flagged</div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${compliancePercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Upcoming Deadlines
            {urgentDeadlines.length > 0 && (
              <Badge variant="destructive">{urgentDeadlines.length} Urgent</Badge>
            )}
          </CardTitle>
          <div className="text-sm text-gray-600">
            Critical dates for tender closings, contract expiries, and reviews
          </div>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingDeadlines.slice(0, 8).map((deadline) => {
                const priorityColor = getPriorityColor(deadline.priority, deadline.daysRemaining);
                const isOverdue = deadline.daysRemaining < 0;
                const isUrgent = deadline.daysRemaining >= 0 && deadline.daysRemaining <= 3;

                return (
                  <div
                    key={deadline.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isOverdue
                        ? "bg-red-50 border-red-200"
                        : isUrgent
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                    }`}
                    onClick={() => onDeadlineClick?.(deadline)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {deadline.title}
                          </h4>
                          {deadline.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                          {deadline.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${priorityColor}`}>
                            {formatDaysRemaining(deadline.daysRemaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {upcomingDeadlines.length > 8 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Deadlines ({upcomingDeadlines.length})
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
