import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Calculator,
  Trophy,
  Building,
  BarChart3,
  Save,
  Send,
} from "lucide-react";
import {
  tenderSettingsManager,
  tenderStatusChecker,
  TenderStatus,
  TenderStatusInfo,
} from "@/lib/tenderSettings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  generateTenderId,
  initializeTenderCounter,
} from "@/lib/tenderIdGenerator";
import RealTimeVerificationTool from "./RealTimeVerificationTool";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Evaluation state management - NEW STRUCTURE
  const [assignedTenders, setAssignedTenders] = useState<any[]>([]);
  const [selectedTenderAssignment, setSelectedTenderAssignment] =
    useState<any>(null);
  const [evaluationTemplate, setEvaluationTemplate] = useState<any>(null);
  const [evaluatorScores, setEvaluatorScores] = useState<
    Record<string, { score: number; comment: string }>
  >({});
  const [isScoresSubmitted, setIsScoresSubmitted] = useState(false);
  const [isLoadingTenders, setIsLoadingTenders] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [showConsolidatedReport, setShowConsolidatedReport] = useState(false);
  const [currentEvaluatorId] = useState("USR-003"); // In production, get from auth context

  // Mock evaluation data
  const mockTenderInfo = {
    id: "MOH-2024-001",
    title: "Hospital Equipment Supply",
    category: "Medical Equipment",
    evaluationStartDate: "2024-03-01",
    evaluationEndDate: "2024-03-15",
    committeMembers: [
      {
        id: "evaluator1",
        name: "Dr. Amina Hassan",
        role: "Chairperson",
        status: "submitted",
      },
      {
        id: "evaluator2",
        name: "Eng. Musa Ibrahim",
        role: "Technical Secretary",
        status: "draft",
      },
      {
        id: "evaluator3",
        name: "Dr. Fatima Yusuf",
        role: "Clinical Evaluator",
        status: "submitted",
      },
      {
        id: "evaluator4",
        name: "Bala Ahmed",
        role: "Financial Analyst",
        status: "draft",
      },
      {
        id: "evaluator5",
        name: "Mary Luka",
        role: "Procurement Expert",
        status: "submitted",
      },
    ],
  };

  const mockEvaluationCriteria = [
    {
      id: "tech1",
      criterion: "Equipment Quality & Specifications",
      maxScore: 25,
      weight: 0.25,
    },
    {
      id: "tech2",
      criterion: "Vendor Experience & Track Record",
      maxScore: 20,
      weight: 0.2,
    },
    {
      id: "tech3",
      criterion: "Technical Support & Maintenance",
      maxScore: 15,
      weight: 0.15,
    },
    {
      id: "tech4",
      criterion: "Delivery Timeline & Implementation",
      maxScore: 15,
      weight: 0.15,
    },
    {
      id: "tech5",
      criterion: "Local Content & Compliance",
      maxScore: 10,
      weight: 0.1,
    },
    {
      id: "fin1",
      criterion: "Cost Competitiveness",
      maxScore: 15,
      weight: 0.15,
    },
  ];

  const mockBidders = [
    { id: "bidder1", name: "MedTech Solutions Ltd", financialOffer: 850000000 },
    {
      id: "bidder2",
      name: "HealthCare Equipment Co",
      financialOffer: 920000000,
    },
    {
      id: "bidder3",
      name: "Advanced Medical Systems",
      financialOffer: 780000000,
    },
  ];

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

  // Evaluation helper functions
  const updateEvaluatorScore = (
    evaluatorId: string,
    criterionId: string,
    score: number,
    comment: string,
  ) => {
    setEvaluatorScores((prev) => ({
      ...prev,
      [evaluatorId]: {
        ...prev[evaluatorId],
        [criterionId]: { score, comment },
      },
    }));
  };

  const calculateTotalScore = (evaluatorId: string) => {
    const scores = evaluatorScores[evaluatorId] || {};
    return mockEvaluationCriteria.reduce((total, criterion) => {
      const score = scores[criterion.id]?.score || 0;
      return total + score;
    }, 0);
  };

  const calculateAverageScore = (criterionId: string) => {
    const allScores = mockTenderInfo.committeMembers
      .map((member) => evaluatorScores[member.id]?.[criterionId]?.score || 0)
      .filter((score) => score > 0);
    return allScores.length > 0
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
      : 0;
  };

  // NEW EVALUATION FUNCTIONS

  // Fetch assigned tenders for current evaluator
  const fetchAssignedTenders = async () => {
    setIsLoadingTenders(true);
    try {
      const response = await fetch(
        `/api/tender-assignments/${currentEvaluatorId}`,
      );
      if (response.ok) {
        const tenders = await response.json();
        setAssignedTenders(tenders);
        console.log("Fetched assigned tenders:", tenders);
      } else {
        console.error("Failed to fetch assigned tenders");
        setAssignedTenders([]);
      }
    } catch (error) {
      console.error("Error fetching assigned tenders:", error);
      setAssignedTenders([]);
    } finally {
      setIsLoadingTenders(false);
    }
  };

  // Fetch evaluation template by ID
  const fetchEvaluationTemplate = async (templateId: string) => {
    setIsLoadingTemplate(true);
    try {
      const response = await fetch(`/api/evaluation-templates/${templateId}`);
      if (response.ok) {
        const template = await response.json();
        setEvaluationTemplate(template);
        console.log("Fetched evaluation template:", template);

        // Initialize scores object
        const initialScores: Record<
          string,
          { score: number; comment: string }
        > = {};
        template.criteria.forEach((criterion: any) => {
          initialScores[criterion.id] = { score: 0, comment: "" };
        });
        setEvaluatorScores(initialScores);
        setIsScoresSubmitted(false);
        setIsDraftSaved(false);
      } else {
        console.error("Failed to fetch evaluation template");
        setEvaluationTemplate(null);
      }
    } catch (error) {
      console.error("Error fetching evaluation template:", error);
      setEvaluationTemplate(null);
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  // Check if all scores are entered
  const hasAllScores = () => {
    if (!evaluationTemplate) return false;
    return evaluationTemplate.criteria.every(
      (criterion: any) => evaluatorScores[criterion.id]?.score > 0,
    );
  };

  // Save draft scores
  const saveDraft = () => {
    // In production, save to localStorage or send to server as draft
    localStorage.setItem(
      `draft_scores_${selectedTenderAssignment?.tenderId}_${currentEvaluatorId}`,
      JSON.stringify(evaluatorScores),
    );
    setIsDraftSaved(true);
    alert("Draft saved successfully!");
  };

  // Submit final scores
  const submitScores = async () => {
    if (!selectedTenderAssignment || !evaluationTemplate) {
      alert("Please select a tender and ensure template is loaded");
      return;
    }

    if (!hasAllScores()) {
      alert("Please enter scores for all criteria before submitting");
      return;
    }

    try {
      // Prepare payload in new format
      const scores = evaluationTemplate.criteria.map((criterion: any) => ({
        criterionId: criterion.id.toString(),
        score: evaluatorScores[criterion.id]?.score || 0,
        comment: evaluatorScores[criterion.id]?.comment || "",
      }));

      const payload = {
        tenderId: selectedTenderAssignment.tenderId,
        evaluatorId: currentEvaluatorId,
        scores: scores,
      };

      console.log("Submitting scores:", payload);

      const response = await fetch("/api/evaluator-scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Scores submitted successfully:", result);
        setIsScoresSubmitted(true);

        // Clear draft from localStorage
        localStorage.removeItem(
          `draft_scores_${selectedTenderAssignment.tenderId}_${currentEvaluatorId}`,
        );

        alert("Scores submitted successfully! Your evaluation is now locked.");
      } else {
        const error = await response.json();
        alert(`Failed to submit scores: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting scores:", error);
      alert("Network error: Failed to submit scores");
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAssignedTenders();
  }, []);

  // Load draft scores when tender is selected
  useEffect(() => {
    if (selectedTenderAssignment && evaluationTemplate) {
      const draftKey = `draft_scores_${selectedTenderAssignment.tenderId}_${currentEvaluatorId}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draftScores = JSON.parse(savedDraft);
          setEvaluatorScores(draftScores);
          setIsDraftSaved(true);
        } catch (error) {
          console.error("Error loading draft scores:", error);
        }
      }
    }
  }, [selectedTenderAssignment, evaluationTemplate]);

  // LEGACY FUNCTIONS (keeping for backward compatibility)
  const saveEvaluatorDraft = (evaluatorId: string) => {
    alert("Legacy function - use new saveDraft() instead");
  };

  const submitEvaluatorScores = (evaluatorId: string) => {
    alert("Legacy function - use new submitScores() instead");
  };

  const approveConsolidatedReport = () => {
    alert("Consolidated evaluation report approved");
  };

  const generateEvaluationReport = () => {
    alert("Generating evaluation report PDF...");
  };

  // Function to synchronize tender data to ministry-specific storage only
  const synchronizeAllTenderStores = () => {
    try {
      // Get ministry info for prefixing
      const ministryInfo = getMinistryInfo();
      const ministryCode = ministryInfo.code;

      // Load tenders from main store
      const mainTenders = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.TENDERS) || "[]",
      );

      // Convert to Company Dashboard format (recentTenders)
      const recentTendersFormat = mainTenders.map((tender: any) => ({
        id: tender.id,
        title: tender.title,
        description: tender.description,
        category: getCategoryFromMinistry(tender.ministry),
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
          "Financial capacity documentation",
        ],
        technicalSpecs: [
          "Project specifications as detailed in tender document",
          "Quality standards must meet government requirements",
          "Timeline adherence is mandatory",
        ],
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
        statusColor:
          tender.status === "Open" || tender.status === "Published"
            ? "bg-green-100 text-green-800"
            : tender.status === "Closing Soon"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-800",
        category: getCategoryFromMinistry(tender.ministry),
        ministry: tender.ministry,
        createdAt: Date.now(),
      }));

      // ONLY update ministry-specific storage locations (no global keys)
      localStorage.setItem(
        `${ministryCode}_recentTenders`,
        JSON.stringify(recentTendersFormat),
      );
      localStorage.setItem(
        `${ministryCode}_tenders`,
        JSON.stringify(mainTenders),
      );
      localStorage.setItem(
        `${ministryCode}_featuredTenders`,
        JSON.stringify(featuredTendersFormat.slice(0, 5)),
      );

      console.log(
        `✅ Synchronized tender data for ministry ${ministryCode} only (no global keys)`,
      );
      return mainTenders;
    } catch (error) {
      console.error("Error synchronizing tender stores:", error);
      return [];
    }
  };

  // Function to force refresh tenders from storage (with ministry filtering)
  const forceRefreshTenders = () => {
    const allTenders = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TENDERS) || "[]",
    );

    // Filter by current ministry
    const ministryInfo = getMinistryInfo();
    const ministryTenders = allTenders.filter(
      (tender: any) => tender.ministry === ministryInfo.name,
    );

    console.log(
      `🔄 Force refresh: ${allTenders.length} total tenders → ${ministryTenders.length} for ${ministryInfo.name}`,
    );

    const syncedTenders = ministryTenders.map((tender: any) =>
      synchronizeTenderStatus(tender),
    );
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

    // Load and synchronize tenders with NOC and contract data (ministry-filtered)
    const loadSynchronizedTenders = () => {
      const rawTenders = loadFromStorage(STORAGE_KEYS.TENDERS);

      // Filter tenders by current ministry
      const ministryInfo = getMinistryInfo();
      const ministryFilteredTenders = rawTenders.filter(
        (tender: Tender) => tender.ministry === ministryInfo.name,
      );

      console.log(
        `🔍 Loaded ${rawTenders.length} total tenders, filtered to ${ministryFilteredTenders.length} for ministry: ${ministryInfo.name}`,
      );

      const synchronizedTenders = ministryFilteredTenders.map(
        (tender: Tender) => synchronizeTenderStatus(tender),
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

    const allExistingTenders = loadFromStorage(STORAGE_KEYS.TENDERS);
    const ministryInfo = getMinistryInfo();
    const existingTenders = allExistingTenders.filter(
      (tender: any) => tender.ministry === ministryInfo.name,
    );

    console.log(
      `📊 Mock data check: ${allExistingTenders.length} total tenders, ${existingTenders.length} for ${ministryInfo.name}`,
    );

    // FIXED: Only create mock data if there are NO tenders in the entire system,
    // not just no tenders for the current ministry
    if (allExistingTenders.length === 0) {
      const now = new Date();
      const mockTenders: Tender[] = [
        {
          id: "T001",
          title: "Construction of Primary Healthcare Centers",
          description:
            "Construction of 5 primary healthcare centers across rural communities",
          budget: 250000000,
          status: "Published",
          createdDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          publishedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          closingDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
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
          createdDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          publishedDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          closingDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
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

      const syncedMockTenders = mockTenders.map((tender) =>
        synchronizeTenderStatus(tender),
      );

      // Filter mock tenders by current ministry before setting
      const ministryInfo = getMinistryInfo();
      const ministryMockTenders = syncedMockTenders.filter(
        (tender) => tender.ministry === ministryInfo.name,
      );

      console.log(
        `🎭 Mock data: ${syncedMockTenders.length} total → ${ministryMockTenders.length} for ${ministryInfo.name}`,
      );

      setTenders(ministryMockTenders);
      // Note: Still save all mock tenders to storage so other ministries can see theirs
      saveToStorage(STORAGE_KEYS.TENDERS, syncedMockTenders);
      synchronizeAllTenderStores();
    } else {
      const syncedExistingTenders = existingTenders.map((tender: any) =>
        synchronizeTenderStatus(tender),
      );
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
      // FIXED: Properly read ministryName and ministryCode from stored user data
      return {
        name: userData.ministryName || "Ministry of Health", // Use stored ministryName
        code: userData.ministryCode || "MOH", // Use stored ministryCode
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

  // Helper to determine category based on ministry
  const getCategoryFromMinistry = (ministry: string) => {
    if (ministry.includes("Health")) return "Healthcare";
    if (ministry.includes("Works") || ministry.includes("Infrastructure"))
      return "Infrastructure";
    if (ministry.includes("Education")) return "Education";
    return "General";
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

    // FIXED: Add to local state (filtered tenders)
    const updatedLocalTenders = [...tenders, newTender];
    setTenders(updatedLocalTenders);

    // FIXED: Add to global storage (all tenders from all ministries)
    const allExistingTenders = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.TENDERS) || "[]",
    );
    const updatedGlobalTenders = [...allExistingTenders, newTender];
    saveToStorage(STORAGE_KEYS.TENDERS, updatedGlobalTenders);

    // Synchronize all tender stores
    synchronizeAllTenderStores();

    // Trigger storage events to notify other pages about the new tender
    const ministryCode = ministryInfo.code;

    setTimeout(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `${ministryCode}_recentTenders`,
          newValue: localStorage.getItem(`${ministryCode}_recentTenders`),
        }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `${ministryCode}_featuredTenders`,
          newValue: localStorage.getItem(`${ministryCode}_featuredTenders`),
        }),
      );
      console.log(
        `📡 Notified other pages about new tender for ministry ${ministryCode}`,
      );
    }, 100); // Small delay to ensure localStorage is updated first

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

                  const mainTenders = JSON.parse(
                    localStorage.getItem(STORAGE_KEYS.TENDERS) || "[]",
                  );
                  const ministryRecentTenders = JSON.parse(
                    localStorage.getItem(`${ministryCode}_recentTenders`) ||
                      "[]",
                  );
                  const ministryFeaturedTenders = JSON.parse(
                    localStorage.getItem(`${ministryCode}_featuredTenders`) ||
                      "[]",
                  );
                  const ministryTenders = JSON.parse(
                    localStorage.getItem(`${ministryCode}_tenders`) || "[]",
                  );

                  console.log("Storage Debug:", {
                    mainTenders: mainTenders.map((t) => ({
                      id: t.id,
                      title: t.title,
                      status: t.status,
                    })),
                    [`${ministryCode}_recentTenders`]:
                      ministryRecentTenders.map((t) => ({
                        id: t.id,
                        title: t.title,
                        status: t.status,
                      })),
                    [`${ministryCode}_featuredTenders`]:
                      ministryFeaturedTenders.map((t) => ({
                        id: t.id,
                        title: t.title,
                        status: t.status,
                      })),
                    ministryTenders: ministryTenders.map((t) => ({
                      id: t.id,
                      title: t.title,
                      status: t.status,
                    })),
                    currentState: tenders.map((t) => ({
                      id: t.id,
                      title: t.title,
                      status: t.status,
                    })),
                  });

                  // Check if tenders have proper data format for Company Dashboard
                  const sampleRecentTender = ministryRecentTenders[0];
                  const recentTenderHasReqFields = sampleRecentTender
                    ? "procuringEntity" in sampleRecentTender &&
                      "deadline" in sampleRecentTender
                    : false;

                  alert(
                    `Storage Debug for ${ministryCode}:\n\nMain Store (${STORAGE_KEYS.TENDERS}): ${mainTenders.length} tenders\n${ministryCode} Recent Tenders: ${ministryRecentTenders.length} tenders\n${ministryCode} Featured Tenders: ${ministryFeaturedTenders.length} tenders\n${ministryCode} Tenders: ${ministryTenders.length} tenders\nCurrent Component State: ${tenders.length} tenders\n\nRecent Tenders Format OK: ${recentTenderHasReqFields}\n\nCheck console for details.`,
                  );
                }}
                className="px-4 py-3"
              >
                <Eye className="h-5 w-5 mr-2" />
                Debug All Storage
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const refreshedTenders = forceRefreshTenders();

                  // Debug info
                  const tenderTitles = refreshedTenders.map(
                    (t: any) => `${t.id}: ${t.title} (${t.status})`,
                  );
                  console.log("All tenders after refresh:", refreshedTenders);
                  alert(
                    `Refreshed and Synchronized! Found ${refreshedTenders.length} tenders:\n\n${tenderTitles.join("\n")}\n\nAll storage locations updated.`,
                  );
                }}
                className="px-6 py-3"
              >
                <Search className="h-5 w-5 mr-2" />
                Force Refresh
              </Button>
              <Button
                onClick={() => {
                  // Force synchronization and trigger page refresh
                  forceRefreshTenders();

                  // Trigger storage events to notify other components (ministry-specific)
                  window.dispatchEvent(
                    new StorageEvent("storage", {
                      key: `${ministryCode}_recentTenders`,
                      newValue: localStorage.getItem(
                        `${ministryCode}_recentTenders`,
                      ),
                    }),
                  );
                  window.dispatchEvent(
                    new StorageEvent("storage", {
                      key: `${ministryCode}_featuredTenders`,
                      newValue: localStorage.getItem(
                        `${ministryCode}_featuredTenders`,
                      ),
                    }),
                  );

                  alert(
                    "Full sync completed! Data should now appear on Company Dashboard and Homepage.\n\nYou may need to refresh those pages to see updates.",
                  );
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Full Sync & Notify
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="overview"
        className="w-full"
      >
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
              <span className="font-medium">Tender Evaluation</span>
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
                              alert(
                                `Bids for ${tender.title}:\n\n${bids.map((bid) => `• ${bid.companyName} - ${bid.bidAmount} (${bid.status})`).join("\n")}`,
                              );
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

        {/* Tender Evaluation - UPDATED */}
        <TabsContent value="evaluation" className="space-y-6">
          {/* 1️⃣ Tender Selection Dropdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Select Tender for Evaluation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="tender-select"
                    className="text-sm font-medium"
                  >
                    Assigned Tenders
                  </Label>
                  <Select
                    value={selectedTenderAssignment?.id || ""}
                    onValueChange={(value) => {
                      const assignment = assignedTenders.find(
                        (t) => t.id === value,
                      );
                      setSelectedTenderAssignment(assignment);
                      if (assignment) {
                        fetchEvaluationTemplate(
                          assignment.evaluationTemplateId,
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a tender to evaluate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTenders ? (
                        <SelectItem value="loading" disabled>
                          Loading assigned tenders...
                        </SelectItem>
                      ) : assignedTenders.length === 0 ? (
                        <SelectItem value="no-tenders" disabled>
                          No tenders assigned for evaluation
                        </SelectItem>
                      ) : (
                        assignedTenders.map((tender) => (
                          <SelectItem key={tender.id} value={tender.id}>
                            {tender.tenderTitle} - {tender.tenderCategory}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {!isLoadingTenders && assignedTenders.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      No tenders are currently assigned to you for evaluation.
                      Please contact your administrator.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2️⃣ Tender Information Display */}
          {selectedTenderAssignment && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <FileText className="h-6 w-6" />
                  Tender Information
                  <Badge className="bg-blue-100 text-blue-800">
                    {selectedTenderAssignment.tenderId}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Tender Title
                    </Label>
                    <p className="font-semibold text-lg">
                      {selectedTenderAssignment.tenderTitle}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Category
                    </Label>
                    <p className="font-semibold">
                      {selectedTenderAssignment.tenderCategory}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Evaluation Period
                    </Label>
                    <p className="font-semibold">
                      {new Date(
                        selectedTenderAssignment.evaluationStart,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        selectedTenderAssignment.evaluationEnd,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3️⃣ Dynamic Evaluation Criteria Scoring */}
          {selectedTenderAssignment && evaluationTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Evaluation Criteria
                  {isScoresSubmitted && (
                    <Badge className="bg-green-100 text-green-800">
                      Submitted
                    </Badge>
                  )}
                  {isDraftSaved && !isScoresSubmitted && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Draft Saved
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Template: {evaluationTemplate.name} | Type:{" "}
                  {evaluationTemplate.type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTemplate ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Loading evaluation criteria...
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">
                            Criterion
                          </th>
                          <th className="text-center p-3 font-medium w-20">
                            Type
                          </th>
                          <th className="text-center p-3 font-medium w-24">
                            Max Score
                          </th>
                          <th className="text-center p-3 font-medium w-24">
                            Your Score
                          </th>
                          <th className="text-left p-3 font-medium">
                            Comments/Justification
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationTemplate.criteria.map((criterion: any) => {
                          const currentScore =
                            evaluatorScores[criterion.id]?.score || 0;
                          const currentComment =
                            evaluatorScores[criterion.id]?.comment || "";

                          return (
                            <tr
                              key={criterion.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="p-3 font-medium">
                                {criterion.name}
                              </td>
                              <td className="p-3 text-center">
                                <Badge
                                  variant={
                                    criterion.type === "financial"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {criterion.type || "technical"}
                                </Badge>
                              </td>
                              <td className="p-3 text-center font-semibold text-blue-600">
                                {criterion.maxScore}
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  min="0"
                                  max={criterion.maxScore}
                                  value={currentScore}
                                  disabled={isScoresSubmitted}
                                  onChange={(e) => {
                                    const score =
                                      parseFloat(e.target.value) || 0;
                                    setEvaluatorScores((prev) => ({
                                      ...prev,
                                      [criterion.id]: {
                                        ...prev[criterion.id],
                                        score: score,
                                      },
                                    }));
                                    setIsDraftSaved(false);
                                  }}
                                  className="w-20 text-center"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-3">
                                <Textarea
                                  placeholder="Enter justification for this score..."
                                  value={currentComment}
                                  disabled={isScoresSubmitted}
                                  onChange={(e) => {
                                    setEvaluatorScores((prev) => ({
                                      ...prev,
                                      [criterion.id]: {
                                        ...prev[criterion.id],
                                        comment: e.target.value,
                                      },
                                    }));
                                    setIsDraftSaved(false);
                                  }}
                                  className="min-h-[80px]"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedTenderAssignment &&
                  evaluationTemplate &&
                  !isLoadingTemplate && (
                    <div className="flex gap-4 mt-6 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={saveDraft}
                        disabled={isScoresSubmitted}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </Button>
                      <Button
                        onClick={submitScores}
                        disabled={isScoresSubmitted || !hasAllScores()}
                        className="flex-1"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isScoresSubmitted
                          ? "Submitted"
                          : "Submit Final Scores"}
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* 4️⃣ Summary and Status */}
          {selectedTenderAssignment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Evaluation Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {evaluationTemplate
                        ? evaluationTemplate.criteria.length
                        : 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Criteria</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {
                        Object.keys(evaluatorScores).filter(
                          (id) => evaluatorScores[id]?.score > 0,
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-600">Scored Criteria</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {Object.values(evaluatorScores)
                        .reduce(
                          (sum: number, item: any) => sum + (item?.score || 0),
                          0,
                        )
                        .toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-600">Total Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5️⃣ Score Aggregation (Legacy - keeping for reference) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Score Aggregation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Individual Totals */}
                <div>
                  <h3 className="font-semibold mb-3">
                    Individual Evaluator Totals
                  </h3>
                  <div className="space-y-2">
                    {mockTenderInfo.committeMembers.map((member) => {
                      const total = calculateTotalScore(member.id);
                      return (
                        <div
                          key={member.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">{member.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                member.status === "submitted"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {member.status}
                            </Badge>
                            <span className="font-bold text-blue-600">
                              {total}/100
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Criteria Averages */}
                <div>
                  <h3 className="font-semibold mb-3">
                    Average Scores by Criterion
                  </h3>
                  <div className="space-y-2">
                    {mockEvaluationCriteria.map((criterion) => {
                      const avgScore = calculateAverageScore(criterion.id);
                      return (
                        <div
                          key={criterion.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                        >
                          <span>{criterion.criterion}</span>
                          <span className="font-bold text-green-600">
                            {avgScore.toFixed(1)}/{criterion.maxScore}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4️⃣ Consolidated Evaluation Report */}
          {showConsolidatedReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Consolidated Evaluation Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bidder Rankings */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      Final Bidder Rankings
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-3 text-left">Rank</th>
                            <th className="border p-3 text-left">Bidder</th>
                            <th className="border p-3 text-center">
                              Technical Score
                            </th>
                            <th className="border p-3 text-center">
                              Financial Score
                            </th>
                            <th className="border p-3 text-center">
                              Total Score
                            </th>
                            <th className="border p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockBidders.map((bidder, index) => (
                            <tr
                              key={bidder.id}
                              className={index === 0 ? "bg-green-50" : ""}
                            >
                              <td className="border p-3 font-bold">
                                {index === 0 && "🥇"} {index + 1}
                              </td>
                              <td className="border p-3 font-medium">
                                {bidder.name}
                              </td>
                              <td className="border p-3 text-center">75.2</td>
                              <td className="border p-3 text-center">18.5</td>
                              <td className="border p-3 text-center font-bold text-green-600">
                                93.7
                              </td>
                              <td className="border p-3 text-center">
                                <Badge
                                  variant={
                                    index === 0 ? "default" : "secondary"
                                  }
                                >
                                  {index === 0 ? "Recommended" : "Not Selected"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div>
                    <h3 className="font-semibold mb-3">
                      Detailed Individual Scores
                    </h3>
                    <div className="grid gap-4">
                      {mockBidders.map((bidder) => (
                        <Card key={bidder.id} className="p-4">
                          <h4 className="font-semibold mb-2">{bidder.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {mockTenderInfo.committeMembers.map((evaluator) => (
                              <div key={evaluator.id} className="space-y-1">
                                <p className="font-medium">{evaluator.name}</p>
                                {mockEvaluationCriteria.map((criterion) => (
                                  <div
                                    key={criterion.id}
                                    className="flex justify-between"
                                  >
                                    <span className="text-gray-600">
                                      {criterion.criterion.substring(0, 20)}...
                                    </span>
                                    <span className="font-medium">
                                      {evaluatorScores[evaluator.id]?.[
                                        criterion.id
                                      ]?.score || 0}
                                      /{criterion.maxScore}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5️⃣ Actions & Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Actions & Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentEvaluatorId = "evaluator1"; // Default to first evaluator
                    saveEvaluatorDraft(currentEvaluatorId);
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>

                <Button
                  onClick={() => {
                    const currentEvaluatorId = "evaluator1"; // Default to first evaluator
                    submitEvaluatorScores(currentEvaluatorId);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Evaluation
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    setShowConsolidatedReport(!showConsolidatedReport)
                  }
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showConsolidatedReport ? "Hide" : "Show"} Consolidated Report
                </Button>

                <Button
                  variant="outline"
                  onClick={approveConsolidatedReport}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Chairperson Approval
                </Button>

                <Button
                  onClick={generateEvaluationReport}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </Button>
              </div>

              {/* Status Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  Evaluation Status Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>
                      Submitted:{" "}
                      {
                        mockTenderInfo.committeMembers.filter(
                          (m) => m.status === "submitted",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>
                      Draft:{" "}
                      {
                        mockTenderInfo.committeMembers.filter(
                          (m) => m.status === "draft",
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>
                      Pending:{" "}
                      {
                        mockTenderInfo.committeMembers.filter(
                          (m) => m.status === "pending",
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
