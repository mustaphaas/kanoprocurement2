import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  Target,
  Calendar,
  CheckCircle,
} from "lucide-react";

interface BudgetData {
  month: string;
  budget: number;
  expenditure: number;
  variance: number;
}

interface TenderStatusData {
  status: string;
  count: number;
  value: number;
  color: string;
}

interface TimelineData {
  category: string;
  averageDays: number;
  target: number;
  status: "good" | "warning" | "critical";
}

interface NOCProcessingData {
  month: string;
  averageTime: number;
  approved: number;
  rejected: number;
}

interface PerformanceAnalyticsProps {
  budgetData: BudgetData[];
  tenderStatusData: TenderStatusData[];
  timelineData: TimelineData[];
  nocProcessingData: NOCProcessingData[];
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  budgetData,
  tenderStatusData,
  timelineData,
  nocProcessingData,
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `₦${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `₦${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `₦${(value / 1e3).toFixed(1)}K`;
    }
    return `₦${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name.includes("Budget") ||
              entry.name.includes("Expenditure")
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.status}</p>
          <p className="text-blue-600">Count: {data.count}</p>
          <p className="text-green-600">Value: {formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Budget vs Expenditure Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Budget vs. Expenditure Analysis
          </CardTitle>
          <div className="text-sm text-gray-600">
            Monthly comparison of allocated budget against actual expenditure
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="budget"
                  name="Budget"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="expenditure"
                  name="Expenditure"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Summary */}
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  budgetData.reduce((sum, item) => sum + item.budget, 0),
                )}
              </div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  budgetData.reduce((sum, item) => sum + item.expenditure, 0),
                )}
              </div>
              <div className="text-sm text-gray-600">Total Expenditure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(
                  (budgetData.reduce((sum, item) => sum + item.expenditure, 0) /
                    budgetData.reduce((sum, item) => sum + item.budget, 0)) *
                  100
                ).toFixed(1)}
                %
              </div>
              <div className="text-sm text-gray-600">Utilization Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenders by Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Tenders by Status
          </CardTitle>
          <div className="text-sm text-gray-600">
            Distribution of tenders across different stages
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tenderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {tenderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Legend */}
          <div className="mt-4 space-y-2">
            {tenderStatusData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.status}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600">{item.count} tenders</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Timelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Evaluation Timelines
          </CardTitle>
          <div className="text-sm text-gray-600">
            Average processing time vs. targets
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineData.map((item, index) => {
              const percentage = (item.averageDays / item.target) * 100;
              const isOverTarget = percentage > 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {item.averageDays} / {item.target} days
                      </span>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.status === "good"
                            ? "bg-green-500"
                            : item.status === "warning"
                              ? "bg-orange-500"
                              : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOverTarget
                          ? "bg-red-500"
                          : percentage > 80
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage.toFixed(1)}% of target time
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {timelineData.filter((item) => item.status === "good").length}
                </div>
                <div className="text-xs text-gray-600">On Target</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {
                    timelineData.filter((item) => item.status === "warning")
                      .length
                  }
                </div>
                <div className="text-xs text-gray-600">At Risk</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {
                    timelineData.filter((item) => item.status === "critical")
                      .length
                  }
                </div>
                <div className="text-xs text-gray-600">Over Target</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NOC Processing Times */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            NOC Processing Performance
          </CardTitle>
          <div className="text-sm text-gray-600">
            Monthly trends in NOC approval times and decisions
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={nocProcessingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="averageTime"
                  name="Avg Processing Time (days)"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  name="Approved"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  name="Rejected"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* NOC Summary */}
          <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {(
                  nocProcessingData.reduce(
                    (sum, item) => sum + item.averageTime,
                    0,
                  ) / nocProcessingData.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg. Processing Days</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {nocProcessingData.reduce(
                  (sum, item) => sum + item.approved,
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600">Total Approved</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">
                {nocProcessingData.reduce(
                  (sum, item) => sum + item.rejected,
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600">Total Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {(
                  (nocProcessingData.reduce(
                    (sum, item) => sum + item.approved,
                    0,
                  ) /
                    (nocProcessingData.reduce(
                      (sum, item) => sum + item.approved,
                      0,
                    ) +
                      nocProcessingData.reduce(
                        (sum, item) => sum + item.rejected,
                        0,
                      ))) *
                  100
                ).toFixed(1)}
                %
              </div>
              <div className="text-sm text-gray-600">Approval Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
