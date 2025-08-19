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
  Percent,
  Hash,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// Types for QCBS Framework Definition (Planning Stage)
interface QCBSFramework {
  id: string;
  name: string;
  description: string;
  category: string;
  applicableTypes: string[];
  methodology: "QCBS" | "QBS" | "LCS" | "FBS";
  technicalWeightPercent: number;
  financialWeightPercent: number;
  qualificationThreshold: number;
  technicalPassingScore: number;
  scoringScale: number;
  evaluationCriteria: EvaluationCriteria[];
  financialEvaluationMethod: FinancialEvaluationMethod;
  combinationFormula: CombinationFormula;
  qualificationCriteria: QualificationCriteria[];
  consensusRules: ConsensusRule[];
  escalationProcedures: EscalationProcedure[];
  auditRequirements: AuditRequirement[];
  createdDate: string;
  lastModified: string;
  status: "Draft" | "Active" | "Archived";
  version: string;
  approvedBy?: string;
  usageCount: number;
}

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  category: "Technical" | "Experience" | "Methodology" | "Compliance";
  weight: number;
  maxScore: number;
  passingScore: number;
  evaluationType: "Numerical" | "Pass/Fail" | "Ranked" | "Weighted";
  subCriteria: SubCriteria[];
  evaluationGuidelines: EvaluationGuideline[];
  scoringRubric: ScoringRubric[];
}

interface SubCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  evaluationMethod: string;
  benchmarks: Benchmark[];
}

interface Benchmark {
  score: number;
  description: string;
  evidence: string[];
}

interface ScoringRubric {
  scoreRange: { min: number; max: number };
  description: string;
  requirements: string[];
  examples: string[];
}

interface EvaluationGuideline {
  step: number;
  instruction: string;
  considerations: string[];
  documentation: string[];
}

interface FinancialEvaluationMethod {
  method: "Lowest Cost" | "Life Cycle Cost" | "Net Present Value" | "Cost Per Unit";
  normalizationFormula: string;
  adjustmentFactors: AdjustmentFactor[];
  currencyHandling: string;
  taxConsiderations: string;
  discountRate?: number;
  evaluationPeriod?: number;
}

interface AdjustmentFactor {
  type: "Tax" | "Currency" | "Risk" | "Inflation" | "Maintenance";
  formula: string;
  applicableConditions: string[];
}

interface CombinationFormula {
  formula: string;
  technicalComponent: string;
  financialComponent: string;
  adjustments: string[];
  roundingRule: string;
  tieBreakingRule: string;
}

interface QualificationCriteria {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  verificationMethod: string;
  acceptableDocs: string[];
  rejectionReasons: string[];
}

interface ConsensusRule {
  stage: "Qualification" | "Technical" | "Financial" | "Final";
  method: "Unanimous" | "Majority" | "Weighted Average" | "Individual";
  threshold?: number;
  conflictResolution: string;
  timeLimit: number;
  escalationTrigger: string;
}

interface EscalationProcedure {
  trigger: string;
  level: number;
  authority: string;
  timeframe: number;
  actions: string[];
  documentation: string[];
}

interface AuditRequirement {
  stage: string;
  frequency: string;
  auditor: string;
  scope: string[];
  deliverables: string[];
  compliance: string[];
}

const STORAGE_KEY = "qcbsFrameworks";

