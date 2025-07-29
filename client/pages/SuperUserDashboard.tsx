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
  const [activeEvaluationTender, setActiveEvaluationTender] = useState<Tender | null>(null);
  const [showEvaluationInterface, setShowEvaluationInterface] = useState(false);
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
    totalContractValue: "���15.7B"
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

  const handleStartEvaluation = (tender: Tender) => {
    setActiveEvaluationTender(tender);
    setShowEvaluationInterface(true);
    // Scroll to evaluation interface
    setTimeout(() => {
      const element = document.getElementById('evaluation-interface');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCompleteEvaluation = (evaluationId: string) => {
    setTenderEvaluations(prev => prev.map(evaluation =>
      evaluation.id === evaluationId
        ? { ...evaluation, status: "Completed" as const }
        : evaluation
    ));
  };

  const handleFlagBid = (evaluationId: string, reason: string) => {
    setTenderEvaluations(prev => prev.map(evaluation =>
      evaluation.id === evaluationId
        ? { ...evaluation, status: "Flagged" as const, flagReason: reason }
        : evaluation
    ));
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

      case "tenders":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tender Management</h1>
              <p className="text-gray-600">Comprehensive tender lifecycle management with OCDS integration.</p>
            </div>

            {/* Tender Management Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tenders</p>
                    <p className="text-3xl font-bold text-blue-600">{tenders.filter(t => t.status === "Published").length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Evaluation</p>
                    <p className="text-3xl font-bold text-orange-600">{tenders.filter(t => t.status === "Closed").length}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Awarded Contracts</p>
                    <p className="text-3xl font-bold text-green-600">{tenders.filter(t => t.status === "Awarded").length}</p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bids Received</p>
                    <p className="text-3xl font-bold text-purple-600">{tenders.reduce((sum, t) => sum + t.bidsReceived, 0)}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab("create-tender")}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Tender
              </button>

              <button
                onClick={() => setActiveTab("manage-tenders")}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-5 w-5 mr-2" />
                Manage Tenders
              </button>

              <button
                onClick={() => setActiveTab("tender-evaluation")}
                className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Evaluate Tenders
              </button>

              <button
                onClick={() => setActiveTab("vendor-performance")}
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Vendor Performance
              </button>
            </div>

            {/* Recent Tenders */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Tenders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenders.slice(0, 5).map((tender) => (
                      <tr key={tender.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tender.title}</div>
                            <div className="text-sm text-gray-500">{tender.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tender.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tender.estimatedValue}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tender.status === "Published" ? "bg-blue-100 text-blue-800" :
                            tender.status === "Closed" ? "bg-orange-100 text-orange-800" :
                            tender.status === "Awarded" ? "bg-green-100 text-green-800" :
                            tender.status === "Draft" ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tender.bidsReceived}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                          <button className="text-green-600 hover:text-green-900">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "create-tender":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Tender</h1>
                <p className="text-gray-600">Create a new procurement tender with OCDS integration.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </button>
                <button
                  onClick={() => setActiveTab("tenders")}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back to Tenders
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tender Information</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tender Title *</label>
                    <input
                      type="text"
                      value={tenderForm.title}
                      onChange={(e) => setTenderForm(prev => ({...prev, title: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tender title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={tenderForm.category}
                      onChange={(e) => setTenderForm(prev => ({...prev, category: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Technology">Technology</option>
                      <option value="Education">Education</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Energy">Energy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ministry *</label>
                    <select
                      value={tenderForm.ministry}
                      onChange={(e) => setTenderForm(prev => ({...prev, ministry: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select ministry</option>
                      <option value="Ministry of Health">Ministry of Health</option>
                      <option value="Ministry of Works">Ministry of Works</option>
                      <option value="Ministry of Education">Ministry of Education</option>
                      <option value="Ministry of Science and Technology">Ministry of Science and Technology</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Procuring Entity *</label>
                    <input
                      type="text"
                      value={tenderForm.procuringEntity}
                      onChange={(e) => setTenderForm(prev => ({...prev, procuringEntity: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter procuring entity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value *</label>
                    <div className="flex">
                      <select
                        value={tenderForm.currency}
                        onChange={(e) => setTenderForm(prev => ({...prev, currency: e.target.value}))}
                        className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="NGN">₦ NGN</option>
                        <option value="USD">$ USD</option>
                      </select>
                      <input
                        type="text"
                        value={tenderForm.estimatedValue}
                        onChange={(e) => setTenderForm(prev => ({...prev, estimatedValue: e.target.value}))}
                        className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter estimated value"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Duration</label>
                    <input
                      type="text"
                      value={tenderForm.contractDuration}
                      onChange={(e) => setTenderForm(prev => ({...prev, contractDuration: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 6 months, 1 year"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date *</label>
                    <input
                      type="date"
                      value={tenderForm.publishDate}
                      onChange={(e) => setTenderForm(prev => ({...prev, publishDate: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Close Date *</label>
                    <input
                      type="date"
                      value={tenderForm.closeDate}
                      onChange={(e) => setTenderForm(prev => ({...prev, closeDate: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bid Opening Date</label>
                    <input
                      type="date"
                      value={tenderForm.openDate}
                      onChange={(e) => setTenderForm(prev => ({...prev, openDate: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
                    <input
                      type="text"
                      value={tenderForm.deliveryLocation}
                      onChange={(e) => setTenderForm(prev => ({...prev, deliveryLocation: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter delivery location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    rows={4}
                    value={tenderForm.description}
                    onChange={(e) => setTenderForm(prev => ({...prev, description: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed tender description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
                  <textarea
                    rows={3}
                    value={tenderForm.eligibilityCriteria}
                    onChange={(e) => setTenderForm(prev => ({...prev, eligibilityCriteria: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter eligibility requirements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technical Requirements</label>
                  <textarea
                    rows={3}
                    value={tenderForm.technicalRequirements}
                    onChange={(e) => setTenderForm(prev => ({...prev, technicalRequirements: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter technical specifications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Criteria</label>
                  <textarea
                    rows={3}
                    value={tenderForm.evaluationCriteria}
                    onChange={(e) => setTenderForm(prev => ({...prev, evaluationCriteria: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter evaluation criteria and scoring methodology"
                  />
                </div>

                {/* OCDS Integration Fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">OCDS Integration Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">OCDS ID</label>
                      <input
                        type="text"
                        value={tenderForm.ocdsId}
                        onChange={(e) => setTenderForm(prev => ({...prev, ocdsId: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-generated OCDS identifier"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Procurement Method</label>
                      <select
                        value={tenderForm.procurementMethod}
                        onChange={(e) => setTenderForm(prev => ({...prev, procurementMethod: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select method</option>
                        <option value="open">Open Tendering</option>
                        <option value="selective">Selective Tendering</option>
                        <option value="limited">Limited Tendering</option>
                        <option value="direct">Direct Award</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Procurement Category</label>
                      <select
                        value={tenderForm.mainProcurementCategory}
                        onChange={(e) => setTenderForm(prev => ({...prev, mainProcurementCategory: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select category</option>
                        <option value="goods">Goods</option>
                        <option value="services">Services</option>
                        <option value="works">Works</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setActiveTab("tenders")}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    Save as Draft
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Publish Tender
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "manage-tenders":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Existing Tenders</h1>
                <p className="text-gray-600">Edit, close, issue addenda, open bids, view bids, and award tenders.</p>
              </div>
              <button
                onClick={() => setActiveTab("tenders")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Tenders
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">All Tenders</h2>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
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
                  <input
                    type="text"
                    placeholder="Search tenders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tender Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OCDS</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenders.map((tender) => (
                      <tr key={tender.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tender.title}</div>
                            <div className="text-sm text-gray-500">{tender.id} • {tender.category}</div>
                            <div className="text-sm text-gray-500">{tender.estimatedValue}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tender.status === "Published" ? "bg-blue-100 text-blue-800" :
                            tender.status === "Closed" ? "bg-orange-100 text-orange-800" :
                            tender.status === "Awarded" ? "bg-green-100 text-green-800" :
                            tender.status === "Draft" ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>Published: {new Date(tender.publishDate).toLocaleDateString()}</div>
                          <div>Closes: {new Date(tender.closeDate).toLocaleDateString()}</div>
                          {tender.openDate && <div>Opens: {new Date(tender.openDate).toLocaleDateString()}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {tender.bidsReceived}
                          </div>
                          {tender.addendaCount > 0 && (
                            <div className="text-xs text-gray-500">{tender.addendaCount} addenda</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {tender.ocdsReleased ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className="text-sm text-gray-900">
                              {tender.ocdsReleased ? "Released" : "Pending"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 text-sm">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 text-sm">
                              <Edit className="h-4 w-4" />
                            </button>
                            {tender.status === "Published" && (
                              <button className="text-orange-600 hover:text-orange-900 text-sm">
                                <Send className="h-4 w-4" />
                              </button>
                            )}
                            {tender.status === "Closed" && (
                              <button className="text-purple-600 hover:text-purple-900 text-sm">
                                <Play className="h-4 w-4" />
                              </button>
                            )}
                            <button className="text-gray-600 hover:text-gray-900 text-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "tender-evaluation":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Tender Evaluation</h1>
                <p className="text-gray-600">Evaluate submitted bids with scoring and comments.</p>
              </div>
              <button
                onClick={() => setActiveTab("tenders")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Tenders
              </button>
            </div>

            {/* Tenders Ready for Evaluation */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tenders Ready for Evaluation</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {tenders.filter(t => t.status === "Closed").map((tender) => (
                    <div key={tender.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{tender.title}</h3>
                          <p className="text-sm text-gray-600">{tender.id} • {tender.category} • {tender.estimatedValue}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Closed: {new Date(tender.closeDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{tender.bidsReceived} bids received</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStartEvaluation(tender)}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                          >
                            <ClipboardList className="h-4 w-4 mr-1" />
                            Start Evaluation
                          </button>
                          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Bids
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sample Evaluation Interface */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Evaluation: Road Construction Project</h2>
                <p className="text-sm text-gray-600">KS-2024-002 • {tenderEvaluations.length} bids to evaluate</p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {tenderEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{evaluation.companyName}</h3>
                          <p className="text-sm text-gray-600">Bid Amount: {evaluation.bidAmount}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {evaluation.status === "Flagged" && (
                            <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged: {evaluation.flagReason}
                            </div>
                          )}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            evaluation.status === "Completed" ? "bg-green-100 text-green-800" :
                            evaluation.status === "Flagged" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {evaluation.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Technical Score (40%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={evaluation.technicalScore}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly={evaluation.status === "Completed"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Financial Score (60%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={evaluation.financialScore}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly={evaluation.status === "Completed"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Score</label>
                          <input
                            type="number"
                            value={evaluation.totalScore}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comments/Justification</label>
                        <textarea
                          rows={3}
                          value={evaluation.comments}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter evaluation comments and justification..."
                          readOnly={evaluation.status === "Completed"}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Evaluated by {evaluation.evaluatedBy} on {new Date(evaluation.evaluatedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          {evaluation.status !== "Completed" && (
                            <>
                              <button className="flex items-center px-3 py-2 border border-orange-300 text-orange-700 rounded-md hover:bg-orange-50 text-sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Request Info
                              </button>
                              <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Complete Evaluation
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export Evaluation Report
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Print Report
                  </button>
                  <button
                    onClick={() => setActiveTab("tender-awards")}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Gavel className="h-4 w-4 mr-2" />
                    Proceed to Award
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "tender-awards":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Tender Awards</h1>
                <p className="text-gray-600">Award tenders to winning bidders and manage contract signing.</p>
              </div>
              <button
                onClick={() => setActiveTab("tenders")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Tenders
              </button>
            </div>

            {/* Evaluated Tenders Ready for Award */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tenders Ready for Award</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {tenders.filter(t => t.status === "Closed" || t.status === "Awarded").map((tender) => (
                    <div key={tender.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{tender.title}</h3>
                          <p className="text-sm text-gray-600">{tender.id} • {tender.category} • {tender.estimatedValue}</p>
                          {tender.awardedCompany && (
                            <div className="mt-2 flex items-center space-x-4 text-sm">
                              <span className="text-green-600 font-medium">
                                Awarded to: {tender.awardedCompany}
                              </span>
                              <span className="text-gray-500">
                                Amount: {tender.awardAmount}
                              </span>
                              <span className="text-gray-500">
                                Date: {tender.awardDate ? new Date(tender.awardDate).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {tender.status === "Closed" ? (
                            <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                              <Gavel className="h-4 w-4 mr-1" />
                              Award Tender
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                                <Mail className="h-4 w-4 mr-1" />
                                Send Award Letter
                              </button>
                              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                                <FileCheck className="h-4 w-4 mr-1" />
                                Sign Contract
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sample Award Form */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Award Tender: Road Construction Project</h2>
                <p className="text-sm text-gray-600">KS-2024-002</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Winning Company *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select winning bidder</option>
                      <option value="1">Northern Construction Ltd (���2.3B - Score: 87.5)</option>
                      <option value="2">BuildRight Engineering (₦2.6B - Score: 76.5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Award Amount *</label>
                    <input
                      type="text"
                      placeholder="Enter final award amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Award Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 12 months"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Award Letter/Letter of Intent</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload award letter or drag and drop</p>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notifyWinner"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="notifyWinner" className="text-sm text-gray-700">
                    Notify winning company via email
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notifyUnsuccessful"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="notifyUnsuccessful" className="text-sm text-gray-700">
                    Notify unsuccessful companies
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="publishOCDS"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="publishOCDS" className="text-sm text-gray-700">
                    Publish OCDS award release
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="initiatePerformanceTracking"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="initiatePerformanceTracking" className="text-sm text-gray-700">
                    Initiate vendor performance tracking
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Award Tender
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "vendor-performance":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Performance Management</h1>
                <p className="text-gray-600">Track and record contractor performance during project implementation.</p>
              </div>
              <button
                onClick={() => setActiveTab("tenders")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Tenders
              </button>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                    <p className="text-3xl font-bold text-blue-600">{vendorPerformances.filter(v => v.status === "Active").length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Performance Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(vendorPerformances.reduce((sum, v) => sum + v.overallScore, 0) / vendorPerformances.length)}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delayed Projects</p>
                    <p className="text-3xl font-bold text-orange-600">{vendorPerformances.filter(v => v.status === "Delayed").length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Issues</p>
                    <p className="text-3xl font-bold text-red-600">
                      {vendorPerformances.reduce((sum, v) => sum + v.issues.filter(i => i.status === "Open").length, 0)}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Active Contracts */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Active Contract Performance</h2>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {vendorPerformances.map((performance) => (
                    <div key={performance.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{performance.projectTitle}</h3>
                          <p className="text-sm text-gray-600">
                            {performance.companyName} • Contract: {performance.contractId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Value: {performance.contractValue} • Started: {new Date(performance.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{performance.overallScore}%</div>
                            <div className="text-xs text-gray-500">Overall Score</div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            performance.status === "Active" ? "bg-green-100 text-green-800" :
                            performance.status === "Delayed" ? "bg-orange-100 text-orange-800" :
                            performance.status === "Completed" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {performance.status}
                          </span>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">Quality Score</span>
                            <span className="text-lg font-bold text-green-600">{performance.qualityScore}%</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">Timeliness Score</span>
                            <span className="text-lg font-bold text-blue-600">{performance.timelinessScore}%</span>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-800">Budget Compliance</span>
                            <span className="text-lg font-bold text-purple-600">{performance.budgetCompliance}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Project Milestones</h4>
                        <div className="space-y-2">
                          {performance.milestones.slice(0, 3).map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">{milestone.title}</span>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    milestone.status === "Completed" ? "bg-green-100 text-green-800" :
                                    milestone.status === "Delayed" ? "bg-red-100 text-red-800" :
                                    "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {milestone.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Expected: {new Date(milestone.expectedDate).toLocaleDateString()}
                                  {milestone.actualDate && ` | Actual: ${new Date(milestone.actualDate).toLocaleDateString()}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{milestone.completionPercentage}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Issues */}
                      {performance.issues.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Recent Issues</h4>
                          <div className="space-y-2">
                            {performance.issues.slice(0, 2).map((issue) => (
                              <div key={issue.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-red-900">{issue.type}: {issue.description}</span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      issue.severity === "Critical" ? "bg-red-100 text-red-800" :
                                      issue.severity === "High" ? "bg-orange-100 text-orange-800" :
                                      issue.severity === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                      "bg-gray-100 text-gray-800"
                                    }`}>
                                      {issue.severity}
                                    </span>
                                  </div>
                                  <p className="text-xs text-red-700 mt-1">
                                    Reported: {new Date(issue.reportedDate).toLocaleDateString()}
                                    {issue.resolvedDate && ` | Resolved: ${new Date(issue.resolvedDate).toLocaleDateString()}`}
                                  </p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  issue.status === "Resolved" ? "bg-green-100 text-green-800" :
                                  issue.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {issue.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end space-x-2">
                        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Update Progress
                        </button>
                        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </button>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">1,189</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Admin Users</p>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Ban className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-gray-900">58</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Management Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">System Users</h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        id: "USR001",
                        name: "Ahmed Musa",
                        email: "ahmed.musa@kanoproc.gov.ng",
                        role: "Super Admin",
                        status: "Active",
                        lastActive: "2024-01-28T10:30:00Z",
                        avatar: "AM"
                      },
                      {
                        id: "USR002",
                        name: "Fatima Ibrahim",
                        email: "fatima.ibrahim@kanoproc.gov.ng",
                        role: "Procurement Officer",
                        status: "Active",
                        lastActive: "2024-01-28T09:15:00Z",
                        avatar: "FI"
                      },
                      {
                        id: "USR003",
                        name: "Usman Garba",
                        email: "usman.garba@kanoproc.gov.ng",
                        role: "Finance Officer",
                        status: "Active",
                        lastActive: "2024-01-28T08:45:00Z",
                        avatar: "UG"
                      },
                      {
                        id: "USR004",
                        name: "Aisha Mohammed",
                        email: "aisha.mohammed@kanoproc.gov.ng",
                        role: "Legal Officer",
                        status: "Suspended",
                        lastActive: "2024-01-25T16:20:00Z",
                        avatar: "AM"
                      },
                      {
                        id: "USR005",
                        name: "Sani Abdullahi",
                        email: "sani.abdullahi@kanoproc.gov.ng",
                        role: "Technical Officer",
                        status: "Active",
                        lastActive: "2024-01-28T07:30:00Z",
                        avatar: "SA"
                      }
                    ].map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{user.avatar}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "Super Admin" ? "bg-purple-100 text-purple-800" :
                            user.role.includes("Officer") ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "Active" ? "bg-green-100 text-green-800" :
                            user.status === "Suspended" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Ban className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "companies":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Approvals</h1>
                <p className="text-gray-600 mt-1">Review and approve company registrations</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Bulk Approve
                </button>
              </div>
            </div>

            {/* Approval Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">847</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">67</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Under Review</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Approval Queue */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Company Registration Queue</h2>
                  <div className="flex items-center space-x-3">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Status</option>
                      <option value="pending">Pending Review</option>
                      <option value="under-review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search companies..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        id: "COM001",
                        name: "Northern Construction Ltd",
                        email: "info@northernconst.com",
                        regNumber: "RC-456789",
                        submissionDate: "2024-01-28",
                        status: "Pending Review",
                        documentsComplete: true,
                        category: "Construction"
                      },
                      {
                        id: "COM002",
                        name: "Sahel Engineering Services",
                        email: "contact@saheleng.com",
                        regNumber: "RC-789012",
                        submissionDate: "2024-01-27",
                        status: "Under Review",
                        documentsComplete: false,
                        category: "Engineering"
                      },
                      {
                        id: "COM003",
                        name: "Kano Medical Supplies",
                        email: "orders@kanomedical.com",
                        regNumber: "RC-345678",
                        submissionDate: "2024-01-26",
                        status: "Pending Review",
                        documentsComplete: true,
                        category: "Healthcare"
                      },
                      {
                        id: "COM004",
                        name: "Tech Solutions Nigeria",
                        email: "hello@techsolutions.ng",
                        regNumber: "RC-234567",
                        submissionDate: "2024-01-25",
                        status: "Approved",
                        documentsComplete: true,
                        category: "Technology"
                      }
                    ].map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                            <div className="text-sm text-gray-500">{company.email}</div>
                            <div className="text-xs text-gray-400">{company.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{company.regNumber}</div>
                          <div className="text-sm text-gray-500">
                            Submitted: {new Date(company.submissionDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            company.status === "Approved" ? "bg-green-100 text-green-800" :
                            company.status === "Pending Review" ? "bg-yellow-100 text-yellow-800" :
                            company.status === "Under Review" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {company.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {company.documentsComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            )}
                            <span className="text-sm text-gray-900">
                              {company.documentsComplete ? "Complete" : "Incomplete"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </button>
                          {company.status === "Pending Review" && (
                            <>
                              <button className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                              <button className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700">
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </button>
                            </>
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

      case "ocds":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OCDS Data Management</h1>
                <p className="text-gray-600 mt-1">Open Contracting Data Standard compliance and publishing</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export OCDS
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Data
                </button>
              </div>
            </div>

            {/* OCDS Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">1,847</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">1,723</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-gray-900">35</p>
                  </div>
                </div>
              </div>
            </div>

            {/* OCDS Data Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Quality */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Data Quality Score</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold text-green-600">94.2%</div>
                      <p className="text-sm text-gray-600">Overall compliance score</p>
                    </div>
                    <div className="w-20 h-20">
                      <PieChart className="w-full h-full text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { field: "Planning Data", score: 98, status: "excellent" },
                      { field: "Tender Data", score: 95, status: "good" },
                      { field: "Award Data", score: 92, status: "good" },
                      { field: "Contract Data", score: 89, status: "fair" },
                      { field: "Implementation Data", score: 85, status: "fair" }
                    ].map((item) => (
                      <div key={item.field} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.field}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.status === "excellent" ? "bg-green-500" :
                                item.status === "good" ? "bg-blue-500" :
                                "bg-yellow-500"
                              }`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Publications */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Publications</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        type: "Tender",
                        title: "Road Construction Tender",
                        id: "OCDS-KN-2024-001",
                        publishedAt: "2024-01-28T10:30:00Z",
                        status: "Published"
                      },
                      {
                        type: "Award",
                        title: "Medical Equipment Supply Award",
                        id: "OCDS-KN-2024-002",
                        publishedAt: "2024-01-28T09:15:00Z",
                        status: "Published"
                      },
                      {
                        type: "Contract",
                        title: "School Building Contract",
                        id: "OCDS-KN-2024-003",
                        publishedAt: "2024-01-27T16:45:00Z",
                        status: "Published"
                      },
                      {
                        type: "Planning",
                        title: "Infrastructure Development Plan",
                        id: "OCDS-KN-2024-004",
                        publishedAt: "2024-01-27T14:20:00Z",
                        status: "Failed"
                      }
                    ].map((publication) => (
                      <div key={publication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              publication.type === "Tender" ? "bg-blue-100 text-blue-800" :
                              publication.type === "Award" ? "bg-green-100 text-green-800" :
                              publication.type === "Contract" ? "bg-purple-100 text-purple-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {publication.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              publication.status === "Published" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {publication.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{publication.title}</p>
                          <p className="text-xs text-gray-500">{publication.id}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(publication.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* OCDS Data Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">OCDS Records</h2>
                  <div className="flex items-center space-x-3">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">All Types</option>
                      <option value="planning">Planning</option>
                      <option value="tender">Tender</option>
                      <option value="award">Award</option>
                      <option value="contract">Contract</option>
                    </select>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search OCDS records..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OCDS ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        ocdsId: "OCDS-KN-2024-001",
                        type: "Tender",
                        title: "Road Construction and Maintenance Services",
                        status: "Published",
                        lastUpdated: "2024-01-28T10:30:00Z",
                        dataQuality: 95
                      },
                      {
                        ocdsId: "OCDS-KN-2024-002",
                        type: "Award",
                        title: "Medical Equipment Supply Award",
                        status: "Published",
                        lastUpdated: "2024-01-28T09:15:00Z",
                        dataQuality: 92
                      },
                      {
                        ocdsId: "OCDS-KN-2024-003",
                        type: "Contract",
                        title: "School Building Construction Contract",
                        status: "Pending",
                        lastUpdated: "2024-01-27T16:45:00Z",
                        dataQuality: 88
                      },
                      {
                        ocdsId: "OCDS-KN-2024-004",
                        type: "Planning",
                        title: "Infrastructure Development Planning",
                        status: "Failed",
                        lastUpdated: "2024-01-27T14:20:00Z",
                        dataQuality: 65
                      }
                    ].map((record) => (
                      <tr key={record.ocdsId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.ocdsId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === "Tender" ? "bg-blue-100 text-blue-800" :
                            record.type === "Award" ? "bg-green-100 text-green-800" :
                            record.type === "Contract" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {record.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{record.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === "Published" ? "bg-green-100 text-green-800" :
                            record.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.lastUpdated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="h-4 w-4" />
                          </button>
                          {record.status === "Failed" && (
                            <button className="text-orange-600 hover:text-orange-900">
                              <RefreshCw className="h-4 w-4" />
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
