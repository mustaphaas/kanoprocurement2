import { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Users,
  Target,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Trash2,
  Calculator,
  BarChart3,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  DollarSign,
  Scale,
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
import BudgetAllocation from "./BudgetAllocation";
import CommitteeTemplates from "./CommitteeTemplates";
import FlexibleQCBSTemplate from "./FlexibleQCBSTemplate";
import TenderCommitteeAssignment from "./TenderCommitteeAssignment";

// Types
interface ProcurementPlan {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "Draft" | "Approved" | "Rejected" | "Under Review";
  createdDate: string;
  approvedDate?: string;
  approvedBy?: string;
  ministry: string;
  department: string;
  financialYear: string;
  categories: ProcurementCategory[];
  marketResearch: MarketResearch[];
  tenderStrategy: "Open" | "Selective" | "Limited";
  timeline: PlanTimeline[];
  approvalWorkflow: ApprovalStep[];
}

interface ProcurementCategory {
  id: string;
  name: string;
  description: string;
  estimatedBudget: number;
  allocatedBudget: number;
  priority: "High" | "Medium" | "Low";
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
}

interface MarketResearch {
  id: string;
  category: string;
  notes: string;
  date: string;
  author: string;
  findings: string;
  recommendations: string;
}

interface PlanTimeline {
  id: string;
  phase: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
  dependencies: string[];
}

interface ApprovalStep {
  id: string;
  step: string;
  approver: string;
  status: "Pending" | "Approved" | "Rejected";
  date?: string;
  comments?: string;
}

interface CommitteeMember {
  id: string;
  name: string;
  role: "Chair" | "Secretary" | "Evaluator";
  department: string;
  email: string;
  phone: string;
  conflictOfInterest: boolean;
  expertise: string[];
}

interface EvaluationCommittee {
  id: string;
  name: string;
  description: string;
  members: CommitteeMember[];
  activeEvaluations: string[];
  createdDate: string;
  status: "Active" | "Inactive";
}

interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  subCriteria: SubCriteria[];
}

interface SubCriteria {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
}

interface VendorEvaluation {
  vendorId: string;
  vendorName: string;
  scores: { [criteriaId: string]: number };
  totalScore: number;
  technicalCompliance: boolean;
  comments: string;
  evaluatorId: string;
  evaluatorName: string;
}

interface ScoringMatrix {
  id: string;
  tenderId: string;
  tenderTitle: string;
  committeeId: string;
  criteria: ScoringCriteria[];
  vendors: VendorEvaluation[];
  consensusScores: { [vendorId: string]: number };
  finalRanking: string[];
  status: "Draft" | "In Progress" | "Completed";
  createdDate: string;
  completedDate?: string;
}

const STORAGE_KEYS = {
  PROCUREMENT_PLANS: "procurementPlans",
  EVALUATION_COMMITTEES: "evaluationCommittees",
  SCORING_MATRICES: "scoringMatrices",
  MARKET_RESEARCH: "marketResearch",
};

