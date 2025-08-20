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

// Types
interface Tender {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "Draft" | "Published" | "Open" | "Closed" | "Evaluated" | "NOC Pending" | "NOC Approved" | "NOC Rejected" | "Contract Created" | "Contract Signed" | "Implementation" | "Completed";
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
  workflowStage?: "Planning" | "Procurement" | "Evaluation" | "NOC Review" | "Contract Award" | "Implementation" | "Closeout";
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
  const [activeTab, setActiveTab] = useState("creation");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

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
        synchronizeTenderStatus(tender)
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

    window.addEventListener('nocStatusUpdated', handleNOCUpdate as EventListener);
    window.addEventListener('contractCreated', handleContractUpdate as EventListener);

    return () => {
      window.removeEventListener('nocStatusUpdated', handleNOCUpdate as EventListener);
      window.removeEventListener('contractCreated', handleContractUpdate as EventListener);
    };
  }, []);

  // Synchronize tender status with NOC and contract data
  const synchronizeTenderStatus = (tender: Tender): Tender => {
    // Check NOC status
    const nocRequests = JSON.parse(localStorage.getItem("centralNOCRequests") || "[]");
    const relatedNOC = nocRequests.find((noc: any) => noc.tenderId === tender.id);

    // Check contract status
    const contracts = JSON.parse(localStorage.getItem("contracts") || "[]");
    const relatedContract = contracts.find((contract: any) => contract.tenderId === tender.id);

    let updatedTender = { ...tender };

    if (relatedContract) {
      // Contract exists - highest priority status
      updatedTender.contractId = relatedContract.id;
      updatedTender.contractStatus = relatedContract.status;
      updatedTender.workflowStage = relatedContract.status === "Active" ? "Implementation" : "Contract Award";

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
    } else if (tender.evaluation?.status === "Complete" || tender.status === "Evaluated") {
      // Evaluation complete but no NOC yet
      updatedTender.workflowStage = "Evaluation";
      if (tender.status !== "NOC Pending") {
        updatedTender.status = "Evaluated"; // Should trigger NOC request
      }
    }

    updatedTender.lastUpdated = new Date().toISOString();
    return updatedTender;
  };

  const updateTenderFromNOC = (tenderId: string, nocId: string, status: string, certificateNumber?: string) => {
    setTenders(prevTenders => {
      const updatedTenders = prevTenders.map(tender =>
        tender.id === tenderId
          ? {
              ...tender,
              nocId,
              nocStatus: status as "Pending" | "Approved" | "Rejected",
              nocCertificateNumber: certificateNumber,
              status: status === "Approved" ? "NOC Approved" :
                     status === "Rejected" ? "NOC Rejected" : "NOC Pending",
              workflowStage: "NOC Review" as const,
              lastUpdated: new Date().toISOString(),
            }
          : tender
      );
      saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);
      return updatedTenders;
    });
  };

  const updateTenderFromContract = (tenderId: string, contractId: string, contractData: any) => {
    setTenders(prevTenders => {
      const updatedTenders = prevTenders.map(tender =>
        tender.id === tenderId
          ? {
              ...tender,
              contractId,
              contractStatus: contractData.status as "Draft" | "Active" | "Completed" | "Terminated",
              status: "Contract Created" as const,
              workflowStage: "Contract Award" as const,
              lastUpdated: new Date().toISOString(),
            }
          : tender
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
    if (tenders.length === 0) {
      const mockTenders: Tender[] = [
        {
          id: "T001",
          title: "Construction of Primary Healthcare Centers",
          description:
            "Construction of 5 primary healthcare centers across rural communities",
          budget: 250000000,
          status: "Published",
          createdDate: "2024-01-15",
          publishedDate: "2024-01-20",
          closingDate: "2024-02-20",
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
          createdDate: "2024-01-10",
          publishedDate: "2024-01-15",
          closingDate: "2024-02-15",
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

      setTenders(mockTenders);
      saveToStorage(STORAGE_KEYS.TENDERS, mockTenders);
    }
  }, [tenders.length]);

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
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
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

    const ministryInfo = getMinistryInfo();
    const tenderId = `${ministryInfo.code}-${Date.now()}`;

    // Create tender for TenderManagement local state
    const newTender: Tender = {
      id: tenderId,
      title: tenderForm.title,
      description: tenderForm.description,
      budget: parseFloat(tenderForm.budget),
      status: isDraft ? "Draft" : "Published",
      createdDate: new Date().toISOString().split("T")[0],
      publishedDate: !isDraft ? new Date().toISOString().split("T")[0] : undefined,
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

    // Also create tender for global app state (same as MinistryDashboard does)
    const globalTender = {
      id: tenderId,
      title: tenderForm.title,
      description: tenderForm.description,
      category: "General", // Could be made configurable
      estimatedValue: formatCurrency(tenderForm.budget),
      status: isDraft ? "Draft" : "Published",
      publishDate: new Date().toISOString().split("T")[0],
      closeDate: tenderForm.closingDate,
      bidsReceived: getBidCountForTender(tenderId),
      ministry: ministryInfo.name,
      procuringEntity: ministryInfo.name,
    };

    // Store in localStorage for cross-page access (same as MinistryDashboard)
    const existingTenders = localStorage.getItem("featuredTenders") || "[]";
    const tendersList = JSON.parse(existingTenders);
    const featuredTender = {
      id: globalTender.id,
      title: globalTender.title,
      description: globalTender.description,
      value: globalTender.estimatedValue,
      deadline: new Date(globalTender.closeDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: globalTender.status === "Published" ? "Open" : "Draft",
      statusColor:
        globalTender.status === "Published"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800",
      category: "General",
      ministry: ministryInfo.name,
      createdAt: Date.now(),
    };

    tendersList.unshift(featuredTender);
    const latestTenders = tendersList.slice(0, 5);
    localStorage.setItem("featuredTenders", JSON.stringify(latestTenders));

    // Also store in recentTenders
    const existingRecentTenders = localStorage.getItem("recentTenders") || "[]";
    const recentTendersList = JSON.parse(existingRecentTenders);
    const recentTender = {
      id: globalTender.id,
      title: globalTender.title,
      category: "General",
      value: globalTender.estimatedValue,
      deadline: globalTender.closeDate,
      location: "Kano State",
      views: 0,
      status: globalTender.status === "Published" ? "Open" : "Draft",
      description: globalTender.description,
      publishDate: globalTender.publishDate,
      closingDate: globalTender.closeDate,
      tenderFee: formatCurrency(25000),
      procuringEntity: ministryInfo.name,
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
    const latestRecentTenders = recentTendersList.slice(0, 10);
    localStorage.setItem("recentTenders", JSON.stringify(latestRecentTenders));

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
    const colors = {
      // Original statuses
      Draft: "bg-gray-100 text-gray-800",
      Published: "bg-blue-100 text-blue-800",
      Open: "bg-green-100 text-green-800",
      Closed: "bg-red-100 text-red-800",
      Evaluated: "bg-yellow-100 text-yellow-800",
      Awarded: "bg-purple-100 text-purple-800",

      // NOC workflow statuses
      "NOC Pending": "bg-orange-100 text-orange-800",
      "NOC Approved": "bg-green-100 text-green-800",
      "NOC Rejected": "bg-red-100 text-red-800",

      // Contract workflow statuses
      "Contract Created": "bg-blue-100 text-blue-800",
      "Contract Signed": "bg-purple-100 text-purple-800",
      Implementation: "bg-indigo-100 text-indigo-800",
      Completed: "bg-green-100 text-green-800",
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getDaysRemaining = (closingDate: string) => {
    const closing = new Date(closingDate);
    const today = new Date();
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Tender Management Module (KanoProc)
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowTenderModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Tender
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="creation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Creation
          </TabsTrigger>
          <TabsTrigger
            value="administration"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Administration
          </TabsTrigger>
          <TabsTrigger value="vendor" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendor Interaction
          </TabsTrigger>
          <TabsTrigger value="opening" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Opening
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Evaluation
          </TabsTrigger>
          <TabsTrigger value="award" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Award
          </TabsTrigger>
          <TabsTrigger value="notification" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification
          </TabsTrigger>
          <TabsTrigger value="contract" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Contract Link
          </TabsTrigger>
        </TabsList>

        {/* Tender Creation & Publication */}
        <TabsContent value="creation" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setShowTenderModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Tender
            </Button>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Evaluated">Evaluated</SelectItem>
                <SelectItem value="Awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredTenders.map((tender) => (
              <Card
                key={tender.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tender.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {tender.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Budget: ₦{tender.budget.toLocaleString()}</span>
                        <span>Method: {tender.procurementMethod}</span>
                        <span>Type: {tender.tenderType}</span>
                        {tender.closingDate && (
                          <span>
                            Days Remaining:{" "}
                            {getDaysRemaining(tender.closingDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(tender.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTender(tender)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                                      publishedDate: new Date().toISOString().split("T")[0],
                                    }
                                  : t,
                              );
                              setTenders(updatedTenders);
                              saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);
                            }}
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

        {/* Tender Administration */}
        <TabsContent value="administration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tender Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Amendments & Addenda</h3>
                    <p className="text-sm text-gray-600">
                      Issue clarifications and updated documents
                    </p>
                  </div>
                  <Button onClick={() => setShowAmendmentModal(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Amendment
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Timeline Tracker</h3>
                    <p className="text-sm text-gray-600">
                      Monitor tender deadlines and milestones
                    </p>
                  </div>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Timeline
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Audit Trail</h3>
                    <p className="text-sm text-gray-600">
                      Complete log of all tender activities
                    </p>
                  </div>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    View Audit Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
                      <Users className="h-5 w-5 text-purple-600" />
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
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-800">
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
                <Label htmlFor="budget">Budget (₦)</Label>
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
