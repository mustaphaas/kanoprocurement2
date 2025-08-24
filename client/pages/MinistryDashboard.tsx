import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MDAUser, CreateMDAUserRequest, MDAUserPermissions } from "@shared/api";
import { getMinistryById, MinistryConfig } from "@shared/ministries";
import MinistryUserForm from "@/components/MinistryUserForm";
import ProcurementPlanning from "@/components/ProcurementPlanning";
import TenderManagement from "@/components/TenderManagement";
import ContractManagement from "@/components/ContractManagement";
import BudgetAllocation from "@/components/BudgetAllocation";
import EvaluationCommitteeManagement from "@/components/EvaluationCommitteeManagement";
import ScoringMatrixImplementation from "@/components/ScoringMatrixImplementation";
import NOCRequestsModule from "@/components/NOCRequestsModule";
import { EnhancedMinistryOverview } from "@/components/ministry/EnhancedMinistryOverview";
import MinistryReports from "./MinistryReports";
import { formatCurrency } from "@/lib/utils";
import { logUserAction } from "@/lib/auditLogStorage";
import { persistentStorage } from "@/lib/persistentStorage";
import {
  tenderStatusChecker,
  tenderSettingsManager,
  TenderStatus,
} from "@/lib/tenderSettings";
import {
  CardSkeleton,
  TableSkeleton,
  NavigationSkeleton,
  DataLoadingState,
  LoadingSpinner,
  ActionLoadingState,
} from "@/components/ui/loading-states";
import {
  Circle,
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
  Handshake,
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
  User,
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
  | "reports"
  | "noc"
  | "users"
  | "procurement-planning"
  | "tender-management"
  | "contract-management";

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
  awardedCompany?: string;
  awardAmount?: string;
  awardDate?: string;
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

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigationLoading, setIsNavigationLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {},
  );

  // Mobile navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [nocRequests, setNOCRequests] = useState<NOCRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateTender, setShowCreateTender] = useState(false);
  const [newTender, setNewTender] = useState({
    title: "",
    category: "",
    description: "",
    estimatedValue: "",
    procurementMethod: "Open Tender",
    publishDate: "",
    closeDate: "",
    contactEmail: "",
  });
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
  const [mdaUsers, setMDAUsers] = useState<MDAUser[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MDAUser | null>(null);
  const [userFormMode, setUserFormMode] = useState<"create" | "edit">("create");
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
  const [selectedContractForAction, setSelectedContractForAction] =
    useState<Contract | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showEvaluationReportModal, setShowEvaluationReportModal] =
    useState(false);
  const [showTenderDetailsModal, setShowTenderDetailsModal] = useState(false);
  const [selectedTenderForDetails, setSelectedTenderForDetails] =
    useState<Tender | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [contractFormData, setContractFormData] = useState({
    tenderId: "",
    contractorName: "",
    projectTitle: "",
    contractValue: "",
    startDate: "",
    endDate: "",
    description: "",
    milestones: [
      {
        title: "Initial Delivery",
        percentage: 30,
        targetDate: "",
        description: "",
      },
      {
        title: "Progress Review",
        percentage: 40,
        targetDate: "",
        description: "",
      },
      {
        title: "Final Completion",
        percentage: 30,
        targetDate: "",
        description: "",
      },
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
  const [selectedTenderForAward, setSelectedTenderForAward] =
    useState<Tender | null>(null);
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
  const [vendorWorkflowStatuses, setVendorWorkflowStatuses] = useState<
    VendorWorkflowStatus[]
  >([]);
  const [workflowStatuses, setWorkflowStatuses] = useState<
    Record<string, any>
  >({});
  const [selectedWorkspace, setSelectedWorkspace] = useState("MOH-2024-001");
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);
  const [evaluationScores, setEvaluationScores] = useState<{
    [key: string]: any;
  }>({});
  const [showCreateCommitteeModal, setShowCreateCommitteeModal] =
    useState(false);
  const [showFinalizeEvaluationModal, setShowFinalizeEvaluationModal] =
    useState(false);
  const [activeCommittee, setActiveCommittee] = useState<any>(null);
  const [isEvaluationFinalized, setIsEvaluationFinalized] = useState(false);
  const [committeeFormData, setCommitteeFormData] = useState({
    name: "",
    chairperson: "",
    secretary: "",
    specialization: "",
    members: [{ name: "", department: "", role: "Member", email: "" }],
  });
  const [showPostAwardWorkflow, setShowPostAwardWorkflow] = useState(false);
  const [awardedTenderData, setAwardedTenderData] = useState<any>(null);
  const [postAwardSteps, setPostAwardSteps] = useState({
    notifySuccessful: false,
    notifyUnsuccessful: false,
    publishOCDS: false,
    createContract: false,
  });
  const [showTenderSelectionModal, setShowTenderSelectionModal] =
    useState(false);
  const [selectedAwardedTender, setSelectedAwardedTender] = useState<any>(null);
  const [showAwardLetterModal, setShowAwardLetterModal] = useState(false);
  const [selectedTenderForLetter, setSelectedTenderForLetter] =
    useState<any>(null);
  const [awardLetterData, setAwardLetterData] = useState<any>(null);
  const [bidders, setBidders] = useState([
    {
      id: "BID-001",
      companyName: "PrimeCare Medical Ltd",
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
      companyName: "Falcon Diagnostics Ltd",
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
      companyName: "Golden Gates Healthcare",
      bidAmount: "���875,000,000",
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
    {
      id: "BID-004",
      companyName: "Royal Medical Solutions",
      bidAmount: "₦890,000,000",
      technicalScore: 82,
      financialScore: 79,
      totalScore: 80.5,
      status: "Qualified",
      submissionDate: "2024-02-07",
      experience: "8 years",
      certifications: ["ISO 9001", "CE Certified"],
      previousProjects: 22,
      completionRate: 92.3,
    },
    {
      id: "BID-005",
      companyName: "Zenith Health Technologies",
      bidAmount: "₦910,000,000",
      technicalScore: 80,
      financialScore: 76,
      totalScore: 78,
      status: "Qualified",
      submissionDate: "2024-02-06",
      experience: "6 years",
      certifications: ["ISO 9001", "WHO Approved"],
      previousProjects: 18,
      completionRate: 89.7,
    },
  ]);
  const navigate = useNavigate();

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle view change with loading state
  const handleViewChange = (view: CurrentView) => {
    setIsNavigationLoading(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsNavigationLoading(false);
      setIsMobileMenuOpen(false); // Close mobile menu on selection
    }, 300);
  };

  // Handle action loading
  const handleActionLoading = (actionId: string, isLoading: boolean) => {
    setLoadingActions((prev) => ({ ...prev, [actionId]: isLoading }));
  };

  // Get ministry info from localStorage
  const getMinistryInfo = (): MinistryInfo => {
    const ministryUser = localStorage.getItem("ministryUser");
    if (!ministryUser) {
      navigate("/login");
      return {
        name: "Ministry of Health",
        code: "MOH",
        contactEmail: "health@kanostate.gov.ng",
        contactPhone: "08012345678",
        address: "Kano State Secretariat, Kano",
      };
    }

    try {
      const userData = JSON.parse(ministryUser);
      const ministry = getMinistryById(userData.ministryId);

      if (ministry) {
        return {
          name: ministry.name,
          code: ministry.code,
          contactEmail: ministry.contactEmail,
          contactPhone: ministry.contactPhone,
          address: ministry.address,
        };
      }
    } catch (error) {
      console.error("Error parsing ministry user data:", error);
    }

    // Fallback to default
    return {
      name: "Ministry of Health",
      code: "MOH",
      contactEmail: "health@kanostate.gov.ng",
      contactPhone: "08012345678",
      address: "Kano State Secretariat, Kano",
    };
  };

  const ministryInfo = getMinistryInfo();

  // Get ministry-specific mock data
  const getMinistryMockData = () => {
    const ministryUser = localStorage.getItem("ministryUser");
    let ministryId = "ministry"; // default

    if (ministryUser) {
      try {
        const userData = JSON.parse(ministryUser);
        ministryId = userData.ministryId || "ministry";
      } catch (error) {
        console.error("Error parsing ministry user data:", error);
      }
    }

    const ministry = getMinistryById(ministryId);
    if (!ministry) {
      ministryId = "ministry"; // fallback
    }

    return { ministryId, ministry: ministry || getMinistryById("ministry")! };
  };

  // Set ministry-specific bidders and workspace
  useEffect(() => {
    const { ministryId } = getMinistryMockData();

    // Set appropriate workspace for ministry
    if (ministryId === "ministry2") {
      setSelectedWorkspace("MOWI-2024-001");
      // Set Ministry of Works bidders
      setBidders([
        {
          id: "BID-001",
          companyName: "Kano Construction Ltd",
          bidAmount: "₦14,800,000,000",
          technicalScore: 90,
          financialScore: 87,
          totalScore: 88.5,
          status: "Qualified",
          submissionDate: "2024-02-10",
          experience: "20 years",
          certifications: ["ISO 9001", "COREN Certified", "NIQS Registered"],
          previousProjects: 62,
          completionRate: 97.8,
        },
        {
          id: "BID-002",
          companyName: "Sahel Bridge Builders",
          bidAmount: "₦15,100,000,000",
          technicalScore: 88,
          financialScore: 85,
          totalScore: 86.5,
          status: "Qualified",
          submissionDate: "2024-02-09",
          experience: "18 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 45,
          completionRate: 96.2,
        },
        {
          id: "BID-003",
          companyName: "Northern Roads Nigeria",
          bidAmount: "₦15,400,000,000",
          technicalScore: 85,
          financialScore: 83,
          totalScore: 84,
          status: "Qualified",
          submissionDate: "2024-02-08",
          experience: "15 years",
          certifications: ["ISO 9001", "NBRRI Certified"],
          previousProjects: 38,
          completionRate: 95.5,
        },
        {
          id: "BID-004",
          companyName: "Emirate Construction Co",
          bidAmount: "₦15,600,000,000",
          technicalScore: 82,
          financialScore: 80,
          totalScore: 81,
          status: "Qualified",
          submissionDate: "2024-02-07",
          experience: "12 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 29,
          completionRate: 94.1,
        },
        {
          id: "BID-005",
          companyName: "Federal Infrastructure Ltd",
          bidAmount: "₦15,800,000,000",
          technicalScore: 80,
          financialScore: 78,
          totalScore: 79,
          status: "Qualified",
          submissionDate: "2024-02-06",
          experience: "10 years",
          certifications: ["ISO 9001", "NIQS Registered"],
          previousProjects: 22,
          completionRate: 92.7,
        },
      ]);
    } else if (ministryId === "ministry3") {
      setSelectedWorkspace("MOE-2024-001");
      // Set Ministry of Education bidders
      setBidders([
        {
          id: "BID-001",
          companyName: "EduTech Solutions Ltd",
          bidAmount: "₦2,000,000,000",
          technicalScore: 95,
          financialScore: 92,
          totalScore: 93.5,
          status: "Qualified",
          submissionDate: "2024-02-12",
          experience: "12 years",
          certifications: ["ISO 9001", "Educational Technology Certified"],
          previousProjects: 89,
          completionRate: 99.1,
        },
        {
          id: "BID-002",
          companyName: "Kano School Furniture Ltd",
          bidAmount: "₦2,050,000,000",
          technicalScore: 91,
          financialScore: 89,
          totalScore: 90,
          status: "Qualified",
          submissionDate: "2024-02-11",
          experience: "15 years",
          certifications: ["ISO 9001", "Furniture Quality Certified"],
          previousProjects: 156,
          completionRate: 98.7,
        },
        {
          id: "BID-003",
          companyName: "Northern Educational Supplies",
          bidAmount: "₦2,100,000,000",
          technicalScore: 88,
          financialScore: 86,
          totalScore: 87,
          status: "Qualified",
          submissionDate: "2024-02-10",
          experience: "10 years",
          certifications: ["ISO 9001", "Educational Materials Certified"],
          previousProjects: 67,
          completionRate: 97.3,
        },
        {
          id: "BID-004",
          companyName: "Academic Furniture Nigeria",
          bidAmount: "₦2,150,000,000",
          technicalScore: 85,
          financialScore: 84,
          totalScore: 84.5,
          status: "Qualified",
          submissionDate: "2024-02-09",
          experience: "8 years",
          certifications: ["ISO 9001", "School Equipment Certified"],
          previousProjects: 43,
          completionRate: 95.8,
        },
        {
          id: "BID-005",
          companyName: "Learning Resources Ltd",
          bidAmount: "₦2,200,000,000",
          technicalScore: 82,
          financialScore: 81,
          totalScore: 81.5,
          status: "Under Review",
          submissionDate: "2024-02-08",
          experience: "6 years",
          certifications: ["ISO 9001", "Educational Supplies Certified"],
          previousProjects: 29,
          completionRate: 94.2,
        },
      ]);
    } else {
      setSelectedWorkspace("MOH-2024-001");
      // Keep Ministry of Health bidders (already set as default)
    }
  }, []);

  // Mock data initialization
  // Sync NOC requests with central system
  const syncNOCUpdates = () => {
    const { ministry } = getMinistryMockData();
    const centralNOCs = localStorage.getItem("centralNOCRequests");
    if (!centralNOCs) return;

    const centralRequests = JSON.parse(centralNOCs);
    const ministryRequests = centralRequests.filter(
      (req: any) => req.ministryCode === ministry.code,
    );

    // Update local NOC requests with any status changes from central system
    const updatedNOCs = nocRequests.map((localReq) => {
      const centralReq = ministryRequests.find(
        (cr: any) => cr.id === localReq.id,
      );
      if (centralReq && centralReq.status !== localReq.status) {
        return {
          ...localReq,
          status: centralReq.status,
          approvalDate: centralReq.approvalDate,
          certificateNumber: centralReq.certificateNumber,
        };
      }
      return localReq;
    });

    // Add any new requests that might have been approved/rejected
    const newApprovedRejected = ministryRequests
      .filter(
        (cr: any) =>
          (cr.status === "Approved" || cr.status === "Rejected") &&
          !nocRequests.find((lr) => lr.id === cr.id),
      )
      .map((cr: any) => ({
        id: cr.id,
        projectTitle: cr.projectTitle,
        requestDate: cr.requestDate,
        status: cr.status,
        projectValue: cr.projectValue,
        contractorName: cr.contractorName,
        expectedDuration: cr.expectedDuration,
        approvalDate: cr.approvalDate,
        certificateNumber: cr.certificateNumber,
      }));

    if (
      newApprovedRejected.length > 0 ||
      updatedNOCs.some((noc, index) => noc !== nocRequests[index])
    ) {
      const finalNOCs = [...newApprovedRejected, ...updatedNOCs];
      setNOCRequests(finalNOCs);

      // Update localStorage
      const ministryNOCKey = `${ministry.code}_NOCRequests`;
      localStorage.setItem(ministryNOCKey, JSON.stringify(finalNOCs));
    }
  };

  // Handle real-time NOC status updates via browser events
  useEffect(() => {
    const handleNOCStatusUpdate = (event: CustomEvent) => {
      const {
        requestId,
        status,
        certificateNumber,
        approvalDate,
        rejectionDate,
      } = event.detail;

      setNOCRequests((prevRequests) => {
        const updatedRequests = prevRequests.map((request) => {
          if (request.id === requestId) {
            return {
              ...request,
              status,
              ...(status === "Approved" && {
                approvalDate,
                certificateNumber,
              }),
              ...(status === "Rejected" && {
                rejectionDate,
              }),
            };
          }
          return request;
        });

        // Update localStorage for persistence
        const { ministry } = getMinistryMockData();
        const ministryNOCKey = `${ministry.code}_NOCRequests`;
        localStorage.setItem(ministryNOCKey, JSON.stringify(updatedRequests));

        return updatedRequests;
      });
    };

    // Listen for NOC status updates
    window.addEventListener(
      "nocStatusUpdated",
      handleNOCStatusUpdate as EventListener,
    );

    // Fallback: Sync every 30 seconds (reduced frequency since we have real-time updates)
    const interval = setInterval(syncNOCUpdates, 30000);

    return () => {
      window.removeEventListener(
        "nocStatusUpdated",
        handleNOCStatusUpdate as EventListener,
      );
      clearInterval(interval);
    };
  }, [nocRequests]);

  useEffect(() => {
    const { ministryId, ministry } = getMinistryMockData();

    const getMinistrySpecificCompanies = (): Company[] => {
      switch (ministryId) {
        case "ministry2": // Ministry of Works
          return [
            {
              id: "1",
              companyName: "Kano Construction Ltd",
              contactPerson: "Eng. Ibrahim Mohammed",
              email: "ibrahim@kanoconstruction.ng",
              phone: "+234 803 123 4567",
              registrationDate: "2024-01-15",
              status: "Approved",
              businessType: "Construction & Infrastructure",
              address: "15 Industrial Area, Kano",
              lastActivity: "2024-02-01",
            },
            {
              id: "2",
              companyName: "Sahel Bridge Builders",
              contactPerson: "Mallam Usman Kano",
              email: "usman@sahelbridge.com",
              phone: "+234 805 987 6543",
              registrationDate: "2024-01-14",
              status: "Pending",
              businessType: "Bridge Construction",
              address: "22 Engineering Drive, Kano",
              lastActivity: "2024-01-30",
            },
            {
              id: "3",
              companyName: "Northern Roads Nigeria",
              contactPerson: "Fatima Abubakar",
              email: "fatima@northernroads.ng",
              phone: "+234 807 555 1234",
              registrationDate: "2024-01-13",
              status: "Approved",
              businessType: "Road Construction",
              address: "5 Highway Plaza, Kano",
              lastActivity: "2024-02-02",
            },
          ];
        case "ministry3": // Ministry of Education
          return [
            {
              id: "1",
              companyName: "EduTech Solutions Ltd",
              contactPerson: "Prof. Aisha Garba",
              email: "aisha@edutech.ng",
              phone: "+234 803 123 4567",
              registrationDate: "2024-01-15",
              status: "Approved",
              businessType: "Educational Technology",
              address: "10 Education Avenue, Kano",
              lastActivity: "2024-02-01",
            },
            {
              id: "2",
              companyName: "Kano School Furniture Ltd",
              contactPerson: "Malam Bello Sani",
              email: "bello@schoolfurniture.com",
              phone: "+234 805 987 6543",
              registrationDate: "2024-01-14",
              status: "Pending",
              businessType: "School Furniture Supply",
              address: "8 Furniture Street, Kano",
              lastActivity: "2024-01-30",
            },
            {
              id: "3",
              companyName: "Northern Educational Supplies",
              contactPerson: "Dr. Zainab Ibrahim",
              email: "zainab@northedu.ng",
              phone: "+234 807 555 1234",
              registrationDate: "2024-01-13",
              status: "Approved",
              businessType: "Educational Materials",
              address: "12 Learning Complex, Kano",
              lastActivity: "2024-02-02",
            },
          ];
        default: // Ministry of Health
          return [
            {
              id: "1",
              companyName: "PrimeCare Medical Ltd",
              contactPerson: "Dr. Amina Hassan",
              email: "amina@primecare.ng",
              phone: "+234 803 123 4567",
              registrationDate: "2024-01-15",
              status: "Approved",
              businessType: "Medical Equipment Supply",
              address: "123 Hospital Road, Kano",
              lastActivity: "2024-02-01",
            },
            {
              id: "2",
              companyName: "Falcon Diagnostics Ltd",
              contactPerson: "Dr. Fatima Yusuf",
              email: "fatima@falcondiag.com",
              phone: "+234 805 987 6543",
              registrationDate: "2024-01-14",
              status: "Pending",
              businessType: "Pharmaceutical Supply",
              address: "45 Medicine Street, Kano",
              lastActivity: "2024-01-30",
            },
            {
              id: "3",
              companyName: "Golden Gates Healthcare",
              contactPerson: "Eng. Musa Ibrahim",
              email: "musa@goldengates.ng",
              phone: "+234 807 555 1234",
              registrationDate: "2024-01-13",
              status: "Approved",
              businessType: "Healthcare Technology",
              address: "78 Tech Avenue, Kano",
              lastActivity: "2024-02-02",
            },
            {
              id: "4",
              companyName: "Royal Medical Solutions",
              contactPerson: "Dr. Khadija Aliyu",
              email: "khadija@royalmed.ng",
              phone: "+234 814 567 8901",
              registrationDate: "2024-01-12",
              status: "Approved",
              businessType: "Medical Supplies",
              address: "92 Health Plaza, Kano",
              lastActivity: "2024-02-03",
            },
            {
              id: "5",
              companyName: "Zenith Health Technologies",
              contactPerson: "Mal. Ahmad Tijjani",
              email: "ahmad@zenithhealth.ng",
              phone: "+234 809 234 5678",
              registrationDate: "2024-01-11",
              status: "Pending",
              businessType: "Health IT Solutions",
              address: "15 Innovation Drive, Kano",
              lastActivity: "2024-01-29",
            },
          ];
      }
    };

    const mockCompanies = getMinistrySpecificCompanies();

    const getMinistrySpecificTenders = (): Tender[] => {
      switch (ministryId) {
        case "ministry2": // Ministry of Works
          return [
            {
              id: "KS-2024-015",
              title: "Supply of Medical Equipment",
              description:
                "Procurement of medical equipment for Kano State hospitals",
              category: "Healthcare",
              estimatedValue: "�����850,000,000",
              status: "Published",
              publishDate: "2024-01-15",
              closeDate: "2024-02-15",
              bidsReceived: getBidCountForTender("KS-2024-015"),
              ministry: ministry.name,
              procuringEntity: "Kano State Road Maintenance Agency",
            },
            {
              id: "MOWI-2024-002",
              title: "Construction of 5 New Bridges",
              description:
                "Construction of bridges across major rivers in Kano State",
              category: "Bridge Construction",
              estimatedValue: "₦8,500,000,000",
              status: "Evaluated",
              publishDate: "2024-01-20",
              closeDate: "2024-03-01",
              bidsReceived: 4,
              ministry: ministry.name,
              procuringEntity: "Kano State Ministry of Works",
            },
            {
              id: "MOWI-2024-003",
              title: "Government Secretariat Renovation",
              description:
                "Complete renovation of the Kano State Government Secretariat",
              category: "Building Construction",
              estimatedValue: "₦6,800,000,000",
              status: "Closed",
              publishDate: "2024-01-10",
              closeDate: "2024-01-31",
              bidsReceived: 8,
              ministry: ministry.name,
              procuringEntity: "Kano State Ministry of Works",
            },
            {
              id: "MOWI-2024-004",
              title: "Urban Drainage System",
              description:
                "Construction of modern drainage system for Kano metropolis",
              category: "Infrastructure Development",
              estimatedValue: "���12,300,000,000",
              status: "Evaluated",
              publishDate: "2024-02-01",
              closeDate: "2024-03-10",
              bidsReceived: 5,
              ministry: ministry.name,
              procuringEntity: "Kano State Urban Development Board",
            },
            {
              id: "MOWI-2024-005",
              title: "Heavy Equipment Procurement",
              description:
                "Procurement of construction equipment and machinery",
              category: "Equipment Procurement",
              estimatedValue: "₦4,750,000,000",
              status: "Awarded" as any,
              publishDate: "2024-02-05",
              awardedCompany: "Heavy Machinery Solutions Ltd",
              awardAmount: "₦4,200,000,000",
              awardDate: "2024-03-15",
              closeDate: "2024-03-15",
              bidsReceived: 7,
              ministry: ministry.name,
              procuringEntity: "Kano State Ministry of Works",
            },
          ];
        case "ministry3": // Ministry of Education
          return [
            {
              id: "MOE-2024-001",
              title: "School Furniture Supply Program",
              description:
                "Supply of desks, chairs, and classroom furniture for 200 schools",
              category: "School Furniture",
              estimatedValue: "₦2,100,000,000",
              status: "Evaluated",
              publishDate: "2024-01-15",
              closeDate: "2024-02-15",
              bidsReceived: 8,
              ministry: ministry.name,
              procuringEntity: "Kano State Universal Basic Education Board",
            },
            {
              id: "MOE-2024-002",
              title: "Digital Learning Platform",
              description:
                "Development of digital learning platform for secondary schools",
              category: "Educational Technology",
              estimatedValue: "₦1,800,000,000",
              status: "Evaluated",
              publishDate: "2024-01-20",
              closeDate: "2024-03-01",
              bidsReceived: 5,
              ministry: ministry.name,
              procuringEntity: "Kano State Ministry of Education",
            },
            {
              id: "MOE-2024-003",
              title: "Science Laboratory Equipment",
              description:
                "Supply of laboratory equipment for 50 secondary schools",
              category: "Laboratory Equipment",
              estimatedValue: "₦3,200,000,000",
              status: "Closed",
              publishDate: "2024-01-10",
              closeDate: "2024-01-31",
              bidsReceived: 6,
              ministry: ministry.name,
              procuringEntity: "Kano State Secondary Education Board",
            },
            {
              id: "MOE-2024-004",
              title: "Library Books and Resources",
              description:
                "Procurement of textbooks and library resources for all levels",
              category: "Educational Materials",
              estimatedValue: "��1,650,000,000",
              status: "Evaluated",
              publishDate: "2024-02-01",
              closeDate: "2024-03-10",
              bidsReceived: 7,
              ministry: ministry.name,
              procuringEntity: "Kano State Education Resource Center",
            },
            {
              id: "MOE-2024-005",
              title: "Teacher Training Program",
              description:
                "Comprehensive teacher training and capacity building program",
              category: "Training Services",
              estimatedValue: "₦950,000,000",
              status: "Awarded" as any,
              publishDate: "2024-02-05",
              awardedCompany: "Professional Development Institute",
              awardAmount: "₦880,000,000",
              awardDate: "2024-03-15",
              closeDate: "2024-03-15",
              bidsReceived: 4,
              ministry: ministry.name,
              procuringEntity: "Kano State Ministry of Education",
            },
          ];
        default: // Ministry of Health
          return [
            {
              id: "MOH-2024-001",
              title: "Hospital Equipment Supply",
              description:
                "Supply of medical equipment for 5 primary healthcare centers",
              category: "Medical Equipment",
              estimatedValue: "₦850,000,000",
              status: "Evaluated",
              publishDate: "2024-01-15",
              closeDate: "2024-02-15",
              bidsReceived: 5,
              ministry: ministry.name,
              procuringEntity:
                "Kano State Primary Healthcare Development Agency",
            },
            {
              id: "MOH-2024-002",
              title: "Pharmaceutical Supply Contract",
              description:
                "Annual supply of essential medicines for state hospitals",
              category: "Pharmaceuticals",
              estimatedValue: "₦1,200,000,000",
              status: "Evaluated",
              publishDate: "2024-01-20",
              closeDate: "2024-03-01",
              bidsReceived: 5,
              ministry: ministry.name,
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
              bidsReceived: 5,
              ministry: ministry.name,
              procuringEntity: "Kano State Ministry of Health",
            },
            {
              id: "MOH-2024-004",
              title: "IT Infrastructure Upgrade",
              description:
                "Complete IT infrastructure upgrade for health facilities",
              category: "Information Technology",
              estimatedValue: "₦950,000,000",
              status: "Evaluated",
              publishDate: "2024-02-01",
              closeDate: "2024-03-10",
              bidsReceived: 5,
              ministry: ministry.name,
              procuringEntity: "Kano State eHealth Department",
            },
            {
              id: "MOH-2024-005",
              title: "Medical Consumables Supply",
              description:
                "Annual supply of medical consumables for all health centers",
              category: "Medical Supplies",
              estimatedValue: "₦750,000,000",
              status: "Awarded" as any,
              publishDate: "2024-02-05",
              awardedCompany: "HealthTech Solutions Ltd",
              awardAmount: "₦720,000,000",
              awardDate: "2024-03-15",
              closeDate: "2024-03-15",
              bidsReceived: 5,
              ministry: ministry.name,
              procuringEntity: "Kano State Ministry of Health",
            },
          ];
      }
    };

    const mockTenders = getMinistrySpecificTenders();

    const mockContracts: Contract[] = [
      {
        id: "CON-MOH-001",
        tenderId: "MOH-2024-001",
        contractorName: "PrimeCare Medical Ltd",
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
            amount: "�������255,000,000",
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
        contractorName: "Falcon Diagnostics Ltd",
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
        contractorName: "Golden Gates Healthcare",
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
            description:
              "Equipment failed quality standards during verification",
            raisedBy: "Ministry",
            raisedDate: "2024-04-18",
            status: "Under Mediation",
            mediator: "Kano State Procurement Review Board",
          },
        ],
      },
    ];

    const getMinistrySpecificNOCRequests = (): NOCRequest[] => {
      switch (ministryId) {
        case "ministry2": // Ministry of Works
          return [
            {
              id: "NOC-MOWI-001",
              projectTitle: "Kano-Kaduna Highway Rehabilitation - Phase 1",
              requestDate: "2024-01-20",
              status: "Pending",
              projectValue: "₦15,200,000,000",
              contractorName: "Kano Construction Ltd",
              expectedDuration: "18 months",
            },
            {
              id: "NOC-MOWI-002",
              projectTitle: "Bridge Construction Project - Phase 2",
              requestDate: "2024-02-01",
              status: "Pending",
              projectValue: "���8,500,000,000",
              contractorName: "Sahel Bridge Builders",
              expectedDuration: "12 months",
            },
            {
              id: "NOC-MOWI-003",
              projectTitle: "Government Secretariat Renovation",
              requestDate: "2024-02-05",
              status: "Pending",
              projectValue: "₦6,800,000,000",
              contractorName: "Northern Roads Nigeria",
              expectedDuration: "10 months",
            },
            {
              id: "NOC-MOWI-004",
              projectTitle: "Urban Drainage System Development",
              requestDate: "2024-02-08",
              status: "Pending",
              projectValue: "₦12,300,000,000",
              contractorName: "Emirate Construction Co",
              expectedDuration: "15 months",
            },
            {
              id: "NOC-MOWI-005",
              projectTitle: "Heavy Equipment Procurement & Installation",
              requestDate: "2024-02-10",
              status: "Pending",
              projectValue: "���4,750,000,000",
              contractorName: "Federal Infrastructure Ltd",
              expectedDuration: "8 months",
            },
          ];
        case "ministry3": // Ministry of Education
          return [
            {
              id: "NOC-MOE-001",
              projectTitle: "School Furniture Supply Program - Phase 1",
              requestDate: "2024-01-18",
              status: "Approved",
              projectValue: "₦2,100,000,000",
              contractorName: "EduTech Solutions Ltd",
              expectedDuration: "8 months",
              approvalDate: "2024-01-22",
              certificateNumber: "KNS/MOE/PNO/2024/001",
            },
            {
              id: "NOC-MOE-002",
              projectTitle: "Digital Learning Platform Development",
              requestDate: "2024-01-25",
              status: "Pending",
              projectValue: "₦1,800,000,000",
              contractorName: "Kano School Furniture Ltd",
              expectedDuration: "12 months",
            },
            {
              id: "NOC-MOE-003",
              projectTitle: "Science Laboratory Equipment Installation",
              requestDate: "2024-02-02",
              status: "Approved",
              projectValue: "₦3,200,000,000",
              contractorName: "Northern Educational Supplies",
              expectedDuration: "6 months",
              approvalDate: "2024-02-06",
              certificateNumber: "KNS/MOE/PNO/2024/002",
            },
            {
              id: "NOC-MOE-004",
              projectTitle: "Library Books and Resources Distribution",
              requestDate: "2024-02-05",
              status: "Approved",
              projectValue: "₦1,650,000,000",
              contractorName: "Academic Furniture Nigeria",
              expectedDuration: "5 months",
              approvalDate: "2024-02-08",
              certificateNumber: "KNS/MOE/PNO/2024/003",
            },
          ];
        default: // Ministry of Health
          return [
            {
              id: "NOC-MOH-001",
              projectTitle: "Hospital Equipment Supply - Phase 1",
              requestDate: "2024-01-25",
              status: "Approved",
              projectValue: "₦850,000,000",
              contractorName: "PrimeCare Medical Ltd",
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
              contractorName: "Golden Gates Healthcare",
              expectedDuration: "4 months",
            },
            {
              id: "NOC-MOH-003",
              projectTitle: "Pharmaceutical Supply Program",
              requestDate: "2024-02-05",
              status: "Approved",
              projectValue: "₦1,200,000,000",
              contractorName: "Falcon Diagnostics Ltd",
              expectedDuration: "12 months",
              approvalDate: "2024-02-08",
              certificateNumber: "KNS/MOP/PNO/2024/002",
            },
          ];
      }
    };

    // Load ministry-specific NOC requests from localStorage or use mock data
    const ministryNOCKey = `${ministry.code}_NOCRequests`;
    const storedMinistryNOCs = localStorage.getItem(ministryNOCKey);

    let mockNOCRequests;
    if (storedMinistryNOCs) {
      mockNOCRequests = JSON.parse(storedMinistryNOCs);
    } else {
      // Initialize with ministry-specific mock data and store it
      mockNOCRequests = getMinistrySpecificNOCRequests();
      localStorage.setItem(ministryNOCKey, JSON.stringify(mockNOCRequests));
    }

    const getMinistrySpecificEvaluationCommittees =
      (): EvaluationCommittee[] => {
        switch (ministryId) {
          case "ministry2": // Ministry of Works
            return [
              {
                id: "EC-001",
                name: "Infrastructure & Construction Evaluation Committee",
                chairperson: "Eng. Ibrahim Mohammed",
                secretary: "Eng. Fatima Abubakar",
                specialization: [
                  "Construction",
                  "Infrastructure Development",
                  "Engineering",
                ],
                activeEvaluations: ["MOWI-2024-001", "MOWI-2024-002"],
                status: "Active",
                members: [
                  {
                    id: "MEM-001",
                    name: "Eng. Ibrahim Mohammed",
                    role: "Chairperson",
                    department: "Construction Engineering",
                    email: "ibrahim.mohammed@works.kano.gov.ng",
                    phone: "+234 803 123 4567",
                    expertise: ["Construction Management", "Quality Assurance"],
                    availability: "Available",
                  },
                  {
                    id: "MEM-002",
                    name: "Eng. Fatima Abubakar",
                    role: "Technical Expert",
                    department: "Civil Engineering",
                    email: "fatima.abubakar@works.kano.gov.ng",
                    phone: "+234 805 987 6543",
                    expertise: ["Civil Engineering", "Project Evaluation"],
                    availability: "Available",
                  },
                  {
                    id: "MEM-003",
                    name: "Mal. Usman Kano",
                    role: "Financial Analyst",
                    department: "Finance & Procurement",
                    email: "usman.kano@works.kano.gov.ng",
                    phone: "+234 807 555 1234",
                    expertise: ["Financial Analysis", "Cost Estimation"],
                    availability: "Available",
                  },
                ],
              },
            ];
          case "ministry3": // Ministry of Education
            return [
              {
                id: "EC-001",
                name: "Educational Resources Evaluation Committee",
                chairperson: "Prof. Aisha Garba",
                secretary: "Dr. Zainab Ibrahim",
                specialization: [
                  "Educational Technology",
                  "School Infrastructure",
                  "Learning Resources",
                ],
                activeEvaluations: ["MOE-2024-001", "MOE-2024-002"],
                status: "Active",
                members: [
                  {
                    id: "MEM-001",
                    name: "Prof. Aisha Garba",
                    role: "Chairperson",
                    department: "Educational Planning",
                    email: "aisha.garba@education.kano.gov.ng",
                    phone: "+234 803 123 4567",
                    expertise: [
                      "Educational Technology",
                      "Curriculum Development",
                    ],
                    availability: "Available",
                  },
                  {
                    id: "MEM-002",
                    name: "Dr. Zainab Ibrahim",
                    role: "Technical Expert",
                    department: "Educational Resources",
                    email: "zainab.ibrahim@education.kano.gov.ng",
                    phone: "+234 805 987 6543",
                    expertise: ["Educational Materials", "Quality Assessment"],
                    availability: "Available",
                  },
                  {
                    id: "MEM-003",
                    name: "Mal. Bello Sani",
                    role: "Financial Analyst",
                    department: "Finance & Administration",
                    email: "bello.sani@education.kano.gov.ng",
                    phone: "+234 807 555 1234",
                    expertise: ["Educational Finance", "Budget Analysis"],
                    availability: "Busy",
                  },
                ],
              },
            ];
          default: // Ministry of Health
            return [
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
        }
      };

    const mockEvaluationCommittees = getMinistrySpecificEvaluationCommittees();

    const getMinistrySpecificBidEvaluations = (): BidEvaluation[] => {
      switch (ministryId) {
        case "ministry2": // Ministry of Works
          return [
            {
              id: "EVAL-001",
              tenderId: "MOWI-2024-001",
              companyId: "COMP-001",
              companyName: "Kano Construction Ltd",
              evaluatorId: "MEM-001",
              technicalScore: 90,
              financialScore: 87,
              complianceScore: 95,
              totalScore: 91,
              comments:
                "Excellent engineering expertise and competitive pricing for highway project",
              recommendations: "Recommended for award",
              status: "Submitted",
              submissionDate: "2024-02-12",
            },
            {
              id: "EVAL-002",
              tenderId: "MOWI-2024-002",
              companyId: "COMP-002",
              companyName: "Sahel Bridge Builders",
              evaluatorId: "MEM-002",
              technicalScore: 93,
              financialScore: 89,
              complianceScore: 92,
              totalScore: 91.3,
              comments:
                "Specialized bridge construction experience with strong technical approach",
              recommendations: "Recommended for award",
              status: "Submitted",
              submissionDate: "2024-02-15",
            },
          ];
        case "ministry3": // Ministry of Education
          return [
            {
              id: "EVAL-001",
              tenderId: "MOE-2024-001",
              companyId: "COMP-001",
              companyName: "EduTech Solutions Ltd",
              evaluatorId: "MEM-001",
              technicalScore: 95,
              financialScore: 92,
              complianceScore: 97,
              totalScore: 94.7,
              comments:
                "Outstanding educational technology proposal with innovative learning solutions",
              recommendations: "Highly recommended for award",
              status: "Submitted",
              submissionDate: "2024-02-10",
            },
            {
              id: "EVAL-002",
              tenderId: "MOE-2024-002",
              companyId: "COMP-002",
              companyName: "Kano School Furniture Ltd",
              evaluatorId: "MEM-002",
              technicalScore: 91,
              financialScore: 89,
              complianceScore: 94,
              totalScore: 91.3,
              comments:
                "Quality furniture design with cost-effective solutions for schools",
              recommendations: "Recommended for award",
              status: "Submitted",
              submissionDate: "2024-02-12",
            },
          ];
        default: // Ministry of Health
          return [
            {
              id: "EVAL-001",
              tenderId: "MOH-2024-002",
              companyId: "COMP-001",
              companyName: "Falcon Diagnostics Ltd",
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
      }
    };

    const mockBidEvaluations = getMinistrySpecificBidEvaluations();

    const getMinistrySpecificVendorCommunications =
      (): VendorCommunication[] => {
        switch (ministryId) {
          case "ministry2": // Ministry of Works
            return [
              {
                id: "COMM-001",
                vendorId: "VEND-001",
                vendorName: "Kano Construction Ltd",
                subject: "Amendment to Tender MOWI-2024-001",
                message:
                  "Please note the amendment to construction timeline in tender MOWI-2024-001. Weather conditions extension approved.",
                type: "Amendment",
                channels: ["Email", "SMS"],
                sentDate: "2024-02-10",
                readStatus: true,
                responseRequired: false,
                priority: "Medium",
              },
              {
                id: "COMM-002",
                vendorId: "VEND-002",
                vendorName: "Sahel Bridge Builders",
                subject: "Clarification on Bridge Specifications",
                message:
                  "Technical clarification regarding bridge foundation requirements for MOWI-2024-002.",
                type: "Clarification",
                channels: ["Email", "Portal"],
                sentDate: "2024-02-12",
                readStatus: false,
                responseRequired: true,
                priority: "High",
              },
            ];
          case "ministry3": // Ministry of Education
            return [
              {
                id: "COMM-001",
                vendorId: "VEND-001",
                vendorName: "EduTech Solutions Ltd",
                subject: "Amendment to Tender MOE-2024-002",
                message:
                  "Please note the amendment to digital platform specifications in tender MOE-2024-002",
                type: "Amendment",
                channels: ["Email", "SMS", "Portal"],
                sentDate: "2024-02-08",
                readStatus: true,
                responseRequired: false,
                priority: "Medium",
              },
              {
                id: "COMM-002",
                vendorId: "VEND-002",
                vendorName: "Kano School Furniture Ltd",
                subject: "Furniture Quality Standards Update",
                message:
                  "Updated quality standards and safety requirements for school furniture have been published.",
                type: "General",
                channels: ["Email", "Portal"],
                sentDate: "2024-02-11",
                readStatus: true,
                responseRequired: false,
                priority: "Low",
              },
            ];
          default: // Ministry of Health
            return [
              {
                id: "COMM-001",
                vendorId: "VEND-001",
                vendorName: "PrimeCare Medical Ltd",
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
        }
      };

    const mockVendorCommunications = getMinistrySpecificVendorCommunications();

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
      {
        id: "SCHED-002",
        tenderId: "MOH-2024-005",
        tenderTitle: "Digital Health Records System Implementation",
        scheduledDate: "2024-02-22",
        scheduledTime: "10:30",
        distributionChannels: ["Website", "Email", "Newspaper"],
        targetCategories: [
          "IT Services",
          "Software Development",
          "Healthcare Technology",
        ],
        status: "Scheduled",
        createdBy: "IT Department",
        notes: "Critical digital transformation project - target tech vendors",
      },
      {
        id: "SCHED-003",
        tenderId: "MOH-2024-006",
        tenderTitle: "Medical Equipment Maintenance Services",
        scheduledDate: "2024-02-21",
        scheduledTime: "14:00",
        distributionChannels: ["Website", "Email", "SMS", "Radio"],
        targetCategories: ["Medical Equipment", "Maintenance Services"],
        status: "Published",
        createdBy: "Procurement Officer",
        notes: "Annual maintenance contract - published successfully",
      },
      {
        id: "SCHED-004",
        tenderId: "MOH-2024-007",
        tenderTitle: "Emergency Medical Supplies Procurement",
        scheduledDate: "2024-02-25",
        scheduledTime: "08:00",
        distributionChannels: ["Website", "Email", "SMS", "Newspaper", "Radio"],
        targetCategories: [
          "Medical Supplies",
          "Emergency Services",
          "Pharmaceuticals",
        ],
        status: "Scheduled",
        createdBy: "Emergency Response Team",
        notes:
          "Urgent procurement for emergency preparedness - maximum visibility",
      },
      {
        id: "SCHED-005",
        tenderId: "MOH-2024-008",
        tenderTitle: "Telemedicine Platform Development",
        scheduledDate: "2024-02-28",
        scheduledTime: "11:00",
        distributionChannels: ["Website", "Email", "Tech Blogs"],
        targetCategories: [
          "Software Development",
          "Telemedicine",
          "Healthcare Technology",
        ],
        status: "Draft",
        createdBy: "Digital Health Initiative",
        notes: "Innovative telemedicine solution - targeting tech companies",
      },
      {
        id: "SCHED-006",
        tenderId: "MOH-2024-009",
        tenderTitle: "Hospital Waste Management System",
        scheduledDate: "2024-02-18",
        scheduledTime: "13:30",
        distributionChannels: ["Website", "Email", "Environmental Journals"],
        targetCategories: [
          "Waste Management",
          "Environmental Services",
          "Healthcare",
        ],
        status: "Failed",
        createdBy: "Environmental Officer",
        notes:
          "Publication failed due to technical issues - needs republishing",
      },
      {
        id: "SCHED-007",
        tenderId: "MOH-2024-010",
        tenderTitle: "Mobile Health Clinic Vehicle Procurement",
        scheduledDate: "2024-03-01",
        scheduledTime: "09:30",
        distributionChannels: ["Website", "Email", "SMS", "Trade Publications"],
        targetCategories: [
          "Vehicle Procurement",
          "Healthcare Equipment",
          "Mobile Services",
        ],
        status: "Scheduled",
        createdBy: "Rural Health Program",
        notes:
          "Expanding healthcare access to rural areas - specialized vehicle requirements",
      },
      {
        id: "SCHED-008",
        tenderId: "MOH-2024-011",
        tenderTitle: "Laboratory Information Management System",
        scheduledDate: "2024-03-05",
        scheduledTime: "15:00",
        distributionChannels: ["Website", "Email", "Scientific Journals"],
        targetCategories: [
          "Laboratory Management",
          "Software Development",
          "Healthcare IT",
        ],
        status: "Scheduled",
        createdBy: "Laboratory Services",
        notes:
          "Advanced LIMS for improved laboratory efficiency and data management",
      },
    ];

    const mockVendorWorkflowStatuses: VendorWorkflowStatus[] = [
      {
        companyId: "BID-001",
        companyName: "PrimeCare Medical Ltd",
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
        companyName: "Falcon Diagnostics Ltd",
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
        companyName: "Golden Gates Healthcare",
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
      {
        companyId: "BID-004",
        companyName: "Royal Medical Solutions",
        registrationCompleted: true,
        loginVerificationCompleted: true,
        biddingCompleted: true,
        evaluationCompleted: true,
        nocIssued: false,
        finalApprovalStatus: "pending",
        registrationDate: "2024-01-12",
        verificationDate: "2024-01-13",
        bidSubmissionDate: "2024-02-07",
        evaluationDate: "2024-02-09",
      },
      {
        companyId: "BID-005",
        companyName: "Zenith Health Technologies",
        registrationCompleted: true,
        loginVerificationCompleted: true,
        biddingCompleted: true,
        evaluationCompleted: true,
        nocIssued: false,
        finalApprovalStatus: "pending",
        registrationDate: "2024-01-11",
        verificationDate: "2024-01-12",
        bidSubmissionDate: "2024-02-06",
        evaluationDate: "2024-02-08",
      },
    ];

    // Load companies with real-time synchronization to Admin/SuperUser dashboards
    const loadSynchronizedCompanies = () => {
      // Load registered companies from localStorage (where CompanyRegistration saves them)
      const registeredCompanies = JSON.parse(
        localStorage.getItem("registeredCompanies") || "[]",
      );

      // Convert registered companies to ministry dashboard format
      const formattedRegisteredCompanies = registeredCompanies.map(
        (reg: any, index: number) => ({
          id: reg.id || `reg-${index}`,
          companyName: reg.companyName || "Unknown Company",
          contactPerson: reg.contactPerson || "Unknown Contact",
          email: reg.email || "",
          phone: reg.phone || "",
          registrationDate:
            reg.registrationDate || new Date().toISOString().split("T")[0],
          status:
            (persistentStorage.getItem(
              `userStatus_${reg.email?.toLowerCase()}`,
            ) as "Pending" | "Approved" | "Suspended" | "Blacklisted") ||
            "Pending",
          businessType: reg.businessType || "Limited Liability Company",
          address: reg.address || "",
          lastActivity:
            reg.lastActivity || new Date().toISOString().split("T")[0],
        }),
      );

      // Test companies that sync with AdminDashboard and SuperUserDashboard
      const testCompanies = [
        {
          id: "test-1",
          companyName: "Northern Construction Ltd",
          contactPerson: "Ahmad Mahmoud",
          email: "ahmad@northernconstruction.com",
          phone: "+234 803 123 4567",
          registrationDate: "2024-01-15",
          status:
            (persistentStorage.getItem(
              `userStatus_ahmad@northernconstruction.com`,
            ) as "Pending" | "Approved" | "Suspended" | "Blacklisted") ||
            "Pending",
          businessType: "Construction & Infrastructure",
          address: "123 Ahmadu Bello Way, Kano",
          lastActivity: "2024-02-01",
        },
        {
          id: "test-2",
          companyName: "Premier Construction Company",
          contactPerson: "Muhammad Ali",
          email: "approved@company.com",
          phone: "+234 805 987 6543",
          registrationDate: "2024-01-13",
          status:
            (persistentStorage.getItem(`userStatus_approved@company.com`) as
              | "Pending"
              | "Approved"
              | "Suspended"
              | "Blacklisted") || "Approved",
          businessType: "Limited Liability Company",
          address: "78 Independence Road, Kano",
          lastActivity: "2024-02-02",
        },
        {
          id: "test-3",
          companyName: "Omega Engineering Services",
          contactPerson: "Sani Abdullahi",
          email: "suspended@company.com",
          phone: "+234 809 111 2222",
          registrationDate: "2024-01-10",
          status:
            (persistentStorage.getItem(`userStatus_suspended@company.com`) as
              | "Pending"
              | "Approved"
              | "Suspended"
              | "Blacklisted") || "Suspended",
          businessType: "Limited Liability Company",
          address: "12 Engineering Close, Kano",
          lastActivity: "2024-01-18",
        },
        {
          id: "test-4",
          companyName: "Restricted Corp Ltd",
          contactPerson: "Ahmed Musa",
          email: "blacklisted@company.com",
          phone: "+234 806 333 4444",
          registrationDate: "2024-01-05",
          status:
            (persistentStorage.getItem(`userStatus_blacklisted@company.com`) as
              | "Pending"
              | "Approved"
              | "Suspended"
              | "Blacklisted") || "Blacklisted",
          businessType: "Limited Liability Company",
          address: "56 Industrial Layout, Kano",
          lastActivity: "2024-01-17",
        },
        {
          id: "test-5",
          companyName: "New Ventures Construction Ltd",
          contactPerson: "Amina Suleiman",
          email: "pending@company.com",
          phone: "+234 807 444 5555",
          registrationDate: "2024-01-20",
          status:
            (persistentStorage.getItem(`userStatus_pending@company.com`) as
              | "Pending"
              | "Approved"
              | "Suspended"
              | "Blacklisted") || "Pending",
          businessType: "Limited Liability Company",
          address: "90 New GRA, Kano",
          lastActivity: "2024-01-29",
        },
      ];

      // Combine registered companies with test companies (avoid duplicates by email)
      const allCompanies = [...formattedRegisteredCompanies];
      testCompanies.forEach((testCompany) => {
        const existsInRegistered = formattedRegisteredCompanies.find(
          (reg) => reg.email.toLowerCase() === testCompany.email.toLowerCase(),
        );
        if (!existsInRegistered) {
          allCompanies.push(testCompany);
        }
      });

      console.log(
        "🔄 Ministry Dashboard: Loaded",
        allCompanies.length,
        "synchronized companies",
      );
      setCompanies(allCompanies);
    };

    // Initialize synchronized companies
    loadSynchronizedCompanies();

    // Load users for this MDA
    loadMDAUsers();

    // Set up real-time synchronization with Admin/SuperUser dashboards
    const syncInterval = setInterval(() => {
      console.log(
        "��� Ministry Dashboard: Checking for company status changes...",
      );
      setCompanies((prevCompanies) => {
        let hasChanges = false;
        const updatedCompanies = prevCompanies.map((company) => {
          const currentStatus = persistentStorage.getItem(
            `userStatus_${company.email.toLowerCase()}`,
          );
          if (currentStatus && currentStatus !== company.status) {
            console.log(
              `🔄 Status change detected for ${company.companyName}: ${company.status} -> ${currentStatus}`,
            );
            hasChanges = true;
            return { ...company, status: currentStatus };
          }
          return company;
        });

        if (hasChanges) {
          console.log(
            "✅ Ministry Dashboard: Updated company statuses via polling",
          );
        }

        return hasChanges ? updatedCompanies : prevCompanies;
      });
    }, 3000); // Check every 3 seconds for real-time updates

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith("userStatus_") && event.newValue) {
        console.log(
          "🔄 localStorage change detected in Ministry Dashboard:",
          event.key,
          event.newValue,
        );

        // Extract email from storage key (remove 'userStatus_' prefix)
        const email = event.key.replace("userStatus_", "");
        console.log("🔍 Looking for company with email:", email);

        // Update the specific company's status immediately
        setCompanies((prevCompanies) => {
          const updatedCompanies = prevCompanies.map((company) => {
            if (company.email.toLowerCase() === email) {
              console.log(
                "�� Updating company status:",
                company.companyName,
                "from",
                company.status,
                "to",
                event.newValue,
              );
              return { ...company, status: event.newValue };
            }
            return company;
          });

          return updatedCompanies;
        });
      }
    };

    // Listen for localStorage changes from other tabs/windows
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events within the same tab
    const handleCustomStorageChange = (event: any) => {
      const { key, newValue } = event.detail;
      if (key && key.startsWith("userStatus_")) {
        console.log(
          "🔄 Custom storage change detected in Ministry Dashboard:",
          key,
          newValue,
        );

        const email = key.replace("userStatus_", "");
        setCompanies((prevCompanies) => {
          return prevCompanies.map((company) => {
            if (company.email.toLowerCase() === email) {
              console.log(
                "✅ Updating company status via custom event:",
                company.companyName,
                "to",
                newValue,
              );
              return { ...company, status: newValue };
            }
            return company;
          });
        });
      }
    };

    window.addEventListener(
      "persistentStorageChange",
      handleCustomStorageChange,
    );

    // Cleanup function to remove event listeners and intervals
    const cleanupSync = () => {
      clearInterval(syncInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "persistentStorageChange",
        handleCustomStorageChange,
      );
    };

    // Store cleanup function for later use
    (window as any).ministryDashboardCleanup = cleanupSync;

    // Load tenders from localStorage if available, otherwise use mock data
    const storedTenders = localStorage.getItem("ministryTenders");

    if (storedTenders) {
      const parsedTenders = JSON.parse(storedTenders);
      // Merge with mock tenders to ensure we have both created and default tenders
      const allTenders = [...parsedTenders];
      // Add mock tenders that don't already exist (prevent duplicates by ID)
      mockTenders.forEach((mockTender) => {
        if (!allTenders.find((t) => t.id === mockTender.id)) {
          allTenders.push(mockTender);
        }
      });
      setTenders(allTenders);
    } else {
      setTenders(mockTenders);
      // Save initial mock tenders to localStorage
      localStorage.setItem("ministryTenders", JSON.stringify(mockTenders));

      // Also save with ministry-specific key for NOC system access
      const ministryTendersKey = `${ministry.code}_tenders`;
      localStorage.setItem(ministryTendersKey, JSON.stringify(mockTenders));
    }

    // Sync any ministry tenders that might be missing from featured/recent tenders
    const syncTendersToPublicKeys = () => {
      const ministryTenders = JSON.parse(
        localStorage.getItem("ministryTenders") || "[]",
      );
      const existingFeatured = JSON.parse(
        localStorage.getItem("featuredTenders") || "[]",
      );
      const existingRecent = JSON.parse(
        localStorage.getItem("recentTenders") || "[]",
      );

      ministryTenders.forEach((tender: any) => {
        // Check if tender exists in featured tenders
        if (!existingFeatured.find((ft: any) => ft.id === tender.id)) {
          const featuredTender = {
            id: tender.id,
            title: tender.title,
            description: tender.description,
            value: tender.estimatedValue,
            deadline: new Date(tender.closeDate).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            status: tender.status === "Published" ? "Open" : "Draft",
            statusColor:
              tender.status === "Published"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800",
            category: tender.category,
            ministry: tender.ministry,
            createdAt: Date.now(),
          };
          existingFeatured.unshift(featuredTender);
        }

        // Check if tender exists in recent tenders
        if (!existingRecent.find((rt: any) => rt.id === tender.id)) {
          const recentTender = {
            id: tender.id,
            title: tender.title,
            description: tender.description,
            category: tender.category,
            value: tender.estimatedValue,
            deadline: new Date(tender.closeDate).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            location: "Kano State",
            procuringEntity: tender.procuringEntity || tender.ministry,
            status: tender.status === "Published" ? "Open" : "Draft",
            publishDate: tender.publishDate,
            closeDate: tender.closeDate,
            createdAt: Date.now(),
          };
          existingRecent.unshift(recentTender);
        }
      });

      // Save the updated arrays back to localStorage
      localStorage.setItem(
        "featuredTenders",
        JSON.stringify(existingFeatured.slice(0, 5)),
      );
      localStorage.setItem(
        "recentTenders",
        JSON.stringify(existingRecent.slice(0, 10)),
      );
    };

    // Run the sync function
    syncTendersToPublicKeys();

    setContracts(mockContracts);
    setNOCRequests(mockNOCRequests);
    setEvaluationCommittees(mockEvaluationCommittees);

    // Mock MDA Users
    const mockMDAUsers: MDAUser[] = [
      {
        id: "mdauser-001",
        mdaId: "mda-001",
        userId: "usr-001",
        role: "procurement_officer",
        department: "Procurement Department",
        permissions: {
          canCreateTenders: true,
          canEvaluateBids: true,
          canViewFinancials: true,
          canGenerateReports: true,
          accessLevel: "write",
        },
        assignedBy: "admin-001",
        assignedAt: new Date("2024-01-05"),
        isActive: true,
      },
      {
        id: "mdauser-002",
        mdaId: "mda-001",
        userId: "usr-002",
        role: "accountant",
        department: "Finance Department",
        permissions: {
          canCreateTenders: false,
          canEvaluateBids: false,
          canViewFinancials: true,
          canGenerateReports: true,
          accessLevel: "read",
        },
        assignedBy: "admin-001",
        assignedAt: new Date("2024-01-06"),
        isActive: true,
      },
      {
        id: "mdauser-003",
        mdaId: "mda-001",
        userId: "usr-003",
        role: "evaluator",
        department: "Technical Evaluation",
        permissions: {
          canCreateTenders: false,
          canEvaluateBids: true,
          canViewFinancials: false,
          canGenerateReports: true,
          accessLevel: "read",
        },
        assignedBy: "admin-001",
        assignedAt: new Date("2024-01-07"),
        isActive: true,
      },
    ];

    setMDAUsers(mockMDAUsers);
    setBidEvaluations(mockBidEvaluations);
    setVendorCommunications(mockVendorCommunications);
    setScheduledPublications(mockScheduledPublications);
    setVendorWorkflowStatuses(mockVendorWorkflowStatuses);

    // Refresh bid counts and check tender statuses after initial load
    setTimeout(() => {
      refreshAllTenderBidCounts();
    }, 100);

    // Set up automatic status checking every minute
    const statusCheckInterval = setInterval(() => {
      refreshAllTenderBidCounts();
    }, 60000); // Check every minute

    // Cleanup interval on unmount
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };

    // Log ministry dashboard access
    logUserAction(
      "MinistryUser",
      "ministry_user",
      "MINISTRY_DASHBOARD_ACCESSED",
      "Ministry Dashboard",
      `Ministry user from ${ministry.name} accessed the ministry dashboard`,
      "LOW",
      undefined,
      {
        accessTime: new Date().toISOString(),
        ministryName: ministry.name,
        ministryCode: ministry.code,
        ministryId: ministryId,
        userAgent: navigator.userAgent,
        tendersLoaded: mockTenders.length,
        companiesLoaded: companies.length,
      },
    );

    // Cleanup function for the useEffect
    return () => {
      // Clean up synchronization if it exists
      if ((window as any).ministryDashboardCleanup) {
        (window as any).ministryDashboardCleanup();
        delete (window as any).ministryDashboardCleanup;
      }
    };
  }, []);

  // Function to load bids from localStorage for selected tender
  const loadBidsForTender = (tenderId: string) => {
    try {
      const storedBids = localStorage.getItem("tenderBids");
      if (!storedBids) return [];

      const allBids = JSON.parse(storedBids);

      // Filter bids for this specific tender
      const tenderBids = allBids.filter(
        (bid: any) => bid.tenderId === tenderId,
      );

      // Convert to the format expected by the ministry dashboard
      return tenderBids.map((bid: any) => ({
        id: bid.id,
        companyName: bid.companyName,
        bidAmount: bid.bidAmount,
        technicalScore:
          bid.technicalScore || Math.floor(Math.random() * 20) + 80, // Mock score if not evaluated
        financialScore:
          bid.financialScore || Math.floor(Math.random() * 20) + 80, // Mock score if not evaluated
        totalScore: bid.totalScore || Math.floor(Math.random() * 20) + 80, // Mock score if not evaluated
        status: "Qualified",
        submissionDate: new Date(bid.submittedAt).toISOString().split("T")[0],
        experience: bid.experience || "5+ years",
        certifications: bid.certifications || ["ISO 9001"],
        previousProjects: bid.previousProjects || 15,
        completionRate: bid.completionRate || 95.0,
        timeline: bid.timeline,
        technicalProposal: bid.technicalProposal,
        financialProposal: bid.financialProposal,
      }));
    } catch (error) {
      console.error("Error loading bids from localStorage:", error);
      return [];
    }
  };

  // Function to get real bid count for a tender
  const getBidCountForTender = (tenderId: string) => {
    try {
      const storedBids = localStorage.getItem("tenderBids");
      if (!storedBids) return 0;

      const allBids = JSON.parse(storedBids);
      const matchingBids = allBids.filter(
        (bid: any) => bid.tenderId === tenderId,
      );

      return matchingBids.length;
    } catch (error) {
      console.error("Error getting bid count:", error);
      return 0;
    }
  };

  // Function to refresh bid counts for all tenders and check for automatic evaluation
  const refreshAllTenderBidCounts = () => {
    setTenders((prev) => {
      const updatedTenders = prev.map((tender) => {
        // Apply automatic status transitions
        const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
          tender.status as TenderStatus,
          tender.closeDate,
          tender.publishDate,
        );

        const updatedTender = {
          ...tender,
          status: automaticStatus,
          bidsReceived: getBidCountForTender(tender.id),
        };

        // Check if tender just moved to Closed and should start evaluation
        if (automaticStatus === "Closed" && tender.status !== "Closed") {
          // Trigger automatic evaluation start
          if (tenderStatusChecker.shouldStartEvaluation(automaticStatus)) {
            // Log the automatic evaluation trigger
            logUserAction(
              "MinistrySystem",
              "ministry_user",
              "TENDER_EVALUATION_AUTO_START",
              tender.title,
              `Tender ${tender.id} automatically moved to evaluation stage after closure`,
              "MEDIUM",
              tender.id,
              {
                previousStatus: tender.status,
                newStatus: automaticStatus,
                autoEvaluationEnabled:
                  tenderSettingsManager.isAutoEvaluationStartEnabled(),
                tenderCloseDate: tender.closeDate,
                triggerTime: new Date().toISOString(),
              },
            );

            // Update workflow status to show evaluation is ready
            setWorkflowStatuses((prevStatuses) => ({
              ...prevStatuses,
              [tender.id]: {
                ...prevStatuses[tender.id],
                evaluationReady: true,
                evaluationStarted: false,
                evaluationDate: new Date().toISOString().split("T")[0],
              },
            }));
          }
        }

        return updatedTender;
      });

      // Save updated tenders to localStorage if there were status changes
      const hasStatusChanges = updatedTenders.some(
        (tender, index) => tender.status !== prev[index]?.status,
      );

      if (hasStatusChanges) {
        localStorage.setItem("ministryTenders", JSON.stringify(updatedTenders));
        const ministryTendersKey = `${ministry.code}_tenders`;
        localStorage.setItem(
          ministryTendersKey,
          JSON.stringify(updatedTenders),
        );
      }

      return updatedTenders;
    });
  };

  // Update bidders when workspace changes
  useEffect(() => {
    const bidderDataByWorkspace = {
      // Ministry of Works Infrastructure tenders
      "MOWI-2024-001": [
        {
          id: "BID-001",
          companyName: "Kano Construction Ltd",
          bidAmount: "₦14,800,000,000",
          technicalScore: 90,
          financialScore: 87,
          totalScore: 88.5,
          status: "Qualified",
          submissionDate: "2024-02-10",
          experience: "20 years",
          certifications: ["ISO 9001", "COREN Certified", "NIQS Registered"],
          previousProjects: 62,
          completionRate: 97.8,
        },
        {
          id: "BID-002",
          companyName: "Sahel Bridge Builders",
          bidAmount: "₦15,100,000,000",
          technicalScore: 88,
          financialScore: 85,
          totalScore: 86.5,
          status: "Qualified",
          submissionDate: "2024-02-09",
          experience: "18 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 45,
          completionRate: 96.2,
        },
        {
          id: "BID-003",
          companyName: "Northern Roads Nigeria",
          bidAmount: "₦15,400,000,000",
          technicalScore: 85,
          financialScore: 83,
          totalScore: 84,
          status: "Qualified",
          submissionDate: "2024-02-08",
          experience: "15 years",
          certifications: ["ISO 9001", "NBRRI Certified"],
          previousProjects: 38,
          completionRate: 95.5,
        },
        {
          id: "BID-004",
          companyName: "Emirate Construction Co",
          bidAmount: "₦15,600,000,000",
          technicalScore: 82,
          financialScore: 80,
          totalScore: 81,
          status: "Qualified",
          submissionDate: "2024-02-07",
          experience: "12 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 29,
          completionRate: 94.1,
        },
        {
          id: "BID-005",
          companyName: "Federal Infrastructure Ltd",
          bidAmount: "₦15,800,000,000",
          technicalScore: 80,
          financialScore: 78,
          totalScore: 79,
          status: "Qualified",
          submissionDate: "2024-02-06",
          experience: "10 years",
          certifications: ["ISO 9001", "NIQS Registered"],
          previousProjects: 22,
          completionRate: 92.7,
        },
      ],
      "MOWI-2024-002": [
        {
          id: "BID-006",
          companyName: "Sahel Bridge Builders",
          bidAmount: "₦8,200,000,000",
          technicalScore: 93,
          financialScore: 89,
          totalScore: 91,
          status: "Qualified",
          submissionDate: "2024-02-15",
          experience: "18 years",
          certifications: ["Bridge Construction Certified", "COREN Certified"],
          previousProjects: 28,
          completionRate: 98.1,
        },
        {
          id: "BID-007",
          companyName: "Northern Roads Nigeria",
          bidAmount: "₦8,400,000,000",
          technicalScore: 90,
          financialScore: 86,
          totalScore: 88,
          status: "Qualified",
          submissionDate: "2024-02-14",
          experience: "15 years",
          certifications: ["ISO 9001", "Bridge Engineering Certified"],
          previousProjects: 22,
          completionRate: 96.8,
        },
        {
          id: "BID-008",
          companyName: "Kano Construction Ltd",
          bidAmount: "₦8,600,000,000",
          technicalScore: 87,
          financialScore: 84,
          totalScore: 85.5,
          status: "Qualified",
          submissionDate: "2024-02-13",
          experience: "20 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 35,
          completionRate: 95.2,
        },
        {
          id: "BID-009",
          companyName: "Emirate Construction Co",
          bidAmount: "₦8,800,000,000",
          technicalScore: 84,
          financialScore: 81,
          totalScore: 82.5,
          status: "Under Review",
          submissionDate: "2024-02-12",
          experience: "12 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 18,
          completionRate: 93.4,
        },
      ],
      // Ministry of Education tenders
      "MOE-2024-001": [
        {
          id: "BID-010",
          companyName: "EduTech Solutions Ltd",
          bidAmount: "���2,000,000,000",
          technicalScore: 95,
          financialScore: 92,
          totalScore: 93.5,
          status: "Qualified",
          submissionDate: "2024-02-12",
          experience: "12 years",
          certifications: ["ISO 9001", "Educational Technology Certified"],
          previousProjects: 89,
          completionRate: 99.1,
        },
        {
          id: "BID-011",
          companyName: "Kano School Furniture Ltd",
          bidAmount: "₦2,050,000,000",
          technicalScore: 91,
          financialScore: 89,
          totalScore: 90,
          status: "Qualified",
          submissionDate: "2024-02-11",
          experience: "15 years",
          certifications: ["ISO 9001", "Furniture Quality Certified"],
          previousProjects: 156,
          completionRate: 98.7,
        },
        {
          id: "BID-012",
          companyName: "Northern Educational Supplies",
          bidAmount: "₦2,100,000,000",
          technicalScore: 88,
          financialScore: 86,
          totalScore: 87,
          status: "Qualified",
          submissionDate: "2024-02-10",
          experience: "10 years",
          certifications: ["ISO 9001", "Educational Materials Certified"],
          previousProjects: 67,
          completionRate: 97.3,
        },
        {
          id: "BID-013",
          companyName: "Academic Furniture Nigeria",
          bidAmount: "₦2,150,000,000",
          technicalScore: 85,
          financialScore: 84,
          totalScore: 84.5,
          status: "Qualified",
          submissionDate: "2024-02-09",
          experience: "8 years",
          certifications: ["ISO 9001", "School Equipment Certified"],
          previousProjects: 43,
          completionRate: 95.8,
        },
        {
          id: "BID-014",
          companyName: "Learning Resources Ltd",
          bidAmount: "₦2,200,000,000",
          technicalScore: 82,
          financialScore: 81,
          totalScore: 81.5,
          status: "Under Review",
          submissionDate: "2024-02-08",
          experience: "6 years",
          certifications: ["ISO 9001", "Educational Supplies Certified"],
          previousProjects: 29,
          completionRate: 94.2,
        },
      ],
      "MOE-2024-002": [
        {
          id: "BID-015",
          companyName: "EduTech Solutions Ltd",
          bidAmount: "₦1,750,000,000",
          technicalScore: 96,
          financialScore: 93,
          totalScore: 94.5,
          status: "Qualified",
          submissionDate: "2024-02-15",
          experience: "12 years",
          certifications: [
            "Digital Learning Certified",
            "Software Development",
          ],
          previousProjects: 45,
          completionRate: 99.3,
        },
        {
          id: "BID-016",
          companyName: "Digital Education Nigeria",
          bidAmount: "₦1,800,000,000",
          technicalScore: 92,
          financialScore: 90,
          totalScore: 91,
          status: "Qualified",
          submissionDate: "2024-02-14",
          experience: "9 years",
          certifications: ["Educational Technology", "ISO 27001"],
          previousProjects: 32,
          completionRate: 98.1,
        },
        {
          id: "BID-017",
          companyName: "Learning Tech Systems",
          bidAmount: "��1,850,000,000",
          technicalScore: 89,
          financialScore: 87,
          totalScore: 88,
          status: "Qualified",
          submissionDate: "2024-02-13",
          experience: "7 years",
          certifications: ["Educational Software", "ISO 9001"],
          previousProjects: 24,
          completionRate: 96.7,
        },
        {
          id: "BID-018",
          companyName: "Smart School Solutions",
          bidAmount: "₦1,900,000,000",
          technicalScore: 86,
          financialScore: 85,
          totalScore: 85.5,
          status: "Under Review",
          submissionDate: "2024-02-12",
          experience: "5 years",
          certifications: ["Digital Platform Certified", "ISO 9001"],
          previousProjects: 18,
          completionRate: 95.2,
        },
      ],
      // Ministry of Health tenders
      "MOH-2024-001": [
        {
          id: "BID-001",
          companyName: "PrimeCare Medical Ltd",
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
          companyName: "Falcon Diagnostics Ltd",
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
          companyName: "Golden Gates Healthcare",
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
        {
          id: "BID-004",
          companyName: "Royal Medical Solutions",
          bidAmount: "₦890,000,000",
          technicalScore: 82,
          financialScore: 79,
          totalScore: 80.5,
          status: "Qualified",
          submissionDate: "2024-02-07",
          experience: "8 years",
          certifications: ["ISO 9001", "CE Certified"],
          previousProjects: 22,
          completionRate: 92.3,
        },
        {
          id: "BID-005",
          companyName: "Zenith Health Technologies",
          bidAmount: "₦910,000,000",
          technicalScore: 80,
          financialScore: 76,
          totalScore: 78,
          status: "Qualified",
          submissionDate: "2024-02-06",
          experience: "6 years",
          certifications: ["ISO 9001", "WHO Approved"],
          previousProjects: 18,
          completionRate: 89.7,
        },
      ],
      "MOH-2024-002": [
        {
          id: "BID-006",
          companyName: "PharmaCorp Nigeria",
          bidAmount: "₦650,000,000",
          technicalScore: 94,
          financialScore: 90,
          totalScore: 92,
          status: "Qualified",
          submissionDate: "2024-02-12",
          experience: "18 years",
          certifications: ["WHO-GMP", "NAFDAC", "ISO 9001"],
          previousProjects: 67,
          completionRate: 99.2,
        },
        {
          id: "BID-007",
          companyName: "Kano Pharmaceutical Ltd",
          bidAmount: "₦680,000,000",
          technicalScore: 89,
          financialScore: 87,
          totalScore: 88,
          status: "Qualified",
          submissionDate: "2024-02-11",
          experience: "14 years",
          certifications: ["NAFDAC", "ISO 9001"],
          previousProjects: 41,
          completionRate: 97.8,
        },
        {
          id: "BID-008",
          companyName: "West African Pharma",
          bidAmount: "₦720,000,000",
          technicalScore: 86,
          financialScore: 84,
          totalScore: 85,
          status: "Under Review",
          submissionDate: "2024-02-10",
          experience: "11 years",
          certifications: ["NAFDAC", "GMP"],
          previousProjects: 29,
          completionRate: 95.6,
        },
        {
          id: "BID-004",
          companyName: "Apex Medical Equipment Ltd",
          bidAmount: "₦700,000,000",
          technicalScore: 82,
          financialScore: 79,
          totalScore: 80.5,
          status: "Qualified",
          submissionDate: "2024-02-09",
          experience: "8 years",
          certifications: ["NAFDAC", "ISO 9001"],
          previousProjects: 22,
          completionRate: 92.3,
        },
        {
          id: "BID-005",
          companyName: "Unity Health Systems",
          bidAmount: "₦750,000,000",
          technicalScore: 80,
          financialScore: 76,
          totalScore: 78,
          status: "Qualified",
          submissionDate: "2024-02-08",
          experience: "6 years",
          certifications: ["NAFDAC", "WHO Approved"],
          previousProjects: 18,
          completionRate: 89.7,
        },
      ],
      "MOH-2024-003": [
        {
          id: "BID-009",
          companyName: "LabTech Solutions",
          bidAmount: "₦1,200,000,000",
          technicalScore: 96,
          financialScore: 91,
          totalScore: 93.5,
          status: "Qualified",
          submissionDate: "2024-02-14",
          experience: "20 years",
          certifications: ["ISO 15189", "CAP", "CLIA"],
          previousProjects: 78,
          completionRate: 99.5,
        },
        {
          id: "BID-010",
          companyName: "Scientific Equipment Co",
          bidAmount: "₦1,350,000,000",
          technicalScore: 91,
          financialScore: 88,
          totalScore: 89.5,
          status: "Qualified",
          submissionDate: "2024-02-13",
          experience: "16 years",
          certifications: ["ISO 9001", "CE Mark"],
          previousProjects: 52,
          completionRate: 98.1,
        },
        {
          id: "BID-011",
          companyName: "Advanced Diagnostics Ltd",
          bidAmount: "�����1,450,000,000",
          technicalScore: 87,
          financialScore: 85,
          totalScore: 86,
          status: "Qualified",
          submissionDate: "2024-02-12",
          experience: "13 years",
          certifications: ["ISO 13485", "FDA"],
          previousProjects: 35,
          completionRate: 96.7,
        },
        {
          id: "BID-004",
          companyName: "Apex Medical Equipment Ltd",
          bidAmount: "₦1,400,000,000",
          technicalScore: 82,
          financialScore: 79,
          totalScore: 80.5,
          status: "Qualified",
          submissionDate: "2024-02-11",
          experience: "8 years",
          certifications: ["ISO 9001", "CE Mark"],
          previousProjects: 22,
          completionRate: 92.3,
        },
        {
          id: "BID-005",
          companyName: "Unity Health Systems",
          bidAmount: "₦1,500,000,000",
          technicalScore: 80,
          financialScore: 76,
          totalScore: 78,
          status: "Qualified",
          submissionDate: "2024-02-10",
          experience: "6 years",
          certifications: ["ISO 9001", "WHO Approved"],
          previousProjects: 18,
          completionRate: 89.7,
        },
      ],
    };

    const newBidders =
      bidderDataByWorkspace[
        selectedWorkspace as keyof typeof bidderDataByWorkspace
      ] || [];
    setBidders(newBidders);
  }, [selectedWorkspace]);

  // Function to get workspace-specific bidder data
  const getWorkspaceBidderData = () => {
    return {
      // Ministry of Works Infrastructure tenders
      "MOWI-2024-001": [
        {
          id: "BID-001",
          companyName: "Kano Construction Ltd",
          bidAmount: "₦14,800,000,000",
          technicalScore: 90,
          financialScore: 87,
          totalScore: 88.5,
          status: "Qualified",
          submissionDate: "2024-02-10",
          experience: "20 years",
          certifications: ["ISO 9001", "COREN Certified", "NIQS Registered"],
          previousProjects: 62,
          completionRate: 97.8,
        },
        {
          id: "BID-002",
          companyName: "Sahel Bridge Builders",
          bidAmount: "₦15,100,000,000",
          technicalScore: 88,
          financialScore: 85,
          totalScore: 86.5,
          status: "Qualified",
          submissionDate: "2024-02-09",
          experience: "18 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 45,
          completionRate: 96.2,
        },
        {
          id: "BID-003",
          companyName: "Northern Roads Nigeria",
          bidAmount: "₦15,400,000,000",
          technicalScore: 85,
          financialScore: 83,
          totalScore: 84,
          status: "Qualified",
          submissionDate: "2024-02-08",
          experience: "15 years",
          certifications: ["ISO 9001", "NBRRI Certified"],
          previousProjects: 38,
          completionRate: 95.5,
        },
        {
          id: "BID-004",
          companyName: "Emirate Construction Co",
          bidAmount: "₦15,600,000,000",
          technicalScore: 82,
          financialScore: 80,
          totalScore: 81,
          status: "Qualified",
          submissionDate: "2024-02-07",
          experience: "12 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 29,
          completionRate: 94.1,
        },
        {
          id: "BID-005",
          companyName: "Federal Infrastructure Ltd",
          bidAmount: "₦15,800,000,000",
          technicalScore: 80,
          financialScore: 78,
          totalScore: 79,
          status: "Qualified",
          submissionDate: "2024-02-06",
          experience: "10 years",
          certifications: ["ISO 9001", "NIQS Registered"],
          previousProjects: 22,
          completionRate: 92.7,
        },
      ],
      "MOWI-2024-002": [
        {
          id: "BID-006",
          companyName: "Sahel Bridge Builders",
          bidAmount: "₦8,200,000,000",
          technicalScore: 93,
          financialScore: 89,
          totalScore: 91,
          status: "Qualified",
          submissionDate: "2024-02-15",
          experience: "18 years",
          certifications: ["Bridge Construction Certified", "COREN Certified"],
          previousProjects: 28,
          completionRate: 98.1,
        },
        {
          id: "BID-007",
          companyName: "Northern Roads Nigeria",
          bidAmount: "₦8,400,000,000",
          technicalScore: 90,
          financialScore: 86,
          totalScore: 88,
          status: "Qualified",
          submissionDate: "2024-02-14",
          experience: "15 years",
          certifications: ["ISO 9001", "Bridge Engineering Certified"],
          previousProjects: 22,
          completionRate: 96.8,
        },
        {
          id: "BID-008",
          companyName: "Kano Construction Ltd",
          bidAmount: "₦8,600,000,000",
          technicalScore: 87,
          financialScore: 84,
          totalScore: 85.5,
          status: "Qualified",
          submissionDate: "2024-02-13",
          experience: "20 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 35,
          completionRate: 95.2,
        },
        {
          id: "BID-009",
          companyName: "Emirate Construction Co",
          bidAmount: "₦8,800,000,000",
          technicalScore: 84,
          financialScore: 81,
          totalScore: 82.5,
          status: "Under Review",
          submissionDate: "2024-02-12",
          experience: "12 years",
          certifications: ["ISO 9001", "COREN Certified"],
          previousProjects: 18,
          completionRate: 93.4,
        },
      ],
      // Ministry of Education tenders
      "MOE-2024-001": [
        {
          id: "BID-010",
          companyName: "EduTech Solutions Ltd",
          bidAmount: "₦2,000,000,000",
          technicalScore: 95,
          financialScore: 92,
          totalScore: 93.5,
          status: "Qualified",
          submissionDate: "2024-02-12",
          experience: "12 years",
          certifications: ["ISO 9001", "Educational Technology Certified"],
          previousProjects: 89,
          completionRate: 99.1,
        },
        {
          id: "BID-011",
          companyName: "Kano School Furniture Ltd",
          bidAmount: "��2,050,000,000",
          technicalScore: 91,
          financialScore: 89,
          totalScore: 90,
          status: "Qualified",
          submissionDate: "2024-02-11",
          experience: "15 years",
          certifications: ["ISO 9001", "Furniture Quality Certified"],
          previousProjects: 156,
          completionRate: 98.7,
        },
        {
          id: "BID-012",
          companyName: "Northern Educational Supplies",
          bidAmount: "��2,100,000,000",
          technicalScore: 88,
          financialScore: 86,
          totalScore: 87,
          status: "Qualified",
          submissionDate: "2024-02-10",
          experience: "10 years",
          certifications: ["ISO 9001", "Educational Materials Certified"],
          previousProjects: 67,
          completionRate: 97.3,
        },
        {
          id: "BID-013",
          companyName: "Academic Furniture Nigeria",
          bidAmount: "₦2,150,000,000",
          technicalScore: 85,
          financialScore: 84,
          totalScore: 84.5,
          status: "Qualified",
          submissionDate: "2024-02-09",
          experience: "8 years",
          certifications: ["ISO 9001", "School Equipment Certified"],
          previousProjects: 43,
          completionRate: 95.8,
        },
        {
          id: "BID-014",
          companyName: "Learning Resources Ltd",
          bidAmount: "₦2,200,000,000",
          technicalScore: 82,
          financialScore: 81,
          totalScore: 81.5,
          status: "Under Review",
          submissionDate: "2024-02-08",
          experience: "6 years",
          certifications: ["ISO 9001", "Educational Supplies Certified"],
          previousProjects: 29,
          completionRate: 94.2,
        },
      ],
      // Ministry of Health (default) bidders
      "MOH-2024-001": [
        {
          id: "BID-001",
          companyName: "PrimeCare Medical Ltd",
          bidAmount: "��820,000,000",
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
          companyName: "Falcon Diagnostics Ltd",
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
          companyName: "Golden Gates Healthcare",
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
        {
          id: "BID-004",
          companyName: "Royal Medical Solutions",
          bidAmount: "₦890,000,000",
          technicalScore: 82,
          financialScore: 79,
          totalScore: 80.5,
          status: "Qualified",
          submissionDate: "2024-02-07",
          experience: "8 years",
          certifications: ["ISO 9001", "CE Certified"],
          previousProjects: 22,
          completionRate: 92.3,
        },
        {
          id: "BID-005",
          companyName: "Zenith Health Technologies",
          bidAmount: "₦910,000,000",
          technicalScore: 80,
          financialScore: 76,
          totalScore: 78,
          status: "Qualified",
          submissionDate: "2024-02-06",
          experience: "6 years",
          certifications: ["ISO 9001", "WHO Approved"],
          previousProjects: 18,
          completionRate: 89.7,
        },
      ],
      // Renovation Aminu Kano Teaching Hospital
      "MOH-1754780571822": [
        {
          id: "BID-HC-001",
          companyName: "HealthCare Builders Nigeria",
          bidAmount: "₦180,000,000",
          technicalScore: 92,
          financialScore: 88,
          totalScore: 90,
          status: "Qualified",
          submissionDate: "2025-01-15",
          experience: "15 years",
          certifications: [
            "ISO 9001",
            "Healthcare Facility Certification",
            "COREN Certified",
          ],
          previousProjects: 35,
          completionRate: 98.2,
        },
        {
          id: "BID-HC-002",
          companyName: "Northern Medical Construction",
          bidAmount: "₦190,000,000",
          technicalScore: 89,
          financialScore: 85,
          totalScore: 87,
          status: "Qualified",
          submissionDate: "2025-01-14",
          experience: "12 years",
          certifications: ["ISO 9001", "Medical Equipment Installation"],
          previousProjects: 28,
          completionRate: 96.8,
        },
        {
          id: "BID-HC-003",
          companyName: "Kano Hospital Renovators",
          bidAmount: "₦195,000,000",
          technicalScore: 85,
          financialScore: 83,
          totalScore: 84,
          status: "Qualified",
          submissionDate: "2025-01-13",
          experience: "10 years",
          certifications: ["ISO 9001", "Hospital Renovation Specialist"],
          previousProjects: 22,
          completionRate: 94.5,
        },
        {
          id: "BID-HC-004",
          companyName: "Advanced Medical Facilities Ltd",
          bidAmount: "₦210,000,000",
          technicalScore: 80,
          financialScore: 78,
          totalScore: 79,
          status: "Under Review",
          submissionDate: "2025-01-12",
          experience: "8 years",
          certifications: ["ISO 9001", "Medical Construction"],
          previousProjects: 15,
          completionRate: 92.1,
        },
      ],
    };
  };

  // Set up periodic refresh of bid counts
  useEffect(() => {
    const bidCountInterval = setInterval(() => {
      refreshAllTenderBidCounts();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(bidCountInterval);
  }, []);

  // Refresh bid counts when tender sub-view changes
  useEffect(() => {
    if (tenderSubView === "list") {
      refreshAllTenderBidCounts();
    }
  }, [tenderSubView]);

  const handleLogout = () => {
    const { ministry } = getMinistryMockData();

    // Log ministry logout
    logUserAction(
      "MinistryUser",
      "ministry_user",
      "MINISTRY_LOGOUT",
      "Ministry Portal",
      `Ministry user from ${ministry.name} logged out of the system`,
      "LOW",
      undefined,
      {
        logoutTime: new Date().toISOString(),
        ministryName: ministry.name,
        ministryCode: ministry.code,
        sessionDuration: "N/A",
      },
    );

    localStorage.removeItem("ministryUser");
    navigate("/");
  };

  // User Management Functions
  const handleCreateUser = () => {
    setUserFormMode("create");
    setSelectedUser(null);
    setShowCreateUserModal(true);
  };

  const handleEditUser = (user: MDAUser) => {
    setUserFormMode("edit");
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = (user: MDAUser) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${user.role} from ${user.department}?`,
      )
    ) {
      const updatedUsers = mdaUsers.filter((u) => u.id !== user.id);
      setMDAUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);

      const ministryInfo = getMinistryInfo();

      // Log the user deletion
      logUserAction(
        "MinistryAdmin",
        "ministry_admin",
        "MDA_USER_DELETED",
        user.role,
        `Deleted user ${user.role} from department ${user.department}`,
        "HIGH",
        user.id,
        {
          mdaId: user.mdaId,
          ministryName: ministryInfo.name,
          deletedUserRole: user.role,
          department: user.department,
        },
      );

      alert("User removed successfully!");
    }
  };

  // Get current ministry's MDA ID
  const getCurrentMDAId = (): string => {
    const { ministryId } = getMinistryMockData();
    return ministryId; // This is the MDA ID for this ministry
  };

  // Load users for the current MDA
  const loadMDAUsers = () => {
    const mdaId = getCurrentMDAId();
    const allUsers = JSON.parse(localStorage.getItem("mda_users") || "[]");
    const mdaUsers = allUsers.filter((user: MDAUser) => user.mdaId === mdaId);
    setMDAUsers(mdaUsers);
    console.log(`📋 Loaded ${mdaUsers.length} users for MDA: ${mdaId}`);
  };

  // Save users to localStorage
  const saveUsersToStorage = (users: MDAUser[]) => {
    const allUsers = JSON.parse(localStorage.getItem("mda_users") || "[]");
    const mdaId = getCurrentMDAId();

    // Remove users for this MDA and add the updated ones
    const otherMDAUsers = allUsers.filter(
      (user: MDAUser) => user.mdaId !== mdaId,
    );
    const updatedAllUsers = [...otherMDAUsers, ...users];

    localStorage.setItem("mda_users", JSON.stringify(updatedAllUsers));
  };

  const handleUserSubmit = async (data: CreateMDAUserRequest) => {
    try {
      const mdaId = getCurrentMDAId();
      const ministryInfo = getMinistryInfo();
      const currentAdmin = localStorage.getItem("ministryUser");
      let assignedBy = "admin-001";

      if (currentAdmin) {
        try {
          const adminData = JSON.parse(currentAdmin);
          assignedBy = adminData.email || adminData.id || "admin-001";
        } catch (e) {
          console.warn("Could not parse ministry user data");
        }
      }

      if (userFormMode === "create") {
        const newUser: MDAUser = {
          id: `user-${Date.now()}`,
          mdaId: mdaId,
          userId: `usr-${Date.now()}`,
          email: data.email, // Store email for login credentials
          displayName: data.displayName, // Store display name
          role: data.role,
          department: data.department,
          permissions: data.permissions,
          assignedBy: assignedBy,
          assignedAt: new Date(),
          isActive: true,
        };

        const updatedUsers = [...mdaUsers, newUser];
        setMDAUsers(updatedUsers);
        saveUsersToStorage(updatedUsers);

        // Log the user creation
        logUserAction(
          "MinistryAdmin",
          "ministry_admin",
          "MDA_USER_CREATED",
          newUser.role,
          `Created user ${data.displayName} (${data.email}) with role ${data.role} in department ${data.department}`,
          "MEDIUM",
          newUser.id,
          {
            mdaId: mdaId,
            ministryName: ministryInfo.name,
            userRole: data.role,
            department: data.department,
            permissions: data.permissions,
          },
        );

        alert(
          `User "${data.displayName}" created successfully for ${ministryInfo.name}!`,
        );
      } else if (selectedUser) {
        const updatedUser: MDAUser = {
          ...selectedUser,
          role: data.role,
          department: data.department,
          permissions: data.permissions,
        };

        const updatedUsers = mdaUsers.map((u) =>
          u.id === selectedUser.id ? updatedUser : u,
        );
        setMDAUsers(updatedUsers);
        saveUsersToStorage(updatedUsers);

        // Log the user update
        logUserAction(
          "MinistryAdmin",
          "ministry_admin",
          "MDA_USER_UPDATED",
          updatedUser.role,
          `Updated user ${data.displayName} (${data.email}) role to ${data.role} in department ${data.department}`,
          "MEDIUM",
          updatedUser.id,
          {
            mdaId: mdaId,
            ministryName: ministryInfo.name,
            previousRole: selectedUser.role,
            newRole: data.role,
            permissions: data.permissions,
          },
        );

        alert(`User "${data.displayName}" updated successfully!`);
      }
      setShowCreateUserModal(false);
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error submitting user:", error);
      alert("Error saving user. Please try again.");
    }
  };

  const toggleUserStatus = (user: MDAUser) => {
    const updatedUsers = mdaUsers.map((u) =>
      u.id === user.id ? { ...u, isActive: !u.isActive } : u,
    );
    setMDAUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);

    const ministryInfo = getMinistryInfo();
    const newStatus = !user.isActive;

    // Log the status change
    logUserAction(
      "MinistryAdmin",
      "ministry_admin",
      newStatus ? "MDA_USER_ACTIVATED" : "MDA_USER_DEACTIVATED",
      user.role,
      `${newStatus ? "Activated" : "Deactivated"} user ${user.role} in department ${user.department}`,
      "LOW",
      user.id,
      {
        mdaId: user.mdaId,
        ministryName: ministryInfo.name,
        userRole: user.role,
        department: user.department,
        newStatus: newStatus,
      },
    );

    alert(`User has been ${user.isActive ? "deactivated" : "activated"}!`);
  };

  // Tender Creation Functions
  const handleSubmitTender = (isDraft = false) => {
    if (
      !newTender.title ||
      !newTender.category ||
      !newTender.description ||
      !newTender.estimatedValue ||
      !newTender.closeDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const { ministry } = getMinistryMockData();
    const tenderId = `${ministry.code}-${Date.now()}`;

    const tender: Tender = {
      id: tenderId,
      title: newTender.title,
      description: newTender.description,
      category: newTender.category,
      estimatedValue: formatCurrency(newTender.estimatedValue),
      status: isDraft ? "Draft" : "Published",
      publishDate:
        newTender.publishDate || new Date().toISOString().split("T")[0],
      closeDate: newTender.closeDate,
      bidsReceived: getBidCountForTender(tenderId),
      ministry: ministry.name,
      procuringEntity: ministry.name,
    };

    // Add to local tenders
    setTenders((prev) => {
      const updatedTenders = [tender, ...prev];
      // Save to localStorage for ministry dashboard persistence
      localStorage.setItem("ministryTenders", JSON.stringify(updatedTenders));
      return updatedTenders;
    });

    // Store in localStorage for cross-page access
    const existingTenders = localStorage.getItem("featuredTenders") || "[]";
    const tendersList = JSON.parse(existingTenders);
    const featuredTender = {
      id: tender.id,
      title: tender.title,
      description: tender.description,
      value: tender.estimatedValue, // Already formatted above
      deadline: new Date(tender.closeDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: tender.status === "Published" ? "Open" : "Draft",
      statusColor:
        tender.status === "Published"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800",
      category: tender.category,
      ministry: ministry.name,
      createdAt: Date.now(),
    };

    tendersList.unshift(featuredTender);
    // Keep only the last 5 tenders
    const latestTenders = tendersList.slice(0, 5);
    localStorage.setItem("featuredTenders", JSON.stringify(latestTenders));

    // Also store in recentTenders with more detailed information
    const existingRecentTenders = localStorage.getItem("recentTenders") || "[]";
    const recentTendersList = JSON.parse(existingRecentTenders);
    const recentTender = {
      id: tender.id,
      title: tender.title,
      category: tender.category,
      value: tender.estimatedValue, // Already formatted above
      deadline: tender.closeDate,
      location: "Kano State",
      views: 0,
      status: tender.status === "Published" ? "Open" : "Draft",
      description: tender.description,
      publishDate: tender.publishDate || new Date().toISOString().split("T")[0],
      closingDate: tender.closeDate,
      tenderFee: formatCurrency(25000),
      procuringEntity: ministry.name,
      duration: "12 months",
      eligibility: "Qualified contractors with relevant experience",
      requirements: [
        "Valid CAC certificate",
        "Tax clearance for last 3 years",
        "Professional license",
        "Evidence of similar projects",
        "Financial capacity documentation",
      ],
      technicalSpecs: [
        "Project specifications as detailed in tender document",
        "Quality standards must meet government requirements",
        "Timeline adherence is mandatory",
      ],
      createdAt: Date.now(),
    };

    recentTendersList.unshift(recentTender);
    // Keep only the last 10 recent tenders
    const latestRecentTenders = recentTendersList.slice(0, 10);
    localStorage.setItem("recentTenders", JSON.stringify(latestRecentTenders));

    // Reset form
    setNewTender({
      title: "",
      category: "",
      description: "",
      estimatedValue: "",
      procurementMethod: "Open Tender",
      publishDate: "",
      closeDate: "",
      contactEmail: "",
    });

    setTenderSubView("list");
    alert(`Tender ${isDraft ? "saved as draft" : "published"} successfully!`);
  };

  // Helper functions for evaluation scoring
  const updateEvaluationScore = (
    bidderId: string,
    category: string,
    criterion: string,
    score: number,
  ) => {
    setEvaluationScores((prev) => ({
      ...prev,
      [bidderId]: {
        ...prev[bidderId],
        [category]: {
          ...prev[bidderId]?.[category],
          [criterion]: score,
        },
      },
    }));
  };

  const getEvaluationScore = (
    bidderId: string,
    category: string,
    criterion: string,
    defaultScore: number,
  ) => {
    return evaluationScores[bidderId]?.[category]?.[criterion] ?? defaultScore;
  };

  const calculateCategoryScore = (
    bidderId: string,
    category: string,
    criteria: string[],
    defaultScores: number[],
  ) => {
    const scores = criteria.map((criterion, index) =>
      getEvaluationScore(bidderId, category, criterion, defaultScores[index]),
    );
    const total = scores.reduce((sum, score) => sum + score, 0);
    return Math.round((total / (criteria.length * 20)) * 100);
  };

  const saveEvaluationScores = () => {
    // Here you would typically save to backend
    console.log("Saving evaluation scores:", evaluationScores);
    setIsEditingEvaluation(false);
    // Update bidders with new scores
    setBidders((prev) =>
      prev.map((bidder) => {
        const financialCriteria = [
          "bidPriceAnalysis",
          "bidSecurity",
          "financialCapability",
          "valueForMoney",
          "costBreakdown",
        ];
        const technicalCriteria = [
          "experienceExpertise",
          "technicalApproach",
          "qualityStandards",
          "certifications",
          "previousContracts",
        ];

        const financialScore = calculateCategoryScore(
          bidder.id,
          "financial",
          financialCriteria,
          [18, 19, 17, 16, 17],
        );
        const technicalScore = calculateCategoryScore(
          bidder.id,
          "technical",
          technicalCriteria,
          [16, 18, 17, 19, 15],
        );
        const totalScore = Math.round(
          financialScore * 0.4 + technicalScore * 0.35 + 25,
        ); // 25% for compliance

        return {
          ...bidder,
          financialScore,
          technicalScore,
          totalScore,
        };
      }),
    );
  };

  const handleAwardTender = () => {
    if (!selectedTenderForAward || !awardFormData.selectedBidder) {
      alert("Please select a bidder to award the tender.");
      return;
    }

    if (!isVendorEligibleForAward(awardFormData.selectedBidder)) {
      alert(
        "Selected bidder is not eligible for award. NOC must be issued and all workflow steps must be completed.",
      );
      return;
    }

    const selectedBidder = bidders.find(
      (b) => b.id === awardFormData.selectedBidder,
    );
    if (!selectedBidder) {
      alert("Selected bidder not found.");
      return;
    }

    // Update tender status to Awarded
    const updatedTender = {
      ...selectedTenderForAward,
      status: "Awarded" as any,
      awardedCompany: selectedBidder.companyName,
      awardAmount: awardFormData.awardValue,
      awardDate: new Date().toISOString().split("T")[0],
      awardJustification: awardFormData.awardJustification,
    };

    setTenders((prev) => {
      const updatedTenders = prev.map((tender) =>
        tender.id === selectedTenderForAward.id ? updatedTender : tender,
      );
      // Save to localStorage
      localStorage.setItem("ministryTenders", JSON.stringify(updatedTenders));
      return updatedTenders;
    });

    // Store awarded tender data for post-award workflow
    setAwardedTenderData({
      tender: updatedTender,
      selectedBidder,
      unsuccessfulBidders: bidders.filter((b) => b.id !== selectedBidder.id),
      awardDetails: awardFormData,
    });

    // Log tender award action
    const { ministry } = getMinistryMockData();
    logUserAction(
      "MinistryUser",
      "ministry_user",
      "TENDER_AWARDED_BY_MINISTRY",
      selectedTenderForAward.title,
      `Ministry ${ministry.name} awarded tender "${selectedTenderForAward.title}" to ${selectedBidder.companyName}`,
      "CRITICAL",
      selectedTenderForAward.id,
      {
        tenderId: selectedTenderForAward.id,
        tenderTitle: selectedTenderForAward.title,
        awardedCompany: selectedBidder.companyName,
        awardValue: awardFormData.awardValue,
        awardJustification: awardFormData.awardJustification,
        contractDuration: awardFormData.contractDuration,
        performanceBond: awardFormData.performanceBond,
        ministryName: ministry.name,
        ministryCode: ministry.code,
        bidderId: selectedBidder.id,
        bidderScore: selectedBidder.totalScore,
        awardTimestamp: new Date().toISOString(),
      },
    );

    // Close award modal and show post-award workflow
    setShowAwardModal(false);
    setSelectedTenderForAward(null);
    setShowPostAwardWorkflow(true);

    // Reset form
    setAwardFormData({
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
  };

  // Committee management functions
  const handleCreateCommittee = () => {
    if (!committeeFormData.name || !committeeFormData.chairperson) {
      alert("Please fill in committee name and chairperson.");
      return;
    }

    const newCommittee = {
      id: `EC-${Date.now()}`,
      name: committeeFormData.name,
      chairperson: committeeFormData.chairperson,
      secretary: committeeFormData.secretary,
      specialization: committeeFormData.specialization,
      members: committeeFormData.members.filter((m) => m.name.trim() !== ""),
      createdDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setActiveCommittee(newCommittee);
    setShowCreateCommitteeModal(false);
    setCommitteeFormData({
      name: "",
      chairperson: "",
      secretary: "",
      specialization: "",
      members: [{ name: "", department: "", role: "Member", email: "" }],
    });

    alert("Evaluation committee created successfully!");
  };

  const addCommitteeMember = () => {
    setCommitteeFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { name: "", department: "", role: "Member", email: "" },
      ],
    }));
  };

  const updateCommitteeMember = (
    index: number,
    field: string,
    value: string,
  ) => {
    setCommitteeFormData((prev) => ({
      ...prev,
      members: prev.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member,
      ),
    }));
  };

  const removeCommitteeMember = (index: number) => {
    if (committeeFormData.members.length > 1) {
      setCommitteeFormData((prev) => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index),
      }));
    }
  };

  const handleFinalizeEvaluation = () => {
    if (!activeCommittee) {
      alert(
        "Please create an evaluation committee before finalizing the evaluation.",
      );
      return;
    }

    // Check if all eligible bidders have been evaluated
    const eligibleBidders = bidders.filter((bidder) =>
      isVendorEligibleForAward(bidder.id),
    );
    if (eligibleBidders.length === 0) {
      alert(
        "No eligible bidders found. Ensure NOC is issued for at least one bidder.",
      );
      return;
    }

    setIsEvaluationFinalized(true);
    setShowFinalizeEvaluationModal(false);

    // Update tender status to 'Evaluated'
    setTenders((prev) => {
      const updatedTenders = prev.map((tender) =>
        tender.id === selectedWorkspace
          ? { ...tender, status: "Evaluated" as any }
          : tender,
      );
      // Save to localStorage
      localStorage.setItem("ministryTenders", JSON.stringify(updatedTenders));
      return updatedTenders;
    });

    alert("Evaluation finalized successfully! Tender is now ready for award.");
  };

  // Post-award workflow functions
  const handleNotifySuccessfulVendor = () => {
    if (!awardedTenderData) return;

    // Simulate notification to successful vendor
    const notification = {
      id: `NOTIF-${Date.now()}`,
      type: "success",
      recipientId: awardedTenderData.selectedBidder.id,
      recipientName: awardedTenderData.selectedBidder.companyName,
      subject: `Congratulations! Contract Awarded - ${awardedTenderData.tender.title}`,
      message: `We are pleased to inform you that your company has been selected for the contract "${awardedTenderData.tender.title}".

Next Steps:
1. Contract signing scheduled within 7 days
2. Performance bond submission required
3. Project onboarding meeting will be scheduled
4. Compliance documentation review

Award Details:
- Contract Value: ${awardedTenderData.awardDetails.awardValue}
- Project Duration: ${awardedTenderData.awardDetails.contractDuration} months
- Performance Bond: ${awardedTenderData.awardDetails.performanceBond}%

Please contact our procurement office for further details.`,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setPostAwardSteps((prev) => ({ ...prev, notifySuccessful: true }));
    alert(
      `Success notification sent to ${awardedTenderData.selectedBidder.companyName}`,
    );
  };

  const handleNotifyUnsuccessfulVendors = () => {
    if (!awardedTenderData) return;

    // Simulate notifications to unsuccessful vendors
    awardedTenderData.unsuccessfulBidders.forEach((bidder: any) => {
      const notification = {
        id: `NOTIF-${Date.now()}-${bidder.id}`,
        type: "rejection",
        recipientId: bidder.id,
        recipientName: bidder.companyName,
        subject: `Tender Result - ${awardedTenderData.tender.title}`,
        message: `Thank you for your participation in the tender "${awardedTenderData.tender.title}".

After careful evaluation by our committee, we regret to inform you that your proposal was not selected for this project.

Feedback Summary:
- Technical Score: ${bidder.technicalScore}%
- Financial Score: ${bidder.financialScore}%
- Overall Score: ${bidder.totalScore}%

We encourage you to participate in future tender opportunities. Your proposal showed merit and we appreciate your interest in working with the Kano State Government.

For detailed feedback, please contact our procurement office.`,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
    });

    setPostAwardSteps((prev) => ({ ...prev, notifyUnsuccessful: true }));
    alert(
      `Rejection notifications sent to ${awardedTenderData.unsuccessfulBidders.length} unsuccessful vendors`,
    );
  };

  const handlePublishOCDS = () => {
    if (!awardedTenderData) return;

    // Simulate OCDS publication
    const ocdsData = {
      version: "1.1",
      publishedDate: new Date().toISOString(),
      publisher: {
        name: "Kano State Government",
        scheme: "NG-STATE",
        uid: "NG-KN",
        uri: "https://kanostate.gov.ng",
      },
      releases: [
        {
          ocid: `ocds-kn-${awardedTenderData.tender.id}`,
          id: `${awardedTenderData.tender.id}-award-${Date.now()}`,
          date: new Date().toISOString(),
          tag: ["award"],
          initiationType: "tender",
          parties: [
            {
              name: "Kano State Ministry of Health",
              id: "MOH-KN",
              roles: ["buyer"],
            },
            {
              name: awardedTenderData.selectedBidder.companyName,
              id: awardedTenderData.selectedBidder.id,
              roles: ["supplier"],
            },
          ],
          tender: {
            id: awardedTenderData.tender.id,
            title: awardedTenderData.tender.title,
            description: awardedTenderData.tender.description,
            status: "complete",
            value: {
              amount: parseFloat(
                awardedTenderData.awardDetails.awardValue.replace(/[₦,]/g, ""),
              ),
              currency: "NGN",
            },
          },
          awards: [
            {
              id: `award-${awardedTenderData.tender.id}`,
              title: `Award for ${awardedTenderData.tender.title}`,
              description: awardedTenderData.awardDetails.awardJustification,
              status: "active",
              date: awardedTenderData.tender.awardDate,
              value: {
                amount: parseFloat(
                  awardedTenderData.awardDetails.awardValue.replace(
                    /[��,]/g,
                    "",
                  ),
                ),
                currency: "NGN",
              },
              suppliers: [
                {
                  name: awardedTenderData.selectedBidder.companyName,
                  id: awardedTenderData.selectedBidder.id,
                },
              ],
            },
          ],
        },
      ],
    };

    setPostAwardSteps((prev) => ({ ...prev, publishOCDS: true }));
    alert("Award published successfully on OCDS transparency portal");
  };

  const handleCreateContract = () => {
    if (!awardedTenderData) return;

    // Create contract entry
    const newContract = {
      id: `CON-${awardedTenderData.tender.id}`,
      tenderId: awardedTenderData.tender.id,
      contractorName: awardedTenderData.selectedBidder.companyName,
      projectTitle: awardedTenderData.tender.title,
      contractValue: awardedTenderData.awardDetails.awardValue,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(
        Date.now() +
          parseInt(awardedTenderData.awardDetails.contractDuration || "12") *
            30 *
            24 *
            60 *
            60 *
            1000,
      )
        .toISOString()
        .split("T")[0],
      status: "Active",
      performanceBond: awardedTenderData.awardDetails.performanceBond,
      warrantyPeriod: awardedTenderData.awardDetails.warrantyPeriod,
      deliverySchedule: awardedTenderData.awardDetails.deliverySchedule,
      specialConditions: awardedTenderData.awardDetails.specialConditions,
      createdDate: new Date().toISOString().split("T")[0],
      milestones: [],
      payments: [],
      disputes: [],
    };

    // Add to contracts (you would typically update the contracts state here)
    setPostAwardSteps((prev) => ({ ...prev, createContract: true }));
    alert("Contract created successfully in contract management system");
  };

  const completePostAwardWorkflow = () => {
    setShowPostAwardWorkflow(false);
    setAwardedTenderData(null);
    setPostAwardSteps({
      notifySuccessful: false,
      notifyUnsuccessful: false,
      publishOCDS: false,
      createContract: false,
    });
    alert("Post-award workflow completed successfully!");
  };

  // Contract creation from awarded tender
  const handleSelectAwardedTender = (tender: any) => {
    setSelectedAwardedTender(tender);

    // Auto-fill contract form with tender data
    setContractFormData({
      projectTitle: tender.title,
      contractorName: tender.awardedCompany || "",
      contractValue: tender.awardAmount || tender.estimatedValue,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 12 months from now
      description: tender.description || "",
      deliverables: ["Project deliverable 1", "Project deliverable 2"],
      milestones: [
        {
          id: 1,
          title: "Project Initiation",
          description: "Project setup and planning phase",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          percentage: 25,
          status: "pending",
        },
        {
          id: 2,
          title: "Implementation Phase",
          description: "Main project implementation",
          dueDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          percentage: 50,
          status: "pending",
        },
        {
          id: 3,
          title: "Testing & Quality Assurance",
          description: "Testing and quality verification",
          dueDate: new Date(Date.now() + 9 * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          percentage: 15,
          status: "pending",
        },
        {
          id: 4,
          title: "Project Completion",
          description: "Final delivery and handover",
          dueDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          percentage: 10,
          status: "pending",
        },
      ],
      terms: `Standard terms and conditions as per Kano State procurement regulations.

Performance Bond: 10% of contract value
Warranty Period: 12 months
Payment Terms: Monthly progress payments based on milestone completion
Penalty Clause: 0.5% per week for delayed completion`,
      digitalSignature: true,
      blockchainVerification: false,
      autoExecution: false,
    });

    // Close selection modal and open contract modal
    setShowTenderSelectionModal(false);
    setShowContractModal(true);
  };

  // Award letter generation functions
  const generateAwardLetter = (tender: any) => {
    // Find the awarded bidder for this tender
    const awardedBidder = bidders.find(
      (b) => b.companyName === tender.awardedCompany,
    );

    if (!awardedBidder) {
      alert("No awarded bidder found for this tender.");
      return;
    }

    // Generate award letter data
    const letterData = {
      awardDate: new Date().toLocaleDateString("en-GB"),
      tenderRef: tender.id,
      vendorName: tender.awardedCompany,
      vendorAddress: `${awardedBidder.companyName}\n[Company Address]\nKano State, Nigeria`,
      tenderTitle: tender.title,
      contractValue: tender.awardAmount || tender.estimatedValue,
      contractValueWords: convertNumberToWords(
        parseFloat(
          (tender.awardAmount || tender.estimatedValue).replace(/[₦,]/g, ""),
        ),
      ),
      contractDuration: "12", // Default or from award details
      performanceBond: "10",
      performanceBondDue: "14",
      advancePayment: "20",
      warrantyPeriod: "12",
      deliveryScheduleSummary:
        "As per contract specifications and project timeline",
      acceptanceDays: "7",
      refNumber: `MOH/KP/E-Proc/${tender.id}`,
      ministerName: "Hon. Dr. Aminu Ibrahim Tsanyawa",
      ministerTitle: `Hon. Commissioner\n${ministryInfo.name}\nKano State Government`,
    };

    setAwardLetterData(letterData);
    setSelectedTenderForLetter(tender);
    setShowAwardLetterModal(true);
  };

  const convertNumberToWords = (num: number): string => {
    // Simple number to words conversion for Nigerian Naira
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (n: number): string => {
      let result = "";
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + " ";
        return result;
      }
      if (n > 0) {
        result += ones[n] + " ";
      }
      return result;
    };

    if (num === 0) return "Zero Naira Only";

    let result = "";
    if (num >= 1000000000) {
      result += convertHundreds(Math.floor(num / 1000000000)) + "Billion ";
      num %= 1000000000;
    }
    if (num >= 1000000) {
      result += convertHundreds(Math.floor(num / 1000000)) + "Million ";
      num %= 1000000;
    }
    if (num >= 1000) {
      result += convertHundreds(Math.floor(num / 1000)) + "Thousand ";
      num %= 1000;
    }
    if (num > 0) {
      result += convertHundreds(num);
    }

    return result.trim() + " Naira Only";
  };

  const downloadAwardLetterPDF = () => {
    if (!awardLetterData) return;

    // Create HTML content for the award letter
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Award Letter - ${awardLetterData.tenderRef}</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
            color: #000;
            background: white;
          }
          .letterhead {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #15803d;
            padding-bottom: 20px;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 10px;
            background: url('https://cdn.builder.io/api/v1/image/assets%2Fb1307220e8f44b74a0fd54f108089b3e%2F3954c90e53b64c33bfbc92f500570bbb?format=webp&width=800') center/contain no-repeat;
          }
          .ministry-name {
            font-size: 18px;
            font-weight: bold;
            color: #15803d;
            margin-bottom: 5px;
          }
          .ministry-details {
            font-size: 12px;
            color: #666;
          }
          .date-ref {
            text-align: right;
            margin: 20px 0;
            font-size: 14px;
          }
          .recipient {
            margin: 20px 0;
            font-size: 14px;
          }
          .subject {
            font-weight: bold;
            text-decoration: underline;
            margin: 20px 0;
            font-size: 14px;
          }
          .content {
            font-size: 14px;
            text-align: justify;
            margin: 20px 0;
          }
          .contract-details {
            margin: 20px 0;
            font-size: 14px;
          }
          .requirements {
            margin: 20px 0;
            font-size: 14px;
          }
          .signature {
            margin-top: 40px;
            font-size: 14px;
          }
          .cc {
            margin-top: 30px;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="logo"></div>
          <div class="ministry-name">KANO STATE GOVERNMENT<br>${ministryInfo.name.toUpperCase()}</div>
          <div class="ministry-details">
            No [MinistryAddress], Kano State, Nigeria<br>
            Tel: [PhoneNumber], Email: [EmailAddress]
          </div>
        </div>

        <div class="date-ref">
          <strong>Date:</strong> ${awardLetterData.awardDate}<br>
          <strong>Ref No:</strong> ${awardLetterData.refNumber}
        </div>

        <div class="recipient">
          <strong>TO:</strong> ${awardLetterData.vendorName}<br>
          ${awardLetterData.vendorAddress.replace(/\n/g, "<br>")}
        </div>

        <div class="subject">
          <strong>SUBJECT: AWARD OF CONTRACT – ${awardLetterData.tenderTitle}</strong>
        </div>

        <div class="content">
          Following the conclusion of the competitive procurement process conducted in accordance
          with the provisions of the Public Procurement Act 2007 and the Kano State Public
          Procurement Guidelines, we are pleased to inform you that <strong>${awardLetterData.vendorName}</strong>
          has been selected as the successful bidder for the above-mentioned project.
        </div>

        <div class="contract-details">
          <strong>Contract Details:</strong><br><br>
          <strong>Tender Reference:</strong> ${awardLetterData.tenderRef}<br>
          <strong>Project Title:</strong> ${awardLetterData.tenderTitle}<br>
          <strong>Contract Value:</strong> ${awardLetterData.contractValue} (${awardLetterData.contractValueWords})<br>
          <strong>Contract Duration:</strong> ${awardLetterData.contractDuration} months<br>
          <strong>Performance Bond:</strong> ${awardLetterData.performanceBond}% of contract value to be submitted within ${awardLetterData.performanceBondDue} days of receipt of this letter.<br>
          <strong>Advance Payment:</strong> ${awardLetterData.advancePayment}% upon submission of an acceptable advance payment guarantee from a reputable bank.<br>
          <strong>Warranty Period:</strong> ${awardLetterData.warrantyPeriod} months from the date of final acceptance.<br>
          <strong>Delivery Schedule:</strong> ${awardLetterData.deliveryScheduleSummary}
        </div>

        <div class="requirements">
          <strong>You are required to:</strong><br><br>
          1. Confirm acceptance of this award within ${awardLetterData.acceptanceDays} days of receipt of this letter.<br>
          2. Submit the required performance bond and any other documentation specified in the tender conditions.<br>
          3. Report to the Procurement Department, Ministry of Health, Kano State to finalize contract signing.<br><br>

          Failure to comply with the above requirements within the stipulated timeframe may result
          in the withdrawal of this award and award of the contract to the next most responsive bidder.<br><br>

          We look forward to your cooperation and timely execution of this project in line with the agreed terms.
        </div>

        <div class="signature">
          Yours faithfully,<br><br><br>
          _____________________________<br>
          ${awardLetterData.ministerTitle}
        </div>

        <div class="cc">
          <strong>Cc:</strong><br>
          Director, Procurement Department<br>
          Accountant General's Office<br>
          Project File
        </div>
      </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
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

  // Get ministry-specific mock data for enhanced overview
  const getEnhancedOverviewData = () => {
    const { ministryId, ministry } = getMinistryMockData();

    const summaryData = {
      totalProcurementPlans:
        ministryId === "ministry2" ? 24 : ministryId === "ministry3" ? 18 : 15,
      tendersCreated: tenders.length,
      tendersUnderEvaluation: tenders.filter((t) => t.status === "Evaluated")
        .length,
      nocPending: nocRequests.filter((n) => n.status === "Pending").length,
      nocApproved: nocRequests.filter((n) => n.status === "Approved").length,
      nocRejected: nocRequests.filter((n) => n.status === "Rejected").length,
      contractsActive: contracts.filter((c) => c.status === "Active").length,
      contractsClosed: contracts.filter((c) => c.status === "Completed").length,
      budgetUtilization:
        ministryId === "ministry2" ? 73 : ministryId === "ministry3" ? 68 : 82,
      totalBudget:
        ministryId === "ministry2"
          ? "₦50.0B"
          : ministryId === "ministry3"
            ? "��12.5B"
            : "₦3.2B",
      utilizedBudget:
        ministryId === "ministry2"
          ? "₦36.5B"
          : ministryId === "ministry3"
            ? "₦8.5B"
            : "₦2.6B",
    };

    const lifecycleData = {
      procurementPlans: {
        count: summaryData.totalProcurementPlans,
        status: "active" as const,
      },
      tenderManagement: {
        count: summaryData.tendersUnderEvaluation,
        status: "active" as const,
      },
      nocRequest: { count: summaryData.nocPending, status: "pending" as const },
      contractAward: {
        count: summaryData.contractsActive,
        status: "completed" as const,
      },
    };

    const updatesData = [
      {
        id: "update-1",
        type: "noc_feedback" as const,
        title: "NOC Request Approved - Hospital Equipment Supply",
        description:
          "Your NOC request for MOH-2024-001 has been approved by the superuser. Certificate number: NOC-2024-001",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: "high" as const,
        status: "approved" as const,
        relatedId: "MOH-2024-001",
        relatedType: "noc" as const,
      },
      {
        id: "update-2",
        type: "tender_status" as const,
        title: "Tender Evaluation Completed",
        description:
          "Evaluation for " +
          (tenders[0]?.title || "Medical Equipment Tender") +
          " has been completed. Awaiting award decision.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        priority: "medium" as const,
        status: "completed" as const,
        actionRequired: true,
        relatedId: tenders[0]?.id || "tender-1",
        relatedType: "tender" as const,
      },
      {
        id: "update-3",
        type: "contract_milestone" as const,
        title: "Contract Milestone Due Soon",
        description:
          "Milestone 'Equipment Delivery' for contract CON-MOH-001 is due in 3 days",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        priority: "urgent" as const,
        status: "pending" as const,
        actionRequired: true,
        relatedId: "CON-MOH-001",
        relatedType: "contract" as const,
      },
      {
        id: "update-4",
        type: "system_alert" as const,
        title: "Budget Threshold Exceeded",
        description:
          "Your ministry has exceeded 80% of allocated budget for Q1. Review required.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        priority: "high" as const,
        actionRequired: true,
        relatedType: "compliance" as const,
      },
    ];

    const analyticsData = {
      budgetData: [
        {
          month: "Jan",
          budget: 8000000000,
          expenditure: 6200000000,
          variance: 1800000000,
        },
        {
          month: "Feb",
          budget: 8500000000,
          expenditure: 7100000000,
          variance: 1400000000,
        },
        {
          month: "Mar",
          budget: 9000000000,
          expenditure: 8500000000,
          variance: 500000000,
        },
        {
          month: "Apr",
          budget: 8200000000,
          expenditure: 6800000000,
          variance: 1400000000,
        },
        {
          month: "May",
          budget: 8800000000,
          expenditure: 7200000000,
          variance: 1600000000,
        },
        {
          month: "Jun",
          budget: 9200000000,
          expenditure: 8100000000,
          variance: 1100000000,
        },
      ],
      tenderStatusData: [
        { status: "Planning", count: 5, value: 2100000000, color: "#3b82f6" },
        { status: "Open", count: 8, value: 4500000000, color: "#10b981" },
        { status: "Evaluation", count: 3, value: 1800000000, color: "#f59e0b" },
        { status: "NOC", count: 2, value: 950000000, color: "#8b5cf6" },
        { status: "Awarded", count: 4, value: 3200000000, color: "#06b6d4" },
      ],
      timelineData: [
        {
          category: "Bid Opening to Evaluation",
          averageDays: 12,
          target: 14,
          status: "good" as const,
        },
        {
          category: "Evaluation to Award",
          averageDays: 18,
          target: 21,
          status: "good" as const,
        },
        {
          category: "Award to Contract Signing",
          averageDays: 15,
          target: 10,
          status: "critical" as const,
        },
        {
          category: "NOC Processing",
          averageDays: 8,
          target: 7,
          status: "warning" as const,
        },
      ],
      nocProcessingData: [
        { month: "Jan", averageTime: 6, approved: 12, rejected: 2 },
        { month: "Feb", averageTime: 7, approved: 15, rejected: 3 },
        { month: "Mar", averageTime: 5, approved: 18, rejected: 1 },
        { month: "Apr", averageTime: 8, approved: 14, rejected: 4 },
        { month: "May", averageTime: 6, approved: 16, rejected: 2 },
        { month: "Jun", averageTime: 7, approved: 13, rejected: 3 },
      ],
    };

    const complianceData = {
      complianceIssues: [
        {
          id: "issue-1",
          type: "tender" as const,
          title: "Missing Technical Specifications",
          description:
            "Tender MOH-2024-002 lacks detailed technical specifications for medical equipment",
          severity: "high" as const,
          status: "open" as const,
          relatedId: "MOH-2024-002",
          relatedTitle: "Pharmaceutical Supply Contract",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdDate: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          tags: ["specifications", "technical"],
        },
        {
          id: "issue-2",
          type: "contract" as const,
          title: "Contract Performance Below Threshold",
          description:
            "Contract CON-MOH-003 showing performance score of 68%, below required 75%",
          severity: "medium" as const,
          status: "in_progress" as const,
          relatedId: "CON-MOH-003",
          relatedTitle: "Medical Laboratory Equipment",
          assignedTo: "Performance Team",
          dueDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          createdDate: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          tags: ["performance", "contract"],
        },
      ],
      coiStatuses: [
        {
          committeeId: "eval-comm-1",
          committeeName: "Medical Equipment Evaluation Committee",
          totalMembers: 5,
          clearedMembers: 5,
          pendingMembers: 0,
          flaggedMembers: 0,
          lastReviewDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          nextReviewDate: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "compliant" as const,
        },
        {
          committeeId: "eval-comm-2",
          committeeName: "Pharmaceutical Evaluation Committee",
          totalMembers: 7,
          clearedMembers: 5,
          pendingMembers: 2,
          flaggedMembers: 0,
          lastReviewDate: new Date(
            Date.now() - 45 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          nextReviewDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "warning" as const,
        },
      ],
      upcomingDeadlines: [
        {
          id: "deadline-1",
          type: "tender_closing" as const,
          title: "Pharmaceutical Supply Tender Closing",
          description: "Last date for bid submission",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 2,
          priority: "urgent" as const,
          actionRequired: false,
          relatedId: "MOH-2024-002",
        },
        {
          id: "deadline-2",
          type: "contract_expiry" as const,
          title: "IT Infrastructure Contract Expiry",
          description: "Contract renewal required",
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          daysRemaining: 30,
          priority: "medium" as const,
          actionRequired: true,
          relatedId: "CON-MOH-004",
        },
        {
          id: "deadline-3",
          type: "compliance_check" as const,
          title: "Quarterly Compliance Review",
          description: "Mandatory compliance audit due",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 7,
          priority: "high" as const,
          actionRequired: true,
          relatedId: "compliance-q1",
        },
      ],
    };

    return {
      summaryData,
      lifecycleData,
      updatesData,
      analyticsData,
      complianceData,
    };
  };

  const renderOverview = () => {
    const overviewData = getEnhancedOverviewData();

    return (
      <EnhancedMinistryOverview
        data={overviewData}
        onQuickAction={{
          onCreatePlan: () => setCurrentView("procurement-planning"),
          onCreateTender: () => {
            setCurrentView("tender-management");
            setTenderSubView("create");
          },
          onSubmitNOC: () => setCurrentView("noc"),
          onUploadEvaluation: () => {
            setCurrentView("tender-management");
            setTenderSubView("evaluation");
          },
          onViewContracts: () => setCurrentView("contract-management"),
          onManageUsers: () => setCurrentView("users"),
          onGenerateReport: () => setCurrentView("reports"),
          onViewAnalytics: () => setCurrentView("reports"),
          onBulkUpload: () => {
            setCurrentView("tender-management");
            setTenderSubView("bulk-upload");
          },
          onScheduleTender: () => {
            setCurrentView("tender-management");
            setShowScheduleModal(true);
          },
          onManageCommittees: () => {
            setCurrentView("tender-management");
            setTenderSubView("evaluation");
          },
          onViewNotifications: () => {
            // Could open a notifications modal or navigate to notifications view
            console.log("View notifications clicked");
          },
        }}
        onUpdateClick={(update) => {
          console.log("Update clicked:", update);
          // Handle update click - could open modal or navigate to relevant section
        }}
        onIssueClick={(issue) => {
          console.log("Issue clicked:", issue);
          // Handle compliance issue click
        }}
        onDeadlineClick={(deadline) => {
          console.log("Deadline clicked:", deadline);
          // Handle deadline click
        }}
        onCOIClick={(status) => {
          console.log("COI status clicked:", status);
          // Handle COI status click
        }}
      />
    );
  };

  const renderCompanies = () => (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-blue-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Circle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Company Registry
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Comprehensive company management and verification platform
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
                  <RefreshCw className="h-4 w-4" />
                  <span className="font-medium">Live Sync Enabled</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Approved Companies
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {companies.filter((c) => c.status === "Approved").length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-amber-600/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  {companies.filter((c) => c.status === "Pending").length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  Total Companies
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {companies.length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Circle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Companies List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100">
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Registered Companies
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-72 pl-10 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 font-medium"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Suspended">Suspended</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Business Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-blue-100">
              {filteredCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-blue-50/50 transition-all duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {company.companyName}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <svg
                          className="h-3 w-3 mr-1 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {company.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {company.contactPerson}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <svg
                          className="h-3 w-3 mr-1 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {company.email}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <svg
                          className="h-3 w-3 mr-1 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {company.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-full border">
                      {company.businessType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm ${
                        company.status === "Approved"
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
                          : company.status === "Pending"
                            ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200"
                            : company.status === "Suspended"
                              ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200"
                              : company.status === "Blacklisted"
                                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
                                : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          company.status === "Approved"
                            ? "bg-green-500"
                            : company.status === "Pending"
                              ? "bg-yellow-500 animate-pulse"
                              : company.status === "Suspended"
                                ? "bg-orange-500"
                                : company.status === "Blacklisted"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                        }`}
                      ></div>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 hover:shadow-md group-hover:shadow-lg">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border">
                        Read Only
                      </span>
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

  const renderTenderList = () => (
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Tenders</p>
              <p className="text-2xl font-bold text-gray-900">
                {tenders.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
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
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Under Evaluation
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  tenders.filter(
                    (t) => t.status === "Closed" || t.status === "Evaluated",
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
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
        <div className="px-4 py-2 border-b border-gray-200">
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
                  <td className="px-4 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tender.title}
                      </div>
                      <div className="text-sm text-gray-500">{tender.id}</div>
                      <div className="text-sm text-gray-500">
                        {tender.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {tender.estimatedValue}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tender.publishDate &&
                          `Published: ${new Date(tender.publishDate).toLocaleDateString()}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Close: {new Date(tender.closeDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
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
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {tender.bidsReceived}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTenderForDetails(tender);
                        const tenderBids = loadBidsForTender(tender.id);

                        // If no real bids found, fall back to mock data based on tender ID
                        if (tenderBids.length === 0) {
                          // Use workspace-specific mock data if available
                          const workspaceBidderData = getWorkspaceBidderData();
                          const workspaceBidders =
                            workspaceBidderData[
                              tender.id as keyof typeof workspaceBidderData
                            ];
                          if (workspaceBidders) {
                            setBidders(workspaceBidders);
                          } else {
                            // For new/unrecognized tenders, use empty array to show "no companies" message
                            setBidders([]);
                          }
                        } else {
                          setBidders(tenderBids);
                        }
                        setShowTenderDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
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
    <div className="space-y-4">
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
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Tender Information
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tender Title *
              </label>
              <input
                type="text"
                value={newTender.title}
                onChange={(e) =>
                  setNewTender((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter tender title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={newTender.category}
                onChange={(e) =>
                  setNewTender((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select category</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Technology">Technology</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Environment">Environment</option>
                <option value="Transportation">Transportation</option>
                <option value="Water Resources">Water Resources</option>
                <option value="Energy">Energy</option>
                <option value="Social Services">Social Services</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                value={newTender.description}
                onChange={(e) =>
                  setNewTender((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                value={newTender.estimatedValue}
                onChange={(e) =>
                  setNewTender((prev) => ({
                    ...prev,
                    estimatedValue: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter amount (e.g., 2500000 for ₦2.5M)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procurement Method
              </label>
              <select
                value={newTender.procurementMethod}
                onChange={(e) =>
                  setNewTender((prev) => ({
                    ...prev,
                    procurementMethod: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Open Tender">Open Tender</option>
                <option value="Selective Tender">Selective Tender</option>
                <option value="Direct Procurement">Direct Procurement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <input
                type="date"
                value={newTender.publishDate}
                onChange={(e) =>
                  setNewTender((prev) => ({
                    ...prev,
                    publishDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Date *
              </label>
              <input
                type="date"
                value={newTender.closeDate}
                onChange={(e) =>
                  setNewTender((prev) => ({
                    ...prev,
                    closeDate: e.target.value,
                  }))
                }
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
                value={newTender.contactEmail || ministryInfo.contactEmail}
                onChange={(e) =>
                  setNewTender((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end space-x-3">
            <button
              onClick={() => handleSubmitTender(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmitTender(false)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Publish Tender
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAITenderManagement = () => (
    <div className="space-y-4">
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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
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
                  <h4 className="font-medium text-gray-900">Vendor Matching</h4>
                  <p className="text-sm text-gray-600">
                    Intelligent vendor recommendation
                  </p>
                </button>
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <Timer className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Auto-Scheduling</h4>
                  <p className="text-sm text-gray-600">
                    AI-optimized publication timing
                  </p>
                </button>
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <BarChart3 className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">
                    Analytics & Insights
                  </h4>
                  <p className="text-sm text-gray-600">
                    Performance metrics and trends
                  </p>
                </button>
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <RefreshCw className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">
                    Auto-Republishing
                  </h4>
                  <p className="text-sm text-gray-600">
                    Automatic failed publication retry
                  </p>
                </button>
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <Shield className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">
                    Compliance Check
                  </h4>
                  <p className="text-sm text-gray-600">
                    AI-powered regulatory compliance
                  </p>
                </button>
                <button className="text-left p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-purple-200">
                  <Megaphone className="h-5 w-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">
                    Channel Optimization
                  </h4>
                  <p className="text-sm text-gray-600">
                    Smart distribution channel selection
                  </p>
                </button>
              </div>

              {/* AI Performance Metrics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">
                        Publications Optimized
                      </p>
                      <p className="text-2xl font-bold text-purple-900">24</p>
                    </div>
                    <Bot className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">
                        Avg Response Rate
                      </p>
                      <p className="text-2xl font-bold text-purple-900">78%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Time Saved</p>
                      <p className="text-2xl font-bold text-purple-900">
                        16hrs
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-900">94%</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Publications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Timer className="h-5 w-5 text-blue-600 mr-2" />
            Scheduled Publications
          </h2>
          <span className="text-sm text-gray-500">
            {scheduledPublications.length} scheduled
          </span>
        </div>
        <div className="p-4">
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
                <div className="mt-3 flex space-x-2">
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
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <Download className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Excel Template</h3>
          <p className="text-sm text-gray-600 mb-3">
            Standard template for bulk tender upload
          </p>
          <button className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-md hover:bg-green-100">
            Download Template
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <Download className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">CSV Template</h3>
          <p className="text-sm text-gray-600 mb-3">
            Comma-separated values format
          </p>
          <button className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100">
            Download Template
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <Eye className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
          <p className="text-sm text-gray-600 mb-3">
            Step-by-step upload instructions
          </p>
          <button className="w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-md hover:bg-purple-100">
            View Guide
          </button>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-2 border-b border-gray-200">
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
                <td className="px-4 py-2 whitespace-nowrap">
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
                <td className="px-4 py-2 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      health_tenders_Q1.xlsx
                    </div>
                    <div className="text-sm text-gray-500">
                      248 KB • 15 records
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900">12 successful</div>
                  <div className="text-sm text-red-600">3 failed</div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
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
    <div className="space-y-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <Users2 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Active Committees
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  evaluationCommittees.filter((c) => c.status === "Active")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Completed Evaluations
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bidEvaluations.filter((e) => e.status === "Final").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Pending Reviews
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bidEvaluations.filter((e) => e.status === "Submitted").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Committees */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users2 className="h-5 w-5 text-purple-600 mr-2" />
            Evaluation Committees
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {evaluationCommittees.map((committee) => (
              <div key={committee.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
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
                          <span className="text-gray-900">{member.name}</span>
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
                <div className="mt-3 flex space-x-2">
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
      return renderActualEvaluation();
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
    return vendorWorkflowStatuses.find(
      (status) => status.companyId === bidderId,
    );
  };

  const isVendorEligibleForAward = (bidderId: string) => {
    const status = getVendorWorkflowStatus(bidderId);
    return (
      status &&
      status.registrationCompleted &&
      status.loginVerificationCompleted &&
      status.biddingCompleted &&
      status.evaluationCompleted &&
      status.nocIssued &&
      status.finalApprovalStatus === "approved"
    );
  };

  const renderVendorWorkflowStep = (
    step: string,
    completed: boolean,
    date?: string,
    details?: string,
  ) => {
    return (
      <div
        className={`flex flex-col items-center space-y-2 p-2 rounded-lg border-2 min-w-[140px] ${
          completed
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            completed ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {completed ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </div>
        <div className="text-center">
          <div
            className={`text-xs font-medium ${
              completed ? "text-green-800" : "text-red-800"
            }`}
          >
            {step}
          </div>
          <div
            className={`text-xs px-2 py-1 rounded-full mt-1 ${
              completed
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {completed ? "✓" : "✗"}
          </div>
          {date && (
            <div className="text-xs text-gray-600 mt-1">
              {completed ? date : "Pending"}
            </div>
          )}
          {details && (
            <div
              className="text-xs text-gray-600 mt-1 truncate"
              title={details}
            >
              {details.length > 15 ? `${details.substring(0, 15)}...` : details}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVendorWorkflowStepper = (
    steps: Array<{
      step: string;
      completed: boolean;
      date?: string;
      details?: string;
    }>,
  ) => {
    return (
      <div className="w-full">
        <div className="relative">
          {/* Horizontal line spanning full width */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 z-0"></div>

          {/* Progress line that follows completion */}
          <div
            className="absolute top-4 left-4 h-0.5 bg-green-600 z-10 transition-all duration-300"
            style={{
              width: `calc(${((steps.filter((s) => s.completed).length - 1) / Math.max(steps.length - 1, 1)) * 100}% - 1rem)`,
            }}
          ></div>

          {/* Circles and labels */}
          <div className="relative z-20 flex justify-between items-start">
            {steps.map((stepData, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    stepData.completed
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {stepData.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center max-w-[80px]">
                  <div
                    className={`text-xs font-medium ${
                      stepData.completed ? "text-green-800" : "text-gray-600"
                    }`}
                  >
                    {stepData.step}
                  </div>

                  {stepData.date && (
                    <div className="text-xs text-gray-500 mt-1">
                      {stepData.completed ? stepData.date : "Pending"}
                    </div>
                  )}

                  {stepData.details && (
                    <div
                      className="text-xs text-gray-500 mt-1 text-center"
                      title={stepData.details}
                    >
                      {stepData.details.length > 15
                        ? `${stepData.details.substring(0, 15)}...`
                        : stepData.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status indicator */}
        <div className="text-center mt-4">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              steps.every((s) => s.completed)
                ? "bg-green-100 text-green-800"
                : steps.some((s) => s.completed)
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {steps.every((s) => s.completed)
              ? "✓ All Steps Completed"
              : `${steps.filter((s) => s.completed).length}/${steps.length} Steps Completed`}
          </div>
        </div>
      </div>
    );
  };

  const renderActualEvaluation = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Tender Evaluation Process
            </h1>
            <p className="text-gray-600">
              Comprehensive evaluation of submitted bids with scoring and
              recommendations
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Evaluations
            </button>
            <button
              onClick={() => setShowFinalizeEvaluationModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalize Evaluation
            </button>
          </div>
        </div>

        {/* Committee Management Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Evaluation Committee Management
              </h2>
              <button
                onClick={() => setShowCreateCommitteeModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Users2 className="h-4 w-4 mr-2" />
                Create Committee
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeCommittee ? (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      {activeCommittee.name}
                    </h3>
                    <p className="text-green-700">
                      Chairperson: {activeCommittee.chairperson} • Secretary:{" "}
                      {activeCommittee.secretary}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Active Committee
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeCommittee.members.map((member: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 border border-green-200"
                    >
                      <div className="font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.department}
                      </div>
                      <div className="text-sm text-green-700">
                        {member.role}
                      </div>
                      {member.email && (
                        <div className="text-xs text-gray-500">
                          {member.email}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => {
                      setCommitteeFormData({
                        name: activeCommittee.name,
                        chairperson: activeCommittee.chairperson,
                        secretary: activeCommittee.secretary || "",
                        specialization: activeCommittee.specialization || "",
                        members:
                          activeCommittee.members.length > 0
                            ? activeCommittee.members
                            : [
                                {
                                  name: "",
                                  department: "",
                                  role: "Member",
                                  email: "",
                                },
                              ],
                      });
                      setShowCreateCommitteeModal(true);
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1 inline" />
                    Edit Committee
                  </button>
                  <button
                    onClick={() => setActiveCommittee(null)}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    <X className="h-4 w-4 mr-1 inline" />
                    Dissolve Committee
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Evaluation Committee
                </h3>
                <p className="text-gray-600 mb-3">
                  Create an evaluation committee to manage the tender evaluation
                  process
                </p>
                <button
                  onClick={() => setShowCreateCommitteeModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Users2 className="h-4 w-4 mr-2" />
                  Create Committee
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Submissions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {bidders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Evaluated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bidders.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Qualified</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bidders.filter((b) => b.status === "Qualified").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">84.7%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Evaluation */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Bid Evaluation Workspace
              </h2>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="MOH-2024-001">
                    MOH-2024-001 - Hospital Equipment Supply
                  </option>
                  <option value="MOH-2024-002">
                    MOH-2024-002 - Pharmaceutical Supply
                  </option>
                  <option value="MOH-2024-003">
                    MOH-2024-003 - Laboratory Equipment
                  </option>
                </select>

                {!isEditingEvaluation ? (
                  <button
                    onClick={() => setIsEditingEvaluation(true)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Scores
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={saveEvaluationScores}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingEvaluation(false)}
                      className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {bidders.map((bidder, index) => {
                const workflowStatus = getVendorWorkflowStatus(bidder.id);
                const isEligible = isVendorEligibleForAward(bidder.id);

                return (
                  <div key={bidder.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-orange-400"
                                  : "bg-gray-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {bidder.companyName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {bidder.experience} experience • {bidder.bidAmount}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                isEligible
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isEligible
                                ? "Workflow Complete"
                                : "Workflow Incomplete"}
                            </span>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {bidder.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {bidder.totalScore}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Overall Score
                        </div>
                      </div>
                    </div>

                    {/* Evaluation Scoring */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Financial Evaluation */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-3">
                          Financial Evaluation (40%)
                        </h4>
                        <div className="space-y-3">
                          {[
                            {
                              key: "bidPriceAnalysis",
                              label: "Bid Price Analysis",
                              defaultScore: 18,
                            },
                            {
                              key: "bidSecurity",
                              label: "Bid Security",
                              defaultScore: 19,
                            },
                            {
                              key: "financialCapability",
                              label: "Financial Capability",
                              defaultScore: 17,
                            },
                            {
                              key: "valueForMoney",
                              label: "Value for Money",
                              defaultScore: 16,
                            },
                            {
                              key: "costBreakdown",
                              label: "Cost Breakdown",
                              defaultScore: 17,
                            },
                          ].map((criterion) => {
                            const currentScore = getEvaluationScore(
                              bidder.id,
                              "financial",
                              criterion.key,
                              criterion.defaultScore,
                            );
                            return (
                              <div
                                key={criterion.key}
                                className="flex justify-between items-center"
                              >
                                <span className="text-sm text-green-800">
                                  ✅ {criterion.label}
                                </span>
                                {isEditingEvaluation ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      value={currentScore}
                                      onChange={(e) =>
                                        updateEvaluationScore(
                                          bidder.id,
                                          "financial",
                                          criterion.key,
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-green-800">
                                      /20
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm font-medium text-green-900">
                                    {currentScore}/20
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-green-900">
                                Financial Score:
                              </span>
                              <span className="text-lg font-bold text-green-900">
                                {bidder.financialScore}%
                              </span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${bidder.financialScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Technical Evaluation */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-3">
                          Technical Evaluation (35%)
                        </h4>
                        <div className="space-y-3">
                          {[
                            {
                              key: "experienceExpertise",
                              label: "Experience & Expertise",
                              defaultScore: 16,
                            },
                            {
                              key: "technicalApproach",
                              label: "Technical Approach",
                              defaultScore: 18,
                            },
                            {
                              key: "qualityStandards",
                              label: "Quality Standards",
                              defaultScore: 17,
                            },
                            {
                              key: "certifications",
                              label: "Certifications",
                              defaultScore: 19,
                            },
                            {
                              key: "previousContracts",
                              label: "Previous Contracts (2yrs)",
                              defaultScore: 15,
                            },
                          ].map((criterion) => {
                            const currentScore = getEvaluationScore(
                              bidder.id,
                              "technical",
                              criterion.key,
                              criterion.defaultScore,
                            );
                            return (
                              <div
                                key={criterion.key}
                                className="flex justify-between items-center"
                              >
                                <span className="text-sm text-blue-800">
                                  {criterion.label}
                                </span>
                                {isEditingEvaluation ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      value={currentScore}
                                      onChange={(e) =>
                                        updateEvaluationScore(
                                          bidder.id,
                                          "technical",
                                          criterion.key,
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-blue-800">
                                      /20
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm font-medium text-blue-900">
                                    {currentScore}/20
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-blue-900">
                                Technical Score:
                              </span>
                              <span className="text-lg font-bold text-blue-900">
                                {bidder.technicalScore}%
                              </span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${bidder.technicalScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Compliance Evaluation */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-3">
                          Compliance (25%)
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-800">
                              Document Completeness
                            </span>
                            <span className="text-sm font-medium text-purple-900">
                              19/20
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-800">
                              Legal Requirements
                            </span>
                            <span className="text-sm font-medium text-purple-900">
                              20/20
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-800">
                              Workflow Completion
                            </span>
                            <span className="text-sm font-medium text-purple-900">
                              {isEligible ? "20/20" : "0/20"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-800">
                              NOC Verification
                            </span>
                            <span className="text-sm font-medium text-purple-900">
                              {workflowStatus?.nocIssued ? "20/20" : "0/20"}
                            </span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-purple-900">
                                Compliance Score:
                              </span>
                              <span className="text-lg font-bold text-purple-900">
                                {isEligible ? "95" : "70"}%
                              </span>
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${isEligible ? 95 : 70}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Evaluator Comments */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Evaluator Comments & Recommendations
                      </h5>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Add evaluation comments and recommendations..."
                        defaultValue={
                          index === 0
                            ? "Strong technical proposal with competitive pricing. Highly recommended for award."
                            : index === 1
                              ? "Good technical capability but higher pricing. Suitable alternative if primary choice fails."
                              : "Adequate proposal meeting minimum requirements. Consider for smaller scope projects."
                        }
                      />
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">
                            Recommendation:
                          </span>
                          <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option
                              value={
                                index === 0
                                  ? "recommend"
                                  : index === 1
                                    ? "consider"
                                    : "reserve"
                              }
                            >
                              {index === 0
                                ? "Recommend for Award"
                                : index === 1
                                  ? "Consider as Alternative"
                                  : "Reserve List"}
                            </option>
                            <option value="recommend">
                              Recommend for Award
                            </option>
                            <option value="consider">
                              Consider as Alternative
                            </option>
                            <option value="reserve">Reserve List</option>
                            <option value="reject">Reject</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                            Save Evaluation
                          </button>
                          <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                            Generate Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTenderAward = () => {
    const tendersForAward = tenders.filter(
      (t) => t.status === "Evaluated" || t.status === "Closed",
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ���� Award Tenders
            </h1>
            <p className="text-gray-600">
              Award tenders to qualified vendors who have completed the required
              workflow process
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Ready for Award
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    bidders.filter((bidder) =>
                      isVendorEligibleForAward(bidder.id),
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
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
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">₦2.7B</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
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
          <div className="px-4 py-2 border-b border-gray-200">
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

          <div className="p-4">
            <div className="space-y-3">
              {tendersForAward.map((tender) => (
                <div
                  key={tender.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
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
                          <span className="font-medium">Tender ID:</span>{" "}
                          {tender.id}
                        </div>
                        <div>
                          <span className="font-medium">Estimated Value:</span>{" "}
                          {tender.estimatedValue}
                        </div>
                        <div>
                          <span className="font-medium">Bids Received:</span>{" "}
                          {tender.bidsReceived}
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
                    <h4 className="font-medium text-gray-900 mb-3">
                      Top Qualified Bidders & Workflow Status
                    </h4>
                    <div className="space-y-4">
                      {bidders.slice(0, 5).map((bidder, index) => {
                        const workflowStatus = getVendorWorkflowStatus(
                          bidder.id,
                        );
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
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    index === 0
                                      ? "bg-yellow-500 text-white"
                                      : index === 1
                                        ? "bg-gray-400 text-white"
                                        : "bg-orange-400 text-white"
                                  }`}
                                >
                                  <span className="text-sm font-bold">
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900 text-sm">
                                    {bidder.companyName}
                                  </span>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      Score: {bidder.totalScore}%
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        isEligible
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {isEligible
                                        ? "Eligible for Award"
                                        : "Not Eligible"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {bidder.bidAmount}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bidder.experience}
                                </div>
                              </div>
                            </div>

                            {/* Workflow Status Steps */}
                            <div className="mt-3">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Vendor Workflow Status:
                              </h5>
                              <div className="w-full">
                                {renderVendorWorkflowStepper([
                                  {
                                    step: "Company Registration",
                                    completed:
                                      workflowStatus?.registrationCompleted ||
                                      false,
                                    date: workflowStatus?.registrationDate,
                                  },
                                  {
                                    step: "Login & Verification",
                                    completed:
                                      workflowStatus?.loginVerificationCompleted ||
                                      false,
                                    date: workflowStatus?.verificationDate,
                                  },
                                  {
                                    step: "Bidding Process",
                                    completed:
                                      workflowStatus?.biddingCompleted || false,
                                    date: workflowStatus?.bidSubmissionDate,
                                  },
                                  {
                                    step: "Tender Evaluation",
                                    completed:
                                      workflowStatus?.evaluationCompleted ||
                                      false,
                                    date: workflowStatus?.evaluationDate,
                                  },
                                  {
                                    step: "No Objection Certificate",
                                    completed:
                                      workflowStatus?.nocIssued || false,
                                    date: workflowStatus?.nocIssuedDate,
                                    details:
                                      workflowStatus?.nocCertificateNumber
                                        ? `Certificate: ${workflowStatus.nocCertificateNumber}`
                                        : undefined,
                                  },
                                ])}
                              </div>
                            </div>

                            {/* Award Eligibility Summary */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div
                                className={`p-3 rounded-md ${
                                  isEligible
                                    ? "bg-green-100 border border-green-200"
                                    : "bg-red-100 border border-red-200"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {isEligible ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                  )}
                                  <span
                                    className={`text-sm font-medium ${
                                      isEligible
                                        ? "text-green-800"
                                        : "text-red-800"
                                    }`}
                                  >
                                    {isEligible
                                      ? "✅ All requirements completed - Ready for award"
                                      : "❌ Requirements incomplete - Cannot award tender"}
                                  </span>
                                </div>
                                {!isEligible && (
                                  <div className="mt-2 text-xs text-red-700">
                                    Complete all workflow steps before this
                                    vendor can be awarded a tender.
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
                  <div className="mt-3 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedTenderForDetails(tender);
                        // Load real bids for this tender
                        const tenderBids = loadBidsForTender(tender.id);
                        if (tenderBids.length > 0) {
                          setBidders(tenderBids);
                        }
                        setShowTenderDetailsModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTenderForDetails(tender);
                        // Load real bids for this tender
                        const tenderBids = loadBidsForTender(tender.id);
                        if (tenderBids.length > 0) {
                          setBidders(tenderBids);
                        }
                        setShowEvaluationReportModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 text-sm"
                    >
                      <CheckSquare className="h-3 w-3 mr-1" />
                      Evaluation Report
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTenderForDetails(tender);
                        // Load real bids for this tender
                        const tenderBids = loadBidsForTender(tender.id);
                        if (tenderBids.length > 0) {
                          setBidders(tenderBids);
                        }
                        setShowDownloadModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download Bids
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Awarded Tenders Section */}
        {tenders.filter((t) => t.status === "Awarded").length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 py-2 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Awarded Tenders
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Generate and download official award letters for awarded tenders
              </p>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {tenders
                  .filter((t) => t.status === "Awarded")
                  .map((tender) => (
                    <div
                      key={tender.id}
                      className="border border-green-200 rounded-lg p-4 bg-green-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {tender.title}
                            </h4>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Awarded
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Tender ID</p>
                              <p className="font-medium">{tender.id}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Awarded Company</p>
                              <p className="font-medium">
                                {tender.awardedCompany || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Award Value</p>
                              <p className="font-medium">
                                {tender.awardAmount || tender.estimatedValue}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Award Date</p>
                              <p className="font-medium">
                                {tender.awardDate || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          <button
                            onClick={() => generateAwardLetter(tender)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Award Letter
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTenderForDetails(tender);
                              // Load real bids for this tender
                              const tenderBids = loadBidsForTender(tender.id);
                              if (tenderBids.length > 0) {
                                setBidders(tenderBids);
                              }
                              setShowTenderDetailsModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

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
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Select Winning Bidder
                    </h4>
                    <div className="space-y-3">
                      {bidders.map((bidder, index) => {
                        const workflowStatus = getVendorWorkflowStatus(
                          bidder.id,
                        );
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
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      index === 0
                                        ? "bg-yellow-500 text-white"
                                        : index === 1
                                          ? "bg-gray-400 text-white"
                                          : "bg-orange-400 text-white"
                                    }`}
                                  >
                                    <span className="text-xs font-bold">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <h5 className="font-semibold text-gray-900">
                                    {bidder.companyName}
                                  </h5>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      isEligible
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {isEligible ? "Eligible" : "Not Eligible"}
                                  </span>
                                </div>

                                {/* Workflow Status Indicator */}
                                <div className="mb-3">
                                  <div
                                    className={`text-xs px-2 py-1 rounded-md inline-flex items-center space-x-1 ${
                                      isEligible
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {isEligible ? (
                                      <>
                                        <CheckCircle className="h-3 w-3" />
                                        <span>
                                          All workflow steps completed
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-3 w-3" />
                                        <span>Workflow incomplete</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">
                                      Bid Amount:
                                    </span>
                                    <p className="text-lg font-semibold text-gray-900">
                                      {bidder.bidAmount}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Total Score:
                                    </span>
                                    <p className="text-lg font-semibold text-green-600">
                                      {bidder.totalScore}%
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Technical:
                                    </span>
                                    <p>{bidder.technicalScore}%</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Financial:
                                    </span>
                                    <p>{bidder.financialScore}%</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Experience:
                                    </span>
                                    <p>{bidder.experience}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      Projects:
                                    </span>
                                    <p>{bidder.previousProjects} completed</p>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-gray-600">
                                    Certifications:
                                  </span>
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
                                <div className="text-xs text-red-700 font-medium">
                                  Required Steps Missing:
                                </div>
                                <ul className="text-xs text-red-600 mt-1 space-y-1">
                                  {!workflowStatus?.registrationCompleted && (
                                    <li>����� Company Registration</li>
                                  )}
                                  {!workflowStatus?.loginVerificationCompleted && (
                                    <li>• Login & Verification</li>
                                  )}
                                  {!workflowStatus?.biddingCompleted && (
                                    <li>• Bidding Process</li>
                                  )}
                                  {!workflowStatus?.evaluationCompleted && (
                                    <li>• Tender Evaluation</li>
                                  )}
                                  {!workflowStatus?.nocIssued && (
                                    <li>• No Objection Certificate</li>
                                  )}
                                  {workflowStatus?.finalApprovalStatus !==
                                    "approved" && <li>• Final Approval</li>}
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
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
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
                          onChange={(e) =>
                            setAwardFormData({
                              ...awardFormData,
                              awardValue: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="��0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contract Duration (months) *
                        </label>
                        <input
                          type="number"
                          value={awardFormData.contractDuration}
                          onChange={(e) =>
                            setAwardFormData({
                              ...awardFormData,
                              contractDuration: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setAwardFormData({
                              ...awardFormData,
                              performanceBond: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setAwardFormData({
                              ...awardFormData,
                              advancePayment: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setAwardFormData({
                              ...awardFormData,
                              warrantyPeriod: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setAwardFormData({
                              ...awardFormData,
                              deliverySchedule: e.target.value,
                            })
                          }
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
                      onChange={(e) =>
                        setAwardFormData({
                          ...awardFormData,
                          awardJustification: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setAwardFormData({
                          ...awardFormData,
                          specialConditions: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Any special conditions or requirements for this contract..."
                    />
                  </div>
                </div>
              </div>

              {/* Award Actions */}
              <div className="mt-3 pt-6 border-t border-gray-200">
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-medium text-blue-800">
                          Vendor Workflow Verification
                        </h5>
                        <p className="text-sm text-blue-700 mt-1">
                          Only vendors who have completed all 5 workflow steps
                          can be awarded a tender:
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
                          <li>1. ✅ Company Registration</li>
                          <li>2. ✅ Login & Verification</li>
                          <li>3. ��� Bidding Process</li>
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
                        <h5 className="text-sm font-medium text-yellow-800">
                          Award Confirmation
                        </h5>
                        <p className="text-sm text-yellow-700 mt-1">
                          Once awarded, this decision will be final and legally
                          binding. Ensure all details are correct and the vendor
                          has completed all workflow requirements before
                          proceeding.
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
                      onClick={handleAwardTender}
                      disabled={
                        !awardFormData.selectedBidder ||
                        !awardFormData.awardValue ||
                        !awardFormData.awardJustification ||
                        !isVendorEligibleForAward(awardFormData.selectedBidder)
                      }
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

        {/* Tender Details Modal */}
        {showTenderDetailsModal && selectedTenderForDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  📋 Tender Details - {selectedTenderForDetails.title}
                </h3>
                <button
                  onClick={() => {
                    setShowTenderDetailsModal(false);
                    setSelectedTenderForDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Basic Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Tender ID:</strong>{" "}
                        {selectedTenderForDetails.id}
                      </p>
                      <p>
                        <strong>Title:</strong> {selectedTenderForDetails.title}
                      </p>
                      <p>
                        <strong>Category:</strong>{" "}
                        {selectedTenderForDetails.category}
                      </p>
                      <p>
                        <strong>Estimated Value:</strong>{" "}
                        {selectedTenderForDetails.estimatedValue}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            selectedTenderForDetails.status === "Evaluated"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedTenderForDetails.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Published:</strong>{" "}
                        {selectedTenderForDetails.publishDate
                          ? new Date(
                              selectedTenderForDetails.publishDate,
                            ).toLocaleDateString()
                          : "Not published"}
                      </p>
                      <p>
                        <strong>Closing Date:</strong>{" "}
                        {new Date(
                          selectedTenderForDetails.closeDate,
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Ministry:</strong>{" "}
                        {selectedTenderForDetails.ministry}
                      </p>
                      <p>
                        <strong>Procuring Entity:</strong>{" "}
                        {selectedTenderForDetails.procuringEntity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Bidding Statistics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Total Bids Received:</strong>{" "}
                        {selectedTenderForDetails.bidsReceived}
                      </p>
                      <p>
                        <strong>Eligible Vendors:</strong>{" "}
                        {
                          bidders.filter((bidder) =>
                            isVendorEligibleForAward(bidder.id),
                          ).length
                        }
                      </p>
                      <p>
                        <strong>Evaluation Status:</strong>
                        <span className="ml-2 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Completed
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedTenderForDetails.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participating Companies Section */}
              {bidders.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Circle className="h-5 w-5 mr-2 text-blue-600" />
                    Companies That Participated in This Tender
                  </h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Company
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bid Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Technical Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Financial Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Score
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submission Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {bidders.map((bidder) => (
                            <tr key={bidder.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {bidder.companyName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {bidder.experience} experience
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {bidder.bidAmount}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {bidder.technicalScore}/100
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {bidder.financialScore}/100
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {bidder.totalScore}/100
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    bidder.status === "Qualified"
                                      ? "bg-green-100 text-green-800"
                                      : bidder.status === "Under Review"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {bidder.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  bidder.submissionDate,
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {bidders.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Participants
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {
                            bidders.filter((b) => b.status === "Qualified")
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">Qualified</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {bidders.length > 0
                            ? Math.round(
                                bidders.reduce(
                                  (sum, b) => sum + b.totalScore,
                                  0,
                                ) / bidders.length,
                              )
                            : 0}
                        </div>
                        <div className="text-sm text-gray-600">Avg Score</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {bidders.length > 0
                            ? bidders
                                .sort((a, b) => b.totalScore - a.totalScore)[0]
                                .companyName.split(" ")[0]
                            : "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">Top Bidder</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message when no bidders */}
              {bidders.length === 0 && (
                <div className="mt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-yellow-600 mb-2">
                      <Users className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      No Companies Found
                    </h3>
                    <p className="text-yellow-700">
                      Either no companies have submitted bids for this tender
                      yet, or the bidding period hasn't opened.
                    </p>
                    <div className="mt-4 text-sm text-yellow-600">
                      <p>
                        <strong>Tender Status:</strong>{" "}
                        {selectedTenderForDetails.status}
                      </p>
                      <p>
                        <strong>Bid Count:</strong>{" "}
                        {selectedTenderForDetails.bidsReceived}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTenderDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2 inline" />
                  Export Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Report Modal */}
        {showEvaluationReportModal && selectedTenderForDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  ������ Evaluation Report - {selectedTenderForDetails.title}
                </h3>
                <button
                  onClick={() => setShowEvaluationReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Evaluation Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Evaluation Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedTenderForDetails.bidsReceived}
                      </div>
                      <div className="text-gray-600">Total Bids</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {bidders.filter((b) => b.status === "Qualified").length}
                      </div>
                      <div className="text-gray-600">Qualified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {
                          bidders.filter((bidder) =>
                            isVendorEligibleForAward(bidder.id),
                          ).length
                        }
                      </div>
                      <div className="text-gray-600">Eligible for Award</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        87.3%
                      </div>
                      <div className="text-gray-600">Avg Score</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Vendor Evaluations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Vendor Evaluation Details
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bid Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Technical Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Financial Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Workflow Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bidders.map((bidder, index) => {
                          const isEligible = isVendorEligibleForAward(
                            bidder.id,
                          );
                          return (
                            <tr
                              key={bidder.id}
                              className={
                                isEligible ? "bg-green-50" : "bg-red-50"
                              }
                            >
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    index === 0
                                      ? "bg-yellow-500"
                                      : index === 1
                                        ? "bg-gray-400"
                                        : index === 2
                                          ? "bg-orange-400"
                                          : "bg-gray-300"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {bidder.companyName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bidder.experience} experience
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {bidder.bidAmount}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {bidder.technicalScore}%
                                </div>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${bidder.technicalScore}%`,
                                    }}
                                  ></div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {bidder.financialScore}%
                                </div>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{
                                      width: `${bidder.financialScore}%`,
                                    }}
                                  ></div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="text-sm font-bold text-gray-900">
                                  {bidder.totalScore}%
                                </div>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full"
                                    style={{ width: `${bidder.totalScore}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    isEligible
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {isEligible
                                    ? "✅ Eligible"
                                    : "❌ Not Eligible"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Evaluation Criteria
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">
                        Financial Evaluation (40%)
                      </h5>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>✅ Bid Price Analysis</li>
                        <li>✅ Bid Security</li>
                        <li>✅ Evidence of financial capability</li>
                        <li>✅ Value for money</li>
                        <li>✅ Cost breakdown</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">
                        Technical Evaluation (35%)
                      </h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>�� Experience & Expertise</li>
                        <li>• Technical Approach</li>
                        <li>�� Quality Standards</li>
                        <li>• Certifications</li>
                        <li>
                          ����� Previous contracts executed in the last 2 years
                        </li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium text-purple-900 mb-2">
                        Compliance (25%)
                      </h5>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>Document Completeness</li>
                        <li>Legal Requirements</li>
                        <li>Workflow Completion</li>
                        <li>NOC Verification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEvaluationReportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2 inline" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download Bids Modal */}
        {showDownloadModal && selectedTenderForDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  �� Download Bids - {selectedTenderForDetails.title}
                </h3>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Available Downloads
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Select the bid documents you want to download. All files
                        are encrypted and password protected.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Individual Bid Documents
                  </h4>
                  {bidders.map((bidder, index) => (
                    <div key={bidder.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                    ? "bg-orange-400"
                                    : "bg-gray-300"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {bidder.companyName}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Bid Amount: {bidder.bidAmount} • Score:{" "}
                              {bidder.totalScore}%
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            isVendorEligibleForAward(bidder.id)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isVendorEligibleForAward(bidder.id)
                            ? "Eligible"
                            : "Not Eligible"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Technical Proposal
                        </button>
                        <button className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Financial Proposal
                        </button>
                        <button className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 text-sm">
                          <FileCheck className="h-4 w-4 mr-2" />
                          Compliance Docs
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Bulk Download Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-4 py-3 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200">
                      <Package className="h-5 w-5 mr-2" />
                      Download All Bids (ZIP)
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200">
                      <Star className="h-5 w-5 mr-2" />
                      Download Eligible Only
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2 inline" />
                  Generate Download Links
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContracts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ��� Contract Management
          </h1>
          <p className="text-gray-600">
            Comprehensive contract lifecycle management with digital signatures
            and milestone tracking
          </p>
        </div>
        <button
          onClick={() => setShowTenderSelectionModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </button>
      </div>

      {/* Contract Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
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
        <div className="bg-white rounded-lg shadow-sm p-4 border">
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
        <div className="bg-white rounded-lg shadow-sm p-4 border">
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
        <div className="bg-white rounded-lg shadow-sm p-4 border">
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
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Contract Portfolio
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
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
                <div className="mb-3">
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
                                milestone.verificationStatus === "Verified"
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
                <div className="mb-3">
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
                  <div className="mb-3">
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
                    onClick={() =>
                      handleUpdateMilestone(
                        contract,
                        contract.milestones.find(
                          (m) => m.status === "In Progress",
                        ) || contract.milestones[0],
                      )
                    }
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Update Milestone
                  </button>
                  <button
                    onClick={() =>
                      handleProcessPayment(
                        contract,
                        contract.payments.find((p) => p.status === "Pending") ||
                          contract.payments[0],
                      )
                    }
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
            <div className="flex items-center justify-between mb-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Contract Information
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Contract ID:</strong> {selectedContractForAction.id}
                  </p>
                  <p>
                    <strong>Tender ID:</strong>{" "}
                    {selectedContractForAction.tenderId}
                  </p>
                  <p>
                    <strong>Contractor:</strong>{" "}
                    {selectedContractForAction.contractorName}
                  </p>
                  <p>
                    <strong>Value:</strong>{" "}
                    {selectedContractForAction.contractValue}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {selectedContractForAction.startDate} to{" "}
                    {selectedContractForAction.endDate}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        selectedContractForAction.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : selectedContractForAction.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {selectedContractForAction.status}
                    </span>
                  </p>
                  <p>
                    <strong>Performance Score:</strong>{" "}
                    {selectedContractForAction.performanceScore}%
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Security & Verification
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Digital Signature:</strong>{" "}
                    {selectedContractForAction.digitalSignature}
                  </p>
                  <p>
                    <strong>Document Hash:</strong>{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {selectedContractForAction.documentHash}
                    </code>
                  </p>
                  <p>
                    <strong>Verification Status:</strong>{" "}
                    <span className="text-green-600">✓ Verified</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Detailed Milestones
              </h4>
              <div className="space-y-3">
                {selectedContractForAction.milestones.map(
                  (milestone, index) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">
                          {milestone.title}
                        </h5>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            milestone.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : milestone.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : milestone.status === "Overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {milestone.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>
                          Target Date: {milestone.targetDate}{" "}
                          {milestone.completionDate &&
                            `| Completed: ${milestone.completionDate}`}
                        </p>
                        <p>
                          Payment: {milestone.paymentPercentage}% |
                          Verification: {milestone.verificationStatus}
                        </p>
                        <p>Deliverables: {milestone.deliverables.join(", ")}</p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Update Modal */}
      {showMilestoneModal && selectedMilestone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value={selectedMilestone.status}>
                    {selectedMilestone.status}
                  </option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value={selectedMilestone.verificationStatus}>
                    {selectedMilestone.verificationStatus}
                  </option>
                  <option value="Not Started">Not Started</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
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
            <div className="flex items-center justify-between mb-3">
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
                <h4 className="font-medium text-gray-900 mb-2">
                  Payment Details
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Payment ID:</strong> {selectedPayment.id}
                  </p>
                  <p>
                    <strong>Invoice Number:</strong>{" "}
                    {selectedPayment.invoiceNumber}
                  </p>
                  <p>
                    <strong>Amount:</strong> {selectedPayment.amount}
                  </p>
                  <p>
                    <strong>Request Date:</strong> {selectedPayment.requestDate}
                  </p>
                  <p>
                    <strong>Current Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        selectedPayment.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : selectedPayment.status === "Approved"
                            ? "bg-blue-100 text-blue-800"
                            : selectedPayment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedPayment.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Action
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="approve">Approve Payment</option>
                  <option value="reject">Reject Payment</option>
                  <option value="process">Process Payment</option>
                  <option value="hold">Put on Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="wire">Wire Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Details
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter bank account details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Notes
                </label>
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
                ���� Digital Contract Generation & Execution
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
            <div className="mb-3">
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
                          contractStep >= item.step
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-20 h-0.5 mx-4 ${
                          contractStep > item.step
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Contract Details */}
            {contractStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Tender ID *
                    </label>
                    <select
                      value={contractFormData.tenderId}
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          tenderId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Tender</option>
                      {tenders
                        .filter((t) => t.status === "Awarded")
                        .map((tender) => (
                          <option key={tender.id} value={tender.id}>
                            {tender.id} - {tender.title}
                          </option>
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
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          contractorName: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          projectTitle: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          contractValue: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          startDate: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          endDate: e.target.value,
                        })
                      }
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
                    onChange={(e) =>
                      setContractFormData({
                        ...contractFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Detailed description of the project scope, deliverables, and expectations..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Terms & Conditions */}
            {contractStep === 2 && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Project Milestones
                  </h4>
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
                                const newMilestones = [
                                  ...contractFormData.milestones,
                                ];
                                newMilestones[index].title = e.target.value;
                                setContractFormData({
                                  ...contractFormData,
                                  milestones: newMilestones,
                                });
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
                                const newMilestones = [
                                  ...contractFormData.milestones,
                                ];
                                newMilestones[index].percentage = parseInt(
                                  e.target.value,
                                );
                                setContractFormData({
                                  ...contractFormData,
                                  milestones: newMilestones,
                                });
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
                                const newMilestones = [
                                  ...contractFormData.milestones,
                                ];
                                newMilestones[index].targetDate =
                                  e.target.value;
                                setContractFormData({
                                  ...contractFormData,
                                  milestones: newMilestones,
                                });
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
                                const newMilestones = [
                                  ...contractFormData.milestones,
                                ];
                                newMilestones[index].description =
                                  e.target.value;
                                setContractFormData({
                                  ...contractFormData,
                                  milestones: newMilestones,
                                });
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
                          {
                            title: "",
                            percentage: 0,
                            targetDate: "",
                            description: "",
                          },
                        ],
                      });
                    }}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Milestone
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Schedule
                    </label>
                    <select
                      value={contractFormData.paymentSchedule}
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          paymentSchedule: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setContractFormData({
                          ...contractFormData,
                          warranties: e.target.value,
                        })
                      }
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
                    onChange={(e) =>
                      setContractFormData({
                        ...contractFormData,
                        terms: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setContractFormData({
                        ...contractFormData,
                        penalties: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Define penalties for delays, non-compliance, or breach of contract..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Digital Features */}
            {contractStep === 3 && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    Digital Security & Automation Features
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id="digitalSignature"
                        checked={contractFormData.digitalSignature}
                        onChange={(e) =>
                          setContractFormData({
                            ...contractFormData,
                            digitalSignature: e.target.checked,
                          })
                        }
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="digitalSignature"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          ��� Advanced Digital Signatures
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Multi-party digital signatures with PKI encryption,
                          timestamping, and legal compliance.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id="blockchainVerification"
                        checked={contractFormData.blockchainVerification}
                        onChange={(e) =>
                          setContractFormData({
                            ...contractFormData,
                            blockchainVerification: e.target.checked,
                          })
                        }
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="blockchainVerification"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          ⛓️ Blockchain Verification
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Immutable contract storage on blockchain for
                          tamper-proof verification and audit trails.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id="autoExecution"
                        checked={contractFormData.autoExecution}
                        onChange={(e) =>
                          setContractFormData({
                            ...contractFormData,
                            autoExecution: e.target.checked,
                          })
                        }
                        className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="autoExecution"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          🤖 Smart Contract Auto-Execution
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Automated milestone verification and payment triggers
                          based on predefined conditions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-yellow-800">
                        Legal Compliance Notice
                      </h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Digital contracts generated through this system comply
                        with the Nigerian Electronic Transactions Act and Kano
                        State Procurement Law. All contracts are legally binding
                        and enforceable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      🛡️ Security Features
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• AES-256 encryption</li>
                      <li>�� Multi-factor authentication</li>
                      <li>• Audit trail logging</li>
                      <li>• IP geolocation tracking</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      ⚡ Automation Benefits
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>����� 90% faster processing</li>
                      <li>��� Reduced human errors</li>
                      <li>• Real-time notifications</li>
                      <li>��� Automatic compliance checks</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Generate & Execute */}
            {contractStep === 4 && (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Generate Digital Contract
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Review your contract details and generate the legally
                    binding digital contract.
                  </p>
                </div>

                {/* Contract Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Contract Summary
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Project:</strong> {contractFormData.projectTitle}
                    </div>
                    <div>
                      <strong>Contractor:</strong>{" "}
                      {contractFormData.contractorName}
                    </div>
                    <div>
                      <strong>Value:</strong> {contractFormData.contractValue}
                    </div>
                    <div>
                      <strong>Duration:</strong> {contractFormData.startDate} to{" "}
                      {contractFormData.endDate}
                    </div>
                    <div>
                      <strong>Milestones:</strong>{" "}
                      {contractFormData.milestones.length} phases
                    </div>
                    <div>
                      <strong>Payment:</strong>{" "}
                      {contractFormData.paymentSchedule}-based
                    </div>
                  </div>

                  <div className="mt-3 pt-4 border-t border-gray-200">
                    <h6 className="font-medium text-gray-900 mb-2">
                      Digital Features Enabled:
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {contractFormData.digitalSignature && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          🔐 Digital Signatures
                        </span>
                      )}
                      {contractFormData.blockchainVerification && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          ������ Blockchain Verified
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
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">
                        Generated Contract Document
                      </h5>
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
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {generatedContract}
                      </pre>
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
${contractFormData.milestones.map((m, i) => `${i + 1}. ${m.title} (${m.percentage}%) - Due: ${m.targetDate}`).join("\n")}

TERMS & CONDITIONS:
${contractFormData.terms}

PENALTIES:
${contractFormData.penalties}

DIGITAL FEATURES:
${contractFormData.digitalSignature ? "✓ Digital Signatures Enabled\n" : ""}${contractFormData.blockchainVerification ? "✓ Blockchain Verification Enabled\n" : ""}${contractFormData.autoExecution ? "✓ Smart Contract Auto-Execution Enabled\n" : ""}

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
            <div className="flex justify-between mt-3 pt-6 border-t border-gray-200">
              <button
                onClick={() =>
                  contractStep > 1 && setContractStep(contractStep - 1)
                }
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
                        alert("Contract executed successfully!");
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
            <div className="flex items-center justify-between mb-3">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispute Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter dispute title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispute Category
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the dispute in detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Resolution
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe your proposed resolution..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Mediator
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select Mediator</option>
                  <option value="procurement-board">
                    Kano State Procurement Review Board
                  </option>
                  <option value="legal-dept">Legal Department</option>
                  <option value="technical-committee">
                    Technical Committee
                  </option>
                  <option value="external-arbitrator">
                    External Arbitrator
                  </option>
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          View procurement analytics and generate reports for your ministry
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
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
                amount: "��650M",
                percentage: 27,
              },
              {
                category: "Medical Supplies",
                amount: "₦300M",
                percentage: 12,
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.category}</p>
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

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
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
                <span className="text-sm text-gray-700">{item.metric}</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {item.value}
                  </span>
                  <TrendingUp
                    className={`h-4 w-4 ${
                      item.trend === "up" ? "text-green-500" : "text-red-500"
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
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Download className="h-5 w-5 text-purple-600 mr-2" />
            Generate Reports
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <p className="text-sm text-gray-600 mb-3">{report.desc}</p>
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

  const renderNOCRequests = () => {
    const { ministry } = getMinistryMockData();
    return (
      <NOCRequestsModule
        ministryCode={ministry.code}
        ministryName={ministry.name}
      />
    );
  };

  const renderUserManagement = () => (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-amber-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-orange-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-rose-800 bg-clip-text text-transparent">
                    User Management System
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Complete user administration and role management platform
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
              <button
                onClick={handleCreateUser}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-lg inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Users
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {mdaUsers.length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Users
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {mdaUsers.filter((u) => u.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-orange-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Procurement Officers
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {
                  mdaUsers.filter((u) => u.role === "procurement_officer")
                    .length
                }
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Accountants
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                {mdaUsers.filter((u) => u.role === "accountant").length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg">
              <Calculator className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Users List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-amber-100">
        <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-600/5 to-orange-600/5">
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Ministry Users
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage user roles, permissions, and access levels
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-100">
            <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-red-100">
              {mdaUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-red-50/50 transition-colors duration-150"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.userId}
                      </div>
                      <div className="text-sm text-gray-500">
                        Added: {new Date(user.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.role.replace("_", " ").toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.department}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-xs space-y-1">
                      {user.permissions.canCreateTenders && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                          Create Tenders
                        </span>
                      )}
                      {user.permissions.canEvaluateBids && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                          Evaluate Bids
                        </span>
                      )}
                      {user.permissions.canViewFinancials && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-1">
                          View Financials
                        </span>
                      )}
                      {user.permissions.canGenerateReports && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-1">
                          Generate Reports
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-150"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`p-2 rounded-lg transition-all duration-150 ${
                          user.isActive
                            ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                            : "text-green-600 hover:text-green-800 hover:bg-green-50"
                        }`}
                        title={
                          user.isActive ? "Deactivate User" : "Activate User"
                        }
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-150"
                        title="Delete User"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mdaUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full w-20 h-20 mx-auto mb-4">
              <Users className="h-12 w-12 text-white mx-auto mt-2" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              No users found
            </h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Start by adding your first ministry user to begin managing roles
              and permissions.
            </p>
            <button
              onClick={handleCreateUser}
              className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg inline-flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First User
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (currentView === "overview") {
      return renderOverview();
    } else if (currentView === "companies") {
      return renderCompanies();
    } else if (currentView === "reports") {
      return <MinistryReports />;
    } else if (currentView === "noc") {
      return renderNOCRequests();
    } else if (currentView === "users") {
      return renderUserManagement();
    } else if (currentView === "procurement-planning") {
      return <ProcurementPlanning />;
    } else if (currentView === "tender-management") {
      return <TenderManagement />;
    } else if (currentView === "contract-management") {
      return <ContractManagement />;
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
              {/* Mobile Menu Toggle */}
              {isMobile && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        isMobileMenuOpen
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>
              )}

              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F6facb0e4b5694bbdb114af8656259028%2Fe2b03698f65d43d792efcb7e22009c33?format=webp&width=800"
                  alt="Kano State Government Logo"
                  className="h-10 w-10 rounded-lg object-cover"
                />
              </div>
              <div className={isMobile ? "hidden sm:block" : ""}>
                <h1 className="text-xl font-bold text-green-700">
                  {ministryInfo.name}
                </h1>
                <p className="text-xs text-gray-600">Ministry Dashboard</p>
              </div>
            </div>

            {/* Global Search */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies, tenders, contracts, NOCs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm bg-gray-50 hover:bg-white transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <div className="text-sm text-gray-600 mb-3">
                      Search results for "{searchTerm}"
                    </div>

                    {/* Companies Results */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <Circle className="h-4 w-4 mr-2 text-blue-600" />
                        Companies ({filteredCompanies.length})
                      </h4>
                      {filteredCompanies.slice(0, 3).map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => setCurrentView("companies")}
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Circle className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {company.companyName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {company.businessType}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredCompanies.length > 3 && (
                        <button
                          onClick={() => setCurrentView("companies")}
                          className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                        >
                          View all {filteredCompanies.length} companies
                        </button>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-teal-600" />
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="flex items-center p-2 hover:bg-gray-50 rounded-lg text-sm">
                          <Plus className="h-4 w-4 mr-2 text-emerald-600" />
                          Create Tender
                        </button>
                        <button className="flex items-center p-2 hover:bg-gray-50 rounded-lg text-sm">
                          <Send className="h-4 w-4 mr-2 text-cyan-600" />
                          Submit NOC
                        </button>
                        <button className="flex items-center p-2 hover:bg-gray-50 rounded-lg text-sm">
                          <FileText className="h-4 w-4 mr-2 text-purple-600" />
                          View Reports
                        </button>
                        <button className="flex items-center p-2 hover:bg-gray-50 rounded-lg text-sm">
                          <Users className="h-4 w-4 mr-2 text-rose-600" />
                          Manage Users
                        </button>
                      </div>
                    </div>

                    {searchTerm.length > 0 &&
                      filteredCompanies.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No results found for "{searchTerm}"</p>
                          <p className="text-sm">
                            Try different keywords or browse by category
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600 hover:text-teal-600 cursor-pointer transition-colors" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Modern Navigation */}
      <nav className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Desktop Navigation */}
            <div
              className={`${isMobile ? "hidden" : "flex"} space-x-2 overflow-x-auto py-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400`}
            >
              {[
                {
                  key: "overview",
                  label: "Overview",
                  icon: BarChart3,
                  gradient: "from-teal-600 to-cyan-600",
                  hoverGradient: "from-teal-50 to-cyan-50",
                  textColor: "text-teal-700",
                  borderColor: "border-teal-200",
                },
                {
                  key: "companies",
                  label: "Companies",
                  icon: Circle,
                  gradient: "from-blue-600 to-indigo-600",
                  hoverGradient: "from-blue-50 to-indigo-50",
                  textColor: "text-blue-700",
                  borderColor: "border-blue-200",
                },
                {
                  key: "procurement-planning",
                  label: "Procurement Planning",
                  icon: Target,
                  gradient: "from-emerald-600 to-teal-600",
                  hoverGradient: "from-emerald-50 to-teal-50",
                  textColor: "text-emerald-700",
                  borderColor: "border-emerald-200",
                },
                {
                  key: "tender-management",
                  label: "Tender Management",
                  icon: Gavel,
                  gradient: "from-blue-600 to-blue-700",
                  hoverGradient: "from-blue-50 to-blue-100",
                  textColor: "text-blue-700",
                  borderColor: "border-blue-200",
                },
                {
                  key: "noc",
                  label: "NOC Requests",
                  icon: Send,
                  gradient: "from-purple-600 to-violet-600",
                  hoverGradient: "from-purple-50 to-violet-50",
                  textColor: "text-purple-700",
                  borderColor: "border-purple-200",
                },
                {
                  key: "contract-management",
                  label: "Contract Management",
                  icon: Handshake,
                  gradient: "from-teal-600 to-blue-600",
                  hoverGradient: "from-teal-50 to-blue-50",
                  textColor: "text-teal-700",
                  borderColor: "border-teal-200",
                },
                {
                  key: "reports",
                  label: "Reports",
                  icon: TrendingUp,
                  gradient: "from-cyan-600 to-blue-600",
                  hoverGradient: "from-cyan-50 to-blue-50",
                  textColor: "text-cyan-700",
                  borderColor: "border-cyan-200",
                },
                {
                  key: "users",
                  label: "User Management",
                  icon: Users,
                  gradient: "from-amber-600 to-orange-600",
                  hoverGradient: "from-amber-50 to-orange-50",
                  textColor: "text-amber-700",
                  borderColor: "border-amber-200",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    handleViewChange(tab.key as CurrentView);
                  }}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 min-w-max relative overflow-hidden ${
                    currentView === tab.key
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg hover:shadow-xl transform hover:scale-105`
                      : `bg-white hover:bg-gradient-to-br hover:${tab.hoverGradient} ${tab.textColor} border ${tab.borderColor} hover:shadow-md hover:transform hover:scale-105 hover:border-opacity-50`
                  }`}
                >
                  {/* Background glow effect for active tab */}
                  {currentView === tab.key && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-20 blur-xl`}
                    ></div>
                  )}

                  {/* Icon with enhanced styling */}
                  <div
                    className={`relative z-10 p-1 rounded-lg ${
                      currentView === tab.key
                        ? "bg-white/20 backdrop-blur-sm"
                        : `bg-gradient-to-br ${tab.hoverGradient}`
                    }`}
                  >
                    <tab.icon
                      className={`h-5 w-5 ${
                        currentView === tab.key ? "text-white" : tab.textColor
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span className="relative z-10 font-medium">{tab.label}</span>

                  {/* Active indicator */}
                  {currentView === tab.key && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Scroll indicators */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-white via-white to-transparent w-8 h-full pointer-events-none"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-white via-white to-transparent w-8 h-full pointer-events-none"></div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobile && (
          <>
            {/* Overlay */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Mobile Drawer */}
            <div
              className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
            >
              <div className="p-6">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F6facb0e4b5694bbdb114af8656259028%2Fe2b03698f65d43d792efcb7e22009c33?format=webp&width=800"
                      alt="Kano State Government Logo"
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-green-700">
                        {ministryInfo.name}
                      </h2>
                      <p className="text-xs text-gray-600">
                        Ministry Dashboard
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile Navigation Items */}
                <div className="space-y-2">
                  {[
                    {
                      key: "overview",
                      label: "Overview",
                      icon: BarChart3,
                      gradient: "from-teal-600 to-cyan-600",
                    },
                    {
                      key: "companies",
                      label: "Companies",
                      icon: Circle,
                      gradient: "from-blue-600 to-indigo-600",
                    },
                    {
                      key: "procurement-planning",
                      label: "Procurement Planning",
                      icon: Target,
                      gradient: "from-emerald-600 to-teal-600",
                    },
                    {
                      key: "tender-management",
                      label: "Tender Management",
                      icon: Gavel,
                      gradient: "from-purple-600 to-violet-600",
                    },
                    {
                      key: "noc",
                      label: "NOC Requests",
                      icon: Send,
                      gradient: "from-cyan-600 to-blue-600",
                    },
                    {
                      key: "contract-management",
                      label: "Contract Management",
                      icon: Handshake,
                      gradient: "from-teal-600 to-blue-600",
                    },
                    {
                      key: "reports",
                      label: "Reports",
                      icon: TrendingUp,
                      gradient: "from-slate-600 to-gray-600",
                    },
                    {
                      key: "users",
                      label: "User Management",
                      icon: Users,
                      gradient: "from-rose-600 to-pink-600",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleViewChange(tab.key as CurrentView)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        currentView === tab.key
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <tab.icon
                        className={`h-5 w-5 ${currentView === tab.key ? "text-white" : "text-gray-600"}`}
                      />
                      <span className="font-medium">{tab.label}</span>
                      {isNavigationLoading && currentView === tab.key && (
                        <LoadingSpinner size="sm" className="ml-auto" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Mobile Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                      <Plus className="h-4 w-4 text-emerald-600" />
                      <span>Create Tender</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                      <Send className="h-4 w-4 text-cyan-600" />
                      <span>Submit NOC</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>View Reports</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      {/* Enhanced Committee Creation Modal */}
      {showCreateCommitteeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4xl max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {activeCommittee
                    ? "Edit Evaluation Committee"
                    : "Create Evaluation Committee"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateCommitteeModal(false);
                    if (!activeCommittee) {
                      setCommitteeFormData({
                        name: "",
                        chairperson: "",
                        secretary: "",
                        specialization: "",
                        members: [
                          {
                            name: "",
                            department: "",
                            role: "Member",
                            email: "",
                          },
                        ],
                      });
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Committee Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Committee Information
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Committee Name *
                    </label>
                    <input
                      type="text"
                      value={committeeFormData.name}
                      onChange={(e) =>
                        setCommitteeFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Medical Equipment Evaluation Committee"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chairperson *
                    </label>
                    <input
                      type="text"
                      value={committeeFormData.chairperson}
                      onChange={(e) =>
                        setCommitteeFormData((prev) => ({
                          ...prev,
                          chairperson: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Dr. Amina Hassan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secretary
                    </label>
                    <input
                      type="text"
                      value={committeeFormData.secretary}
                      onChange={(e) =>
                        setCommitteeFormData((prev) => ({
                          ...prev,
                          secretary: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Eng. Musa Ibrahim"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization Areas
                    </label>
                    <input
                      type="text"
                      value={committeeFormData.specialization}
                      onChange={(e) =>
                        setCommitteeFormData((prev) => ({
                          ...prev,
                          specialization: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Medical Equipment, Healthcare Technology"
                    />
                  </div>
                </div>

                {/* Committee Members */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">
                      Committee Members
                    </h4>
                    <button
                      type="button"
                      onClick={addCommitteeMember}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1 inline" />
                      Add Member
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {committeeFormData.members.map((member, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Member {index + 1}
                          </span>
                          {committeeFormData.members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCommitteeMember(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) =>
                              updateCommitteeMember(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Member Name"
                          />
                          <input
                            type="text"
                            value={member.department}
                            onChange={(e) =>
                              updateCommitteeMember(
                                index,
                                "department",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Department"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={member.role}
                              onChange={(e) =>
                                updateCommitteeMember(
                                  index,
                                  "role",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="Member">Member</option>
                              <option value="Technical Expert">
                                Technical Expert
                              </option>
                              <option value="Financial Analyst">
                                Financial Analyst
                              </option>
                              <option value="Legal Advisor">
                                Legal Advisor
                              </option>
                              <option value="Subject Matter Expert">
                                Subject Matter Expert
                              </option>
                            </select>
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) =>
                                updateCommitteeMember(
                                  index,
                                  "email",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Email (optional)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCommitteeModal(false);
                    if (!activeCommittee) {
                      setCommitteeFormData({
                        name: "",
                        chairperson: "",
                        secretary: "",
                        specialization: "",
                        members: [
                          {
                            name: "",
                            department: "",
                            role: "Member",
                            email: "",
                          },
                        ],
                      });
                    }
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCommittee}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {activeCommittee ? "Update Committee" : "Create Committee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Evaluation Modal */}
      {showFinalizeEvaluationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2xl max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Finalize Evaluation Process
                </h3>
                <button
                  onClick={() => setShowFinalizeEvaluationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Committee Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Committee Status
                  </h4>
                  {activeCommittee ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800">
                        Committee Active: {activeCommittee.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800">
                        No active committee assigned
                      </span>
                    </div>
                  )}
                </div>

                {/* Evaluation Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Evaluation Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">
                        Total Bidders:
                      </span>
                      <span className="ml-2 font-medium">{bidders.length}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Eligible Bidders:
                      </span>
                      <span className="ml-2 font-medium">
                        {
                          bidders.filter((b) => isVendorEligibleForAward(b.id))
                            .length
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Workspace:</span>
                      <span className="ml-2 font-medium">
                        {selectedWorkspace}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="ml-2 font-medium">
                        {isEvaluationFinalized ? "Finalized" : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-yellow-800">
                        Important Notice
                      </h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Finalizing the evaluation will lock all scores and make
                        the tender ready for award. This action cannot be undone
                        without creating a new evaluation process.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Finalization Requirements */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Finalization Requirements
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {activeCommittee ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          activeCommittee ? "text-green-800" : "text-red-800"
                        }
                      >
                        Evaluation committee assigned
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {bidders.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          bidders.length > 0 ? "text-green-800" : "text-red-800"
                        }
                      >
                        Bidders evaluated
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {bidders.filter((b) => isVendorEligibleForAward(b.id))
                        .length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={
                          bidders.filter((b) => isVendorEligibleForAward(b.id))
                            .length > 0
                            ? "text-green-800"
                            : "text-red-800"
                        }
                      >
                        At least one eligible bidder (NOC issued)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowFinalizeEvaluationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalizeEvaluation}
                  disabled={
                    !activeCommittee ||
                    bidders.filter((b) => isVendorEligibleForAward(b.id))
                      .length === 0
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="h-4 w-4 mr-2 inline" />
                  Finalize Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award Letter Generation Modal */}
      {showAwardLetterModal && awardLetterData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-6xl max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  📄 Generate Official Award Letter
                </h3>
                <button
                  onClick={() => {
                    setShowAwardLetterModal(false);
                    setAwardLetterData(null);
                    setSelectedTenderForLetter(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Letter Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Letter Preview
                  </h4>
                  <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto text-sm">
                    <div className="text-center border-b pb-4 mb-3">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets%2Fb1307220e8f44b74a0fd54f108089b3e%2F3954c90e53b64c33bfbc92f500570bbb?format=webp&width=800"
                          alt="Kano State Logo"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div className="font-bold text-green-700">
                        KANO STATE GOVERNMENT
                      </div>
                      <div className="font-bold text-green-700">
                        {ministryInfo.name.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {ministryInfo.address}
                        <br />
                        Tel: {ministryInfo.contactPhone}, Email:{" "}
                        {ministryInfo.contactEmail}
                      </div>
                    </div>

                    <div className="text-right mb-3">
                      <strong>Date:</strong> {awardLetterData.awardDate}
                      <br />
                      <strong>Ref No:</strong> {awardLetterData.refNumber}
                    </div>

                    <div className="mb-3">
                      <strong>TO:</strong> {awardLetterData.vendorName}
                      <br />
                      {awardLetterData.vendorAddress
                        .split("\n")
                        .map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                    </div>

                    <div className="mb-3">
                      <strong>
                        <u>
                          SUBJECT: AWARD OF CONTRACT –{" "}
                          {awardLetterData.tenderTitle}
                        </u>
                      </strong>
                    </div>

                    <div className="mb-3 text-justify">
                      Following the conclusion of the competitive procurement
                      process conducted in accordance with the provisions of the
                      Public Procurement Act 2007 and the Kano State Public
                      Procurement Guidelines, we are pleased to inform you that{" "}
                      <strong>{awardLetterData.vendorName}</strong>
                      has been selected as the successful bidder for the
                      above-mentioned project.
                    </div>

                    <div className="mb-3">
                      <strong>Contract Details:</strong>
                      <br />
                      <br />
                      <strong>Tender Reference:</strong>{" "}
                      {awardLetterData.tenderRef}
                      <br />
                      <strong>Project Title:</strong>{" "}
                      {awardLetterData.tenderTitle}
                      <br />
                      <strong>Contract Value:</strong>{" "}
                      {awardLetterData.contractValue} (
                      {awardLetterData.contractValueWords})<br />
                      <strong>Contract Duration:</strong>{" "}
                      {awardLetterData.contractDuration} months
                      <br />
                      <strong>Performance Bond:</strong>{" "}
                      {awardLetterData.performanceBond}% of contract value
                      <br />
                      <strong>Advance Payment:</strong>{" "}
                      {awardLetterData.advancePayment}% upon guarantee
                      submission
                      <br />
                      <strong>Warranty Period:</strong>{" "}
                      {awardLetterData.warrantyPeriod} months
                      <br />
                      <strong>Delivery Schedule:</strong>{" "}
                      {awardLetterData.deliveryScheduleSummary}
                    </div>

                    <div className="mb-3">
                      <strong>You are required to:</strong>
                      <br />
                      1. Confirm acceptance within{" "}
                      {awardLetterData.acceptanceDays} days
                      <br />
                      2. Submit required performance bond and documentation
                      <br />
                      3. Report to Procurement Department for contract signing
                    </div>

                    <div className="mt-3">
                      Yours faithfully,
                      <br />
                      <br />
                      _____________________________
                      <br />
                      {awardLetterData.ministerTitle}
                    </div>

                    <div className="mt-3 text-xs">
                      <strong>Cc:</strong> Director, Procurement Department;
                      Accountant General's Office; Project File
                    </div>
                  </div>
                </div>

                {/* Letter Details Form */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Letter Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contract Duration (months)
                      </label>
                      <input
                        type="number"
                        value={awardLetterData.contractDuration}
                        onChange={(e) =>
                          setAwardLetterData((prev) => ({
                            ...prev,
                            contractDuration: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Performance Bond (%)
                      </label>
                      <input
                        type="number"
                        value={awardLetterData.performanceBond}
                        onChange={(e) =>
                          setAwardLetterData((prev) => ({
                            ...prev,
                            performanceBond: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Advance Payment (%)
                      </label>
                      <input
                        type="number"
                        value={awardLetterData.advancePayment}
                        onChange={(e) =>
                          setAwardLetterData((prev) => ({
                            ...prev,
                            advancePayment: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warranty Period (months)
                      </label>
                      <input
                        type="number"
                        value={awardLetterData.warrantyPeriod}
                        onChange={(e) =>
                          setAwardLetterData((prev) => ({
                            ...prev,
                            warrantyPeriod: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Acceptance Period (days)
                      </label>
                      <input
                        type="number"
                        value={awardLetterData.acceptanceDays}
                        onChange={(e) =>
                          setAwardLetterData((prev) => ({
                            ...prev,
                            acceptanceDays: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Schedule
                      </label>
                      <textarea
                        value={awardLetterData.deliveryScheduleSummary}
                        onChange={(e) =>
                          setAwardLetterData((prev) => ({
                            ...prev,
                            deliveryScheduleSummary: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">
                        Document Information
                      </h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>
                          <strong>Reference:</strong>{" "}
                          {awardLetterData.refNumber}
                        </div>
                        <div>
                          <strong>Tender:</strong> {awardLetterData.tenderRef}
                        </div>
                        <div>
                          <strong>Date:</strong> {awardLetterData.awardDate}
                        </div>
                        <div>
                          <strong>Recipient:</strong>{" "}
                          {awardLetterData.vendorName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => {
                    setShowAwardLetterModal(false);
                    setAwardLetterData(null);
                    setSelectedTenderForLetter(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadAwardLetterPDF}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tender Selection Modal for Contract Creation */}
      {showTenderSelectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4xl max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Select Awarded Tender for Contract Creation
                </h3>
                <button
                  onClick={() => setShowTenderSelectionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  Choose from awarded tenders to automatically create a contract
                  with pre-filled information.
                </p>
              </div>

              {/* Awarded Tenders List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tenders.filter((tender) => tender.status === "Awarded")
                  .length > 0 ? (
                  tenders
                    .filter((tender) => tender.status === "Awarded")
                    .map((tender) => (
                      <div
                        key={tender.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all"
                        onClick={() => handleSelectAwardedTender(tender)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {tender.title}
                              </h4>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Awarded
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Tender ID</p>
                                <p className="font-medium">{tender.id}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Awarded Company</p>
                                <p className="font-medium">
                                  {tender.awardedCompany || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Award Value</p>
                                <p className="font-medium">
                                  {tender.awardAmount || tender.estimatedValue}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Award Date</p>
                                <p className="font-medium">
                                  {tender.awardDate || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Category</p>
                                <p className="font-medium">{tender.category}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Ministry</p>
                                <p className="font-medium">{tender.ministry}</p>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">
                                Description
                              </p>
                              <p className="text-sm">{tender.description}</p>
                            </div>
                          </div>

                          <div className="ml-4">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                              Create Contract
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No Awarded Tenders
                    </h4>
                    <p className="text-gray-600">
                      No tenders have been awarded yet. Complete the tender
                      evaluation and award process first.
                    </p>
                    <button
                      onClick={() => {
                        setShowTenderSelectionModal(false);
                        // Navigate to award section
                        setTenderSubView("award");
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Go to Award Tenders
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowTenderSelectionModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Award Workflow Modal */}
      {showPostAwardWorkflow && awardedTenderData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-5xl max-w-5xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  🎉 Post-Award Workflow - {awardedTenderData.tender.title}
                </h3>
                <button
                  onClick={() => setShowPostAwardWorkflow(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Award Summary */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-green-900">
                    Award Summary
                  </h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Awarded
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-green-600">Winning Vendor</p>
                    <p className="font-semibold text-green-900">
                      {awardedTenderData.selectedBidder.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Award Value</p>
                    <p className="font-semibold text-green-900">
                      {awardedTenderData.awardDetails.awardValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Award Date</p>
                    <p className="font-semibold text-green-900">
                      {awardedTenderData.tender.awardDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  Complete Post-Award Process
                </h4>

                {/* Step 1: Notify Successful Vendor */}
                <div
                  className={`border rounded-lg p-4 ${postAwardSteps.notifySuccessful ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {postAwardSteps.notifySuccessful ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900">
                          1. Notify Successful Vendor
                        </h5>
                        <p className="text-sm text-gray-600">
                          Send congratulations and next steps to{" "}
                          {awardedTenderData.selectedBidder.companyName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleNotifySuccessfulVendor}
                      disabled={postAwardSteps.notifySuccessful}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postAwardSteps.notifySuccessful
                        ? "Sent"
                        : "Send Notification"}
                    </button>
                  </div>
                </div>

                {/* Step 2: Notify Unsuccessful Vendors */}
                <div
                  className={`border rounded-lg p-4 ${postAwardSteps.notifyUnsuccessful ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {postAwardSteps.notifyUnsuccessful ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900">
                          2. Notify Unsuccessful Vendors
                        </h5>
                        <p className="text-sm text-gray-600">
                          Send polite rejection notices to{" "}
                          {awardedTenderData.unsuccessfulBidders.length}{" "}
                          unsuccessful vendors
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleNotifyUnsuccessfulVendors}
                      disabled={postAwardSteps.notifyUnsuccessful}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postAwardSteps.notifyUnsuccessful
                        ? "Sent"
                        : "Send Notifications"}
                    </button>
                  </div>
                </div>

                {/* Step 3: Publish OCDS */}
                <div
                  className={`border rounded-lg p-4 ${postAwardSteps.publishOCDS ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {postAwardSteps.publishOCDS ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900">
                          3. Publish on Transparency Portal (OCDS)
                        </h5>
                        <p className="text-sm text-gray-600">
                          Publish award details on Open Contracting Data
                          Standard portal
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handlePublishOCDS}
                      disabled={postAwardSteps.publishOCDS}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postAwardSteps.publishOCDS
                        ? "Published"
                        : "Publish to OCDS"}
                    </button>
                  </div>
                </div>

                {/* Step 4: Create Contract */}
                <div
                  className={`border rounded-lg p-4 ${postAwardSteps.createContract ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {postAwardSteps.createContract ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900">
                          4. Create Contract
                        </h5>
                        <p className="text-sm text-gray-600">
                          Generate contract entry in contract management system
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCreateContract}
                      disabled={postAwardSteps.createContract}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {postAwardSteps.createContract
                        ? "Created"
                        : "Create Contract"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowPostAwardWorkflow(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Continue Later
                </button>
                <button
                  onClick={completePostAwardWorkflow}
                  disabled={
                    !Object.values(postAwardSteps).every((step) => step)
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <MinistryUserForm
              mode="create"
              mdaId={getCurrentMDAId()}
              onSubmit={handleUserSubmit}
              onCancel={() => setShowCreateUserModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <MinistryUserForm
              mode="edit"
              mdaId={selectedUser.mdaId}
              initialData={{
                email: selectedUser.userId,
                displayName: selectedUser.userId,
                role: selectedUser.role,
                department: selectedUser.department,
                permissions: selectedUser.permissions,
              }}
              onSubmit={handleUserSubmit}
              onCancel={() => {
                setShowEditUserModal(false);
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
