import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Shield,
  Download,
  Send,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Award,
  Building,
  FileCheck,
  UserCheck,
  Activity,
  Flag,
} from "lucide-react";

// Mock data structures based on existing patterns
interface ReportKPI {
  totalTenders: number;
  totalContracts: number;
  totalNOCRequests: number;
  avgEvaluationTime: number;
  complianceRate: number;
}

interface TenderReport {
  id: string;
  title: string;
  status: "draft" | "active" | "evaluating" | "awarded" | "cancelled";
  bidders: number;
  evaluationDate: string;
  nocStatus: "submitted" | "approved" | "pending" | "rejected";
  department: string;
}

interface ContractReport {
  id: string;
  vendorName: string;
  value: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "delayed" | "terminated";
  performance: "excellent" | "good" | "satisfactory" | "poor";
}

interface NOCReport {
  tenderId: string;
  tenderTitle: string;
  submittedDate: string;
  status: "submitted" | "approved" | "pending" | "rejected";
  daysDelayed: number;
}

interface UserReport {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  lastLogin: string;
}

interface CommitteeReport {
  id: string;
  tenderId: string;
  members: number;
  assignedRoles: string[];
  status: "assigned" | "evaluating" | "completed";
}

interface AuditActivity {
  id: string;
  activity: string;
  user: string;
  timestamp: string;
  type:
    | "tender_created"
    | "evaluation_submitted"
    | "noc_requested"
    | "contract_signed";
  status: "normal" | "flagged" | "delayed";
}

