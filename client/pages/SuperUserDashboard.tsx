import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  FileText,
  LogOut,
  Bell,
  Search,
  Calendar,
  BarChart3,
  TrendingUp,
  Globe,
  Shield,
  Settings,
  AlertTriangle,
  Clock,
  DollarSign,
  Award,
  Activity,
  Database,
  MessageSquare,
  UserCheck,
  Ban,
  Archive,
  ChevronDown,
  PieChart,
  LineChart,
  Target,
  Zap,
  Brain,
  Star,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  Monitor,
  Plus,
  Edit,
  Upload,
  Send,
  ClipboardList,
  Gavel,
  FileCheck,
  Mail,
  Play,
  Pause,
  CheckCircle2,
  MessageCircle,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  TrendingDown,
  ExternalLink,
  Flag,
  Bookmark,
  Copy,
  Trash2,
  MoreHorizontal
} from "lucide-react";

type ActiveTab =
  | "dashboard"
  | "companies"
  | "tenders"
  | "create-tender"
  | "manage-tenders"
  | "tender-evaluation"
  | "tender-awards"
  | "vendor-performance"
  | "users"
  | "reports"
  | "ocds"
  | "ai-insights"
  | "company-status"
  | "audit-logs"
  | "settings"
  | "feedback";

interface DashboardStats {
  newRegistrationsPending: number;
  activeTenders: number;
  upcomingDeadlines: number;
  awardedContractsToday: number;
  awardedContractsWeek: number;
  awardedContractsMonth: number;
  totalContractValue: string;
}

interface Company {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  status: "Active" | "Suspended" | "Blacklisted";
  registrationDate: string;
  lastActivity: string;
  suspensionReason?: string;
  blacklistReason?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  details: string;
}

interface AIRecommendation {
  id: string;
  type: "company" | "compliance" | "optimization";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "new" | "reviewed" | "implemented";
}

interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  ministry: string;
  estimatedValue: string;
  status: "Draft" | "Published" | "Closed" | "Evaluated" | "Awarded" | "Cancelled";
  publishDate: string;
  closeDate: string;
  openDate?: string;
  awardDate?: string;
  awardedCompany?: string;
  awardAmount?: string;
  bidsReceived: number;
  ocdsReleased: boolean;
  addendaCount: number;
  evaluationScore?: number;
  procuringEntity: string;
}

interface TenderEvaluation {
  id: string;
  tenderId: string;
  companyId: string;
  companyName: string;
  bidAmount: string;
  technicalScore: number;
  financialScore: number;
  totalScore: number;
  comments: string;
  evaluatedBy: string;
  evaluatedDate: string;
  status: "Pending" | "Completed" | "Flagged";
  flagReason?: string;
}

interface VendorPerformance {
  id: string;
  contractId: string;
  tenderId: string;
  companyId: string;
  companyName: string;
  projectTitle: string;
  contractValue: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  milestones: Milestone[];
  overallScore: number;
  qualityScore: number;
  timelinessScore: number;
  budgetCompliance: number;
  issues: Issue[];
  status: "Active" | "Completed" | "Delayed" | "Terminated";
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  expectedDate: string;
  actualDate?: string;
  status: "Pending" | "Completed" | "Delayed";
  completionPercentage: number;
  notes?: string;
  documents: string[];
}

interface Issue {
  id: string;
  type: "Quality" | "Timeline" | "Budget" | "Compliance" | "Other";
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  reportedDate: string;
  resolvedDate?: string;
  status: "Open" | "In Progress" | "Resolved";
  actionTaken?: string;
}

interface TenderForm {
  title: string;
  description: string;
  category: string;
  ministry: string;
  procuringEntity: string;
  estimatedValue: string;
  currency: string;
  publishDate: string;
  closeDate: string;
  openDate: string;
  eligibilityCriteria: string;
  technicalRequirements: string;
  evaluationCriteria: string;
  contractDuration: string;
  deliveryLocation: string;
  paymentTerms: string;
  // OCDS Integration fields
  ocdsId: string;
  procurementMethod: string;
  procurementCategory: string;
  mainProcurementCategory: string;
  additionalProcurementCategories: string[];
}

