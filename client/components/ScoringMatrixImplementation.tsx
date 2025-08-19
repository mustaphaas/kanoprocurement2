import { useState, useEffect } from "react";
import {
  Calculator,
  BarChart3,
  Scale,
  Target,
  Plus,
  Edit,
  Eye,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Users,
  Award,
  Star,
  Percent,
  Hash,
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

// Types
interface ScoringCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  type: "Numeric" | "Boolean" | "Dropdown" | "Text";
  options?: string[];
  subCriteria: SubCriteria[];
  mandatory: boolean;
  passingScore?: number;
}

interface SubCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  type: "Numeric" | "Boolean" | "Dropdown" | "Text";
  options?: string[];
  mandatory: boolean;
}

interface ScoringRubric {
  id: string;
  name: string;
  description: string;
  version: string;
  applicableCategories: string[];
  criteria: ScoringCriteria[];
  totalWeight: number;
  passingThreshold: number;
  createdDate: string;
  lastModified: string;
  status: "Draft" | "Active" | "Archived";
  usageCount: number;
}

interface VendorScore {
  vendorId: string;
  vendorName: string;
  companyRegistration: string;
  criteriaScores: { [criteriaId: string]: CriteriaScore };
  subCriteriaScores: { [subCriteriaId: string]: number };
  totalScore: number;
  weightedScore: number;
  technicalCompliance: boolean;
  complianceIssues: ComplianceIssue[];
  evaluatorId: string;
  evaluatorName: string;
  evaluationDate: string;
  timeSpent: number;
  comments: string;
  attachments: string[];
  reviewStatus: "Pending" | "Reviewed" | "Approved" | "Rejected";
}

interface CriteriaScore {
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  compliance: boolean;
  comments: string;
  evidenceProvided: boolean;
}

interface ComplianceIssue {
  criteriaId: string;
  criteriaName: string;
  issue: string;
  severity: "Critical" | "Major" | "Minor";
  recommendation: string;
}

interface ScoringMatrix {
  id: string;
  matrixName: string;
  tenderId: string;
  tenderTitle: string;
  rubricId: string;
  rubricName: string;
  committeeId: string;
  committeeName: string;
  vendors: VendorScore[];
  evaluationPeriod: {
    startDate: string;
    endDate: string;
  };
  status: "Setup" | "In Progress" | "Evaluation Complete" | "Review" | "Final" | "Cancelled";
  createdDate: string;
  completedDate?: string;
  results: MatrixResults;
  auditTrail: AuditEntry[];
  notifications: NotificationSetting[];
}

interface MatrixResults {
  rankings: VendorRanking[];
  consensusReached: boolean;
  averageScore: number;
  scoreVariance: number;
  recommendedAward: string;
  alternativeOptions: string[];
  technicallyCompliant: number;
  totalEvaluated: number;
  evaluationSummary: string;
}