const MinistryReports: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30");

  // Mock data
  const reportKPIs: ReportKPI = {
    totalTenders: 156,
    totalContracts: 89,
    totalNOCRequests: 134,
    avgEvaluationTime: 14.5,
    complianceRate: 92.3,
  };

  const tenderReports: TenderReport[] = [
    {
      id: "KS-2024-001",
      title: "Medical Equipment Procurement",
      status: "evaluating",
      bidders: 8,
      evaluationDate: "2024-01-15",
      nocStatus: "approved",
      department: "Health",
    },
    {
      id: "KS-2024-002",
      title: "Road Construction - Kano-Zaria",
      status: "active",
      bidders: 12,
      evaluationDate: "2024-01-20",
      nocStatus: "pending",
      department: "Works",
    },
    {
      id: "KS-2024-003",
      title: "School Building Renovation",
      status: "awarded",
      bidders: 6,
      evaluationDate: "2024-01-10",
      nocStatus: "approved",
      department: "Education",
    },
  ];

  const contractReports: ContractReport[] = [
    {
      id: "CT-2024-001",
      vendorName: "Greenfield Construction Ltd",
      value: 45000000,
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      status: "active",
      performance: "good",
    },
    {
      id: "CT-2024-002",
      vendorName: "Medtech Solutions",
      value: 12000000,
      startDate: "2023-12-01",
      endDate: "2024-03-31",
      status: "completed",
      performance: "excellent",
    },
  ];

  const nocReports: NOCReport[] = [
    {
      tenderId: "KS-2024-004",
      tenderTitle: "IT Infrastructure Upgrade",
      submittedDate: "2024-01-05",
      status: "pending",
      daysDelayed: 7,
    },
    {
      tenderId: "KS-2024-005",
      tenderTitle: "Security Systems Installation",
      submittedDate: "2024-01-03",
      status: "pending",
      daysDelayed: 9,
    },
  ];

  const userReports: UserReport[] = [
    {
      id: "U001",
      name: "Dr. Amina Hassan",
      role: "Procurement Officer",
      department: "Health",
      status: "active",
      lastLogin: "2024-01-15 14:30",
    },
    {
      id: "U002",
      name: "Eng. Ibrahim Sule",
      role: "Technical Evaluator",
      department: "Works",
      status: "active",
      lastLogin: "2024-01-15 09:15",
    },
  ];

  const committeeReports: CommitteeReport[] = [
    {
      id: "EC-001",
      tenderId: "KS-2024-001",
      members: 5,
      assignedRoles: ["Technical Lead", "Financial Analyst", "Legal Advisor"],
      status: "evaluating",
    },
    {
      id: "EC-002",
      tenderId: "KS-2024-002",
      members: 4,
      assignedRoles: ["Technical Lead", "Financial Analyst"],
      status: "assigned",
    },
  ];

  const auditActivities: AuditActivity[] = [
    {
      id: "A001",
      activity: "Tender Created: Medical Equipment Procurement",
      user: "Dr. Amina Hassan",
      timestamp: "2024-01-15 10:30",
      type: "tender_created",
      status: "normal",
    },
    {
      id: "A002",
      activity: "NOC Requested: Road Construction Project",
      user: "Eng. Ibrahim Sule",
      timestamp: "2024-01-14 16:45",
      type: "noc_requested",
      status: "delayed",
    },
  ];

  // Chart data
  const tendersByDepartment = [
    { department: "Health", count: 45 },
    { department: "Education", count: 38 },
    { department: "Works", count: 32 },
    { department: "Agriculture", count: 25 },
    { department: "Environment", count: 16 },
  ];

  const contractsByStatus = [
    { status: "Active", count: 45, color: "#10b981" },
    { status: "Completed", count: 32, color: "#3b82f6" },
    { status: "Delayed", count: 8, color: "#f59e0b" },
    { status: "Terminated", count: 4, color: "#ef4444" },
  ];

  const monthlySpend = [
    { month: "Aug", amount: 120000000 },
    { month: "Sep", amount: 145000000 },
    { month: "Oct", amount: 135000000 },
    { month: "Nov", amount: 160000000 },
    { month: "Dec", amount: 150000000 },
    { month: "Jan", amount: 175000000 },
  ];

  const topContracts = contractReports
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const nocSummary = {
    submitted: nocReports.length + 45,
    approved: 38,
    pending: nocReports.filter((n) => n.status === "pending").length + 12,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      delayed: "bg-yellow-100 text-yellow-800",
      terminated: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      evaluating: "bg-orange-100 text-orange-800",
      awarded: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      normal: "bg-green-100 text-green-800",
      flagged: "bg-red-100 text-red-800",
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      satisfactory: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToExcel = () => {
    // Mock export function
    console.log("Exporting to Excel...");
  };

  const exportToPDF = () => {
    // Mock export function
    console.log("Exporting to PDF...");
  };

  const sendMonthlySummary = () => {
    // Mock send function
    console.log("Sending monthly summary to BPP...");
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-cyan-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-cyan-800 to-blue-800 bg-clip-text text-transparent">
                    Ministry Reports & Analytics
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Comprehensive analytics and reporting dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">
                    System Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={exportToExcel}
                variant="outline"
                className="flex items-center gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 shadow-sm"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="flex items-center gap-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 shadow-sm"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                onClick={sendMonthlySummary}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Send className="h-4 w-4" />
                Send Monthly Summary
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-cyan-100 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Tenders Created
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {reportKPIs.totalTenders}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +12% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Contracts Awarded
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {reportKPIs.totalContracts}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +8% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total NOC Requests
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {reportKPIs.totalNOCRequests}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +5% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Avg Evaluation Time
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {reportKPIs.avgEvaluationTime} days
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600 font-medium">
                +2 days from target
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Compliance Rate
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {reportKPIs.complianceRate}%
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                Above target (90%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Colorful Tabs Navigation */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-cyan-100 shadow-lg p-2">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6 bg-transparent gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-cyan-50 border border-transparent data-[state=active]:border-cyan-200"
            >
              <Activity className="h-4 w-4" />
              <span className="font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="tenders"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-emerald-50 border border-transparent data-[state=active]:border-emerald-200"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Tenders</span>
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-50 border border-transparent data-[state=active]:border-amber-200"
            >
              <Award className="h-4 w-4" />
              <span className="font-medium">Contracts</span>
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-green-50 border border-transparent data-[state=active]:border-green-200"
            >
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Financial</span>
            </TabsTrigger>
            <TabsTrigger
              value="noc"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 border border-transparent data-[state=active]:border-purple-200"
            >
              <FileCheck className="h-4 w-4" />
              <span className="font-medium">NOC Reports</span>
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-rose-50 border border-transparent data-[state=active]:border-rose-200"
            >
              <Shield className="h-4 w-4" />
              <span className="font-medium">Audit & Compliance</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border border-cyan-100 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-cyan-600/5 to-blue-600/5 border-b border-cyan-100">
                <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  <BarChart className="h-5 w-5 text-cyan-600" />
                  Tenders by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={tendersByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border border-cyan-100 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-cyan-600/5 to-blue-600/5 border-b border-cyan-100">
                <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  <PieChart className="h-5 w-5 text-cyan-600" />
                  Contracts by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contractsByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {contractsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tenders Tab */}
        <TabsContent value="tenders" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="evaluating">Evaluating</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tender Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tender ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bidders</TableHead>
                    <TableHead>Evaluation Date</TableHead>
                    <TableHead>NOC Status</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenderReports.map((tender) => (
                    <TableRow key={tender.id}>
                      <TableCell className="font-medium">{tender.id}</TableCell>
                      <TableCell>{tender.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(tender.status)}>
                          {tender.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tender.bidders}</TableCell>
                      <TableCell>{tender.evaluationDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(tender.nocStatus)}>
                          {tender.nocStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{tender.department}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Contract Spend Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlySpend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₦${value / 1000000}M`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contract Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Excellent</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Good</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">35%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Satisfactory</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: "15%" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">15%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Poor</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: "5%" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contract Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractReports.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.id}
                      </TableCell>
                      <TableCell>{contract.vendorName}</TableCell>
                      <TableCell>{formatCurrency(contract.value)}</TableCell>
                      <TableCell>{contract.startDate}</TableCell>
                      <TableCell>{contract.endDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.performance)}>
                          {contract.performance}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Procurement Spend
                    </p>
                    <p className="text-2xl font-bold text-blue-600">₦2.4B</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Budget Utilization
                    </p>
                    <p className="text-2xl font-bold text-green-600">78.5%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Remaining Budget
                    </p>
                    <p className="text-2xl font-bold text-orange-600">₦659M</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Highest-Value Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.id}
                      </TableCell>
                      <TableCell>{contract.vendorName}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(contract.value)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.performance)}>
                          {contract.performance}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOC Reports Tab */}
        <TabsContent value="noc" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="shadow-md border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      NOCs Submitted
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {nocSummary.submitted}
                    </p>
                  </div>
                  <FileCheck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      NOCs Approved
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {nocSummary.approved}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      NOCs Pending
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {nocSummary.pending}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Tenders with Delayed NOC Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tender ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Days Delayed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nocReports.map((noc) => (
                    <TableRow key={noc.tenderId}>
                      <TableCell className="font-medium">
                        {noc.tenderId}
                      </TableCell>
                      <TableCell>{noc.tenderTitle}</TableCell>
                      <TableCell>{noc.submittedDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(noc.status)}>
                          {noc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          {noc.daysDelayed} days
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit & Compliance Tab */}
        <TabsContent value="audit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ministry Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userReports.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Evaluation Committees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Committee ID</TableHead>
                      <TableHead>Tender ID</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {committeeReports.map((committee) => (
                      <TableRow key={committee.id}>
                        <TableCell className="font-medium">
                          {committee.id}
                        </TableCell>
                        <TableCell>{committee.tenderId}</TableCell>
                        <TableCell>{committee.members}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(committee.status)}>
                            {committee.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Audit Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.activity}</TableCell>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {activity.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status === "flagged" && (
                            <Flag className="h-3 w-3 mr-1" />
                          )}
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MinistryReports;
