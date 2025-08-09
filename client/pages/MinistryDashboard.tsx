import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  LogOut,
  Bell,
  Search,
  Calendar,
  BarChart3,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Download,
  Send,
  Award,
  DollarSign,
  Target,
  Activity,
  Briefcase,
  UserCheck,
  FileCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Settings,
  Upload,
  MessageSquare,
  Shield,
  Gavel,
  BookOpen,
  Clipboard,
  CheckSquare,
  AlertCircle,
  Zap,
  Bot,
  Timer,
  RefreshCw,
  Users2,
  FileSpreadsheet,
  Calculator,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  Star,
  Truck,
  Package,
  CreditCard,
  Scale,
  Globe,
  Network,
  Radio,
  Smartphone,
  Wifi,
  Monitor,
  Megaphone,
} from "lucide-react";

type ActiveTab =
  | "dashboard"
  | "companies"
  | "tenders"
  | "create-tender"
  | "advanced-tender-mgmt"
  | "bulk-tender-upload"
  | "evaluation-management"
  | "contract-management"
  | "vendor-communication"
  | "reports"
  | "noc-requests";

interface Company {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: "Pending" | "Approved" | "Rejected";
  businessType: string;
  address: string;
  lastActivity: string;
}

interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedValue: string;
  status: "Draft" | "Published" | "Closed" | "Evaluated" | "Awarded";
  publishDate: string;
  closeDate: string;
  bidsReceived: number;
  ministry: string;
  procuringEntity: string;
}

interface NOCRequest {
  id: string;
  projectTitle: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
  projectValue: string;
  contractorName: string;
  expectedDuration: string;
  approvalDate?: string;
  certificateNumber?: string;
}

interface Contract {
  id: string;
  tenderId: string;
  contractorName: string;
  projectTitle: string;
  contractValue: string;
  startDate: string;
  endDate: string;
  status: "Draft" | "Active" | "Completed" | "Suspended" | "Terminated";
  milestones: Milestone[];
  payments: Payment[];
  disputes?: Dispute[];
  performanceScore: number;
  digitalSignature?: string;
  documentHash?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completionDate?: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue";
  paymentPercentage: number;
  deliverables: string[];
  verificationStatus: "Not Started" | "Under Review" | "Verified" | "Rejected";
}

interface Payment {
  id: string;
  milestoneId: string;
  amount: string;
  requestDate: string;
  approvalDate?: string;
  paymentDate?: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  invoiceNumber?: string;
  bankDetails?: string;
}

interface Dispute {
  id: string;
  title: string;
  description: string;
  raisedBy: "Ministry" | "Contractor";
  raisedDate: string;
  status: "Open" | "Under Mediation" | "Resolved" | "Escalated";
  resolutionDate?: string;
  resolution?: string;
  mediator?: string;
}

interface EvaluationCommittee {
  id: string;
  name: string;
  members: CommitteeMember[];
  chairperson: string;
  secretary: string;
  specialization: string[];
  activeEvaluations: string[];
  status: "Active" | "Inactive";
}

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  expertise: string[];
  availability: "Available" | "Busy" | "On Leave";
}

interface BidEvaluation {
  id: string;
  tenderId: string;
  companyId: string;
  companyName: string;
  evaluatorId: string;
  technicalScore: number;
  financialScore: number;
  complianceScore: number;
  totalScore: number;
  comments: string;
  recommendations: string;
  status: "Draft" | "Submitted" | "Reviewed" | "Final";
  submissionDate?: string;
}

interface VendorCommunication {
  id: string;
  vendorId: string;
  vendorName: string;
  subject: string;
  message: string;
  type: "Tender Alert" | "Amendment" | "Clarification" | "Award Notice" | "General";
  channels: ("Email" | "SMS" | "Portal")[];
  sentDate: string;
  readStatus: boolean;
  responseRequired: boolean;
  priority: "Low" | "Medium" | "High" | "Urgent";
}

interface ScheduledPublication {
  id: string;
  tenderId: string;
  tenderTitle: string;
  scheduledDate: string;
  scheduledTime: string;
  distributionChannels: ("Website" | "Email" | "SMS" | "Newspaper")[];
  targetCategories: string[];
  status: "Scheduled" | "Published" | "Failed" | "Cancelled";
  createdBy: string;
  notes?: string;
}

