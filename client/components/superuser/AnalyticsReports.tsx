import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award, 
  Download,
  Filter,
  Eye,
  Building2,
  Star,
  TrendingDown
} from "lucide-react";

interface AnalyticsData {
  totalSpend: string;
  spendByMDA: Array<{
    mda: string;
    spend: string;
    percentage: number;
  }>;
  vendorPerformance: Array<{
    vendor: string;
    contractsWon: number;
    completionRate: number;
    averageRating: number;
  }>;
  mdaPerformance: Array<{
    mda: string;
    timeliness: number;
    compliance: number;
    efficiency: number;
    status: "high" | "medium" | "low";
  }>;
}

interface AnalyticsReportsProps {
  data: AnalyticsData;
  onDrillDown?: (mda: string) => void;
}

export function AnalyticsReports({ data, onDrillDown }: AnalyticsReportsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "high": return "bg-green-100 text-green-800 border-green-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Prepare chart data
  const spendData = data.spendByMDA.map(item => ({
    name: item.mda.length > 15 ? item.mda.substring(0, 15) + '...' : item.mda,
    fullName: item.mda,
    spend: parseFloat(item.spend.replace(/[₦,]/g, '')),
    percentage: item.percentage
  }));

  const performanceData = data.mdaPerformance.map(item => ({
    name: item.mda.length > 15 ? item.mda.substring(0, 15) + '...' : item.mda,
    fullName: item.mda,
    timeliness: item.timeliness,
    compliance: item.compliance,
    efficiency: item.efficiency
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Calculate trends
  const avgCompliance = data.mdaPerformance.reduce((sum, item) => sum + item.compliance, 0) / data.mdaPerformance.length;
  const avgTimeliness = data.mdaPerformance.reduce((sum, item) => sum + item.timeliness, 0) / data.mdaPerformance.length;
  const avgEfficiency = data.mdaPerformance.reduce((sum, item) => sum + item.efficiency, 0) / data.mdaPerformance.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Reports</h2>
          <p className="text-muted-foreground">Comprehensive analysis and performance insights across all MDAs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.totalSpend}</div>
            <p className="text-xs text-muted-foreground">
              Across all procurement activities
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Compliance</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgCompliance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              System-wide compliance rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Timeliness</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgTimeliness.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              On-time delivery rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Efficiency</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Process efficiency score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Spend Analysis by MDA</CardTitle>
            <CardDescription>Procurement value distribution across ministries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value) => [`₦${value.toLocaleString()}`, 'Spend']}
                  labelFormatter={(label) => {
                    const item = spendData.find(d => d.name === label);
                    return item ? item.fullName : label;
                  }}
                />
                <Bar dataKey="spend" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Spend Distribution</CardTitle>
            <CardDescription>Percentage breakdown of procurement spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="percentage"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {spendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* MDA Performance Analysis */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">MDA Performance Trends</CardTitle>
              <CardDescription>Comparative analysis of timeliness, compliance, and efficiency</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(label) => {
                  const item = performanceData.find(d => d.name === label);
                  return item ? item.fullName : label;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="timeliness" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.6}
                name="Timeliness"
              />
              <Area 
                type="monotone" 
                dataKey="compliance" 
                stackId="2" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.6}
                name="Compliance"
              />
              <Area 
                type="monotone" 
                dataKey="efficiency" 
                stackId="3" 
                stroke="#ffc658" 
                fill="#ffc658" 
                fillOpacity={0.6}
                name="Efficiency"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing vs Underperforming MDAs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-green-800">Top Performing MDAs</CardTitle>
                <CardDescription className="text-green-600">Highest efficiency and compliance scores</CardDescription>
              </div>
              <Star className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.mdaPerformance
                .filter(mda => mda.status === "high")
                .slice(0, 5)
                .map((mda, index) => (
                  <div 
                    key={mda.mda} 
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <span className="text-sm font-semibold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">{mda.mda}</h4>
                        <p className="text-xs text-green-600">
                          Efficiency: {mda.efficiency}% | Compliance: {mda.compliance}%
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDrillDown?.(mda.mda)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Underperforming */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-red-800">Underperforming MDAs</CardTitle>
                <CardDescription className="text-red-600">Require attention and improvement</CardDescription>
              </div>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.mdaPerformance
                .filter(mda => mda.status === "low")
                .slice(0, 5)
                .map((mda, index) => (
                  <div 
                    key={mda.mda} 
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <span className="text-sm font-semibold text-red-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-800">{mda.mda}</h4>
                        <p className="text-xs text-red-600">
                          Efficiency: {mda.efficiency}% | Compliance: {mda.compliance}%
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDrillDown?.(mda.mda)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance Summary */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Vendor Performance Summary</CardTitle>
              <CardDescription>Top vendors across all procurement activities</CardDescription>
            </div>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.vendorPerformance.slice(0, 5).map((vendor, index) => (
              <div 
                key={vendor.vendor} 
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                    <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{vendor.vendor}</h4>
                    <p className="text-sm text-muted-foreground">
                      {vendor.contractsWon} contracts won
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">{vendor.completionRate}%</div>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-lg font-semibold text-foreground">{vendor.averageRating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
