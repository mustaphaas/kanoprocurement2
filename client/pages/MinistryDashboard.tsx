import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MDAUser, CreateMDAUserRequest, MDAUserPermissions } from "@shared/api";
import { getMinistryById, MinistryConfig } from "@shared/ministries";
import MDAUserForm from "@/components/MDAUserForm";
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
  | "noc"
  | "users";

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
  const [mdaUsers, setMDAUsers] = useState<MDAUser[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MDAUser | null>(null);
  const [userFormMode, setUserFormMode] = useState<"create" | "edit">("create");
  const [newNOCRequest, setNewNOCRequest] = useState({
    projectTitle: "",
    projectValue: "",
    contractorName: "",
    expectedDuration: "",
    projectDescription: "",
    justification: "",
  });
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
    {
      id: "BID-004",
      companyName: "Apex Medical Equipment Ltd",
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
      companyName: "Unity Health Systems",
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

  // Mock data initialization
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
      }
    };

    const mockCompanies = getMinistrySpecificCompanies();

    const getMinistrySpecificTenders = (): Tender[] => {
      switch (ministryId) {
        case "ministry2": // Ministry of Works
          return [
            {
              id: "MOWI-2024-001",
              title: "Kano-Kaduna Highway Rehabilitation",
              description: "Complete rehabilitation of 85km Kano-Kaduna highway section",
              category: "Road Construction",
              estimatedValue: "₦15,200,000,000",
              status: "Evaluated",
              publishDate: "2024-01-15",
              closeDate: "2024-02-15",
              bidsReceived: 6,
              ministry: ministry.name,
              procuringEntity: "Kano State Road Maintenance Agency",
            },
            {
              id: "MOWI-2024-002",
              title: "Construction of 5 New Bridges",
              description: "Construction of bridges across major rivers in Kano State",
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
              description: "Complete renovation of the Kano State Government Secretariat",
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
              description: "Construction of modern drainage system for Kano metropolis",
              category: "Infrastructure Development",
              estimatedValue: "₦12,300,000,000",
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
              description: "Procurement of construction equipment and machinery",
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
              description: "Supply of desks, chairs, and classroom furniture for 200 schools",
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
              description: "Development of digital learning platform for secondary schools",
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
              description: "Supply of laboratory equipment for 50 secondary schools",
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
              description: "Procurement of textbooks and library resources for all levels",
              category: "Educational Materials",
              estimatedValue: "₦1,650,000,000",
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
              description: "Comprehensive teacher training and capacity building program",
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
              description: "Supply of medical equipment for 5 primary healthcare centers",
              category: "Medical Equipment",
              estimatedValue: "₦850,000,000",
              status: "Evaluated",
              publishDate: "2024-01-15",
              closeDate: "2024-02-15",
              bidsReceived: 5,
              ministry: ministry.name,
              procuringEntity: "Kano State Primary Healthcare Development Agency",
            },
            {
              id: "MOH-2024-002",
              title: "Pharmaceutical Supply Contract",
              description: "Annual supply of essential medicines for state hospitals",
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
              description: "Procurement of advanced laboratory equipment for diagnostic centers",
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
              description: "Complete IT infrastructure upgrade for health facilities",
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
              description: "Annual supply of medical consumables for all health centers",
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
      {
        companyId: "BID-004",
        companyName: "Apex Medical Equipment Ltd",
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
        companyName: "Unity Health Systems",
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

    setCompanies(mockCompanies);
    setTenders(mockTenders);
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
  }, []);

  // Update bidders when workspace changes
  useEffect(() => {
    const bidderDataByWorkspace = {
      "MOH-2024-001": [
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
        {
          id: "BID-004",
          companyName: "Apex Medical Equipment Ltd",
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
          companyName: "Unity Health Systems",
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
          bidAmount: "₦1,450,000,000",
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

  const handleLogout = () => {
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
      setMDAUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert("User removed successfully!");
    }
  };

  const handleUserSubmit = async (data: CreateMDAUserRequest) => {
    try {
      if (userFormMode === "create") {
        const newUser: MDAUser = {
          id: `user-${Date.now()}`,
          mdaId: "mda-001", // Current ministry MDA ID
          userId: `usr-${Date.now()}`,
          role: data.role,
          department: data.department,
          permissions: data.permissions,
          assignedBy: "admin-001",
          assignedAt: new Date(),
          isActive: true,
        };
        setMDAUsers((prev) => [...prev, newUser]);
        alert("User created successfully!");
      } else if (selectedUser) {
        const updatedUser: MDAUser = {
          ...selectedUser,
          role: data.role,
          department: data.department,
          permissions: data.permissions,
        };
        setMDAUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? updatedUser : u)),
        );
        alert("User updated successfully!");
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
    setMDAUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
    );
    alert(`User has been ${user.isActive ? "deactivated" : "activated"}!`);
  };

  // NOC Request Functions
  const handleSubmitNOCRequest = () => {
    if (
      !newNOCRequest.projectTitle ||
      !newNOCRequest.contractorName ||
      !newNOCRequest.projectValue
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const nocRequest: NOCRequest = {
      id: `NOC-${Date.now()}`,
      projectTitle: newNOCRequest.projectTitle,
      requestDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      projectValue: newNOCRequest.projectValue,
      contractorName: newNOCRequest.contractorName,
      expectedDuration: newNOCRequest.expectedDuration,
    };

    setNOCRequests((prev) => [nocRequest, ...prev]);
    setNewNOCRequest({
      projectTitle: "",
      projectValue: "",
      contractorName: "",
      expectedDuration: "",
      projectDescription: "",
      justification: "",
    });
    setShowNOCRequest(false);
    alert("NOC Request submitted successfully!");
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

    setTenders((prev) =>
      prev.map((tender) =>
        tender.id === selectedTenderForAward.id ? updatedTender : tender,
      ),
    );

    // Store awarded tender data for post-award workflow
    setAwardedTenderData({
      tender: updatedTender,
      selectedBidder,
      unsuccessfulBidders: bidders.filter((b) => b.id !== selectedBidder.id),
      awardDetails: awardFormData,
    });

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
    setTenders((prev) =>
      prev.map((tender) =>
        tender.id === selectedWorkspace
          ? { ...tender, status: "Evaluated" as any }
          : tender,
      ),
    );

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
                    /[₦,]/g,
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
      ministerTitle:
        `Hon. Commissioner\n${ministryInfo.name}\nKano State Government`,
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
              <p className="text-sm font-medium text-gray-600">NOC Requests</p>
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
              <p className="text-sm font-medium text-gray-600">Total Bids</p>
              <p className="text-3xl font-bold text-purple-600">
                {tenders.reduce((sum, t) => sum + t.bidsReceived, 0)}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Contract Statistics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contract Overview
        </h2>
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
            <h2 className="text-lg font-semibold text-gray-900">NOC Status</h2>
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
              <p className="text-sm font-medium text-gray-600">Total Tenders</p>
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
                    (t) => t.status === "Closed" || t.status === "Evaluated",
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
                      <div className="text-sm text-gray-500">{tender.id}</div>
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
                        Close: {new Date(tender.closeDate).toLocaleDateString()}
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
                <option value="Medical Equipment">Medical Equipment</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Laboratory Equipment">
                  Laboratory Equipment
                </option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Healthcare Services">Healthcare Services</option>
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
                <option value="Direct Procurement">Direct Procurement</option>
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
          <h3 className="font-semibold text-gray-900 mb-2">Excel Template</h3>
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
          <h3 className="font-semibold text-gray-900 mb-2">CSV Template</h3>
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
                  <div className="text-sm text-gray-900">12 successful</div>
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
                  evaluationCommittees.filter((c) => c.status === "Active")
                    .length
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
                {bidEvaluations.filter((e) => e.status === "Final").length}
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
                {bidEvaluations.filter((e) => e.status === "Submitted").length}
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
        className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${
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
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                completed ? "text-green-800" : "text-red-800"
              }`}
            >
              {step}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                completed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {completed ? "Completed" : "Incomplete"}
            </span>
          </div>
          {date && (
            <div className="text-xs text-gray-600 mt-1">
              {completed ? `Completed: ${date}` : `Required for award`}
            </div>
          )}
          {details && (
            <div className="text-xs text-gray-600 mt-1">{details}</div>
          )}
        </div>
      </div>
    );
  };

  const renderActualEvaluation = () => {
    return (
      <div className="space-y-8">
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
          <div className="px-6 py-4 border-b border-gray-200">
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

          <div className="p-6">
            {activeCommittee ? (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
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

                <div className="mt-4 flex space-x-3">
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
              <div className="text-center py-8">
                <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Evaluation Committee
                </h3>
                <p className="text-gray-600 mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
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
          <div className="bg-white rounded-lg shadow-sm p-6 border">
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
          <div className="bg-white rounded-lg shadow-sm p-6 border">
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
          <div className="bg-white rounded-lg shadow-sm p-6 border">
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
          <div className="px-6 py-4 border-b border-gray-200">
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

          <div className="p-6">
            <div className="space-y-6">
              {bidders.map((bidder, index) => {
                const workflowStatus = getVendorWorkflowStatus(bidder.id);
                const isEligible = isVendorEligibleForAward(bidder.id);

                return (
                  <div key={bidder.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🏆 Award Tenders
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
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
                            <div className="mt-4">
                              <h5 className="text-xs font-medium text-gray-700 mb-2">
                                Vendor Workflow Status:
                              </h5>
                              <div className="grid grid-cols-1 gap-2">
                                {renderVendorWorkflowStep(
                                  "1. Company Registration",
                                  workflowStatus?.registrationCompleted ||
                                    false,
                                  workflowStatus?.registrationDate,
                                )}
                                {renderVendorWorkflowStep(
                                  "2. Login & Verification",
                                  workflowStatus?.loginVerificationCompleted ||
                                    false,
                                  workflowStatus?.verificationDate,
                                )}
                                {renderVendorWorkflowStep(
                                  "3. Bidding Process",
                                  workflowStatus?.biddingCompleted || false,
                                  workflowStatus?.bidSubmissionDate,
                                )}
                                {renderVendorWorkflowStep(
                                  "4. Tender Evaluation",
                                  workflowStatus?.evaluationCompleted || false,
                                  workflowStatus?.evaluationDate,
                                )}
                                {renderVendorWorkflowStep(
                                  "5. No Objection Certificate",
                                  workflowStatus?.nocIssued || false,
                                  workflowStatus?.nocIssuedDate,
                                  workflowStatus?.nocCertificateNumber
                                    ? `Certificate: ${workflowStatus.nocCertificateNumber}`
                                    : undefined,
                                )}
                              </div>
                            </div>

                            {/* Award Eligibility Summary */}
                            <div className="mt-4 pt-3 border-t border-gray-200">
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
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedTenderForDetails(tender);
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Awarded Tenders
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Generate and download official award letters for awarded tenders
              </p>
            </div>

            <div className="p-6">
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
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
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
                                    <li>��� Company Registration</li>
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
              <div className="mt-8 pt-6 border-t border-gray-200">
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
                  ��� Tender Details - {selectedTenderForDetails.title}
                </h3>
                <button
                  onClick={() => setShowTenderDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  ��� Evaluation Report - {selectedTenderForDetails.title}
                </h3>
                <button
                  onClick={() => setShowEvaluationReportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
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
                              <td className="px-6 py-4 whitespace-nowrap">
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
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {bidder.companyName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bidder.experience} experience
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {bidder.bidAmount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
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
                              <td className="px-6 py-4 whitespace-nowrap">
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
                              <td className="px-6 py-4 whitespace-nowrap">
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
                              <td className="px-6 py-4 whitespace-nowrap">
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
                        <li>• Experience & Expertise</li>
                        <li>• Technical Approach</li>
                        <li>• Quality Standards</li>
                        <li>• Certifications</li>
                        <li>
                          �� Previous contracts executed in the last 2 years
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
                  📥 Download Bids - {selectedTenderForDetails.title}
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            📄 Contract Management
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <li>��� 90% faster processing</li>
                      <li>• Reduced human errors</li>
                      <li>• Real-time notifications</li>
                      <li>��� Automatic compliance checks</li>
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
                    Review your contract details and generate the legally
                    binding digital contract.
                  </p>
                </div>

                {/* Contract Preview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-medium text-gray-900 mb-4">
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

                  <div className="mt-4 pt-4 border-t border-gray-200">
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
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          View procurement analytics and generate reports for your ministry
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
              <p className="text-sm font-medium text-gray-600">Approved</p>
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
                      <div className="text-sm text-gray-500">{request.id}</div>
                      <div className="text-sm text-gray-500">
                        Requested:{" "}
                        {new Date(request.requestDate).toLocaleDateString()}
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

  const renderUserManagement = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">Manage ministry users and their roles</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {mdaUsers.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {mdaUsers.filter((u) => u.isActive).length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Procurement Officers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  mdaUsers.filter((u) => u.role === "procurement_officer")
                    .length
                }
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accountants</p>
              <p className="text-2xl font-bold text-gray-900">
                {mdaUsers.filter((u) => u.role === "accountant").length}
              </p>
            </div>
            <Calculator className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Ministry Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
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
              {mdaUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.userId}
                      </div>
                      <div className="text-sm text-gray-500">
                        Added: {new Date(user.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.role.replace("_", " ").toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.department}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`${
                        user.isActive
                          ? "text-red-600 hover:text-red-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mdaUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by adding your first ministry user.
            </p>
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
    } else if (currentView === "tenders") {
      return renderTenders();
    } else if (currentView === "contracts") {
      return renderContracts();
    } else if (currentView === "reports") {
      return renderReports();
    } else if (currentView === "noc") {
      return renderNOCRequests();
    } else if (currentView === "users") {
      return renderUserManagement();
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

            {/* Empty space for better layout */}
            <div className="flex-1"></div>

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

      {/* Main Navigation - Similar to Super User Dashboard */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-3">
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "companies", label: "Companies", icon: Building2 },
              { key: "tenders", label: "Tenders", icon: FileText },
              { key: "contracts", label: "Contracts", icon: FileCheck },
              { key: "users", label: "User Management", icon: Users },
              { key: "reports", label: "Reports", icon: TrendingUp },
              { key: "noc", label: "NOC Requests", icon: Send },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setCurrentView(tab.key as CurrentView);
                  if (tab.key === "tenders") {
                    setTenderSubView("list");
                  }
                }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  currentView === tab.key
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div className="space-y-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Letter Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Letter Preview
                  </h4>
                  <div className="border rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto text-sm">
                    <div className="text-center border-b pb-4 mb-4">
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
                        Tel: {ministryInfo.contactPhone}, Email: {ministryInfo.contactEmail}
                      </div>
                    </div>

                    <div className="text-right mb-4">
                      <strong>Date:</strong> {awardLetterData.awardDate}
                      <br />
                      <strong>Ref No:</strong> {awardLetterData.refNumber}
                    </div>

                    <div className="mb-4">
                      <strong>TO:</strong> {awardLetterData.vendorName}
                      <br />
                      {awardLetterData.vendorAddress
                        .split("\n")
                        .map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                    </div>

                    <div className="mb-4">
                      <strong>
                        <u>
                          SUBJECT: AWARD OF CONTRACT –{" "}
                          {awardLetterData.tenderTitle}
                        </u>
                      </strong>
                    </div>

                    <div className="mb-4 text-justify">
                      Following the conclusion of the competitive procurement
                      process conducted in accordance with the provisions of the
                      Public Procurement Act 2007 and the Kano State Public
                      Procurement Guidelines, we are pleased to inform you that{" "}
                      <strong>{awardLetterData.vendorName}</strong>
                      has been selected as the successful bidder for the
                      above-mentioned project.
                    </div>

                    <div className="mb-4">
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

                    <div className="mb-4">
                      <strong>You are required to:</strong>
                      <br />
                      1. Confirm acceptance within{" "}
                      {awardLetterData.acceptanceDays} days
                      <br />
                      2. Submit required performance bond and documentation
                      <br />
                      3. Report to Procurement Department for contract signing
                    </div>

                    <div className="mt-8">
                      Yours faithfully,
                      <br />
                      <br />
                      _____________________________
                      <br />
                      {awardLetterData.ministerTitle}
                    </div>

                    <div className="mt-4 text-xs">
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
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
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
              <div className="space-y-6">
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

      {/* NOC Request Modal */}
      {showNOCRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  New NOC Request
                </h3>
                <button
                  onClick={() => setShowNOCRequest(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newNOCRequest.projectTitle}
                    onChange={(e) =>
                      setNewNOCRequest((prev) => ({
                        ...prev,
                        projectTitle: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter project title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Value *
                    </label>
                    <input
                      type="text"
                      value={newNOCRequest.projectValue}
                      onChange={(e) =>
                        setNewNOCRequest((prev) => ({
                          ...prev,
                          projectValue: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., ₦500,000,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Duration
                    </label>
                    <input
                      type="text"
                      value={newNOCRequest.expectedDuration}
                      onChange={(e) =>
                        setNewNOCRequest((prev) => ({
                          ...prev,
                          expectedDuration: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 12 months"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contractor Name *
                  </label>
                  <input
                    type="text"
                    value={newNOCRequest.contractorName}
                    onChange={(e) =>
                      setNewNOCRequest((prev) => ({
                        ...prev,
                        contractorName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter contractor/vendor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    value={newNOCRequest.projectDescription}
                    onChange={(e) =>
                      setNewNOCRequest((prev) => ({
                        ...prev,
                        projectDescription: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Brief description of the project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justification
                  </label>
                  <textarea
                    value={newNOCRequest.justification}
                    onChange={(e) =>
                      setNewNOCRequest((prev) => ({
                        ...prev,
                        justification: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Justification for NOC request"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNOCRequest(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNOCRequest}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Request
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
            <MDAUserForm
              mode="create"
              mdaId="mda-001"
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
            <MDAUserForm
              mode="edit"
              mdaId={selectedUser.mdaId}
              initialData={{
                email: selectedUser.userId,
                displayName: selectedUser.userId,
                role: selectedUser.role,
                department: selectedUser.department,
                permissions: selectedUser.permissions,
                mdaId: selectedUser.mdaId,
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