export default function ProcurementPlanning() {
  const [activeTab, setActiveTab] = useState("plans");
  const [procurementPlans, setProcurementPlans] = useState<ProcurementPlan[]>(
    [],
  );
  const [evaluationCommittees, setEvaluationCommittees] = useState<
    EvaluationCommittee[]
  >([]);
  const [scoringMatrices, setScoringMatrices] = useState<ScoringMatrix[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ProcurementPlan | null>(
    null,
  );
  const [selectedCommittee, setSelectedCommittee] =
    useState<EvaluationCommittee | null>(null);
  const [selectedMatrix, setSelectedMatrix] = useState<ScoringMatrix | null>(
    null,
  );
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showMarketResearchModal, setShowMarketResearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form states
  const [planForm, setPlanForm] = useState({
    title: "",
    description: "",
    budget: "",
    ministry: "",
    department: "",
    financialYear: new Date().getFullYear().toString(),
    tenderStrategy: "Open" as const,
  });

  const [committeeForm, setCommitteeForm] = useState({
    name: "",
    description: "",
    members: [
      {
        name: "",
        role: "Evaluator" as const,
        department: "",
        email: "",
        phone: "",
        conflictOfInterest: false,
        expertise: [] as string[],
      },
    ],
  });

  const [marketResearchForm, setMarketResearchForm] = useState({
    category: "",
    notes: "",
    findings: "",
    recommendations: "",
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = () => {
    try {
      const ministryUser = JSON.parse(
        localStorage.getItem("ministryUser") || "{}",
      );
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";

      const plansKey = `${ministryCode}_${STORAGE_KEYS.PROCUREMENT_PLANS}`;
      const committeesKey = `${ministryCode}_${STORAGE_KEYS.EVALUATION_COMMITTEES}`;
      const matricesKey = `${ministryCode}_${STORAGE_KEYS.SCORING_MATRICES}`;

      const storedPlans = localStorage.getItem(plansKey);
      const storedCommittees = localStorage.getItem(committeesKey);
      const storedMatrices = localStorage.getItem(matricesKey);

      if (storedPlans) {
        setProcurementPlans(JSON.parse(storedPlans));
      } else {
        // Initialize with sample data
        const samplePlans = createSamplePlans(ministryCode);
        setProcurementPlans(samplePlans);
        localStorage.setItem(plansKey, JSON.stringify(samplePlans));
      }

      if (storedCommittees) {
        setEvaluationCommittees(JSON.parse(storedCommittees));
      } else {
        const sampleCommittees = createSampleCommittees(ministryCode);
        setEvaluationCommittees(sampleCommittees);
        localStorage.setItem(committeesKey, JSON.stringify(sampleCommittees));
      }

      if (storedMatrices) {
        setScoringMatrices(JSON.parse(storedMatrices));
      } else {
        const sampleMatrices = createSampleMatrices(ministryCode);
        setScoringMatrices(sampleMatrices);
        localStorage.setItem(matricesKey, JSON.stringify(sampleMatrices));
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };

  const saveToStorage = (key: string, data: any) => {
    try {
      const ministryUser = JSON.parse(
        localStorage.getItem("ministryUser") || "{}",
      );
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  };

  const createSamplePlans = (ministryCode: string): ProcurementPlan[] => {
    const plans = [
      {
        id: "PP-2024-001",
        title: "Annual Medical Equipment Procurement",
        description:
          "Comprehensive procurement plan for medical equipment across all health facilities",
        budget: 2500000000,
        status: "Approved" as const,
        createdDate: "2024-01-15",
        approvedDate: "2024-01-20",
        approvedBy: "Director of Procurement",
        ministry: "Ministry of Health",
        department: "Medical Services",
        financialYear: "2024",
        tenderStrategy: "Open" as const,
        categories: [
          {
            id: "CAT-001",
            name: "Diagnostic Equipment",
            description: "X-ray machines, ultrasound, MRI equipment",
            estimatedBudget: 800000000,
            allocatedBudget: 750000000,
            priority: "High" as const,
            quarter: "Q2" as const,
          },
          {
            id: "CAT-002",
            name: "Surgical Equipment",
            description: "Operating room equipment and surgical instruments",
            estimatedBudget: 600000000,
            allocatedBudget: 580000000,
            priority: "High" as const,
            quarter: "Q3" as const,
          },
        ],
        marketResearch: [],
        timeline: [],
        approvalWorkflow: [],
      },
    ];

    if (ministryCode === "MOWI") {
      plans[0] = {
        ...plans[0],
        id: "PP-2024-001",
        title: "Infrastructure Development Plan 2024",
        description:
          "Comprehensive infrastructure and road construction procurement plan",
        budget: 15000000000,
        ministry: "Ministry of Works and Infrastructure",
        department: "Road Construction",
        categories: [
          {
            id: "CAT-001",
            name: "Road Construction",
            description: "Highway rehabilitation and new road construction",
            estimatedBudget: 8000000000,
            allocatedBudget: 7500000000,
            priority: "High" as const,
            quarter: "Q2" as const,
          },
          {
            id: "CAT-002",
            name: "Bridge Construction",
            description: "New bridge construction and bridge rehabilitation",
            estimatedBudget: 5000000000,
            allocatedBudget: 4800000000,
            priority: "High" as const,
            quarter: "Q3" as const,
          },
        ],
      };
    } else if (ministryCode === "MOE") {
      plans[0] = {
        ...plans[0],
        id: "PP-2024-001",
        title: "Educational Infrastructure and Equipment Plan",
        description:
          "Procurement plan for school furniture, educational technology, and learning materials",
        budget: 5000000000,
        ministry: "Ministry of Education",
        department: "Basic Education",
        categories: [
          {
            id: "CAT-001",
            name: "School Furniture",
            description:
              "Desks, chairs, and classroom furniture for all schools",
            estimatedBudget: 2000000000,
            allocatedBudget: 1900000000,
            priority: "High" as const,
            quarter: "Q1" as const,
          },
          {
            id: "CAT-002",
            name: "Educational Technology",
            description:
              "Computers, projectors, and digital learning equipment",
            estimatedBudget: 1800000000,
            allocatedBudget: 1750000000,
            priority: "Medium" as const,
            quarter: "Q2" as const,
          },
        ],
      };
    }

    return plans;
  };

  const createSampleCommittees = (
    ministryCode: string,
  ): EvaluationCommittee[] => {
    const committees = [
      {
        id: "EC-2024-001",
        name: "Medical Equipment Evaluation Committee",
        description: "Committee for evaluating medical equipment procurement",
        members: [
          {
            id: "MEM-001",
            name: "Dr. Amina Hassan",
            role: "Chair" as const,
            department: "Medical Services",
            email: "amina.hassan@health.kano.gov.ng",
            phone: "08012345678",
            conflictOfInterest: false,
            expertise: [
              "Medical Equipment",
              "Clinical Engineering",
              "Quality Assurance",
            ],
          },
          {
            id: "MEM-002",
            name: "Eng. Musa Ibrahim",
            role: "Secretary" as const,
            department: "Biomedical Engineering",
            email: "musa.ibrahim@health.kano.gov.ng",
            phone: "08012345679",
            conflictOfInterest: false,
            expertise: [
              "Biomedical Engineering",
              "Equipment Procurement",
              "Technical Evaluation",
            ],
          },
          {
            id: "MEM-003",
            name: "Dr. Fatima Yusuf",
            role: "Evaluator" as const,
            department: "Hospital Management",
            email: "fatima.yusuf@health.kano.gov.ng",
            phone: "08012345680",
            conflictOfInterest: false,
            expertise: [
              "Hospital Management",
              "Healthcare Administration",
              "Budget Planning",
            ],
          },
        ],
        activeEvaluations: ["EVAL-2024-001"],
        createdDate: "2024-01-10",
        status: "Active" as const,
      },
    ];

    if (ministryCode === "MOWI") {
      committees[0] = {
        ...committees[0],
        id: "EC-2024-001",
        name: "Infrastructure Evaluation Committee",
        description:
          "Committee for evaluating construction and infrastructure projects",
        members: [
          {
            id: "MEM-001",
            name: "Eng. Ibrahim Mohammed",
            role: "Chair" as const,
            department: "Road Construction",
            email: "ibrahim.mohammed@works.kano.gov.ng",
            phone: "08012345678",
            conflictOfInterest: false,
            expertise: [
              "Civil Engineering",
              "Road Construction",
              "Project Management",
            ],
          },
          {
            id: "MEM-002",
            name: "Arch. Aisha Garba",
            role: "Secretary" as const,
            department: "Urban Planning",
            email: "aisha.garba@works.kano.gov.ng",
            phone: "08012345679",
            conflictOfInterest: false,
            expertise: [
              "Architecture",
              "Urban Planning",
              "Building Construction",
            ],
          },
          {
            id: "MEM-003",
            name: "Eng. Usman Kano",
            role: "Evaluator" as const,
            department: "Bridge Engineering",
            email: "usman.kano@works.kano.gov.ng",
            phone: "08012345680",
            conflictOfInterest: false,
            expertise: [
              "Structural Engineering",
              "Bridge Construction",
              "Quality Control",
            ],
          },
        ],
      };
    } else if (ministryCode === "MOE") {
      committees[0] = {
        ...committees[0],
        id: "EC-2024-001",
        name: "Educational Procurement Committee",
        description:
          "Committee for evaluating educational equipment and materials procurement",
        members: [
          {
            id: "MEM-001",
            name: "Prof. Aisha Garba",
            role: "Chair" as const,
            department: "Curriculum Development",
            email: "aisha.garba@education.kano.gov.ng",
            phone: "08012345678",
            conflictOfInterest: false,
            expertise: [
              "Educational Technology",
              "Curriculum Development",
              "Learning Materials",
            ],
          },
          {
            id: "MEM-002",
            name: "Dr. Bello Sani",
            role: "Secretary" as const,
            department: "School Administration",
            email: "bello.sani@education.kano.gov.ng",
            phone: "08012345679",
            conflictOfInterest: false,
            expertise: [
              "School Administration",
              "Educational Planning",
              "Budget Management",
            ],
          },
          {
            id: "MEM-003",
            name: "Mal. Zainab Ibrahim",
            role: "Evaluator" as const,
            department: "Teacher Training",
            email: "zainab.ibrahim@education.kano.gov.ng",
            phone: "08012345680",
            conflictOfInterest: false,
            expertise: [
              "Teacher Training",
              "Educational Materials",
              "Quality Assurance",
            ],
          },
        ],
      };
    }

    return committees;
  };

  const createSampleMatrices = (ministryCode: string): ScoringMatrix[] => {
    return [
      {
        id: "SM-2024-001",
        tenderId: "MOH-2024-001",
        tenderTitle: "Medical Equipment Supply",
        committeeId: "EC-2024-001",
        criteria: [
          {
            id: "CRIT-001",
            name: "Technical Capability",
            description: "Technical specifications and quality standards",
            weight: 40,
            maxScore: 100,
            subCriteria: [
              {
                id: "SUB-001",
                name: "Equipment Quality",
                weight: 60,
                maxScore: 100,
              },
              {
                id: "SUB-002",
                name: "Technical Support",
                weight: 40,
                maxScore: 100,
              },
            ],
          },
          {
            id: "CRIT-002",
            name: "Financial Proposal",
            description: "Cost effectiveness and budget compliance",
            weight: 30,
            maxScore: 100,
            subCriteria: [
              {
                id: "SUB-003",
                name: "Competitive Pricing",
                weight: 70,
                maxScore: 100,
              },
              {
                id: "SUB-004",
                name: "Payment Terms",
                weight: 30,
                maxScore: 100,
              },
            ],
          },
          {
            id: "CRIT-003",
            name: "Company Experience",
            description: "Previous experience and track record",
            weight: 20,
            maxScore: 100,
            subCriteria: [
              {
                id: "SUB-005",
                name: "Relevant Experience",
                weight: 80,
                maxScore: 100,
              },
              { id: "SUB-006", name: "References", weight: 20, maxScore: 100 },
            ],
          },
          {
            id: "CRIT-004",
            name: "Delivery Timeline",
            description: "Proposed delivery schedule and milestones",
            weight: 10,
            maxScore: 100,
            subCriteria: [
              {
                id: "SUB-007",
                name: "Delivery Schedule",
                weight: 100,
                maxScore: 100,
              },
            ],
          },
        ],
        vendors: [
          {
            vendorId: "VEN-001",
            vendorName: "PrimeCare Medical Ltd",
            scores: {
              "CRIT-001": 88,
              "CRIT-002": 85,
              "CRIT-003": 92,
              "CRIT-004": 90,
            },
            totalScore: 87.8,
            technicalCompliance: true,
            comments:
              "Excellent technical specifications and strong track record",
            evaluatorId: "MEM-001",
            evaluatorName: "Dr. Amina Hassan",
          },
          {
            vendorId: "VEN-002",
            vendorName: "Falcon Diagnostics Ltd",
            scores: {
              "CRIT-001": 82,
              "CRIT-002": 88,
              "CRIT-003": 85,
              "CRIT-004": 87,
            },
            totalScore: 84.9,
            technicalCompliance: true,
            comments: "Good financial proposal with competitive pricing",
            evaluatorId: "MEM-002",
            evaluatorName: "Eng. Musa Ibrahim",
          },
        ],
        consensusScores: {
          "VEN-001": 87.8,
          "VEN-002": 84.9,
        },
        finalRanking: ["VEN-001", "VEN-002"],
        status: "Completed" as const,
        createdDate: "2024-02-01",
        completedDate: "2024-02-15",
      },
    ];
  };

  const handleCreatePlan = () => {
    const newPlan: ProcurementPlan = {
      id: `PP-${Date.now()}`,
      title: planForm.title,
      description: planForm.description,
      budget: parseFloat(planForm.budget),
      status: "Draft",
      createdDate: new Date().toISOString().split("T")[0],
      ministry: planForm.ministry,
      department: planForm.department,
      financialYear: planForm.financialYear,
      tenderStrategy: planForm.tenderStrategy,
      categories: [],
      marketResearch: [],
      timeline: [],
      approvalWorkflow: [],
    };

    const updatedPlans = [...procurementPlans, newPlan];
    setProcurementPlans(updatedPlans);
    saveToStorage(STORAGE_KEYS.PROCUREMENT_PLANS, updatedPlans);

    setPlanForm({
      title: "",
      description: "",
      budget: "",
      ministry: "",
      department: "",
      financialYear: new Date().getFullYear().toString(),
      tenderStrategy: "Open",
    });
    setShowPlanModal(false);
  };

  const handleCreateCommittee = () => {
    const newCommittee: EvaluationCommittee = {
      id: `EC-${Date.now()}`,
      name: committeeForm.name,
      description: committeeForm.description,
      members: committeeForm.members.map((member, index) => ({
        ...member,
        id: `MEM-${Date.now()}-${index}`,
      })),
      activeEvaluations: [],
      createdDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    const updatedCommittees = [...evaluationCommittees, newCommittee];
    setEvaluationCommittees(updatedCommittees);
    saveToStorage(STORAGE_KEYS.EVALUATION_COMMITTEES, updatedCommittees);

    setCommitteeForm({
      name: "",
      description: "",
      members: [
        {
          name: "",
          role: "Evaluator",
          department: "",
          email: "",
          phone: "",
          conflictOfInterest: false,
          expertise: [],
        },
      ],
    });
    setShowCommitteeModal(false);
  };

  const addMarketResearch = (planId: string) => {
    const newResearch: MarketResearch = {
      id: `MR-${Date.now()}`,
      category: marketResearchForm.category,
      notes: marketResearchForm.notes,
      date: new Date().toISOString().split("T")[0],
      author: "Current User", // In real app, get from auth context
      findings: marketResearchForm.findings,
      recommendations: marketResearchForm.recommendations,
    };

    const updatedPlans = procurementPlans.map((plan) =>
      plan.id === planId
        ? { ...plan, marketResearch: [...plan.marketResearch, newResearch] }
        : plan,
    );

    setProcurementPlans(updatedPlans);
    saveToStorage(STORAGE_KEYS.PROCUREMENT_PLANS, updatedPlans);

    setMarketResearchForm({
      category: "",
      notes: "",
      findings: "",
      recommendations: "",
    });
    setShowMarketResearchModal(false);
  };

  const updatePlanStatus = (
    planId: string,
    status: ProcurementPlan["status"],
  ) => {
    const updatedPlans = procurementPlans.map((plan) =>
      plan.id === planId
        ? {
            ...plan,
            status,
            approvedDate:
              status === "Approved"
                ? new Date().toISOString().split("T")[0]
                : undefined,
            approvedBy: status === "Approved" ? "Current User" : undefined,
          }
        : plan,
    );

    setProcurementPlans(updatedPlans);
    saveToStorage(STORAGE_KEYS.PROCUREMENT_PLANS, updatedPlans);
  };

  const filteredPlans = procurementPlans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || plan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      Draft: "secondary",
      "Under Review": "outline",
      Approved: "default",
      Rejected: "destructive",
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-green-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                    Procurement Planning Module
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Strategic planning and budget allocation platform
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
                onClick={() => setShowPlanModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Procurement Plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-green-100 shadow-lg p-2">
          <TabsList className="grid w-full grid-cols-6 bg-transparent gap-1">
            <TabsTrigger
              value="plans"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-green-50 border border-transparent data-[state=active]:border-green-200"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Annual Plans</span>
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-50 border border-transparent data-[state=active]:border-amber-200"
            >
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Budget Allocation</span>
            </TabsTrigger>
            <TabsTrigger
              value="committees"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 border border-transparent data-[state=active]:border-purple-200"
            >
              <Users className="h-4 w-4" />
              <span className="font-medium">Committee Templates</span>
            </TabsTrigger>
            <TabsTrigger
              value="qcbs"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-rose-50 border border-transparent data-[state=active]:border-rose-200"
            >
              <Scale className="h-4 w-4" />
              <span className="font-medium">QCBS Frameworks</span>
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-cyan-50 border border-transparent data-[state=active]:border-cyan-200"
            >
              <Target className="h-4 w-4" />
              <span className="font-medium">Tender Assignments</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50 border border-transparent data-[state=active]:border-slate-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="plans" className="space-y-6">
          {/* Enhanced Search and Filter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-100 shadow-md p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title, description, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-lg shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-56 border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-lg shadow-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                      <SelectItem value="all" className="hover:bg-green-50">
                        All Status
                      </SelectItem>
                      <SelectItem value="Draft" className="hover:bg-gray-50">
                        Draft
                      </SelectItem>
                      <SelectItem
                        value="Under Review"
                        className="hover:bg-blue-50"
                      >
                        Under Review
                      </SelectItem>
                      <SelectItem
                        value="Approved"
                        className="hover:bg-green-50"
                      >
                        Approved
                      </SelectItem>
                      <SelectItem value="Rejected" className="hover:bg-red-50">
                        Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => setShowPlanModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Plan
              </Button>
            </div>
          </div>

          {/* Enhanced Procurement Plans Grid */}
          <div className="grid gap-6">
            {filteredPlans.map((plan) => (
              <Card
                key={plan.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border border-gray-100 hover:border-green-200 rounded-xl overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Budget: ₦{plan.budget.toLocaleString()}</span>
                        <span>FY: {plan.financialYear}</span>
                        <span>Strategy: {plan.tenderStrategy}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(plan.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {plan.status === "Draft" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updatePlanStatus(plan.id, "Under Review")
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updatePlanStatus(plan.id, "Approved")
                              }
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetAllocation />
        </TabsContent>

        <TabsContent value="committees" className="space-y-4">
          <CommitteeTemplates />
        </TabsContent>

        <TabsContent value="qcbs" className="space-y-4">
          <FlexibleQCBSTemplate />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <TenderCommitteeAssignment />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Plans
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      procurementPlans.filter((p) => p.status === "Approved")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {procurementPlans.length} total plans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Budget
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₦
                    {procurementPlans
                      .reduce((sum, plan) => sum + plan.budget, 0)
                      .toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all procurement plans
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Committees
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      evaluationCommittees.filter((c) => c.status === "Active")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {evaluationCommittees.length} total committees
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Evaluations
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      scoringMatrices.filter((m) => m.status === "Completed")
                        .length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {scoringMatrices.length} total matrices
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Procurement Planning Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      Plan Status Distribution
                    </h4>
                    <div className="space-y-2">
                      {["Draft", "Under Review", "Approved", "Rejected"].map(
                        (status) => {
                          const count = procurementPlans.filter(
                            (p) => p.status === status,
                          ).length;
                          const percentage =
                            procurementPlans.length > 0
                              ? Math.round(
                                  (count / procurementPlans.length) * 100,
                                )
                              : 0;

                          return (
                            <div
                              key={status}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                {getStatusBadge(status)}
                                <span className="text-sm">{status}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {count}
                                </span>
                                <span className="text-xs text-gray-500 w-8">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {procurementPlans.slice(0, 5).map((plan) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <span className="font-medium">{plan.title}</span>
                            <div className="text-sm text-gray-600">
                              Created: {plan.createdDate} • Budget: ₦
                              {plan.budget.toLocaleString()}
                            </div>
                          </div>
                          {getStatusBadge(plan.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Procurement Plan Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create New Procurement Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label htmlFor="plan-title">Plan Title</Label>
              <Input
                id="plan-title"
                value={planForm.title}
                onChange={(e) =>
                  setPlanForm({ ...planForm, title: e.target.value })
                }
                placeholder="Enter procurement plan title"
              />
            </div>
            <div>
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
                placeholder="Describe the procurement plan"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan-budget">Total Budget (₦)</Label>
                <Input
                  id="plan-budget"
                  type="number"
                  value={planForm.budget}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, budget: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="plan-year">Financial Year</Label>
                <Input
                  id="plan-year"
                  value={planForm.financialYear}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, financialYear: e.target.value })
                  }
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan-ministry">Ministry</Label>
                <Input
                  id="plan-ministry"
                  value={planForm.ministry}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, ministry: e.target.value })
                  }
                  placeholder="Ministry name"
                />
              </div>
              <div>
                <Label htmlFor="plan-department">Department</Label>
                <Input
                  id="plan-department"
                  value={planForm.department}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, department: e.target.value })
                  }
                  placeholder="Department name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tender-strategy">Tender Strategy</Label>
              <Select
                value={planForm.tenderStrategy}
                onValueChange={(value: any) =>
                  setPlanForm({ ...planForm, tenderStrategy: value })
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
            <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button variant="outline" onClick={() => setShowPlanModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>Create Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Committee Modal */}
      <Dialog open={showCommitteeModal} onOpenChange={setShowCommitteeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create New Evaluation Committee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label htmlFor="committee-name">Committee Name</Label>
              <Input
                id="committee-name"
                value={committeeForm.name}
                onChange={(e) =>
                  setCommitteeForm({ ...committeeForm, name: e.target.value })
                }
                placeholder="Enter committee name"
              />
            </div>
            <div>
              <Label htmlFor="committee-description">Description</Label>
              <Textarea
                id="committee-description"
                value={committeeForm.description}
                onChange={(e) =>
                  setCommitteeForm({
                    ...committeeForm,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the committee purpose"
                rows={2}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Committee Members</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCommitteeForm({
                      ...committeeForm,
                      members: [
                        ...committeeForm.members,
                        {
                          name: "",
                          role: "Evaluator",
                          department: "",
                          email: "",
                          phone: "",
                          conflictOfInterest: false,
                          expertise: [],
                        },
                      ],
                    })
                  }
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
              <div className="space-y-3">
                {committeeForm.members.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Member {index + 1}</span>
                      {committeeForm.members.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCommitteeForm({
                              ...committeeForm,
                              members: committeeForm.members.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => {
                            const newMembers = [...committeeForm.members];
                            newMembers[index].name = e.target.value;
                            setCommitteeForm({
                              ...committeeForm,
                              members: newMembers,
                            });
                          }}
                          placeholder="Member name"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select
                          value={member.role}
                          onValueChange={(value: any) => {
                            const newMembers = [...committeeForm.members];
                            newMembers[index].role = value;
                            setCommitteeForm({
                              ...committeeForm,
                              members: newMembers,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Chair">Chair</SelectItem>
                            <SelectItem value="Secretary">Secretary</SelectItem>
                            <SelectItem value="Evaluator">Evaluator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Department</Label>
                        <Input
                          value={member.department}
                          onChange={(e) => {
                            const newMembers = [...committeeForm.members];
                            newMembers[index].department = e.target.value;
                            setCommitteeForm({
                              ...committeeForm,
                              members: newMembers,
                            });
                          }}
                          placeholder="Department"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={member.email}
                          onChange={(e) => {
                            const newMembers = [...committeeForm.members];
                            newMembers[index].email = e.target.value;
                            setCommitteeForm({
                              ...committeeForm,
                              members: newMembers,
                            });
                          }}
                          placeholder="Email address"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={member.phone}
                          onChange={(e) => {
                            const newMembers = [...committeeForm.members];
                            newMembers[index].phone = e.target.value;
                            setCommitteeForm({
                              ...committeeForm,
                              members: newMembers,
                            });
                          }}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`conflict-${index}`}
                          checked={member.conflictOfInterest}
                          onCheckedChange={(checked) => {
                            const newMembers = [...committeeForm.members];
                            newMembers[index].conflictOfInterest =
                              checked as boolean;
                            setCommitteeForm({
                              ...committeeForm,
                              members: newMembers,
                            });
                          }}
                        />
                        <Label
                          htmlFor={`conflict-${index}`}
                          className="text-sm"
                        >
                          Conflict of Interest
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => setShowCommitteeModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCommittee}>Create Committee</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Market Research Modal */}
      <Dialog
        open={showMarketResearchModal}
        onOpenChange={setShowMarketResearchModal}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Market Research</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label htmlFor="research-category">Category</Label>
              <Input
                id="research-category"
                value={marketResearchForm.category}
                onChange={(e) =>
                  setMarketResearchForm({
                    ...marketResearchForm,
                    category: e.target.value,
                  })
                }
                placeholder="Procurement category"
              />
            </div>
            <div>
              <Label htmlFor="research-notes">Research Notes</Label>
              <Textarea
                id="research-notes"
                value={marketResearchForm.notes}
                onChange={(e) =>
                  setMarketResearchForm({
                    ...marketResearchForm,
                    notes: e.target.value,
                  })
                }
                placeholder="Enter research notes"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="research-findings">Key Findings</Label>
              <Textarea
                id="research-findings"
                value={marketResearchForm.findings}
                onChange={(e) =>
                  setMarketResearchForm({
                    ...marketResearchForm,
                    findings: e.target.value,
                  })
                }
                placeholder="Enter key findings"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="research-recommendations">Recommendations</Label>
              <Textarea
                id="research-recommendations"
                value={marketResearchForm.recommendations}
                onChange={(e) =>
                  setMarketResearchForm({
                    ...marketResearchForm,
                    recommendations: e.target.value,
                  })
                }
                placeholder="Enter recommendations"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => setShowMarketResearchModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedPlan && addMarketResearch(selectedPlan.id)
                }
              >
                Save Research
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