interface VendorRanking {
  rank: number;
  vendorId: string;
  vendorName: string;
  totalScore: number;
  technicalScore: number;
  financialScore: number;
  experienceScore: number;
  compliance: boolean;
  recommendation: "Award" | "Consider" | "Reject";
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

interface NotificationSetting {
  type: "Score Submission" | "Review Complete" | "Deadline Reminder";
  recipients: string[];
  timing: string;
  enabled: boolean;
}

interface ComparativeAnalysis {
  vendorId: string;
  vendorName: string;
  strengths: string[];
  weaknesses: string[];
  riskFactors: string[];
  opportunities: string[];
  overallAssessment: string;
  recommendationConfidence: number;
}

const STORAGE_KEYS = {
  SCORING_RUBRICS: "scoringRubrics",
  SCORING_MATRICES: "scoringMatrices",
  COMPARATIVE_ANALYSES: "comparativeAnalyses",
};

export default function ScoringMatrixImplementation() {
  const [activeTab, setActiveTab] = useState("rubrics");
  const [scoringRubrics, setScoringRubrics] = useState<ScoringRubric[]>([]);
  const [scoringMatrices, setScoringMatrices] = useState<ScoringMatrix[]>([]);
  const [comparativeAnalyses, setComparativeAnalyses] = useState<ComparativeAnalysis[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<ScoringRubric | null>(null);
  const [selectedMatrix, setSelectedMatrix] = useState<ScoringMatrix | null>(null);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<ScoringCriteria | null>(null);

  // Form states
  const [rubricForm, setRubricForm] = useState({
    name: "",
    description: "",
    version: "1.0",
    applicableCategories: [] as string[],
    passingThreshold: 70,
  });

  const [criteriaForm, setCriteriaForm] = useState({
    name: "",
    description: "",
    weight: 25,
    maxScore: 100,
    type: "Numeric" as const,
    options: [] as string[],
    mandatory: false,
    passingScore: 60,
  });

  const [matrixForm, setMatrixForm] = useState({
    matrixName: "",
    tenderId: "",
    tenderTitle: "",
    rubricId: "",
    committeeId: "",
    startDate: "",
    endDate: "",
  });

  const [vendorScoring, setVendorScoring] = useState<{ [criteriaId: string]: number }>({});
  const [currentVendor, setCurrentVendor] = useState<string>("");
  const [evaluationComments, setEvaluationComments] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      
      // Load scoring rubrics
      const rubricsKey = `${ministryCode}_${STORAGE_KEYS.SCORING_RUBRICS}`;
      const storedRubrics = localStorage.getItem(rubricsKey);
      if (storedRubrics) {
        setScoringRubrics(JSON.parse(storedRubrics));
      } else {
        const sampleRubrics = createSampleRubrics(ministryCode);
        setScoringRubrics(sampleRubrics);
        localStorage.setItem(rubricsKey, JSON.stringify(sampleRubrics));
      }

      // Load scoring matrices
      const matricesKey = `${ministryCode}_${STORAGE_KEYS.SCORING_MATRICES}`;
      const storedMatrices = localStorage.getItem(matricesKey);
      if (storedMatrices) {
        setScoringMatrices(JSON.parse(storedMatrices));
      } else {
        const sampleMatrices = createSampleMatrices(ministryCode);
        setScoringMatrices(sampleMatrices);
        localStorage.setItem(matricesKey, JSON.stringify(sampleMatrices));
      }

      // Load comparative analyses
      const analysesKey = `${ministryCode}_${STORAGE_KEYS.COMPARATIVE_ANALYSES}`;
      const storedAnalyses = localStorage.getItem(analysesKey);
      if (storedAnalyses) {
        setComparativeAnalyses(JSON.parse(storedAnalyses));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = (type: string, data: any) => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${type}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const createSampleRubrics = (ministryCode: string): ScoringRubric[] => {
    const baseRubric: ScoringRubric = {
      id: "RUB-2024-001",
      name: "Medical Equipment Evaluation Rubric",
      description: "Standardized evaluation criteria for medical equipment procurement",
      version: "2.1",
      applicableCategories: ["Medical Equipment", "Healthcare Technology", "Laboratory Equipment"],
      totalWeight: 100,
      passingThreshold: 70,
      createdDate: "2024-01-15",
      lastModified: "2024-02-10",
      status: "Active",
      usageCount: 15,
      criteria: [
        {
          id: "CRIT-001",
          name: "Technical Specifications",
          description: "Evaluation of technical capabilities and specifications",
          weight: 30,
          maxScore: 100,
          type: "Numeric",
          mandatory: true,
          passingScore: 70,
          subCriteria: [
            {
              id: "SUB-001",
              name: "Equipment Quality",
              description: "Quality of equipment and materials",
              weight: 60,
              maxScore: 100,
              type: "Numeric",
              mandatory: true,
            },
            {
              id: "SUB-002",
              name: "Technical Standards Compliance",
              description: "Compliance with international technical standards",
              weight: 40,
              maxScore: 100,
              type: "Boolean",
              mandatory: true,
            },
          ],
        },
        {
          id: "CRIT-002",
          name: "Financial Proposal",
          description: "Cost effectiveness and financial viability",
          weight: 25,
          maxScore: 100,
          type: "Numeric",
          mandatory: true,
          passingScore: 60,
          subCriteria: [
            {
              id: "SUB-003",
              name: "Competitive Pricing",
              description: "Price competitiveness compared to market rates",
              weight: 70,
              maxScore: 100,
              type: "Numeric",
              mandatory: true,
            },
            {
              id: "SUB-004",
              name: "Payment Terms",
              description: "Flexibility and reasonableness of payment terms",
              weight: 30,
              maxScore: 100,
              type: "Numeric",
              mandatory: false,
            },
          ],
        },
        {
          id: "CRIT-003",
          name: "Company Experience",
          description: "Previous experience and track record",
          weight: 25,
          maxScore: 100,
          type: "Numeric",
          mandatory: true,
          passingScore: 65,
          subCriteria: [
            {
              id: "SUB-005",
              name: "Relevant Experience",
              description: "Experience in similar projects and equipment",
              weight: 80,
              maxScore: 100,
              type: "Numeric",
              mandatory: true,
            },
            {
              id: "SUB-006",
              name: "Client References",
              description: "Quality of client references and testimonials",
              weight: 20,
              maxScore: 100,
              type: "Numeric",
              mandatory: false,
            },
          ],
        },
        {
          id: "CRIT-004",
          name: "Delivery & Support",
          description: "Delivery timeline and after-sales support",
          weight: 20,
          maxScore: 100,
          type: "Numeric",
          mandatory: true,
          passingScore: 70,
          subCriteria: [
            {
              id: "SUB-007",
              name: "Delivery Schedule",
              description: "Realistic and timely delivery schedule",
              weight: 60,
              maxScore: 100,
              type: "Numeric",
              mandatory: true,
            },
            {
              id: "SUB-008",
              name: "After-Sales Support",
              description: "Quality of maintenance and support services",
              weight: 40,
              maxScore: 100,
              type: "Numeric",
              mandatory: true,
            },
          ],
        },
      ],
    };

    if (ministryCode === "MOWI") {
      baseRubric.name = "Infrastructure Evaluation Rubric";
      baseRubric.description = "Standardized evaluation criteria for infrastructure and construction projects";
      baseRubric.applicableCategories = ["Road Construction", "Bridge Construction", "Building Construction"];
      baseRubric.criteria = [
        {
          ...baseRubric.criteria[0],
          name: "Technical Capability",
          description: "Engineering and construction technical capabilities",
        },
        {
          ...baseRubric.criteria[1],
          name: "Financial Proposal",
          description: "Project cost and financial structure",
        },
        {
          ...baseRubric.criteria[2],
          name: "Construction Experience",
          description: "Previous construction and infrastructure experience",
        },
        {
          ...baseRubric.criteria[3],
          name: "Timeline & Safety",
          description: "Project timeline and safety measures",
        },
      ];
    } else if (ministryCode === "MOE") {
      baseRubric.name = "Educational Materials Evaluation Rubric";
      baseRubric.description = "Standardized evaluation criteria for educational equipment and materials";
      baseRubric.applicableCategories = ["Educational Technology", "School Furniture", "Learning Materials"];
      baseRubric.criteria = [
        {
          ...baseRubric.criteria[0],
          name: "Educational Value",
          description: "Educational effectiveness and learning outcomes",
        },
        {
          ...baseRubric.criteria[1],
          name: "Cost Effectiveness",
          description: "Value for money and budget efficiency",
        },
        {
          ...baseRubric.criteria[2],
          name: "Supplier Experience",
          description: "Experience in educational sector and similar projects",
        },
        {
          ...baseRubric.criteria[3],
          name: "Implementation & Training",
          description: "Implementation timeline and training support",
        },
      ];
    }

    return [baseRubric];
  };

  const createSampleMatrices = (ministryCode: string): ScoringMatrix[] => {
    return [
      {
        id: "MAT-2024-001",
        matrixName: "Medical Equipment Evaluation - Hospital Supply",
        tenderId: "MOH-2024-001",
        tenderTitle: "Hospital Equipment Supply",
        rubricId: "RUB-2024-001",
        rubricName: "Medical Equipment Evaluation Rubric",
        committeeId: "EC-2024-001",
        committeeName: "Medical Equipment Evaluation Committee",
        evaluationPeriod: {
          startDate: "2024-02-10",
          endDate: "2024-02-20",
        },
        status: "Evaluation Complete",
        createdDate: "2024-02-10",
        completedDate: "2024-02-18",
        vendors: [
          {
            vendorId: "VEN-001",
            vendorName: "PrimeCare Medical Ltd",
            companyRegistration: "RC123456",
            evaluatorId: "EVAL-001",
            evaluatorName: "Dr. Amina Hassan",
            evaluationDate: "2024-02-15",
            timeSpent: 120,
            comments: "Excellent technical specifications and competitive pricing",
            attachments: [],
            reviewStatus: "Approved",
            criteriaScores: {
              "CRIT-001": {
                score: 88,
                maxScore: 100,
                weight: 30,
                weightedScore: 26.4,
                compliance: true,
                comments: "High-quality equipment with excellent specifications",
                evidenceProvided: true,
              },
              "CRIT-002": {
                score: 85,
                maxScore: 100,
                weight: 25,
                weightedScore: 21.25,
                compliance: true,
                comments: "Competitive pricing with reasonable payment terms",
                evidenceProvided: true,
              },
              "CRIT-003": {
                score: 92,
                maxScore: 100,
                weight: 25,
                weightedScore: 23,
                compliance: true,
                comments: "Extensive experience in medical equipment supply",
                evidenceProvided: true,
              },
              "CRIT-004": {
                score: 90,
                maxScore: 100,
                weight: 20,
                weightedScore: 18,
                compliance: true,
                comments: "Realistic delivery schedule with excellent support",
                evidenceProvided: true,
              },
            },
            subCriteriaScores: {
              "SUB-001": 90,
              "SUB-002": 85,
              "SUB-003": 88,
              "SUB-004": 82,
              "SUB-005": 94,
              "SUB-006": 88,
              "SUB-007": 92,
              "SUB-008": 88,
            },
            totalScore: 88.65,
            weightedScore: 88.65,
            technicalCompliance: true,
            complianceIssues: [],
          },
          {
            vendorId: "VEN-002", 
            vendorName: "Falcon Diagnostics Ltd",
            companyRegistration: "RC789012",
            evaluatorId: "EVAL-001",
            evaluatorName: "Dr. Amina Hassan",
            evaluationDate: "2024-02-15",
            timeSpent: 115,
            comments: "Good financial proposal with adequate technical capability",
            attachments: [],
            reviewStatus: "Approved",
            criteriaScores: {
              "CRIT-001": {
                score: 82,
                maxScore: 100,
                weight: 30,
                weightedScore: 24.6,
                compliance: true,
                comments: "Good technical capability, meets minimum requirements",
                evidenceProvided: true,
              },
              "CRIT-002": {
                score: 88,
                maxScore: 100,
                weight: 25,
                weightedScore: 22,
                compliance: true,
                comments: "Very competitive pricing structure",
                evidenceProvided: true,
              },
              "CRIT-003": {
                score: 85,
                maxScore: 100,
                weight: 25,
                weightedScore: 21.25,
                compliance: true,
                comments: "Reasonable experience in healthcare sector",
                evidenceProvided: true,
              },
              "CRIT-004": {
                score: 87,
                maxScore: 100,
                weight: 20,
                weightedScore: 17.4,
                compliance: true,
                comments: "Adequate delivery timeline and support",
                evidenceProvided: true,
              },
            },
            subCriteriaScores: {
              "SUB-001": 84,
              "SUB-002": 80,
              "SUB-003": 90,
              "SUB-004": 85,
              "SUB-005": 87,
              "SUB-006": 82,
              "SUB-007": 88,
              "SUB-008": 85,
            },
            totalScore: 85.25,
            weightedScore: 85.25,
            technicalCompliance: true,
            complianceIssues: [],
          },
        ],
        results: {
          rankings: [
            {
              rank: 1,
              vendorId: "VEN-001",
              vendorName: "PrimeCare Medical Ltd",
              totalScore: 88.65,
              technicalScore: 88,
              financialScore: 85,
              experienceScore: 92,
              compliance: true,
              recommendation: "Award",
            },
            {
              rank: 2,
              vendorId: "VEN-002",
              vendorName: "Falcon Diagnostics Ltd",
              totalScore: 85.25,
              technicalScore: 82,
              financialScore: 88,
              experienceScore: 85,
              compliance: true,
              recommendation: "Consider",
            },
          ],
          consensusReached: true,
          averageScore: 86.95,
          scoreVariance: 2.4,
          recommendedAward: "VEN-001",
          alternativeOptions: ["VEN-002"],
          technicallyCompliant: 2,
          totalEvaluated: 2,
          evaluationSummary: "Both vendors meet technical requirements. PrimeCare Medical Ltd offers superior technical specifications and experience, while Falcon Diagnostics Ltd provides more competitive pricing.",
        },
        auditTrail: [
          {
            id: "AUD-001",
            timestamp: "2024-02-15T10:30:00Z",
            action: "Evaluation Started",
            userId: "EVAL-001",
            userName: "Dr. Amina Hassan",
            details: "Started evaluation for PrimeCare Medical Ltd",
          },
          {
            id: "AUD-002",
            timestamp: "2024-02-15T12:45:00Z",
            action: "Scores Submitted",
            userId: "EVAL-001",
            userName: "Dr. Amina Hassan",
            details: "Submitted evaluation scores for PrimeCare Medical Ltd",
          },
        ],
        notifications: [
          {
            type: "Score Submission",
            recipients: ["committee@health.kano.gov.ng"],
            timing: "Immediate",
            enabled: true,
          },
          {
            type: "Deadline Reminder",
            recipients: ["evaluators@health.kano.gov.ng"],
            timing: "24 hours before",
            enabled: true,
          },
        ],
      },
    ];
  };

  const createRubric = () => {
    const newRubric: ScoringRubric = {
      id: `RUB-${Date.now()}`,
      name: rubricForm.name,
      description: rubricForm.description,
      version: rubricForm.version,
      applicableCategories: rubricForm.applicableCategories,
      criteria: [],
      totalWeight: 0,
      passingThreshold: rubricForm.passingThreshold,
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: "Draft",
      usageCount: 0,
    };

    const updatedRubrics = [...scoringRubrics, newRubric];
    setScoringRubrics(updatedRubrics);
    saveData(STORAGE_KEYS.SCORING_RUBRICS, updatedRubrics);

    setRubricForm({
      name: "",
      description: "",
      version: "1.0",
      applicableCategories: [],
      passingThreshold: 70,
    });
    setShowRubricModal(false);
  };

  const addCriteriaToRubric = (rubricId: string) => {
    const newCriteria: ScoringCriteria = {
      id: `CRIT-${Date.now()}`,
      name: criteriaForm.name,
      description: criteriaForm.description,
      weight: criteriaForm.weight,
      maxScore: criteriaForm.maxScore,
      type: criteriaForm.type,
      options: criteriaForm.options,
      subCriteria: [],
      mandatory: criteriaForm.mandatory,
      passingScore: criteriaForm.passingScore,
    };

    const updatedRubrics = scoringRubrics.map(rubric => {
      if (rubric.id === rubricId) {
        const updatedCriteria = [...rubric.criteria, newCriteria];
        const totalWeight = updatedCriteria.reduce((sum, criteria) => sum + criteria.weight, 0);
        return {
          ...rubric,
          criteria: updatedCriteria,
          totalWeight,
          lastModified: new Date().toISOString().split('T')[0],
        };
      }
      return rubric;
    });

    setScoringRubrics(updatedRubrics);
    saveData(STORAGE_KEYS.SCORING_RUBRICS, updatedRubrics);

    setCriteriaForm({
      name: "",
      description: "",
      weight: 25,
      maxScore: 100,
      type: "Numeric",
      options: [],
      mandatory: false,
      passingScore: 60,
    });
  };

  const createScoringMatrix = () => {
    const newMatrix: ScoringMatrix = {
      id: `MAT-${Date.now()}`,
      matrixName: matrixForm.matrixName,
      tenderId: matrixForm.tenderId,
      tenderTitle: matrixForm.tenderTitle,
      rubricId: matrixForm.rubricId,
      rubricName: scoringRubrics.find(r => r.id === matrixForm.rubricId)?.name || "",
      committeeId: matrixForm.committeeId,
      committeeName: "Evaluation Committee",
      vendors: [],
      evaluationPeriod: {
        startDate: matrixForm.startDate,
        endDate: matrixForm.endDate,
      },
      status: "Setup",
      createdDate: new Date().toISOString().split('T')[0],
      results: {
        rankings: [],
        consensusReached: false,
        averageScore: 0,
        scoreVariance: 0,
        recommendedAward: "",
        alternativeOptions: [],
        technicallyCompliant: 0,
        totalEvaluated: 0,
        evaluationSummary: "",
      },
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "Matrix Created",
          userId: "CURRENT_USER",
          userName: "Current User",
          details: `Created scoring matrix: ${matrixForm.matrixName}`,
        },
      ],
      notifications: [
        {
          type: "Score Submission",
          recipients: [],
          timing: "Immediate",
          enabled: true,
        },
      ],
    };

    const updatedMatrices = [...scoringMatrices, newMatrix];
    setScoringMatrices(updatedMatrices);
    saveData(STORAGE_KEYS.SCORING_MATRICES, updatedMatrices);

    setMatrixForm({
      matrixName: "",
      tenderId: "",
      tenderTitle: "",
      rubricId: "",
      committeeId: "",
      startDate: "",
      endDate: "",
    });
    setShowMatrixModal(false);
  };

  const calculateWeightedScore = (rubric: ScoringRubric, scores: { [criteriaId: string]: number }): number => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    rubric.criteria.forEach(criteria => {
      const score = scores[criteria.id] || 0;
      const weightedScore = (score * criteria.weight) / 100;
      totalWeightedScore += weightedScore;
      totalWeight += criteria.weight;
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  };

  const getComplianceStatus = (score: number, passingScore: number): boolean => {
    return score >= passingScore;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Draft: "secondary",
      Active: "default",
      Archived: "outline",
      Setup: "secondary",
      "In Progress": "outline",
      "Evaluation Complete": "default",
      Review: "outline",
      Final: "default",
      Cancelled: "destructive",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getRecommendationBadge = (recommendation: string) => {
    const variants = {
      Award: "default",
      Consider: "secondary",
      Reject: "destructive",
    };
    return <Badge variant={variants[recommendation as keyof typeof variants] as any}>{recommendation}</Badge>;
  };

  const exportMatrix = (matrix: ScoringMatrix) => {
    const data = {
      matrix: matrix.matrixName,
      tender: matrix.tenderTitle,
      evaluationDate: matrix.completedDate,
      vendors: matrix.vendors.map(vendor => ({
        name: vendor.vendorName,
        totalScore: vendor.totalScore,
        technicalCompliance: vendor.technicalCompliance,
        recommendation: matrix.results.rankings.find(r => r.vendorId === vendor.vendorId)?.recommendation,
      })),
      summary: matrix.results.evaluationSummary,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${matrix.matrixName}_results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scoring Matrix Implementation</h2>
          <p className="text-gray-600">Manage scoring rubrics, evaluation matrices, and comparative analysis</p>
        </div>
        <Button onClick={() => setShowRubricModal(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Scoring Rubric
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rubrics" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Scoring Rubrics
          </TabsTrigger>
          <TabsTrigger value="matrices" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Evaluation Matrices
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Comparative Analysis
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rubrics" className="space-y-4">
          <div className="grid gap-4">
            {scoringRubrics.map((rubric) => (
              <Card key={rubric.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{rubric.name}</CardTitle>
                        {getStatusBadge(rubric.status)}
                        <Badge variant="outline">v{rubric.version}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rubric.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Criteria</Label>
                          <p className="text-sm font-semibold">{rubric.criteria.length}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Total Weight</Label>
                          <p className="text-sm font-semibold">{rubric.totalWeight}%</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Passing Threshold</Label>
                          <p className="text-sm font-semibold">{rubric.passingThreshold}%</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Usage Count</Label>
                          <p className="text-sm font-semibold">{rubric.usageCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedRubric(rubric)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedRubric(rubric);
                          setShowMatrixModal(true);
                        }}
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Evaluation Criteria</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRubric(rubric);
                            setCriteriaForm({
                              name: "",
                              description: "",
                              weight: 25,
                              maxScore: 100,
                              type: "Numeric",
                              options: [],
                              mandatory: false,
                              passingScore: 60,
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Criteria
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {rubric.criteria.map((criteria) => (
                          <div key={criteria.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{criteria.name}</span>
                                <Badge variant="outline">{criteria.weight}%</Badge>
                                <Badge variant="secondary">{criteria.type}</Badge>
                                {criteria.mandatory && (
                                  <Badge variant="destructive" className="text-xs">
                                    Mandatory
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{criteria.description}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                Max Score: {criteria.maxScore} • Passing: {criteria.passingScore}% • 
                                Sub-criteria: {criteria.subCriteria.length}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCriteria(criteria);
                                  setCriteriaForm({
                                    name: criteria.name,
                                    description: criteria.description,
                                    weight: criteria.weight,
                                    maxScore: criteria.maxScore,
                                    type: criteria.type,
                                    options: criteria.options || [],
                                    mandatory: criteria.mandatory,
                                    passingScore: criteria.passingScore || 60,
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {rubric.applicableCategories.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Applicable Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {rubric.applicableCategories.map((category) => (
                            <Badge key={category} variant="outline">{category}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matrices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Evaluation Matrices</h3>
            <Button onClick={() => setShowMatrixModal(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Matrix
            </Button>
          </div>

          <div className="grid gap-4">
            {scoringMatrices.map((matrix) => (
              <Card key={matrix.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{matrix.matrixName}</CardTitle>
                        {getStatusBadge(matrix.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{matrix.tenderTitle}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Vendors</Label>
                          <p className="font-semibold">{matrix.vendors.length}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Rubric</Label>
                          <p className="font-semibold">{matrix.rubricName}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Period</Label>
                          <p className="font-semibold">{matrix.evaluationPeriod.startDate} - {matrix.evaluationPeriod.endDate}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Progress</Label>
                          <p className="font-semibold">
                            {matrix.status === "Evaluation Complete" ? "100%" : 
                             matrix.status === "In Progress" ? "65%" :
                             matrix.status === "Setup" ? "0%" : "50%"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedMatrix(matrix)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {matrix.status === "Evaluation Complete" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => exportMatrix(matrix)}
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {matrix.status === "Evaluation Complete" && matrix.results.rankings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Final Rankings</h4>
                      <div className="space-y-2">
                        {matrix.results.rankings.map((ranking) => (
                          <div key={ranking.vendorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                {ranking.rank}
                              </div>
                              <div>
                                <span className="font-medium">{ranking.vendorName}</span>
                                <div className="text-sm text-gray-600">
                                  Total Score: {ranking.totalScore.toFixed(1)} • 
                                  {ranking.compliance ? " Compliant" : " Non-Compliant"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{ranking.totalScore.toFixed(1)}</span>
                              {getRecommendationBadge(ranking.recommendation)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {matrix.results.evaluationSummary && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-1">Evaluation Summary</h5>
                          <p className="text-sm text-blue-800">{matrix.results.evaluationSummary}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Comparative Analysis</h3>
            <Button onClick={() => setShowComparisonModal(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Generate Analysis
            </Button>
          </div>

          <div className="grid gap-4">
            {scoringMatrices
              .filter(matrix => matrix.status === "Evaluation Complete")
              .map((matrix) => (
                <Card key={matrix.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{matrix.tenderTitle} - Vendor Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Technical Score</TableHead>
                            <TableHead>Financial Score</TableHead>
                            <TableHead>Experience Score</TableHead>
                            <TableHead>Total Score</TableHead>
                            <TableHead>Compliance</TableHead>
                            <TableHead>Recommendation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matrix.results.rankings.map((ranking) => (
                            <TableRow key={ranking.vendorId}>
                              <TableCell className="font-medium">{ranking.vendorName}</TableCell>
                              <TableCell>{ranking.technicalScore}</TableCell>
                              <TableCell>{ranking.financialScore}</TableCell>
                              <TableCell>{ranking.experienceScore}</TableCell>
                              <TableCell className="font-bold">{ranking.totalScore.toFixed(1)}</TableCell>
                              <TableCell>
                                {ranking.compliance ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </TableCell>
                              <TableCell>
                                {getRecommendationBadge(ranking.recommendation)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rubrics</CardTitle>
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scoringRubrics.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {scoringRubrics.filter(r => r.status === "Active").length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evaluation Matrices</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scoringMatrices.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {scoringMatrices.filter(m => m.status === "Evaluation Complete").length} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scoringMatrices.length > 0 
                      ? (scoringMatrices.reduce((sum, matrix) => sum + matrix.results.averageScore, 0) / scoringMatrices.length).toFixed(1)
                      : "0"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all evaluations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scoringMatrices.length > 0 
                      ? Math.round((scoringMatrices.reduce((sum, matrix) => sum + matrix.results.technicallyCompliant, 0) / 
                          scoringMatrices.reduce((sum, matrix) => sum + matrix.results.totalEvaluated, 0)) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Technical compliance
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rubric Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoringRubrics.map((rubric) => (
                    <div key={rubric.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rubric.name}</span>
                        {getStatusBadge(rubric.status)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{rubric.usageCount} uses</span>
                        <div className="w-32">
                          <Progress 
                            value={(rubric.usageCount / Math.max(...scoringRubrics.map(r => r.usageCount), 1)) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Rubric Modal */}
      <Dialog open={showRubricModal} onOpenChange={setShowRubricModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Scoring Rubric</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rubric-name">Rubric Name</Label>
              <Input
                id="rubric-name"
                value={rubricForm.name}
                onChange={(e) => setRubricForm({...rubricForm, name: e.target.value})}
                placeholder="Enter rubric name"
              />
            </div>
            <div>
              <Label htmlFor="rubric-description">Description</Label>
              <Textarea
                id="rubric-description"
                value={rubricForm.description}
                onChange={(e) => setRubricForm({...rubricForm, description: e.target.value})}
                placeholder="Describe the rubric purpose and scope"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rubric-version">Version</Label>
                <Input
                  id="rubric-version"
                  value={rubricForm.version}
                  onChange={(e) => setRubricForm({...rubricForm, version: e.target.value})}
                  placeholder="1.0"
                />
              </div>
              <div>
                <Label htmlFor="passing-threshold">Passing Threshold (%)</Label>
                <Input
                  id="passing-threshold"
                  type="number"
                  value={rubricForm.passingThreshold}
                  onChange={(e) => setRubricForm({...rubricForm, passingThreshold: parseInt(e.target.value) || 70})}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="applicable-categories">Applicable Categories (comma-separated)</Label>
              <Input
                id="applicable-categories"
                value={rubricForm.applicableCategories.join(", ")}
                onChange={(e) => setRubricForm({...rubricForm, applicableCategories: e.target.value.split(", ").filter(s => s.trim())})}
                placeholder="e.g., Medical Equipment, IT Services"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRubricModal(false)}>
                Cancel
              </Button>
              <Button onClick={createRubric}>
                Create Rubric
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Matrix Modal */}
      <Dialog open={showMatrixModal} onOpenChange={setShowMatrixModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Evaluation Matrix</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="matrix-name">Matrix Name</Label>
              <Input
                id="matrix-name"
                value={matrixForm.matrixName}
                onChange={(e) => setMatrixForm({...matrixForm, matrixName: e.target.value})}
                placeholder="Enter matrix name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tender-id">Tender ID</Label>
                <Input
                  id="tender-id"
                  value={matrixForm.tenderId}
                  onChange={(e) => setMatrixForm({...matrixForm, tenderId: e.target.value})}
                  placeholder="e.g., MOH-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="tender-title">Tender Title</Label>
                <Input
                  id="tender-title"
                  value={matrixForm.tenderTitle}
                  onChange={(e) => setMatrixForm({...matrixForm, tenderTitle: e.target.value})}
                  placeholder="Enter tender title"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="rubric-select">Scoring Rubric</Label>
              <Select value={matrixForm.rubricId} onValueChange={(value) => setMatrixForm({...matrixForm, rubricId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a scoring rubric" />
                </SelectTrigger>
                <SelectContent>
                  {scoringRubrics.filter(r => r.status === "Active").map((rubric) => (
                    <SelectItem key={rubric.id} value={rubric.id}>
                      {rubric.name} (v{rubric.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="committee-id">Committee ID</Label>
              <Input
                id="committee-id"
                value={matrixForm.committeeId}
                onChange={(e) => setMatrixForm({...matrixForm, committeeId: e.target.value})}
                placeholder="e.g., EC-2024-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={matrixForm.startDate}
                  onChange={(e) => setMatrixForm({...matrixForm, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={matrixForm.endDate}
                  onChange={(e) => setMatrixForm({...matrixForm, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMatrixModal(false)}>
                Cancel
              </Button>
              <Button onClick={createScoringMatrix}>
                Create Matrix
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
