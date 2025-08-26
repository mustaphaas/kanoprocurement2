import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Calendar,
  Clock,
  Users,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  MessageSquare,
  Award,
  Scale,
  Shield,
  Bell,
  FileCheck,
  DollarSign,
  Target,
  Settings,
} from "lucide-react";
import {
  tenderSettingsManager,
  tenderStatusChecker,
  TenderStatus,
  TenderStatusInfo,
} from "@/lib/tenderSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateTenderId,
  initializeTenderCounter,
} from "@/lib/tenderIdGenerator";

// Types
interface Tender {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: TenderStatus;
  createdDate: string;
  publishedDate?: string;
  closingDate?: string;
  openingDate?: string;
  ministry: string;
  department: string;
  tenderType: "Open" | "Selective" | "Limited";
  procurementMethod: "NCB" | "ICB" | "QCBS" | "CQS" | "SSS";
  documents: TenderDocument[];
  amendments: TenderAmendment[];
  bidders: Bidder[];
  evaluation: TenderEvaluation;
  timeline: TenderTimelineEvent[];

  // NOC and Contract linking
  nocId?: string;
  nocStatus?: "Pending" | "Approved" | "Rejected";
  nocCertificateNumber?: string;
  contractId?: string;
  contractStatus?: "Draft" | "Active" | "Completed" | "Terminated";

  // Workflow tracking
  workflowStage?:
    | "Planning"
    | "Procurement"
    | "Evaluation"
    | "NOC Review"
    | "Contract Award"
    | "Implementation"
    | "Closeout";
  lastUpdated?: string;
}

interface TenderDocument {
  id: string;
  name: string;
  type: "RFP" | "TOR" | "BOQ" | "Eligibility" | "Technical" | "Other";
  size: string;
  uploadDate: string;
  downloadCount: number;
}

interface TenderAmendment {
  id: string;
  title: string;
  description: string;
  amendmentDate: string;
  documents: TenderDocument[];
}

interface Bidder {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  submissionDate?: string;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  status: "Interested" | "Submitted" | "Qualified" | "Disqualified" | "Awarded";
  documents: BidDocument[];
}

interface BidDocument {
  id: string;
  name: string;
  type: "Technical" | "Financial" | "Supporting";
  submitDate: string;
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected";
}

interface TenderEvaluation {
  id: string;
  technicalCriteria: EvaluationCriteria[];
  financialCriteria: EvaluationCriteria[];
  committee: CommitteeMember[];
  technicalThreshold: number;
  financialWeight: number;
  technicalWeight: number;
  status: "Not Started" | "Technical" | "Financial" | "Combined" | "Complete";
}

interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  description: string;
}

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  department: string;
  isChairman: boolean;
  conflictDeclared: boolean;
}

interface TenderTimelineEvent {
  id: string;
  event: string;
  date: string;
  status: "Upcoming" | "Current" | "Completed" | "Overdue";
  description: string;
}

// Storage keys
const STORAGE_KEYS = {
  TENDERS: "kanoproc_tenders",
  TENDER_DOCUMENTS: "kanoproc_tender_documents",
  BIDDERS: "kanoproc_bidders",
  EVALUATIONS: "kanoproc_evaluations",
};

const TenderManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Function to get bid count for a specific tender
  const getBidCount = (tenderId: string): number => {
    try {
      const storedBids = localStorage.getItem("tenderBids");
      if (!storedBids) return 0;

      const bids = JSON.parse(storedBids);
      return bids.filter((bid: any) => bid.tenderId === tenderId).length;
    } catch (error) {
      console.error("Error reading bids:", error);
      return 0;
    }
  };

  // Function to get all bids for a specific tender
  const getBidsForTender = (tenderId: string): any[] => {
    try {
      const storedBids = localStorage.getItem("tenderBids");
      if (!storedBids) return [];

      const bids = JSON.parse(storedBids);
      return bids.filter((bid: any) => bid.tenderId === tenderId);
    } catch (error) {
      console.error("Error reading bids:", error);
      return [];
    }
  };

  // Function to synchronize tender data across all storage locations
  const synchronizeAllTenderStores = () => {
    try {
      // Get ministry info for prefixing
      const ministryInfo = getMinistryInfo();
      const ministryCode = ministryInfo.code;

      // Load tenders from main store
      const mainTenders = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENDERS) || "[]");

      // Convert to Company Dashboard format (recentTenders)
      const recentTendersFormat = mainTenders.map((tender: any) => ({
        id: tender.id,
        title: tender.title,
        description: tender.description,
        category: "General",
        value: tender.budget.toString(), // Company Dashboard expects string
        deadline: tender.closingDate,
        location: "Kano State",
        views: Math.floor(Math.random() * 200) + 50,
        status: tender.status === "Published" ? "Open" : tender.status,
        publishDate: tender.publishedDate || tender.createdDate,
        closingDate: tender.closingDate,
        tenderFee: "₦25,000",
        procuringEntity: tender.ministry,
        duration: "12 months",
        eligibility: "Qualified contractors with relevant experience",
        requirements: [
          "Valid CAC certificate",
          "Tax clearance for last 3 years",
          "Professional license",
          "Evidence of similar projects",
          "Financial capacity documentation"
        ],
        technicalSpecs: [
          "Project specifications as detailed in tender document",
          "Quality standards must meet government requirements",
          "Timeline adherence is mandatory"
        ]
      }));

      // Convert to Homepage format (featuredTenders)
      const featuredTendersFormat = mainTenders.map((tender: any) => ({
        id: tender.id,
        title: tender.title,
        description: tender.description,
        value: formatCurrency(tender.budget),
        deadline: new Date(tender.closingDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status: tender.status === "Published" ? "Open" : tender.status,
        statusColor: (tender.status === "Open" || tender.status === "Published")
          ? "bg-green-100 text-green-800"
          : (tender.status === "Closing Soon")
          ? "bg-orange-100 text-orange-800"
          : "bg-gray-100 text-gray-800",
        category: "General",
        ministry: tender.ministry,
        createdAt: Date.now(),
      }));

      // Update all storage locations with proper formats
      localStorage.setItem("recentTenders", JSON.stringify(recentTendersFormat));
      localStorage.setItem("featuredTenders", JSON.stringify(featuredTendersFormat.slice(0, 5)));
      localStorage.setItem(`${ministryCode}_recentTenders`, JSON.stringify(recentTendersFormat));
      localStorage.setItem(`${ministryCode}_tenders`, JSON.stringify(mainTenders));
      localStorage.setItem(`${ministryCode}_featuredTenders`, JSON.stringify(featuredTendersFormat.slice(0, 5)));

      console.log("Synchronized tender data across all stores");
      return mainTenders;
    } catch (error) {
      console.error("Error synchronizing tender stores:", error);
      return [];
    }
  };

  // Function to force refresh tenders from storage
  const forceRefreshTenders = () => {
    const storedTenders = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENDERS) || "[]");
    const syncedTenders = storedTenders.map((tender: any) => synchronizeTenderStatus(tender));
    setTenders(syncedTenders);
    synchronizeAllTenderStores();
    return syncedTenders;
  };

  // Stepper state for evaluation workflow
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState({
    step1: { completed: false, locked: false },
    step2: { completed: false, locked: true },
    step3: { completed: false, locked: true },
  });
  const [committeeAssigned, setCommitteeAssigned] = useState(false);
  const [coiResolved, setCoiResolved] = useState(false);

  // Form states
  const [tenderForm, setTenderForm] = useState({
    title: "",
    description: "",
    budget: "",
    tenderType: "Open",
    procurementMethod: "NCB",
    closingDate: "",
    documents: [] as File[],
  });

  const [amendmentForm, setAmendmentForm] = useState({
    title: "",
    description: "",
    documents: [] as File[],
  });

  // Load data from localStorage
  useEffect(() => {
    const loadFromStorage = (key: string) => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    };

    // Load and synchronize tenders with NOC and contract data
    const loadSynchronizedTenders = () => {
      const rawTenders = loadFromStorage(STORAGE_KEYS.TENDERS);
      const synchronizedTenders = rawTenders.map((tender: Tender) =>
        synchronizeTenderStatus(tender),
      );
      return synchronizedTenders;
    };

    setTenders(loadSynchronizedTenders());

    // Listen for NOC and contract updates
    const handleNOCUpdate = (event: CustomEvent) => {
      const { tenderId, nocId, status, certificateNumber } = event.detail;
      updateTenderFromNOC(tenderId, nocId, status, certificateNumber);
    };

    const handleContractUpdate = (event: CustomEvent) => {
      const { tenderId, contractId, contractData } = event.detail;
      updateTenderFromContract(tenderId, contractId, contractData);
    };

    window.addEventListener(
      "nocStatusUpdated",
      handleNOCUpdate as EventListener,
    );
    window.addEventListener(
      "contractCreated",
      handleContractUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "nocStatusUpdated",
        handleNOCUpdate as EventListener,
      );
      window.removeEventListener(
        "contractCreated",
        handleContractUpdate as EventListener,
      );
    };
  }, []);

  // Synchronize tender status with NOC and contract data
  const synchronizeTenderStatus = (tender: Tender): Tender => {
    // First apply automatic date-based status transitions
    let updatedTender = { ...tender };

    // Convert Published to Open for ministry display
    if (tender.status === "Published") {
      updatedTender.status = "Open" as TenderStatus;
    }

    // Apply automatic status transitions based on dates
    if (tender.closingDate) {
      const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
        updatedTender.status,
        tender.closingDate,
        tender.publishedDate,
      );

      // Update status if it changed due to automatic transition
      if (automaticStatus !== updatedTender.status) {
        updatedTender.status = automaticStatus;
        updatedTender.lastUpdated = new Date().toISOString();

        // If tender just moved to Closed, check if we should start evaluation
        if (
          automaticStatus === "Closed" &&
          tenderStatusChecker.shouldStartEvaluation(automaticStatus)
        ) {
          // Update workflow stage to evaluation
          updatedTender.workflowStage = "Evaluation";

          // If evaluation hasn't been set up yet, initialize it
          if (updatedTender.evaluation?.status === "Not Started") {
            updatedTender.evaluation.status = "Technical";
          }
        }
      }
    }
    // Check NOC status
    const nocRequests = JSON.parse(
      localStorage.getItem("centralNOCRequests") || "[]",
    );
    const relatedNOC = nocRequests.find(
      (noc: any) => noc.tenderId === updatedTender.id,
    );

    // Check contract status
    const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
    const relatedContract = contracts.find(
      (contract: any) => contract.tenderId === updatedTender.id,
    );

    if (relatedContract) {
      // Contract exists - highest priority status
      updatedTender.contractId = relatedContract.id;
      updatedTender.contractStatus = relatedContract.status;
      updatedTender.workflowStage =
        relatedContract.status === "Active"
          ? "Implementation"
          : "Contract Award";

      if (relatedContract.status === "Active") {
        updatedTender.status = "Contract Signed";
      } else if (relatedContract.status === "Completed") {
        updatedTender.status = "Completed";
      } else {
        updatedTender.status = "Contract Created";
      }
    } else if (relatedNOC) {
      // NOC exists but no contract yet
      updatedTender.nocId = relatedNOC.id;
      updatedTender.nocStatus = relatedNOC.status;
      updatedTender.nocCertificateNumber = relatedNOC.certificateNumber;
      updatedTender.workflowStage = "NOC Review";

      if (relatedNOC.status === "Approved") {
        updatedTender.status = "NOC Approved";
      } else if (relatedNOC.status === "Rejected") {
        updatedTender.status = "NOC Rejected";
      } else {
        updatedTender.status = "NOC Pending";
      }
    } else if (
      tender.evaluation?.status === "Complete" ||
      tender.status === "Evaluated"
    ) {
      // Evaluation complete but no NOC yet
      updatedTender.workflowStage = "Evaluation";
      if (tender.status !== "NOC Pending") {
        // Only update to Evaluated if not already in a post-evaluation stage
        if (
          ["Active", "Closing Soon", "Closed"].includes(updatedTender.status)
        ) {
          updatedTender.status = "Evaluated";
        }
      }
    }

    updatedTender.lastUpdated = new Date().toISOString();
    return updatedTender;
  };

  const updateTenderFromNOC = (
    tenderId: string,
    nocId: string,
    status: string,
    certificateNumber?: string,
  ) => {
    setTenders((prevTenders) => {
      const updatedTenders = prevTenders.map((tender) =>
        tender.id === tenderId
          ? {
              ...tender,
              nocId,
              nocStatus: status as "Pending" | "Approved" | "Rejected",
              nocCertificateNumber: certificateNumber,
              status:
                status === "Approved"
                  ? "NOC Approved"
                  : status === "Rejected"
                    ? "NOC Rejected"
                    : "NOC Pending",
              workflowStage: "NOC Review" as const,
              lastUpdated: new Date().toISOString(),
            }
          : tender,
      );
      saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);
      return updatedTenders;
    });
  };

  const updateTenderFromContract = (
    tenderId: string,
    contractId: string,
    contractData: any,
  ) => {
    setTenders((prevTenders) => {
      const updatedTenders = prevTenders.map((tender) =>
        tender.id === tenderId
          ? {
              ...tender,
              contractId,
              contractStatus: contractData.status as
                | "Draft"
                | "Active"
                | "Completed"
                | "Terminated",
              status: "Contract Created" as const,
              workflowStage: "Contract Award" as const,
              lastUpdated: new Date().toISOString(),
            }
          : tender,
      );
      saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);
      return updatedTenders;
    });
  };

  // Save to localStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Mock data for initial load
  useEffect(() => {
    const loadFromStorage = (key: string) => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    };

    const existingTenders = loadFromStorage(STORAGE_KEYS.TENDERS);

    if (existingTenders.length === 0) {
      const now = new Date();
      const mockTenders: Tender[] = [
        {
          id: "T001",
          title: "Construction of Primary Healthcare Centers",
          description:
            "Construction of 5 primary healthcare centers across rural communities",
          budget: 250000000,
          status: "Published",
          createdDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          publishedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          closingDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          openingDate: "2024-02-21",
          ministry: "Ministry of Health",
          department: "Primary Healthcare Development",
          tenderType: "Open",
          procurementMethod: "ICB",
          documents: [],
          amendments: [],
          bidders: [],
          evaluation: {
            id: "E001",
            technicalCriteria: [],
            financialCriteria: [],
            committee: [],
            technicalThreshold: 70,
            financialWeight: 30,
            technicalWeight: 70,
            status: "Not Started",
          },
          timeline: [],
        },
        {
          id: "T002",
          title: "Supply of Medical Equipment",
          description:
            "Procurement of modern medical equipment for state hospitals",
          budget: 150000000,
          status: "Open",
          createdDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          publishedDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          closingDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          ministry: "Ministry of Health",
          department: "Medical Equipment",
          tenderType: "Open",
          procurementMethod: "QCBS",
          documents: [],
          amendments: [],
          bidders: [],
          evaluation: {
            id: "E002",
            technicalCriteria: [],
            financialCriteria: [],
            committee: [],
            technicalThreshold: 75,
            financialWeight: 40,
            technicalWeight: 60,
            status: "Not Started",
          },
          timeline: [],
        },
      ];

      const syncedMockTenders = mockTenders.map(tender => synchronizeTenderStatus(tender));
      setTenders(syncedMockTenders);
      saveToStorage(STORAGE_KEYS.TENDERS, syncedMockTenders);
      synchronizeAllTenderStores();
    } else {
      const syncedExistingTenders = existingTenders.map((tender: any) => synchronizeTenderStatus(tender));
      setTenders(syncedExistingTenders);
      synchronizeAllTenderStores();
    }
  }, []);

  // Get ministry info from localStorage (same logic as MinistryDashboard)
  const getMinistryInfo = () => {
    const ministryUser = localStorage.getItem("ministryUser");
    if (!ministryUser) {
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
      // You would need to import getMinistryById function or implement similar logic here
      return {
        name: "Ministry of Health", // fallback for now
        code: "MOH",
        contactEmail: "health@kanostate.gov.ng",
        contactPhone: "08012345678",
        address: "Kano State Secretariat, Kano",
      };
    } catch (error) {
      console.error("Error parsing ministry user data:", error);
      return {
        name: "Ministry of Health",
        code: "MOH",
        contactEmail: "health@kanostate.gov.ng",
        contactPhone: "08012345678",
        address: "Kano State Secretariat, Kano",
      };
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return amount;
    return `₦${num.toLocaleString()}`;
  };

  const getBidCountForTender = (tenderId: string) => {
    return Math.floor(Math.random() * 8) + 3; // Random number between 3-10
  };

  const handleCreateTender = (isDraft = false) => {
    if (
      !tenderForm.title ||
      !tenderForm.description ||
      !tenderForm.budget ||
      !tenderForm.closingDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Get ministry info
    const ministryInfo = getMinistryInfo();

    // Initialize counter on first use
    initializeTenderCounter();

    // Generate proper tender ID (KS-YYYY-XXX format)
    const tenderId = generateTenderId();

    // Create tender for TenderManagement local state
    const newTender: Tender = {
      id: tenderId,
      title: tenderForm.title,
      description: tenderForm.description,
      budget: parseFloat(tenderForm.budget),
      status: isDraft ? "Draft" : "Published",
      createdDate: new Date().toISOString().split("T")[0],
      publishedDate: !isDraft
        ? new Date().toISOString().split("T")[0]
        : undefined,
      closingDate: tenderForm.closingDate,
      ministry: ministryInfo.name,
      department: "Current Department",
      tenderType: tenderForm.tenderType as "Open" | "Selective" | "Limited",
      procurementMethod: tenderForm.procurementMethod as
        | "NCB"
        | "ICB"
        | "QCBS"
        | "CQS"
        | "SSS",
      documents: [],
      amendments: [],
      bidders: [],
      evaluation: {
        id: `E${String(tenders.length + 1).padStart(3, "0")}`,
        technicalCriteria: [],
        financialCriteria: [],
        committee: [],
        technicalThreshold: 70,
        financialWeight: 30,
        technicalWeight: 70,
        status: "Not Started",
      },
      timeline: [],
    };

    const updatedTenders = [...tenders, newTender];
    setTenders(updatedTenders);
    saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);

    // Synchronize all tender stores
    synchronizeAllTenderStores();

    // Note: Global tender creation and storage is now handled by synchronizeAllTenderStores()

    // Reset form
    setTenderForm({
      title: "",
      description: "",
      budget: "",
      tenderType: "Open",
      procurementMethod: "NCB",
      closingDate: "",
      documents: [],
    });

    setShowTenderModal(false);
    alert(`Tender ${isDraft ? "saved as draft" : "published"} successfully!`);
  };

  const updateTenderStatus = (tenderId: string, status: Tender["status"]) => {
    const updatedTenders = tenders.map((tender) =>
      tender.id === tenderId
        ? {
            ...tender,
            status,
            publishedDate:
              status === "Published"
                ? new Date().toISOString().split("T")[0]
                : tender.publishedDate,
          }
        : tender,
    );

    setTenders(updatedTenders);
    saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);

    // Synchronize all tender stores after status update
    synchronizeAllTenderStores();
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || tender.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Draft: {
        bg: "bg-gradient-to-r from-gray-100 to-slate-100",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: "📝",
      },
      Published: {
        bg: "bg-gradient-to-r from-blue-100 to-indigo-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "📢",
      },
      Open: {
        bg: "bg-gradient-to-r from-green-100 to-emerald-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: "🟢",
      },
      Active: {
        bg: "bg-gradient-to-r from-green-100 to-emerald-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: "🟢",
      },
      "Closing Soon": {
        bg: "bg-gradient-to-r from-orange-100 to-yellow-100",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: "⚠️",
      },
      Closed: {
        bg: "bg-gradient-to-r from-red-100 to-rose-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: "🔴",
      },
      Evaluated: {
        bg: "bg-gradient-to-r from-amber-100 to-yellow-100",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "📊",
      },
      Awarded: {
        bg: "bg-gradient-to-r from-blue-100 to-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "🏆",
      },

      // NOC workflow statuses
      "NOC Pending": {
        bg: "bg-gradient-to-r from-orange-100 to-amber-100",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: "⏳",
      },
      "NOC Approved": {
        bg: "bg-gradient-to-r from-green-100 to-emerald-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: "✅",
      },
      "NOC Rejected": {
        bg: "bg-gradient-to-r from-red-100 to-rose-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: "❌",
      },

      // Contract workflow statuses
      "Contract Created": {
        bg: "bg-gradient-to-r from-blue-100 to-cyan-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "���",
      },
      "Contract Signed": {
        bg: "bg-gradient-to-r from-blue-100 to-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "✍️",
      },
      Implementation: {
        bg: "bg-gradient-to-r from-indigo-100 to-blue-100",
        text: "text-indigo-700",
        border: "border-indigo-200",
        icon: "🔧",
      },
      Completed: {
        bg: "bg-gradient-to-r from-green-100 to-teal-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: "✨",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gradient-to-r from-gray-100 to-slate-100",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: "⚪",
    };

    return (
      <Badge
        className={`${config.bg} ${config.text} ${config.border} border shadow-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5`}
      >
        <span className="text-xs">{config.icon}</span>
        <span>{status}</span>
      </Badge>
    );
  };

  const getDaysRemaining = (closingDate: string) => {
    return tenderStatusChecker.calculateDaysUntilDeadline(closingDate);
  };

  const getTenderStatusInfo = (tender: Tender): TenderStatusInfo => {
    return tenderStatusChecker.getStatusInfo(tender.status, tender.closingDate);
  };

  // Auto-refresh tender statuses every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTenders((prevTenders) => {
        const updatedTenders = prevTenders.map((tender) => {
          const synchronized = synchronizeTenderStatus(tender);
          return synchronized;
        });

        // Only save if there were actual changes
        const hasChanges = updatedTenders.some(
          (tender, index) =>
            tender.status !== prevTenders[index]?.status ||
            tender.workflowStage !== prevTenders[index]?.workflowStage,
        );

        if (hasChanges) {
          saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);
        }

        return updatedTenders;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-blue-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
                    Tender Management System
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Complete tender lifecycle management platform
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
                variant="outline"
                onClick={() => {
                  const ministryInfo = getMinistryInfo();
                  const ministryCode = ministryInfo.code;

                  const mainTenders = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENDERS) || "[]");
                  const recentTenders = JSON.parse(localStorage.getItem("recentTenders") || "[]");
                  const featuredTenders = JSON.parse(localStorage.getItem("featuredTenders") || "[]");
                  const ministryTenders = JSON.parse(localStorage.getItem(`${ministryCode}_tenders`) || "[]");

                  console.log("Storage Debug:", {
                    mainTenders,
                    recentTenders,
                    featuredTenders,
                    ministryTenders,
                    currentState: tenders
                  });

                  alert(`Storage Debug:\n\nMain Store (${STORAGE_KEYS.TENDERS}): ${mainTenders.length} tenders\nRecent Tenders: ${recentTenders.length} tenders\nFeatured Tenders: ${featuredTenders.length} tenders\nMinistry Tenders (${ministryCode}): ${ministryTenders.length} tenders\nCurrent Component State: ${tenders.length} tenders\n\nCheck console for details.`);
                }}
                className="px-4 py-3"
              >
                <Eye className="h-5 w-5 mr-2" />
                Debug Storage
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const refreshedTenders = forceRefreshTenders();

                  // Debug info
                  const tenderTitles = refreshedTenders.map((t: any) => `${t.id}: ${t.title} (${t.status})`);
                  console.log("All tenders after refresh:", refreshedTenders);
                  alert(`Refreshed and Synchronized! Found ${refreshedTenders.length} tenders:\n\n${tenderTitles.join('\n')}\n\nAll storage locations updated.`);
                }}
                className="px-6 py-3"
              >
                <Search className="h-5 w-5 mr-2" />
                Force Refresh
              </Button>
              <Button
                onClick={() => setShowTenderModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Tender
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" className="w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 shadow-lg p-2">
          <TabsList className="grid w-full grid-cols-8 bg-transparent gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-blue-50 border border-transparent data-[state=active]:border-blue-200"
            >
              <Eye className="h-4 w-4" />
              <span className="font-medium">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="administration"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-50 border border-transparent data-[state=active]:border-amber-200"
            >
              <Settings className="h-4 w-4" />
              <span className="font-medium">Administration</span>
            </TabsTrigger>
            <TabsTrigger
              value="vendor"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-emerald-50 border border-transparent data-[state=active]:border-emerald-200"
            >
              <Users className="h-4 w-4" />
              <span className="font-medium">Vendor Interaction</span>
            </TabsTrigger>
            <TabsTrigger
              value="opening"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 border border-transparent data-[state=active]:border-purple-200"
            >
              <Clock className="h-4 w-4" />
              <span className="font-medium">Opening</span>
            </TabsTrigger>
            <TabsTrigger
              value="evaluation"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-rose-50 border border-transparent data-[state=active]:border-rose-200"
            >
              <Scale className="h-4 w-4" />
              <span className="font-medium">Evaluation</span>
            </TabsTrigger>
            <TabsTrigger
              value="award"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-yellow-50 border border-transparent data-[state=active]:border-yellow-200"
            >
              <Award className="h-4 w-4" />
              <span className="font-medium">Award</span>
            </TabsTrigger>
            <TabsTrigger
              value="notification"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-cyan-50 border border-transparent data-[state=active]:border-cyan-200"
            >
              <Bell className="h-4 w-4" />
              <span className="font-medium">Notification</span>
            </TabsTrigger>
            <TabsTrigger
              value="contract"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50 border border-transparent data-[state=active]:border-slate-200"
            >
              <FileCheck className="h-4 w-4" />
              <span className="font-medium">Contract Link</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Enhanced Tender Creation & Publication */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-md p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title, description, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-56 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg shadow-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                      <SelectItem value="all" className="hover:bg-blue-50">
                        All Status
                      </SelectItem>
                      <SelectItem value="Draft" className="hover:bg-gray-50">
                        Draft
                      </SelectItem>
                      <SelectItem
                        value="Published"
                        className="hover:bg-green-50"
                      >
                        Published
                      </SelectItem>
                      <SelectItem value="Open" className="hover:bg-blue-50">
                        Open
                      </SelectItem>
                      <SelectItem value="Active" className="hover:bg-green-50">
                        Active
                      </SelectItem>
                      <SelectItem
                        value="Closing Soon"
                        className="hover:bg-orange-50"
                      >
                        Closing Soon
                      </SelectItem>
                      <SelectItem value="Closed" className="hover:bg-red-50">
                        Closed
                      </SelectItem>
                      <SelectItem
                        value="Evaluated"
                        className="hover:bg-blue-50"
                      >
                        Evaluated
                      </SelectItem>
                      <SelectItem
                        value="Awarded"
                        className="hover:bg-emerald-50"
                      >
                        Awarded
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => setShowTenderModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Tender
              </Button>
            </div>
          </div>

          {/* Enhanced Tender Grid */}
          <div className="grid gap-6">
            {filteredTenders.map((tender) => (
              <Card
                key={tender.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border border-gray-100 hover:border-blue-200 rounded-xl overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-sm">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
                            {tender.title}
                          </CardTitle>
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {tender.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="text-xs text-emerald-600 font-medium">
                              Budget
                            </p>
                            <p className="text-sm font-bold text-emerald-800">
                              ₦{tender.budget.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <Scale className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 font-medium">
                              Method
                            </p>
                            <p className="text-sm font-bold text-blue-800">
                              {tender.procurementMethod}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <Target className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600 font-medium">
                              Type
                            </p>
                            <p className="text-sm font-bold text-blue-800">
                              {tender.tenderType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <Users className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-purple-600 font-medium">
                              Bids Received
                            </p>
                            <p className="text-sm font-bold text-purple-800">
                              {getBidCount(tender.id)}
                            </p>
                          </div>
                        </div>
                        {tender.closingDate && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="text-xs text-orange-600 font-medium">
                                Days Remaining
                              </p>
                              <p className="text-sm font-bold text-orange-800">
                                {getDaysRemaining(tender.closingDate)}
                              </p>
                              {tender.status === "Closing Soon" && (
                                <p className="text-xs text-orange-600 font-medium">
                                  ⚠️ Closing Soon!
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 ml-6">
                      {getStatusBadge(tender.status)}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTender(tender)}
                          className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {getBidCount(tender.id) > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const bids = getBidsForTender(tender.id);
                              alert(`Bids for ${tender.title}:\n\n${bids.map(bid => `• ${bid.companyName} - ${bid.bidAmount} (${bid.status})`).join('\n')}`);
                            }}
                            className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                        {tender.status === "Draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updatedTenders = tenders.map((t) =>
                                t.id === tender.id
                                  ? {
                                      ...t,
                                      status: "Published" as const,
                                      publishedDate: new Date()
                                        .toISOString()
                                        .split("T")[0],
                                    }
                                  : t,
                              );
                              setTenders(updatedTenders);
                              saveToStorage(
                                STORAGE_KEYS.TENDERS,
                                updatedTenders,
                              );

                              // Synchronize all tender stores after publishing
                              synchronizeAllTenderStores();
                            }}
                            className="hover:bg-green-50 hover:border-green-300 transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Tender Administration */}
        <TabsContent value="administration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-amber-800">
                      Amendments & Addenda
                    </CardTitle>
                    <p className="text-sm text-amber-600 mt-1">
                      Issue clarifications and updates
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/70 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-amber-700 mb-3">
                      Manage tender modifications, clarifications, and document
                      updates throughout the tender lifecycle.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowAmendmentModal(true)}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Amendment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        View History
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-blue-800">
                      Timeline Tracker
                    </CardTitle>
                    <p className="text-sm text-blue-600 mt-1">
                      Monitor deadlines and milestones
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-700 mb-3">
                      Track tender progress, deadlines, and critical milestones
                      with automated alerts and notifications.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Timeline
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Set Alerts
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-emerald-800">
                      Audit Trail
                    </CardTitle>
                    <p className="text-sm text-emerald-600 mt-1">
                      Complete activity logging
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/70 rounded-lg p-4 border border-emerald-200">
                    <p className="text-sm text-emerald-700 mb-3">
                      Comprehensive audit trail with timestamps, user actions,
                      and system changes for compliance.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Audit Log
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        Export Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-100 shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Administration Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">12</div>
                <div className="text-sm text-orange-600">Active Amendments</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">8</div>
                <div className="text-sm text-blue-600">Pending Deadlines</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-700">156</div>
                <div className="text-sm text-emerald-600">Audit Entries</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-700">98%</div>
                <div className="text-sm text-emerald-600">Compliance Rate</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Vendor Interaction */}
        <TabsContent value="vendor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Interaction Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Document Downloads</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Clarifications</p>
                        <p className="text-2xl font-bold">23</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Interested Vendors</p>
                        <p className="text-2xl font-bold">47</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Bids Submitted</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tender Opening */}
        <TabsContent value="opening" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tender Opening Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-900">
                    QCBS Two-Envelope System
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Technical proposals opened first, financial proposals remain
                    sealed
                  </p>
                </div>

                <div className="grid gap-4">
                  <Button className="justify-start" size="lg">
                    <Clock className="h-5 w-5 mr-2" />
                    Generate Opening Report
                  </Button>

                  <Button variant="outline" className="justify-start" size="lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Log Received Bids
                  </Button>

                  <Button variant="outline" className="justify-start" size="lg">
                    <Shield className="h-5 w-5 mr-2" />
                    Verify Submission Times
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation */}
        <TabsContent value="evaluation" className="space-y-6">
          {/* Tender Summary Card */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tender ID</p>
                  <p className="font-semibold">MOH-2024-001</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-semibold">Hospital Equipment Supply</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className="bg-blue-100 text-blue-800">
                    Committee Setup
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="font-semibold">Step 1 of 3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stepper Navigation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Step 1: Committee Assignment */}
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep === 1
                        ? "bg-blue-600 text-white"
                        : stepStatus.step1.completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {stepStatus.step1.completed ? "✅" : "1"}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`font-semibold ${
                        currentStep === 1
                          ? "text-blue-600"
                          : stepStatus.step1.completed
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      Committee Assignment
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentStep === 1
                        ? "Active"
                        : stepStatus.step1.completed
                          ? "Completed"
                          : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 mx-4">
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        stepStatus.step1.completed
                          ? "w-full bg-green-600"
                          : "w-0 bg-blue-600"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Step 2: COI Declaration */}
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep === 2
                        ? "bg-blue-600 text-white"
                        : stepStatus.step2.completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {stepStatus.step2.completed ? "✅" : "2"}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`font-semibold ${
                        currentStep === 2
                          ? "text-blue-600"
                          : stepStatus.step2.completed
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      COI Declaration
                    </p>
                    <p className="text-sm text-gray-600">
                      {stepStatus.step2.locked
                        ? "Locked"
                        : currentStep === 2
                          ? "Active"
                          : stepStatus.step2.completed
                            ? "Completed"
                            : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 mx-4">
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        stepStatus.step2.completed
                          ? "w-full bg-green-600"
                          : "w-0 bg-gray-200"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Step 3: QCBS Scoring */}
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep === 3
                        ? "bg-blue-600 text-white"
                        : stepStatus.step3.completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {stepStatus.step3.completed ? "✅" : "3"}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`font-semibold ${
                        currentStep === 3
                          ? "text-blue-600"
                          : stepStatus.step3.completed
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      QCBS Scoring
                    </p>
                    <p className="text-sm text-gray-600">
                      {stepStatus.step3.locked
                        ? "Locked"
                        : currentStep === 3
                          ? "Active"
                          : stepStatus.step3.completed
                            ? "Completed"
                            : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Committee Assignment (Officer Only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                  1
                </div>
                Committee Assignment
                <Badge className="bg-blue-100 text-blue-800">
                  Officer Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Assignment Table */}
                <div>
                  <h3 className="font-medium mb-4">Assignment Table</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>COI</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Dr. Amina Hassan
                          </TableCell>
                          <TableCell>Chairperson</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending COI
                            </Badge>
                          </TableCell>
                          <TableCell>—</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Replace
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Eng. Musa Ibrahim
                          </TableCell>
                          <TableCell>Technical Secretary</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending COI
                            </Badge>
                          </TableCell>
                          <TableCell>—</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Replace
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Dr. Fatima Yusuf
                          </TableCell>
                          <TableCell>Clinical Evaluator</TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">
                              COI Declared
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                              <Button size="sm" variant="outline">
                                Replace
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Bala Ahmed
                          </TableCell>
                          <TableCell>Financial Analyst</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending COI
                            </Badge>
                          </TableCell>
                          <TableCell>—</TableCell>
                          <TableCell>—</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Mary Luka
                          </TableCell>
                          <TableCell>Procurement Expert</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending COI
                            </Badge>
                          </TableCell>
                          <TableCell>—</TableCell>
                          <TableCell>—</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Replace Member
                  </Button>
                  <Button
                    className="bg-primary"
                    onClick={() => {
                      setCommitteeAssigned(true);
                      setStepStatus((prev) => ({
                        ...prev,
                        step1: { completed: true, locked: false },
                        step2: { completed: false, locked: false },
                      }));
                      setCurrentStep(2);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Assignment
                  </Button>
                </div>

                {!committeeAssigned && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">
                          Assignment Required
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Click "Confirm Assignment" to proceed to COI
                          Declaration step.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: COI Declaration */}
          {currentStep >= 2 && !stepStatus.step2.locked ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                    2
                  </div>
                  COI Declaration
                  <Badge className="bg-blue-100 text-blue-800">
                    Evaluator View
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Evaluator Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Completed</p>
                          <p className="text-2xl font-bold">3</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Pending</p>
                          <p className="text-2xl font-bold">1</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Conflicts</p>
                          <p className="text-2xl font-bold">1</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Declaration Forms */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Individual COI Declarations</h3>

                    {[
                      {
                        name: "Dr. Amina Hassan",
                        role: "Chairperson",
                        status: "Completed",
                        conflict: false,
                      },
                      {
                        name: "Eng. Musa Ibrahim",
                        role: "Technical Secretary",
                        status: "Completed",
                        conflict: false,
                      },
                      {
                        name: "Dr. Fatima Yusuf",
                        role: "Clinical Evaluator",
                        status: "Conflict Declared",
                        conflict: true,
                        details:
                          "Financial relationship with Vendor B - Medium severity",
                      },
                      {
                        name: "Bala Ahmed",
                        role: "Financial Analyst",
                        status: "Pending",
                        conflict: null,
                      },
                      {
                        name: "Mary Luka",
                        role: "Procurement Expert",
                        status: "Completed",
                        conflict: false,
                      },
                    ].map((member, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">
                              {member.role}
                            </p>
                          </div>
                          <Badge
                            className={
                              member.status === "Completed" && !member.conflict
                                ? "bg-green-100 text-green-800"
                                : member.status === "Conflict Declared"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {member.status}
                          </Badge>
                        </div>

                        {member.status === "Pending" && (
                          <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Declaration
                              </Label>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id={`no-conflict-${index}`} />
                                  <Label
                                    htmlFor={`no-conflict-${index}`}
                                    className="text-sm"
                                  >
                                    ✅ I declare no conflict of interest
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id={`has-conflict-${index}`} />
                                  <Label
                                    htmlFor={`has-conflict-${index}`}
                                    className="text-sm"
                                  >
                                    ❌ Conflict Exists
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">
                                Conflict Type & Details
                              </Label>
                              <Select>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select conflict type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="financial">
                                    Financial
                                  </SelectItem>
                                  <SelectItem value="professional">
                                    Professional
                                  </SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <Textarea
                                placeholder="Provide details about the conflict..."
                                className="mt-2"
                                rows={3}
                              />
                            </div>

                            <Button size="sm">Submit Declaration</Button>
                          </div>
                        )}

                        {member.conflict && member.details && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-800">
                              Conflict Details:
                            </p>
                            <p className="text-sm text-red-700 mt-1">
                              {member.details}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline">
                                Approve with Mitigation
                              </Button>
                              <Button size="sm" variant="destructive">
                                Replace Evaluator
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>

                  {/* Officer Review Panel */}
                  <Card className="p-4 bg-blue-50">
                    <h3 className="font-medium text-blue-900 mb-3">
                      Officer Review Panel
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium">
                            Dr. Fatima Yusuf - Conflict Review
                          </p>
                          <p className="text-sm text-gray-600">
                            Financial relationship with participating vendor
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCoiResolved(true)}
                          >
                            Approve with Mitigation
                          </Button>
                          <Button size="sm" variant="destructive">
                            Replace Evaluator
                          </Button>
                          <Button size="sm" variant="outline">
                            Block Participation
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button
                      className="bg-primary px-8"
                      onClick={() => {
                        setCoiResolved(true);
                        setStepStatus((prev) => ({
                          ...prev,
                          step2: { completed: true, locked: false },
                          step3: { completed: false, locked: false },
                        }));
                        setCurrentStep(3);
                      }}
                      disabled={!coiResolved}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Finalize COI Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-semibold text-sm">
                    2
                  </div>
                  COI Declaration
                  <Badge className="bg-gray-100 text-gray-600">Locked</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Complete Step 1 to unlock
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Committee assignment must be confirmed before COI
                    declarations can begin
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: QCBS Scoring */}
          {currentStep >= 3 && !stepStatus.step3.locked ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm">
                    3
                  </div>
                  QCBS Scoring
                  <Badge className="bg-blue-100 text-blue-800">
                    Committee Workspace
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tabs inside workspace */}
                  <Tabs defaultValue="technical" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="technical">
                        🔸 Technical Evaluation
                      </TabsTrigger>
                      <TabsTrigger value="financial">
                        🔸 Financial Evaluation
                      </TabsTrigger>
                      <TabsTrigger value="final">
                        🔸 Final QCBS Ranking
                      </TabsTrigger>
                    </TabsList>

                    {/* Technical Evaluation Tab */}
                    <TabsContent value="technical" className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>
                            Criteria auto-loaded from scoring matrix
                          </strong>{" "}
                          - Each evaluator scores independently, system
                          calculates weighted averages.
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Criteria</TableHead>
                              <TableHead>Weight</TableHead>
                              <TableHead>Evaluator Avg.</TableHead>
                              <TableHead>Weighted Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                Equipment Quality
                              </TableCell>
                              <TableCell>40%</TableCell>
                              <TableCell>82.5</TableCell>
                              <TableCell className="font-bold">33.0</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Vendor Experience
                              </TableCell>
                              <TableCell>20%</TableCell>
                              <TableCell>72.5</TableCell>
                              <TableCell className="font-bold">14.5</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Delivery & Training Plan
                              </TableCell>
                              <TableCell>10%</TableCell>
                              <TableCell>87.5</TableCell>
                              <TableCell className="font-bold">8.8</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Technical Support
                              </TableCell>
                              <TableCell>15%</TableCell>
                              <TableCell>78.0</TableCell>
                              <TableCell className="font-bold">11.7</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Local Content
                              </TableCell>
                              <TableCell>15%</TableCell>
                              <TableCell>65.0</TableCell>
                              <TableCell className="font-bold">9.8</TableCell>
                            </TableRow>
                            <TableRow className="bg-blue-50 font-bold">
                              <TableCell>TOTAL TECHNICAL SCORE</TableCell>
                              <TableCell>100%</TableCell>
                              <TableCell>—</TableCell>
                              <TableCell>77.8</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>
                            System Auto-calculates Technical Score:
                          </strong>{" "}
                          All vendors passed minimum threshold (≥75%)
                        </p>
                      </div>
                    </TabsContent>

                    {/* Financial Evaluation Tab */}
                    <TabsContent value="financial" className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>
                            Only unlocked if Technical Passing Score ≥ 75%
                          </strong>{" "}
                          - Financial envelopes opened for qualified vendors
                          only.
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Vendor</TableHead>
                              <TableHead>Price (₦)</TableHead>
                              <TableHead>Normalized Score</TableHead>
                              <TableHead>Weighted Financial Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-green-50">
                              <TableCell className="font-medium">A</TableCell>
                              <TableCell>1,000,000</TableCell>
                              <TableCell className="font-bold">100</TableCell>
                              <TableCell className="font-bold text-green-600">
                                30.0
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">B</TableCell>
                              <TableCell>1,200,000</TableCell>
                              <TableCell>83</TableCell>
                              <TableCell className="font-bold">24.9</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">C</TableCell>
                              <TableCell>1,500,000</TableCell>
                              <TableCell>67</TableCell>
                              <TableCell className="font-bold">20.1</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    {/* Final QCBS Ranking Tab */}
                    <TabsContent value="final" className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Final QCBS Ranking:</strong> Technical (70%) +
                          Financial (30%) = Combined Score
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Vendor</TableHead>
                              <TableHead>Technical (70%)</TableHead>
                              <TableHead>Financial (30%)</TableHead>
                              <TableHead>Final Score</TableHead>
                              <TableHead>Rank</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50">
                              <TableCell className="font-medium">A</TableCell>
                              <TableCell>72.5</TableCell>
                              <TableCell>30.0</TableCell>
                              <TableCell className="font-bold text-yellow-600">
                                102.5
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  🥇 1
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-gray-50">
                              <TableCell className="font-medium">B</TableCell>
                              <TableCell>70.0</TableCell>
                              <TableCell>24.9</TableCell>
                              <TableCell className="font-bold">94.9</TableCell>
                              <TableCell>
                                <Badge className="bg-gray-100 text-gray-800">
                                  🥈 2
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">C</TableCell>
                              <TableCell>65.0</TableCell>
                              <TableCell>20.1</TableCell>
                              <TableCell className="font-bold">85.1</TableCell>
                              <TableCell>
                                <Badge className="bg-gray-100 text-gray-800">
                                  🥉 3
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Committee Actions */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">
                          QCBS Evaluation Complete
                        </p>
                        <p className="text-sm text-green-700">
                          Recommended Award: <strong>Vendor A</strong> (Final
                          Score: 102.5)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Save Draft Evaluation
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Evaluation Report
                        </Button>
                        <Button className="bg-primary" size="sm">
                          <Award className="h-4 w-4 mr-2" />
                          Submit Final Recommendation
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-semibold text-sm">
                    3
                  </div>
                  QCBS Scoring
                  <Badge className="bg-gray-100 text-gray-600">Locked</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Complete Steps 1 & 2 to unlock
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    All COI declarations must be resolved before scoring can
                    begin
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Award Recommendation */}
        <TabsContent value="award" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Award Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Evaluation Report</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate comprehensive evaluation report for approval
                  </p>
                  <Button className="mt-2" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Approval Workflow</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Route to MDA Head → State Tenders Board (if above threshold)
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Award Notification */}
        <TabsContent value="notification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Award Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <h3 className="font-medium text-green-900">
                    Successful Bidder Notification
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Notify winning bidder(s) of award decision
                  </p>
                  <Button className="mt-2" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Send Award Notice
                  </Button>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-900">
                    Unsuccessful Bidder Feedback
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Provide feedback to unsuccessful bidders as per procurement
                    law
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Public Award Notice</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Publish award notice on KanoProc public portal
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Publish Award
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Management Link */}
        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Link to Contract Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Convert to Contract</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Convert winning bid to draft contract
                  </p>
                  <Button className="mt-2" size="sm">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Create Draft Contract
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Contract Execution</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Push to Contract Management for milestones and payments
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Transfer to Contract Mgmt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Tender Modal */}
      <Dialog open={showTenderModal} onOpenChange={setShowTenderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Tender</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tender Title</Label>
              <Input
                id="title"
                value={tenderForm.title}
                onChange={(e) =>
                  setTenderForm({ ...tenderForm, title: e.target.value })
                }
                placeholder="Enter tender title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={tenderForm.description}
                onChange={(e) =>
                  setTenderForm({ ...tenderForm, description: e.target.value })
                }
                placeholder="Enter tender description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (���)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={tenderForm.budget}
                  onChange={(e) =>
                    setTenderForm({ ...tenderForm, budget: e.target.value })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="closingDate">Closing Date</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={tenderForm.closingDate}
                  onChange={(e) =>
                    setTenderForm({
                      ...tenderForm,
                      closingDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tenderType">Tender Type</Label>
                <Select
                  value={tenderForm.tenderType}
                  onValueChange={(value) =>
                    setTenderForm({ ...tenderForm, tenderType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open Tender</SelectItem>
                    <SelectItem value="Selective">Selective Tender</SelectItem>
                    <SelectItem value="Limited">Limited Tender</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="procurementMethod">Procurement Method</Label>
                <Select
                  value={tenderForm.procurementMethod}
                  onValueChange={(value) =>
                    setTenderForm({ ...tenderForm, procurementMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NCB">
                      National Competitive Bidding
                    </SelectItem>
                    <SelectItem value="ICB">
                      International Competitive Bidding
                    </SelectItem>
                    <SelectItem value="QCBS">
                      Quality & Cost Based Selection
                    </SelectItem>
                    <SelectItem value="CQS">
                      Consultant Quality Selection
                    </SelectItem>
                    <SelectItem value="SSS">Single Source Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTenderModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateTender(true)}
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => handleCreateTender(false)}
                className="bg-primary hover:bg-primary/90"
              >
                Publish Tender
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenderManagement;
