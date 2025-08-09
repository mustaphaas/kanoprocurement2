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

            <nav className="hidden md:flex items-center space-x-8">
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
                onClick={() => setActiveTab("companies")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "companies"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Companies</span>
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
                onClick={() => setActiveTab("reports")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "reports"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Reports</span>
              </button>
              <button
                onClick={() => setActiveTab("noc-requests")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === "noc-requests"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <Send className="h-4 w-4" />
                <span>NOC Requests</span>
              </button>
            </nav>

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderDashboardContent()}
      </main>
    </div>
  );
}
