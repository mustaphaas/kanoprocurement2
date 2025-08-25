import { useState, useEffect } from "react";
import {
  Calculator,
  Scale,
  Target,
  Plus,
  Edit,
  Eye,
  Save,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Copy,
  FileText,
  Percent,
  BookOpen,
  Settings,
  X,
  ArrowRight,
  DollarSign,
  AlertCircle,
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types for Flexible QCBS Template
interface QCBSCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight?: number; // Optional weighting within the criteria
  type: "Technical" | "Financial";
  isRequired: boolean;
  evaluationGuideline?: string;
}

interface QCBSTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  technicalCriteria: QCBSCriterion[];
  financialCriteria: QCBSCriterion[];
  technicalWeight: number; // Always 70%
  financialWeight: number; // Always 30%
  totalTechnicalScore: number;
  totalFinancialScore: number;
  status: "Draft" | "Active" | "Archived";
  createdDate: string;
  lastModified: string;
  usageCount: number;
  createdBy: string;
  isEditable: boolean;
}

const STORAGE_KEY = "qcbsFlexibleTemplates";
const TECHNICAL_WEIGHT = 70;
const FINANCIAL_WEIGHT = 30;

export default function FlexibleQCBSTemplate() {
  const [templates, setTemplates] = useState<QCBSTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QCBSTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<QCBSTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCriterionModal, setShowCriterionModal] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [criterionType, setCriterionType] = useState<"Technical" | "Financial">("Technical");

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "",
  });

  const [criterionForm, setCriterionForm] = useState({
    name: "",
    description: "",
    maxScore: 20,
    weight: 1,
    isRequired: true,
    evaluationGuideline: "",
  });

  const [currentEditingTemplateId, setCurrentEditingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;

      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTemplates(JSON.parse(stored));
      } else {
        const sampleTemplates = createSampleTemplates(ministryCode);
        setTemplates(sampleTemplates);
        localStorage.setItem(storageKey, JSON.stringify(sampleTemplates));
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const saveTemplates = (updatedTemplates: QCBSTemplate[]) => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error("Error saving templates:", error);
    }
  };

  const createSampleTemplates = (ministryCode: string): QCBSTemplate[] => {
    const sampleTemplate: QCBSTemplate = {
      id: "FLEX-QCBS-001",
      name: "Medical Equipment Evaluation Template",
      description: "Flexible template for evaluating medical equipment procurement",
      category: "Medical Equipment",
      technicalCriteria: [
        {
          id: "TECH-001",
          name: "Equipment Specifications",
          description: "Technical specifications and performance parameters",
          maxScore: 25,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Evaluate against specified technical requirements and standards",
        },
        {
          id: "TECH-002",
          name: "Quality Standards Compliance",
          description: "Compliance with international and local quality standards",
          maxScore: 20,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Verify ISO, FDA, and local regulatory compliance",
        },
        {
          id: "TECH-003",
          name: "Company Experience",
          description: "Relevant experience in similar projects",
          maxScore: 15,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Assess track record and previous project success",
        },
        {
          id: "TECH-004",
          name: "After-Sales Support",
          description: "Support infrastructure and maintenance capabilities",
          maxScore: 10,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Evaluate local support presence and service quality",
        },
      ],
      financialCriteria: [
        {
          id: "FIN-001",
          name: "Initial Cost",
          description: "Equipment purchase price",
          maxScore: 20,
          weight: 1,
          type: "Financial",
          isRequired: true,
          evaluationGuideline: "Lowest cost gets highest score using normalization formula",
        },
        {
          id: "FIN-002",
          name: "Operating Costs",
          description: "Annual operating and maintenance costs",
          maxScore: 10,
          weight: 1,
          type: "Financial",
          isRequired: true,
          evaluationGuideline: "Evaluate 5-year total cost of ownership",
        },
      ],
      technicalWeight: TECHNICAL_WEIGHT,
      financialWeight: FINANCIAL_WEIGHT,
      totalTechnicalScore: 70,
      totalFinancialScore: 30,
      status: "Active",
      createdDate: "2024-01-15",
      lastModified: "2024-02-10",
      usageCount: 5,
      createdBy: "System Administrator",
      isEditable: true,
    };

    // Customize for different ministries
    if (ministryCode === "MOWI") {
      sampleTemplate.name = "Infrastructure Evaluation Template";
      sampleTemplate.description = "Flexible template for evaluating infrastructure projects";
      sampleTemplate.category = "Infrastructure";
      sampleTemplate.technicalCriteria = [
        {
          id: "TECH-001",
          name: "Engineering Design",
          description: "Quality and feasibility of engineering design",
          maxScore: 25,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Assess design quality, safety, and compliance with standards",
        },
        {
          id: "TECH-002",
          name: "Construction Methodology",
          description: "Proposed construction approach and methodology",
          maxScore: 20,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Evaluate construction plan, timeline, and resource allocation",
        },
        {
          id: "TECH-003",
          name: "Contractor Experience",
          description: "Experience in similar infrastructure projects",
          maxScore: 15,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Review portfolio and assess project complexity handled",
        },
        {
          id: "TECH-004",
          name: "Environmental Compliance",
          description: "Environmental impact and mitigation measures",
          maxScore: 10,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Evaluate environmental assessment and sustainability measures",
        },
      ];
    } else if (ministryCode === "MOE") {
      sampleTemplate.name = "Educational Materials Evaluation Template";
      sampleTemplate.description = "Flexible template for evaluating educational materials and equipment";
      sampleTemplate.category = "Educational";
      sampleTemplate.technicalCriteria = [
        {
          id: "TECH-001",
          name: "Educational Content Quality",
          description: "Quality and relevance of educational content",
          maxScore: 30,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Assess curriculum alignment and pedagogical value",
        },
        {
          id: "TECH-002",
          name: "Technology Features",
          description: "Technical features and usability",
          maxScore: 20,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Evaluate user interface, accessibility, and technical capabilities",
        },
        {
          id: "TECH-003",
          name: "Training and Support",
          description: "Training programs and ongoing support",
          maxScore: 20,
          weight: 1,
          type: "Technical",
          isRequired: true,
          evaluationGuideline: "Assess teacher training quality and support infrastructure",
        },
      ];
    }

    return [sampleTemplate];
  };

  const createNewTemplate = () => {
    const newTemplate: QCBSTemplate = {
      id: `FLEX-QCBS-${Date.now()}`,
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      technicalCriteria: [],
      financialCriteria: [],
      technicalWeight: TECHNICAL_WEIGHT,
      financialWeight: FINANCIAL_WEIGHT,
      totalTechnicalScore: 0,
      totalFinancialScore: 0,
      status: "Draft",
      createdDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      usageCount: 0,
      createdBy: "Current User",
      isEditable: true,
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);

    setTemplateForm({ name: "", description: "", category: "" });
    setShowTemplateModal(false);
    setEditingTemplate(newTemplate);
    setSelectedTemplate(newTemplate); // Also set for preview
    setCurrentEditingTemplateId(newTemplate.id);
    setActiveTab("builder"); // Switch to builder tab
  };

  const addCriterion = () => {
    if (!editingTemplate) return;

    const newCriterion: QCBSCriterion = {
      id: `${criterionType.toUpperCase()}-${Date.now()}`,
      name: criterionForm.name,
      description: criterionForm.description,
      maxScore: criterionForm.maxScore,
      weight: criterionForm.weight,
      type: criterionType,
      isRequired: criterionForm.isRequired,
      evaluationGuideline: criterionForm.evaluationGuideline,
    };

    const updatedTemplate = { ...editingTemplate };
    if (criterionType === "Technical") {
      updatedTemplate.technicalCriteria = [...updatedTemplate.technicalCriteria, newCriterion];
      updatedTemplate.totalTechnicalScore = updatedTemplate.technicalCriteria.reduce(
        (sum, criterion) => sum + criterion.maxScore,
        0
      );
    } else {
      updatedTemplate.financialCriteria = [...updatedTemplate.financialCriteria, newCriterion];
      updatedTemplate.totalFinancialScore = updatedTemplate.financialCriteria.reduce(
        (sum, criterion) => sum + criterion.maxScore,
        0
      );
    }

    updatedTemplate.lastModified = new Date().toISOString().split("T")[0];

    const updatedTemplates = templates.map((template) =>
      template.id === editingTemplate.id ? updatedTemplate : template
    );

    setTemplates(updatedTemplates);
    setEditingTemplate(updatedTemplate);
    saveTemplates(updatedTemplates);

    setCriterionForm({
      name: "",
      description: "",
      maxScore: 20,
      weight: 1,
      isRequired: true,
      evaluationGuideline: "",
    });
    setShowCriterionModal(false);
  };

  const deleteCriterion = (criterionId: string, type: "Technical" | "Financial") => {
    if (!editingTemplate) return;

    const updatedTemplate = { ...editingTemplate };
    if (type === "Technical") {
      updatedTemplate.technicalCriteria = updatedTemplate.technicalCriteria.filter(
        (criterion) => criterion.id !== criterionId
      );
      updatedTemplate.totalTechnicalScore = updatedTemplate.technicalCriteria.reduce(
        (sum, criterion) => sum + criterion.maxScore,
        0
      );
    } else {
      updatedTemplate.financialCriteria = updatedTemplate.financialCriteria.filter(
        (criterion) => criterion.id !== criterionId
      );
      updatedTemplate.totalFinancialScore = updatedTemplate.financialCriteria.reduce(
        (sum, criterion) => sum + criterion.maxScore,
        0
      );
    }

    updatedTemplate.lastModified = new Date().toISOString().split("T")[0];

    const updatedTemplates = templates.map((template) =>
      template.id === editingTemplate.id ? updatedTemplate : template
    );

    setTemplates(updatedTemplates);
    setEditingTemplate(updatedTemplate);
    saveTemplates(updatedTemplates);
  };

  const normalizeScores = () => {
    if (!editingTemplate) return;

    const updatedTemplate = { ...editingTemplate };

    // Normalize technical criteria to sum to 70
    if (updatedTemplate.technicalCriteria.length > 0) {
      const currentTechnicalTotal = updatedTemplate.technicalCriteria.reduce(
        (sum, criterion) => sum + criterion.maxScore,
        0
      );
      
      if (currentTechnicalTotal !== TECHNICAL_WEIGHT) {
        const normalizationFactor = TECHNICAL_WEIGHT / currentTechnicalTotal;
        updatedTemplate.technicalCriteria = updatedTemplate.technicalCriteria.map((criterion) => ({
          ...criterion,
          maxScore: Math.round(criterion.maxScore * normalizationFactor),
        }));
        
        // Adjust the last criterion to ensure exact total
        const newTotal = updatedTemplate.technicalCriteria.reduce(
          (sum, criterion) => sum + criterion.maxScore,
          0
        );
        const difference = TECHNICAL_WEIGHT - newTotal;
        if (difference !== 0) {
          updatedTemplate.technicalCriteria[updatedTemplate.technicalCriteria.length - 1].maxScore += difference;
        }
      }
      updatedTemplate.totalTechnicalScore = TECHNICAL_WEIGHT;
    }

    // Normalize financial criteria to sum to 30
    if (updatedTemplate.financialCriteria.length > 0) {
      const currentFinancialTotal = updatedTemplate.financialCriteria.reduce(
        (sum, criterion) => sum + criterion.maxScore,
        0
      );
      
      if (currentFinancialTotal !== FINANCIAL_WEIGHT) {
        const normalizationFactor = FINANCIAL_WEIGHT / currentFinancialTotal;
        updatedTemplate.financialCriteria = updatedTemplate.financialCriteria.map((criterion) => ({
          ...criterion,
          maxScore: Math.round(criterion.maxScore * normalizationFactor),
        }));
        
        // Adjust the last criterion to ensure exact total
        const newTotal = updatedTemplate.financialCriteria.reduce(
          (sum, criterion) => sum + criterion.maxScore,
          0
        );
        const difference = FINANCIAL_WEIGHT - newTotal;
        if (difference !== 0) {
          updatedTemplate.financialCriteria[updatedTemplate.financialCriteria.length - 1].maxScore += difference;
        }
      }
      updatedTemplate.totalFinancialScore = FINANCIAL_WEIGHT;
    }

    updatedTemplate.lastModified = new Date().toISOString().split("T")[0];

    const updatedTemplates = templates.map((template) =>
      template.id === editingTemplate.id ? updatedTemplate : template
    );

    setTemplates(updatedTemplates);
    setEditingTemplate(updatedTemplate);
    saveTemplates(updatedTemplates);
  };

  const duplicateTemplate = (template: QCBSTemplate) => {
    const duplicatedTemplate: QCBSTemplate = {
      ...template,
      id: `FLEX-QCBS-${Date.now()}`,
      name: `${template.name} (Copy)`,
      status: "Draft",
      createdDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
      usageCount: 0,
      createdBy: "Current User",
      isEditable: true,
    };

    const updatedTemplates = [...templates, duplicatedTemplate];
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;

    const updatedTemplate = {
      ...editingTemplate,
      status: "Active" as const,
      lastModified: new Date().toISOString().split("T")[0],
    };

    const updatedTemplates = templates.map((template) =>
      template.id === editingTemplate.id ? updatedTemplate : template
    );

    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
    setEditingTemplate(null);
    setCurrentEditingTemplateId(null);
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setCurrentEditingTemplateId(null);
  };

  const getTechnicalScoreStatus = () => {
    if (!editingTemplate) return { status: "neutral", message: "" };
    
    const total = editingTemplate.totalTechnicalScore;
    if (total === TECHNICAL_WEIGHT) {
      return { status: "success", message: `Perfect! Technical criteria total ${TECHNICAL_WEIGHT} points.` };
    } else if (total > TECHNICAL_WEIGHT) {
      return { status: "warning", message: `Technical criteria total ${total} points. Should be ${TECHNICAL_WEIGHT} points. Click normalize to fix.` };
    } else {
      return { status: "error", message: `Technical criteria total ${total} points. Should be ${TECHNICAL_WEIGHT} points. Add more criteria or increase scores.` };
    }
  };

  const getFinancialScoreStatus = () => {
    if (!editingTemplate) return { status: "neutral", message: "" };
    
    const total = editingTemplate.totalFinancialScore;
    if (total === FINANCIAL_WEIGHT) {
      return { status: "success", message: `Perfect! Financial criteria total ${FINANCIAL_WEIGHT} points.` };
    } else if (total > FINANCIAL_WEIGHT) {
      return { status: "warning", message: `Financial criteria total ${total} points. Should be ${FINANCIAL_WEIGHT} points. Click normalize to fix.` };
    } else {
      return { status: "error", message: `Financial criteria total ${total} points. Should be ${FINANCIAL_WEIGHT} points. Add more criteria or increase scores.` };
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Draft: "secondary",
      Active: "default",
      Archived: "outline",
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-green-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                    Flexible QCBS Evaluation Template
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Dynamic criteria creation with 70/30 technical-financial split
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">Template Builder Active</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>Technical: 70% | Financial: 30%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowTemplateModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-green-100 shadow-lg p-2">
          <TabsList className="grid w-full grid-cols-3 bg-transparent gap-1">
            <TabsTrigger
              value="templates"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-green-50"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Templates</span>
            </TabsTrigger>
            <TabsTrigger
              value="builder"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-blue-50"
            >
              <Settings className="h-4 w-4" />
              <span className="font-medium">Template Builder</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50"
            >
              <Eye className="h-4 w-4" />
              <span className="font-medium">Preview & Test</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border border-gray-100 hover:border-green-200 rounded-xl overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {getStatusBadge(template.status)}
                        <Badge variant="outline">v1.0</Badge>
                        {template.usageCount > 0 && (
                          <Badge variant="secondary">{template.usageCount} uses</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Category: {template.category}</span>
                        <span>Technical: {template.technicalCriteria.length} criteria</span>
                        <span>Financial: {template.financialCriteria.length} criteria</span>
                        <span>Modified: {template.lastModified}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template);
                          setCurrentEditingTemplateId(template.id);
                          setActiveTab("builder");
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Weight Distribution */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Score Distribution (70/30 Split)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Technical ({template.technicalCriteria.length} criteria)</span>
                            <span className="font-medium">{template.totalTechnicalScore} pts</span>
                          </div>
                          <Progress
                            value={(template.totalTechnicalScore / TECHNICAL_WEIGHT) * 100}
                            className="h-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Financial ({template.financialCriteria.length} criteria)</span>
                            <span className="font-medium">{template.totalFinancialScore} pts</span>
                          </div>
                          <Progress
                            value={(template.totalFinancialScore / FINANCIAL_WEIGHT) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Criteria Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          Technical Criteria
                        </h4>
                        <div className="space-y-2">
                          {template.technicalCriteria.slice(0, 3).map((criterion) => (
                            <div
                              key={criterion.id}
                              className="flex items-center justify-between p-2 bg-blue-50 rounded"
                            >
                              <span className="font-medium text-sm">{criterion.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {criterion.maxScore} pts
                              </Badge>
                            </div>
                          ))}
                          {template.technicalCriteria.length > 3 && (
                            <div className="text-sm text-gray-500 text-center py-1">
                              +{template.technicalCriteria.length - 3} more criteria
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          Financial Criteria
                        </h4>
                        <div className="space-y-2">
                          {template.financialCriteria.slice(0, 3).map((criterion) => (
                            <div
                              key={criterion.id}
                              className="flex items-center justify-between p-2 bg-green-50 rounded"
                            >
                              <span className="font-medium text-sm">{criterion.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {criterion.maxScore} pts
                              </Badge>
                            </div>
                          ))}
                          {template.financialCriteria.length > 3 && (
                            <div className="text-sm text-gray-500 text-center py-1">
                              +{template.financialCriteria.length - 3} more criteria
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Template Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          {editingTemplate ? (
            <div className="space-y-6">
              {/* Template Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Editing: {editingTemplate.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{editingTemplate.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Category: {editingTemplate.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveTemplate} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                      </Button>
                      <Button variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Score Status Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const techStatus = getTechnicalScoreStatus();
                  return (
                    <Alert className={
                      techStatus.status === "success" ? "border-green-500 bg-green-50" :
                      techStatus.status === "warning" ? "border-yellow-500 bg-yellow-50" :
                      "border-red-500 bg-red-50"
                    }>
                      <Target className="h-4 w-4" />
                      <AlertDescription>{techStatus.message}</AlertDescription>
                    </Alert>
                  );
                })()}
                {(() => {
                  const finStatus = getFinancialScoreStatus();
                  return (
                    <Alert className={
                      finStatus.status === "success" ? "border-green-500 bg-green-50" :
                      finStatus.status === "warning" ? "border-yellow-500 bg-yellow-50" :
                      "border-red-500 bg-red-50"
                    }>
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>{finStatus.message}</AlertDescription>
                    </Alert>
                  );
                })()}
              </div>

              {/* Normalize Button */}
              {(editingTemplate.totalTechnicalScore !== TECHNICAL_WEIGHT || 
                editingTemplate.totalFinancialScore !== FINANCIAL_WEIGHT) && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-yellow-800">Score Normalization Available</h4>
                        <p className="text-sm text-yellow-700">
                          Auto-normalize scores to maintain 70/30 split
                        </p>
                      </div>
                      <Button onClick={normalizeScores} variant="outline" className="border-yellow-300">
                        <Calculator className="h-4 w-4 mr-2" />
                        Normalize Scores
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Criteria Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Technical Criteria ({editingTemplate.totalTechnicalScore}/{TECHNICAL_WEIGHT} points)
                    </CardTitle>
                    <Button
                      onClick={() => {
                        setCriterionType("Technical");
                        setShowCriterionModal(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Technical Criterion
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {editingTemplate.technicalCriteria.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No technical criteria added yet</p>
                        <p className="text-sm">Add criteria to evaluate technical proposals</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editingTemplate.technicalCriteria.map((criterion) => (
                          <div
                            key={criterion.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{criterion.name}</h4>
                                {criterion.isRequired && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                              {criterion.evaluationGuideline && (
                                <p className="text-xs text-gray-500 italic">
                                  Guide: {criterion.evaluationGuideline}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-semibold text-lg">{criterion.maxScore}</div>
                                <div className="text-xs text-gray-500">points</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCriterion(criterion.id, "Technical")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Criteria Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Financial Criteria ({editingTemplate.totalFinancialScore}/{FINANCIAL_WEIGHT} points)
                    </CardTitle>
                    <Button
                      onClick={() => {
                        setCriterionType("Financial");
                        setShowCriterionModal(true);
                      }}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Financial Criterion
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {editingTemplate.financialCriteria.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No financial criteria added yet</p>
                        <p className="text-sm">Add criteria to evaluate financial proposals</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editingTemplate.financialCriteria.map((criterion) => (
                          <div
                            key={criterion.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{criterion.name}</h4>
                                {criterion.isRequired && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                              {criterion.evaluationGuideline && (
                                <p className="text-xs text-gray-500 italic">
                                  Guide: {criterion.evaluationGuideline}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-semibold text-lg">{criterion.maxScore}</div>
                                <div className="text-xs text-gray-500">points</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteCriterion(criterion.id, "Financial")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
              <p className="text-gray-600 mb-4">Select a template to edit or create a new one</p>
              <Button onClick={() => setShowTemplateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          {selectedTemplate || editingTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>Template Preview: {(selectedTemplate || editingTemplate)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Template Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(selectedTemplate || editingTemplate)?.technicalCriteria.length}
                      </div>
                      <div className="text-sm text-blue-700">Technical Criteria</div>
                      <div className="text-xs text-blue-600">
                        {(selectedTemplate || editingTemplate)?.totalTechnicalScore} total points
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(selectedTemplate || editingTemplate)?.financialCriteria.length}
                      </div>
                      <div className="text-sm text-green-700">Financial Criteria</div>
                      <div className="text-xs text-green-600">
                        {(selectedTemplate || editingTemplate)?.totalFinancialScore} total points
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">100</div>
                      <div className="text-sm text-purple-700">Total Score</div>
                      <div className="text-xs text-purple-600">70% Technical + 30% Financial</div>
                    </div>
                  </div>

                  {/* Detailed Criteria */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Technical Evaluation ({TECHNICAL_WEIGHT}%)
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Criterion</TableHead>
                            <TableHead className="text-right">Max Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(selectedTemplate || editingTemplate)?.technicalCriteria.map((criterion) => (
                            <TableRow key={criterion.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{criterion.name}</div>
                                  <div className="text-sm text-gray-600">{criterion.description}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {criterion.maxScore}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-blue-50">
                            <TableCell className="font-semibold">Total Technical Score</TableCell>
                            <TableCell className="text-right font-bold">
                              {(selectedTemplate || editingTemplate)?.totalTechnicalScore}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Financial Evaluation ({FINANCIAL_WEIGHT}%)
                      </h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Criterion</TableHead>
                            <TableHead className="text-right">Max Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(selectedTemplate || editingTemplate)?.financialCriteria.map((criterion) => (
                            <TableRow key={criterion.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{criterion.name}</div>
                                  <div className="text-sm text-gray-600">{criterion.description}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {criterion.maxScore}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-green-50">
                            <TableCell className="font-semibold">Total Financial Score</TableCell>
                            <TableCell className="text-right font-bold">
                              {(selectedTemplate || editingTemplate)?.totalFinancialScore}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Scoring Formula */}
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      QCBS Scoring Formula
                    </h4>
                    <div className="font-mono text-lg text-center p-4 bg-white rounded border">
                      Combined Score = (Technical Score × 0.70) + (Financial Score × 0.30)
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Technical Component (70%):</strong>
                        <p>Sum of all technical criteria scores, normalized to 70 points</p>
                      </div>
                      <div>
                        <strong>Financial Component (30%):</strong>
                        <p>Sum of all financial criteria scores, normalized to 30 points</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Template to Preview</h3>
              <p className="text-gray-600">Select a template from the Templates tab to preview</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New QCBS Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., Medical Equipment Evaluation Template"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                placeholder="Describe the template purpose and scope"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Input
                id="template-category"
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                placeholder="e.g., Medical Equipment, Infrastructure, Services"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createNewTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Criterion Modal */}
      <Dialog open={showCriterionModal} onOpenChange={setShowCriterionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Add {criterionType} Criterion
              <Badge variant="outline" className="ml-2">
                {criterionType === "Technical" ? "70% Weight" : "30% Weight"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="criterion-name">Criterion Name</Label>
              <Input
                id="criterion-name"
                value={criterionForm.name}
                onChange={(e) => setCriterionForm({ ...criterionForm, name: e.target.value })}
                placeholder={
                  criterionType === "Technical"
                    ? "e.g., Technical Specifications"
                    : "e.g., Total Cost of Ownership"
                }
              />
            </div>
            <div>
              <Label htmlFor="criterion-description">Description</Label>
              <Textarea
                id="criterion-description"
                value={criterionForm.description}
                onChange={(e) => setCriterionForm({ ...criterionForm, description: e.target.value })}
                placeholder="Describe what this criterion evaluates"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="criterion-max-score">Maximum Score (Points)</Label>
              <Input
                id="criterion-max-score"
                type="number"
                value={criterionForm.maxScore}
                onChange={(e) =>
                  setCriterionForm({ ...criterionForm, maxScore: parseInt(e.target.value) || 0 })
                }
                placeholder="20"
                min="1"
                max={criterionType === "Technical" ? "70" : "30"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: {criterionType === "Technical" ? "10-30 points" : "5-15 points"}
              </p>
            </div>
            <div>
              <Label htmlFor="criterion-guideline">Evaluation Guideline (Optional)</Label>
              <Textarea
                id="criterion-guideline"
                value={criterionForm.evaluationGuideline}
                onChange={(e) =>
                  setCriterionForm({ ...criterionForm, evaluationGuideline: e.target.value })
                }
                placeholder="Instructions for evaluators on how to score this criterion"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCriterionModal(false)}>
                Cancel
              </Button>
              <Button onClick={addCriterion}>
                Add Criterion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