export default function SuperUserDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [tenderEvaluations, setTenderEvaluations] = useState<TenderEvaluation[]>([]);
  const [vendorPerformances, setVendorPerformances] = useState<VendorPerformance[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showCreateTenderModal, setShowCreateTenderModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [tenderForm, setTenderForm] = useState<TenderForm>({
    title: "",
    description: "",
    category: "",
    ministry: "",
    procuringEntity: "",
    estimatedValue: "",
    currency: "NGN",
    publishDate: "",
    closeDate: "",
    openDate: "",
    eligibilityCriteria: "",
    technicalRequirements: "",
    evaluationCriteria: "",
    contractDuration: "",
    deliveryLocation: "",
    paymentTerms: "",
    ocdsId: "",
    procurementMethod: "",
    procurementCategory: "",
    mainProcurementCategory: "",
    additionalProcurementCategories: []
  });
  const navigate = useNavigate();

  const dashboardStats: DashboardStats = {
    newRegistrationsPending: 12,
    activeTenders: 47,
    upcomingDeadlines: 8,
    awardedContractsToday: 3,
    awardedContractsWeek: 15,
    awardedContractsMonth: 68,
    totalContractValue: "₦15.7B"
  };

  // Mock data initialization
  useEffect(() => {
    const mockCompanies: Company[] = [
      {
        id: "1",
        companyName: "Northern Construction Ltd",
        contactPerson: "Ahmad Mahmoud",
        email: "ahmad@northernconstruction.com",
        status: "Active",
        registrationDate: "2024-01-15",
        lastActivity: "2024-01-20"
      },
      {
        id: "2",
        companyName: "Sahel Medical Supplies",
        contactPerson: "Fatima Yusuf",
        email: "fatima@sahelmedical.com",
        status: "Suspended",
        registrationDate: "2024-01-14",
        lastActivity: "2024-01-18",
        suspensionReason: "Expired Tax Clearance Certificate"
      },
      {
        id: "3",
        companyName: "TechSolutions Nigeria",
        contactPerson: "Ibrahim Hassan",
        email: "ibrahim@techsolutions.ng",
        status: "Active",
        registrationDate: "2024-01-13",
        lastActivity: "2024-01-22"
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: "1",
        timestamp: "2024-01-22 14:30:00",
        user: "SuperUser",
        action: "Company Approved",
        entity: "TechSolutions Nigeria",
        details: "Company registration approved after document verification"
      },
      {
        id: "2",
        timestamp: "2024-01-22 13:15:00",
        user: "Admin",
        action: "Document Upload",
        entity: "Northern Construction Ltd",
        details: "New tax clearance certificate uploaded"
      },
      {
        id: "3",
        timestamp: "2024-01-22 11:45:00",
        user: "SuperUser",
        action: "Tender Created",
        entity: "KS-2024-015",
        details: "New tender published: Hospital Equipment Supply"
      }
    ];

    const mockAIRecommendations: AIRecommendation[] = [
      {
        id: "1",
        type: "company",
        title: "High-performing companies for Healthcare Tender KS-2024-012",
        description: "Based on historical performance, these 5 companies are recommended for the upcoming healthcare equipment tender.",
        priority: "high",
        status: "new"
      },
      {
        id: "2",
        type: "compliance",
        title: "3 companies with expiring certificates",
        description: "Alert: 3 registered companies have certificates expiring within the next 30 days.",
        priority: "medium",
        status: "new"
      },
      {
        id: "3",
        type: "optimization",
        title: "Procurement cycle optimization opportunity",
        description: "Analysis suggests combining 3 similar tenders could reduce costs by 15% and improve efficiency.",
        priority: "low",
        status: "reviewed"
      }
    ];

    const mockTenders: Tender[] = [
      {
        id: "KS-2024-001",
        title: "Hospital Equipment Supply",
        description: "Supply of medical equipment for 5 primary healthcare centers",
        category: "Healthcare",
        ministry: "Ministry of Health",
        estimatedValue: "₦850M",
        status: "Published",
        publishDate: "2024-01-15",
        closeDate: "2024-02-15",
        bidsReceived: 12,
        ocdsReleased: true,
        addendaCount: 1,
        procuringEntity: "Kano State Primary Healthcare Development Agency"
      },
      {
        id: "KS-2024-002",
        title: "Road Construction Project",
        description: "Construction of 25km rural roads in Kano North LGA",
        category: "Infrastructure",
        ministry: "Ministry of Works",
        estimatedValue: "₦2.5B",
        status: "Closed",
        publishDate: "2024-01-10",
        closeDate: "2024-01-25",
        openDate: "2024-01-26",
        bidsReceived: 8,
        ocdsReleased: true,
        addendaCount: 2,
        procuringEntity: "Kano State Ministry of Works"
      },
      {
        id: "KS-2024-003",
        title: "ICT Infrastructure Upgrade",
        description: "Upgrade of government ICT infrastructure and network systems",
        category: "Technology",
        ministry: "Ministry of Science and Technology",
        estimatedValue: "₦1.2B",
        status: "Awarded",
        publishDate: "2024-01-05",
        closeDate: "2024-01-20",
        openDate: "2024-01-21",
        awardDate: "2024-01-30",
        awardedCompany: "TechSolutions Nigeria",
        awardAmount: "₦1.1B",
        bidsReceived: 15,
        ocdsReleased: true,
        addendaCount: 0,
        evaluationScore: 92,
        procuringEntity: "Kano State ICT Development Agency"
      }
    ];

    const mockTenderEvaluations: TenderEvaluation[] = [
      {
        id: "1",
        tenderId: "KS-2024-002",
        companyId: "1",
        companyName: "Northern Construction Ltd",
        bidAmount: "₦2.3B",
        technicalScore: 85,
        financialScore: 90,
        totalScore: 87.5,
        comments: "Strong technical proposal with competitive pricing",
        evaluatedBy: "Evaluation Committee",
        evaluatedDate: "2024-01-27",
        status: "Completed"
      },
      {
        id: "2",
        tenderId: "KS-2024-002",
        companyId: "4",
        companyName: "BuildRight Engineering",
        bidAmount: "₦2.6B",
        technicalScore: 78,
        financialScore: 75,
        totalScore: 76.5,
        comments: "Good technical capability but higher pricing",
        evaluatedBy: "Evaluation Committee",
        evaluatedDate: "2024-01-27",
        status: "Completed"
      }
    ];

    const mockVendorPerformances: VendorPerformance[] = [
      {
        id: "1",
        contractId: "CON-2024-001",
        tenderId: "KS-2024-003",
        companyId: "3",
        companyName: "TechSolutions Nigeria",
        projectTitle: "ICT Infrastructure Upgrade",
        contractValue: "₦1.1B",
        startDate: "2024-02-01",
        expectedEndDate: "2024-08-01",
        milestones: [
          {
            id: "1",
            title: "Network Assessment",
            description: "Complete assessment of existing network infrastructure",
            expectedDate: "2024-03-01",
            actualDate: "2024-02-28",
            status: "Completed",
            completionPercentage: 100,
            notes: "Completed ahead of schedule",
            documents: ["assessment_report.pdf"]
          },
          {
            id: "2",
            title: "Equipment Procurement",
            description: "Procure and deliver network equipment",
            expectedDate: "2024-04-15",
            status: "Pending",
            completionPercentage: 30,
            documents: []
          }
        ],
        overallScore: 88,
        qualityScore: 90,
        timelinessScore: 85,
        budgetCompliance: 95,
        issues: [
          {
            id: "1",
            type: "Timeline",
            description: "Minor delay in equipment delivery due to supplier issues",
            severity: "Low",
            reportedDate: "2024-03-15",
            status: "Resolved",
            resolvedDate: "2024-03-18",
            actionTaken: "Alternative supplier sourced"
          }
        ],
        status: "Active"
      }
    ];

    setCompanies(mockCompanies);
    setAuditLogs(mockAuditLogs);
    setAIRecommendations(mockAIRecommendations);
    setTenders(mockTenders);
    setTenderEvaluations(mockTenderEvaluations);
    setVendorPerformances(mockVendorPerformances);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const handleBlacklistCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowBlacklistModal(true);
  };

  const submitBlacklist = () => {
    if (!selectedCompany || !blacklistReason.trim()) return;

    setCompanies(prev => prev.map(company => 
      company.id === selectedCompany.id 
        ? { ...company, status: "Blacklisted" as const, blacklistReason }
        : company
    ));

    setShowBlacklistModal(false);
    setSelectedCompany(null);
    setBlacklistReason("");
    alert("Company has been blacklisted successfully!");
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Super User!</h1>
              <p className="text-gray-600">Comprehensive system overview and administrative controls.</p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Registrations Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{dashboardStats.newRegistrationsPending}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tenders</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboardStats.activeTenders}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                    <p className="text-3xl font-bold text-orange-600">{dashboardStats.upcomingDeadlines}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contract Value</p>
                    <p className="text-3xl font-bold text-green-600">{dashboardStats.totalContractValue}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Awarded Contracts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Awarded Contracts Today</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{dashboardStats.awardedContractsToday}</div>
                  <p className="text-sm text-gray-600">Contracts awarded today</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Awarded Contracts This Week</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{dashboardStats.awardedContractsWeek}</div>
                  <p className="text-sm text-gray-600">Contracts awarded this week</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Awarded Contracts This Month</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{dashboardStats.awardedContractsMonth}</div>
                  <p className="text-sm text-gray-600">Contracts awarded this month</p>
                </div>
              </div>
            </div>

            {/* Recent System Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent System Activity Log</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <span className="text-xs text-gray-500">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-500">by {log.user} on {log.entity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "ai-insights":
        return (
          <div className="space-y-8">
            {/* AI Insights Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Insights & Recommendations</h1>
                  <p className="text-gray-600">Intelligent recommendations powered by machine learning</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Live Analysis</span>
                </div>
              </div>
            </div>

            {/* Company Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  Company Recommendation for Tenders
                </h2>
                <p className="text-sm text-gray-600 mt-1">AI-powered matching of companies to relevant tenders</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Recommended for Healthcare Tender KS-2024-012</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Sahel Medical Supplies", score: 95, projects: 15, compliance: "Excellent" },
                        { name: "Healthcare Solutions Ltd", score: 92, projects: 22, compliance: "Good" },
                        { name: "MedEquip Nigeria", score: 88, projects: 8, compliance: "Excellent" }
                      ].map((company, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-sm text-gray-600">{company.projects} relevant projects | {company.compliance} compliance</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.floor(company.score / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">{company.score}% match</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Recommended for Infrastructure Tender KS-2024-013</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Northern Construction Ltd", score: 97, projects: 28, compliance: "Excellent" },
                        { name: "Kano Infrastructure Corp", score: 94, projects: 35, compliance: "Good" },
                        { name: "BuildRight Engineering", score: 89, projects: 19, compliance: "Excellent" }
                      ].map((company, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-sm text-gray-600">{company.projects} relevant projects | {company.compliance} compliance</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < Math.floor(company.score / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">{company.score}% match</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Automated Compliance Monitoring */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  Automated Compliance Monitoring
                </h2>
                <p className="text-sm text-gray-600 mt-1">Real-time compliance alerts and monitoring</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-800">Critical Alerts</p>
                        <p className="text-2xl font-bold text-red-600">3</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-sm text-red-700 mt-2">Companies with expired documents</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Warnings</p>
                        <p className="text-2xl font-bold text-yellow-600">7</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">Documents expiring within 30 days</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Compliant</p>
                        <p className="text-2xl font-bold text-green-600">2,847</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700 mt-2">Companies in good standing</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">Recent Compliance Events</h3>
                  <div className="space-y-2">
                    {[
                      { company: "ABC Construction", event: "Tax clearance expired", severity: "high", time: "2 hours ago" },
                      { company: "Tech Solutions Ltd", event: "CAC certificate expiring in 15 days", severity: "medium", time: "1 day ago" },
                      { company: "Medical Supplies Co", event: "Successfully renewed all documents", severity: "low", time: "3 days ago" }
                    ].map((event, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        event.severity === "high" ? "bg-red-50 border-red-200" :
                        event.severity === "medium" ? "bg-yellow-50 border-yellow-200" :
                        "bg-green-50 border-green-200"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{event.company}</p>
                            <p className="text-sm text-gray-600">{event.event}</p>
                          </div>
                          <span className="text-sm text-gray-500">{event.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 text-purple-500 mr-2" />
                  Smart Recommendations
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {aiRecommendations.map((recommendation) => (
                    <div key={recommendation.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              recommendation.type === "company" ? "bg-blue-100 text-blue-800" :
                              recommendation.type === "compliance" ? "bg-red-100 text-red-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {recommendation.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              recommendation.priority === "high" ? "bg-red-100 text-red-800" :
                              recommendation.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {recommendation.priority} priority
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{recommendation.title}</h3>
                          <p className="text-sm text-gray-600">{recommendation.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            recommendation.status === "new" ? "bg-blue-100 text-blue-800" :
                            recommendation.status === "reviewed" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {recommendation.status}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "company-status":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Status Management</h1>
              <p className="text-gray-600">Manage active status of registered companies including suspensions and blacklisting.</p>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Companies</p>
                    <p className="text-3xl font-bold text-green-600">{companies.filter(c => c.status === "Active").length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Suspended Companies</p>
                    <p className="text-3xl font-bold text-yellow-600">{companies.filter(c => c.status === "Suspended").length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Blacklisted Companies</p>
                    <p className="text-3xl font-bold text-red-600">{companies.filter(c => c.status === "Blacklisted").length}</p>
                  </div>
                  <Ban className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Companies Management */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Company Status Management</h2>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      Print
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.filter(company => 
                      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{company.companyName}</div>
                            <div className="text-sm text-gray-500">{company.contactPerson} • {company.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            company.status === "Active" ? "bg-green-100 text-green-800" :
                            company.status === "Suspended" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {company.status}
                          </span>
                          {company.suspensionReason && (
                            <div className="text-xs text-gray-500 mt-1">
                              Reason: {company.suspensionReason}
                            </div>
                          )}
                          {company.blacklistReason && (
                            <div className="text-xs text-gray-500 mt-1">
                              Reason: {company.blacklistReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(company.lastActivity).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            View Details
                          </button>
                          {company.status === "Active" && (
                            <button
                              onClick={() => handleBlacklistCompany(company)}
                              className="text-red-600 hover:text-red-900 ml-3"
                            >
                              Blacklist
                            </button>
                          )}
                          {company.status === "Suspended" && (
                            <button className="text-green-600 hover:text-green-900 ml-3">
                              Reactivate
                            </button>
                          )}
                          {company.status === "Blacklisted" && (
                            <button className="text-green-600 hover:text-green-900 ml-3">
                              Remove Blacklist
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "audit-logs":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Logs</h1>
              <p className="text-gray-600">Detailed logging of all user actions for accountability and security auditing.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">System Activity Logs</h2>
                  <div className="flex items-center space-x-3">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option>All Actions</option>
                      <option>User Login</option>
                      <option>Company Actions</option>
                      <option>Tender Actions</option>
                      <option>System Changes</option>
                    </select>
                    <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Users</option>
                    <option>SuperUser</option>
                    <option>Admin</option>
                    <option>System</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            log.action.includes("Approved") ? "bg-green-500" :
                            log.action.includes("Rejected") ? "bg-red-500" :
                            log.action.includes("Created") ? "bg-blue-500" :
                            "bg-gray-500"
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{log.action}</p>
                              <span className="text-sm text-gray-500">•</span>
                              <p className="text-sm text-gray-600">{log.entity}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>User: {log.user}</span>
                              <span>•</span>
                              <span>{log.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive business intelligence dashboards and procurement analytics.</p>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                  Spending Analysis by Ministry
                </h3>
                <div className="space-y-3">
                  {[
                    { ministry: "Health", amount: "₦12.5B", percentage: 35 },
                    { ministry: "Education", amount: "₦8.3B", percentage: 23 },
                    { ministry: "Infrastructure", amount: "₦15.2B", percentage: 42 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.ministry}</p>
                        <p className="text-sm text-gray-600">{item.amount}</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  Supplier Performance Trends
                </h3>
                <div className="space-y-3">
                  {[
                    { metric: "Average Completion Rate", value: "94%", trend: "up" },
                    { metric: "On-time Delivery", value: "89%", trend: "up" },
                    { metric: "Quality Score", value: "4.2/5", trend: "stable" },
                    { metric: "Compliance Rate", value: "97%", trend: "up" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{item.value}</span>
                        <TrendingUp className={`h-4 w-4 ${
                          item.trend === "up" ? "text-green-500" : "text-gray-400"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Business Intelligence Dashboards */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 text-purple-600 mr-2" />
                  Business Intelligence Dashboards
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Procurement by Sector", icon: PieChart, color: "blue" },
                    { title: "Geographic Distribution", icon: Target, color: "green" },
                    { title: "Contract Lifecycle Analysis", icon: LineChart, color: "purple" },
                    { title: "Vendor Performance", icon: Award, color: "orange" },
                    { title: "Spending Trends", icon: TrendingUp, color: "red" },
                    { title: "Compliance Overview", icon: Shield, color: "indigo" }
                  ].map((dashboard, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 bg-${dashboard.color}-100 rounded-lg flex items-center justify-center`}>
                          <dashboard.icon className={`h-5 w-5 text-${dashboard.color}-600`} />
                        </div>
                        <h3 className="font-medium text-gray-900">{dashboard.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Interactive dashboard with filtering and export options</p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Open Dashboard →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                  Predictive Analytics for Procurement Trends
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Demand Forecasting</h3>
                    <div className="space-y-3">
                      {[
                        { category: "Medical Equipment", forecast: "15% increase", period: "Next Quarter" },
                        { category: "IT Infrastructure", forecast: "8% increase", period: "Next 6 months" },
                        { category: "Construction Materials", forecast: "22% increase", period: "Next Quarter" }
                      ].map((item, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{item.category}</span>
                            <span className="text-sm text-blue-600">{item.period}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Predicted {item.forecast} in demand</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Optimal Tender Timing</h3>
                    <div className="space-y-3">
                      {[
                        { tender: "Healthcare Equipment", timing: "Early Q2", reason: "Maximize competition" },
                        { tender: "Road Construction", timing: "End of Q1", reason: "Weather considerations" },
                        { tender: "IT Services", timing: "Mid Q2", reason: "Budget cycle alignment" }
                      ].map((item, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{item.tender}</span>
                            <span className="text-sm text-green-600">{item.timing}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Feature Coming Soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              This section is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">KanoProc Super User</h1>
                <p className="text-xs text-blue-100">Advanced System Administration</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { key: "dashboard", label: "Dashboard", icon: BarChart3 },
                { key: "companies", label: "Companies", icon: Users },
                { key: "tenders", label: "Tenders", icon: FileText },
                { key: "reports", label: "Reports", icon: TrendingUp },
                { key: "ai-insights", label: "AI Insights", icon: Brain }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as ActiveTab)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-white bg-opacity-20 text-white"
                      : "text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-blue-100 hover:text-white cursor-pointer" />
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-blue-100 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-3">
            {[
              { key: "dashboard", label: "Dashboard", icon: BarChart3 },
              { key: "companies", label: "Company Approvals", icon: UserCheck },
              { key: "tenders", label: "Tender Management", icon: FileText },
              { key: "users", label: "User Management", icon: Users },
              { key: "reports", label: "Reports & Analytics", icon: TrendingUp },
              { key: "ocds", label: "OCDS Data", icon: Database },
              { key: "ai-insights", label: "AI Insights", icon: Brain },
              { key: "company-status", label: "Company Status", icon: Shield },
              { key: "audit-logs", label: "Audit Logs", icon: Activity },
              { key: "settings", label: "Settings", icon: Settings },
              { key: "feedback", label: "Feedback", icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ActiveTab)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderDashboardContent()}
      </main>

      {/* Blacklist Modal */}
      {showBlacklistModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blacklist Company</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to blacklist <strong>{selectedCompany.companyName}</strong>?
              This will prevent them from participating in any procurement processes.
            </p>
            <div className="mb-4">
              <label htmlFor="blacklistReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Blacklisting *
              </label>
              <textarea
                id="blacklistReason"
                rows={3}
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Provide a detailed reason for blacklisting..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBlacklistModal(false);
                  setSelectedCompany(null);
                  setBlacklistReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitBlacklist}
                disabled={!blacklistReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Blacklist Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