export default function QCBSFrameworkDefinition() {
  const [frameworks, setFrameworks] = useState<QCBSFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<QCBSFramework | null>(null);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [editingFramework, setEditingFramework] = useState<QCBSFramework | null>(null);
  const [activeTab, setActiveTab] = useState("frameworks");

  // Form states
  const [frameworkForm, setFrameworkForm] = useState({
    name: "",
    description: "",
    category: "",
    methodology: "QCBS" as const,
    technicalWeightPercent: 70,
    financialWeightPercent: 30,
    qualificationThreshold: 60,
    technicalPassingScore: 75,
    scoringScale: 100,
    applicableTypes: [] as string[],
    version: "1.0",
  });

  const [criteriaForm, setCriteriaForm] = useState({
    name: "",
    description: "",
    category: "Technical" as const,
    weight: 25,
    maxScore: 100,
    passingScore: 60,
    evaluationType: "Numerical" as const,
  });

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = () => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setFrameworks(JSON.parse(stored));
      } else {
        const sampleFrameworks = createSampleFrameworks(ministryCode);
        setFrameworks(sampleFrameworks);
        localStorage.setItem(storageKey, JSON.stringify(sampleFrameworks));
      }
    } catch (error) {
      console.error("Error loading frameworks:", error);
    }
  };

  const saveFrameworks = (updatedFrameworks: QCBSFramework[]) => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedFrameworks));
    } catch (error) {
      console.error("Error saving frameworks:", error);
    }
  };

  const createSampleFrameworks = (ministryCode: string): QCBSFramework[] => {
    const baseFramework: QCBSFramework = {
      id: "QCBS-2024-001",
      name: "Medical Equipment QCBS Framework",
      description: "Quality and Cost-Based Selection framework for medical equipment procurement",
      category: "Medical Equipment",
      applicableTypes: ["Medical Equipment", "Healthcare Technology", "Laboratory Equipment"],
      methodology: "QCBS",
      technicalWeightPercent: 70,
      financialWeightPercent: 30,
      qualificationThreshold: 60,
      technicalPassingScore: 75,
      scoringScale: 100,
      createdDate: "2024-01-15",
      lastModified: "2024-02-10",
      status: "Active",
      version: "2.1",
      usageCount: 18,
      evaluationCriteria: [
        {
          id: "EVAL-001",
          name: "Technical Specifications",
          description: "Evaluation of equipment technical capabilities and performance",
          category: "Technical",
          weight: 40,
          maxScore: 100,
          passingScore: 75,
          evaluationType: "Numerical",
          subCriteria: [
            {
              id: "SUB-001",
              name: "Performance Parameters",
              description: "Key performance indicators and technical specifications",
              weight: 60,
              maxScore: 100,
              evaluationMethod: "Against specifications",
              benchmarks: [
                {
                  score: 90,
                  description: "Exceeds all specified parameters",
                  evidence: ["Test certificates", "Performance reports", "Compliance documentation"]
                },
                {
                  score: 75,
                  description: "Meets all specified parameters",
                  evidence: ["Basic compliance documentation", "Standard test reports"]
                },
                {
                  score: 60,
                  description: "Meets minimum requirements",
                  evidence: ["Minimum compliance documentation"]
                }
              ]
            },
            {
              id: "SUB-002",
              name: "Quality Standards Compliance",
              description: "Compliance with international and local quality standards",
              weight: 40,
              maxScore: 100,
              evaluationMethod: "Certification verification",
              benchmarks: [
                {
                  score: 100,
                  description: "Full compliance with all required standards",
                  evidence: ["ISO certifications", "FDA approvals", "Local regulatory approvals"]
                },
                {
                  score: 75,
                  description: "Compliance with essential standards",
                  evidence: ["Basic certifications", "Essential regulatory approvals"]
                }
              ]
            }
          ],
          evaluationGuidelines: [
            {
              step: 1,
              instruction: "Review technical specifications against requirements",
              considerations: ["Completeness", "Accuracy", "Feasibility"],
              documentation: ["Technical evaluation sheet", "Compliance checklist"]
            },
            {
              step: 2,
              instruction: "Verify certification and compliance documentation",
              considerations: ["Validity", "Scope", "Authenticity"],
              documentation: ["Certification verification report"]
            }
          ],
          scoringRubric: [
            {
              scoreRange: { min: 90, max: 100 },
              description: "Exceptional - Significantly exceeds requirements",
              requirements: ["All parameters exceeded", "Premium quality features", "Advanced technology"],
              examples: ["Latest generation equipment", "Superior performance metrics"]
            },
            {
              scoreRange: { min: 75, max: 89 },
              description: "Good - Meets all requirements with some advantages",
              requirements: ["All parameters met", "Standard quality", "Proven technology"],
              examples: ["Standard equipment", "Reliable performance"]
            },
            {
              scoreRange: { min: 60, max: 74 },
              description: "Acceptable - Meets minimum requirements",
              requirements: ["Minimum parameters met", "Basic quality", "Functional technology"],
              examples: ["Entry-level equipment", "Basic functionality"]
            }
          ]
        },
        {
          id: "EVAL-002",
          name: "Company Experience and Capability",
          description: "Assessment of vendor experience and project implementation capability",
          category: "Experience",
          weight: 30,
          maxScore: 100,
          passingScore: 60,
          evaluationType: "Numerical",
          subCriteria: [
            {
              id: "SUB-003",
              name: "Relevant Experience",
              description: "Experience in similar projects and equipment supply",
              weight: 70,
              maxScore: 100,
              evaluationMethod: "Portfolio assessment",
              benchmarks: [
                {
                  score: 95,
                  description: "Extensive experience with 15+ similar projects",
                  evidence: ["Project portfolio", "Client testimonials", "Performance records"]
                },
                {
                  score: 80,
                  description: "Good experience with 8-14 similar projects",
                  evidence: ["Project list", "References", "Completion certificates"]
                },
                {
                  score: 65,
                  description: "Adequate experience with 3-7 similar projects",
                  evidence: ["Basic project history", "Client references"]
                }
              ]
            },
            {
              id: "SUB-004",
              name: "Implementation Capability",
              description: "Organizational capability and resource availability",
              weight: 30,
              maxScore: 100,
              evaluationMethod: "Resource assessment",
              benchmarks: [
                {
                  score: 90,
                  description: "Strong implementation team and resources",
                  evidence: ["Organization chart", "Resource allocation plan", "Team CVs"]
                },
                {
                  score: 75,
                  description: "Adequate implementation capability",
                  evidence: ["Basic team structure", "Resource plan"]
                }
              ]
            }
          ],
          evaluationGuidelines: [
            {
              step: 1,
              instruction: "Review project portfolio and experience",
              considerations: ["Relevance", "Scale", "Complexity", "Success rate"],
              documentation: ["Experience evaluation matrix"]
            },
            {
              step: 2,
              instruction: "Assess implementation capability and resources",
              considerations: ["Team qualifications", "Resource availability", "Methodology"],
              documentation: ["Capability assessment report"]
            }
          ],
          scoringRubric: [
            {
              scoreRange: { min: 85, max: 100 },
              description: "Highly experienced with proven track record",
              requirements: ["15+ relevant projects", "Excellent references", "Strong team"],
              examples: ["Market leader", "Multiple successful implementations"]
            },
            {
              scoreRange: { min: 70, max: 84 },
              description: "Experienced with good capability",
              requirements: ["8+ relevant projects", "Good references", "Qualified team"],
              examples: ["Established provider", "Successful project history"]
            }
          ]
        },
        {
          id: "EVAL-003",
          name: "After-Sales Support and Maintenance",
          description: "Quality and availability of after-sales support services",
          category: "Technical",
          weight: 20,
          maxScore: 100,
          passingScore: 70,
          evaluationType: "Numerical",
          subCriteria: [
            {
              id: "SUB-005",
              name: "Support Infrastructure",
              description: "Local support presence and service infrastructure",
              weight: 60,
              maxScore: 100,
              evaluationMethod: "Infrastructure assessment",
              benchmarks: [
                {
                  score: 95,
                  description: "Local service center with full capabilities",
                  evidence: ["Service center details", "Technician qualifications", "Spare parts inventory"]
                },
                {
                  score: 80,
                  description: "Regional support with good coverage",
                  evidence: ["Support network map", "Response time commitments"]
                }
              ]
            },
            {
              id: "SUB-006",
              name: "Warranty and Maintenance Terms",
              description: "Comprehensiveness of warranty and maintenance offerings",
              weight: 40,
              maxScore: 100,
              evaluationMethod: "Terms comparison",
              benchmarks: [
                {
                  score: 90,
                  description: "Comprehensive warranty with excellent terms",
                  evidence: ["Warranty certificate", "Maintenance contract terms"]
                }
              ]
            }
          ],
          evaluationGuidelines: [
            {
              step: 1,
              instruction: "Evaluate support infrastructure and capabilities",
              considerations: ["Local presence", "Technical expertise", "Response times"],
              documentation: ["Support evaluation form"]
            }
          ],
          scoringRubric: [
            {
              scoreRange: { min: 85, max: 100 },
              description: "Excellent support with local presence",
              requirements: ["Local service center", "24/7 support", "Comprehensive warranty"],
              examples: ["Full local support infrastructure"]
            }
          ]
        },
        {
          id: "EVAL-004",
          name: "Compliance and Documentation",
          description: "Regulatory compliance and document completeness",
          category: "Compliance",
          weight: 10,
          maxScore: 100,
          passingScore: 100,
          evaluationType: "Pass/Fail",
          subCriteria: [
            {
              id: "SUB-007",
              name: "Regulatory Compliance",
              description: "All mandatory regulatory requirements met",
              weight: 100,
              maxScore: 100,
              evaluationMethod: "Compliance verification",
              benchmarks: [
                {
                  score: 100,
                  description: "Full regulatory compliance",
                  evidence: ["All required licenses", "Regulatory certificates", "Compliance declarations"]
                },
                {
                  score: 0,
                  description: "Non-compliance or missing documents",
                  evidence: ["Missing certifications", "Expired licenses"]
                }
              ]
            }
          ],
          evaluationGuidelines: [
            {
              step: 1,
              instruction: "Verify all regulatory compliance requirements",
              considerations: ["Document validity", "Scope coverage", "Expiration dates"],
              documentation: ["Compliance checklist", "Verification report"]
            }
          ],
          scoringRubric: [
            {
              scoreRange: { min: 100, max: 100 },
              description: "Fully compliant - All requirements met",
              requirements: ["All documents valid", "Full regulatory compliance"],
              examples: ["Complete documentation package"]
            },
            {
              scoreRange: { min: 0, max: 0 },
              description: "Non-compliant - Disqualified",
              requirements: ["Missing or invalid documents"],
              examples: ["Incomplete submission", "Expired certifications"]
            }
          ]
        }
      ],
      financialEvaluationMethod: {
        method: "Lowest Cost",
        normalizationFormula: "Financial Score = (Lowest Price / Evaluated Price) × 100",
        adjustmentFactors: [
          {
            type: "Tax",
            formula: "Price + (Tax Rate × Price)",
            applicableConditions: ["Local suppliers", "Import duties"]
          },
          {
            type: "Currency",
            formula: "Price × Exchange Rate (Central Bank rate on bid opening)",
            applicableConditions: ["Foreign currency bids"]
          }
        ],
        currencyHandling: "Convert to Naira using Central Bank rate on bid opening date",
        taxConsiderations: "Include all applicable taxes and duties in evaluation"
      },
      combinationFormula: {
        formula: "Combined Score = (Technical Score × Technical Weight) + (Financial Score × Financial Weight)",
        technicalComponent: "Technical Score × 0.70",
        financialComponent: "Financial Score × 0.30",
        adjustments: ["Only technically qualified bids (≥75%) are financially evaluated"],
        roundingRule: "Round to 2 decimal places",
        tieBreakingRule: "Higher technical score wins; if tied, lowest price wins"
      },
      qualificationCriteria: [
        {
          id: "QUAL-001",
          name: "Business Registration",
          description: "Valid business registration and tax clearance",
          mandatory: true,
          verificationMethod: "Document verification",
          acceptableDocs: ["Certificate of Incorporation", "Tax Clearance Certificate", "VAT Registration"],
          rejectionReasons: ["Expired documents", "Invalid registration", "Missing certificates"]
        },
        {
          id: "QUAL-002",
          name: "Financial Capacity",
          description: "Demonstrated financial capacity for project execution",
          mandatory: true,
          verificationMethod: "Financial statement analysis",
          acceptableDocs: ["Audited Financial Statements", "Bank statements", "Credit references"],
          rejectionReasons: ["Insufficient liquidity", "Poor financial health", "Missing financial data"]
        }
      ],
      consensusRules: [
        {
          stage: "Qualification",
          method: "Unanimous",
          conflictResolution: "Committee discussion until consensus reached",
          timeLimit: 24,
          escalationTrigger: "No consensus after 24 hours"
        },
        {
          stage: "Technical",
          method: "Individual",
          conflictResolution: "Individual scores averaged, outliers discussed",
          timeLimit: 72,
          escalationTrigger: "Score variance >20 points"
        },
        {
          stage: "Financial",
          method: "Majority",
          threshold: 60,
          conflictResolution: "Majority decision prevails",
          timeLimit: 24,
          escalationTrigger: "No majority consensus"
        }
      ],
      escalationProcedures: [
        {
          trigger: "Technical score variance >20 points",
          level: 1,
          authority: "Committee Chairperson",
          timeframe: 12,
          actions: ["Facilitate discussion", "Seek clarification", "Request re-evaluation"],
          documentation: ["Escalation report", "Resolution summary"]
        },
        {
          trigger: "No consensus after time limit",
          level: 2,
          authority: "Procurement Director",
          timeframe: 24,
          actions: ["Review evaluation", "Provide guidance", "Make final decision"],
          documentation: ["Director's decision report"]
        }
      ],
      auditRequirements: [
        {
          stage: "Evaluation Process",
          frequency: "Every evaluation",
          auditor: "Internal Audit Department",
          scope: ["Process compliance", "Documentation completeness", "Score accuracy"],
          deliverables: ["Audit report", "Compliance certificate"],
          compliance: ["All evaluation steps documented", "Scores properly calculated", "Consensus properly reached"]
        }
      ]
    };

    // Customize for different ministries
    if (ministryCode === "MOWI") {
      baseFramework.name = "Infrastructure QCBS Framework";
      baseFramework.description = "Quality and Cost-Based Selection framework for infrastructure procurement";
      baseFramework.category = "Infrastructure";
      baseFramework.applicableTypes = ["Road Construction", "Bridge Construction", "Building Construction"];
      baseFramework.technicalWeightPercent = 75;
      baseFramework.financialWeightPercent = 25;
    } else if (ministryCode === "MOE") {
      baseFramework.name = "Educational Materials QCBS Framework";
      baseFramework.description = "Quality and Cost-Based Selection framework for educational procurement";
      baseFramework.category = "Educational";
      baseFramework.applicableTypes = ["Educational Technology", "School Furniture", "Learning Materials"];
      baseFramework.technicalWeightPercent = 65;
      baseFramework.financialWeightPercent = 35;
    }

    return [baseFramework];
  };

  const createFramework = () => {
    const newFramework: QCBSFramework = {
      id: `QCBS-${Date.now()}`,
      name: frameworkForm.name,
      description: frameworkForm.description,
      category: frameworkForm.category,
      applicableTypes: frameworkForm.applicableTypes,
      methodology: frameworkForm.methodology,
      technicalWeightPercent: frameworkForm.technicalWeightPercent,
      financialWeightPercent: frameworkForm.financialWeightPercent,
      qualificationThreshold: frameworkForm.qualificationThreshold,
      technicalPassingScore: frameworkForm.technicalPassingScore,
      scoringScale: frameworkForm.scoringScale,
      evaluationCriteria: [],
      financialEvaluationMethod: {
        method: "Lowest Cost",
        normalizationFormula: "Financial Score = (Lowest Price / Evaluated Price) × 100",
        adjustmentFactors: [],
        currencyHandling: "Convert to Naira using Central Bank rate",
        taxConsiderations: "Include all applicable taxes"
      },
      combinationFormula: {
        formula: "Combined Score = (Technical Score × Technical Weight) + (Financial Score × Financial Weight)",
        technicalComponent: `Technical Score × ${frameworkForm.technicalWeightPercent / 100}`,
        financialComponent: `Financial Score × ${frameworkForm.financialWeightPercent / 100}`,
        adjustments: [`Only technically qualified bids (≥${frameworkForm.technicalPassingScore}%) are financially evaluated`],
        roundingRule: "Round to 2 decimal places",
        tieBreakingRule: "Higher technical score wins; if tied, lowest price wins"
      },
      qualificationCriteria: [],
      consensusRules: [],
      escalationProcedures: [],
      auditRequirements: [],
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: "Draft",
      version: frameworkForm.version,
      usageCount: 0,
    };

    const updatedFrameworks = [...frameworks, newFramework];
    setFrameworks(updatedFrameworks);
    saveFrameworks(updatedFrameworks);

    setFrameworkForm({
      name: "",
      description: "",
      category: "",
      methodology: "QCBS",
      technicalWeightPercent: 70,
      financialWeightPercent: 30,
      qualificationThreshold: 60,
      technicalPassingScore: 75,
      scoringScale: 100,
      applicableTypes: [],
      version: "1.0",
    });
    setShowFrameworkModal(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Draft: "secondary",
      Active: "default",
      Archived: "outline",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getMethodologyBadge = (methodology: string) => {
    const variants = {
      QCBS: "default",
      QBS: "secondary",
      LCS: "outline", 
      FBS: "destructive",
    };
    return <Badge variant={variants[methodology as keyof typeof variants] as any}>{methodology}</Badge>;
  };

  const calculateTotalWeight = (criteria: EvaluationCriteria[]): number => {
    return criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QCBS Framework Definition</h2>
          <p className="text-gray-600">Define evaluation frameworks and scoring methods for procurement planning</p>
        </div>
        <Button onClick={() => setShowFrameworkModal(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New QCBS Framework
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frameworks" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            QCBS Frameworks
          </TabsTrigger>
          <TabsTrigger value="methodology" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Evaluation Methods
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Framework Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="grid gap-4">
            {frameworks.map((framework) => (
              <Card key={framework.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{framework.name}</CardTitle>
                        {getStatusBadge(framework.status)}
                        {getMethodologyBadge(framework.methodology)}
                        <Badge variant="outline">v{framework.version}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{framework.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Technical Weight</Label>
                          <p className="text-sm font-semibold">{framework.technicalWeightPercent}%</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Financial Weight</Label>
                          <p className="text-sm font-semibold">{framework.financialWeightPercent}%</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Passing Score</Label>
                          <p className="text-sm font-semibold">{framework.technicalPassingScore}%</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Criteria</Label>
                          <p className="text-sm font-semibold">{framework.evaluationCriteria.length}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Usage</Label>
                          <p className="text-sm font-semibold">{framework.usageCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedFramework(framework)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingFramework(framework)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        QCBS Configuration
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Technical Weight</span>
                            <span className="font-medium">{framework.technicalWeightPercent}%</span>
                          </div>
                          <Progress value={framework.technicalWeightPercent} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Financial Weight</span>
                            <span className="font-medium">{framework.financialWeightPercent}%</span>
                          </div>
                          <Progress value={framework.financialWeightPercent} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Evaluation Criteria ({framework.evaluationCriteria.length})
                      </h4>
                      <div className="space-y-2">
                        {framework.evaluationCriteria.slice(0, 3).map((criteria) => (
                          <div key={criteria.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{criteria.name}</span>
                              <Badge variant="outline" className="text-xs">{criteria.category}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{criteria.weight}%</span>
                              <Badge variant="secondary" className="text-xs">
                                Pass: {criteria.passingScore}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {framework.evaluationCriteria.length > 3 && (
                          <div className="text-sm text-gray-500 text-center py-1">
                            +{framework.evaluationCriteria.length - 3} more criteria
                          </div>
                        )}
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded font-medium">
                          <span>Total Weight</span>
                          <span className={calculateTotalWeight(framework.evaluationCriteria) === 100 ? "text-green-600" : "text-red-600"}>
                            {calculateTotalWeight(framework.evaluationCriteria)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {framework.applicableTypes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Applicable Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {framework.applicableTypes.map((type) => (
                            <Badge key={type} variant="outline">{type}</Badge>
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

        <TabsContent value="methodology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                QCBS Methodology Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Evaluation Process Steps
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
                        <div>
                          <div className="font-medium">Qualification</div>
                          <div className="text-sm text-gray-600">Verify basic eligibility and mandatory requirements</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
                        <div>
                          <div className="font-medium">Technical Evaluation</div>
                          <div className="text-sm text-gray-600">Score technical proposals against defined criteria</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</div>
                        <div>
                          <div className="font-medium">Financial Evaluation</div>
                          <div className="text-sm text-gray-600">Evaluate only technically qualified proposals</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</div>
                        <div>
                          <div className="font-medium">Combined Scoring</div>
                          <div className="text-sm text-gray-600">Calculate weighted combination of technical and financial scores</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-purple-600" />
                      Scoring Formula
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="font-mono text-sm text-purple-800 mb-2">
                          Combined Score = (TS × TW) + (FS × FW)
                        </div>
                        <div className="text-sm text-purple-700">
                          <div>TS = Technical Score (0-100)</div>
                          <div>TW = Technical Weight (e.g., 0.70)</div>
                          <div>FS = Financial Score (0-100)</div>
                          <div>FW = Financial Weight (e.g., 0.30)</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800 mb-2">Financial Score Calculation</div>
                        <div className="font-mono text-sm text-green-700">
                          Financial Score = (Lowest Price ÷ Evaluated Price) × 100
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="font-medium text-orange-800 mb-2">Qualification Threshold</div>
                        <div className="text-sm text-orange-700">
                          Only bids scoring ≥75% technically proceed to financial evaluation
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Key QCBS Principles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Technical Quality Focus</div>
                      <div className="text-sm text-gray-600">
                        Higher weight on technical evaluation ensures quality procurement
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Two-Stage Process</div>
                      <div className="text-sm text-gray-600">
                        Technical qualification before financial evaluation prevents low-quality bids
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-1">Best Value Selection</div>
                      <div className="text-sm text-gray-600">
                        Combines quality and cost to achieve best value for money
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Frameworks</CardTitle>
                  <Scale className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{frameworks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {frameworks.filter(f => f.status === "Active").length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Technical Weight</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {frameworks.length > 0 
                      ? Math.round(frameworks.reduce((sum, f) => sum + f.technicalWeightPercent, 0) / frameworks.length)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all frameworks
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {frameworks.reduce((sum, f) => sum + f.usageCount, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Framework applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Criteria</CardTitle>
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {frameworks.length > 0 
                      ? Math.round(frameworks.reduce((sum, f) => sum + f.evaluationCriteria.length, 0) / frameworks.length)
                      : 0
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Criteria per framework
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Framework Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frameworks.map((framework) => (
                    <div key={framework.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{framework.name}</span>
                        {getStatusBadge(framework.status)}
                        {getMethodologyBadge(framework.methodology)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{framework.usageCount} uses</span>
                        <div className="w-32">
                          <Progress 
                            value={(framework.usageCount / Math.max(...frameworks.map(f => f.usageCount), 1)) * 100} 
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

      {/* Create Framework Modal */}
      <Dialog open={showFrameworkModal} onOpenChange={setShowFrameworkModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create QCBS Framework</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="framework-name">Framework Name</Label>
              <Input
                id="framework-name"
                value={frameworkForm.name}
                onChange={(e) => setFrameworkForm({...frameworkForm, name: e.target.value})}
                placeholder="e.g., Medical Equipment QCBS Framework"
              />
            </div>
            <div>
              <Label htmlFor="framework-description">Description</Label>
              <Textarea
                id="framework-description"
                value={frameworkForm.description}
                onChange={(e) => setFrameworkForm({...frameworkForm, description: e.target.value})}
                placeholder="Describe the framework purpose and scope"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={frameworkForm.category}
                  onChange={(e) => setFrameworkForm({...frameworkForm, category: e.target.value})}
                  placeholder="e.g., Medical Equipment"
                />
              </div>
              <div>
                <Label htmlFor="methodology">Methodology</Label>
                <Select value={frameworkForm.methodology} onValueChange={(value: any) => setFrameworkForm({...frameworkForm, methodology: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QCBS">Quality and Cost-Based Selection (QCBS)</SelectItem>
                    <SelectItem value="QBS">Quality-Based Selection (QBS)</SelectItem>
                    <SelectItem value="LCS">Least Cost Selection (LCS)</SelectItem>
                    <SelectItem value="FBS">Fixed Budget Selection (FBS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">QCBS Weighting Configuration</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="technical-weight">Technical Weight (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[frameworkForm.technicalWeightPercent]}
                      onValueChange={(value) => setFrameworkForm({
                        ...frameworkForm,
                        technicalWeightPercent: value[0],
                        financialWeightPercent: 100 - value[0]
                      })}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span className="font-medium">{frameworkForm.technicalWeightPercent}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="financial-weight">Financial Weight (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[frameworkForm.financialWeightPercent]}
                      onValueChange={(value) => setFrameworkForm({
                        ...frameworkForm,
                        financialWeightPercent: value[0],
                        technicalWeightPercent: 100 - value[0]
                      })}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0%</span>
                      <span className="font-medium">{frameworkForm.financialWeightPercent}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passing-score">Technical Passing Score (%)</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    value={frameworkForm.technicalPassingScore}
                    onChange={(e) => setFrameworkForm({...frameworkForm, technicalPassingScore: parseInt(e.target.value) || 75})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="scoring-scale">Scoring Scale</Label>
                  <Select value={frameworkForm.scoringScale.toString()} onValueChange={(value) => setFrameworkForm({...frameworkForm, scoringScale: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100-point scale</SelectItem>
                      <SelectItem value="10">10-point scale</SelectItem>
                      <SelectItem value="5">5-point scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="applicable-types">Applicable Procurement Types (comma-separated)</Label>
              <Input
                id="applicable-types"
                value={frameworkForm.applicableTypes.join(", ")}
                onChange={(e) => setFrameworkForm({...frameworkForm, applicableTypes: e.target.value.split(", ").filter(s => s.trim())})}
                placeholder="e.g., Medical Equipment, Healthcare Technology"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFrameworkModal(false)}>
                Cancel
              </Button>
              <Button onClick={createFramework}>
                Create Framework
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
