import { useState, useEffect } from "react";
import { debugNOCTenders } from "@/lib/debugNOCTenders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { logUserAction } from "@/lib/auditLogStorage";
import {
  FileText,
  Upload,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Calendar,
  User,
  Building2,
  DollarSign,
  Download,
  Plus,
  Filter,
  Search,
  FileCheck,
  History,
  Signature,
  RefreshCw,
} from "lucide-react";

// Enhanced NOC Request interface
interface NOCRequest {
  id: string;
  tenderId?: string;
  tenderTitle?: string;
  projectTitle: string;
  requestDate: string;
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Clarification Requested"
    | "Approved"
    | "Rejected"
    | "Pending";
  projectValue: string;
  contractorName: string;
  expectedDuration: string;
  ministryCode: string;
  ministryName: string;
  procuringEntity: string;
  contactPerson: string;
  contactEmail: string;
  projectDescription: string;
  justification: string;
  category: string;

  // Enhanced fields for new functionality
  evaluationResults?: {
    technicalScore: number;
    financialScore: number;
    totalScore: number;
    recommendation: string;
  };

  // Document attachments
  documents: {
    evaluationReport?: File;
    committeeMinutes?: File;
    bidComparisonSheet?: File;
    recommendationForAward?: File;
    supportingDocuments?: File[];
  };

  // Workflow tracking
  timeline: {
    dateSubmitted?: string;
    reviewerAssigned?: string;
    reviewStartDate?: string;
    approvalDate?: string;
    rejectionDate?: string;
    clarificationRequestDate?: string;
  };

  // BPP decision information
  bppDecision?: {
    decision: "Approve" | "Reject" | "Request Clarification";
    comments: string;
    reviewerName: string;
    digitalSignature?: string;
    decisionDate: string;
  };

  // Version control for clarifications
  version: number;
  clarificationHistory?: {
    version: number;
    requestDate: string;
    requestComments: string;
    responseDate?: string;
    responseDocuments?: File[];
  }[];

  approvalDate?: string;
  certificateNumber?: string;
}

interface TenderEvaluation {
  id: string;
  tenderTitle: string;
  ministryCode: string;
  status: "Completed";
  evaluationResults: {
    technicalScore: number;
    financialScore: number;
    totalScore: number;
    recommendation: string;
  };
  winningBidder: string;
  projectValue: string;
  evaluationDate: string;
  description?: string;
  category?: string;
  publishDate?: string;
  closeDate?: string;
  procuringEntity?: string;
}

interface NOCRequestsModuleProps {
  ministryCode: string;
  ministryName: string;
}

