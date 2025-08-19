import { useState, useEffect } from "react";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calculator,
  PieChart,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Eye,
  Save,
  Send,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Target,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Types
interface BudgetAllocation {
  id: string;
  procurementPlanId: string;
  planTitle: string;
  totalBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
  categories: BudgetCategory[];
  approvalWorkflow: ApprovalWorkflowStep[];
  status: "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Revision Required";
  submittedDate?: string;
  approvedDate?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  comments: WorkflowComment[];
  revisionHistory: BudgetRevision[];
  budgetJustification: string;
  riskAssessment: RiskAssessment[];
}

interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  requestedAmount: number;
  allocatedAmount: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  department: string;
  justification: string;
  marketResearchRef?: string;
  approvalStatus: "Pending" | "Approved" | "Rejected" | "Modified";
  modificationReason?: string;
}

interface ApprovalWorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  approverRole: string;
  approverName: string;
  approverEmail: string;
  status: "Pending" | "Approved" | "Rejected" | "Delegated";
  actionDate?: string;
  comments?: string;
  delegatedTo?: string;
  requiredDocuments: string[];
  completedDocuments: string[];
  thresholdAmount?: number;
}

interface WorkflowComment {
  id: string;
  stepId: string;
  author: string;
  role: string;
  comment: string;
  date: string;
  type: "Approval" | "Rejection" | "Query" | "Information";
  attachments?: string[];
}

interface BudgetRevision {
  id: string;
  version: number;
  description: string;
  changedBy: string;
  changeDate: string;
  changes: BudgetChange[];
  reason: string;
}

interface BudgetChange {
  field: string;
  oldValue: any;
  newValue: any;
  category?: string;
}

interface RiskAssessment {
  id: string;
  category: string;
  riskDescription: string;
  impact: "High" | "Medium" | "Low";
  probability: "High" | "Medium" | "Low";
  mitigation: string;
  owner: string;
}

const STORAGE_KEY = "budgetAllocations";

interface BudgetAllocationProps {
  procurementPlanId?: string;
  planTitle?: string;
  totalBudget?: number;
  onClose?: () => void;
}

