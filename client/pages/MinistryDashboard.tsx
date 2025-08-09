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
  X,
} from "lucide-react";

type CurrentView =
  | "overview"
  | "companies"
  | "tenders"
  | "contracts"
  | "reports"
  | "noc";

type TenderSubView =
  | "list"
  | "create"
  | "ai-management"
  | "bulk-upload"
  | "evaluation"
  | "award";

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

interface VendorWorkflowStatus {
  companyId: string;
  companyName: string;
  registrationCompleted: boolean;
  loginVerificationCompleted: boolean;
  biddingCompleted: boolean;
  evaluationCompleted: boolean;
  nocIssued: boolean;
  finalApprovalStatus: "pending" | "approved" | "rejected";
  registrationDate?: string;
  verificationDate?: string;
  bidSubmissionDate?: string;
  evaluationDate?: string;
  nocIssuedDate?: string;
  nocCertificateNumber?: string;
}

interface VendorCommunication {
  id: string;
  vendorId: string;
  vendorName: string;
  subject: string;
  message: string;
  type:
    | "Tender Alert"
    | "Amendment"
    | "Clarification"
    | "Award Notice"
    | "General";
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
  const [currentView, setCurrentView] = useState<CurrentView>("overview");
  const [tenderSubView, setTenderSubView] = useState<TenderSubView>("list");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [nocRequests, setNOCRequests] = useState<NOCRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateTender, setShowCreateTender] = useState(false);
  const [showNOCRequest, setShowNOCRequest] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [evaluationCommittees, setEvaluationCommittees] = useState<
    EvaluationCommittee[]
  >([]);
  const [bidEvaluations, setBidEvaluations] = useState<BidEvaluation[]>([]);
  const [vendorCommunications, setVendorCommunications] = useState<
    VendorCommunication[]
  >([]);
  const [scheduledPublications, setScheduledPublications] = useState<
    ScheduledPublication[]
  >([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<BidEvaluation | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showVendorCommModal, setShowVendorCommModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedContractForAction, setSelectedContractForAction] = useState<Contract | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [contractFormData, setContractFormData] = useState({
    tenderId: "",
    contractorName: "",
    projectTitle: "",
    contractValue: "",
    startDate: "",
    endDate: "",
    description: "",
    milestones: [
      { title: "Initial Delivery", percentage: 30, targetDate: "", description: "" },
      { title: "Progress Review", percentage: 40, targetDate: "", description: "" },
      { title: "Final Completion", percentage: 30, targetDate: "", description: "" },
    ],
    terms: "",
    paymentSchedule: "milestone",
    penalties: "",
    warranties: "",
    digitalSignature: true,
    blockchainVerification: false,
    autoExecution: false,
  });
  const [contractStep, setContractStep] = useState(1);
  const [generatedContract, setGeneratedContract] = useState<string>("");
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [selectedTenderForAward, setSelectedTenderForAward] = useState<Tender | null>(null);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardFormData, setAwardFormData] = useState({
    selectedBidder: "",
    awardValue: "",
    awardJustification: "",
    contractDuration: "",
    performanceBond: "",
    advancePayment: "",
    liquidatedDamages: "",
    warrantyPeriod: "",
    deliverySchedule: "",
    specialConditions: "",
  });
  const [vendorWorkflowStatuses, setVendorWorkflowStatuses] = useState<VendorWorkflowStatus[]>([]);
  const [bidders] = useState([
    {
      id: "BID-001",
      companyName: "MedSupply Nigeria Ltd",
      bidAmount: "₦820,000,000",
      technicalScore: 92,
      financialScore: 88,
      totalScore: 90,
      status: "Qualified",
      submissionDate: "2024-02-10",
      experience: "15 years",
      certifications: ["ISO 9001", "ISO 13485", "FDA Approved"],
      previousProjects: 45,
      completionRate: 98.5,
    },
    {
      id: "BID-002",
      companyName: "Sahel Medical Supplies",
      bidAmount: "₦850,000,000",
      technicalScore: 88,
      financialScore: 85,
      totalScore: 86.5,
      status: "Qualified",
      submissionDate: "2024-02-09",
      experience: "12 years",
      certifications: ["ISO 9001", "GMP Certified"],
      previousProjects: 32,
      completionRate: 96.8,
    },
    {
      id: "BID-003",
      companyName: "Northern Healthcare Solutions",
      bidAmount: "₦875,000,000",
      technicalScore: 85,
      financialScore: 82,
      totalScore: 83.5,
      status: "Qualified",
      submissionDate: "2024-02-08",
      experience: "10 years",
      certifications: ["ISO 9001"],
      previousProjects: 28,
      completionRate: 94.2,
    },
  ]);
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
            verificationStatus: "Verified",
          },
          {
            id: "MIL-002",
            title: "Delivery and Installation",
            description: "Deliver and install equipment at healthcare centers",
            targetDate: "2024-05-15",
            status: "In Progress",
            paymentPercentage: 50,
            deliverables: ["Installation certificates", "Training completion"],
            verificationStatus: "Under Review",
          },
          {
            id: "MIL-003",
            title: "Training and Handover",
            description: "Train staff and complete project handover",
            targetDate: "2024-07-15",
            status: "Pending",
            paymentPercentage: 20,
            deliverables: ["Training certificates", "User manuals"],
            verificationStatus: "Not Started",
          },
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
            invoiceNumber: "INV-2024-001",
          },
          {
            id: "PAY-002",
            milestoneId: "MIL-002",
            amount: "₦425,000,000",
            requestDate: "2024-04-10",
            status: "Pending",
            invoiceNumber: "INV-2024-002",
          },
        ],
        disputes: [],
      },
      {
        id: "CON-MOH-002",
        tenderId: "MOH-2024-002",
        contractorName: "Sahel Medical Supplies",
        projectTitle: "Pharmaceutical Supply Contract",
        contractValue: "₦1,200,000,000",
        startDate: "2024-03-01",
        endDate: "2025-02-28",
        status: "Active",
        performanceScore: 92,
        digitalSignature: "DS-KS-2024-002",
        documentHash: "SHA256-DEF456",
        milestones: [
          {
            id: "MIL-004",
            title: "Q1 Drug Supply",
            description: "Supply essential medicines for Q1",
            targetDate: "2024-03-31",
            completionDate: "2024-03-30",
            status: "Completed",
            paymentPercentage: 25,
            deliverables: ["Drug delivery certificates", "Quality reports"],
            verificationStatus: "Verified",
          },
          {
            id: "MIL-005",
            title: "Q2 Drug Supply",
            description: "Supply essential medicines for Q2",
            targetDate: "2024-06-30",
            status: "In Progress",
            paymentPercentage: 25,
            deliverables: ["Drug delivery certificates", "Quality reports"],
            verificationStatus: "Under Review",
          },
          {
            id: "MIL-006",
            title: "Q3 Drug Supply",
            description: "Supply essential medicines for Q3",
            targetDate: "2024-09-30",
            status: "Pending",
            paymentPercentage: 25,
            deliverables: ["Drug delivery certificates", "Quality reports"],
            verificationStatus: "Not Started",
          },
          {
            id: "MIL-007",
            title: "Q4 Drug Supply",
            description: "Supply essential medicines for Q4",
            targetDate: "2024-12-31",
            status: "Pending",
            paymentPercentage: 25,
            deliverables: ["Drug delivery certificates", "Quality reports"],
            verificationStatus: "Not Started",
          },
        ],
        payments: [
          {
            id: "PAY-003",
            milestoneId: "MIL-004",
            amount: "₦300,000,000",
            requestDate: "2024-03-30",
            approvalDate: "2024-04-02",
            paymentDate: "2024-04-05",
            status: "Paid",
            invoiceNumber: "INV-2024-003",
          },
          {
            id: "PAY-004",
            milestoneId: "MIL-005",
            amount: "₦300,000,000",
            requestDate: "2024-06-25",
            status: "Approved",
            invoiceNumber: "INV-2024-004",
          },
        ],
        disputes: [],
      },
      {
        id: "CON-MOH-003",
        tenderId: "MOH-2024-003",
        contractorName: "Northern Healthcare Solutions",
        projectTitle: "Medical Laboratory Equipment",
        contractValue: "₦650,000,000",
        startDate: "2024-02-15",
        endDate: "2024-06-15",
        status: "Suspended",
        performanceScore: 68,
        digitalSignature: "DS-KS-2024-003",
        documentHash: "SHA256-GHI789",
        milestones: [
          {
            id: "MIL-008",
            title: "Equipment Manufacturing",
            description: "Manufacture laboratory equipment",
            targetDate: "2024-04-15",
            status: "Overdue",
            paymentPercentage: 40,
            deliverables: ["Manufacturing certificates", "Quality tests"],
            verificationStatus: "Rejected",
          },
          {
            id: "MIL-009",
            title: "Equipment Delivery",
            description: "Deliver equipment to laboratories",
            targetDate: "2024-05-15",
            status: "Pending",
            paymentPercentage: 40,
            deliverables: ["Delivery receipts", "Installation guides"],
            verificationStatus: "Not Started",
          },
          {
            id: "MIL-010",
            title: "Final Commissioning",
            description: "Commission and test all equipment",
            targetDate: "2024-06-15",
            status: "Pending",
            paymentPercentage: 20,
            deliverables: ["Commissioning reports", "Training completion"],
            verificationStatus: "Not Started",
          },
        ],
        payments: [
          {
            id: "PAY-005",
            milestoneId: "MIL-008",
            amount: "₦260,000,000",
            requestDate: "2024-04-20",
            status: "Rejected",
            invoiceNumber: "INV-2024-005",
          },
        ],
        disputes: [
          {
            id: "DIS-001",
            title: "Quality Standards Non-Compliance",
            description: "Equipment failed quality standards during verification",
            raisedBy: "Ministry",
            raisedDate: "2024-04-18",
            status: "Under Mediation",
            mediator: "Kano State Procurement Review Board",
          },
        ],
      },
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
            availability: "Available",
          },
          {
            id: "MEM-002",
            name: "Eng. Musa Ibrahim",
            role: "Technical Expert",
            department: "Engineering Services",
            email: "musa.ibrahim@health.kano.gov.ng",
            phone: "+234 805 987 6543",
            expertise: ["Engineering", "Technical Evaluation"],
            availability: "Available",
          },
          {
            id: "MEM-003",
            name: "Mal. Fatima Yusuf",
            role: "Financial Analyst",
            department: "Finance",
            email: "fatima.yusuf@health.kano.gov.ng",
            phone: "+234 807 555 1234",
            expertise: ["Financial Analysis", "Cost Evaluation"],
            availability: "Busy",
          },
        ],
      },
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
        submissionDate: "2024-02-15",
      },
    ];

    const mockVendorCommunications: VendorCommunication[] = [
      {
        id: "COMM-001",
        vendorId: "VEND-001",
        vendorName: "MedSupply Nigeria Ltd",
        subject: "Amendment to Tender MOH-2024-001",
        message:
          "Please note the amendment to delivery timeline in tender MOH-2024-001",
        type: "Amendment",
        channels: ["Email", "SMS"],
        sentDate: "2024-02-10",
        readStatus: true,
        responseRequired: false,
        priority: "Medium",
      },
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
        notes: "Major infrastructure tender - ensure wide distribution",
      },
    ];

    const mockVendorWorkflowStatuses: VendorWorkflowStatus[] = [
      {
        companyId: "BID-001",
        companyName: "MedSupply Nigeria Ltd",
        registrationCompleted: true,
        loginVerificationCompleted: true,
        biddingCompleted: true,
        evaluationCompleted: true,
        nocIssued: true,
        finalApprovalStatus: "approved",
        registrationDate: "2024-01-15",
        verificationDate: "2024-01-16",
        bidSubmissionDate: "2024-02-10",
        evaluationDate: "2024-02-12",
        nocIssuedDate: "2024-02-14",
        nocCertificateNumber: "NOC-001-2024",
      },
      {
        companyId: "BID-002",
        companyName: "Sahel Medical Supplies",
        registrationCompleted: true,
        loginVerificationCompleted: true,
        biddingCompleted: true,
        evaluationCompleted: true,
        nocIssued: true,
        finalApprovalStatus: "approved",
        registrationDate: "2024-01-14",
        verificationDate: "2024-01-15",
        bidSubmissionDate: "2024-02-09",
        evaluationDate: "2024-02-11",
        nocIssuedDate: "2024-02-13",
        nocCertificateNumber: "NOC-002-2024",
      },
      {
        companyId: "BID-003",
        companyName: "Northern Healthcare Solutions",
        registrationCompleted: true,
        loginVerificationCompleted: true,
        biddingCompleted: true,
        evaluationCompleted: true,
        nocIssued: true,
        finalApprovalStatus: "approved",
        registrationDate: "2024-01-13",
        verificationDate: "2024-01-14",
        bidSubmissionDate: "2024-02-08",
        evaluationDate: "2024-02-10",
        nocIssuedDate: "2024-02-12",
        nocCertificateNumber: "NOC-003-2024",
      },
    ];

    setCompanies(mockCompanies);
    setTenders(mockTenders);
    setContracts(mockContracts);
    setNOCRequests(mockNOCRequests);
    setEvaluationCommittees(mockEvaluationCommittees);
    setBidEvaluations(mockBidEvaluations);
    setVendorCommunications(mockVendorCommunications);
    setScheduledPublications(mockScheduledPublications);
    setVendorWorkflowStatuses(mockVendorWorkflowStatuses);
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

  const renderOverview = () => (
    <div className="space-y-8">
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

  const renderCompanies = () => (
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

  const renderTenderList = () => (
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
          onClick={() => setTenderSubView("create")}
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

  const renderCreateTender = () => (
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
          onClick={() => setTenderSubView("list")}
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

  const renderAITenderManagement = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🤖 AI-Powered Advanced Tender Management
          </h1>
          <p className="text-gray-600">
            Leverage AI assistance for intelligent tender creation,
            categorization, and management
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
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                AI Tender Assistant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <Zap className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">
                    Smart Categorization
                  </h4>
                  <p className="text-sm text-gray-600">
                    AI-powered tender category suggestion
                  </p>
                </button>
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <Target className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">
                    Requirements Analysis
                  </h4>
                  <p className="text-sm text-gray-600">
                    Analyze and optimize tender requirements
                  </p>
                </button>
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <Users2 className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">
                    Vendor Matching
                  </h4>
                  <p className="text-sm text-gray-600">
                    Intelligent vendor recommendation
                  </p>
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
          <span className="text-sm text-gray-500">
            {scheduledPublications.length} scheduled
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledPublications.map((pub) => (
              <div
                key={pub.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 line-clamp-2">
                    {pub.tenderTitle}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pub.status === "Scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : pub.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : pub.status === "Failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {pub.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {pub.scheduledDate} at {pub.scheduledTime}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {pub.distributionChannels.map((channel) => (
                      <span
                        key={channel}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {channel === "Website" && (
                          <Globe className="h-3 w-3 mr-1" />
                        )}
                        {channel === "Email" && (
                          <Mail className="h-3 w-3 mr-1" />
                        )}
                        {channel === "SMS" && (
                          <Smartphone className="h-3 w-3 mr-1" />
                        )}
                        {channel === "Newspaper" && (
                          <BookOpen className="h-3 w-3 mr-1" />
                        )}
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900 text-sm">
                    <StopCircle className="h-4 w-4 inline mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBulkUpload = () => (
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
          <h3 className="font-semibold text-gray-900 mb-2">
            Excel Template
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Standard template for bulk tender upload
          </p>
          <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-md hover:bg-green-100">
            Download Template
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
            <Download className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            CSV Template
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Comma-separated values format
          </p>
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
          <p className="text-sm text-gray-600 mb-4">
            Step-by-step upload instructions
          </p>
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
                    <div className="text-sm font-medium text-gray-900">
                      Batch Upload #001
                    </div>
                    <div className="text-sm text-gray-500">
                      February 15, 2024 at 2:30 PM
                    </div>
                    <div className="text-sm text-gray-500">
                      By: Ministry Admin
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      health_tenders_Q1.xlsx
                    </div>
                    <div className="text-sm text-gray-500">
                      248 KB • 15 records
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    12 successful
                  </div>
                  <div className="text-sm text-red-600">3 failed</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="h-4 w-4 inline mr-1" />
                    View Report
                  </button>
                  <button className="text-green-600 hover:text-green-900">
                    <Download className="h-4 w-4 inline mr-1" />
                    Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEvaluationManagement = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ⚖️ Evaluation Process Management
          </h1>
          <p className="text-gray-600">
            Comprehensive tools for managing evaluation committees and bid
            assessments
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
              <p className="text-sm font-medium text-gray-600">
                Active Committees
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  evaluationCommittees.filter(
                    (c) => c.status === "Active",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Completed Evaluations
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  bidEvaluations.filter((e) => e.status === "Final")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Pending Reviews
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  bidEvaluations.filter((e) => e.status === "Submitted")
                    .length
                }
              </p>
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
                    <h3 className="font-semibold text-gray-900">
                      {committee.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Chair: {committee.chairperson}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      committee.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {committee.status}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Specialization:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {committee.specialization.map((spec) => (
                        <span
                          key={spec}
                          className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Members ({committee.members.length}):
                    </p>
                    <div className="mt-2 space-y-1">
                      {committee.members.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-900">
                            {member.name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              member.availability === "Available"
                                ? "bg-green-100 text-green-800"
                                : member.availability === "Busy"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {member.availability}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    <Eye className="h-4 w-4 inline mr-1" />
                    View Details
                  </button>
                  <button className="text-green-600 hover:text-green-900 text-sm">
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTenders = () => {
    if (tenderSubView === "list") {
      return renderTenderList();
    } else if (tenderSubView === "create") {
      return renderCreateTender();
    } else if (tenderSubView === "ai-management") {
      return renderAITenderManagement();
    } else if (tenderSubView === "bulk-upload") {
      return renderBulkUpload();
    } else if (tenderSubView === "evaluation") {
      return renderEvaluationManagement();
    } else if (tenderSubView === "award") {
      return renderTenderAward();
    }
    return null;
  };

  const handleViewContractDetails = (contract: Contract) => {
    setSelectedContractForAction(contract);
    setShowContractDetails(true);
  };

  const handleUpdateMilestone = (contract: Contract, milestone: Milestone) => {
    setSelectedContractForAction(contract);
    setSelectedMilestone(milestone);
    setShowMilestoneModal(true);
  };

  const handleProcessPayment = (contract: Contract, payment: Payment) => {
    setSelectedContractForAction(contract);
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleDisputeContract = (contract: Contract) => {
    setSelectedContractForAction(contract);
    setShowDisputeModal(true);
  };

  const getVendorWorkflowStatus = (bidderId: string) => {
    return vendorWorkflowStatuses.find(status => status.companyId === bidderId);
  };

  const isVendorEligibleForAward = (bidderId: string) => {
    const status = getVendorWorkflowStatus(bidderId);
    return status &&
           status.registrationCompleted &&
           status.loginVerificationCompleted &&
           status.biddingCompleted &&
           status.evaluationCompleted &&
           status.nocIssued &&
           status.finalApprovalStatus === "approved";
  };

  const renderVendorWorkflowStep = (step: string, completed: boolean, date?: string, details?: string) => {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${
        completed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          completed ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {completed ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              completed ? "text-green-800" : "text-red-800"
            }`}>
              {step}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {completed ? "Completed" : "Incomplete"}
            </span>
          </div>
          {date && (
            <div className="text-xs text-gray-600 mt-1">
              {completed ? `Completed: ${date}` : `Required for award`}
            </div>
          )}
          {details && (
            <div className="text-xs text-gray-600 mt-1">
              {details}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTenderAward = () => {
    const tendersForAward = tenders.filter(t => t.status === "Evaluated" || t.status === "Closed");

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🏆 Award Tenders
            </h1>
            <p className="text-gray-600">
              Award tenders to qualified vendors who have completed the required workflow process
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Award Report
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export Awards
            </button>
          </div>
        </div>

        {/* Award Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Ready for Award
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tendersForAward.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Awarded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tenders.filter((t) => t.status === "Awarded").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₦2.7B</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">87.3%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tenders Ready for Award */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Tenders Ready for Award
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
                  <option value="Evaluated">Evaluated</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {tendersForAward.map((tender) => (
                <div
                  key={tender.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tender.title}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            tender.status === "Evaluated"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {tender.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tender ID:</span> {tender.id}
                        </div>
                        <div>
                          <span className="font-medium">Estimated Value:</span> {tender.estimatedValue}
                        </div>
                        <div>
                          <span className="font-medium">Bids Received:</span> {tender.bidsReceived}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTenderForAward(tender);
                        setShowAwardModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Award Tender
                    </button>
                  </div>

                  {/* Top Bidders with Workflow Status */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Top Qualified Bidders & Workflow Status</h4>
                    <div className="space-y-4">
                      {bidders.slice(0, 3).map((bidder, index) => {
                        const workflowStatus = getVendorWorkflowStatus(bidder.id);
                        const isEligible = isVendorEligibleForAward(bidder.id);

                        return (
                          <div
                            key={bidder.id}
                            className={`p-4 rounded-lg border-2 ${
                              isEligible && index === 0
                                ? "border-green-200 bg-green-50"
                                : !isEligible
                                  ? "border-red-200 bg-red-50"
                                  : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? "bg-yellow-500 text-white" :
                                  index === 1 ? "bg-gray-400 text-white" :
                                  "bg-orange-400 text-white"
                                }`}>
                                  <span className="text-sm font-bold">{index + 1}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900 text-sm">
                                    {bidder.companyName}
                                  </span>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      Score: {bidder.totalScore}%
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      isEligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}>
                                      {isEligible ? "Eligible for Award" : "Not Eligible"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">{bidder.bidAmount}</div>
                                <div className="text-xs text-gray-500">{bidder.experience}</div>
                              </div>
                            </div>

                            {/* Workflow Status Steps */}
                            <div className="mt-4">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">Vendor Workflow Status:</h5>
                              <div className="grid grid-cols-1 gap-2">
                                {renderVendorWorkflowStep(
                                  "1. Company Registration",
                                  workflowStatus?.registrationCompleted || false,
                                  workflowStatus?.registrationDate
                                )}
                                {renderVendorWorkflowStep(
                                  "2. Login & Verification",
                                  workflowStatus?.loginVerificationCompleted || false,
                                  workflowStatus?.verificationDate
                                )}
                                {renderVendorWorkflowStep(
                                  "3. Bidding Process",
                                  workflowStatus?.biddingCompleted || false,
                                  workflowStatus?.bidSubmissionDate
                                )}
                                {renderVendorWorkflowStep(
                                  "4. Tender Evaluation",
                                  workflowStatus?.evaluationCompleted || false,
                                  workflowStatus?.evaluationDate
                                )}
                                {renderVendorWorkflowStep(
                                  "5. No Objection Certificate",
                                  workflowStatus?.nocIssued || false,
                                  workflowStatus?.nocIssuedDate,
                                  workflowStatus?.nocCertificateNumber ? `Certificate: ${workflowStatus.nocCertificateNumber}` : undefined
                                )}
                              </div>
                            </div>

                            {/* Award Eligibility Summary */}
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className={`p-3 rounded-md ${
                                isEligible ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
                              }`}>
                                <div className="flex items-center space-x-2">
                                  {isEligible ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                  )}
                                  <span className={`text-sm font-medium ${
                                    isEligible ? "text-green-800" : "text-red-800"
                                  }`}>
                                    {isEligible
                                      ? "✅ All requirements completed - Ready for award"
                                      : "❌ Requirements incomplete - Cannot award tender"
                                    }
                                  </span>
                                </div>
                                {!isEligible && (
                                  <div className="mt-2 text-xs text-red-700">
                                    Complete all workflow steps before this vendor can be awarded a tender.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                    <button className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </button>
                    <button className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 text-sm">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Evaluation Report
                    </button>
                    <button className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download Bids
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Award Modal */}
        {showAwardModal && selectedTenderForAward && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                🏆 Award Tender - {selectedTenderForAward.title}
              </h3>
                <button
                  onClick={() => {
                    setShowAwardModal(false);
                    setSelectedTenderForAward(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bidder Selection */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Select Winning Bidder
                    </h4>
                    <div className="space-y-3">
                      {bidders.map((bidder, index) => {
                        const workflowStatus = getVendorWorkflowStatus(bidder.id);
                        const isEligible = isVendorEligibleForAward(bidder.id);

                        return (
                          <div
                            key={bidder.id}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              !isEligible
                                ? "border-red-200 bg-red-50 cursor-not-allowed opacity-60"
                                : awardFormData.selectedBidder === bidder.id
                                  ? "border-green-500 bg-green-50 cursor-pointer"
                                  : "border-gray-200 hover:border-gray-300 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (isEligible) {
                                setAwardFormData({
                                  ...awardFormData,
                                  selectedBidder: bidder.id,
                                  awardValue: bidder.bidAmount,
                                });
                              }
                            }}
                          >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  index === 0 ? "bg-yellow-500 text-white" :
                                  index === 1 ? "bg-gray-400 text-white" :
                                  "bg-orange-400 text-white"
                                }`}>
                                  <span className="text-xs font-bold">{index + 1}</span>
                                </div>
                                <h5 className="font-semibold text-gray-900">
                                  {bidder.companyName}
                                </h5>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  isEligible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {isEligible ? "Eligible" : "Not Eligible"}
                                </span>
                              </div>

                              {/* Workflow Status Indicator */}
                              <div className="mb-3">
                                <div className={`text-xs px-2 py-1 rounded-md inline-flex items-center space-x-1 ${
                                  isEligible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {isEligible ? (
                                    <><CheckCircle className="h-3 w-3" /><span>All workflow steps completed</span></>
                                  ) : (
                                    <><AlertCircle className="h-3 w-3" /><span>Workflow incomplete</span></>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Bid Amount:</span>
                                  <p className="text-lg font-semibold text-gray-900">{bidder.bidAmount}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Total Score:</span>
                                  <p className="text-lg font-semibold text-green-600">{bidder.totalScore}%</p>
                                </div>
                                <div>
                                  <span className="font-medium">Technical:</span>
                                  <p>{bidder.technicalScore}%</p>
                                </div>
                                <div>
                                  <span className="font-medium">Financial:</span>
                                  <p>{bidder.financialScore}%</p>
                                </div>
                                <div>
                                  <span className="font-medium">Experience:</span>
                                  <p>{bidder.experience}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Projects:</span>
                                  <p>{bidder.previousProjects} completed</p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-600">Certifications:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {bidder.certifications.map((cert) => (
                                    <span
                                      key={cert}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    >
                                      {cert}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Eligibility Notice for Ineligible Vendors */}
                          {!isEligible && (
                            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-md">
                              <div className="text-xs text-red-700 font-medium">Required Steps Missing:</div>
                              <ul className="text-xs text-red-600 mt-1 space-y-1">
                                {!workflowStatus?.registrationCompleted && <li>• Company Registration</li>}
                                {!workflowStatus?.loginVerificationCompleted && <li>• Login & Verification</li>}
                                {!workflowStatus?.biddingCompleted && <li>• Bidding Process</li>}
                                {!workflowStatus?.evaluationCompleted && <li>• Tender Evaluation</li>}
                                {!workflowStatus?.nocIssued && <li>• No Objection Certificate</li>}
                                {workflowStatus?.finalApprovalStatus !== "approved" && <li>• Final Approval</li>}
                              </ul>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Award Details Form */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Award Details & Contract Terms
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Award Value *
                        </label>
                        <input
                          type="text"
                          value={awardFormData.awardValue}
                          onChange={(e) => setAwardFormData({...awardFormData, awardValue: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="₦0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contract Duration (months) *
                        </label>
                        <input
                          type="number"
                          value={awardFormData.contractDuration}
                          onChange={(e) => setAwardFormData({...awardFormData, contractDuration: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Performance Bond (%)
                        </label>
                        <input
                          type="number"
                          value={awardFormData.performanceBond}
                          onChange={(e) => setAwardFormData({...awardFormData, performanceBond: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Advance Payment (%)
                        </label>
                        <input
                          type="number"
                          value={awardFormData.advancePayment}
                          onChange={(e) => setAwardFormData({...awardFormData, advancePayment: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warranty Period (months)
                        </label>
                        <input
                          type="number"
                          value={awardFormData.warrantyPeriod}
                          onChange={(e) => setAwardFormData({...awardFormData, warrantyPeriod: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Schedule
                        </label>
                        <textarea
                          rows={3}
                          value={awardFormData.deliverySchedule}
                          onChange={(e) => setAwardFormData({...awardFormData, deliverySchedule: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Specify delivery milestones and timelines..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Award Justification *
                    </label>
                    <textarea
                      rows={4}
                      value={awardFormData.awardJustification}
                      onChange={(e) => setAwardFormData({...awardFormData, awardJustification: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Provide detailed justification for the award decision based on evaluation criteria..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Conditions & Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={awardFormData.specialConditions}
                      onChange={(e) => setAwardFormData({...awardFormData, specialConditions: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Any special conditions or requirements for this contract..."
                    />
                  </div>
                </div>
              </div>

              {/* Award Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium text-blue-800">Vendor Workflow Verification</h5>
                        <p className="text-sm text-blue-700 mt-1">
                          Only vendors who have completed all 5 workflow steps can be awarded a tender:
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
                          <li>1. ✅ Company Registration</li>
                          <li>2. ✅ Login & Verification</li>
                          <li>3. ✅ Bidding Process</li>
                          <li>4. ✅ Tender Evaluation</li>
                          <li>5. ✅ No Objection Certificate</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium text-yellow-800">Award Confirmation</h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          Once awarded, this decision will be final and legally binding. Ensure all details are correct and the vendor has completed all workflow requirements before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setShowAwardModal(false);
                      setSelectedTenderForAward(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <div className="flex space-x-3">
                    <button className="px-6 py-3 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50">
                      Save as Draft
                    </button>
                    <button
                      disabled={!awardFormData.selectedBidder || !awardFormData.awardValue || !awardFormData.awardJustification || !isVendorEligibleForAward(awardFormData.selectedBidder)}
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Award className="h-4 w-4 mr-2 inline" />
                      Award Tender
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContracts = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📄 Contract Management
          </h1>
          <p className="text-gray-600">
            Comprehensive contract lifecycle management with digital
            signatures and milestone tracking
          </p>
        </div>
        <button
          onClick={() => setShowContractModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </button>
      </div>

      {/* Contract Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <FileCheck className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Contracts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.length}
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
                {contracts.filter((c) => c.status === "Active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter((c) => c.status === "Completed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₦2.7B</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Contract Portfolio
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {contract.projectTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {contract.id} • {contract.contractorName}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      {contract.contractValue}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        contract.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : contract.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : contract.status === "Suspended"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contract.status}
                    </span>
                    <div className="mt-2 text-sm text-gray-500">
                      Performance: {contract.performanceScore}%
                    </div>
                  </div>
                </div>

                {/* Milestone Progress */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Milestone Progress
                  </h4>
                  <div className="space-y-2">
                    {contract.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className="flex items-center space-x-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            milestone.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : milestone.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : milestone.status === "Overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {milestone.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              {milestone.paymentPercentage}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">
                              Target: {milestone.targetDate}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                milestone.verificationStatus ===
                                "Verified"
                                  ? "bg-green-100 text-green-700"
                                  : milestone.verificationStatus ===
                                      "Under Review"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : milestone.verificationStatus ===
                                        "Rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-gray-600"
                              }`}
                            >
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
                  <h4 className="font-medium text-gray-900 mb-3">
                    Payment Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contract.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className={`p-3 rounded-lg border ${
                          payment.status === "Paid"
                            ? "bg-green-50 border-green-200"
                            : payment.status === "Approved"
                              ? "bg-blue-50 border-blue-200"
                              : payment.status === "Pending"
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {payment.amount}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "Approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : payment.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {payment.invoiceNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disputes */}
                {contract.disputes && contract.disputes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                      Active Disputes
                    </h4>
                    <div className="space-y-2">
                      {contract.disputes.map((dispute) => (
                        <div
                          key={dispute.id}
                          className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {dispute.title}
                            </span>
                            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                              {dispute.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Raised by: {dispute.raisedBy} • {dispute.raisedDate}
                          </p>
                          {dispute.mediator && (
                            <p className="text-xs text-gray-600">
                              Mediator: {dispute.mediator}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewContractDetails(contract)}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleUpdateMilestone(contract, contract.milestones.find(m => m.status === "In Progress") || contract.milestones[0])}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Update Milestone
                  </button>
                  <button
                    onClick={() => handleProcessPayment(contract, contract.payments.find(p => p.status === "Pending") || contract.payments[0])}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 text-sm"
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Process Payment
                  </button>
                  <button
                    onClick={() => handleDisputeContract(contract)}
                    className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 text-sm"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
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

      {/* Contract Details Modal */}
      {showContractDetails && selectedContractForAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Contract Details - {selectedContractForAction.projectTitle}
              </h3>
              <button
                onClick={() => setShowContractDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contract Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Contract ID:</strong> {selectedContractForAction.id}</p>
                  <p><strong>Tender ID:</strong> {selectedContractForAction.tenderId}</p>
                  <p><strong>Contractor:</strong> {selectedContractForAction.contractorName}</p>
                  <p><strong>Value:</strong> {selectedContractForAction.contractValue}</p>
                  <p><strong>Duration:</strong> {selectedContractForAction.startDate} to {selectedContractForAction.endDate}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedContractForAction.status === "Active" ? "bg-green-100 text-green-800" :
                    selectedContractForAction.status === "Completed" ? "bg-blue-100 text-blue-800" :
                    "bg-orange-100 text-orange-800"
                  }`}>{selectedContractForAction.status}</span></p>
                  <p><strong>Performance Score:</strong> {selectedContractForAction.performanceScore}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Security & Verification</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Digital Signature:</strong> {selectedContractForAction.digitalSignature}</p>
                  <p><strong>Document Hash:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedContractForAction.documentHash}</code></p>
                  <p><strong>Verification Status:</strong> <span className="text-green-600">✓ Verified</span></p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Detailed Milestones</h4>
              <div className="space-y-3">
                {selectedContractForAction.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        milestone.status === "Completed" ? "bg-green-100 text-green-800" :
                        milestone.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                        milestone.status === "Overdue" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>{milestone.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    <div className="text-xs text-gray-500">
                      <p>Target Date: {milestone.targetDate} {milestone.completionDate && `| Completed: ${milestone.completionDate}`}</p>
                      <p>Payment: {milestone.paymentPercentage}% | Verification: {milestone.verificationStatus}</p>
                      <p>Deliverables: {milestone.deliverables.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Update Modal */}
      {showMilestoneModal && selectedMilestone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Update Milestone - {selectedMilestone.title}
              </h3>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value={selectedMilestone.status}>{selectedMilestone.status}</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value={selectedMilestone.verificationStatus}>{selectedMilestone.verificationStatus}</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add comments about milestone progress..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Update Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Process Payment - {selectedPayment.amount}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Payment ID:</strong> {selectedPayment.id}</p>
                  <p><strong>Invoice Number:</strong> {selectedPayment.invoiceNumber}</p>
                  <p><strong>Amount:</strong> {selectedPayment.amount}</p>
                  <p><strong>Request Date:</strong> {selectedPayment.requestDate}</p>
                  <p><strong>Current Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedPayment.status === "Paid" ? "bg-green-100 text-green-800" :
                    selectedPayment.status === "Approved" ? "bg-blue-100 text-blue-800" :
                    selectedPayment.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>{selectedPayment.status}</span></p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Action</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="approve">Approve Payment</option>
                  <option value="reject">Reject Payment</option>
                  <option value="process">Process Payment</option>
                  <option value="hold">Put on Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="wire">Wire Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Details</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter bank account details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add notes about payment processing..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                🔐 Digital Contract Generation & Execution
              </h3>
              <button
                onClick={() => {
                  setShowContractModal(false);
                  setContractStep(1);
                  setGeneratedContract("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, title: "Contract Details", icon: FileText },
                  { step: 2, title: "Terms & Conditions", icon: BookOpen },
                  { step: 3, title: "Digital Features", icon: Shield },
                  { step: 4, title: "Generate & Execute", icon: Zap },
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        contractStep >= item.step
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {contractStep > item.step ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <item.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          contractStep >= item.step ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-20 h-0.5 mx-4 ${
                          contractStep > item.step ? "bg-green-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Contract Details */}
            {contractStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Tender ID *
                    </label>
                    <select
                      value={contractFormData.tenderId}
                      onChange={(e) => setContractFormData({...contractFormData, tenderId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Tender</option>
                      {tenders.filter(t => t.status === "Awarded").map(tender => (
                        <option key={tender.id} value={tender.id}>{tender.id} - {tender.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contractor Name *
                    </label>
                    <input
                      type="text"
                      value={contractFormData.contractorName}
                      onChange={(e) => setContractFormData({...contractFormData, contractorName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter contractor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={contractFormData.projectTitle}
                      onChange={(e) => setContractFormData({...contractFormData, projectTitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Value *
                    </label>
                    <input
                      type="text"
                      value={contractFormData.contractValue}
                      onChange={(e) => setContractFormData({...contractFormData, contractValue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="₦0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={contractFormData.startDate}
                      onChange={(e) => setContractFormData({...contractFormData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={contractFormData.endDate}
                      onChange={(e) => setContractFormData({...contractFormData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    rows={4}
                    value={contractFormData.description}
                    onChange={(e) => setContractFormData({...contractFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Detailed description of the project scope, deliverables, and expectations..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Terms & Conditions */}
            {contractStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Milestones</h4>
                  <div className="space-y-4">
                    {contractFormData.milestones.map((milestone, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Milestone Title
                            </label>
                            <input
                              type="text"
                              value={milestone.title}
                              onChange={(e) => {
                                const newMilestones = [...contractFormData.milestones];
                                newMilestones[index].title = e.target.value;
                                setContractFormData({...contractFormData, milestones: newMilestones});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Payment %
                            </label>
                            <input
                              type="number"
                              value={milestone.percentage}
                              onChange={(e) => {
                                const newMilestones = [...contractFormData.milestones];
                                newMilestones[index].percentage = parseInt(e.target.value);
                                setContractFormData({...contractFormData, milestones: newMilestones});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Target Date
                            </label>
                            <input
                              type="date"
                              value={milestone.targetDate}
                              onChange={(e) => {
                                const newMilestones = [...contractFormData.milestones];
                                newMilestones[index].targetDate = e.target.value;
                                setContractFormData({...contractFormData, milestones: newMilestones});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={milestone.description}
                              onChange={(e) => {
                                const newMilestones = [...contractFormData.milestones];
                                newMilestones[index].description = e.target.value;
                                setContractFormData({...contractFormData, milestones: newMilestones});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Describe milestone deliverables and requirements"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setContractFormData({
                        ...contractFormData,
                        milestones: [
                          ...contractFormData.milestones,
                          { title: "", percentage: 0, targetDate: "", description: "" }
                        ]
                      });
                    }}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Milestone
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Schedule
                    </label>
                    <select
                      value={contractFormData.paymentSchedule}
                      onChange={(e) => setContractFormData({...contractFormData, paymentSchedule: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="milestone">Milestone-based</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="upfront">Upfront Payment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Period (months)
                    </label>
                    <input
                      type="number"
                      value={contractFormData.warranties}
                      onChange={(e) => setContractFormData({...contractFormData, warranties: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={4}
                    value={contractFormData.terms}
                    onChange={(e) => setContractFormData({...contractFormData, terms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Specify detailed terms, conditions, and legal clauses..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penalties & Liquidated Damages
                  </label>
                  <textarea
                    rows={3}
                    value={contractFormData.penalties}
                    onChange={(e) => setContractFormData({...contractFormData, penalties: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Define penalties for delays, non-compliance, or breach of contract..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Digital Features */}
            {contractStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    Digital Security & Automation Features
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id="digitalSignature"
                        checked={contractFormData.digitalSignature}
                        onChange={(e) => setContractFormData({...contractFormData, digitalSignature: e.target.checked})}
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="digitalSignature" className="text-sm font-medium text-gray-900 cursor-pointer">
                          🔐 Advanced Digital Signatures
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Multi-party digital signatures with PKI encryption, timestamping, and legal compliance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id="blockchainVerification"
                        checked={contractFormData.blockchainVerification}
                        onChange={(e) => setContractFormData({...contractFormData, blockchainVerification: e.target.checked})}
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="blockchainVerification" className="text-sm font-medium text-gray-900 cursor-pointer">
                          ⛓️ Blockchain Verification
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Immutable contract storage on blockchain for tamper-proof verification and audit trails.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id="autoExecution"
                        checked={contractFormData.autoExecution}
                        onChange={(e) => setContractFormData({...contractFormData, autoExecution: e.target.checked})}
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label htmlFor="autoExecution" className="text-sm font-medium text-gray-900 cursor-pointer">
                          🤖 Smart Contract Auto-Execution
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Automated milestone verification and payment triggers based on predefined conditions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-yellow-800">Legal Compliance Notice</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Digital contracts generated through this system comply with the Nigerian Electronic Transactions Act and
                        Kano State Procurement Law. All contracts are legally binding and enforceable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">🛡️ Security Features</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• AES-256 encryption</li>
                      <li>• Multi-factor authentication</li>
                      <li>• Audit trail logging</li>
                      <li>• IP geolocation tracking</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">⚡ Automation Benefits</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 90% faster processing</li>
                      <li>• Reduced human errors</li>
                      <li>• Real-time notifications</li>
                      <li>• Automatic compliance checks</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Generate & Execute */}
            {contractStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Generate Digital Contract
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Review your contract details and generate the legally binding digital contract.
                  </p>
                </div>

                {/* Contract Preview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-medium text-gray-900 mb-4">Contract Summary</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Project:</strong> {contractFormData.projectTitle}</div>
                    <div><strong>Contractor:</strong> {contractFormData.contractorName}</div>
                    <div><strong>Value:</strong> {contractFormData.contractValue}</div>
                    <div><strong>Duration:</strong> {contractFormData.startDate} to {contractFormData.endDate}</div>
                    <div><strong>Milestones:</strong> {contractFormData.milestones.length} phases</div>
                    <div><strong>Payment:</strong> {contractFormData.paymentSchedule}-based</div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h6 className="font-medium text-gray-900 mb-2">Digital Features Enabled:</h6>
                    <div className="flex flex-wrap gap-2">
                      {contractFormData.digitalSignature && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          🔐 Digital Signatures
                        </span>
                      )}
                      {contractFormData.blockchainVerification && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          ⛓️ Blockchain Verified
                        </span>
                      )}
                      {contractFormData.autoExecution && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          🤖 Auto-Execution
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generated Contract Display */}
                {generatedContract && (
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Generated Contract Document</h5>
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                          <Download className="h-4 w-4 mr-1" />
                          Download PDF
                        </button>
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">{generatedContract}</pre>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  {!generatedContract ? (
                    <button
                      onClick={() => {
                        setIsGeneratingContract(true);
                        // Simulate contract generation
                        setTimeout(() => {
                          setGeneratedContract(`DIGITAL PROCUREMENT CONTRACT

Contract ID: CON-${Date.now()}
Generated: ${new Date().toLocaleString()}

PARTIES:
Contractor: ${contractFormData.contractorName}
Procuring Entity: ${ministryInfo.name}

PROJECT DETAILS:
Title: ${contractFormData.projectTitle}
Value: ${contractFormData.contractValue}
Duration: ${contractFormData.startDate} to ${contractFormData.endDate}

DESCRIPTION:
${contractFormData.description}

MILESTONES:
${contractFormData.milestones.map((m, i) => `${i + 1}. ${m.title} (${m.percentage}%) - Due: ${m.targetDate}`).join('\n')}

TERMS & CONDITIONS:
${contractFormData.terms}

PENALTIES:
${contractFormData.penalties}

DIGITAL FEATURES:
${contractFormData.digitalSignature ? '✓ Digital Signatures Enabled\n' : ''}${contractFormData.blockchainVerification ? '✓ Blockchain Verification Enabled\n' : ''}${contractFormData.autoExecution ? '✓ Smart Contract Auto-Execution Enabled\n' : ''}

This contract is digitally generated and legally binding under Nigerian law.

Document Hash: SHA256-${Math.random().toString(36).substring(2, 15)}
Blockchain Timestamp: ${Date.now()}

[Digital Signature Placeholder]
[Blockchain Verification Hash]`);
                          setIsGeneratingContract(false);
                        }, 3000);
                      }}
                      disabled={isGeneratingContract}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isGeneratingContract ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Generating Contract...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Generate Digital Contract
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">
                        <Shield className="h-5 w-5 mr-2" />
                        Execute Contract
                      </button>
                      <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                        <Send className="h-5 w-5 mr-2" />
                        Send for Signature
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => contractStep > 1 && setContractStep(contractStep - 1)}
                disabled={contractStep === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowContractModal(false);
                    setContractStep(1);
                    setGeneratedContract("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                {contractStep < 4 ? (
                  <button
                    onClick={() => setContractStep(contractStep + 1)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Next →
                  </button>
                ) : (
                  generatedContract && (
                    <button
                      onClick={() => {
                        // Handle final contract execution
                        alert('Contract executed successfully!');
                        setShowContractModal(false);
                        setContractStep(1);
                        setGeneratedContract("");
                      }}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finalize Contract
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {showDisputeModal && selectedContractForAction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Dispute Resolution - {selectedContractForAction.projectTitle}
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dispute Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter dispute title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dispute Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="quality">Quality Issues</option>
                  <option value="delivery">Delivery Delays</option>
                  <option value="payment">Payment Disputes</option>
                  <option value="specification">Specification Changes</option>
                  <option value="performance">Performance Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the dispute in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proposed Resolution</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe your proposed resolution..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Mediator</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select Mediator</option>
                  <option value="procurement-board">Kano State Procurement Review Board</option>
                  <option value="legal-dept">Legal Department</option>
                  <option value="technical-committee">Technical Committee</option>
                  <option value="external-arbitrator">External Arbitrator</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                Initiate Dispute Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
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

  const renderNOCRequests = () => (
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
                {nocRequests.filter((r) => r.status === "Approved").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Pending
              </p>
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
                        Requested: {new Date(request.requestDate).toLocaleDateString()}
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
                        Duration: {request.expectedDuration}
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
                    {request.certificateNumber && (
                      <div className="text-xs text-gray-500 mt-1">
                        Cert: {request.certificateNumber}
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
    </div>
  );

  const renderContent = () => {
    if (currentView === "overview") {
      return renderOverview();
    } else if (currentView === "companies") {
      return renderCompanies();
    } else if (currentView === "tenders") {
      return renderTenders();
    } else if (currentView === "contracts") {
      return renderContracts();
    } else if (currentView === "reports") {
      return renderReports();
    } else if (currentView === "noc") {
      return renderNOCRequests();
    }
    return null;
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

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setCurrentView("overview")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "overview"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setCurrentView("companies")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "companies"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Companies</span>
              </button>
              <button
                onClick={() => { setCurrentView("tenders"); setTenderSubView("list"); }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "tenders"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Tenders</span>
              </button>
              <button
                onClick={() => setCurrentView("contracts")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "contracts"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <FileCheck className="h-4 w-4" />
                <span>Contracts</span>
              </button>
              <button
                onClick={() => setCurrentView("reports")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "reports"
                    ? "text-green-700 bg-green-50"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Reports</span>
              </button>
              <button
                onClick={() => setCurrentView("noc")}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === "noc"
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

      {/* Tender Sub-Navigation */}
      {currentView === "tenders" && (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto py-2">
              {[
                { key: "list", label: "Tender List", icon: FileText },
                { key: "create", label: "Create Tender", icon: Plus },
                { key: "ai-management", label: "AI Management", icon: Bot },
                { key: "bulk-upload", label: "Bulk Upload", icon: Upload },
                { key: "evaluation", label: "Evaluation", icon: CheckSquare },
                { key: "award", label: "Award Tenders", icon: Award },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTenderSubView(tab.key as TenderSubView)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    tenderSubView === tab.key
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
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}