interface MinistryInfo {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export default function MinistryDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [nocRequests, setNOCRequests] = useState<NOCRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateTender, setShowCreateTender] = useState(false);
  const [showNOCRequest, setShowNOCRequest] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [evaluationCommittees, setEvaluationCommittees] = useState<EvaluationCommittee[]>([]);
  const [bidEvaluations, setBidEvaluations] = useState<BidEvaluation[]>([]);
  const [vendorCommunications, setVendorCommunications] = useState<VendorCommunication[]>([]);
  const [scheduledPublications, setScheduledPublications] = useState<ScheduledPublication[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<BidEvaluation | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showVendorCommModal, setShowVendorCommModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [contractFormData, setContractFormData] = useState({
    tenderId: '',
    contractorName: '',
    projectTitle: '',
    contractValue: '',
    startDate: '',
    endDate: '',
    milestoneCount: 3,
    paymentSchedule: 'milestone'
  });
  const navigate = useNavigate();

  // Get ministry info from context/auth (mock for now)
  const ministryInfo: MinistryInfo = {
    name: "Ministry of Health",
    code: "MOH",
    contactEmail: "health@kanostate.gov.ng",
    contactPhone: "08012345678",
    address: "Kano State Secretariat, Kano",
  };

  // Mock data initialization
  useEffect(() => {
    const mockCompanies: Company[] = [
      {
        id: "1",
        companyName: "MedSupply Nigeria Ltd",
        contactPerson: "Dr. Amina Hassan",
        email: "amina@medsupply.ng",
        phone: "+234 803 123 4567",
        registrationDate: "2024-01-15",
        status: "Approved",
        businessType: "Medical Equipment Supply",
        address: "123 Hospital Road, Kano",
        lastActivity: "2024-02-01",
      },
      {
        id: "2",
        companyName: "Sahel Medical Supplies",
        contactPerson: "Fatima Yusuf",
        email: "fatima@sahelmedical.com",
        phone: "+234 805 987 6543",
        registrationDate: "2024-01-14",
        status: "Pending",
        businessType: "Pharmaceutical Supply",
        address: "45 Medicine Street, Kano",
        lastActivity: "2024-01-30",
      },
      {
        id: "3",
        companyName: "Northern Healthcare Solutions",
        contactPerson: "Musa Ibrahim",
        email: "musa@northernhealth.ng",
        phone: "+234 807 555 1234",
        registrationDate: "2024-01-13",
        status: "Approved",
        businessType: "Healthcare Technology",
        address: "78 Tech Avenue, Kano",
        lastActivity: "2024-02-02",
      },
    ];

    const mockTenders: Tender[] = [
      {
        id: "MOH-2024-001",
        title: "Hospital Equipment Supply",
        description:
          "Supply of medical equipment for 5 primary healthcare centers",
        category: "Medical Equipment",
        estimatedValue: "₦850,000,000",
        status: "Published",
        publishDate: "2024-01-15",
        closeDate: "2024-02-15",
        bidsReceived: 12,
        ministry: "Ministry of Health",
        procuringEntity: "Kano State Primary Healthcare Development Agency",
      },
      {
        id: "MOH-2024-002",
        title: "Pharmaceutical Supply Contract",
        description: "Annual supply of essential medicines for state hospitals",
        category: "Pharmaceuticals",
        estimatedValue: "₦1,200,000,000",
        status: "Draft",
        publishDate: "",
        closeDate: "2024-03-01",
        bidsReceived: 0,
        ministry: "Ministry of Health",
        procuringEntity: "Kano State Hospital Management Board",
      },
      {
        id: "MOH-2024-003",
        title: "Medical Laboratory Equipment",
        description:
          "Procurement of advanced laboratory equipment for diagnostic centers",
        category: "Laboratory Equipment",
        estimatedValue: "₦650,000,000",
        status: "Closed",
        publishDate: "2024-01-10",
        closeDate: "2024-01-31",
        bidsReceived: 8,
        ministry: "Ministry of Health",
        procuringEntity: "Kano State Ministry of Health",
      },
    ];

    const mockContracts: Contract[] = [
      {
        id: "CON-MOH-001",
        tenderId: "MOH-2024-001",
        contractorName: "MedSupply Nigeria Ltd",
        projectTitle: "Hospital Equipment Supply",
        contractValue: "₦850,000,000",
        startDate: "2024-02-01",
        endDate: "2024-08-01",
        status: "Active",
        performanceScore: 85,
        digitalSignature: "DS-KS-2024-001",
        documentHash: "SHA256-ABC123",
        milestones: [
          {
            id: "MIL-001",
            title: "Equipment Procurement",
            description: "Procure and prepare medical equipment",
            targetDate: "2024-03-15",
            completionDate: "2024-03-10",
            status: "Completed",
            paymentPercentage: 30,
            deliverables: ["Equipment list", "Quality certificates"],
            verificationStatus: "Verified"
          },
          {
            id: "MIL-002",
            title: "Delivery and Installation",
            description: "Deliver and install equipment at healthcare centers",
            targetDate: "2024-05-15",
            status: "In Progress",
            paymentPercentage: 50,
            deliverables: ["Installation certificates", "Training completion"],
            verificationStatus: "Under Review"
          },
          {
            id: "MIL-003",
            title: "Training and Handover",
            description: "Train staff and complete project handover",
            targetDate: "2024-07-15",
            status: "Pending",
            paymentPercentage: 20,
            deliverables: ["Training certificates", "User manuals"],
            verificationStatus: "Not Started"
          }
        ],
        payments: [
          {
            id: "PAY-001",
            milestoneId: "MIL-001",
            amount: "₦255,000,000",
            requestDate: "2024-03-12",
            approvalDate: "2024-03-15",
            paymentDate: "2024-03-18",
            status: "Paid",
            invoiceNumber: "INV-2024-001"
          },
          {
            id: "PAY-002",
            milestoneId: "MIL-002",
            amount: "₦425,000,000",
            requestDate: "2024-04-10",
            status: "Pending",
            invoiceNumber: "INV-2024-002"
          }
        ],
        disputes: []
      }
    ];

    const mockEvaluationCommittees: EvaluationCommittee[] = [
      {
        id: "EC-001",
        name: "Medical Equipment Evaluation Committee",
        chairperson: "Dr. Amina Hassan",
        secretary: "Eng. Musa Ibrahim",
        specialization: ["Medical Equipment", "Healthcare Technology"],
        activeEvaluations: ["MOH-2024-002"],
        status: "Active",
        members: [
          {
            id: "MEM-001",
            name: "Dr. Amina Hassan",
            role: "Chairperson",
            department: "Medical Services",
            email: "amina.hassan@health.kano.gov.ng",
            phone: "+234 803 123 4567",
            expertise: ["Medical Equipment", "Quality Assurance"],
            availability: "Available"
          },
          {
            id: "MEM-002",
            name: "Eng. Musa Ibrahim",
            role: "Technical Expert",
            department: "Engineering Services",
            email: "musa.ibrahim@health.kano.gov.ng",
            phone: "+234 805 987 6543",
            expertise: ["Engineering", "Technical Evaluation"],
            availability: "Available"
          },
          {
            id: "MEM-003",
            name: "Mal. Fatima Yusuf",
            role: "Financial Analyst",
            department: "Finance",
            email: "fatima.yusuf@health.kano.gov.ng",
            phone: "+234 807 555 1234",
            expertise: ["Financial Analysis", "Cost Evaluation"],
            availability: "Busy"
          }
        ]
      }
    ];

    const mockBidEvaluations: BidEvaluation[] = [
      {
        id: "EVAL-001",
        tenderId: "MOH-2024-002",
        companyId: "COMP-001",
        companyName: "Sahel Medical Supplies",
        evaluatorId: "MEM-001",
        technicalScore: 85,
        financialScore: 90,
        complianceScore: 95,
        totalScore: 90,
        comments: "Excellent technical proposal with competitive pricing",
        recommendations: "Recommended for award",
        status: "Submitted",
        submissionDate: "2024-02-15"
      }
    ];

    const mockVendorCommunications: VendorCommunication[] = [
      {
        id: "COMM-001",
        vendorId: "VEND-001",
        vendorName: "MedSupply Nigeria Ltd",
        subject: "Amendment to Tender MOH-2024-001",
        message: "Please note the amendment to delivery timeline in tender MOH-2024-001",
        type: "Amendment",
        channels: ["Email", "SMS"],
        sentDate: "2024-02-10",
        readStatus: true,
        responseRequired: false,
        priority: "Medium"
      }
    ];

    const mockScheduledPublications: ScheduledPublication[] = [
      {
        id: "SCHED-001",
        tenderId: "MOH-2024-004",
        tenderTitle: "Healthcare Infrastructure Development",
        scheduledDate: "2024-02-20",
        scheduledTime: "09:00",
        distributionChannels: ["Website", "Email", "SMS"],
        targetCategories: ["Construction", "Healthcare"],
        status: "Scheduled",
        createdBy: "Ministry Admin",
        notes: "Major infrastructure tender - ensure wide distribution"
      }
    ];

    const mockNOCRequests: NOCRequest[] = [
      {
        id: "NOC-MOH-001",
        projectTitle: "Hospital Equipment Supply - Phase 1",
        requestDate: "2024-01-25",
        status: "Approved",
        projectValue: "₦850,000,000",
        contractorName: "MedSupply Nigeria Ltd",
        expectedDuration: "6 months",
        approvalDate: "2024-01-28",
        certificateNumber: "KNS/MOP/PNO/2024/001",
      },
      {
        id: "NOC-MOH-002",
        projectTitle: "Medical Laboratory Equipment Installation",
        requestDate: "2024-02-01",
        status: "Pending",
        projectValue: "₦650,000,000",
        contractorName: "Northern Healthcare Solutions",
        expectedDuration: "4 months",
      },
    ];

    setCompanies(mockCompanies);
    setTenders(mockTenders);
    setNOCRequests(mockNOCRequests);
    setContracts(mockContracts);
    setEvaluationCommittees(mockEvaluationCommittees);
    setBidEvaluations(mockBidEvaluations);
    setVendorCommunications(mockVendorCommunications);
    setScheduledPublications(mockScheduledPublications);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tender.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {ministryInfo.name}
              </h1>
              <p className="text-gray-600">
                Manage your ministry's procurement activities, tenders, and
                vendor relationships.
              </p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Tenders
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {tenders.filter((t) => t.status === "Published").length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Approved Companies
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {companies.filter((c) => c.status === "Approved").length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      NOC Requests
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {nocRequests.length}
                    </p>
                  </div>
                  <FileCheck className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Bids
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {tenders.reduce((sum, t) => sum + t.bidsReceived, 0)}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Tenders
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {tenders.slice(0, 3).map((tender) => (
                      <div
                        key={tender.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {tender.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {tender.estimatedValue}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              tender.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : tender.status === "Draft"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {tender.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    NOC Status
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {nocRequests.slice(0, 3).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <FileCheck className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {request.projectTitle}
                          </p>
                          <p className="text-xs text-gray-600">
                            {request.contractorName}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "companies":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Company Approvals
              </h1>
              <p className="text-gray-600">
                View registered companies (read-only access)
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Approved Companies
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {companies.filter((c) => c.status === "Approved").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Approval
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {companies.filter((c) => c.status === "Pending").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Total Companies
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {companies.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Companies List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Registered Companies
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
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
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {company.companyName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {company.address}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">
                              {company.contactPerson}
                            </div>
                            <div className="text-sm text-gray-500">
                              {company.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {company.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {company.businessType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              company.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : company.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {company.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4 inline mr-1" />
                            View Details
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

      case "tenders":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tender Management
                </h1>
                <p className="text-gray-600">
                  Manage your ministry's procurement tenders
                </p>
              </div>
              <button
                onClick={() => setActiveTab("create-tender")}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Tender
              </button>
            </div>

            {/* Tender Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Total Tenders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tenders.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tenders.filter((t) => t.status === "Published").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Under Evaluation
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        tenders.filter(
                          (t) =>
                            t.status === "Closed" || t.status === "Evaluated",
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Awarded</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tenders.filter((t) => t.status === "Awarded").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tenders List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    My Ministry's Tenders
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tenders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Closed">Closed</option>
                      <option value="Evaluated">Evaluated</option>
                      <option value="Awarded">Awarded</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tender Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value & Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bids
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTenders.map((tender) => (
                      <tr key={tender.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tender.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tender.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tender.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tender.estimatedValue}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tender.publishDate &&
                                `Published: ${new Date(tender.publishDate).toLocaleDateString()}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              Close:{" "}
                              {new Date(tender.closeDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tender.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : tender.status === "Draft"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : tender.status === "Closed"
                                    ? "bg-blue-100 text-blue-800"
                                    : tender.status === "Evaluated"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tender.bidsReceived}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4 inline mr-1" />
                            View
                          </button>
                          {tender.status === "Draft" && (
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4 inline mr-1" />
                              Edit
                            </button>
                          )}
                          {tender.status === "Closed" && (
                            <button className="text-purple-600 hover:text-purple-900">
                              <Award className="h-4 w-4 inline mr-1" />
                              Evaluate
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

      case "create-tender":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Create New Tender
                </h1>
                <p className="text-gray-600">
                  Create a new procurement tender for your ministry
                </p>
              </div>
              <button
                onClick={() => setActiveTab("tenders")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ← Back to Tenders
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tender Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tender Title *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter tender title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select category</option>
                      <option value="Medical Equipment">
                        Medical Equipment
                      </option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                      <option value="Laboratory Equipment">
                        Laboratory Equipment
                      </option>
                      <option value="Medical Supplies">Medical Supplies</option>
                      <option value="Healthcare Services">
                        Healthcare Services
                      </option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Detailed description of the procurement requirement"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Value *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="₦0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Procurement Method
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="Open Tender">Open Tender</option>
                      <option value="Selective Tender">Selective Tender</option>
                      <option value="Direct Procurement">
                        Direct Procurement
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Date *
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Procuring Entity
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={ministryInfo.name}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={ministryInfo.contactEmail}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Save as Draft
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Publish Tender
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-600">
                View procurement analytics and generate reports for your
                ministry
              </p>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                  Procurement by Category
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      category: "Medical Equipment",
                      amount: "₦850M",
                      percentage: 35,
                    },
                    {
                      category: "Pharmaceuticals",
                      amount: "₦1.2B",
                      percentage: 50,
                    },
                    {
                      category: "Laboratory Equipment",
                      amount: "₦650M",
                      percentage: 27,
                    },
                    {
                      category: "Medical Supplies",
                      amount: "₦300M",
                      percentage: 12,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.category}
                        </p>
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
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      metric: "Average Bid Response",
                      value: "12 bids",
                      trend: "up",
                    },
                    {
                      metric: "Procurement Cycle Time",
                      value: "28 days",
                      trend: "down",
                    },
                    { metric: "Cost Savings", value: "15.2%", trend: "up" },
                    { metric: "Compliance Rate", value: "98.5%", trend: "up" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">
                        {item.metric}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {item.value}
                        </span>
                        <TrendingUp
                          className={`h-4 w-4 ${
                            item.trend === "up"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Generation */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Download className="h-5 w-5 text-purple-600 mr-2" />
                  Generate Reports
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Monthly Procurement Summary",
                      desc: "Complete overview of monthly activities",
                      type: "summary",
                    },
                    {
                      title: "Vendor Performance Report",
                      desc: "Analysis of supplier performance",
                      type: "vendor",
                    },
                    {
                      title: "Compliance Audit Report",
                      desc: "Regulatory compliance overview",
                      type: "compliance",
                    },
                    {
                      title: "Financial Analysis",
                      desc: "Budget utilization and savings",
                      type: "financial",
                    },
                    {
                      title: "Tender Analysis",
                      desc: "Bid response and success rates",
                      type: "tender",
                    },
                    {
                      title: "NOC Request Report",
                      desc: "No Objection Certificate tracking",
                      type: "noc",
                    },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {report.desc}
                      </p>
                      <button className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "noc-requests":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  No Objection Certificate Requests
                </h1>
                <p className="text-gray-600">
                  Request NOC for awarded contracts and track approval status
                </p>
              </div>
              <button
                onClick={() => setShowNOCRequest(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                New NOC Request
              </button>
            </div>

            {/* NOC Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Send className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Total Requests
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nocRequests.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Approved
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        nocRequests.filter((r) => r.status === "Approved")
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {nocRequests.filter((r) => r.status === "Pending").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NOC Requests List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  NOC Request History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contractor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value & Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nocRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.projectTitle}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              Requested:{" "}
                              {new Date(
                                request.requestDate,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.contractorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.projectValue}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.expectedDuration}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                          {request.status === "Approved" && (
                            <div className="text-xs text-gray-500 mt-1">
                              {request.certificateNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4 inline mr-1" />
                            View
                          </button>
                          {request.status === "Approved" && (
                            <button className="text-green-600 hover:text-green-900">
                              <Download className="h-4 w-4 inline mr-1" />
                              Download Certificate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NOC Request Modal */}
            {showNOCRequest && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Request No Objection Certificate
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Title *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter project title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Awarded Contractor *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter contractor name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Value *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="₦0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Duration *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., 6 months"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Location
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enter project location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Notes
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Any additional information"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowNOCRequest(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowNOCRequest(false);
                        alert(
                          "NOC request submitted successfully! You will be notified when it's reviewed.",
                        );
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "advanced-tender-mgmt":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  🤖 AI-Powered Advanced Tender Management
                </h1>
                <p className="text-gray-600">
                  Leverage AI assistance for intelligent tender creation, categorization, and management
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setAiAssistantActive(!aiAssistantActive)}
                  className={`inline-flex items-center px-4 py-2 rounded-md ${
                    aiAssistantActive
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  } hover:bg-purple-700`}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  AI Assistant {aiAssistantActive ? "ON" : "OFF"}
                </button>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Timer className="h-4 w-4 mr-2" />
                  Schedule Publication
                </button>
              </div>
            </div>

            {/* AI Assistant Panel */}
            {aiAssistantActive && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">AI Tender Assistant</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                        <Zap className="h-5 w-5 text-purple-600 mb-2" />
                        <h4 className="font-medium text-gray-900">Smart Categorization</h4>
                        <p className="text-sm text-gray-600">AI-powered tender category suggestion</p>
                      </button>
                      <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                        <Target className="h-5 w-5 text-purple-600 mb-2" />
                        <h4 className="font-medium text-gray-900">Requirements Analysis</h4>
                        <p className="text-sm text-gray-600">Analyze and optimize tender requirements</p>
                      </button>
                      <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                        <Users2 className="h-5 w-5 text-purple-600 mb-2" />
                        <h4 className="font-medium text-gray-900">Vendor Matching</h4>
                        <p className="text-sm text-gray-600">Intelligent vendor recommendation</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled Publications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Timer className="h-5 w-5 text-blue-600 mr-2" />
                  Scheduled Publications
                </h2>
                <span className="text-sm text-gray-500">{scheduledPublications.length} scheduled</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scheduledPublications.map((pub) => (
                    <div key={pub.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{pub.tenderTitle}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pub.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                          pub.status === "Published" ? "bg-green-100 text-green-800" :
                          pub.status === "Failed" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {pub.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><Calendar className="h-4 w-4 inline mr-1" />{pub.scheduledDate} at {pub.scheduledTime}</p>
                        <div className="flex flex-wrap gap-1">
                          {pub.distributionChannels.map((channel) => (
                            <span key={channel} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {channel === "Website" && <Globe className="h-3 w-3 mr-1" />}
                              {channel === "Email" && <Mail className="h-3 w-3 mr-1" />}
                              {channel === "SMS" && <Smartphone className="h-3 w-3 mr-1" />}
                              {channel === "Newspaper" && <BookOpen className="h-3 w-3 mr-1" />}
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm">
                          <Edit className="h-4 w-4 inline mr-1" />Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm">
                          <StopCircle className="h-4 w-4 inline mr-1" />Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Amendment Tracking */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <RefreshCw className="h-5 w-5 text-orange-600 mr-2" />
                  Amendment Tracking & Notifications
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Recent Amendments</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">MOH-2024-001</h4>
                            <p className="text-sm text-gray-600">Delivery timeline extended by 2 weeks</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                            Amendment 1
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Notification Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Email Notifications</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">SMS Alerts</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Portal Updates</span>
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "bulk-tender-upload":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  📊 Bulk Tender Upload & Management
                </h1>
                <p className="text-gray-600">
                  Efficiently upload and manage multiple tenders simultaneously
                </p>
              </div>
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Start Bulk Upload
              </button>
            </div>

            {/* Upload Templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <Download className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Excel Template</h3>
                <p className="text-sm text-gray-600 mb-4">Standard template for bulk tender upload</p>
                <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-md hover:bg-green-100">
                  Download Template
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <Download className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">CSV Template</h3>
                <p className="text-sm text-gray-600 mb-4">Comma-separated values format</p>
                <button className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100">
                  Download Template
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <Eye className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
                <p className="text-sm text-gray-600 mb-4">Step-by-step upload instructions</p>
                <button className="w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-md hover:bg-purple-100">
                  View Guide
                </button>
              </div>
            </div>

            {/* Upload History */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  Upload History
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Results
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Batch Upload #001</div>
                          <div className="text-sm text-gray-500">February 15, 2024 at 2:30 PM</div>
                          <div className="text-sm text-gray-500">By: Ministry Admin</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">health_tenders_Q1.xlsx</div>
                          <div className="text-sm text-gray-500">248 KB • 15 records</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">12 successful</div>
                        <div className="text-sm text-red-600">3 failed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4 inline mr-1" />View Report
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4 inline mr-1" />Download
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Processing Status */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  Processing Queue
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active uploads</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All bulk uploads have been processed successfully.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "evaluation-management":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  ⚖️ Evaluation Process Management
                </h1>
                <p className="text-gray-600">
                  Comprehensive tools for managing evaluation committees and bid assessments
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEvaluationModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Users2 className="h-4 w-4 mr-2" />
                  Create Committee
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Committee Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Users2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Committees</p>
                    <p className="text-2xl font-bold text-gray-900">{evaluationCommittees.filter(c => c.status === "Active").length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <CheckSquare className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Completed Evaluations</p>
                    <p className="text-2xl font-bold text-gray-900">{bidEvaluations.filter(e => e.status === "Final").length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{bidEvaluations.filter(e => e.status === "Submitted").length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Committees */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users2 className="h-5 w-5 text-purple-600 mr-2" />
                  Evaluation Committees
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {evaluationCommittees.map((committee) => (
                    <div key={committee.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{committee.name}</h3>
                          <p className="text-sm text-gray-600">Chair: {committee.chairperson}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          committee.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {committee.status}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Specialization:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {committee.specialization.map((spec) => (
                              <span key={spec} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Members ({committee.members.length}):</p>
                          <div className="mt-2 space-y-1">
                            {committee.members.slice(0, 3).map((member) => (
                              <div key={member.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-900">{member.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  member.availability === "Available" ? "bg-green-100 text-green-800" :
                                  member.availability === "Busy" ? "bg-orange-100 text-orange-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {member.availability}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-3 border-t border-gray-200">
                          <button className="text-blue-600 hover:text-blue-900 text-sm">
                            <Eye className="h-4 w-4 inline mr-1" />View Details
                          </button>
                          <button className="text-green-600 hover:text-green-900 text-sm">
                            <Edit className="h-4 w-4 inline mr-1" />Edit
                          </button>
                          <button className="text-purple-600 hover:text-purple-900 text-sm">
                            <Send className="h-4 w-4 inline mr-1" />Assign Tender
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Evaluation Pipeline */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clipboard className="h-5 w-5 text-blue-600 mr-2" />
                  Evaluation Pipeline
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-800 mb-2">Awaiting Assignment</h3>
                    <p className="text-2xl font-bold text-yellow-900">2</p>
                    <p className="text-sm text-yellow-700">Tenders ready for evaluation</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">In Progress</h3>
                    <p className="text-2xl font-bold text-blue-900">1</p>
                    <p className="text-sm text-blue-700">Active evaluations</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-medium text-purple-800 mb-2">Under Review</h3>
                    <p className="text-2xl font-bold text-purple-900">1</p>
                    <p className="text-sm text-purple-700">Awaiting final review</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">Completed</h3>
                    <p className="text-2xl font-bold text-green-900">3</p>
                    <p className="text-sm text-green-700">Ready for award</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Distribution */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-2" />
                  Secure Document Distribution
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Distribution Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">MOH-2024-002 Bid Documents</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Distributed</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Technical Specifications</span>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-600">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Security Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>End-to-end encryption</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileCheck className="h-4 w-4 text-green-600" />
                        <span>Digital signatures</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span>Access tracking</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Timer className="h-4 w-4 text-green-600" />
                        <span>Time-limited access</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "contract-management":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  📋 Contract Management & Monitoring
                </h1>
                <p className="text-gray-600">
                  Comprehensive contract lifecycle management with digital execution and performance tracking
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContractModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Contract
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Reports
                </button>
              </div>
            </div>

            {/* Contract Overview Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <FileCheck className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                    <p className="text-2xl font-bold text-gray-900">{contracts.filter(c => c.status === "Active").length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Contract Value</p>
                    <p className="text-2xl font-bold text-gray-900">₦2.3B</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Contracts */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileCheck className="h-5 w-5 text-blue-600 mr-2" />
                  Active Contracts
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{contract.projectTitle}</h3>
                          <p className="text-sm text-gray-600">{contract.id} • {contract.contractorName}</p>
                          <p className="text-sm text-green-600 font-medium">{contract.contractValue}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            contract.status === "Active" ? "bg-green-100 text-green-800" :
                            contract.status === "Completed" ? "bg-blue-100 text-blue-800" :
                            contract.status === "Suspended" ? "bg-orange-100 text-orange-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {contract.status}
                          </span>
                          <div className="mt-2 text-sm text-gray-500">
                            Performance: {contract.performanceScore}%
                          </div>
                        </div>
                      </div>

                      {/* Milestone Progress */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Milestone Progress</h4>
                        <div className="space-y-2">
                          {contract.milestones.map((milestone, index) => (
                            <div key={milestone.id} className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                milestone.status === "Completed" ? "bg-green-100 text-green-800" :
                                milestone.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                milestone.status === "Overdue" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">{milestone.title}</span>
                                  <span className="text-xs text-gray-500">{milestone.paymentPercentage}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">Target: {milestone.targetDate}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    milestone.verificationStatus === "Verified" ? "bg-green-100 text-green-700" :
                                    milestone.verificationStatus === "Under Review" ? "bg-yellow-100 text-yellow-700" :
                                    milestone.verificationStatus === "Rejected" ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-600"
                                  }`}>
                                    {milestone.verificationStatus}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Payment Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {contract.payments.map((payment) => (
                            <div key={payment.id} className={`p-3 rounded-lg border ${
                              payment.status === "Paid" ? "bg-green-50 border-green-200" :
                              payment.status === "Approved" ? "bg-blue-50 border-blue-200" :
                              payment.status === "Pending" ? "bg-yellow-50 border-yellow-200" :
                              "bg-red-50 border-red-200"
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{payment.amount}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  payment.status === "Paid" ? "bg-green-100 text-green-800" :
                                  payment.status === "Approved" ? "bg-blue-100 text-blue-800" :
                                  payment.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-red-100 text-red-800"
                                }`}>
                                  {payment.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{payment.invoiceNumber}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <button className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </button>
                        <button className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Update Milestone
                        </button>
                        <button className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 text-sm">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Process Payment
                        </button>
                        <button className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 text-sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Dispute Resolution
                        </button>
                        <button className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm">
                          <Download className="h-3 w-3 mr-1" />
                          Export Contract
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Digital Signature & Security */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  Digital Contract Security
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Digital Signatures</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Contract CON-MOH-001</span>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Verified</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Amendment #1</span>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-blue-600">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Blockchain Integration</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Contract hash stored on blockchain</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Immutable audit trail</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Tamper-proof documentation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "vendor-communication":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  💬 Vendor Communication Hub
                </h1>
                <p className="text-gray-600">
                  Multi-channel communication system for vendor notifications and interactions
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowVendorCommModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Communication
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Broadcast Alert
                </button>
              </div>
            </div>

            {/* Communication Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Smartphone className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">SMS Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">856</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Portal Notifications</p>
                    <p className="text-2xl font-bold text-gray-900">2,134</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Read Rate</p>
                    <p className="text-2xl font-bold text-gray-900">94%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Mail className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Email Communications</h3>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Rate</span>
                    <span className="font-medium text-gray-900">99.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Open Rate</span>
                    <span className="font-medium text-gray-900">87.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Click Rate</span>
                    <span className="font-medium text-gray-900">23.8%</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100">
                  View Email Analytics
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Smartphone className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Rate</span>
                    <span className="font-medium text-gray-900">98.7%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-medium text-gray-900">12.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Opt-out Rate</span>
                    <span className="font-medium text-gray-900">0.8%</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-green-50 text-green-700 py-2 px-4 rounded-md hover:bg-green-100">
                  Manage SMS Settings
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Globe className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Portal Alerts</h3>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium text-gray-900">1,456</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Visits</span>
                    <span className="font-medium text-gray-900">2,847</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Engagement</span>
                    <span className="font-medium text-gray-900">76.4%</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-purple-50 text-purple-700 py-2 px-4 rounded-md hover:bg-purple-100">
                  Portal Dashboard
                </button>
              </div>
            </div>

            {/* Recent Communications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                  Recent Communications
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Communication Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Channels
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendorCommunications.map((comm) => (
                      <tr key={comm.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{comm.subject}</div>
                            <div className="text-sm text-gray-500">{comm.type}</div>
                            <div className="text-sm text-gray-500">{comm.sentDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{comm.vendorName}</div>
                          <div className="text-sm text-gray-500">{comm.vendorId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {comm.channels.map((channel) => (
                              <span key={channel} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {channel === "Email" && <Mail className="h-3 w-3 mr-1" />}
                                {channel === "SMS" && <Smartphone className="h-3 w-3 mr-1" />}
                                {channel === "Portal" && <Globe className="h-3 w-3 mr-1" />}
                                {channel}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              comm.readStatus ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {comm.readStatus ? "Read" : "Unread"}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              comm.priority === "Urgent" ? "bg-red-100 text-red-800" :
                              comm.priority === "High" ? "bg-orange-100 text-orange-800" :
                              comm.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {comm.priority}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4 inline mr-1" />View
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <MessageSquare className="h-4 w-4 inline mr-1" />Reply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category-Based Targeting */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 text-purple-600 mr-2" />
                  Intelligent Category-Based Targeting
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Vendor Categories</h3>
                    <div className="space-y-2">
                      {["Medical Equipment", "Pharmaceuticals", "Construction", "ICT Services", "Consultancy"].map((category) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700">{category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">156 vendors</span>
                            <button className="text-blue-600 hover:text-blue-900 text-xs">
                              <Send className="h-3 w-3 inline mr-1" />Target
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Automated Follow-ups</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Tender Submission Reminders</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Document Update Alerts</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm text-gray-700">Award Notifications</span>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs text-yellow-600">Scheduled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-700">
                  {ministryInfo.name}
                </h1>
                <p className="text-xs text-gray-600">Ministry Dashboard</p>
              </div>
            </div>

            {/* Quick Access Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "dashboard"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab("tenders")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "tenders"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Tenders</span>
              </button>
              <button
                onClick={() => setActiveTab("contract-management")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "contract-management"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <FileCheck className="h-4 w-4" />
                <span>Contracts</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Secondary Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { key: "dashboard", label: "Dashboard", icon: BarChart3 },
              { key: "companies", label: "Companies", icon: Users },
              { key: "tenders", label: "Tenders", icon: FileText },
              { key: "advanced-tender-mgmt", label: "AI Tender Mgmt", icon: Bot },
              { key: "bulk-tender-upload", label: "Bulk Upload", icon: Upload },
              { key: "evaluation-management", label: "Evaluation", icon: CheckSquare },
              { key: "contract-management", label: "Contracts", icon: FileCheck },
              { key: "vendor-communication", label: "Vendor Comm", icon: MessageSquare },
              { key: "reports", label: "Reports", icon: TrendingUp },
              { key: "noc-requests", label: "NOC Requests", icon: Send },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ActiveTab)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "text-green-700 bg-green-50 border border-green-200"
                    : "text-gray-700 hover:text-green-700 hover:bg-green-50"
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
    </div>
  );
}