export default function BudgetAllocation({ 
  procurementPlanId, 
  planTitle, 
  totalBudget,
  onClose 
}: BudgetAllocationProps) {
  const [budgetAllocations, setBudgetAllocations] = useState<BudgetAllocation[]>([]);
  const [selectedAllocation, setSelectedAllocation] = useState<BudgetAllocation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "workflow" | "analytics">("list");

  // Form states
  const [allocationForm, setAllocationForm] = useState({
    totalBudget: totalBudget || 0,
    budgetJustification: "",
    categories: [] as BudgetCategory[],
    riskAssessment: [] as RiskAssessment[],
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    requestedAmount: "",
    priority: "Medium" as const,
    quarter: "Q1" as const,
    department: "",
    justification: "",
  });

  const [approvalForm, setApprovalForm] = useState({
    comments: "",
    action: "approve" as "approve" | "reject" | "request_revision",
    stepId: "",
  });

  useEffect(() => {
    loadBudgetAllocations();
  }, []);

  useEffect(() => {
    if (procurementPlanId && totalBudget) {
      setShowCreateModal(true);
      setAllocationForm(prev => ({ ...prev, totalBudget }));
    }
  }, [procurementPlanId, totalBudget]);

  const loadBudgetAllocations = () => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setBudgetAllocations(JSON.parse(stored));
      } else {
        const sampleData = createSampleBudgetAllocations(ministryCode);
        setBudgetAllocations(sampleData);
        localStorage.setItem(storageKey, JSON.stringify(sampleData));
      }
    } catch (error) {
      console.error("Error loading budget allocations:", error);
    }
  };

  const createSampleBudgetAllocations = (ministryCode: string): BudgetAllocation[] => {
    const baseAllocation: BudgetAllocation = {
      id: "BA-2024-001",
      procurementPlanId: "PP-2024-001",
      planTitle: "Annual Medical Equipment Procurement",
      totalBudget: 2500000000,
      allocatedBudget: 2350000000,
      remainingBudget: 150000000,
      status: "Approved",
      submittedDate: "2024-01-20",
      approvedDate: "2024-01-25",
      createdBy: "Dr. Amina Hassan",
      createdDate: "2024-01-15",
      lastModified: "2024-01-25",
      budgetJustification: "Critical medical equipment needed to improve healthcare delivery across Kano State health facilities.",
      categories: [
        {
          id: "BC-001",
          name: "Diagnostic Equipment",
          description: "X-ray machines, ultrasound equipment, and diagnostic tools",
          requestedAmount: 800000000,
          allocatedAmount: 750000000,
          priority: "Critical",
          quarter: "Q2",
          department: "Medical Services",
          justification: "Essential for accurate diagnosis and patient care",
          approvalStatus: "Approved",
        },
        {
          id: "BC-002",
          name: "Surgical Equipment",
          description: "Operating room equipment and surgical instruments",
          requestedAmount: 600000000,
          allocatedAmount: 580000000,
          priority: "High",
          quarter: "Q3",
          department: "Surgery Department",
          justification: "Required for surgical procedures and emergency operations",
          approvalStatus: "Approved",
        },
        {
          id: "BC-003",
          name: "Laboratory Equipment",
          description: "Lab testing machines and diagnostic equipment",
          requestedAmount: 450000000,
          allocatedAmount: 420000000,
          priority: "High",
          quarter: "Q2",
          department: "Laboratory Services",
          justification: "Necessary for accurate medical testing and diagnostics",
          approvalStatus: "Approved",
        },
        {
          id: "BC-004",
          name: "Emergency Equipment",
          description: "Ambulance equipment and emergency medical supplies",
          requestedAmount: 400000000,
          allocatedAmount: 350000000,
          priority: "Critical",
          quarter: "Q1",
          department: "Emergency Services",
          justification: "Critical for emergency response and patient transport",
          approvalStatus: "Modified",
          modificationReason: "Budget constraints, reduced by 12.5%",
        },
        {
          id: "BC-005",
          name: "IT Infrastructure",
          description: "Hospital management system and medical software",
          requestedAmount: 250000000,
          allocatedAmount: 250000000,
          priority: "Medium",
          quarter: "Q4",
          department: "IT Department",
          justification: "Essential for digital transformation of healthcare",
          approvalStatus: "Approved",
        },
      ],
      approvalWorkflow: [
        {
          id: "WF-001",
          stepNumber: 1,
          stepName: "Department Review",
          approverRole: "Department Head",
          approverName: "Dr. Amina Hassan",
          approverEmail: "amina.hassan@health.kano.gov.ng",
          status: "Approved",
          actionDate: "2024-01-20",
          comments: "Budget allocation is reasonable and well-justified",
          requiredDocuments: ["Budget breakdown", "Justification report"],
          completedDocuments: ["Budget breakdown", "Justification report"],
        },
        {
          id: "WF-002",
          stepNumber: 2,
          stepName: "Financial Review",
          approverRole: "Finance Director",
          approverName: "Mal. Ibrahim Kano",
          approverEmail: "ibrahim.kano@finance.kano.gov.ng",
          status: "Approved",
          actionDate: "2024-01-22",
          comments: "Budget is within allocated ministry limits",
          requiredDocuments: ["Financial analysis", "Cash flow projection"],
          completedDocuments: ["Financial analysis", "Cash flow projection"],
          thresholdAmount: 1000000000,
        },
        {
          id: "WF-003",
          stepNumber: 3,
          stepName: "Ministry Approval",
          approverRole: "Permanent Secretary",
          approverName: "Dr. Khadija Aliyu",
          approverEmail: "khadija.aliyu@health.kano.gov.ng",
          status: "Approved",
          actionDate: "2024-01-25",
          comments: "Approved with minor modifications to emergency equipment budget",
          requiredDocuments: ["Final budget document", "Risk assessment"],
          completedDocuments: ["Final budget document", "Risk assessment"],
          thresholdAmount: 2000000000,
        },
      ],
      comments: [
        {
          id: "COM-001",
          stepId: "WF-003",
          author: "Dr. Khadija Aliyu",
          role: "Permanent Secretary",
          comment: "Excellent planning. Minor adjustment needed for emergency equipment to optimize budget utilization.",
          date: "2024-01-25",
          type: "Approval",
        },
      ],
      revisionHistory: [],
      riskAssessment: [
        {
          id: "RA-001",
          category: "Budget Overrun",
          riskDescription: "Potential cost increases due to market fluctuations",
          impact: "Medium",
          probability: "Low",
          mitigation: "Include 5% contingency in each category",
          owner: "Finance Team",
        },
        {
          id: "RA-002",
          category: "Supplier Availability",
          riskDescription: "Limited suppliers for specialized medical equipment",
          impact: "High",
          probability: "Medium",
          mitigation: "Early market engagement and pre-qualification of suppliers",
          owner: "Procurement Team",
        },
      ],
    };

    // Customize for different ministries
    if (ministryCode === "MOWI") {
      baseAllocation.planTitle = "Infrastructure Development Plan 2024";
      baseAllocation.totalBudget = 15000000000;
      baseAllocation.allocatedBudget = 14200000000;
      baseAllocation.budgetJustification = "Critical infrastructure development to improve road networks and construction projects across Kano State.";
      baseAllocation.categories = [
        {
          id: "BC-001",
          name: "Road Construction",
          description: "Highway rehabilitation and new road construction projects",
          requestedAmount: 8000000000,
          allocatedAmount: 7500000000,
          priority: "Critical",
          quarter: "Q2",
          department: "Road Construction",
          justification: "Essential for improving transportation infrastructure",
          approvalStatus: "Approved",
        },
        {
          id: "BC-002",
          name: "Bridge Construction",
          description: "New bridge construction and rehabilitation projects",
          requestedAmount: 5000000000,
          allocatedAmount: 4800000000,
          priority: "High",
          quarter: "Q3",
          department: "Bridge Engineering",
          justification: "Critical for connecting communities and improving access",
          approvalStatus: "Approved",
        },
      ];
    } else if (ministryCode === "MOE") {
      baseAllocation.planTitle = "Educational Infrastructure and Equipment Plan";
      baseAllocation.totalBudget = 5000000000;
      baseAllocation.allocatedBudget = 4750000000;
      baseAllocation.budgetJustification = "Essential educational infrastructure and equipment to improve learning outcomes in Kano State schools.";
      baseAllocation.categories = [
        {
          id: "BC-001",
          name: "School Furniture",
          description: "Desks, chairs, and classroom furniture for schools",
          requestedAmount: 2000000000,
          allocatedAmount: 1900000000,
          priority: "High",
          quarter: "Q1",
          department: "Basic Education",
          justification: "Essential for creating conducive learning environments",
          approvalStatus: "Approved",
        },
        {
          id: "BC-002",
          name: "Educational Technology",
          description: "Computers, projectors, and digital learning equipment",
          requestedAmount: 1800000000,
          allocatedAmount: 1750000000,
          priority: "Medium",
          quarter: "Q2",
          department: "Educational Technology",
          justification: "Required for digital transformation of education",
          approvalStatus: "Approved",
        },
      ];
    }

    return [baseAllocation];
  };

  const saveBudgetAllocations = (allocations: BudgetAllocation[]) => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;
      localStorage.setItem(storageKey, JSON.stringify(allocations));
    } catch (error) {
      console.error("Error saving budget allocations:", error);
    }
  };

  const addCategory = () => {
    if (!categoryForm.name || !categoryForm.requestedAmount) return;

    const newCategory: BudgetCategory = {
      id: `BC-${Date.now()}`,
      name: categoryForm.name,
      description: categoryForm.description,
      requestedAmount: parseFloat(categoryForm.requestedAmount),
      allocatedAmount: 0,
      priority: categoryForm.priority,
      quarter: categoryForm.quarter,
      department: categoryForm.department,
      justification: categoryForm.justification,
      approvalStatus: "Pending",
    };

    setAllocationForm(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));

    setCategoryForm({
      name: "",
      description: "",
      requestedAmount: "",
      priority: "Medium",
      quarter: "Q1",
      department: "",
      justification: "",
    });
  };

  const createBudgetAllocation = () => {
    const totalRequested = allocationForm.categories.reduce((sum, cat) => sum + cat.requestedAmount, 0);
    
    const newAllocation: BudgetAllocation = {
      id: `BA-${Date.now()}`,
      procurementPlanId: procurementPlanId || "PP-NEW",
      planTitle: planTitle || "New Procurement Plan",
      totalBudget: allocationForm.totalBudget,
      allocatedBudget: 0,
      remainingBudget: allocationForm.totalBudget,
      categories: allocationForm.categories,
      status: "Draft",
      createdBy: "Current User",
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      budgetJustification: allocationForm.budgetJustification,
      approvalWorkflow: createDefaultWorkflow(),
      comments: [],
      revisionHistory: [],
      riskAssessment: allocationForm.riskAssessment,
    };

    const updatedAllocations = [...budgetAllocations, newAllocation];
    setBudgetAllocations(updatedAllocations);
    saveBudgetAllocations(updatedAllocations);

    setAllocationForm({
      totalBudget: 0,
      budgetJustification: "",
      categories: [],
      riskAssessment: [],
    });
    setShowCreateModal(false);
  };

  const createDefaultWorkflow = (): ApprovalWorkflowStep[] => [
    {
      id: `WF-${Date.now()}-1`,
      stepNumber: 1,
      stepName: "Department Review",
      approverRole: "Department Head",
      approverName: "Current Department Head",
      approverEmail: "dept.head@ministry.gov.ng",
      status: "Pending",
      requiredDocuments: ["Budget breakdown", "Justification report"],
      completedDocuments: [],
    },
    {
      id: `WF-${Date.now()}-2`,
      stepNumber: 2,
      stepName: "Financial Review",
      approverRole: "Finance Director",
      approverName: "Finance Director",
      approverEmail: "finance@ministry.gov.ng",
      status: "Pending",
      requiredDocuments: ["Financial analysis", "Cash flow projection"],
      completedDocuments: [],
      thresholdAmount: 1000000000,
    },
    {
      id: `WF-${Date.now()}-3`,
      stepNumber: 3,
      stepName: "Ministry Approval",
      approverRole: "Permanent Secretary",
      approverName: "Permanent Secretary",
      approverEmail: "ps@ministry.gov.ng",
      status: "Pending",
      requiredDocuments: ["Final budget document", "Risk assessment"],
      completedDocuments: [],
      thresholdAmount: 2000000000,
    },
  ];

  const submitForApproval = (allocationId: string) => {
    const updatedAllocations = budgetAllocations.map(allocation =>
      allocation.id === allocationId
        ? { 
            ...allocation, 
            status: "Submitted" as const,
            submittedDate: new Date().toISOString().split('T')[0],
            lastModified: new Date().toISOString().split('T')[0],
          }
        : allocation
    );

    setBudgetAllocations(updatedAllocations);
    saveBudgetAllocations(updatedAllocations);
  };

  const processApproval = (allocationId: string, stepId: string, action: "approve" | "reject" | "request_revision", comments: string) => {
    const updatedAllocations = budgetAllocations.map(allocation => {
      if (allocation.id === allocationId) {
        const updatedWorkflow = allocation.approvalWorkflow.map(step => {
          if (step.id === stepId) {
            const newStatus = action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Pending";
            return {
              ...step,
              status: newStatus as any,
              actionDate: new Date().toISOString().split('T')[0],
              comments: comments,
            };
          }
          return step;
        });

        // Update overall status based on workflow
        let newStatus = allocation.status;
        const currentStepIndex = updatedWorkflow.findIndex(step => step.id === stepId);
        
        if (action === "reject") {
          newStatus = "Rejected";
        } else if (action === "request_revision") {
          newStatus = "Revision Required";
        } else if (action === "approve") {
          if (currentStepIndex === updatedWorkflow.length - 1) {
            // Last step approved
            newStatus = "Approved";
          } else {
            // Move to next step
            newStatus = "Under Review";
          }
        }

        const newComment: WorkflowComment = {
          id: `COM-${Date.now()}`,
          stepId: stepId,
          author: "Current User",
          role: "Approver",
          comment: comments,
          date: new Date().toISOString().split('T')[0],
          type: action === "approve" ? "Approval" : action === "reject" ? "Rejection" : "Query",
        };

        return {
          ...allocation,
          status: newStatus as any,
          approvalWorkflow: updatedWorkflow,
          comments: [...allocation.comments, newComment],
          lastModified: new Date().toISOString().split('T')[0],
          approvedDate: newStatus === "Approved" ? new Date().toISOString().split('T')[0] : allocation.approvedDate,
        };
      }
      return allocation;
    });

    setBudgetAllocations(updatedAllocations);
    saveBudgetAllocations(updatedAllocations);
    setShowApprovalModal(false);
  };

  const getStatusBadge = (status: BudgetAllocation["status"]) => {
    const variants = {
      Draft: "secondary",
      Submitted: "outline",
      "Under Review": "outline",
      Approved: "default",
      Rejected: "destructive",
      "Revision Required": "secondary",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const getStatusIcon = (status: BudgetAllocation["status"]) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "Under Review":
      case "Submitted":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "Revision Required":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateBudgetUtilization = (allocation: BudgetAllocation) => {
    return Math.round((allocation.allocatedBudget / allocation.totalBudget) * 100);
  };

  const getTotalRequestedAmount = () => {
    return allocationForm.categories.reduce((sum, cat) => sum + cat.requestedAmount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Allocation & Approval</h2>
          <p className="text-gray-600">Manage budget allocations and approval workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-primary text-white" : ""}>
            List View
          </Button>
          <Button variant="outline" onClick={() => setViewMode("workflow")} className={viewMode === "workflow" ? "bg-primary text-white" : ""}>
            Workflow View
          </Button>
          <Button variant="outline" onClick={() => setViewMode("analytics")} className={viewMode === "analytics" ? "bg-primary text-white" : ""}>
            Analytics
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Budget Allocation
          </Button>
        </div>
      </div>

      {viewMode === "list" && (
        <div className="grid gap-4">
          {budgetAllocations.map((allocation) => (
            <Card key={allocation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(allocation.status)}
                      <CardTitle className="text-lg">{allocation.planTitle}</CardTitle>
                      {getStatusBadge(allocation.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{allocation.budgetJustification}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-500">Total Budget</Label>
                        <p className="text-sm font-semibold">₦{allocation.totalBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">Allocated</Label>
                        <p className="text-sm font-semibold">₦{allocation.allocatedBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">Utilization</Label>
                        <p className="text-sm font-semibold">{calculateBudgetUtilization(allocation)}%</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-500">Categories</Label>
                        <p className="text-sm font-semibold">{allocation.categories.length}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Budget Utilization</span>
                        <span>{calculateBudgetUtilization(allocation)}%</span>
                      </div>
                      <Progress value={calculateBudgetUtilization(allocation)} className="h-2" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedAllocation(allocation);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {allocation.status === "Draft" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => submitForApproval(allocation.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    {allocation.status === "Under Review" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedAllocation(allocation);
                          setShowApprovalModal(true);
                        }}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "workflow" && (
        <div className="space-y-6">
          {budgetAllocations.map((allocation) => (
            <Card key={allocation.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(allocation.status)}
                  {allocation.planTitle}
                  {getStatusBadge(allocation.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Workflow Progress</span>
                    <span>
                      {allocation.approvalWorkflow.filter(step => step.status === "Approved").length} of {allocation.approvalWorkflow.length} completed
                    </span>
                  </div>
                  
                  <div className="relative">
                    {allocation.approvalWorkflow.map((step, index) => (
                      <div key={step.id} className="flex items-center mb-6 last:mb-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          step.status === "Approved" ? "bg-green-100 border-green-500" :
                          step.status === "Rejected" ? "bg-red-100 border-red-500" :
                          step.status === "Pending" ? "bg-gray-100 border-gray-300" :
                          "bg-yellow-100 border-yellow-500"
                        }`}>
                          {step.status === "Approved" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {step.status === "Rejected" && <XCircle className="h-4 w-4 text-red-600" />}
                          {step.status === "Pending" && <Clock className="h-4 w-4 text-gray-600" />}
                        </div>
                        
                        {index < allocation.approvalWorkflow.length - 1 && (
                          <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-200"></div>
                        )}
                        
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{step.stepName}</h4>
                            <Badge variant={step.status === "Approved" ? "default" : step.status === "Rejected" ? "destructive" : "secondary"}>
                              {step.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{step.approverName} ({step.approverRole})</p>
                          {step.actionDate && (
                            <p className="text-xs text-gray-500">{step.actionDate}</p>
                          )}
                          {step.comments && (
                            <p className="text-sm text-gray-700 mt-1 italic">"{step.comments}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "analytics" && (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget Allocations</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{budgetAllocations.reduce((sum, allocation) => sum + allocation.totalBudget, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {budgetAllocations.length} procurement plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Budgets</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {budgetAllocations.filter(a => a.status === "Approved").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Out of {budgetAllocations.length} total allocations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(budgetAllocations.reduce((sum, allocation) => sum + calculateBudgetUtilization(allocation), 0) / budgetAllocations.length || 0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Budget utilization rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Draft", "Submitted", "Under Review", "Approved", "Rejected", "Revision Required"].map(status => {
                  const count = budgetAllocations.filter(a => a.status === status).length;
                  const percentage = budgetAllocations.length > 0 ? Math.round((count / budgetAllocations.length) * 100) : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status as any)}
                        <span className="text-sm">{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-20">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Budget Allocation Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Budget Allocation</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total-budget">Total Budget (₦)</Label>
                <Input
                  id="total-budget"
                  type="number"
                  value={allocationForm.totalBudget}
                  onChange={(e) => setAllocationForm({...allocationForm, totalBudget: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Total Requested</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  ₦{getTotalRequestedAmount().toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="justification">Budget Justification</Label>
              <Textarea
                id="justification"
                value={allocationForm.budgetJustification}
                onChange={(e) => setAllocationForm({...allocationForm, budgetJustification: e.target.value})}
                placeholder="Provide justification for this budget allocation"
                rows={3}
              />
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Budget Categories</h3>
                <Button type="button" variant="outline" onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    placeholder="e.g., Medical Equipment"
                  />
                </div>
                <div>
                  <Label>Requested Amount (₦)</Label>
                  <Input
                    type="number"
                    value={categoryForm.requestedAmount}
                    onChange={(e) => setCategoryForm({...categoryForm, requestedAmount: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={categoryForm.priority} onValueChange={(value: any) => setCategoryForm({...categoryForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quarter</Label>
                  <Select value={categoryForm.quarter} onValueChange={(value: any) => setCategoryForm({...categoryForm, quarter: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    placeholder="Brief description of this category"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={categoryForm.department}
                    onChange={(e) => setCategoryForm({...categoryForm, department: e.target.value})}
                    placeholder="Responsible department"
                  />
                </div>
                <div>
                  <Label>Justification</Label>
                  <Input
                    value={categoryForm.justification}
                    onChange={(e) => setCategoryForm({...categoryForm, justification: e.target.value})}
                    placeholder="Justification for this category"
                  />
                </div>
              </div>

              {allocationForm.categories.length > 0 && (
                <div className="space-y-2">
                  {allocationForm.categories.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="outline">{category.priority}</Badge>
                          <Badge variant="secondary">{category.quarter}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        <p className="text-sm font-medium">₦{category.requestedAmount.toLocaleString()}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAllocationForm({
                          ...allocationForm,
                          categories: allocationForm.categories.filter((_, i) => i !== index)
                        })}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={createBudgetAllocation} disabled={allocationForm.categories.length === 0}>
                Create Allocation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAllocation && getStatusIcon(selectedAllocation.status)}
              Budget Allocation Details
              {selectedAllocation && getStatusBadge(selectedAllocation.status)}
            </DialogTitle>
          </DialogHeader>
          {selectedAllocation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Plan Title</Label>
                  <p className="font-semibold">{selectedAllocation.planTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Budget</Label>
                  <p className="font-semibold">₦{selectedAllocation.totalBudget.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created By</Label>
                  <p>{selectedAllocation.createdBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                  <p>{selectedAllocation.createdDate}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Justification</Label>
                <p className="mt-1">{selectedAllocation.budgetJustification}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Budget Categories</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Allocated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAllocation.categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-gray-600">{category.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{category.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{category.quarter}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{category.requestedAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{category.allocatedAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            category.approvalStatus === "Approved" ? "default" :
                            category.approvalStatus === "Rejected" ? "destructive" :
                            category.approvalStatus === "Modified" ? "secondary" :
                            "outline"
                          }>
                            {category.approvalStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedAllocation.riskAssessment.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Risk Assessment</h3>
                  <div className="space-y-2">
                    {selectedAllocation.riskAssessment.map((risk) => (
                      <div key={risk.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{risk.category}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline">Impact: {risk.impact}</Badge>
                            <Badge variant="outline">Probability: {risk.probability}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{risk.riskDescription}</p>
                        <p className="text-sm"><strong>Mitigation:</strong> {risk.mitigation}</p>
                        <p className="text-xs text-gray-500">Owner: {risk.owner}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAllocation.comments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Comments & Notes</h3>
                  <div className="space-y-3">
                    {selectedAllocation.comments.map((comment) => (
                      <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{comment.author}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{comment.type}</Badge>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Approval</DialogTitle>
          </DialogHeader>
          {selectedAllocation && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Budget Allocation</Label>
                <p className="font-semibold">{selectedAllocation.planTitle}</p>
                <p className="text-sm text-gray-600">₦{selectedAllocation.totalBudget.toLocaleString()}</p>
              </div>

              <div>
                <Label>Action</Label>
                <Select value={approvalForm.action} onValueChange={(value: any) => setApprovalForm({...approvalForm, action: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="request_revision">Request Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="approval-comments">Comments</Label>
                <Textarea
                  id="approval-comments"
                  value={approvalForm.comments}
                  onChange={(e) => setApprovalForm({...approvalForm, comments: e.target.value})}
                  placeholder="Add your comments here..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const currentStep = selectedAllocation.approvalWorkflow.find(step => step.status === "Pending");
                    if (currentStep) {
                      processApproval(selectedAllocation.id, currentStep.id, approvalForm.action, approvalForm.comments);
                    }
                  }}
                >
                  Submit Decision
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
