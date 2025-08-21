import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  FileCheck,
  Award,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Circle,
} from "lucide-react";

interface ProcurementStage {
  id: string;
  name: string;
  count: number;
  status: "completed" | "active" | "pending" | "delayed";
  icon: React.ComponentType<any>;
  description: string;
}

interface ProcurementLifecycleStatusProps {
  stages: {
    procurementPlans: {
      count: number;
      status: "completed" | "active" | "pending" | "delayed";
    };
    tenderManagement: {
      count: number;
      status: "completed" | "active" | "pending" | "delayed";
    };
    nocRequest: {
      count: number;
      status: "completed" | "active" | "pending" | "delayed";
    };
    contractAward: {
      count: number;
      status: "completed" | "active" | "pending" | "delayed";
    };
  };
}

export const ProcurementLifecycleStatus: React.FC<
  ProcurementLifecycleStatusProps
> = ({ stages }) => {
  const procurementStages: ProcurementStage[] = [
    {
      id: "plans",
      name: "Procurement Plans",
      count: stages.procurementPlans.count,
      status: stages.procurementPlans.status,
      icon: FileText,
      description: "Planning and budgeting phase",
    },
    {
      id: "tenders",
      name: "Tender Management",
      count: stages.tenderManagement.count,
      status: stages.tenderManagement.status,
      icon: Building2,
      description: "Tender creation and evaluation",
    },
    {
      id: "noc",
      name: "NOC Request",
      count: stages.nocRequest.count,
      status: stages.nocRequest.status,
      icon: FileCheck,
      description: "No Objection Certificate process",
    },
    {
      id: "award",
      name: "Contract Award",
      count: stages.contractAward.count,
      status: stages.contractAward.status,
      icon: Award,
      description: "Final contract awarding",
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-gradient-to-r from-emerald-500 to-teal-500",
          textColor: "text-emerald-700",
          bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
          borderColor: "border-emerald-200",
          icon: CheckCircle,
          label: "Completed",
        };
      case "active":
        return {
          color: "bg-gradient-to-r from-teal-500 to-cyan-500",
          textColor: "text-teal-700",
          bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
          borderColor: "border-teal-200",
          icon: Circle,
          label: "Active",
        };
      case "pending":
        return {
          color: "bg-gradient-to-r from-slate-400 to-gray-400",
          textColor: "text-slate-700",
          bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
          borderColor: "border-slate-200",
          icon: Clock,
          label: "Pending",
        };
      case "delayed":
        return {
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: AlertTriangle,
          label: "Delayed",
        };
      default:
        return {
          color: "bg-gradient-to-r from-slate-400 to-gray-400",
          textColor: "text-slate-700",
          bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
          borderColor: "border-slate-200",
          icon: Circle,
          label: "Unknown",
        };
    }
  };

  const getProgressPercentage = () => {
    const completed = procurementStages.filter(
      (stage) => stage.status === "completed",
    ).length;
    return (completed / procurementStages.length) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Procurement Lifecycle Status
        </CardTitle>
        <div className="text-sm text-gray-600">
          Visual progress tracker for ministry procurement workflow
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(getProgressPercentage())}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 h-4 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Workflow Stages */}
        <div className="space-y-4">
          {procurementStages.map((stage, index) => {
            const statusConfig = getStatusConfig(stage.status);
            const IconComponent = stage.icon;
            const StatusIcon = statusConfig.icon;
            const isLastStage = index === procurementStages.length - 1;

            return (
              <div key={stage.id} className="relative">
                {/* Connection Line */}
                {!isLastStage && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300 z-0" />
                )}

                {/* Stage Card */}
                <div
                  className={`relative z-10 flex items-start gap-4 p-5 rounded-xl border-2 ${statusConfig.bgColor} ${statusConfig.borderColor} transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm`}
                >
                  {/* Stage Icon */}
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${statusConfig.color} shadow-lg`}
                  >
                    <IconComponent className="h-7 w-7 text-white" />
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {stage.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {stage.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {stage.count}
                          </div>
                          <div className="text-xs text-gray-600">Items</div>
                        </div>

                        {stage.status === "active" && (
                          <div className="flex items-center gap-2 text-sm text-teal-600">
                            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                            In Progress
                          </div>
                        )}

                        {stage.status === "delayed" && (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Requires Attention
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg ${
                          stage.status === "completed"
                            ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200"
                            : stage.status === "active"
                              ? "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 hover:from-teal-200 hover:to-cyan-200"
                              : stage.status === "delayed"
                                ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-700 hover:from-red-200 hover:to-pink-200"
                                : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 hover:from-slate-200 hover:to-gray-200"
                        }`}
                      >
                        {stage.status === "completed" ? "View" : "Manage"}
                      </button>
                    </div>
                  </div>

                  {/* Arrow to Next Stage */}
                  {!isLastStage && (
                    <div className="flex-shrink-0 self-center">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Summary Stats */}
        <div className="mt-6 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-600">
                {
                  procurementStages.filter((s) => s.status === "completed")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600 font-medium">Completed</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-teal-200">
              <div className="text-2xl font-bold text-teal-600">
                {procurementStages.filter((s) => s.status === "active").length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Active</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
              <div className="text-2xl font-bold text-slate-600">
                {procurementStages.filter((s) => s.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Pending</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {procurementStages.filter((s) => s.status === "delayed").length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Delayed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
