import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { persistentStorage } from "@/lib/persistentStorage";
import { MINISTRIES, getAllMinistries } from "@shared/ministries";
import { mdaInitializer } from "@/lib/mdaInitializer";
import { mdaLocalStorageService } from "@/lib/mdaLocalStorage";
import { dynamicMDACreationService } from "@/lib/dynamicMDACreation";
import {
  auditLogStorage,
  logUserAction,
  AuditLogEntry,
  AuditLogFilter,
} from "@/lib/auditLogStorage";
import FirebaseStatus from "@/components/FirebaseStatus";
import DataManagement from "@/components/DataManagement";
import NoObjectionCertificate from "@/components/NoObjectionCertificate";
import MDAForm from "@/components/MDAForm";
import MDAAdminForm from "@/components/MDAAdminForm";
import MDAUserForm from "@/components/MDAUserForm";
import {
  MDA,
  MDAAdmin,
  MDAUser,
  CreateMDARequest,
  CreateMDAAdminRequest,
  CreateMDAUserRequest,
  MDASettings,
  MDAPermissions,
  MDAUserPermissions,
} from "@shared/api";
import {
  Building2,
  Users,
  User,
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
  Flag,
  CheckCircle2,
  MessageCircle,
  Pause,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  TrendingDown,
  ExternalLink,
  Bookmark,
  Copy,
  Trash2,
  MoreHorizontal,
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
  | "feedback"
  | "no-objection-certificate"
  | "mda-management"
  | "mda-testing";

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
  phone: string;
  registrationDate: string;
  status: "Pending" | "Approved" | "Suspended" | "Blacklisted";
  registrationNumber: string;
  businessType: string;
  address: string;
  documents: {
    incorporation: boolean;
    taxClearance: boolean;
    companyProfile: boolean;
    cacForm: boolean;
  };
  verificationStatus: {
    cac: "Pending" | "Verified" | "Failed";
    firs: "Pending" | "Verified" | "Failed";
  };
  lastActivity?: string;
  suspensionReason?: string;
  blacklistReason?: string;
}

