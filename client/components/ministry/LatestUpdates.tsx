import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  FileCheck,
  Building2,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";

interface UpdateItem {
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
}

interface LatestUpdatesProps {
  updates: UpdateItem[];
  onUpdateClick?: (update: UpdateItem) => void;
}

export const LatestUpdates: React.FC<LatestUpdatesProps> = ({ 
  updates, 
  onUpdateClick 
}) => {
  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "noc_feedback":
        return FileCheck;
      case "tender_status":
        return Building2;
      case "contract_milestone":
        return Award;
      case "system_alert":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "urgent":
        return {
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          label: "Urgent",
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
          color: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          label: "Medium",
        };
      case "low":
        return {
          color: "bg-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: "Low",
        };
      default:
        return {
          color: "bg-gray-500",
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          label: "Normal",
        };
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "rejected":
        return AlertCircle;
      case "clarification_needed":
        return Info;
      case "completed":
        return CheckCircle;
      case "pending":
        return Clock;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "clarification_needed":
        return "text-blue-600";
      case "pending":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const sortedUpdates = [...updates].sort((a, b) => {
    // Sort by priority first, then by timestamp
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Latest Updates & Notifications
          {updates.filter(u => u.actionRequired).length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {updates.filter(u => u.actionRequired).length} Action Required
            </Badge>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Real-time updates on NOC feedback, tender status, and system alerts
        </div>
      </CardHeader>
      <CardContent>
        {sortedUpdates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent updates</p>
            <p className="text-sm">Check back later for new notifications</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedUpdates.map((update) => {
              const IconComponent = getUpdateIcon(update.type);
              const priorityConfig = getPriorityConfig(update.priority);
              const StatusIcon = getStatusIcon(update.status);
              const statusColor = getStatusColor(update.status);

              return (
                <div
                  key={update.id}
                  className={`relative p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    update.actionRequired
                      ? "bg-red-50 border-l-red-500 hover:bg-red-100"
                      : update.priority === "urgent"
                        ? "bg-red-50 border-l-red-500 hover:bg-red-100"
                        : update.priority === "high"
                          ? "bg-orange-50 border-l-orange-500 hover:bg-orange-100"
                          : "bg-gray-50 border-l-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => onUpdateClick?.(update)}
                >
                  {/* Priority Indicator */}
                  {(update.priority === "urgent" || update.priority === "high") && (
                    <div className="absolute top-2 right-2">
                      <div className={`w-3 h-3 rounded-full ${priorityConfig.color} animate-pulse`} />
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Update Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        update.actionRequired
                          ? "bg-red-100"
                          : update.priority === "urgent"
                            ? "bg-red-100"
                            : update.priority === "high"
                              ? "bg-orange-100"
                              : "bg-blue-100"
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${
                          update.actionRequired
                            ? "text-red-600"
                            : update.priority === "urgent"
                              ? "text-red-600"
                              : update.priority === "high"
                                ? "text-orange-600"
                                : "text-blue-600"
                        }`}
                      />
                    </div>

                    {/* Update Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {update.title}
                          {update.actionRequired && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Action Required
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {update.status && StatusIcon && (
                            <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                          )}
                          <Badge
                            variant="outline"
                            className={`text-xs ${priorityConfig.bgColor} ${priorityConfig.borderColor} ${priorityConfig.textColor}`}
                          >
                            {priorityConfig.label}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {update.description}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(update.timestamp)}
                          </div>
                          {update.relatedType && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {update.relatedType}
                            </div>
                          )}
                        </div>

                        <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                          View Details
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors">
              Action Required ({updates.filter(u => u.actionRequired).length})
            </button>
            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
              NOC Updates ({updates.filter(u => u.type === "noc_feedback").length})
            </button>
            <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
              Tender Status ({updates.filter(u => u.type === "tender_status").length})
            </button>
            <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
              Contracts ({updates.filter(u => u.type === "contract_milestone").length})
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