export default function NOCRequestsModule({
  ministryCode,
  ministryName,
}: NOCRequestsModuleProps) {
  const [activeTab, setActiveTab] = useState("new-request");
  const [nocRequests, setNOCRequests] = useState<NOCRequest[]>([]);
  const [completedTenders, setCompletedTenders] = useState<TenderEvaluation[]>(
    [],
  );
  const [selectedTender, setSelectedTender] = useState<TenderEvaluation | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<NOCRequest | null>(
    null,
  );

  // New NOC Request form state
  const [newRequest, setNewRequest] = useState<Partial<NOCRequest>>({
    projectTitle: "",
    projectValue: "",
    contractorName: "",
    expectedDuration: "",
    procuringEntity: "",
    contactPerson: "",
    contactEmail: "",
    projectDescription: "",
    justification: "",
    category: "",
    documents: {},
    version: 1,
    timeline: {},
  });

  // Ensure ministry tenders are initialized
  const ensureMinistryTendersInitialized = () => {
    const ministryTendersKey = `${ministryCode}_tenders`;
    const existingTenders = localStorage.getItem(ministryTendersKey);

    if (!existingTenders) {
      console.log(
        `No tenders found for ${ministryCode}, initializing with default evaluated tenders...`,
      );

      // Create default evaluated tenders for the ministry
      const defaultEvaluatedTenders = (() => {
        switch (ministryCode) {
          case "MOWI":
            return [
              {
                id: "MOWI-2024-001",
                title: "Kano-Kaduna Highway Rehabilitation",
                description: "Complete rehabilitation of Kano-Kaduna highway",
                category: "Road Construction",
                estimatedValue: "₦15,200,000,000",
                status: "Evaluated",
                publishDate: "2024-01-20",
                closeDate: "2024-02-20",
                bidsReceived: 5,
                ministry: "Ministry of Works & Infrastructure",
                procuringEntity: "Kano State Road Maintenance Agency",
              },
              {
                id: "MOWI-2024-002",
                title: "Bridge Construction Project - Phase 2",
                description: "Construction of strategic bridges",
                category: "Bridge Construction",
                estimatedValue: "₦8,500,000,000",
                status: "Evaluated",
                publishDate: "2024-02-01",
                closeDate: "2024-03-01",
                bidsReceived: 4,
                ministry: "Ministry of Works & Infrastructure",
                procuringEntity: "Kano State Ministry of Works",
              },
            ];
          case "MOE":
            return [
              {
                id: "MOE-2024-001",
                title: "School Furniture Supply Program",
                description: "Supply of furniture for 200 schools",
                category: "Educational Furniture",
                estimatedValue: "₦2,100,000,000",
                status: "Evaluated",
                publishDate: "2024-01-15",
                closeDate: "2024-02-15",
                bidsReceived: 8,
                ministry: "Ministry of Education",
                procuringEntity: "Kano State Universal Basic Education Board",
              },
            ];
          default: // MOH
            return [
              {
                id: "MOH-2024-001",
                title: "Hospital Equipment Supply",
                description:
                  "Supply of medical equipment for healthcare centers",
                category: "Medical Equipment",
                estimatedValue: "₦850,000,000",
                status: "Evaluated",
                publishDate: "2024-01-15",
                closeDate: "2024-02-15",
                bidsReceived: 5,
                ministry: "Ministry of Health",
                procuringEntity:
                  "Kano State Primary Healthcare Development Agency",
              },
              {
                id: "MOH-2024-002",
                title: "Pharmaceutical Supply Contract",
                description: "Annual pharmaceutical supply for hospitals",
                category: "Pharmaceuticals",
                estimatedValue: "₦1,200,000,000",
                status: "Evaluated",
                publishDate: "2024-01-20",
                closeDate: "2024-03-01",
                bidsReceived: 5,
                ministry: "Ministry of Health",
                procuringEntity: "Kano State Hospital Management Board",
              },
            ];
        }
      })();

      localStorage.setItem(
        ministryTendersKey,
        JSON.stringify(defaultEvaluatedTenders),
      );
      console.log(
        `Initialized ${defaultEvaluatedTenders.length} default tenders for ${ministryCode}`,
      );
    }
  };

  // Load data on component mount
  useEffect(() => {
    ensureMinistryTendersInitialized();
    loadNOCRequests();
    loadCompletedTenders();
  }, [ministryCode]);

  // Handle real-time NOC status updates
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
                timeline: {
                  ...request.timeline,
                  dateApproved: approvalDate,
                },
              }),
              ...(status === "Rejected" && {
                rejectionDate,
                timeline: {
                  ...request.timeline,
                  dateRejected: rejectionDate,
                },
              }),
            };
          }
          return request;
        });

        // Update localStorage for persistence
        const ministryNOCKey = `${ministryCode}_NOCRequests`;
        localStorage.setItem(ministryNOCKey, JSON.stringify(updatedRequests));

        return updatedRequests;
      });
    };

    // Listen for NOC status updates
    window.addEventListener(
      "nocStatusUpdated",
      handleNOCStatusUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "nocStatusUpdated",
        handleNOCStatusUpdate as EventListener,
      );
    };
  }, [ministryCode]);

  const loadNOCRequests = () => {
    const ministryNOCKey = `${ministryCode}_NOCRequests`;
    const storedNOCs = localStorage.getItem(ministryNOCKey);
    if (storedNOCs) {
      const requests = JSON.parse(storedNOCs);
      // Migrate legacy requests that don't have timeline structure
      const migratedRequests = requests.map((request: any) => ({
        ...request,
        timeline: request.timeline || {
          dateSubmitted: request.requestDate,
        },
        documents: request.documents || {},
        version: request.version || 1,
      }));
      setNOCRequests(migratedRequests);
    }
  };

  const loadCompletedTenders = () => {
    // Load actual evaluated tenders from the ministry's tender management system
    try {
      console.log(`Loading completed tenders for ministry: ${ministryCode}`);

      // Get ministry-specific evaluated tenders
      const ministryTendersKey = `${ministryCode}_tenders`;
      const storedTenders = localStorage.getItem(ministryTendersKey);

      console.log(
        `Looking for tenders in localStorage key: ${ministryTendersKey}`,
      );
      console.log(`Found data:`, storedTenders ? "Yes" : "No");

      let evaluatedTenders: TenderEvaluation[] = [];

      if (storedTenders) {
        const tenders = JSON.parse(storedTenders);
        console.log(
          `Found ${tenders.length} total tenders for ${ministryCode}`,
        );
        console.log(
          "Tender statuses:",
          tenders.map((t: any) => `${t.id}: ${t.status}`),
        );

        // Filter for evaluated tenders and convert to TenderEvaluation format
        const filteredTenders = tenders.filter(
          (tender: any) => tender.status === "Evaluated",
        );
        console.log(`Found ${filteredTenders.length} evaluated tenders`);

        evaluatedTenders = filteredTenders.map((tender: any) => ({
          id: tender.id,
          tenderTitle: tender.title,
          ministryCode,
          status: "Completed" as const,
          evaluationResults: {
            technicalScore: 85, // Mock evaluation scores - in real app would come from evaluation data
            financialScore: 90,
            totalScore: 87.5,
            recommendation: "Recommended for Award",
          },
          winningBidder: "Awaiting Final Award", // Would be set after evaluation
          projectValue: tender.estimatedValue,
          evaluationDate: new Date().toISOString().split("T")[0],
          description: tender.description,
          category: tender.category,
          publishDate: tender.publishDate,
          closeDate: tender.closeDate,
          procuringEntity: tender.procuringEntity,
        }));
      }

      // If no evaluated tenders found, load ministry-specific defaults
      if (evaluatedTenders.length === 0) {
        // Ministry-specific default tenders based on ministry type
        const getDefaultTenders = () => {
          switch (ministryCode) {
            case "MOWI": // Ministry of Works
              return [
                {
                  id: "MOWI-2024-001",
                  tenderTitle: "Kano-Kaduna Highway Rehabilitation",
                  ministryCode,
                  status: "Completed" as const,
                  evaluationResults: {
                    technicalScore: 88,
                    financialScore: 92,
                    totalScore: 90,
                    recommendation: "Recommended for Award",
                  },
                  winningBidder: "Kano Construction Ltd",
                  projectValue: "₦15,200,000,000",
                  evaluationDate: "2024-01-20",
                  description: "Complete rehabilitation of Kano-Kaduna highway",
                  category: "Road Construction",
                },
                {
                  id: "MOWI-2024-002",
                  tenderTitle: "Bridge Construction Project - Phase 2",
                  ministryCode,
                  status: "Completed" as const,
                  evaluationResults: {
                    technicalScore: 85,
                    financialScore: 88,
                    totalScore: 86.5,
                    recommendation: "Recommended for Award",
                  },
                  winningBidder: "Sahel Bridge Builders",
                  projectValue: "₦8,500,000,000",
                  evaluationDate: "2024-02-01",
                  description: "Construction of strategic bridges",
                  category: "Bridge Construction",
                },
              ];
            case "MOE": // Ministry of Education
              return [
                {
                  id: "MOE-2024-001",
                  tenderTitle: "School Furniture Supply Program",
                  ministryCode,
                  status: "Completed" as const,
                  evaluationResults: {
                    technicalScore: 90,
                    financialScore: 85,
                    totalScore: 87.5,
                    recommendation: "Recommended for Award",
                  },
                  winningBidder: "EduTech Solutions Ltd",
                  projectValue: "₦2,100,000,000",
                  evaluationDate: "2024-01-15",
                  description: "Supply of furniture for 200 schools",
                  category: "Educational Furniture",
                },
              ];
            default: // Ministry of Health
              return [
                {
                  id: "MOH-2024-001",
                  tenderTitle: "Hospital Equipment Supply",
                  ministryCode,
                  status: "Completed" as const,
                  evaluationResults: {
                    technicalScore: 92,
                    financialScore: 88,
                    totalScore: 90,
                    recommendation: "Recommended for Award",
                  },
                  winningBidder: "PrimeCare Medical Ltd",
                  projectValue: "₦850,000,000",
                  evaluationDate: "2024-01-15",
                  description:
                    "Supply of medical equipment for healthcare centers",
                  category: "Medical Equipment",
                },
                {
                  id: "MOH-2024-002",
                  tenderTitle: "Pharmaceutical Supply Contract",
                  ministryCode,
                  status: "Completed" as const,
                  evaluationResults: {
                    technicalScore: 87,
                    financialScore: 93,
                    totalScore: 90,
                    recommendation: "Recommended for Award",
                  },
                  winningBidder: "Falcon Diagnostics Ltd",
                  projectValue: "₦1,200,000,000",
                  evaluationDate: "2024-01-20",
                  description: "Annual pharmaceutical supply for hospitals",
                  category: "Pharmaceuticals",
                },
              ];
          }
        };

        evaluatedTenders = getDefaultTenders();
        console.log(`Using default tenders: ${evaluatedTenders.length} items`);
      }

      console.log(
        `Final evaluated tenders for ${ministryCode}:`,
        evaluatedTenders.map((t) => t.tenderTitle),
      );
      setCompletedTenders(evaluatedTenders);
    } catch (error) {
      console.error("Error loading completed tenders:", error);
      setCompletedTenders([]);
    }
  };

  const handleTenderSelection = (tender: TenderEvaluation) => {
    setSelectedTender(tender);
    setNewRequest((prev) => ({
      ...prev,
      tenderId: tender.id,
      tenderTitle: tender.tenderTitle,
      projectTitle: tender.tenderTitle,
      projectValue: tender.projectValue,
      contractorName: tender.winningBidder,
      evaluationResults: tender.evaluationResults,
    }));
  };

  const handleFileUpload = (documentType: string, file: File) => {
    setNewRequest((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file,
      },
    }));
  };

  const handleSubmitNOCRequest = () => {
    if (
      !newRequest.projectTitle ||
      !newRequest.contractorName ||
      !newRequest.projectValue
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const requestId = `NOC_${Date.now()}`;
    const currentDate = new Date().toISOString().split("T")[0];

    const nocRequest: NOCRequest = {
      id: requestId,
      tenderId: newRequest.tenderId,
      tenderTitle: newRequest.tenderTitle,
      projectTitle: newRequest.projectTitle!,
      requestDate: currentDate,
      status: "Draft",
      projectValue: newRequest.projectValue!,
      contractorName: newRequest.contractorName!,
      expectedDuration: newRequest.expectedDuration || "",
      ministryCode,
      ministryName,
      procuringEntity: newRequest.procuringEntity || "",
      contactPerson: newRequest.contactPerson || "",
      contactEmail: newRequest.contactEmail || "",
      projectDescription: newRequest.projectDescription || "",
      justification: newRequest.justification || "",
      category: newRequest.category || "",
      evaluationResults: newRequest.evaluationResults,
      documents: newRequest.documents || {},
      timeline: {
        dateSubmitted: currentDate,
      },
      version: 1,
    };

    // Save to ministry-specific storage
    const ministryNOCKey = `${ministryCode}_NOCRequests`;
    const existingNOCs = localStorage.getItem(ministryNOCKey);
    const nocList = existingNOCs ? JSON.parse(existingNOCs) : [];
    nocList.unshift(nocRequest);
    localStorage.setItem(ministryNOCKey, JSON.stringify(nocList));

    // Add to central NOC requests for superuser review
    const centralNOCs = localStorage.getItem("centralNOCRequests");
    const centralList = centralNOCs ? JSON.parse(centralNOCs) : [];
    centralList.unshift(nocRequest);
    localStorage.setItem("centralNOCRequests", JSON.stringify(centralList));

    // Log the action
    logUserAction(
      ministryCode, // user
      "ministry_admin", // userRole
      "NOC_REQUEST_CREATED", // action
      nocRequest.projectTitle, // entity
      `New NOC request created for ${nocRequest.projectTitle}`, // details
      "HIGH", // severity
      nocRequest.id, // entityId
      nocRequest, // metadata
    );

    setNOCRequests((prev) => [nocRequest, ...prev]);
    setShowNewRequestDialog(false);
    setNewRequest({
      projectTitle: "",
      projectValue: "",
      contractorName: "",
      expectedDuration: "",
      procuringEntity: "",
      contactPerson: "",
      contactEmail: "",
      projectDescription: "",
      justification: "",
      category: "",
      documents: {},
      version: 1,
      timeline: {},
    });
    setSelectedTender(null);

    alert("NOC Request created successfully as draft!");
  };

  const handleSubmitForReview = (requestId: string) => {
    setNOCRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "Submitted",
              timeline: {
                ...req.timeline,
                dateSubmitted: new Date().toISOString().split("T")[0],
              },
            }
          : req,
      ),
    );

    // Update central storage
    const centralNOCs = localStorage.getItem("centralNOCRequests");
    if (centralNOCs) {
      const centralList = JSON.parse(centralNOCs);
      const updatedCentralList = centralList.map((req: NOCRequest) =>
        req.id === requestId
          ? {
              ...req,
              status: "Submitted",
              timeline: {
                ...req.timeline,
                dateSubmitted: new Date().toISOString().split("T")[0],
              },
            }
          : req,
      );
      localStorage.setItem(
        "centralNOCRequests",
        JSON.stringify(updatedCentralList),
      );
    }

    // Persist to ministry-specific storage
    const ministryNOCKey = `${ministryCode}_NOCRequests`;
    const ministryNOCs = localStorage.getItem(ministryNOCKey);
    if (ministryNOCs) {
      const list = JSON.parse(ministryNOCs);
      const updatedList = list.map((req: NOCRequest) =>
        req.id === requestId
          ? {
              ...req,
              status: "Submitted",
              timeline: {
                ...req.timeline,
                dateSubmitted: new Date().toISOString().split("T")[0],
              },
            }
          : req,
      );
      localStorage.setItem(ministryNOCKey, JSON.stringify(updatedList));
    }

    alert("NOC Request submitted for review!");
  };

  const getStatusBadge = (status: NOCRequest["status"]) => {
    const statusConfig = {
      Draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
      Submitted: { color: "bg-blue-100 text-blue-800", icon: Send },
      "Under Review": { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      "Clarification Requested": {
        color: "bg-orange-100 text-orange-800",
        icon: AlertTriangle,
      },
      Approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      // Handle legacy status values
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig];

    // Fallback if status is not found
    if (!config) {
      return (
        <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {status}
        </Badge>
      );
    }

    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const filteredRequests = nocRequests.filter((request) => {
    const matchesSearch =
      request.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contractorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-violet-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-purple-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-violet-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-violet-800 bg-clip-text text-transparent">
                    NOC Requests Module
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Manage No Objection Certificate requests linked to tender
                    evaluations
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
                onClick={() => setShowNewRequestDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                New NOC Request
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  loadNOCRequests();
                  loadCompletedTenders();
                }}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  debugNOCTenders();
                  console.log("=== Current Ministry Info ===");
                  console.log("Ministry Code:", ministryCode);
                  console.log("Ministry Name:", ministryName);
                  console.log("Completed Tenders:", completedTenders);
                }}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                🐛 Debug
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 shadow-lg p-2">
          <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
            <TabsTrigger
              value="new-request"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 border border-transparent data-[state=active]:border-purple-200"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">New NOC Request</span>
            </TabsTrigger>
            <TabsTrigger
              value="tracking"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-emerald-50 border border-transparent data-[state=active]:border-emerald-200"
            >
              <History className="h-4 w-4" />
              <span className="font-medium">Request Tracking</span>
            </TabsTrigger>
            <TabsTrigger
              value="decisions"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-50 border border-transparent data-[state=active]:border-amber-200"
            >
              <Signature className="h-4 w-4" />
              <span className="font-medium">Approvals & Decisions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="new-request" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg rounded-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600/5 to-violet-600/5 border-b border-purple-100">
              <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                <Plus className="h-5 w-5 text-purple-600" />
                Create New NOC Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <FileCheck className="h-4 w-4" />
                  <AlertDescription>
                    NOC requests are linked to completed tender evaluations.
                    Select a completed tender below to auto-populate details.
                  </AlertDescription>
                </Alert>

                {completedTenders.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Available Completed Tender Evaluations
                    </Label>
                    <div className="grid gap-3 mt-2">
                      {completedTenders.map((tender) => (
                        <Card
                          key={tender.id}
                          className={`cursor-pointer transition-all duration-200 rounded-lg ${
                            selectedTender?.id === tender.id
                              ? "ring-2 ring-purple-500 bg-purple-50 shadow-md"
                              : "hover:bg-purple-50/50 hover:shadow-md border border-purple-100"
                          }`}
                          onClick={() => handleTenderSelection(tender)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h3 className="font-medium">
                                  {tender.tenderTitle}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Winning Bidder: {tender.winningBidder}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Project Value: {formatCurrency(tender.projectValue)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  Overall Score:{" "}
                                  {tender.evaluationResults.totalScore}%
                                </p>
                                <p className="text-xs text-green-600">
                                  {tender.evaluationResults.recommendation}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowNewRequestDialog(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:bg-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!selectedTender}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create NOC Request from Selected Tender
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg rounded-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600/5 to-violet-600/5 border-b border-purple-100">
              <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                <History className="h-5 w-5 text-purple-600" />
                Request Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Enhanced Search Bar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 shadow-md p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search by project title, contractor, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-56 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg shadow-sm">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                          <SelectItem
                            value="all"
                            className="hover:bg-purple-50"
                          >
                            All Statuses
                          </SelectItem>
                          <SelectItem
                            value="Draft"
                            className="hover:bg-gray-50"
                          >
                            Draft
                          </SelectItem>
                          <SelectItem
                            value="Submitted"
                            className="hover:bg-blue-50"
                          >
                            Submitted
                          </SelectItem>
                          <SelectItem
                            value="Under Review"
                            className="hover:bg-orange-50"
                          >
                            Under Review
                          </SelectItem>
                          <SelectItem
                            value="Clarification Requested"
                            className="hover:bg-yellow-50"
                          >
                            Clarification Requested
                          </SelectItem>
                          <SelectItem
                            value="Approved"
                            className="hover:bg-green-50"
                          >
                            Approved
                          </SelectItem>
                          <SelectItem
                            value="Rejected"
                            className="hover:bg-red-50"
                          >
                            Rejected
                          </SelectItem>
                          <SelectItem
                            value="Pending"
                            className="hover:bg-gray-50"
                          >
                            Pending
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="hover:shadow-xl transition-all duration-200 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-xl"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {request.projectTitle}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p>
                                <span className="font-medium">Contractor:</span>{" "}
                                {request.contractorName}
                              </p>
                              <p>
                                <span className="font-medium">Value:</span>{" "}
                                {formatCurrency(request.projectValue)}
                              </p>
                            </div>
                            <div>
                              <p>
                                <span className="font-medium">
                                  Request Date:
                                </span>{" "}
                                {request.requestDate}
                              </p>
                              <p>
                                <span className="font-medium">Duration:</span>{" "}
                                {request.expectedDuration}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestDetails(true);
                            }}
                            className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {request.status === "Draft" && (
                            <Button
                              size="sm"
                              onClick={() => handleSubmitForReview(request.id)}
                              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No NOC requests found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signature className="h-5 w-5" />
                Approvals & Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <FileCheck className="h-4 w-4" />
                  <AlertDescription>
                    This section shows BPP's decision log for your submitted NOC
                    requests. Decisions are digitally signed and securely
                    logged.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  {nocRequests
                    .filter((req) => req.status !== "Draft")
                    .map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h3 className="font-medium">
                                {request.projectTitle}
                              </h3>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(request.status)}
                                {request.bppDecision && (
                                  <Badge variant="outline" className="text-xs">
                                    Decision by:{" "}
                                    {request.bppDecision.reviewerName}
                                  </Badge>
                                )}
                              </div>
                              {request.bppDecision && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <p className="text-sm font-medium">
                                    BPP Decision Comments:
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {request.bppDecision.comments}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Decision Date:{" "}
                                    {request.bppDecision.decisionDate}
                                    {request.bppDecision.digitalSignature &&
                                      " • Digitally Signed"}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Submitted:{" "}
                                {request.timeline?.dateSubmitted ||
                                  request.requestDate}
                              </p>
                              {request.status === "Approved" &&
                                request.certificateNumber && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download Certificate
                                  </Button>
                                )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New NOC Request Dialog */}
      <Dialog
        open={showNewRequestDialog}
        onOpenChange={setShowNewRequestDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New NOC Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {selectedTender && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Selected Tender Evaluation
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <span className="font-medium">Tender:</span>{" "}
                        {selectedTender.tenderTitle}
                      </p>
                      <p>
                        <span className="font-medium">Winning Bidder:</span>{" "}
                        {selectedTender.winningBidder}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Project Value:</span>{" "}
                        {selectedTender.projectValue}
                      </p>
                      <p>
                        <span className="font-medium">Overall Score:</span>{" "}
                        {selectedTender.evaluationResults.totalScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  value={newRequest.projectTitle || ""}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      projectTitle: e.target.value,
                    }))
                  }
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <Label htmlFor="contractorName">Contractor Name *</Label>
                <Input
                  id="contractorName"
                  value={newRequest.contractorName || ""}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      contractorName: e.target.value,
                    }))
                  }
                  placeholder="Enter contractor name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectValue">Project Value *</Label>
                <Input
                  id="projectValue"
                  value={newRequest.projectValue || ""}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      projectValue: e.target.value,
                    }))
                  }
                  placeholder="Enter project value"
                />
              </div>
              <div>
                <Label htmlFor="expectedDuration">Expected Duration</Label>
                <Input
                  id="expectedDuration"
                  value={newRequest.expectedDuration || ""}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      expectedDuration: e.target.value,
                    }))
                  }
                  placeholder="e.g., 12 months"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="procuringEntity">Procuring Entity</Label>
                <Input
                  id="procuringEntity"
                  value={newRequest.procuringEntity || ""}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      procuringEntity: e.target.value,
                    }))
                  }
                  placeholder="Enter procuring entity"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newRequest.category || ""}
                  onValueChange={(value) =>
                    setNewRequest((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="goods">Goods/Supplies</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="consultancy">Consultancy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={newRequest.contactPerson || ""}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      contactPerson: e.target.value,
                    }))
                  }
                  placeholder="Enter contact person"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newRequest.contactEmail || ""}
                  onChange={(e) =>
                    setNewRequest((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  placeholder="Enter contact email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea
                id="projectDescription"
                value={newRequest.projectDescription || ""}
                onChange={(e) =>
                  setNewRequest((prev) => ({
                    ...prev,
                    projectDescription: e.target.value,
                  }))
                }
                placeholder="Provide detailed project description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="justification">
                Justification for NOC Request
              </Label>
              <Textarea
                id="justification"
                value={newRequest.justification || ""}
                onChange={(e) =>
                  setNewRequest((prev) => ({
                    ...prev,
                    justification: e.target.value,
                  }))
                }
                placeholder="Provide justification for the NOC request"
                rows={3}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Evaluation Report (Technical + Financial)</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("evaluationReport", file);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Committee Minutes & Attendance</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("committeeMinutes", file);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bid Comparison Sheet</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.xls,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleFileUpload("bidComparisonSheet", file);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Recommendation for Award</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleFileUpload("recommendationForAward", file);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewRequestDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitNOCRequest}
                className="bg-green-600 hover:bg-green-700"
              >
                Create NOC Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>NOC Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  {selectedRequest.projectTitle}
                </h3>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Project Information
                    </h4>
                    <div className="mt-2 space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Contractor:</span>{" "}
                        {selectedRequest.contractorName}
                      </p>
                      <p>
                        <span className="font-medium">Value:</span>{" "}
                        {selectedRequest.projectValue}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span>{" "}
                        {selectedRequest.expectedDuration}
                      </p>
                      <p>
                        <span className="font-medium">Category:</span>{" "}
                        {selectedRequest.category}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">
                      Contact Information
                    </h4>
                    <div className="mt-2 space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Contact Person:</span>{" "}
                        {selectedRequest.contactPerson}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedRequest.contactEmail}
                      </p>
                      <p>
                        <span className="font-medium">Procuring Entity:</span>{" "}
                        {selectedRequest.procuringEntity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Timeline</h4>
                    <div className="mt-2 space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Request Date:</span>{" "}
                        {selectedRequest.requestDate}
                      </p>
                      {selectedRequest.timeline?.dateSubmitted && (
                        <p>
                          <span className="font-medium">Submitted:</span>{" "}
                          {selectedRequest.timeline.dateSubmitted}
                        </p>
                      )}
                      {selectedRequest.timeline?.reviewStartDate && (
                        <p>
                          <span className="font-medium">Review Started:</span>{" "}
                          {selectedRequest.timeline.reviewStartDate}
                        </p>
                      )}
                      {selectedRequest.timeline?.approvalDate && (
                        <p>
                          <span className="font-medium">Approved:</span>{" "}
                          {selectedRequest.timeline.approvalDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedRequest.evaluationResults && (
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Evaluation Results
                      </h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Technical Score:</span>{" "}
                          {selectedRequest.evaluationResults.technicalScore}%
                        </p>
                        <p>
                          <span className="font-medium">Financial Score:</span>{" "}
                          {selectedRequest.evaluationResults.financialScore}%
                        </p>
                        <p>
                          <span className="font-medium">Overall Score:</span>{" "}
                          {selectedRequest.evaluationResults.totalScore}%
                        </p>
                        <p>
                          <span className="font-medium">Recommendation:</span>{" "}
                          {selectedRequest.evaluationResults.recommendation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.projectDescription && (
                <div>
                  <h4 className="font-medium text-gray-900">
                    Project Description
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedRequest.projectDescription}
                  </p>
                </div>
              )}

              {selectedRequest.justification && (
                <div>
                  <h4 className="font-medium text-gray-900">Justification</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedRequest.justification}
                  </p>
                </div>
              )}

              {selectedRequest.bppDecision && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900">BPP Decision</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Decision:</span>{" "}
                      {selectedRequest.bppDecision.decision}
                    </p>
                    <p>
                      <span className="font-medium">Reviewer:</span>{" "}
                      {selectedRequest.bppDecision.reviewerName}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {selectedRequest.bppDecision.decisionDate}
                    </p>
                    <p>
                      <span className="font-medium">Comments:</span>{" "}
                      {selectedRequest.bppDecision.comments}
                    </p>
                    {selectedRequest.bppDecision.digitalSignature && (
                      <p className="text-green-600">
                        <span className="font-medium">Status:</span> Digitally
                        Signed
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