// AuditLogEntry is now imported from auditLogStorage

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
  status:
    | "Draft"
    | "Published"
    | "Closed"
    | "Evaluated"
    | "Awarded"
    | "Cancelled";
  workflowStatus:
    | "Draft"
    | "Published"
    | "Bidding"
    | "Evaluation"
    | "NOC_Requested"
    | "NOC_Approved"
    | "Contract_Awarded"
    | "Completed";
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
  workflowStep: number; // 1=Registration, 2=Login, 3=Bidding, 4=Evaluation, 5=NOC, 6=Approval
  nocRequested?: boolean;
  nocApproved?: boolean;
  nocRequestDate?: string;
  nocApprovalDate?: string;
  nocReason?: string;
  evaluationCompleted?: boolean;
  finalApprovalRequired?: boolean;
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

  // Log tab navigation
  const handleTabChange = (newTab: ActiveTab) => {
    if (newTab !== activeTab) {
      logUserAction(
        "SuperUser",
        "super_admin",
        "TAB_NAVIGATION",
        `SuperUser Dashboard - ${newTab}`,
        `Navigated to ${newTab} tab`,
        "LOW",
        undefined,
        {
          previousTab: activeTab,
          newTab,
          navigationTime: new Date().toISOString(),
        },
      );
    }
    setActiveTab(newTab);
  };
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogFilter, setAuditLogFilter] = useState<AuditLogFilter>({});
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditDateFilter, setAuditDateFilter] = useState("");
  const [auditUserFilter, setAuditUserFilter] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState("");
  const [aiRecommendations, setAIRecommendations] = useState<
    AIRecommendation[]
  >([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [tenderEvaluations, setTenderEvaluations] = useState<
    TenderEvaluation[]
  >([]);
  const [vendorPerformances, setVendorPerformances] = useState<
    VendorPerformance[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [blacklistReason, setBlacklistReason] = useState("");
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showCreateTenderModal, setShowCreateTenderModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [activeEvaluationTender, setActiveEvaluationTender] =
    useState<Tender | null>(null);
  const [showEvaluationInterface, setShowEvaluationInterface] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedAwardTender, setSelectedAwardTender] = useState<Tender | null>(
    null,
  );
  const [awardFormData, setAwardFormData] = useState({
    winningCompany: "",
    awardAmount: "",
    awardDate: "",
    contractDuration: "",
    notifyWinner: true,
    notifyUnsuccessful: true,
    publishOCDS: true,
    initiatePerformanceTracking: true,
  });
  const [showDigitalSignModal, setShowDigitalSignModal] = useState(false);
  const [showAwardLetterModal, setShowAwardLetterModal] = useState(false);
  const [showUpdateProgressModal, setShowUpdateProgressModal] = useState(false);
  const [selectedVendorPerformance, setSelectedVendorPerformance] =
    useState<VendorPerformance | null>(null);
  const [digitalSignatureData, setDigitalSignatureData] = useState({
    certificateId: "",
    signatureMethod: "PKI", // PKI, HSM, or Cloud
    timestamp: "",
    signedHash: "",
    signedBy: "Super User",
    purpose: "",
    location: "Kano State Government",
    reason: "Official Contract Execution",
  });
  const [awardLetterData, setAwardLetterData] = useState({
    letterDate: "",
    referenceNumber: "",
    subject: "",
    recipientName: "",
    recipientAddress: "",
    contractDetails: "",
    terms: "",
    validity: "30",
    attachments: [],
  });
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
    additionalProcurementCategories: [],
  });

  // MDA Management state
  const [mdas, setMDAs] = useState<MDA[]>([]);
  const [mdaAdmins, setMDAAdmins] = useState<MDAAdmin[]>([]);
  const [mdaUsers, setMDAUsers] = useState<MDAUser[]>([]);
  const [showCreateMDAModal, setShowCreateMDAModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditMDAModal, setShowEditMDAModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedMDA, setSelectedMDA] = useState<MDA | null>(null);
  const [selectedMDAAdmin, setSelectedMDAAdmin] = useState<MDAAdmin | null>(
    null,
  );
  const [selectedMDAUser, setSelectedMDAUser] = useState<MDAUser | null>(null);
  const [mdaSearchTerm, setMDASearchTerm] = useState("");
  const [mdaFilterType, setMDAFilterType] = useState<
    "all" | "ministry" | "department" | "agency"
  >("all");
  const [mdaFormMode, setMDAFormMode] = useState<"create" | "edit">("create");
  const [adminFormMode, setAdminFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [userFormMode, setUserFormMode] = useState<"create" | "edit">("create");

  // Company approval state
  const [selectedCompanyForApproval, setSelectedCompanyForApproval] =
    useState<Company | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "details" | "approval">(
    "list",
  );
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [companyStatusFilter, setCompanyStatusFilter] = useState<string>("all");
  const [approvalDecision, setApprovalDecision] = useState<
    "Approved" | "Suspended" | "Blacklisted" | ""
  >("");
  const [actionReason, setActionReason] = useState("");
  const [sendNotification, setSendNotification] = useState(true);

  const navigate = useNavigate();

  // Initialize MDA system with localStorage
  const initializeMDASystem = useCallback(async () => {
    try {
      console.log("������ Initializing MDA system with localStorage...");

      // Initialize MDAs from static ministries if not already done
      await mdaInitializer.initialize();

      // Load MDAs from localStorage
      const loadedMDAs = await mdaLocalStorageService.getAllMDAs();
      setMDAs(loadedMDAs);

      // Load MDA admins
      const loadedAdmins = await mdaLocalStorageService.getMDAAdmins();
      setMDAAdmins(loadedAdmins);

      // Load MDA users
      const allUsers: (MDAUser & { user: EnhancedUserProfile })[] = [];
      for (const mda of loadedMDAs) {
        const mdaUsers = await mdaLocalStorageService.getMDAUsers(mda.id);
        allUsers.push(...mdaUsers);
      }
      setMDAUsers(allUsers);

      console.log("✅ MDA system initialized successfully with localStorage");
      console.log(
        `📊 Loaded: ${loadedMDAs.length} MDAs, ${loadedAdmins.length} admins, ${allUsers.length} users`,
      );
    } catch (error) {
      console.error("❌ MDA system initialization error:", error);
      // Fallback to static data
      const fallbackMDAs = mdaInitializer.getMinistryMDAs();
      setMDAs(fallbackMDAs);
    }
  }, []);

  // Load audit logs based on current filters
  const loadAuditLogs = useCallback(() => {
    const filter: AuditLogFilter = {};

    if (auditSearchTerm) filter.searchTerm = auditSearchTerm;
    if (auditDateFilter) filter.startDate = auditDateFilter;
    if (auditUserFilter && auditUserFilter !== "all")
      filter.user = auditUserFilter;
    if (auditActionFilter && auditActionFilter !== "all")
      filter.action = auditActionFilter;
    if (auditSeverityFilter && auditSeverityFilter !== "all")
      filter.severity = auditSeverityFilter;

    const logs = auditLogStorage.getLogs(filter, 100);
    setAuditLogs(logs);
  }, [
    auditSearchTerm,
    auditDateFilter,
    auditUserFilter,
    auditActionFilter,
    auditSeverityFilter,
  ]);

  // Update audit logs when filters change
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // Export audit logs
  const handleExportAuditLogs = () => {
    const csvData = auditLogStorage.exportLogs("csv");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Log the export action
    logUserAction(
      "SuperUser",
      "super_admin",
      "AUDIT_LOGS_EXPORTED",
      "Audit Log System",
      "Audit logs exported to CSV file",
      "MEDIUM",
      undefined,
      {
        exportFormat: "CSV",
        exportTime: new Date().toISOString(),
        totalRecords: auditLogs.length,
      },
    );
  };

  // Clear audit logs (for testing/maintenance)
  const handleClearAuditLogs = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all audit logs? This action cannot be undone.",
      )
    ) {
      auditLogStorage.clearAllLogs();
      loadAuditLogs();

      // Log the clear action (this will be the only log left)
      logUserAction(
        "SuperUser",
        "super_admin",
        "AUDIT_LOGS_CLEARED",
        "Audit Log System",
        "All audit logs have been cleared by SuperUser",
        "CRITICAL",
        undefined,
        {
          clearTime: new Date().toISOString(),
          reason: "Manual admin action",
        },
      );

      loadAuditLogs();
      alert("All audit logs have been cleared.");
    }
  };

  // Get audit log statistics
  const auditStats = auditLogStorage.getLogStats();

  // MDA Testing functions
  const handleCreateSampleMDAs = async () => {
    try {
      if (
        window.confirm(
          "This will create 4 sample MDAs with full functionality (Ministry of Agriculture, Urban Development Agency, IT Department, and Environment Ministry). Continue?",
        )
      ) {
        console.log("🚀 Creating sample MDAs...");
        const createdMDAs =
          await dynamicMDACreationService.createSampleMDAs("SuperUser");

        // Update the MDA list
        setMDAs((prev) => [...prev, ...createdMDAs]);

        alert(
          `Successfully created ${createdMDAs.length} sample MDAs with full ministry functionality!`,
        );
        console.log(
          "✅ Sample MDAs created:",
          createdMDAs.map((m) => m.name),
        );
      }
    } catch (error) {
      console.error("❌ Error creating sample MDAs:", error);
      alert("Error creating sample MDAs. Please try again.");
    }
  };

  const handleTestMDAFunctionality = (mda: MDA) => {
    const hasFunctionality = dynamicMDACreationService.hasMDAFunctionality(
      mda.id,
    );
    const configs = dynamicMDACreationService.getMDAConfigurations();
    const mdaConfig = configs.find((c) => c.mdaId === mda.id);

    const testResults = {
      name: mda.name,
      type: mda.type,
      hasFunctionality,
      features: mdaConfig?.features || "No functionality configured",
      tenderConfig: localStorage.getItem(`${mda.id}_tenders`)
        ? "Configured"
        : "Not configured",
      dashboardConfig: mdaConfig ? "Configured" : "Not configured",
      credentials: JSON.parse(
        localStorage.getItem("mdaCredentials") || "[]",
      ).find((c: any) => c.id === mda.id)
        ? "Created"
        : "Not created",
    };

    console.log("🧪 MDA Functionality Test Results:", testResults);
    alert(
      `MDA Functionality Test Results:\n\nMDA: ${testResults.name}\nType: ${testResults.type}\nFunctionality: ${testResults.hasFunctionality ? "Enabled" : "Disabled"}\nCredentials: ${testResults.credentials}\nDashboard: ${testResults.dashboardConfig}\nTender System: ${testResults.tenderConfig}`,
    );
  };

  const handleClearAllMDAs = async () => {
    if (
      window.confirm(
        "This will delete ALL MDAs and their configurations. This action cannot be undone. Continue?",
      )
    ) {
      try {
        // Clear all MDA-related localStorage
        localStorage.removeItem("mdas");
        localStorage.removeItem("mda_admins");
        localStorage.removeItem("mda_users");
        localStorage.removeItem("mdaCredentials");
        localStorage.removeItem("mdaDashboardConfigs");
        localStorage.removeItem("mdaTenderConfigs");
        localStorage.removeItem("mdaCategoryConfigs");
        localStorage.removeItem("mdaAdminStructures");

        // Clear individual MDA tender/bid data
        mdas.forEach((mda) => {
          localStorage.removeItem(`${mda.id}_tenders`);
          localStorage.removeItem(`${mda.id}_bids`);
          localStorage.removeItem(`${mda.id}_evaluations`);
        });

        // Reset MDA state
        setMDAs([]);
        setMDAAdmins([]);
        setMDAUsers([]);

        alert("All MDAs and configurations have been cleared!");
        console.log("����️ All MDA data cleared");
      } catch (error) {
        console.error("❌ Error clearing MDAs:", error);
        alert("Error clearing MDAs. Please try again.");
      }
    }
  };

  const handleMDAIntegrityCheck = () => {
    const mdaConfigs = dynamicMDACreationService.getMDAConfigurations();
    const credentials = JSON.parse(
      localStorage.getItem("mdaCredentials") || "[]",
    );

    const integrityReport = mdas.map((mda) => {
      const hasConfig = mdaConfigs.some((c) => c.mdaId === mda.id);
      const hasCredentials = credentials.some((c: any) => c.id === mda.id);
      const hasTenderSystem =
        localStorage.getItem(`${mda.id}_tenders`) !== null;

      return {
        name: mda.name,
        type: mda.type,
        hasConfig,
        hasCredentials,
        hasTenderSystem,
        isFullyFunctional: hasConfig && hasCredentials && hasTenderSystem,
      };
    });

    const fullyFunctional = integrityReport.filter(
      (r) => r.isFullyFunctional,
    ).length;
    const total = integrityReport.length;

    console.log("🔍 MDA Integrity Check Report:", integrityReport);
    alert(
      `MDA Integrity Check Complete:\n\nTotal MDAs: ${total}\nFully Functional: ${fullyFunctional}\nPartial/Broken: ${total - fullyFunctional}\n\nCheck console for detailed report.`,
    );
  };

  const handleCompanyStatusChange = useCallback(
    (
      companyId: string,
      newStatus: "Approved" | "Suspended" | "Blacklisted",
      reason: string,
    ) => {
      console.log("���� SuperUser handleCompanyStatusChange CALLED");
      console.log("📥 Parameters:", { companyId, newStatus, reason });

      // Find the company first
      const company = companies.find((c) => c.id === companyId);
      if (!company) {
        console.error(`❌ Company with ID ${companyId} not found!`);
        return;
      }

      console.log(`=== SUPERUSER STATUS CHANGE ===`);
      console.log(`Company: ${company.companyName}`);
      console.log(`Original Email: ${company.email}`);
      console.log(`Normalized Email: ${company.email.toLowerCase()}`);
      console.log(`New status: ${newStatus}`);

      // Update the company status in the local state FIRST
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, status: newStatus } : c)),
      );

      // Store the status change using persistent storage
      const storageKey = `userStatus_${company.email.toLowerCase()}`;
      const reasonKey = `userStatusReason_${company.email.toLowerCase()}`;

      console.log(`📦 Setting storage key: ${storageKey} = ${newStatus}`);

      persistentStorage.setItem(storageKey, newStatus);
      persistentStorage.setItem(reasonKey, reason);

      // Verify the storage was set correctly
      const verifyValue = persistentStorage.getItem(storageKey);
      console.log(`✅ Verification - stored value: ${verifyValue}`);

      if (verifyValue !== newStatus) {
        console.error(
          `❌ Storage verification failed! Expected: ${newStatus}, Got: ${verifyValue}`,
        );
      }

      // Debug the persistent storage state
      persistentStorage.debugInfo();

      // Log the status change action
      logUserAction(
        "SuperUser",
        "super_admin",
        newStatus === "Approved"
          ? "COMPANY_APPROVED"
          : newStatus === "Suspended"
            ? "COMPANY_SUSPENDED"
            : "COMPANY_BLACKLISTED",
        company.companyName,
        `Company status changed to ${newStatus}. Reason: ${reason}`,
        newStatus === "Blacklisted" ? "HIGH" : "MEDIUM",
        company.id,
        {
          previousStatus: company.status,
          newStatus,
          reason,
          email: company.email,
          actionTimestamp: new Date().toISOString(),
        },
      );

      // Reload audit logs to show the new entry
      loadAuditLogs();

      // Reset form
      setActionReason("");
      setApprovalDecision("");
      setSelectedCompanyForApproval(null);
      setViewMode("list");
    },
    [companies],
  );

  const dashboardStats: DashboardStats = {
    newRegistrationsPending: 4, // Including pending@company.com + 3 other mock companies
    activeTenders: 47,
    upcomingDeadlines: 8,
    awardedContractsToday: 3,
    awardedContractsWeek: 15,
    awardedContractsMonth: 68,
    totalContractValue: "₦15.7B",
  };

  // Mock data initialization
  useEffect(() => {
    const mockCompanies: Company[] = [
      // Company Approval Status - Approved
      {
        id: "1",
        companyName: "Approved Test Ltd",
        contactPerson: "Test User 1",
        email: "approved@company.com",
        status: "Active",
        registrationDate: "2024-01-15",
        lastActivity: "2024-01-22",
      },
      {
        id: "2",
        companyName: "Test Company Ltd",
        contactPerson: "Test User 2",
        email: "testcompany@example.com",
        status: "Active",
        registrationDate: "2024-01-14",
        lastActivity: "2024-01-21",
      },
      {
        id: "3",
        companyName: "Demo Company Ltd",
        contactPerson: "Demo User",
        email: "demo@company.com",
        status: "Active",
        registrationDate: "2024-01-13",
        lastActivity: "2024-01-20",
      },
      // Company Approval Status - Pending (Shows in Company Approval tab)
      {
        id: "4",
        companyName: "Pending Test Ltd",
        contactPerson: "Pending User",
        email: "pending@company.com",
        status: "Active", // Will show in Company Approval section as "Pending Review"
        registrationDate: "2024-01-29",
        lastActivity: "2024-01-29",
        pendingApproval: true, // Flag to indicate this shows in Company Approval
      },
      // Company Status - Suspended
      {
        id: "5",
        companyName: "Suspended Test Ltd",
        contactPerson: "Suspended User",
        email: "suspended@company.com",
        status: "Suspended",
        registrationDate: "2024-01-11",
        lastActivity: "2024-01-18",
        suspensionReason: "Expired compliance documents",
      },
      // Company Status - Blacklisted
      {
        id: "6",
        companyName: "Blacklisted Test Ltd",
        contactPerson: "Blacklisted User",
        email: "blacklisted@company.com",
        status: "Blacklisted",
        registrationDate: "2024-01-10",
        lastActivity: "2024-01-17",
        blacklistReason: "Failed to meet contract obligations",
      },
    ];

    // Initialize audit log system with sample data
    auditLogStorage.initializeSampleData();

    // Log dashboard access
    logUserAction(
      "SuperUser",
      "super_admin",
      "DASHBOARD_ACCESSED",
      "SuperUser Dashboard",
      "SuperUser accessed the main dashboard",
      "LOW",
      undefined,
      {
        accessTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
      },
    );

    // Load initial audit logs
    loadAuditLogs();

    const mockAIRecommendations: AIRecommendation[] = [
      {
        id: "1",
        type: "company",
        title: "High-performing companies for Healthcare Tender KS-2024-012",
        description:
          "Based on historical performance, these 5 companies are recommended for the upcoming healthcare equipment tender.",
        priority: "high",
        status: "new",
      },
      {
        id: "2",
        type: "compliance",
        title: "3 companies with expiring certificates",
        description:
          "Alert: 3 registered companies have certificates expiring within the next 30 days.",
        priority: "medium",
        status: "new",
      },
      {
        id: "3",
        type: "optimization",
        title: "Procurement cycle optimization opportunity",
        description:
          "Analysis suggests combining 3 similar tenders could reduce costs by 15% and improve efficiency.",
        priority: "low",
        status: "reviewed",
      },
    ];

    const mockTenders: Tender[] = [
      {
        id: "KS-2024-001",
        title: "Hospital Equipment Supply",
        description:
          "Supply of medical equipment for 5 primary healthcare centers",
        category: "Healthcare",
        ministry: "Ministry of Health",
        estimatedValue: "₦850M",
        status: "Published",
        workflowStatus: "Bidding",
        workflowStep: 3,
        publishDate: "2024-01-15",
        closeDate: "2024-02-15",
        bidsReceived: 12,
        ocdsReleased: true,
        addendaCount: 1,
        procuringEntity: "Kano State Primary Healthcare Development Agency",
      },
      {
        id: "KS-2024-002",
        title: "Road Construction Project",
        description: "Construction of 25km rural roads in Kano North LGA",
        category: "Infrastructure",
        ministry: "Ministry of Works",
        estimatedValue: "₦2.5B",
        status: "Closed",
        workflowStatus: "Evaluation",
        workflowStep: 4,
        publishDate: "2024-01-10",
        closeDate: "2024-01-25",
        openDate: "2024-01-26",
        bidsReceived: 8,
        ocdsReleased: true,
        addendaCount: 2,
        procuringEntity: "Kano State Ministry of Works",
        evaluationCompleted: true,
      },
      {
        id: "KS-2024-003",
        title: "ICT Infrastructure Upgrade",
        description:
          "Upgrade of government ICT infrastructure and network systems",
        category: "Technology",
        ministry: "Ministry of Science and Technology",
        estimatedValue: "₦1.2B",
        status: "Awarded",
        workflowStatus: "Contract_Awarded",
        workflowStep: 6,
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
        procuringEntity: "Kano State ICT Development Agency",
        evaluationCompleted: true,
        nocRequested: true,
        nocApproved: true,
        nocRequestDate: "2024-01-25",
        nocApprovalDate: "2024-01-28",
      },
      {
        id: "KS-2024-004",
        title: "Medical Equipment Supply",
        description:
          "Supply of advanced medical equipment for specialist units",
        category: "Healthcare",
        ministry: "Ministry of Health",
        estimatedValue: "₦950M",
        status: "Closed",
        workflowStatus: "NOC_Requested",
        workflowStep: 5,
        publishDate: "2024-01-12",
        closeDate: "2024-01-28",
        bidsReceived: 7,
        ocdsReleased: true,
        addendaCount: 1,
        procuringEntity: "Kano State Specialist Hospital",
        evaluationCompleted: true,
        nocRequested: true,
        nocRequestDate: "2024-01-30",
      },
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
        status: "Completed",
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
        status: "Completed",
      },
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
            description:
              "Complete assessment of existing network infrastructure",
            expectedDate: "2024-03-01",
            actualDate: "2024-02-28",
            status: "Completed",
            completionPercentage: 100,
            notes: "Completed ahead of schedule",
            documents: ["assessment_report.pdf"],
          },
          {
            id: "2",
            title: "Equipment Procurement",
            description: "Procure and deliver network equipment",
            expectedDate: "2024-04-15",
            status: "Pending",
            completionPercentage: 30,
            documents: [],
          },
        ],
        overallScore: 88,
        qualityScore: 90,
        timelinessScore: 85,
        budgetCompliance: 95,
        issues: [
          {
            id: "1",
            type: "Timeline",
            description:
              "Minor delay in equipment delivery due to supplier issues",
            severity: "Low",
            reportedDate: "2024-03-15",
            status: "Resolved",
            resolvedDate: "2024-03-18",
            actionTaken: "Alternative supplier sourced",
          },
        ],
        status: "Active",
      },
    ];

    // Initialize MDAs from static ministry configuration
    const initializeMDAFromMinistries = (): MDA[] => {
      const ministries = getAllMinistries();
      return ministries.map((ministry, index) => ({
        id: ministry.id,
        name: ministry.name,
        type: "ministry" as const,
        description: ministry.description,
        contactEmail: ministry.contactEmail,
        contactPhone: ministry.contactPhone,
        address: ministry.address,
        headOfMDA:
          index === 0
            ? "Dr. Amina Kano"
            : index === 1
              ? "Engr. Musa Abdullahi"
              : "Prof. Muhammad Usman",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
        settings: {
          procurementThresholds: {
            level1: 5000000,
            level2: 25000000,
            level3: 100000000,
          },
          allowedCategories: ministry.specializations,
          customWorkflows: true,
          budgetYear: "2024",
          totalBudget:
            index === 0 ? 5000000000 : index === 1 ? 8500000000 : 8000000000, // Different budgets per ministry
        },
      }));
    };

    const mockMDAs: MDA[] = initializeMDAFromMinistries();

    const mockMDAAdmins: MDAAdmin[] = [
      {
        id: "admin-001",
        mdaId: "ministry", // Ministry of Health
        userId: "user-001",
        role: "mda_super_admin",
        permissions: {
          canCreateUsers: true,
          canManageTenders: true,
          canApproveContracts: true,
          canViewReports: true,
          canManageSettings: true,
          maxApprovalAmount: 50000000,
        },
        assignedBy: "superuser-001",
        assignedAt: new Date("2024-01-02"),
        isActive: true,
      },
      {
        id: "admin-002",
        mdaId: "ministry2", // Ministry of Works and Infrastructure
        userId: "user-002",
        role: "mda_admin",
        permissions: {
          canCreateUsers: true,
          canManageTenders: true,
          canApproveContracts: false,
          canViewReports: true,
          canManageSettings: false,
          maxApprovalAmount: 10000000,
        },
        assignedBy: "superuser-001",
        assignedAt: new Date("2024-01-03"),
        isActive: true,
      },
      {
        id: "admin-003",
        mdaId: "ministry3", // Ministry of Education
        userId: "user-003",
        role: "mda_admin",
        permissions: {
          canCreateUsers: true,
          canManageTenders: true,
          canApproveContracts: false,
          canViewReports: true,
          canManageSettings: false,
          maxApprovalAmount: 15000000,
        },
        assignedBy: "superuser-001",
        assignedAt: new Date("2024-01-04"),
        isActive: true,
      },
    ];

    const mockMDAUsers: MDAUser[] = [
      {
        id: "mdauser-001",
        mdaId: "ministry", // Ministry of Health
        userId: "usr-001",
        role: "procurement_officer",
        department: "Medical Services",
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
        mdaId: "ministry", // Ministry of Health
        userId: "usr-002",
        role: "evaluator",
        department: "Public Health",
        permissions: {
          canCreateTenders: false,
          canEvaluateBids: true,
          canViewFinancials: false,
          canGenerateReports: true,
          accessLevel: "read",
        },
        assignedBy: "admin-001",
        assignedAt: new Date("2024-01-06"),
        isActive: true,
      },
      {
        id: "mdauser-003",
        mdaId: "ministry2", // Ministry of Works and Infrastructure
        userId: "usr-003",
        role: "procurement_officer",
        department: "Road Construction",
        permissions: {
          canCreateTenders: true,
          canEvaluateBids: true,
          canViewFinancials: true,
          canGenerateReports: true,
          accessLevel: "write",
        },
        assignedBy: "admin-002",
        assignedAt: new Date("2024-01-07"),
        isActive: true,
      },
      {
        id: "mdauser-004",
        mdaId: "ministry3", // Ministry of Education
        userId: "usr-004",
        role: "procurement_officer",
        department: "Basic Education",
        permissions: {
          canCreateTenders: true,
          canEvaluateBids: true,
          canViewFinancials: true,
          canGenerateReports: true,
          accessLevel: "write",
        },
        assignedBy: "admin-003",
        assignedAt: new Date("2024-01-08"),
        isActive: true,
      },
    ];

    // Load companies with AdminDashboard-compatible format and sync with persistent storage
    const loadCompanies = () => {
      // Load registered companies from localStorage
      const registeredCompanies = JSON.parse(
        localStorage.getItem("registeredCompanies") || "[]",
      );

      // Convert registered companies to dashboard format
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
          registrationNumber: reg.registrationNumber || `RC${Date.now()}`,
          businessType: reg.businessType || "Limited Liability Company",
          address: reg.address || "",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Pending" as const,
            firs: "Pending" as const,
          },
        }),
      );

      // Test companies that sync with AdminDashboard
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
          registrationNumber: "RC123456",
          businessType: "Limited Liability Company",
          address: "123 Ahmadu Bello Way, Kano",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified" as const,
            firs: "Pending" as const,
          },
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
          registrationNumber: "RC345678",
          businessType: "Limited Liability Company",
          address: "78 Independence Road, Kano",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified" as const,
            firs: "Verified" as const,
          },
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
          registrationNumber: "RC456789",
          businessType: "Limited Liability Company",
          address: "12 Engineering Close, Kano",
          documents: {
            incorporation: true,
            taxClearance: false,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified" as const,
            firs: "Failed" as const,
          },
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
          registrationNumber: "RC567890",
          businessType: "Limited Liability Company",
          address: "56 Industrial Layout, Kano",
          documents: {
            incorporation: true,
            taxClearance: true,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Verified" as const,
            firs: "Verified" as const,
          },
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
          registrationNumber: "RC678901",
          businessType: "Limited Liability Company",
          address: "90 New GRA, Kano",
          documents: {
            incorporation: true,
            taxClearance: false,
            companyProfile: true,
            cacForm: true,
          },
          verificationStatus: {
            cac: "Pending" as const,
            firs: "Pending" as const,
          },
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

      setCompanies(allCompanies);
    };

    loadCompanies();

    // Note: Audit logs are now loaded separately using loadAuditLogs()
    setAIRecommendations(mockAIRecommendations);
    setTenders(mockTenders);
    setTenderEvaluations(mockTenderEvaluations);
    setVendorPerformances(mockVendorPerformances);
    // Note: MDA data is loaded from localStorage in separate useEffect, not from mock data
    // setMDAs(mockMDAs); // REMOVED: Conflicts with localStorage MDA system
    // setMDAAdmins(mockMDAAdmins); // REMOVED: Conflicts with localStorage MDA system
    // setMDAUsers(mockMDAUsers); // REMOVED: Conflicts with localStorage MDA system

    // Note: MDA system initialization moved to separate useEffect for better dependency management

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith("userStatus_") && event.newValue) {
        console.log(
          "🔄 localStorage change detected in SuperUserDashboard:",
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
                "✅ Updating company status:",
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

          console.log(
            "📊 Updated companies:",
            updatedCompanies.map((c) => ({
              name: c.companyName,
              status: c.status,
            })),
          );
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
          "🔄 Custom storage change detected in SuperUserDashboard:",
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

    // Refresh company data every 30 seconds to sync with AdminDashboard changes
    const interval = setInterval(loadCompanies, 30000);

    // Additional polling for status changes (faster sync)
    const syncInterval = setInterval(() => {
      console.log("🔄 SuperUserDashboard: Checking for status changes...");
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
            "✅ SuperUserDashboard: Updated company statuses via polling",
          );
        }

        return hasChanges ? updatedCompanies : prevCompanies;
      });
    }, 3000); // Check every 3 seconds

    // Global test functions for audit logs
    (window as any).testAuditLogs = () => {
      console.log("=== TESTING AUDIT LOG SYSTEM ===");

      // Add a test log entry
      logUserAction(
        "TestUser",
        "admin",
        "TEST_ACTION",
        "Test Entity",
        "This is a test audit log entry",
        "HIGH",
        "test-entity-123",
        { testData: "sample metadata" },
      );

      console.log("✅ Test audit log added");
      loadAuditLogs();

      // Show stats
      const stats = auditLogStorage.getLogStats();
      console.log("📊 Audit log statistics:", stats);
    };

    (window as any).clearAuditLogs = () => {
      if (window.confirm("Clear all audit logs?")) {
        auditLogStorage.clearAllLogs();
        loadAuditLogs();
        console.log("🗑️ All audit logs cleared");
      }
    };

    (window as any).showAuditStats = () => {
      const stats = auditLogStorage.getLogStats();
      console.log("📊 Current audit log statistics:", stats);
    };

    // Global test function for company approval sync
    (window as any).testSuperUserApproval = () => {
      console.log("=== TESTING SUPERUSER COMPANY APPROVAL SYNC ===");
      const pendingCompany = companies.find(
        (c) => c.email === "pending@company.com",
      );
      if (pendingCompany) {
        console.log("📋 Found pending company:", pendingCompany);
        console.log("📊 Current status:", pendingCompany.status);
        console.log("🔄 Attempting to approve from SuperUser...");
        handleCompanyStatusChange(
          pendingCompany.id,
          "Approved",
          "Test approval from superuser",
        );
      } else {
        console.log("❌ pending@company.com not found");
        console.log(
          "📋 Available companies:",
          companies.map((c) => ({ email: c.email, status: c.status })),
        );
      }
    };

    // Test Northern Construction approval
    (window as any).testNorthernApproval = () => {
      console.log("=== TESTING NORTHERN CONSTRUCTION APPROVAL ===");
      const northernCompany = companies.find(
        (c) => c.email === "ahmad@northernconstruction.com",
      );
      if (northernCompany) {
        console.log("📋 Found Northern Construction:", northernCompany);
        console.log("📊 Current status:", northernCompany.status);
        console.log("🔄 Attempting to approve from SuperUser...");
        handleCompanyStatusChange(
          northernCompany.id,
          "Approved",
          "Test approval from superuser",
        );
      } else {
        console.log("❌ Northern Construction not found");
        console.log(
          "📋 Available companies:",
          companies.map((c) => ({
            email: c.email,
            name: c.companyName,
            status: c.status,
          })),
        );
      }
    };

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "persistentStorageChange",
        handleCustomStorageChange,
      );
      delete (window as any).testAuditLogs;
      delete (window as any).clearAuditLogs;
      delete (window as any).showAuditStats;
      delete (window as any).testSuperUserApproval;
      delete (window as any).testNorthernApproval;
    };
  }, [handleCompanyStatusChange]);

  // Separate useEffect for MDA system initialization
  useEffect(() => {
    const initMDASystem = async () => {
      try {
        await initializeMDASystem();
      } catch (error) {
        console.error("Failed to initialize MDA system:", error);
      }
    };

    initMDASystem();
  }, []); // Empty dependency array - run only once

  const handleLogout = () => {
    // Log logout action
    logUserAction(
      "SuperUser",
      "super_admin",
      "USER_LOGOUT",
      "SuperUser Dashboard",
      "SuperUser logged out of the system",
      "LOW",
      undefined,
      {
        logoutTime: new Date().toISOString(),
        sessionDuration: "N/A", // Could calculate actual session duration
      },
    );

    navigate("/");
  };

  const handleStartEvaluation = (tender: Tender) => {
    setActiveEvaluationTender(tender);
    setShowEvaluationInterface(true);
    // Scroll to evaluation interface
    setTimeout(() => {
      const element = document.getElementById("evaluation-interface");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleCompleteEvaluation = (evaluationId: string) => {
    setTenderEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, status: "Completed" as const }
          : evaluation,
      ),
    );
  };

  const handleFlagBid = (evaluationId: string, reason: string) => {
    setTenderEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, status: "Flagged" as const, flagReason: reason }
          : evaluation,
      ),
    );
  };

  const handleBlacklistCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowBlacklistModal(true);
  };

  const handleAwardTender = (tender: Tender) => {
    // Check if NOC has been approved before allowing award
    if (!tender.nocApproved) {
      alert(
        "Error: No Objection Certificate (NOC) must be approved before awarding the tender.",
      );
      return;
    }

    if (tender.workflowStatus !== "NOC_Approved") {
      alert(
        "Error: Tender workflow must complete NOC approval step before award.",
      );
      return;
    }

    setSelectedAwardTender(tender);
    setAwardFormData({
      winningCompany: "",
      awardAmount: "",
      awardDate: new Date().toISOString().split("T")[0],
      contractDuration: "",
      notifyWinner: true,
      notifyUnsuccessful: true,
      publishOCDS: true,
      initiatePerformanceTracking: true,
    });
    setShowAwardModal(true);
  };

  const handleSubmitAward = () => {
    if (
      !selectedAwardTender ||
      !awardFormData.winningCompany ||
      !awardFormData.awardAmount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Update the tender with award information
    setTenders((prev) =>
      prev.map((tender) =>
        tender.id === selectedAwardTender.id
          ? {
              ...tender,
              status: "Awarded" as const,
              awardedCompany: awardFormData.winningCompany.split(" (")[0], // Extract company name
              awardAmount: awardFormData.awardAmount,
              awardDate: awardFormData.awardDate,
            }
          : tender,
      ),
    );

    // Log the tender award action
    logUserAction(
      "SuperUser",
      "super_admin",
      "TENDER_AWARDED",
      selectedAwardTender.title,
      `Tender awarded to ${awardFormData.winningCompany.split(" (")[0]} for ${awardFormData.awardAmount}`,
      "HIGH",
      selectedAwardTender.id,
      {
        awardedCompany: awardFormData.winningCompany.split(" (")[0],
        awardAmount: awardFormData.awardAmount,
        awardDate: awardFormData.awardDate,
        contractDuration: awardFormData.contractDuration,
        notifyWinner: awardFormData.notifyWinner,
        notifyUnsuccessful: awardFormData.notifyUnsuccessful,
        publishOCDS: awardFormData.publishOCDS,
      },
    );

    // Reload audit logs
    loadAuditLogs();

    // Close modal and reset form
    setShowAwardModal(false);
    setSelectedAwardTender(null);
    setAwardFormData({
      winningCompany: "",
      awardAmount: "",
      awardDate: "",
      contractDuration: "",
      notifyWinner: true,
      notifyUnsuccessful: true,
      publishOCDS: true,
      initiatePerformanceTracking: true,
    });

    alert(
      "Tender awarded successfully! Notifications sent and OCDS data published.",
    );

    // Log successful completion
    logUserAction(
      "SuperUser",
      "super_admin",
      "TENDER_AWARD_COMPLETED",
      selectedAwardTender.title,
      "Tender award process completed successfully. Notifications sent and OCDS published.",
      "MEDIUM",
      selectedAwardTender.id,
    );
  };

  const handleSignContract = (tender: Tender) => {
    // Ensure NOC is approved before contract signing
    if (!tender.nocApproved) {
      alert(
        "Error: Contract cannot be signed. No Objection Certificate (NOC) must be approved first.",
      );
      return;
    }

    if (
      tender.workflowStatus !== "NOC_Approved" &&
      tender.workflowStatus !== "Contract_Awarded"
    ) {
      alert("Error: NOC approval is required before contract signing.");
      return;
    }

    setSelectedAwardTender(tender);
    setShowContractModal(true);
  };

  const handleSubmitContract = () => {
    if (!selectedAwardTender) return;

    // Update tender status to include contract signed
    setTenders((prev) =>
      prev.map((tender) =>
        tender.id === selectedAwardTender.id
          ? {
              ...tender,
              status: "Awarded" as const,
              // Add contract signed flag or additional status
            }
          : tender,
      ),
    );

    setShowContractModal(false);
    setSelectedAwardTender(null);
    alert("Contract signed successfully! Performance tracking initiated.");
  };

  const generateDigitalSignature = () => {
    // Simulate digital signature generation
    const timestamp = new Date().toISOString();
    const contractHash = `SHA256-${Math.random().toString(36).substring(2, 15)}`;
    const digitalSignature = `DS-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

    setDigitalSignatureData((prev) => ({
      ...prev,
      timestamp,
      signedHash: contractHash,
      certificateId: `CERT-KS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    }));

    return {
      signature: digitalSignature,
      timestamp,
      hash: contractHash,
      valid: true,
    };
  };

  const handleDigitalSign = () => {
    if (!selectedAwardTender) return;

    const signature = generateDigitalSignature();

    // Update tender with digital signature
    setTenders((prev) =>
      prev.map((tender) =>
        tender.id === selectedAwardTender.id
          ? {
              ...tender,
              status: "Awarded" as const,
              digitalSignature: signature,
              contractSigned: true,
              signedDate: new Date().toISOString(),
            }
          : tender,
      ),
    );

    setShowDigitalSignModal(false);
    setSelectedAwardTender(null);
    alert(
      "Contract digitally signed successfully! Digital certificate generated and blockchain recorded.",
    );
  };

  const generateAwardLetter = (tender: Tender) => {
    // Mandatory NOC approval check before generating award letter
    if (!tender.nocApproved) {
      alert(
        "Error: E-Award Letter cannot be generated. No Objection Certificate (NOC) must be approved first.",
      );
      return;
    }

    if (
      tender.workflowStatus !== "NOC_Approved" &&
      tender.workflowStatus !== "Contract_Awarded"
    ) {
      alert("Error: NOC approval is required before generating award letter.");
      return;
    }

    const currentDate = new Date();
    const referenceNumber = `KSG/BPP/${currentDate.getFullYear()}/${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(3, "0")}`;

    setAwardLetterData({
      letterDate: currentDate.toISOString().split("T")[0],
      referenceNumber,
      subject: `AWARD OF CONTRACT - ${tender.title.toUpperCase()}`,
      recipientName: tender.awardedCompany || "Selected Contractor",
      recipientAddress: "", // Would be fetched from company database
      contractDetails: `Contract Value: ${tender.awardAmount || tender.estimatedValue}\nProject: ${tender.title}\nDuration: ${awardFormData.contractDuration || "As specified"}\nCommencement: ${awardFormData.awardDate}`,
      terms: "Standard government contract terms and conditions apply",
      validity: "30",
      attachments: [
        "Contract Document",
        "Technical Specifications",
        "Terms & Conditions",
      ],
    });

    setSelectedAwardTender(tender);
    setShowAwardLetterModal(true);
  };

  const sendEAwardLetter = () => {
    if (!selectedAwardTender) return;

    // Simulate email sending and document generation
    const documentId = `AWD-${Date.now()}`;

    alert(`E-Award Letter Generated and Sent Successfully!

📄 Document ID: ${documentId}
📧 Sent to: ${selectedAwardTender.awardedCompany}
🔐 Digital Signature: Applied
📋 Reference: ${awardLetterData.referenceNumber}
🕐 Validity: ${awardLetterData.validity} days

The award letter has been:
✅ Digitally signed with government certificate
✅ Sent via secure email
✅ Logged in blockchain for integrity
��� Copied to procurement records`);

    setShowAwardLetterModal(false);
    setSelectedAwardTender(null);
  };

  const handleUpdateProgress = (performance: VendorPerformance) => {
    setSelectedVendorPerformance(performance);
    setShowUpdateProgressModal(true);
  };

  const updateVendorPerformance = (updatedPerformance: VendorPerformance) => {
    setVendorPerformances((prev) =>
      prev.map((perf) =>
        perf.id === updatedPerformance.id ? updatedPerformance : perf,
      ),
    );
    setShowUpdateProgressModal(false);
    setSelectedVendorPerformance(null);
    alert("Vendor performance updated successfully!");
  };

  // Workflow Management Functions
  const getWorkflowStepName = (step: number) => {
    const steps = {
      1: "Company Registration",
      2: "Company Login & Verification",
      3: "Bidding Process",
      4: "Tender Evaluation",
      5: "No Objection Certificate",
      6: "Final Approval & Award",
    };
    return steps[step as keyof typeof steps] || "Unknown Step";
  };

  const canProceedToNextStep = (tender: Tender, currentStep: number) => {
    switch (currentStep) {
      case 1: // Registration complete
        return true; // Companies can always register
      case 2: // Login complete
        return true; // Registered companies can login
      case 3: // Ready for bidding
        return tender.status === "Published" && tender.workflowStep >= 2;
      case 4: // Ready for evaluation
        return (
          tender.status === "Closed" &&
          tender.bidsReceived > 0 &&
          tender.workflowStep >= 3
        );
      case 5: // Ready for NOC
        return tender.evaluationCompleted && tender.workflowStep >= 4;
      case 6: // Ready for final approval
        return tender.nocApproved && tender.workflowStep >= 5;
      default:
        return false;
    }
  };

  const advanceWorkflowStep = (tenderId: string, newStep: number) => {
    setTenders((prev) =>
      prev.map((tender) =>
        tender.id === tenderId ? { ...tender, workflowStep: newStep } : tender,
      ),
    );
  };

  const handleCompleteEvaluationOld = (evaluationId: string) => {
    setTenderEvaluations((prev) =>
      prev.map((evaluation) =>
        evaluation.id === evaluationId
          ? { ...evaluation, status: "Completed" as const }
          : evaluation,
      ),
    );

    // Check if all evaluations are complete for this tender
    const allEvaluations = tenderEvaluations.filter(
      (e) => e.tenderId === activeEvaluationTender?.id,
    );
    const completedEvaluations = allEvaluations.filter(
      (e) => e.status === "Completed" || e.id === evaluationId,
    );

    if (completedEvaluations.length === allEvaluations.length) {
      // Mark evaluation as complete and advance workflow
      setTenders((prev) =>
        prev.map((tender) =>
          tender.id === activeEvaluationTender?.id
            ? {
                ...tender,
                evaluationCompleted: true,
                workflowStep: Math.max(tender.workflowStep || 3, 4),
                workflowStatus: "Evaluation" as const,
              }
            : tender,
        ),
      );
    }
  };

  const requestNOC = (tender: Tender) => {
    if (!canProceedToNextStep(tender, 5)) {
      alert("Cannot request NOC: Evaluation must be completed first");
      return;
    }

    setTenders((prev) =>
      prev.map((t) =>
        t.id === tender.id
          ? {
              ...t,
              nocRequested: true,
              nocRequestDate: new Date().toISOString(),
              workflowStep: 5,
              workflowStatus: "NOC_Requested" as const,
            }
          : t,
      ),
    );

    alert("No Objection Certificate request submitted successfully!");
  };

  const approveNOC = (tender: Tender) => {
    if (!tender.nocRequested) {
      alert("NOC must be requested before approval");
      return;
    }

    setTenders((prev) =>
      prev.map((t) =>
        t.id === tender.id
          ? {
              ...t,
              nocApproved: true,
              nocApprovalDate: new Date().toISOString(),
              workflowStep: 6,
              workflowStatus: "NOC_Approved" as const,
              finalApprovalRequired: true,
            }
          : t,
      ),
    );

    alert("No Objection Certificate approved! Ready for final contract award.");
  };

  const handleFinalApproval = (tender: Tender) => {
    if (!tender.nocApproved) {
      alert("NOC must be approved before final award");
      return;
    }

    setTenders((prev) =>
      prev.map((t) =>
        t.id === tender.id
          ? {
              ...t,
              status: "Awarded" as const,
              workflowStatus: "Contract_Awarded" as const,
              finalApprovalRequired: false,
              awardDate: new Date().toISOString(),
            }
          : t,
      ),
    );

    alert("Final approval completed! Contract has been awarded.");
  };

  const submitBlacklist = () => {
    if (!selectedCompany || !blacklistReason.trim()) return;

    setCompanies((prev) =>
      prev.map((company) =>
        company.id === selectedCompany.id
          ? { ...company, status: "Blacklisted" as const, blacklistReason }
          : company,
      ),
    );

    setShowBlacklistModal(false);
    setSelectedCompany(null);
    setBlacklistReason("");
    alert("Company has been blacklisted successfully!");
  };

  // MDA Management functions
  const handleCreateMDA = () => {
    setMDAFormMode("create");
    setSelectedMDA(null);
    setShowCreateMDAModal(true);
  };

  const handleEditMDA = (mda: MDA) => {
    setMDAFormMode("edit");
    setSelectedMDA(mda);
    setShowEditMDAModal(true);
  };

  const handleDeleteMDA = async (mda: MDA) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${mda.name}? This action cannot be undone.`,
      )
    ) {
      try {
        // Delete MDA from localStorage (this also removes associated admins and users)
        await mdaLocalStorageService.deleteMDA(mda.id);

        // Update UI state
        setMDAs((prev) => prev.filter((m) => m.id !== mda.id));
        setMDAAdmins((prev) => prev.filter((admin) => admin.mdaId !== mda.id));
        setMDAUsers((prev) => prev.filter((user) => user.mdaId !== mda.id));

        alert(`${mda.name} has been deleted successfully!`);
      } catch (error) {
        console.error("Error deleting MDA:", error);
        alert("Error deleting MDA. Please try again.");
      }
    }
  };

  const handleCreateMDAAdmin = (mda: MDA) => {
    setAdminFormMode("create");
    setSelectedMDA(mda);
    setSelectedMDAAdmin(null);
    setShowCreateAdminModal(true);
  };

  const handleEditMDAAdmin = (admin: MDAAdmin) => {
    setAdminFormMode("edit");
    setSelectedMDAAdmin(admin);
    setSelectedMDA(mdas.find((m) => m.id === admin.mdaId) || null);
    setShowEditAdminModal(true);
  };

  const handleDeleteMDAAdmin = (admin: MDAAdmin) => {
    const adminMDA = mdas.find((m) => m.id === admin.mdaId);
    if (
      window.confirm(
        `Are you sure you want to remove this administrator from ${adminMDA?.name}?`,
      )
    ) {
      setMDAAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      alert("Administrator has been removed successfully!");
    }
  };

  const handleMDASubmit = async (data: CreateMDARequest) => {
    try {
      if (mdaFormMode === "create") {
        // Create new MDA with full ministry functionality
        const newMDA = await dynamicMDACreationService.createFullyFunctionalMDA(
          data,
          "SuperUser",
        );

        // Reload all MDAs from localStorage to ensure consistency
        const updatedMDAs = await mdaLocalStorageService.getAllMDAs();
        setMDAs(updatedMDAs);

        alert(
          `${newMDA.type.charAt(0).toUpperCase() + newMDA.type.slice(1)} "${newMDA.name}" created successfully with full ministry functionality!`,
        );
      } else if (selectedMDA) {
        // Update existing MDA in localStorage
        await mdaLocalStorageService.updateMDA(
          selectedMDA.id,
          data,
          "superuser",
        );

        // Reload all MDAs from localStorage to ensure consistency
        const updatedMDAs = await mdaLocalStorageService.getAllMDAs();
        setMDAs(updatedMDAs);

        alert("MDA updated successfully!");
      }
      setShowCreateMDAModal(false);
      setShowEditMDAModal(false);
      setSelectedMDA(null);
    } catch (error) {
      console.error("Error submitting MDA:", error);
      alert("Error saving MDA. Please try again.");
    }
  };

  const handleMDAAdminSubmit = async (data: CreateMDAAdminRequest) => {
    try {
      if (adminFormMode === "create") {
        // Create new admin in localStorage
        const newAdmin = await mdaLocalStorageService.createMDAAdmin(
          data,
          "superuser",
        );

        // Fetch updated admin list to get the full admin with user data
        const updatedAdmins = await mdaLocalStorageService.getMDAAdmins(
          data.mdaId,
        );
        const createdAdmin = updatedAdmins.find(
          (admin) => admin.id === newAdmin.id,
        );

        if (createdAdmin) {
          setMDAAdmins((prev) => [...prev, createdAdmin]);
        }

        alert("MDA Administrator created successfully!");
      } else if (selectedMDAAdmin) {
        // Note: For updates, we would need to add an update method to the service
        // For now, just update the UI state
        const updatedAdmin: MDAAdmin & { user: EnhancedUserProfile; mda: MDA } =
          {
            ...selectedMDAAdmin,
            mdaId: data.mdaId,
            role: data.role,
            permissions: data.permissions,
          };
        setMDAAdmins((prev) =>
          prev.map((a) => (a.id === selectedMDAAdmin.id ? updatedAdmin : a)),
        );
        alert("MDA Administrator updated successfully!");
      }
      setShowCreateAdminModal(false);
      setShowEditAdminModal(false);
      setSelectedMDAAdmin(null);
      setSelectedMDA(null);
    } catch (error) {
      console.error("Error submitting MDA Admin:", error);
      alert("Error saving MDA Administrator. Please try again.");
    }
  };

  const toggleMDAStatus = (mda: MDA) => {
    setMDAs((prev) =>
      prev.map((m) =>
        m.id === mda.id
          ? { ...m, isActive: !m.isActive, updatedAt: new Date() }
          : m,
      ),
    );
    alert(
      `${mda.name} has been ${mda.isActive ? "deactivated" : "activated"}!`,
    );
  };

  const toggleAdminStatus = (admin: MDAAdmin) => {
    setMDAAdmins((prev) =>
      prev.map((a) =>
        a.id === admin.id ? { ...a, isActive: !a.isActive } : a,
      ),
    );
    alert(
      `Administrator has been ${admin.isActive ? "deactivated" : "activated"}!`,
    );
  };

  const handleCreateMDAUser = (mda: MDA) => {
    setUserFormMode("create");
    setSelectedMDA(mda);
    setSelectedMDAUser(null);
    setShowCreateUserModal(true);
  };

  const handleEditMDAUser = (user: MDAUser) => {
    setUserFormMode("edit");
    setSelectedMDAUser(user);
    setSelectedMDA(mdas.find((m) => m.id === user.mdaId) || null);
    setShowEditUserModal(true);
  };

  const handleDeleteMDAUser = (user: MDAUser) => {
    const userMDA = mdas.find((m) => m.id === user.mdaId);
    if (
      window.confirm(
        `Are you sure you want to remove this user from ${userMDA?.name}?`,
      )
    ) {
      setMDAUsers((prev) => prev.filter((u) => u.id !== user.id));
      alert("User has been removed successfully!");
    }
  };

  const handleMDAUserSubmit = async (data: CreateMDAUserRequest) => {
    try {
      if (userFormMode === "create") {
        // Create new user in localStorage
        const newUser = await mdaLocalStorageService.createMDAUser(
          data,
          "superuser",
        );

        // Fetch updated user list to get the full user with profile data
        const updatedUsers = await mdaLocalStorageService.getMDAUsers(
          data.mdaId,
        );
        const createdUser = updatedUsers.find((user) => user.id === newUser.id);

        if (createdUser) {
          setMDAUsers((prev) => [...prev, createdUser]);
        }

        alert("MDA User created successfully!");
      } else if (selectedMDAUser) {
        // Note: For updates, we would need to add an update method to the service
        // For now, just update the UI state
        const updatedUser: MDAUser & { user: EnhancedUserProfile } = {
          ...selectedMDAUser,
          mdaId: data.mdaId,
          role: data.role,
          department: data.department,
          permissions: data.permissions,
        };
        setMDAUsers((prev) =>
          prev.map((u) => (u.id === selectedMDAUser.id ? updatedUser : u)),
        );
        alert("MDA User updated successfully!");
      }
      setShowCreateUserModal(false);
      setShowEditUserModal(false);
      setSelectedMDAUser(null);
      setSelectedMDA(null);
    } catch (error) {
      console.error("Error submitting MDA User:", error);
      alert("Error saving MDA User. Please try again.");
    }
  };

  const toggleUserStatus = (user: MDAUser) => {
    setMDAUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
    );
    alert(`User has been ${user.isActive ? "deactivated" : "activated"}!`);
  };

  const filteredMDAs = mdas.filter((mda) => {
    const matchesSearch =
      mda.name.toLowerCase().includes(mdaSearchTerm.toLowerCase()) ||
      mda.description.toLowerCase().includes(mdaSearchTerm.toLowerCase());
    const matchesType = mdaFilterType === "all" || mda.type === mdaFilterType;
    return matchesSearch && matchesType;
  });

  const renderMDATesting = () => {
    return (
      <div className="space-y-8">
        {/* Firebase Status Banner */}
        <FirebaseStatus variant="banner" showDetails={true} />

        {/* MDA Testing Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              MDA Testing Environment
            </h1>
            <p className="text-gray-600 mb-2">
              Automated testing and validation for MDA functionality
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-1"></span>
                Testing Mode Active
              </span>
              <span className="text-gray-500">•</span>
              <FirebaseStatus variant="badge" />
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                Dynamic MDA creation with full ministry functionality
              </span>
            </div>
          </div>
          <button
            onClick={() => handleTabChange("mda-management")}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to MDA Management
          </button>
        </div>

        {/* Testing Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total MDAs</p>
                <p className="text-3xl font-bold text-blue-600">
                  {mdas.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Functional MDAs
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {
                    mdas.filter((mda) =>
                      dynamicMDACreationService.hasMDAFunctionality(mda.id),
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Test Configurations
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {dynamicMDACreationService.getMDAConfigurations().length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Health
                </p>
                <p className="text-3xl font-bold text-orange-600">98.5%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleCreateSampleMDAs}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create 4 Sample MDAs
          </button>

          <button
            onClick={handleMDAIntegrityCheck}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Integrity Check
          </button>

          <button
            onClick={() => {
              const mdaConfigs =
                dynamicMDACreationService.getMDAConfigurations();
              console.log("🔍 MDA Configurations:", mdaConfigs);
              alert(
                `Found ${mdaConfigs.length} MDA configurations. Check console for details.`,
              );
            }}
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Eye className="h-5 w-5 mr-2" />
            View Configurations
          </button>

          <button
            onClick={handleClearAllMDAs}
            className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Clear All MDAs
          </button>
        </div>

        {/* MDA Testing Interface */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              MDA Functionality Testing
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Test and validate MDA functionality without manual form submission
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Automated Testing */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Automated Testing
                </h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <h4 className="font-medium text-green-900 mb-2">
                      Sample MDA Creation
                    </h4>
                    <p className="text-sm text-green-800 mb-3">
                      Click below to automatically create 4 sample MDAs with
                      full ministry functionality:
                    </p>
                    <ul className="text-sm text-green-700 mb-3 space-y-1">
                      <li>• Ministry of Agriculture & Rural Development</li>
                      <li>• Ministry of Urban Development & Planning</li>
                      <li>• Ministry of Information Technology</li>
                      <li>• Ministry of Environment & Climate</li>
                    </ul>
                    <button
                      onClick={handleCreateSampleMDAs}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Create 4 Sample MDAs
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">
                      System Integrity Check
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Verify that all MDAs have proper configurations,
                      credentials, and tender systems
                    </p>
                    <button
                      onClick={handleMDAIntegrityCheck}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Run Integrity Check
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                    <h4 className="font-medium text-red-900 mb-2">
                      Reset Testing Environment
                    </h4>
                    <p className="text-sm text-red-800 mb-3">
                      Clear all MDAs and configurations to start fresh
                    </p>
                    <button
                      onClick={handleClearAllMDAs}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Clear All MDAs
                    </button>
                  </div>
                </div>
              </div>

              {/* Individual MDA Testing */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Individual MDA Testing
                </h3>
                <div className="space-y-4">
                  {mdas.length > 0 ? (
                    mdas.map((mda) => (
                      <div key={mda.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {mda.name}
                          </h4>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              dynamicMDACreationService.hasMDAFunctionality(
                                mda.id,
                              )
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {dynamicMDACreationService.hasMDAFunctionality(
                              mda.id,
                            )
                              ? "Functional"
                              : "Basic"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Type:{" "}
                          {mda.type.charAt(0).toUpperCase() + mda.type.slice(1)}
                        </p>
                        <button
                          onClick={() => handleTestMDAFunctionality(mda)}
                          className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                          Test Functionality
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No MDAs Available
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Create sample MDAs to start testing functionality.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Results */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Testing Results & Logs
            </h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg overflow-auto max-h-64">
              <div className="space-y-1">
                <div>🧪 MDA Testing Environment - Ready</div>
                <div>✅ Dynamic MDA Creation Service - Loaded</div>
                <div>✅ Ministry Functionality Templates - Available</div>
                <div>📊 Current MDAs: {mdas.length}</div>
                <div>
                  🔧 Active Configurations:{" "}
                  {dynamicMDACreationService.getMDAConfigurations().length}
                </div>
                <div>💾 Storage: localStorage (Browser)</div>
                <div>🚀 Status: Ready for testing</div>
                <div className="text-yellow-400">
                  💡 Use the actions above to test MDA functionality
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Testing Options */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Advanced Testing Options
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Credentials Testing
                </h4>
                <button
                  onClick={() => {
                    const credentials = JSON.parse(
                      localStorage.getItem("mdaCredentials") || "[]",
                    );
                    console.log("🔐 MDA Credentials:", credentials);
                    alert(
                      `Found ${credentials.length} MDA credential sets. Check console for details.`,
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Check Credentials
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Dashboard Testing</h4>
                <button
                  onClick={() => {
                    const dashboardConfigs = JSON.parse(
                      localStorage.getItem("mdaDashboardConfigs") || "[]",
                    );
                    console.log("📊 Dashboard Configs:", dashboardConfigs);
                    alert(
                      `Found ${dashboardConfigs.length} dashboard configurations. Check console for details.`,
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Check Dashboards
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  Tender System Testing
                </h4>
                <button
                  onClick={() => {
                    const tenderCounts = mdas.map((mda) => ({
                      name: mda.name,
                      tenders: JSON.parse(
                        localStorage.getItem(`${mda.id}_tenders`) || "[]",
                      ).length,
                    }));
                    console.log("📋 Tender Systems:", tenderCounts);
                    alert(
                      `Tender system status checked. See console for details.`,
                    );
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Check Tender Systems
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMDAManagement = () => {
    return (
      <div className="space-y-8">
        {/* Firebase Status Banner */}
        <FirebaseStatus variant="banner" showDetails={true} />

        {/* MDA Management Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              MDA Management
            </h1>
            <p className="text-gray-600 mb-2">
              Create and manage Ministries, Departments, and Agencies
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                3 Pre-configured Ministries Active
              </span>
              <span className="text-gray-500">•</span>
              <FirebaseStatus variant="badge" />
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                Data stored in browser localStorage
              </span>
            </div>
          </div>
          <button
            onClick={handleCreateMDA}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create MDA
          </button>
        </div>

        {/* MDA Credentials Viewer */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔐 MDA Login Credentials
          </h3>
          <div className="space-y-3">
            {mdas.map((mda) => (
              <div
                key={mda.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-900 mb-2">{mda.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Username:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {mda.id.toLowerCase()}
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Password:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      mda123
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type:</span>
                    <span className="text-gray-900 capitalize">{mda.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MDA Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total MDAs</p>
                <p className="text-3xl font-bold text-blue-600">
                  {mdas.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Admins
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {mdaAdmins.filter((a) => a.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Budget
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  ₦
                  {(
                    mdas.reduce(
                      (sum, mda) => sum + mda.settings.totalBudget,
                      0,
                    ) / 1000000000
                  ).toFixed(1)}
                  B
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Efficiency
                </p>
                <p className="text-3xl font-bold text-orange-600">92.5%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* MDA Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search MDAs..."
                  value={mdaSearchTerm}
                  onChange={(e) => setMDASearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-40">
              <select
                value={mdaFilterType}
                onChange={(e) => setMDAFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="ministry">Ministries</option>
                <option value="department">Departments</option>
                <option value="agency">Agencies</option>
              </select>
            </div>
          </div>
        </div>

        {/* MDA Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMDAs.map((mda) => (
            <div
              key={mda.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        mda.type === "ministry"
                          ? "bg-blue-100"
                          : mda.type === "department"
                            ? "bg-green-100"
                            : "bg-purple-100"
                      }`}
                    >
                      <Building2
                        className={`h-6 w-6 ${
                          mda.type === "ministry"
                            ? "text-blue-600"
                            : mda.type === "department"
                              ? "text-green-600"
                              : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          mda.type === "ministry"
                            ? "bg-blue-100 text-blue-800"
                            : mda.type === "department"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {mda.type.charAt(0).toUpperCase() + mda.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mda.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {mda.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {mda.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {mda.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Head of MDA:</span>
                    <span className="font-medium">{mda.headOfMDA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">
                      ₦{(mda.settings.totalBudget / 1000000000).toFixed(1)}B
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleMDAStatus(mda)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Toggle Status"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditMDA(mda)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                      title="Edit MDA"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMDA(mda)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete MDA"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCreateMDAAdmin(mda)}
                      className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200"
                    >
                      Add Admin
                    </button>
                    <button
                      onClick={() => handleCreateMDAUser(mda)}
                      className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200"
                    >
                      Add User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMDAs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No MDAs found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {mdaSearchTerm || mdaFilterType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start by creating your first MDA."}
            </p>
          </div>
        )}

        {/* MDA Admins Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              MDA Administrators
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MDA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Approval
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
                {mdaAdmins.map((admin) => {
                  const adminMDA = mdas.find((m) => m.id === admin.mdaId);
                  return (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Admin User
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {adminMDA?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {adminMDA?.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.role === "mda_super_admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {admin.role === "mda_super_admin"
                            ? "Super Admin"
                            : "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦
                        {(
                          admin.permissions.maxApprovalAmount / 1000000
                        ).toFixed(0)}
                        M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            admin.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => toggleAdminStatus(admin)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Toggle Status"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          {admin.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleEditMDAAdmin(admin)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMDAAdmin(admin)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MDA Users Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">MDA Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MDA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Level
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
                {mdaUsers.map((user) => {
                  const userMDA = mdas.find((m) => m.id === user.mdaId);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              MDA User
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {userMDA?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userMDA?.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "procurement_officer"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "evaluator"
                                ? "bg-green-100 text-green-800"
                                : user.role === "accountant"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.permissions.accessLevel === "write"
                              ? "bg-red-100 text-red-800"
                              : user.permissions.accessLevel === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.permissions.accessLevel === "write"
                            ? "Read & Write"
                            : user.permissions.accessLevel === "admin"
                              ? "Admin"
                              : "Read Only"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                          onClick={() => toggleUserStatus(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Toggle Status"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleEditMDAUser(user)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMDAUser(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 inline mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, Super User!
              </h1>
              <p className="text-gray-600">
                Comprehensive system overview and administrative controls.
              </p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      New Registrations Pending
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {dashboardStats.newRegistrationsPending}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Tenders
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {dashboardStats.activeTenders}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Upcoming Deadlines
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {dashboardStats.upcomingDeadlines}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Contract Value
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardStats.totalContractValue}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Awarded Contracts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Awarded Contracts Today
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {dashboardStats.awardedContractsToday}
                  </div>
                  <p className="text-sm text-gray-600">
                    Contracts awarded today
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Awarded Contracts This Week
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {dashboardStats.awardedContractsWeek}
                  </div>
                  <p className="text-sm text-gray-600">
                    Contracts awarded this week
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Awarded Contracts This Month
                </h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {dashboardStats.awardedContractsMonth}
                  </div>
                  <p className="text-sm text-gray-600">
                    Contracts awarded this month
                  </p>
                </div>
              </div>
            </div>

            {/* Recent System Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent System Activity Log
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {log.action}
                          </p>
                          <span className="text-xs text-gray-500">
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-500">
                          by {log.user} on {log.entity}
                        </p>
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
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    AI Insights & Recommendations
                  </h1>
                  <p className="text-gray-600">
                    Intelligent recommendations powered by machine learning
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">
                    Live Analysis
                  </span>
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
                <p className="text-sm text-gray-600 mt-1">
                  AI-powered matching of companies to relevant tenders
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Recommended for Healthcare Tender KS-2024-012
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          name: "Sahel Medical Supplies",
                          score: 95,
                          projects: 15,
                          compliance: "Excellent",
                        },
                        {
                          name: "Healthcare Solutions Ltd",
                          score: 92,
                          projects: 22,
                          compliance: "Good",
                        },
                        {
                          name: "MedEquip Nigeria",
                          score: 88,
                          projects: 8,
                          compliance: "Excellent",
                        },
                      ].map((company, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {company.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {company.projects} relevant projects |{" "}
                              {company.compliance} compliance
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(company.score / 20) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              {company.score}% match
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Recommended for Infrastructure Tender KS-2024-013
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          name: "Northern Construction Ltd",
                          score: 97,
                          projects: 28,
                          compliance: "Excellent",
                        },
                        {
                          name: "Kano Infrastructure Corp",
                          score: 94,
                          projects: 35,
                          compliance: "Good",
                        },
                        {
                          name: "BuildRight Engineering",
                          score: 89,
                          projects: 19,
                          compliance: "Excellent",
                        },
                      ].map((company, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {company.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {company.projects} relevant projects |{" "}
                              {company.compliance} compliance
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(company.score / 20) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              {company.score}% match
                            </p>
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
                <p className="text-sm text-gray-600 mt-1">
                  Real-time compliance alerts and monitoring
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Critical Alerts
                        </p>
                        <p className="text-2xl font-bold text-red-600">3</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      Companies with expired documents
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Warnings
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">7</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      Documents expiring within 30 days
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Compliant
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          2,847
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Companies in good standing
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Recent Compliance Events
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        company: "ABC Construction",
                        event: "Tax clearance expired",
                        severity: "high",
                        time: "2 hours ago",
                      },
                      {
                        company: "Tech Solutions Ltd",
                        event: "CAC certificate expiring in 15 days",
                        severity: "medium",
                        time: "1 day ago",
                      },
                      {
                        company: "Medical Supplies Co",
                        event: "Successfully renewed all documents",
                        severity: "low",
                        time: "3 days ago",
                      },
                    ].map((event, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          event.severity === "high"
                            ? "bg-red-50 border-red-200"
                            : event.severity === "medium"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {event.company}
                            </p>
                            <p className="text-sm text-gray-600">
                              {event.event}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {event.time}
                          </span>
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
                    <div
                      key={recommendation.id}
                      className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                recommendation.type === "company"
                                  ? "bg-blue-100 text-blue-800"
                                  : recommendation.type === "compliance"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {recommendation.type}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                recommendation.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : recommendation.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {recommendation.priority} priority
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {recommendation.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {recommendation.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              recommendation.status === "new"
                                ? "bg-blue-100 text-blue-800"
                                : recommendation.status === "reviewed"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {recommendation.status}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            View Details
                          </button>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Company Status Management
              </h1>
              <p className="text-gray-600">
                Manage active status of registered companies including
                suspensions and blacklisting.
              </p>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Companies
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {companies.filter((c) => c.status === "Active").length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Suspended Companies
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {companies.filter((c) => c.status === "Suspended").length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Blacklisted Companies
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {
                        companies.filter((c) => c.status === "Blacklisted")
                          .length
                      }
                    </p>
                  </div>
                  <Ban className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Companies Management */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Company Status Management
                  </h2>
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
                    {companies
                      .filter(
                        (company) =>
                          company.companyName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          company.contactPerson
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {company.companyName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {company.contactPerson} • {company.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                company.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : company.status === "Suspended"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
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
                            {new Date(
                              company.lastActivity,
                            ).toLocaleDateString()}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Audit Logs
              </h1>
              <p className="text-gray-600">
                Detailed logging of all user actions for accountability and
                security auditing.
              </p>

              {/* Audit Log Statistics */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Total Logs
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {auditStats.totalLogs}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-900">
                      Critical
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {auditStats.logsBySeverity.CRITICAL || 0}
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-orange-900">
                      High
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    {auditStats.logsBySeverity.HIGH || 0}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      Today's Logs
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {
                      auditLogs.filter(
                        (log) =>
                          new Date(log.timestamp).toDateString() ===
                          new Date().toDateString(),
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    System Activity Logs
                  </h2>
                  <div className="flex items-center space-x-3">
                    <select
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Actions</option>
                      <option value="COMPANY_APPROVED">Company Approved</option>
                      <option value="COMPANY_SUSPENDED">
                        Company Suspended
                      </option>
                      <option value="COMPANY_BLACKLISTED">
                        Company Blacklisted
                      </option>
                      <option value="TENDER_CREATED">Tender Created</option>
                      <option value="BID_EVALUATED">Bid Evaluated</option>
                      <option value="NOC_APPROVED">NOC Approved</option>
                      <option value="SYSTEM_LOGIN">System Login</option>
                    </select>
                    <select
                      value={auditSeverityFilter}
                      onChange={(e) => setAuditSeverityFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Severity</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <button
                      onClick={handleExportAuditLogs}
                      className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                    <button
                      onClick={handleClearAuditLogs}
                      className="flex items-center px-3 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={auditDateFilter}
                    onChange={(e) => setAuditDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={auditUserFilter}
                    onChange={(e) => setAuditUserFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="SuperUser">SuperUser</option>
                    <option value="AdminUser">Admin</option>
                    <option value="SYSTEM">System</option>
                    <option value="EvaluationCommittee">
                      Evaluation Committee
                    </option>
                    <option value="SystemAdmin">System Admin</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 ${
                              log.severity === "CRITICAL"
                                ? "bg-red-600"
                                : log.severity === "HIGH"
                                  ? "bg-orange-500"
                                  : log.severity === "MEDIUM"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                            title={`Severity: ${log.severity}`}
                          ></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">
                                {log.action}
                              </p>
                              <span className="text-sm text-gray-500">•</span>
                              <p className="text-sm text-gray-600">
                                {log.entity}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {log.details}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>
                                User: {log.user} ({log.userRole})
                              </span>
                              <span>•</span>
                              <span>Severity: {log.severity}</span>
                              <span>•</span>
                              <span>
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reports & Analytics
              </h1>
              <p className="text-gray-600">
                Comprehensive business intelligence dashboards and procurement
                analytics.
              </p>
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
                    {
                      ministry: "Infrastructure",
                      amount: "₦15.2B",
                      percentage: 42,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.ministry}
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
                  Supplier Performance Trends
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      metric: "Average Completion Rate",
                      value: "94%",
                      trend: "up",
                    },
                    { metric: "On-time Delivery", value: "89%", trend: "up" },
                    {
                      metric: "Quality Score",
                      value: "4.2/5",
                      trend: "stable",
                    },
                    { metric: "Compliance Rate", value: "97%", trend: "up" },
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
                              : "text-gray-400"
                          }`}
                        />
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
                    {
                      title: "Procurement by Sector",
                      icon: PieChart,
                      color: "blue",
                    },
                    {
                      title: "Geographic Distribution",
                      icon: Target,
                      color: "green",
                    },
                    {
                      title: "Contract Lifecycle Analysis",
                      icon: LineChart,
                      color: "purple",
                    },
                    {
                      title: "Vendor Performance",
                      icon: Award,
                      color: "orange",
                    },
                    {
                      title: "Spending Trends",
                      icon: TrendingUp,
                      color: "red",
                    },
                    {
                      title: "Compliance Overview",
                      icon: Shield,
                      color: "indigo",
                    },
                  ].map((dashboard, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`w-10 h-10 bg-${dashboard.color}-100 rounded-lg flex items-center justify-center`}
                        >
                          <dashboard.icon
                            className={`h-5 w-5 text-${dashboard.color}-600`}
                          />
                        </div>
                        <h3 className="font-medium text-gray-900">
                          {dashboard.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Interactive dashboard with filtering and export options
                      </p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Open Dashboard →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Generation */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Download className="h-5 w-5 text-green-600 mr-2" />
                  Generate Custom Reports
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Report Configuration */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Report Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Report Type
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option>Procurement Summary Report</option>
                          <option>Vendor Performance Report</option>
                          <option>Financial Analysis Report</option>
                          <option>Compliance Audit Report</option>
                          <option>Contract Lifecycle Report</option>
                          <option>Risk Assessment Report</option>
                          <option>Payment Status Report</option>
                          <option>OCDS Data Export</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date From
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            defaultValue="2024-01-01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date To
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            defaultValue={
                              new Date().toISOString().split("T")[0]
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Output Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="format"
                              value="pdf"
                              className="text-green-600 focus:ring-green-500"
                              defaultChecked
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                PDF Report
                              </p>
                              <p className="text-xs text-gray-600">
                                Professional formatted document
                              </p>
                            </div>
                          </label>
                          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="format"
                              value="excel"
                              className="text-green-600 focus:ring-green-500"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                Excel Spreadsheet
                              </p>
                              <p className="text-xs text-gray-600">
                                Detailed data with calculations
                              </p>
                            </div>
                          </label>
                          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="format"
                              value="csv"
                              className="text-green-600 focus:ring-green-500"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                CSV Data
                              </p>
                              <p className="text-xs text-gray-600">
                                Raw data for analysis
                              </p>
                            </div>
                          </label>
                          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="format"
                              value="json"
                              className="text-green-600 focus:ring-green-500"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                JSON Export
                              </p>
                              <p className="text-xs text-gray-600">
                                Structured data for APIs
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filter Options
                        </label>
                        <div className="space-y-2">
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">All Ministries</option>
                            <option>Ministry of Health</option>
                            <option>Ministry of Education</option>
                            <option>Ministry of Works</option>
                            <option>Ministry of Agriculture</option>
                          </select>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">All Categories</option>
                            <option>Infrastructure</option>
                            <option>Healthcare</option>
                            <option>Education</option>
                            <option>Technology</option>
                            <option>Agriculture</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Minimum contract value (₦)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Report Templates */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Quick Report Templates
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full text-left p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-900">
                              Monthly Procurement Summary
                            </p>
                            <p className="text-sm text-green-700">
                              Complete overview of all procurement activities
                            </p>
                          </div>
                          <Download className="h-5 w-5 text-green-600" />
                        </div>
                      </button>

                      <button className="w-full text-left p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-900">
                              Vendor Performance Dashboard
                            </p>
                            <p className="text-sm text-blue-700">
                              Top performing and underperforming vendors
                            </p>
                          </div>
                          <Download className="h-5 w-5 text-blue-600" />
                        </div>
                      </button>

                      <button className="w-full text-left p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-purple-900">
                              Financial Analysis Report
                            </p>
                            <p className="text-sm text-purple-700">
                              Budget utilization and cost savings analysis
                            </p>
                          </div>
                          <Download className="h-5 w-5 text-purple-600" />
                        </div>
                      </button>

                      <button className="w-full text-left p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-orange-900">
                              Compliance Audit Trail
                            </p>
                            <p className="text-sm text-orange-700">
                              Regulatory compliance and audit findings
                            </p>
                          </div>
                          <Download className="h-5 w-5 text-orange-600" />
                        </div>
                      </button>

                      <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-900">
                              Risk Assessment Report
                            </p>
                            <p className="text-sm text-red-700">
                              Risk factors and mitigation strategies
                            </p>
                          </div>
                          <Download className="h-5 w-5 text-red-600" />
                        </div>
                      </button>

                      <button className="w-full text-left p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-yellow-900">
                              OCDS Open Data Export
                            </p>
                            <p className="text-sm text-yellow-700">
                              Open Contracting Data Standard format
                            </p>
                          </div>
                          <Download className="h-5 w-5 text-yellow-600" />
                        </div>
                      </button>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Advanced Export Options
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Include charts and visualizations
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Add executive summary
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Include detailed appendix
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Password protect document
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Report generation typically takes 30-60 seconds depending on
                    data range
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      Save Template
                    </button>
                    <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduled Reports */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Scheduled Reports
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      name: "Weekly Procurement Summary",
                      frequency: "Every Monday 8:00 AM",
                      format: "PDF",
                      recipients: "admin@kanostate.gov.ng",
                      nextRun: "2024-02-05 08:00",
                      status: "Active",
                    },
                    {
                      name: "Monthly Financial Report",
                      frequency: "1st of every month",
                      format: "Excel",
                      recipients: "finance@kanostate.gov.ng",
                      nextRun: "2024-03-01 09:00",
                      status: "Active",
                    },
                    {
                      name: "Quarterly Compliance Report",
                      frequency: "Every 3 months",
                      format: "PDF",
                      recipients: "compliance@kanostate.gov.ng",
                      nextRun: "2024-04-01 10:00",
                      status: "Paused",
                    },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {report.name}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                report.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Frequency:</span>{" "}
                              {report.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Format:</span>{" "}
                              {report.format}
                            </div>
                            <div>
                              <span className="font-medium">Next Run:</span>{" "}
                              {report.nextRun}
                            </div>
                            <div>
                              <span className="font-medium">Recipients:</span>{" "}
                              {report.recipients}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                            <Play className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded">
                            <Pause className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scheduled Report
                  </button>
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
                    <h3 className="font-medium text-gray-900 mb-4">
                      Demand Forecasting
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          category: "Medical Equipment",
                          forecast: "15% increase",
                          period: "Next Quarter",
                        },
                        {
                          category: "IT Infrastructure",
                          forecast: "8% increase",
                          period: "Next 6 months",
                        },
                        {
                          category: "Construction Materials",
                          forecast: "22% increase",
                          period: "Next Quarter",
                        },
                      ].map((item, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              {item.category}
                            </span>
                            <span className="text-sm text-blue-600">
                              {item.period}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Predicted {item.forecast} in demand
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      Optimal Tender Timing
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          tender: "Healthcare Equipment",
                          timing: "Early Q2",
                          reason: "Maximize competition",
                        },
                        {
                          tender: "Road Construction",
                          timing: "End of Q1",
                          reason: "Weather considerations",
                        },
                        {
                          tender: "IT Services",
                          timing: "Mid Q2",
                          reason: "Budget cycle alignment",
                        },
                      ].map((item, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              {item.tender}
                            </span>
                            <span className="text-sm text-green-600">
                              {item.timing}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.reason}
                          </p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Tender Management
              </h1>
              <p className="text-gray-600">
                Comprehensive tender lifecycle management with OCDS integration.
              </p>
            </div>

            {/* Tender Management Overview */}
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
                      Pending Evaluation
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {tenders.filter((t) => t.status === "Closed").length}
                    </p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Awarded Contracts
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {tenders.filter((t) => t.status === "Awarded").length}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Bids Received
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {tenders.reduce((sum, t) => sum + t.bidsReceived, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleTabChange("create-tender")}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Tender
              </button>

              <button
                onClick={() => handleTabChange("manage-tenders")}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-5 w-5 mr-2" />
                Manage Tenders
              </button>

              <button
                onClick={() => handleTabChange("tender-evaluation")}
                className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Evaluate Tenders
              </button>

              <button
                onClick={() => handleTabChange("vendor-performance")}
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Vendor Performance
              </button>
            </div>

            {/* Recent Tenders */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Tenders
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
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
                    {tenders.slice(0, 5).map((tender) => (
                      <tr key={tender.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tender.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tender.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tender.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tender.estimatedValue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tender.status === "Published"
                                ? "bg-blue-100 text-blue-800"
                                : tender.status === "Closed"
                                  ? "bg-orange-100 text-orange-800"
                                  : tender.status === "Awarded"
                                    ? "bg-green-100 text-green-800"
                                    : tender.status === "Draft"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
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
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Edit
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

      case "create-tender":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Create New Tender
                </h1>
                <p className="text-gray-600">
                  Create a new procurement tender with OCDS integration.
                </p>
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
                  onClick={() => handleTabChange("tenders")}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back to Tenders
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tender Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tender Title *
                    </label>
                    <input
                      type="text"
                      value={tenderForm.title}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tender title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={tenderForm.category}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ministry *
                    </label>
                    <select
                      value={tenderForm.ministry}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          ministry: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select ministry</option>
                      <option value="Ministry of Health">
                        Ministry of Health
                      </option>
                      <option value="Ministry of Works">
                        Ministry of Works
                      </option>
                      <option value="Ministry of Education">
                        Ministry of Education
                      </option>
                      <option value="Ministry of Science and Technology">
                        Ministry of Science and Technology
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Procuring Entity *
                    </label>
                    <input
                      type="text"
                      value={tenderForm.procuringEntity}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          procuringEntity: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter procuring entity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Value *
                    </label>
                    <div className="flex">
                      <select
                        value={tenderForm.currency}
                        onChange={(e) =>
                          setTenderForm((prev) => ({
                            ...prev,
                            currency: e.target.value,
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="NGN">₦ NGN</option>
                        <option value="USD">$ USD</option>
                      </select>
                      <input
                        type="text"
                        value={tenderForm.estimatedValue}
                        onChange={(e) =>
                          setTenderForm((prev) => ({
                            ...prev,
                            estimatedValue: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter estimated value"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Duration
                    </label>
                    <input
                      type="text"
                      value={tenderForm.contractDuration}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          contractDuration: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 6 months, 1 year"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      value={tenderForm.publishDate}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          publishDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Close Date *
                    </label>
                    <input
                      type="date"
                      value={tenderForm.closeDate}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          closeDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bid Opening Date
                    </label>
                    <input
                      type="date"
                      value={tenderForm.openDate}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          openDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Location
                    </label>
                    <input
                      type="text"
                      value={tenderForm.deliveryLocation}
                      onChange={(e) =>
                        setTenderForm((prev) => ({
                          ...prev,
                          deliveryLocation: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter delivery location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={tenderForm.description}
                    onChange={(e) =>
                      setTenderForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed tender description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eligibility Criteria
                  </label>
                  <textarea
                    rows={3}
                    value={tenderForm.eligibilityCriteria}
                    onChange={(e) =>
                      setTenderForm((prev) => ({
                        ...prev,
                        eligibilityCriteria: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter eligibility requirements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={tenderForm.technicalRequirements}
                    onChange={(e) =>
                      setTenderForm((prev) => ({
                        ...prev,
                        technicalRequirements: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter technical specifications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evaluation Criteria
                  </label>
                  <textarea
                    rows={3}
                    value={tenderForm.evaluationCriteria}
                    onChange={(e) =>
                      setTenderForm((prev) => ({
                        ...prev,
                        evaluationCriteria: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter evaluation criteria and scoring methodology"
                  />
                </div>

                {/* OCDS Integration Fields */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    OCDS Integration Fields
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OCDS ID
                      </label>
                      <input
                        type="text"
                        value={tenderForm.ocdsId}
                        onChange={(e) =>
                          setTenderForm((prev) => ({
                            ...prev,
                            ocdsId: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-generated OCDS identifier"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Procurement Method
                      </label>
                      <select
                        value={tenderForm.procurementMethod}
                        onChange={(e) =>
                          setTenderForm((prev) => ({
                            ...prev,
                            procurementMethod: e.target.value,
                          }))
                        }
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Procurement Category
                      </label>
                      <select
                        value={tenderForm.mainProcurementCategory}
                        onChange={(e) =>
                          setTenderForm((prev) => ({
                            ...prev,
                            mainProcurementCategory: e.target.value,
                          }))
                        }
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
                    onClick={() => handleTabChange("tenders")}
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Manage Existing Tenders
                </h1>
                <p className="text-gray-600">
                  Edit, close, issue addenda, open bids, view bids, and award
                  tenders.
                </p>
              </div>
              <button
                onClick={() => handleTabChange("tenders")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Tenders
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Tenders
                  </h2>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tender Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bids
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OCDS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tenders.map((tender) => (
                      <tr key={tender.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tender.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tender.id} • {tender.category}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tender.estimatedValue}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tender.status === "Published"
                                ? "bg-blue-100 text-blue-800"
                                : tender.status === "Closed"
                                  ? "bg-orange-100 text-orange-800"
                                  : tender.status === "Awarded"
                                    ? "bg-green-100 text-green-800"
                                    : tender.status === "Draft"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            {tender.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            Published:{" "}
                            {new Date(tender.publishDate).toLocaleDateString()}
                          </div>
                          <div>
                            Closes:{" "}
                            {new Date(tender.closeDate).toLocaleDateString()}
                          </div>
                          {tender.openDate && (
                            <div>
                              Opens:{" "}
                              {new Date(tender.openDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {tender.bidsReceived}
                          </div>
                          {tender.addendaCount > 0 && (
                            <div className="text-xs text-gray-500">
                              {tender.addendaCount} addenda
                            </div>
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tender Evaluation
                </h1>
                <p className="text-gray-600">
                  Evaluate submitted bids with scoring and comments.
                </p>
              </div>
              <button
                onClick={() => handleTabChange("tenders")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Tenders
              </button>
            </div>

            {/* Tenders Ready for Evaluation */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tenders Ready for Evaluation
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {tenders
                    .filter((t) => t.status === "Closed")
                    .map((tender) => (
                      <div
                        key={tender.id}
                        className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {tender.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {tender.id} • {tender.category} •{" "}
                              {tender.estimatedValue}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>
                                Closed:{" "}
                                {new Date(
                                  tender.closeDate,
                                ).toLocaleDateString()}
                              </span>
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

            {/* Dynamic Evaluation Interface */}
            <div
              id="evaluation-interface"
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Evaluation:{" "}
                      {activeEvaluationTender
                        ? activeEvaluationTender.title
                        : "Road Construction Project"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeEvaluationTender
                        ? activeEvaluationTender.id
                        : "KS-2024-002"}{" "}
                      • {tenderEvaluations.length} bids to evaluate
                    </p>
                  </div>
                  {activeEvaluationTender && (
                    <div className="text-sm text-gray-500">
                      <p>
                        Status:{" "}
                        <span className="font-medium">
                          {activeEvaluationTender.status}
                        </span>
                      </p>
                      <p>
                        Value:{" "}
                        <span className="font-medium">
                          {activeEvaluationTender.estimatedValue}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {tenderEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {evaluation.companyName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Bid Amount: {evaluation.bidAmount}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {evaluation.status === "Flagged" && (
                            <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged: {evaluation.flagReason}
                            </div>
                          )}
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              evaluation.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : evaluation.status === "Flagged"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {evaluation.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Technical Score (40%)
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Financial Score (60%)
                          </label>
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Score
                          </label>
                          <input
                            type="number"
                            value={evaluation.totalScore}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comments/Justification
                        </label>
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
                          Evaluated by {evaluation.evaluatedBy} on{" "}
                          {new Date(
                            evaluation.evaluatedDate,
                          ).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          {evaluation.status !== "Completed" && (
                            <>
                              <button
                                onClick={() => {
                                  const reason = prompt(
                                    "Enter reason for flagging this bid:",
                                  );
                                  if (reason) {
                                    handleFlagBid(evaluation.id, reason);
                                  }
                                }}
                                className="flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm transition-colors"
                              >
                                <Flag className="h-4 w-4 mr-1" />
                                Flag Bid
                              </button>
                              <button
                                onClick={() =>
                                  handleCompleteEvaluationOld(evaluation.id)
                                }
                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors"
                              >
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
                    onClick={() => handleTabChange("tender-awards")}
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tender Awards & Workflow Management
                </h1>
                <p className="text-gray-600">
                  Manage the complete procurement workflow from bidding to final
                  approval.
                </p>
              </div>
              <button
                onClick={() => handleTabChange("tenders")}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Tenders
              </button>
            </div>

            {/* Workflow Status Overview */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Procurement Workflow Status
                </h2>
                <p className="text-sm text-gray-600">
                  Track progress through the mandatory sequence
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
                  {[
                    {
                      step: 1,
                      title: "Company Registration",
                      icon: UserCheck,
                      color: "bg-green-100 text-green-800",
                    },
                    {
                      step: 2,
                      title: "Login & Verification",
                      icon: Shield,
                      color: "bg-blue-100 text-blue-800",
                    },
                    {
                      step: 3,
                      title: "Bidding Process",
                      icon: Send,
                      color: "bg-purple-100 text-purple-800",
                    },
                    {
                      step: 4,
                      title: "Tender Evaluation",
                      icon: ClipboardList,
                      color: "bg-orange-100 text-orange-800",
                    },
                    {
                      step: 5,
                      title: "No Objection Certificate",
                      icon: FileCheck,
                      color: "bg-yellow-100 text-yellow-800",
                    },
                    {
                      step: 6,
                      title: "Final Approval",
                      icon: Award,
                      color: "bg-red-100 text-red-800",
                    },
                  ].map(({ step, title, icon: Icon, color }) => (
                    <div key={step} className="text-center">
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${color} mb-2`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-medium text-gray-900">
                        {step}. {title}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">
                    📋 Mandatory Sequence
                  </h3>
                  <p className="text-sm text-blue-800">
                    All tenders must follow this exact sequence. Each step must
                    be completed before proceeding to the next. This ensures
                    compliance with procurement regulations and maintains audit
                    trail integrity.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow-based Tender Management */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Tender Workflow Management
                </h2>
                <p className="text-sm text-gray-600">
                  Manage tenders through the mandatory procurement sequence
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {tenders.map((tender) => (
                    <div key={tender.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {tender.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                tender.status === "Published"
                                  ? "bg-blue-100 text-blue-800"
                                  : tender.status === "Closed"
                                    ? "bg-orange-100 text-orange-800"
                                    : tender.status === "Awarded"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {tender.status}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Step {tender.workflowStep || 1}:{" "}
                              {getWorkflowStepName(tender.workflowStep || 1)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {tender.id} • {tender.category} •{" "}
                            {tender.estimatedValue}
                          </p>

                          {/* Workflow Progress Bar */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${((tender.workflowStep || 1) / 6) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {tender.workflowStep || 1}/6
                            </span>
                          </div>

                          {/* Current Status Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">
                                Bids Received:
                              </span>
                              <span
                                className={`ml-1 ${tender.bidsReceived > 0 ? "text-green-600" : "text-gray-500"}`}
                              >
                                {tender.bidsReceived}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Evaluation:
                              </span>
                              <span
                                className={`ml-1 ${tender.evaluationCompleted ? "text-green-600" : "text-gray-500"}`}
                              >
                                {tender.evaluationCompleted
                                  ? "✅ Complete"
                                  : "⏳ Pending"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                NOC Status:
                              </span>
                              <span
                                className={`ml-1 ${
                                  tender.nocApproved
                                    ? "text-green-600"
                                    : tender.nocRequested
                                      ? "text-yellow-600"
                                      : "text-gray-500"
                                }`}
                              >
                                {tender.nocApproved
                                  ? "✅ Approved"
                                  : tender.nocRequested
                                    ? "⏳ Requested"
                                    : "❌ Not Requested"}
                              </span>
                            </div>
                          </div>

                          {tender.awardedCompany && (
                            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-green-700 font-medium">
                                  Awarded to: {tender.awardedCompany}
                                </span>
                                <span className="text-green-600">
                                  Amount: {tender.awardAmount}
                                </span>
                                <span className="text-green-600">
                                  Date:{" "}
                                  {tender.awardDate
                                    ? new Date(
                                        tender.awardDate,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Workflow Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          {/* Step 4: Evaluation Actions */}
                          {tender.workflowStep === 4 &&
                            tender.status === "Closed" && (
                              <button
                                onClick={() => handleStartEvaluation(tender)}
                                disabled={!canProceedToNextStep(tender, 4)}
                                className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm disabled:opacity-50"
                              >
                                <ClipboardList className="h-4 w-4 mr-1" />
                                Complete Evaluation
                              </button>
                            )}

                          {/* Step 5: NOC Actions */}
                          {tender.workflowStep === 4 &&
                            tender.evaluationCompleted &&
                            !tender.nocRequested && (
                              <button
                                onClick={() => requestNOC(tender)}
                                className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                              >
                                <FileCheck className="h-4 w-4 mr-1" />
                                Request NOC
                              </button>
                            )}

                          {tender.nocRequested && !tender.nocApproved && (
                            <button
                              onClick={() => approveNOC(tender)}
                              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve NOC
                            </button>
                          )}

                          {/* Step 6: Final Approval */}
                          {tender.nocApproved &&
                            tender.finalApprovalRequired && (
                              <button
                                onClick={() => handleFinalApproval(tender)}
                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                              >
                                <Award className="h-4 w-4 mr-1" />
                                Final Approval
                              </button>
                            )}

                          {/* Post-Approval Actions */}
                          {tender.status === "Awarded" && (
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => generateAwardLetter(tender)}
                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                E-Award Letter
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAwardTender(tender);
                                  setShowDigitalSignModal(true);
                                }}
                                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                              >
                                <FileCheck className="h-4 w-4 mr-1" />
                                Digital Sign
                              </button>
                            </div>
                          )}

                          {/* View Details */}
                          <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Award Tender: Road Construction Project
                </h2>
                <p className="text-sm text-gray-600">KS-2024-002</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Winning Company *
                    </label>
                    <select
                      value={awardFormData.winningCompany}
                      onChange={(e) =>
                        setAwardFormData({
                          ...awardFormData,
                          winningCompany: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select winning bidder</option>
                      <option value="1">
                        Northern Construction Ltd (�����2.3B - Score: 87.5)
                      </option>
                      <option value="2">
                        BuildRight Engineering (₦2.6B - Score: 76.5)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Award Amount *
                    </label>
                    <input
                      type="text"
                      value={awardFormData.awardAmount}
                      onChange={(e) =>
                        setAwardFormData({
                          ...awardFormData,
                          awardAmount: e.target.value,
                        })
                      }
                      placeholder="Enter final award amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Award Date *
                    </label>
                    <input
                      type="date"
                      value={awardFormData.awardDate}
                      onChange={(e) =>
                        setAwardFormData({
                          ...awardFormData,
                          awardDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Duration
                    </label>
                    <input
                      type="text"
                      value={awardFormData.contractDuration}
                      onChange={(e) =>
                        setAwardFormData({
                          ...awardFormData,
                          contractDuration: e.target.value,
                        })
                      }
                      placeholder="e.g., 12 months"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Award Letter/Letter of Intent
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload award letter or drag and drop
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
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
                  <label
                    htmlFor="notifyWinner"
                    className="text-sm text-gray-700"
                  >
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
                  <label
                    htmlFor="notifyUnsuccessful"
                    className="text-sm text-gray-700"
                  >
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
                  <label
                    htmlFor="publishOCDS"
                    className="text-sm text-gray-700"
                  >
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
                  <label
                    htmlFor="initiatePerformanceTracking"
                    className="text-sm text-gray-700"
                  >
                    Initiate vendor performance tracking
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAward}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Vendor Performance Management
                </h1>
                <p className="text-gray-600">
                  Track and record contractor performance during project
                  implementation.
                </p>
              </div>
              <button
                onClick={() => handleTabChange("tenders")}
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
                    <p className="text-sm font-medium text-gray-600">
                      Active Contracts
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {
                        vendorPerformances.filter((v) => v.status === "Active")
                          .length
                      }
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Performance Score
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(
                        vendorPerformances.reduce(
                          (sum, v) => sum + v.overallScore,
                          0,
                        ) / vendorPerformances.length,
                      )}
                      %
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Delayed Projects
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {
                        vendorPerformances.filter((v) => v.status === "Delayed")
                          .length
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Open Issues
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {vendorPerformances.reduce(
                        (sum, v) =>
                          sum +
                          v.issues.filter((i) => i.status === "Open").length,
                        0,
                      )}
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    Active Contract Performance
                  </h2>
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
                          <h3 className="text-lg font-medium text-gray-900">
                            {performance.projectTitle}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {performance.companyName} • Contract:{" "}
                            {performance.contractId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Value: {performance.contractValue} • Started:{" "}
                            {new Date(
                              performance.startDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {performance.overallScore}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Overall Score
                            </div>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              performance.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : performance.status === "Delayed"
                                  ? "bg-orange-100 text-orange-800"
                                  : performance.status === "Completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {performance.status}
                          </span>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">
                              Quality Score
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              {performance.qualityScore}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                              Timeliness Score
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              {performance.timelinessScore}%
                            </span>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-purple-800">
                              Budget Compliance
                            </span>
                            <span className="text-lg font-bold text-purple-600">
                              {performance.budgetCompliance}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Project Milestones
                        </h4>
                        <div className="space-y-2">
                          {performance.milestones
                            .slice(0, 3)
                            .map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {milestone.title}
                                    </span>
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        milestone.status === "Completed"
                                          ? "bg-green-100 text-green-800"
                                          : milestone.status === "Delayed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {milestone.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Expected:{" "}
                                    {new Date(
                                      milestone.expectedDate,
                                    ).toLocaleDateString()}
                                    {milestone.actualDate &&
                                      ` | Actual: ${new Date(milestone.actualDate).toLocaleDateString()}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    {milestone.completionPercentage}%
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Issues */}
                      {performance.issues.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Recent Issues
                          </h4>
                          <div className="space-y-2">
                            {performance.issues.slice(0, 2).map((issue) => (
                              <div
                                key={issue.id}
                                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-red-900">
                                      {issue.type}: {issue.description}
                                    </span>
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        issue.severity === "Critical"
                                          ? "bg-red-100 text-red-800"
                                          : issue.severity === "High"
                                            ? "bg-orange-100 text-orange-800"
                                            : issue.severity === "Medium"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {issue.severity}
                                    </span>
                                  </div>
                                  <p className="text-xs text-red-700 mt-1">
                                    Reported:{" "}
                                    {new Date(
                                      issue.reportedDate,
                                    ).toLocaleDateString()}
                                    {issue.resolvedDate &&
                                      ` | Resolved: ${new Date(issue.resolvedDate).toLocaleDateString()}`}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    issue.status === "Resolved"
                                      ? "bg-green-100 text-green-800"
                                      : issue.status === "In Progress"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
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
                        <button
                          onClick={() => handleUpdateProgress(performance)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
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
                <h1 className="text-2xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage system users and their permissions
                </p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">1,189</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Admin Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Ban className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Suspended
                    </p>
                    <p className="text-2xl font-bold text-gray-900">58</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Management Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    System Users
                  </h2>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
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
                        avatar: "AM",
                      },
                      {
                        id: "USR002",
                        name: "Fatima Ibrahim",
                        email: "fatima.ibrahim@kanoproc.gov.ng",
                        role: "Procurement Officer",
                        status: "Active",
                        lastActive: "2024-01-28T09:15:00Z",
                        avatar: "FI",
                      },
                      {
                        id: "USR003",
                        name: "Usman Garba",
                        email: "usman.garba@kanoproc.gov.ng",
                        role: "Finance Officer",
                        status: "Active",
                        lastActive: "2024-01-28T08:45:00Z",
                        avatar: "UG",
                      },
                      {
                        id: "USR004",
                        name: "Aisha Mohammed",
                        email: "aisha.mohammed@kanoproc.gov.ng",
                        role: "Legal Officer",
                        status: "Suspended",
                        lastActive: "2024-01-25T16:20:00Z",
                        avatar: "AM",
                      },
                      {
                        id: "USR005",
                        name: "Sani Abdullahi",
                        email: "sani.abdullahi@kanoproc.gov.ng",
                        role: "Technical Officer",
                        status: "Active",
                        lastActive: "2024-01-28T07:30:00Z",
                        avatar: "SA",
                      },
                    ].map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.avatar}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "Super Admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role.includes("Officer")
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : user.status === "Suspended"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
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
        // Add handlers for company approval operations
        const handleViewDetails = (company: Company) => {
          setSelectedCompanyForApproval(company);
          setViewMode("details");
        };

        const handleApproval = (company: Company) => {
          setSelectedCompanyForApproval(company);
          setViewMode("approval");
          setApprovalDecision("");
          setActionReason("");
          setSendNotification(true);
        };

        const submitApproval = () => {
          if (!selectedCompanyForApproval || !approvalDecision) return;

          if (
            (approvalDecision === "Suspended" ||
              approvalDecision === "Blacklisted") &&
            !actionReason.trim()
          ) {
            alert(
              `Please provide a reason for ${approvalDecision.toLowerCase()}`,
            );
            return;
          }

          handleCompanyStatusChange(
            selectedCompanyForApproval.id,
            approvalDecision,
            actionReason,
          );

          // Simulate sending notification
          if (sendNotification) {
            console.log(
              `Notification sent to ${selectedCompanyForApproval.email}`,
            );
          }
        };

        const exportData = () => {
          const dataStr = JSON.stringify(filteredCompanies, null, 2);
          const dataBlob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "company_registrations.json";
          link.click();
        };

        // Calculate dynamic stats
        const pendingCount = companies.filter(
          (c) => c.status === "Pending",
        ).length;
        const approvedCount = companies.filter(
          (c) => c.status === "Approved",
        ).length;
        const suspendedCount = companies.filter(
          (c) => c.status === "Suspended",
        ).length;
        const blacklistedCount = companies.filter(
          (c) => c.status === "Blacklisted",
        ).length;

        const filteredCompanies = companies.filter((company) => {
          const matchesSearch =
            company.companyName
              .toLowerCase()
              .includes(companySearchTerm.toLowerCase()) ||
            company.contactPerson
              .toLowerCase()
              .includes(companySearchTerm.toLowerCase()) ||
            company.email
              .toLowerCase()
              .includes(companySearchTerm.toLowerCase());
          const matchesStatus =
            companyStatusFilter === "all" ||
            company.status === companyStatusFilter;

          return matchesSearch && matchesStatus;
        });

        // Company Details View
        if (viewMode === "details" && selectedCompanyForApproval) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Company Details
                </h1>
                <button
                  onClick={() => setViewMode("list")}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-green-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Back to List
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Company Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Name
                        </label>
                        <p className="text-gray-900">
                          {selectedCompanyForApproval.companyName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Registration Number
                        </label>
                        <p className="text-gray-900">
                          {selectedCompanyForApproval.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Business Type
                        </label>
                        <p className="text-gray-900">
                          {selectedCompanyForApproval.businessType}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Contact Person
                        </label>
                        <p className="text-gray-900">
                          {selectedCompanyForApproval.contactPerson}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="text-gray-900">
                          {selectedCompanyForApproval.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <p className="text-gray-900">
                          {selectedCompanyForApproval.phone}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <p className="text-gray-900">
                          {selectedCompanyForApproval.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Status & Verification
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Current Status
                        </label>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedCompanyForApproval.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedCompanyForApproval.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedCompanyForApproval.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          CAC Verification
                        </label>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedCompanyForApproval.verificationStatus
                              .cac === "Verified"
                              ? "bg-green-100 text-green-800"
                              : selectedCompanyForApproval.verificationStatus
                                    .cac === "Failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedCompanyForApproval.verificationStatus.cac}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          FIRS Verification
                        </label>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            selectedCompanyForApproval.verificationStatus
                              .firs === "Verified"
                              ? "bg-green-100 text-green-800"
                              : selectedCompanyForApproval.verificationStatus
                                    .firs === "Failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedCompanyForApproval.verificationStatus.firs}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => setViewMode("list")}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Back to List
                      </button>
                      <button
                        onClick={() =>
                          handleApproval(selectedCompanyForApproval)
                        }
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                      >
                        Manage Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Company Approval View
        if (viewMode === "approval" && selectedCompanyForApproval) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Company Status Management
                </h1>
                <button
                  onClick={() => setViewMode("details")}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-green-700"
                >
                  Back to Details
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedCompanyForApproval.companyName}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Change Status To *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="decision"
                          value="Approved"
                          checked={approvalDecision === "Approved"}
                          onChange={(e) =>
                            setApprovalDecision(
                              e.target.value as
                                | "Approved"
                                | "Suspended"
                                | "Blacklisted",
                            )
                          }
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          Approved - Full Access
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="decision"
                          value="Suspended"
                          checked={approvalDecision === "Suspended"}
                          onChange={(e) =>
                            setApprovalDecision(
                              e.target.value as
                                | "Approved"
                                | "Suspended"
                                | "Blacklisted",
                            )
                          }
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <Shield className="h-4 w-4 text-orange-500 mr-1" />
                          Suspended - Limited Access
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="decision"
                          value="Blacklisted"
                          checked={approvalDecision === "Blacklisted"}
                          onChange={(e) =>
                            setApprovalDecision(
                              e.target.value as
                                | "Approved"
                                | "Suspended"
                                | "Blacklisted",
                            )
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex items-center">
                          <Ban className="h-4 w-4 text-red-500 mr-1" />
                          Blacklisted - No Access
                        </span>
                      </label>
                    </div>
                  </div>

                  {(approvalDecision === "Suspended" ||
                    approvalDecision === "Blacklisted") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for{" "}
                        {approvalDecision === "Suspended"
                          ? "Suspension"
                          : "Blacklisting"}{" "}
                        *
                      </label>
                      <textarea
                        rows={4}
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Please provide a detailed reason for ${approvalDecision === "Suspended" ? "suspension" : "blacklisting"}...`}
                      />
                    </div>
                  )}

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendNotification}
                        onChange={(e) => setSendNotification(e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Send automated email notification to the company
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setViewMode("details")}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitApproval}
                      disabled={
                        !approvalDecision ||
                        ((approvalDecision === "Suspended" ||
                          approvalDecision === "Blacklisted") &&
                          !actionReason.trim())
                      }
                      className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Main Companies List View
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Company Management (SuperUser)
                </h1>
                <p className="text-gray-600 mt-1">
                  Review and manage company registrations. Changes sync with
                  Admin dashboard.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </button>
              </div>
            </div>

            {/* Dynamic Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingCount}
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
                      {approvedCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Suspended
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {suspendedCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <Ban className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Blacklisted
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {blacklistedCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Company Registration Queue
                  </h2>
                  <div className="flex items-center space-x-3">
                    <select
                      value={companyStatusFilter}
                      onChange={(e) => setCompanyStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Blacklisted">Blacklisted</option>
                    </select>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={companySearchTerm}
                        onChange={(e) => setCompanySearchTerm(e.target.value)}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Person
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
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
                              {company.registrationNumber}
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
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(
                            company.registrationDate,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              company.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : company.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : company.status === "Suspended"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {company.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDetails(company)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4 inline mr-1" />
                            View Details
                          </button>

                          {company.status === "Pending" && (
                            <button
                              onClick={() => {
                                console.log(
                                  "🔄 SUPERUSER APPROVE BUTTON CLICKED",
                                );
                                console.log("Company ID:", company.id);
                                console.log("Company Email:", company.email);
                                console.log(
                                  "Company Name:",
                                  company.companyName,
                                );

                                handleCompanyStatusChange(
                                  company.id,
                                  "Approved",
                                  "Approved by superuser",
                                );

                                // Show success message
                                alert(
                                  `✅ ${company.companyName} has been approved successfully!`,
                                );
                              }}
                              className="text-green-600 hover:text-green-900 ml-3"
                            >
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleApproval(company)}
                            className="text-gray-600 hover:text-gray-900 ml-3"
                          >
                            <Settings className="h-4 w-4 inline mr-1" />
                            Manage Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No companies found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {companySearchTerm || companyStatusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "No company registrations available."}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "ocds":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  OCDS Data Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Open Contracting Data Standard compliance and publishing
                </p>
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
                    <p className="text-sm font-medium text-gray-600">
                      Total Records
                    </p>
                    <p className="text-2xl font-bold text-gray-900">1,847</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    Data Quality Score
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        94.2%
                      </div>
                      <p className="text-sm text-gray-600">
                        Overall compliance score
                      </p>
                    </div>
                    <div className="w-20 h-20">
                      <PieChart className="w-full h-full text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        field: "Planning Data",
                        score: 98,
                        status: "excellent",
                      },
                      { field: "Tender Data", score: 95, status: "good" },
                      { field: "Award Data", score: 92, status: "good" },
                      { field: "Contract Data", score: 89, status: "fair" },
                      {
                        field: "Implementation Data",
                        score: 85,
                        status: "fair",
                      },
                    ].map((item) => (
                      <div
                        key={item.field}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {item.field}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.status === "excellent"
                                  ? "bg-green-500"
                                  : item.status === "good"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                              }`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {item.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Publications */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Publications
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        type: "Tender",
                        title: "Road Construction Tender",
                        id: "OCDS-KN-2024-001",
                        publishedAt: "2024-01-28T10:30:00Z",
                        status: "Published",
                      },
                      {
                        type: "Award",
                        title: "Medical Equipment Supply Award",
                        id: "OCDS-KN-2024-002",
                        publishedAt: "2024-01-28T09:15:00Z",
                        status: "Published",
                      },
                      {
                        type: "Contract",
                        title: "School Building Contract",
                        id: "OCDS-KN-2024-003",
                        publishedAt: "2024-01-27T16:45:00Z",
                        status: "Published",
                      },
                      {
                        type: "Planning",
                        title: "Infrastructure Development Plan",
                        id: "OCDS-KN-2024-004",
                        publishedAt: "2024-01-27T14:20:00Z",
                        status: "Failed",
                      },
                    ].map((publication) => (
                      <div
                        key={publication.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                publication.type === "Tender"
                                  ? "bg-blue-100 text-blue-800"
                                  : publication.type === "Award"
                                    ? "bg-green-100 text-green-800"
                                    : publication.type === "Contract"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {publication.type}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                publication.status === "Published"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {publication.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {publication.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {publication.id}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(
                            publication.publishedAt,
                          ).toLocaleDateString()}
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    OCDS Records
                  </h2>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OCDS ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
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
                        dataQuality: 95,
                      },
                      {
                        ocdsId: "OCDS-KN-2024-002",
                        type: "Award",
                        title: "Medical Equipment Supply Award",
                        status: "Published",
                        lastUpdated: "2024-01-28T09:15:00Z",
                        dataQuality: 92,
                      },
                      {
                        ocdsId: "OCDS-KN-2024-003",
                        type: "Contract",
                        title: "School Building Construction Contract",
                        status: "Pending",
                        lastUpdated: "2024-01-27T16:45:00Z",
                        dataQuality: 88,
                      },
                      {
                        ocdsId: "OCDS-KN-2024-004",
                        type: "Planning",
                        title: "Infrastructure Development Planning",
                        status: "Failed",
                        lastUpdated: "2024-01-27T14:20:00Z",
                        dataQuality: 65,
                      },
                    ].map((record) => (
                      <tr key={record.ocdsId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.ocdsId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              record.type === "Tender"
                                ? "bg-blue-100 text-blue-800"
                                : record.type === "Award"
                                  ? "bg-green-100 text-green-800"
                                  : record.type === "Contract"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {record.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === "Published"
                                ? "bg-green-100 text-green-800"
                                : record.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
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

      case "no-objection-certificate":
        return <NoObjectionCertificate />;

      case "mda-management":
        return renderMDAManagement();

      case "mda-testing":
        return renderMDATesting();

      case "settings":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                System Settings
              </h1>
              <p className="text-gray-600">
                Configure system parameters, user preferences, and
                administrative settings
              </p>
            </div>

            {/* Data Management Section */}
            <DataManagement />

            {/* Quick Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* System Configuration */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    System Configuration
                  </h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      General Settings
                    </p>
                    <p className="text-sm text-gray-600">
                      Platform name, timezone, currency
                    </p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Email Configuration
                    </p>
                    <p className="text-sm text-gray-600">
                      SMTP settings, templates
                    </p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      File Upload Limits
                    </p>
                    <p className="text-sm text-gray-600">
                      Max sizes, allowed types
                    </p>
                  </button>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security & Access
                  </h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Password Policies
                    </p>
                    <p className="text-sm text-gray-600">
                      Requirements, expiration
                    </p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-600">Enable/disable 2FA</p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Session Management
                    </p>
                    <p className="text-sm text-gray-600">
                      Timeout, concurrent sessions
                    </p>
                  </button>
                </div>
              </div>

              {/* Procurement Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Procurement Rules
                  </h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Approval Thresholds
                    </p>
                    <p className="text-sm text-gray-600">
                      Monetary limits by authority
                    </p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Tender Timelines
                    </p>
                    <p className="text-sm text-gray-600">
                      Minimum notice periods
                    </p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Evaluation Criteria
                    </p>
                    <p className="text-sm text-gray-600">
                      Default scoring weights
                    </p>
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Bell className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        System alerts via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        SMS Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Critical alerts via SMS
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Push Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Browser notifications
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* AI & Automation */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI & Automation
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Fraud Detection
                      </p>
                      <p className="text-sm text-gray-600">
                        AI-powered fraud detection
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Smart Matching
                      </p>
                      <p className="text-sm text-gray-600">
                        Auto-match vendors to tenders
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Auto Reminders
                      </p>
                      <p className="text-sm text-gray-600">
                        Automated deadline alerts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Report Generation */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Report Settings
                  </h3>
                </div>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">
                      Auto-Generated Reports
                    </p>
                    <p className="text-sm text-gray-600">
                      Schedule automated reports
                    </p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Export Formats</p>
                    <p className="text-sm text-gray-600">
                      PDF, Excel, CSV preferences
                    </p>
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Data Retention</p>
                    <p className="text-sm text-gray-600">
                      Archive and backup settings
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Configuration */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Advanced Configuration
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* API Configuration */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      API & Integration Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Rate Limiting
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>1000 requests/hour</option>
                          <option>5000 requests/hour</option>
                          <option>10000 requests/hour</option>
                          <option>Unlimited</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://your-system.com/webhook"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          External System Integration
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              defaultChecked
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              REMITA Payment Gateway
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              CAC Verification System
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              defaultChecked
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              FIRS Tax Verification
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Settings */}
                  <div>
                    <h3 className="text-md font-semibold text-gray-900 mb-4">
                      Performance & Monitoring
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cache Duration
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>5 minutes</option>
                          <option>15 minutes</option>
                          <option>1 hour</option>
                          <option>24 hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Database Cleanup Schedule
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Daily at 2 AM</option>
                          <option>Weekly (Sunday 2 AM)</option>
                          <option>Monthly</option>
                          <option>Manual only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Log Retention Period
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>30 days</option>
                          <option>90 days</option>
                          <option>1 year</option>
                          <option>Indefinite</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Reset to Defaults
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Feature Coming Soon
            </h3>
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
                <h1 className="text-xl font-bold text-white">
                  KanoProc Super User
                </h1>
                <p className="text-xs text-blue-100">
                  Advanced System Administration
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { key: "dashboard", label: "Dashboard", icon: BarChart3 },
                { key: "companies", label: "Companies", icon: Users },
                { key: "tenders", label: "Tenders", icon: FileText },
                { key: "reports", label: "Reports", icon: TrendingUp },
                { key: "ai-insights", label: "AI Insights", icon: Brain },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as ActiveTab)}
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
              {
                key: "reports",
                label: "Reports & Analytics",
                icon: TrendingUp,
              },
              { key: "ocds", label: "OCDS Data", icon: Database },
              { key: "ai-insights", label: "AI Insights", icon: Brain },
              { key: "company-status", label: "Company Status", icon: Shield },
              { key: "audit-logs", label: "Audit Logs", icon: Activity },
              {
                key: "no-objection-certificate",
                label: "No Objection Certificate",
                icon: FileCheck,
              },
              {
                key: "mda-management",
                label: "MDA Management",
                icon: Building2,
              },
              {
                key: "mda-testing",
                label: "MDA Testing",
                icon: RefreshCw,
              },
              { key: "settings", label: "Settings", icon: Settings },
              { key: "feedback", label: "Feedback", icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as ActiveTab)}
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

            {/* Quick access to NOC Management Tab */}
            <button
              onClick={() => handleTabChange("no-objection-certificate")}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "no-objection-certificate"
                  ? "text-blue-600 bg-blue-50 border-l-2 border-blue-500"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-l-2 border-green-500"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>NOC Management</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderDashboardContent()}
      </main>

      {/* Digital Signature Modal */}
      {showDigitalSignModal && selectedAwardTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔐 Digital Contract Signing
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Contract: {selectedAwardTender.title} • Awarded to:{" "}
              {selectedAwardTender.awardedCompany}
            </p>

            <div className="space-y-6">
              {/* Digital Certificate Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Digital Certificate Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">
                      Certificate Authority:
                    </span>
                    <p className="text-blue-700">Kano State Government PKI</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Certificate ID:
                    </span>
                    <p className="text-blue-700">
                      {digitalSignatureData.certificateId || "CERT-KS-2024-001"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Signing Method:
                    </span>
                    <p className="text-blue-700">PKI with SHA-256 Hash</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Validity:</span>
                    <p className="text-green-700">✅ Valid & Active</p>
                  </div>
                </div>
              </div>

              {/* Signature Configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature Method
                  </label>
                  <select
                    value={digitalSignatureData.signatureMethod}
                    onChange={(e) =>
                      setDigitalSignatureData({
                        ...digitalSignatureData,
                        signatureMethod: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PKI">
                      PKI Certificate (Government Standard)
                    </option>
                    <option value="HSM">Hardware Security Module</option>
                    <option value="Cloud">Cloud-based Signing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signing Purpose
                  </label>
                  <input
                    type="text"
                    value={digitalSignatureData.purpose}
                    onChange={(e) =>
                      setDigitalSignatureData({
                        ...digitalSignatureData,
                        purpose: e.target.value,
                      })
                    }
                    placeholder="e.g., Contract Execution and Authorization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signing Location
                  </label>
                  <input
                    type="text"
                    value={digitalSignatureData.location}
                    onChange={(e) =>
                      setDigitalSignatureData({
                        ...digitalSignatureData,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contract Hash Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-medium text-gray-900 mb-2">
                  📄 Document Hash Preview
                </h4>
                <p className="text-xs font-mono text-gray-600 break-all">
                  SHA256:{" "}
                  {digitalSignatureData.signedHash ||
                    "Will be generated upon signing..."}
                </p>
              </div>

              {/* Legal Notice */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">
                      Legal Notice
                    </h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      This digital signature has the same legal validity as a
                      handwritten signature under the Electronic Transactions
                      Act. By proceeding, you certify that you have the
                      authority to execute this contract on behalf of Kano State
                      Government.
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="timestampSign"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="timestampSign"
                    className="text-sm text-gray-700"
                  >
                    Apply trusted timestamp
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="blockchainRecord"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="blockchainRecord"
                    className="text-sm text-gray-700"
                  >
                    Record on blockchain for immutable audit trail
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notifyParties"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="notifyParties"
                    className="text-sm text-gray-700"
                  >
                    Send signed contract to all parties
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDigitalSignModal(false);
                  setSelectedAwardTender(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDigitalSign}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Shield className="h-4 w-4 mr-2" />
                Apply Digital Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Award Letter Modal */}
      {showAwardLetterModal && selectedAwardTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📧 Generate Electronic Award Letter
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Contract: {selectedAwardTender.title} • Awarded to:{" "}
              {selectedAwardTender.awardedCompany}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Letter Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Letter Configuration
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={awardLetterData.referenceNumber}
                    onChange={(e) =>
                      setAwardLetterData({
                        ...awardLetterData,
                        referenceNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Letter Date
                  </label>
                  <input
                    type="date"
                    value={awardLetterData.letterDate}
                    onChange={(e) =>
                      setAwardLetterData({
                        ...awardLetterData,
                        letterDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={awardLetterData.subject}
                    onChange={(e) =>
                      setAwardLetterData({
                        ...awardLetterData,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={awardLetterData.recipientName}
                    onChange={(e) =>
                      setAwardLetterData({
                        ...awardLetterData,
                        recipientName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Details
                  </label>
                  <textarea
                    rows={4}
                    value={awardLetterData.contractDetails}
                    onChange={(e) =>
                      setAwardLetterData({
                        ...awardLetterData,
                        contractDetails: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity Period (Days)
                  </label>
                  <input
                    type="number"
                    value={awardLetterData.validity}
                    onChange={(e) =>
                      setAwardLetterData({
                        ...awardLetterData,
                        validity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Letter Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Letter Preview</h4>
                <div className="bg-gray-50 border rounded-lg p-4 text-sm">
                  <div className="text-center mb-4">
                    <h5 className="font-bold text-green-700">
                      KANO STATE GOVERNMENT
                    </h5>
                    <p className="text-xs">Bureau of Public Procurement</p>
                  </div>

                  <div className="mb-4">
                    <p>
                      <strong>Ref:</strong> {awardLetterData.referenceNumber}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {awardLetterData.letterDate
                        ? new Date(
                            awardLetterData.letterDate,
                          ).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p>
                      <strong>To:</strong>
                      <br />
                      {awardLetterData.recipientName}
                      <br />
                      [Company Address]
                    </p>
                  </div>

                  <div className="mb-4">
                    <p>
                      <strong>Subject:</strong> {awardLetterData.subject}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p>Dear Sir/Madam,</p>
                    <p className="mt-2">
                      We are pleased to inform you that your company has been
                      awarded the above-mentioned contract.
                    </p>
                    <div className="mt-2 p-2 bg-white border rounded">
                      {awardLetterData.contractDetails}
                    </div>
                    <p className="mt-2">
                      This award is valid for {awardLetterData.validity} days
                      from the date of this letter.
                    </p>
                  </div>

                  <div className="mt-4">
                    <p>Yours sincerely,</p>
                    <div className="mt-4">
                      <p className="font-bold">Director General</p>
                      <p className="text-xs">Bureau of Public Procurement</p>
                      <p className="text-xs">🔐 Digitally Signed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAwardLetterModal(false);
                  setSelectedAwardTender(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-green-300 rounded-md text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Download PDF
              </button>
              <button
                onClick={sendEAwardLetter}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send E-Award Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Award Modal */}
      {showAwardModal && selectedAwardTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Award Tender: {selectedAwardTender.title}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {selectedAwardTender.id}
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Winning Company *
                  </label>
                  <select
                    value={awardFormData.winningCompany}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        winningCompany: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select winning bidder</option>
                    <option value="Northern Construction Ltd (₦2.3B - Score: 87.5)">
                      Northern Construction Ltd (��2.3B - Score: 87.5)
                    </option>
                    <option value="BuildRight Engineering (₦2.6B - Score: 76.5)">
                      BuildRight Engineering (��2.6B - Score: 76.5)
                    </option>
                    <option value="Kano Infrastructure Corp (₦2.1B - Score: 82.0)">
                      Kano Infrastructure Corp (₦2.1B - Score: 82.0)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Award Amount *
                  </label>
                  <input
                    type="text"
                    value={awardFormData.awardAmount}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        awardAmount: e.target.value,
                      })
                    }
                    placeholder="Enter final award amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Award Date *
                  </label>
                  <input
                    type="date"
                    value={awardFormData.awardDate}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        awardDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Duration
                  </label>
                  <input
                    type="text"
                    value={awardFormData.contractDuration}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        contractDuration: e.target.value,
                      })
                    }
                    placeholder="e.g., 12 months"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notifyWinner"
                    checked={awardFormData.notifyWinner}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        notifyWinner: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="notifyWinner"
                    className="text-sm text-gray-700"
                  >
                    Notify winning company via email
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notifyUnsuccessful"
                    checked={awardFormData.notifyUnsuccessful}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        notifyUnsuccessful: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="notifyUnsuccessful"
                    className="text-sm text-gray-700"
                  >
                    Notify unsuccessful companies
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="publishOCDS"
                    checked={awardFormData.publishOCDS}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        publishOCDS: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="publishOCDS"
                    className="text-sm text-gray-700"
                  >
                    Publish OCDS award release
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="initiatePerformanceTracking"
                    checked={awardFormData.initiatePerformanceTracking}
                    onChange={(e) =>
                      setAwardFormData({
                        ...awardFormData,
                        initiatePerformanceTracking: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="initiatePerformanceTracking"
                    className="text-sm text-gray-700"
                  >
                    Initiate vendor performance tracking
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAwardModal(false);
                  setSelectedAwardTender(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAward}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Award Tender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Signing Modal */}
      {showContractModal && selectedAwardTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contract Signing: {selectedAwardTender.title}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {selectedAwardTender.id} • Awarded to:{" "}
              {selectedAwardTender.awardedCompany}
            </p>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Contract Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Contract Value:</span>
                    <p className="text-blue-800">
                      {selectedAwardTender.awardAmount ||
                        selectedAwardTender.estimatedValue}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Award Date:</span>
                    <p className="text-blue-800">
                      {selectedAwardTender.awardDate
                        ? new Date(
                            selectedAwardTender.awardDate,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Document
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload signed contract document
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Bond Amount (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notifyContractSigning"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="notifyContractSigning"
                    className="text-sm text-gray-700"
                  >
                    Notify all stakeholders of contract signing
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="initiateProjectTracking"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="initiateProjectTracking"
                    className="text-sm text-gray-700"
                  >
                    Initiate project performance tracking
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="setupPaymentSchedule"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="setupPaymentSchedule"
                    className="text-sm text-gray-700"
                  >
                    Setup automatic payment schedule
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowContractModal(false);
                  setSelectedAwardTender(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitContract}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FileCheck className="h-4 w-4 mr-2 inline" />
                Sign Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Blacklist Company
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to blacklist{" "}
              <strong>{selectedCompany.companyName}</strong>? This will prevent
              them from participating in any procurement processes.
            </p>
            <div className="mb-4">
              <label
                htmlFor="blacklistReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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

      {/* Update Progress Modal */}
      {showUpdateProgressModal && selectedVendorPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-600" />
              Update Progress - {selectedVendorPerformance.projectTitle}
            </h3>

            {/* Project Overview */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Company</p>
                  <p className="text-gray-900">
                    {selectedVendorPerformance.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Contract Value
                  </p>
                  <p className="text-gray-900">
                    {selectedVendorPerformance.contractValue}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedVendorPerformance.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : selectedVendorPerformance.status === "Delayed"
                          ? "bg-orange-100 text-orange-800"
                          : selectedVendorPerformance.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedVendorPerformance.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Scores */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Performance Metrics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={selectedVendorPerformance.qualityScore}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const updated = {
                        ...selectedVendorPerformance,
                        qualityScore: parseInt(e.target.value) || 0,
                      };
                      setSelectedVendorPerformance(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeliness Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={selectedVendorPerformance.timelinessScore}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const updated = {
                        ...selectedVendorPerformance,
                        timelinessScore: parseInt(e.target.value) || 0,
                      };
                      setSelectedVendorPerformance(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Compliance (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={selectedVendorPerformance.budgetCompliance}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const updated = {
                        ...selectedVendorPerformance,
                        budgetCompliance: parseInt(e.target.value) || 0,
                      };
                      setSelectedVendorPerformance(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Status
                  </label>
                  <select
                    defaultValue={selectedVendorPerformance.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const updated = {
                        ...selectedVendorPerformance,
                        status: e.target.value as
                          | "Active"
                          | "Completed"
                          | "Delayed"
                          | "Terminated",
                      };
                      setSelectedVendorPerformance(updated);
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Project Milestones
              </h4>
              <div className="space-y-4">
                {selectedVendorPerformance.milestones.map(
                  (milestone, index) => (
                    <div
                      key={milestone.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Milestone
                          </label>
                          <p className="text-sm text-gray-900">
                            {milestone.title}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            defaultValue={milestone.status}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onChange={(e) => {
                              const updatedMilestones = [
                                ...selectedVendorPerformance.milestones,
                              ];
                              updatedMilestones[index] = {
                                ...milestone,
                                status: e.target.value as
                                  | "Pending"
                                  | "Completed"
                                  | "Delayed",
                              };
                              setSelectedVendorPerformance({
                                ...selectedVendorPerformance,
                                milestones: updatedMilestones,
                              });
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Completion (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={milestone.completionPercentage}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onChange={(e) => {
                              const updatedMilestones = [
                                ...selectedVendorPerformance.milestones,
                              ];
                              updatedMilestones[index] = {
                                ...milestone,
                                completionPercentage:
                                  parseInt(e.target.value) || 0,
                              };
                              setSelectedVendorPerformance({
                                ...selectedVendorPerformance,
                                milestones: updatedMilestones,
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Actual Date
                          </label>
                          <input
                            type="date"
                            defaultValue={milestone.actualDate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            onChange={(e) => {
                              const updatedMilestones = [
                                ...selectedVendorPerformance.milestones,
                              ];
                              updatedMilestones[index] = {
                                ...milestone,
                                actualDate: e.target.value,
                              };
                              setSelectedVendorPerformance({
                                ...selectedVendorPerformance,
                                milestones: updatedMilestones,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Add New Issue */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Report New Issue
              </h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-red-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                      <option value="">Select type...</option>
                      <option value="Quality">Quality</option>
                      <option value="Timeline">Timeline</option>
                      <option value="Budget">Budget</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                      <option value="">Select severity...</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Describe the issue in detail..."
                  />
                </div>
                <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                  <Plus className="h-4 w-4 mr-1 inline" />
                  Add Issue
                </button>
              </div>
            </div>

            {/* Current Issues */}
            {selectedVendorPerformance.issues.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Current Issues
                </h4>
                <div className="space-y-2">
                  {selectedVendorPerformance.issues.map((issue, index) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {issue.type}: {issue.description}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              issue.severity === "Critical"
                                ? "bg-red-100 text-red-800"
                                : issue.severity === "High"
                                  ? "bg-orange-100 text-orange-800"
                                  : issue.severity === "Medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Reported:{" "}
                          {new Date(issue.reportedDate).toLocaleDateString()}
                          {issue.resolvedDate &&
                            ` | Resolved: ${new Date(issue.resolvedDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <select
                        defaultValue={issue.status}
                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                        onChange={(e) => {
                          const updatedIssues = [
                            ...selectedVendorPerformance.issues,
                          ];
                          updatedIssues[index] = {
                            ...issue,
                            status: e.target.value as
                              | "Open"
                              | "In Progress"
                              | "Resolved",
                          };
                          if (
                            e.target.value === "Resolved" &&
                            !issue.resolvedDate
                          ) {
                            updatedIssues[index].resolvedDate =
                              new Date().toISOString();
                          }
                          setSelectedVendorPerformance({
                            ...selectedVendorPerformance,
                            issues: updatedIssues,
                          });
                        }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowUpdateProgressModal(false);
                  setSelectedVendorPerformance(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedVendorPerformance) {
                    // Calculate overall score based on updated metrics
                    const overallScore = Math.round(
                      (selectedVendorPerformance.qualityScore +
                        selectedVendorPerformance.timelinessScore +
                        selectedVendorPerformance.budgetCompliance) /
                        3,
                    );
                    updateVendorPerformance({
                      ...selectedVendorPerformance,
                      overallScore,
                    });
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CheckSquare className="h-4 w-4 mr-2 inline" />
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MDA Management Modals */}
      <MDAForm
        isOpen={showCreateMDAModal || showEditMDAModal}
        onClose={() => {
          setShowCreateMDAModal(false);
          setShowEditMDAModal(false);
          setSelectedMDA(null);
        }}
        onSubmit={handleMDASubmit}
        mode={mdaFormMode}
        initialData={selectedMDA}
        parentMDAs={mdas
          .filter((m) => m.type === "ministry")
          .map((m) => ({ id: m.id, name: m.name, type: m.type }))}
      />

      <MDAAdminForm
        isOpen={showCreateAdminModal || showEditAdminModal}
        onClose={() => {
          setShowCreateAdminModal(false);
          setShowEditAdminModal(false);
          setSelectedMDA(null);
          setSelectedMDAAdmin(null);
        }}
        onSubmit={handleMDAAdminSubmit}
        mdas={mdas}
        selectedMDA={selectedMDA}
        mode={adminFormMode}
        initialData={selectedMDAAdmin}
      />

      {selectedMDA && (
        <MDAUserForm
          isOpen={showCreateUserModal || showEditUserModal}
          onClose={() => {
            setShowCreateUserModal(false);
            setShowEditUserModal(false);
            setSelectedMDA(null);
            setSelectedMDAUser(null);
          }}
          onSubmit={handleMDAUserSubmit}
          mda={selectedMDA}
          mode={userFormMode}
          initialData={selectedMDAUser}
        />
      )}
    </div>
  );
}
