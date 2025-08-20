import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Building2,
  FileCheck,
  Award,
  DollarSign,
  TrendingUp,
  Activity,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface OverviewSummaryCardsProps {
  data: {
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
}

export const OverviewSummaryCards: React.FC<OverviewSummaryCardsProps> = ({
  data,
}) => {
  const cards = [
    {
      title: "Total Procurement Plans",
      subtitle: "Active FY 2024",
      value: data.totalProcurementPlans,
      icon: FileText,
      color: "blue",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Tenders Created",
      subtitle: "This quarter",
      value: data.tendersCreated,
      icon: Building2,
      color: "green",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Tenders Under Evaluation",
      subtitle: "Awaiting decisions",
      value: data.tendersUnderEvaluation,
      icon: Activity,
      color: "orange",
      change: "-15%",
      changeType: "negative",
    },
    {
      title: "NOC Requests",
      subtitle: `${data.nocPending} Pending • ${data.nocApproved} Approved • ${data.nocRejected} Rejected`,
      value: data.nocPending + data.nocApproved + data.nocRejected,
      icon: FileCheck,
      color: "purple",
      breakdown: {
        pending: data.nocPending,
        approved: data.nocApproved,
        rejected: data.nocRejected,
      },
    },
    {
      title: "Contracts Signed",
      subtitle: `${data.contractsActive} Active • ${data.contractsClosed} Closed`,
      value: data.contractsActive + data.contractsClosed,
      icon: Award,
      color: "indigo",
      breakdown: {
        active: data.contractsActive,
        closed: data.contractsClosed,
      },
    },
    {
      title: "Budget Utilization",
      subtitle: `${data.utilizedBudget} of ${data.totalBudget}`,
      value: `${data.budgetUtilization}%`,
      icon: DollarSign,
      color:
        data.budgetUtilization > 85
          ? "red"
          : data.budgetUtilization > 70
            ? "orange"
            : "green",
      progressBar: data.budgetUtilization,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        value: "text-blue-900",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        icon: "text-green-600",
        value: "text-green-900",
        border: "border-green-200",
      },
      orange: {
        bg: "bg-orange-50",
        icon: "text-orange-600",
        value: "text-orange-900",
        border: "border-orange-200",
      },
      purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        value: "text-purple-900",
        border: "border-purple-200",
      },
      indigo: {
        bg: "bg-indigo-50",
        icon: "text-indigo-600",
        value: "text-indigo-900",
        border: "border-indigo-200",
      },
      red: {
        bg: "bg-red-50",
        icon: "text-red-600",
        value: "text-red-900",
        border: "border-red-200",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const colors = getColorClasses(card.color);
        const IconComponent = card.icon;

        return (
          <Card
            key={index}
            className={`${colors.bg} ${colors.border} border-2 hover:shadow-lg transition-shadow`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <IconComponent className={`h-6 w-6 ${colors.icon} mr-2`} />
                    <h3 className="text-sm font-medium text-gray-700">
                      {card.title}
                    </h3>
                  </div>

                  <div className="mb-2">
                    <span className={`text-3xl font-bold ${colors.value}`}>
                      {card.value}
                    </span>
                    {card.change && (
                      <span
                        className={`ml-2 text-sm font-medium ${
                          card.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {card.change}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mb-3">{card.subtitle}</p>

                  {/* NOC Breakdown */}
                  {card.breakdown && "pending" in card.breakdown && (
                    <div className="flex space-x-3 text-xs">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                        <span className="text-yellow-700">
                          {card.breakdown.pending} Pending
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-700">
                          {card.breakdown.approved} Approved
                        </span>
                      </div>
                      <div className="flex items-center">
                        <AlertTriangle className="h-3 w-3 text-red-600 mr-1" />
                        <span className="text-red-700">
                          {card.breakdown.rejected} Rejected
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contract Breakdown */}
                  {card.breakdown && "active" in card.breakdown && (
                    <div className="flex space-x-3 text-xs">
                      <div className="flex items-center">
                        <Activity className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-700">
                          {card.breakdown.active} Active
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-gray-600 mr-1" />
                        <span className="text-gray-700">
                          {card.breakdown.closed} Closed
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Budget Progress Bar */}
                  {card.progressBar !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Budget Utilization</span>
                        <span>{card.progressBar}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            card.progressBar > 85
                              ? "bg-red-500"
                              : card.progressBar > 70
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(card.progressBar, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
