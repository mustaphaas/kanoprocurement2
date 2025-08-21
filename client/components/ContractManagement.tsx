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
  TrendingUp,
  AlertTriangle,
  Handshake,
  Building2,
  CreditCard,
  Receipt,
  BarChart3,
  Archive,
  PenTool,
  Gavel,
  Calculator,
  MapPin,
  Timer,
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
import { Progress } from "@/components/ui/progress";

// Types
interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description: string;
  contractValue: number;
  status: "Draft" | "Active" | "Completed" | "Terminated" | "Suspended";
  startDate: string;
  endDate: string;
  signedDate?: string;
  contractor: Contractor;
  ministry: string;
  department: string;
  contractType: "Construction" | "Supply" | "Services" | "Consultancy";
  milestones: Milestone[];
  payments: Payment[];
  variations: Variation[];
  documents: ContractDocument[];
  performance: PerformanceMetrics;
  disputes: Dispute[];
  compliance: ComplianceItem[];
  financials: FinancialSummary;
}

interface Contractor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  registrationNumber: string;
  taxClearance: string;
  performanceRating: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completionDate?: string;
  status: "Pending" | "In Progress" | "Completed" | "Overdue" | "Cancelled";
  deliverables: string[];
  percentage: number;
  paymentTrigger: boolean;
}

interface Payment {
  id: string;
  type: "Advance" | "Interim" | "Final" | "Retention";
  amount: number;
  dueDate: string;
  processedDate?: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected" | "Overdue";
  invoiceNumber?: string;
  milestoneId?: string;
  documents: string[];
}

interface Variation {
  id: string;
  title: string;
  description: string;
  type:
    | "Scope Change"
    | "Price Adjustment"
    | "Time Extension"
    | "Quantity Change";
  originalValue: number;
  newValue: number;
  impactDays: number;
  status: "Pending" | "Approved" | "Rejected" | "Implemented";
  requestDate: string;
  approvalDate?: string;
  justification: string;
}

interface ContractDocument {
  id: string;
  name: string;
  type:
    | "Contract"
    | "Guarantee"
    | "Insurance"
    | "Performance Bond"
    | "Variation Order"
    | "Certificate"
    | "Other";
  uploadDate: string;
  expiryDate?: string;
  size: string;
  status: "Valid" | "Expired" | "Expiring Soon";
}

interface PerformanceMetrics {
  timelinessScore: number;
  qualityScore: number;
  complianceScore: number;
  overallRating: number;
  kpis: KPI[];
}

interface KPI {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit: string;
  status: "On Track" | "At Risk" | "Behind";
}

interface Dispute {
  id: string;
  title: string;
  description: string;
  type: "Payment" | "Quality" | "Timeline" | "Scope" | "Other";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Under Review" | "Resolved" | "Escalated";
  raisedDate: string;
  resolvedDate?: string;
  raisedBy: "Contractor" | "Ministry";
  resolution?: string;
}

interface ComplianceItem {
  id: string;
  requirement: string;
  type:
    | "Tax Clearance"
    | "Insurance"
    | "License"
    | "Performance Bond"
    | "Other";
  status: "Compliant" | "Non-Compliant" | "Expiring" | "Pending";
  dueDate?: string;
  lastChecked: string;
}

interface FinancialSummary {
  totalContractValue: number;
  paidAmount: number;
  pendingAmount: number;
  retentionAmount: number;
  advanceAmount: number;
  completionPercentage: number;
}

// Storage keys
const STORAGE_KEYS = {
  CONTRACTS: "kanoproc_contracts",
  CONTRACTORS: "kanoproc_contractors",
  PAYMENTS: "kanoproc_payments",
  MILESTONES: "kanoproc_milestones",
  VARIATIONS: "kanoproc_variations",
  DISPUTES: "kanoproc_disputes",
};

const ContractManagement = () => {
  const [activeTab, setActiveTab] = useState("contracts");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showContractModal, setShowContractModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Form states
  const [contractForm, setContractForm] = useState({
    title: "",
    description: "",
    contractValue: "",
    startDate: "",
    endDate: "",
    contractType: "Construction",
    contractorId: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    type: "Interim",
    amount: "",
    dueDate: "",
    invoiceNumber: "",
    milestoneId: "",
  });

  const [variationForm, setVariationForm] = useState({
    title: "",
    description: "",
    type: "Scope Change",
    newValue: "",
    impactDays: "",
    justification: "",
  });

  const [disputeForm, setDisputeForm] = useState({
    title: "",
    description: "",
    type: "Payment",
    priority: "Medium",
  });

  // Load data from localStorage
  useEffect(() => {
    const loadFromStorage = (key: string) => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    };

    // Load NOC-linked contracts and existing contracts
    const loadAllContracts = () => {
      const existingContracts = loadFromStorage(STORAGE_KEYS.CONTRACTS);
      const nocContracts = loadFromStorage("contracts"); // Contracts from NOC approval

      // Merge and deduplicate contracts
      const allContracts = [...existingContracts];

      nocContracts.forEach((nocContract: any) => {
        const exists = allContracts.find((c) => c.id === nocContract.id);
        if (!exists) {
          // Convert NOC contract format to ContractManagement format
          const convertedContract = convertNOCContractFormat(nocContract);
          allContracts.push(convertedContract);
        }
      });

      return allContracts;
    };

    setContracts(loadAllContracts());

    // Listen for new contracts created from NOC approvals
    const handleContractCreated = (event: CustomEvent) => {
      const { contractData } = event.detail;
      const convertedContract = convertNOCContractFormat(contractData);

      setContracts((prevContracts) => {
        const exists = prevContracts.find((c) => c.id === contractData.id);
        if (!exists) {
          return [convertedContract, ...prevContracts];
        }
        return prevContracts;
      });
    };

    window.addEventListener(
      "contractCreated",
      handleContractCreated as EventListener,
    );

    return () => {
      window.removeEventListener(
        "contractCreated",
        handleContractCreated as EventListener,
      );
    };
  }, []);

  // Convert NOC contract format to ContractManagement format
  const convertNOCContractFormat = (nocContract: any): Contract => {
    return {
      id: nocContract.id,
      contractNumber: nocContract.id,
      title: nocContract.projectTitle,
      description:
        nocContract.projectDescription ||
        "Auto-generated contract from NOC approval",
      contractValue: parseFloat(
        nocContract.contractValue?.replace(/[^\d.]/g, "") || "0",
      ),
      status: nocContract.status === "Draft" ? "Draft" : "Active",
      startDate: nocContract.startDate,
      endDate: nocContract.endDate,
      signedDate:
        nocContract.status === "Active" ? nocContract.createdDate : undefined,
      contractor: {
        id: nocContract.contractorId || `contractor-${Date.now()}`,
        companyName: nocContract.contractorName,
        contactPerson: "Contract Manager",
        email: `${nocContract.contractorName.toLowerCase().replace(/\s+/g, "")}@company.com`,
        phone: "+234-XXX-XXX-XXXX",
        address: "Company Address",
        registrationNumber: "RC-XXXXXX",
        taxNumber: "TIN-XXXXXX",
      },
      ministry: nocContract.ministry,
      department: nocContract.procuringEntity || nocContract.ministry,
      contractType:
        nocContract.category === "Infrastructure"
          ? "Construction"
          : nocContract.category === "Medical Equipment"
            ? "Supply"
            : "Services",
      milestones:
        nocContract.milestones?.map((milestone: any, index: number) => ({
          id: milestone.id || `MIL-${index + 1}`,
          title: milestone.title,
          description: milestone.description,
          targetDate: milestone.targetDate,
          completionDate: milestone.completionDate,
          status: milestone.status || "Pending",
          paymentPercentage: milestone.percentage,
          deliverables: [`Deliverable for ${milestone.title}`],
          actualCost: 0,
          budgetedCost: parseFloat(
            milestone.amount?.replace(/[^\d.]/g, "") || "0",
          ),
        })) || [],
      payments: [],
      variations: [],
      documents: [],
      performance: {
        overallScore: 85,
        timePerformance: 90,
        qualityScore: 85,
        safetyScore: 80,
        stakeholderSatisfaction: 85,
        lastAssessment: new Date().toISOString().split("T")[0],
      },
      disputes: [],
      compliance: [],
      financials: {
        totalContractValue: parseFloat(
          nocContract.contractValue?.replace(/[^\d.]/g, "") || "0",
        ),
        paidAmount: 0,
        pendingAmount: parseFloat(
          nocContract.contractValue?.replace(/[^\d.]/g, "") || "0",
        ),
        retentionAmount: 0,
        advanceAmount: 0,
        completionPercentage: 0,
      },
      // Add NOC-specific metadata
      nocId: nocContract.nocId,
      nocCertificateNumber: nocContract.nocCertificateNumber,
      tenderId: nocContract.tenderId,
      procurementPlanId: nocContract.procurementPlanId,
      autoGenerated: nocContract.autoGenerated,
      generatedFromNOC: nocContract.generatedFromNOC,
    } as Contract & {
      nocId?: string;
      nocCertificateNumber?: string;
      tenderId?: string;
      procurementPlanId?: string;
      autoGenerated?: boolean;
      generatedFromNOC?: boolean;
    };
  };

  // Save to localStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Mock data for initial load
  useEffect(() => {
    if (contracts.length === 0) {
      const mockContracts: Contract[] = [
        {
          id: "C001",
          contractNumber: "KS/CNT/2024/001",
          title: "Construction of Primary Healthcare Centers",
          description:
            "Construction of 5 primary healthcare centers across rural communities in Kano North LGA",
          contractValue: 250000000,
          status: "Active",
          startDate: "2024-02-01",
          endDate: "2024-12-31",
          signedDate: "2024-01-25",
          contractor: {
            id: "CT001",
            companyName: "Northern Construction Ltd",
            contactPerson: "Engr. Ahmed Musa",
            email: "ahmed@northernconstruction.com",
            phone: "+234-803-1234567",
            address: "Plot 15, Industrial Layout, Kano",
            registrationNumber: "RC123456",
            taxClearance: "TCC2024001",
            performanceRating: 4.2,
          },
          ministry: "Ministry of Health",
          department: "Primary Healthcare Development",
          contractType: "Construction",
          milestones: [
            {
              id: "M001",
              title: "Site Preparation",
              description: "Clear and prepare construction sites",
              dueDate: "2024-03-15",
              completionDate: "2024-03-10",
              status: "Completed",
              deliverables: [
                "Site clearance certificate",
                "Environmental impact assessment",
              ],
              percentage: 20,
              paymentTrigger: true,
            },
            {
              id: "M002",
              title: "Foundation Work",
              description: "Complete foundation work for all 5 centers",
              dueDate: "2024-05-30",
              status: "In Progress",
              deliverables: [
                "Foundation completion certificate",
                "Quality test reports",
              ],
              percentage: 35,
              paymentTrigger: true,
            },
          ],
          payments: [
            {
              id: "P001",
              type: "Advance",
              amount: 50000000,
              dueDate: "2024-02-05",
              processedDate: "2024-02-03",
              status: "Paid",
              invoiceNumber: "INV-2024-001",
              documents: ["Advance payment guarantee", "Invoice"],
            },
            {
              id: "P002",
              type: "Interim",
              amount: 50000000,
              dueDate: "2024-04-01",
              status: "Pending",
              invoiceNumber: "INV-2024-002",
              milestoneId: "M001",
              documents: ["Milestone completion certificate"],
            },
          ],
          variations: [],
          documents: [
            {
              id: "D001",
              name: "Signed Contract Agreement",
              type: "Contract",
              uploadDate: "2024-01-25",
              size: "2.5 MB",
              status: "Valid",
            },
            {
              id: "D002",
              name: "Performance Bond",
              type: "Performance Bond",
              uploadDate: "2024-01-20",
              expiryDate: "2025-01-31",
              size: "1.2 MB",
              status: "Valid",
            },
          ],
          performance: {
            timelinessScore: 85,
            qualityScore: 92,
            complianceScore: 88,
            overallRating: 4.2,
            kpis: [
              {
                id: "KPI001",
                name: "On-time Delivery",
                target: 100,
                actual: 85,
                unit: "%",
                status: "On Track",
              },
            ],
          },
          disputes: [],
          compliance: [
            {
              id: "COMP001",
              requirement: "Valid Tax Clearance Certificate",
              type: "Tax Clearance",
              status: "Compliant",
              dueDate: "2024-12-31",
              lastChecked: "2024-01-15",
            },
          ],
          financials: {
            totalContractValue: 250000000,
            paidAmount: 50000000,
            pendingAmount: 50000000,
            retentionAmount: 25000000,
            advanceAmount: 50000000,
            completionPercentage: 35,
          },
        },
        {
          id: "C002",
          contractNumber: "KS/CNT/2024/002",
          title: "Supply of Medical Equipment",
          description:
            "Procurement and installation of modern medical equipment for state hospitals",
          contractValue: 150000000,
          status: "Active",
          startDate: "2024-01-15",
          endDate: "2024-08-15",
          signedDate: "2024-01-10",
          contractor: {
            id: "CT002",
            companyName: "MedEquip Solutions Ltd",
            contactPerson: "Dr. Fatima Abdullahi",
            email: "fatima@medequip.com",
            phone: "+234-805-9876543",
            address: "Plot 22, Medical District, Kano",
            registrationNumber: "RC987654",
            taxClearance: "TCC2024002",
            performanceRating: 4.5,
          },
          ministry: "Ministry of Health",
          department: "Medical Equipment",
          contractType: "Supply",
          milestones: [
            {
              id: "M003",
              title: "Equipment Procurement",
              description: "Procure all specified medical equipment",
              dueDate: "2024-04-15",
              status: "Completed",
              completionDate: "2024-04-10",
              deliverables: [
                "Equipment delivery receipt",
                "Quality certificates",
              ],
              percentage: 60,
              paymentTrigger: true,
            },
            {
              id: "M004",
              title: "Installation & Training",
              description: "Install equipment and train medical staff",
              dueDate: "2024-06-30",
              status: "In Progress",
              deliverables: [
                "Installation certificates",
                "Training completion reports",
              ],
              percentage: 30,
              paymentTrigger: true,
            },
          ],
          payments: [
            {
              id: "P003",
              type: "Interim",
              amount: 90000000,
              dueDate: "2024-04-20",
              processedDate: "2024-04-18",
              status: "Paid",
              invoiceNumber: "INV-2024-003",
              milestoneId: "M003",
              documents: ["Delivery receipt", "Invoice"],
            },
          ],
          variations: [
            {
              id: "V001",
              title: "Additional MRI Scanner",
              description:
                "Add one additional MRI scanner to the original scope",
              type: "Scope Change",
              originalValue: 150000000,
              newValue: 180000000,
              impactDays: 30,
              status: "Approved",
              requestDate: "2024-03-15",
              approvalDate: "2024-03-22",
              justification:
                "Increased patient demand requires additional capacity",
            },
          ],
          documents: [],
          performance: {
            timelinessScore: 95,
            qualityScore: 96,
            complianceScore: 94,
            overallRating: 4.5,
            kpis: [],
          },
          disputes: [],
          compliance: [],
          financials: {
            totalContractValue: 180000000,
            paidAmount: 90000000,
            pendingAmount: 54000000,
            retentionAmount: 18000000,
            advanceAmount: 0,
            completionPercentage: 60,
          },
        },
      ];

      setContracts(mockContracts);
      saveToStorage(STORAGE_KEYS.CONTRACTS, mockContracts);
    }
  }, [contracts.length]);

  const handleCreateContract = () => {
    const newContract: Contract = {
      id: `C${String(contracts.length + 1).padStart(3, "0")}`,
      contractNumber: `KS/CNT/2024/${String(contracts.length + 1).padStart(3, "0")}`,
      title: contractForm.title,
      description: contractForm.description,
      contractValue: parseFloat(contractForm.contractValue),
      status: "Draft",
      startDate: contractForm.startDate,
      endDate: contractForm.endDate,
      ministry: "Current Ministry",
      department: "Current Department",
      contractType: contractForm.contractType as
        | "Construction"
        | "Supply"
        | "Services"
        | "Consultancy",
      contractor: {
        id: contractForm.contractorId,
        companyName: "Sample Contractor",
        contactPerson: "Contact Person",
        email: "contact@contractor.com",
        phone: "+234-xxx-xxxxxxx",
        address: "Contractor Address",
        registrationNumber: "RC000000",
        taxClearance: "TCC000000",
        performanceRating: 0,
      },
      milestones: [],
      payments: [],
      variations: [],
      documents: [],
      performance: {
        timelinessScore: 0,
        qualityScore: 0,
        complianceScore: 0,
        overallRating: 0,
        kpis: [],
      },
      disputes: [],
      compliance: [],
      financials: {
        totalContractValue: parseFloat(contractForm.contractValue),
        paidAmount: 0,
        pendingAmount: 0,
        retentionAmount: 0,
        advanceAmount: 0,
        completionPercentage: 0,
      },
    };

    const updatedContracts = [...contracts, newContract];
    setContracts(updatedContracts);
    saveToStorage(STORAGE_KEYS.CONTRACTS, updatedContracts);

    setContractForm({
      title: "",
      description: "",
      contractValue: "",
      startDate: "",
      endDate: "",
      contractType: "Construction",
      contractorId: "",
    });
    setShowContractModal(false);
  };

  const updateContractStatus = (
    contractId: string,
    status: Contract["status"],
  ) => {
    const updatedContracts = contracts.map((contract) =>
      contract.id === contractId ? { ...contract, status } : contract,
    );

    setContracts(updatedContracts);
    saveToStorage(STORAGE_KEYS.CONTRACTS, updatedContracts);
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractor.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      if (filterStatus === "all") return true;
      if (filterStatus === "noc-linked") {
        // Check if contract was generated from NOC approval
        const nocContract = contract as any;
        return (
          nocContract.generatedFromNOC ||
          nocContract.nocId ||
          nocContract.nocCertificateNumber
        );
      }
      return contract.status === filterStatus;
    })();

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Active: "bg-green-100 text-green-800",
      Completed: "bg-blue-100 text-blue-800",
      Terminated: "bg-red-100 text-red-800",
      Suspended: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 min-h-screen">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-sm border border-orange-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-amber-600/5"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg">
                  <Handshake className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-amber-800 bg-clip-text text-transparent">
                    Contract Management System
                  </h2>
                  <p className="text-lg text-gray-600 font-medium">
                    Complete contract lifecycle management platform
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
                onClick={() => setShowContractModal(true)}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Contract
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-orange-100 shadow-lg p-2">
          <TabsList className="grid w-full grid-cols-8 bg-transparent gap-1">
            <TabsTrigger
              value="contracts"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-blue-50 border border-transparent data-[state=active]:border-blue-200"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">All Contracts</span>
            </TabsTrigger>
            <TabsTrigger
              value="milestones"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-emerald-50 border border-transparent data-[state=active]:border-emerald-200"
            >
              <Target className="h-4 w-4" />
              <span className="font-medium">Milestones</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-lime-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-green-50 border border-transparent data-[state=active]:border-green-200"
            >
              <CreditCard className="h-4 w-4" />
              <span className="font-medium">Payments</span>
            </TabsTrigger>
            <TabsTrigger
              value="variations"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-amber-50 border border-transparent data-[state=active]:border-amber-200"
            >
              <PenTool className="h-4 w-4" />
              <span className="font-medium">Variations</span>
            </TabsTrigger>
            <TabsTrigger
              value="disputes"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-rose-50 border border-transparent data-[state=active]:border-rose-200"
            >
              <Gavel className="h-4 w-4" />
              <span className="font-medium">Disputes</span>
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-purple-50 border border-transparent data-[state=active]:border-purple-200"
            >
              <Shield className="h-4 w-4" />
              <span className="font-medium">Compliance</span>
            </TabsTrigger>
            <TabsTrigger
              value="closeout"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50 border border-transparent data-[state=active]:border-slate-200"
            >
              <Archive className="h-4 w-4" />
              <span className="font-medium">Closeout</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-cyan-50 border border-transparent data-[state=active]:border-cyan-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Contracts */}
        <TabsContent value="contracts" className="space-y-6">
          {/* Quick Actions Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-100 shadow-md p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title, contractor, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-lg shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-56 border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-lg shadow-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                      <SelectItem value="all" className="hover:bg-orange-50">
                        All Status
                      </SelectItem>
                      <SelectItem value="Draft" className="hover:bg-gray-50">
                        Draft
                      </SelectItem>
                      <SelectItem value="Active" className="hover:bg-green-50">
                        Active
                      </SelectItem>
                      <SelectItem
                        value="Completed"
                        className="hover:bg-blue-50"
                      >
                        Completed
                      </SelectItem>
                      <SelectItem
                        value="Terminated"
                        className="hover:bg-red-50"
                      >
                        Terminated
                      </SelectItem>
                      <SelectItem
                        value="Suspended"
                        className="hover:bg-yellow-50"
                      >
                        Suspended
                      </SelectItem>
                      <SelectItem
                        value="noc-linked"
                        className="hover:bg-purple-50"
                      >
                        NOC-Linked Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredContracts.map((contract) => (
              <Card
                key={contract.id}
                className="hover:shadow-xl transition-all duration-200 bg-white/80 backdrop-blur-sm border border-orange-100 rounded-xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {contract.title}
                        </CardTitle>
                        {getStatusBadge(contract.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {contract.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Contract Value:</span>
                          <br />₦{contract.contractValue.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Contractor:</span>
                          <br />
                          {contract.contractor.companyName}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <br />
                          {contract.startDate} to {contract.endDate}
                        </div>
                        <div>
                          <span className="font-medium">Days Remaining:</span>
                          <br />
                          {calculateDaysRemaining(contract.endDate)} days
                        </div>
                      </div>

                      {/* NOC Information for auto-generated contracts */}
                      {(() => {
                        const nocContract = contract as any;
                        if (nocContract.generatedFromNOC || nocContract.nocId) {
                          return (
                            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-800">
                                  NOC-Linked Contract
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-purple-700">
                                {nocContract.nocId && (
                                  <div>
                                    <span className="font-medium">NOC ID:</span>
                                    <br />
                                    {nocContract.nocId}
                                  </div>
                                )}
                                {nocContract.nocCertificateNumber && (
                                  <div>
                                    <span className="font-medium">
                                      Certificate:
                                    </span>
                                    <br />
                                    {nocContract.nocCertificateNumber}
                                  </div>
                                )}
                                {nocContract.tenderId && (
                                  <div>
                                    <span className="font-medium">
                                      Tender ID:
                                    </span>
                                    <br />
                                    {nocContract.tenderId}
                                  </div>
                                )}
                                {nocContract.procurementPlanId && (
                                  <div>
                                    <span className="font-medium">
                                      Plan ID:
                                    </span>
                                    <br />
                                    {nocContract.procurementPlanId}
                                  </div>
                                )}
                                {nocContract.autoGenerated && (
                                  <div>
                                    <span className="font-medium">
                                      Auto-Generated:
                                    </span>
                                    <br />✅ Yes
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">
                            {contract.financials.completionPercentage}%
                          </span>
                        </div>
                        <Progress
                          value={contract.financials.completionPercentage}
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedContract(contract)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          /* Handle edit */
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Milestones & Deliverables */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Milestones & Deliverables Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.flatMap((contract) =>
                  contract.milestones.map((milestone) => (
                    <div key={milestone.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{milestone.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {milestone.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>Due: {milestone.dueDate}</span>
                            <span>Progress: {milestone.percentage}%</span>
                            {milestone.completionDate && (
                              <span>Completed: {milestone.completionDate}</span>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={
                            milestone.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : milestone.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : milestone.status === "Overdue"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }
                        >
                          {milestone.status}
                        </Badge>
                      </div>

                      <div className="mt-3">
                        <Progress
                          value={milestone.percentage}
                          className="h-2"
                        />
                      </div>

                      {milestone.deliverables.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-2">
                            Deliverables:
                          </h4>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {milestone.deliverables.map(
                              (deliverable, index) => (
                                <li key={index}>{deliverable}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments & Invoices */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Payment Processing</h3>
            <Button onClick={() => setShowPaymentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Paid</p>
                        <p className="text-xl font-bold">
                          ₦
                          {contracts
                            .reduce(
                              (sum, c) => sum + c.financials.paidAmount,
                              0,
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-xl font-bold">
                          ₦
                          {contracts
                            .reduce(
                              (sum, c) => sum + c.financials.pendingAmount,
                              0,
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Retention</p>
                        <p className="text-xl font-bold">
                          ₦
                          {contracts
                            .reduce(
                              (sum, c) => sum + c.financials.retentionAmount,
                              0,
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Advance</p>
                        <p className="text-xl font-bold">
                          ₦
                          {contracts
                            .reduce(
                              (sum, c) => sum + c.financials.advanceAmount,
                              0,
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.flatMap((contract) =>
                      contract.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {payment.invoiceNumber || "N/A"}
                          </TableCell>
                          <TableCell>{payment.type}</TableCell>
                          <TableCell>
                            ₦{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{payment.dueDate}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                payment.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "Approved"
                                    ? "bg-blue-100 text-blue-800"
                                    : payment.status === "Overdue"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variations & Amendments */}
        <TabsContent value="variations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Variation Orders & Change Management
            </h3>
            <Button onClick={() => setShowVariationModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Variation
            </Button>
          </div>

          <div className="grid gap-4">
            {contracts.flatMap((contract) =>
              contract.variations.map((variation) => (
                <Card key={variation.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {variation.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {variation.description}
                        </p>
                      </div>
                      <Badge
                        className={
                          variation.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : variation.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : variation.status === "Implemented"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {variation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <br />
                        {variation.type}
                      </div>
                      <div>
                        <span className="font-medium">Value Change:</span>
                        <br />₦
                        {(
                          variation.newValue - variation.originalValue
                        ).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Time Impact:</span>
                        <br />
                        {variation.impactDays} days
                      </div>
                      <div>
                        <span className="font-medium">Request Date:</span>
                        <br />
                        {variation.requestDate}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Justification:</h4>
                      <p className="text-sm text-gray-600">
                        {variation.justification}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )),
            )}

            {contracts.every(
              (contract) => contract.variations.length === 0,
            ) && (
              <Card>
                <CardContent className="text-center py-8">
                  <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No variations recorded yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Disputes & Claims */}
        <TabsContent value="disputes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Dispute & Claim Management
            </h3>
            <Button onClick={() => setShowDisputeModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Dispute
            </Button>
          </div>

          <Card>
            <CardContent className="text-center py-8">
              <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No disputes recorded</p>
              <p className="text-sm text-gray-500 mt-2">
                All contracts are proceeding smoothly without disputes
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance & Documentation */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Documentation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div key={contract.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">{contract.title}</h3>

                    <div className="grid gap-3">
                      {contract.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-600">
                                Type: {doc.type} | Size: {doc.size}
                                {doc.expiryDate &&
                                  ` | Expires: ${doc.expiryDate}`}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              doc.status === "Valid"
                                ? "bg-green-100 text-green-800"
                                : doc.status === "Expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      ))}

                      {contract.compliance.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">{item.requirement}</p>
                              <p className="text-sm text-gray-600">
                                Last checked: {item.lastChecked}
                                {item.dueDate && ` | Due: ${item.dueDate}`}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              item.status === "Compliant"
                                ? "bg-green-100 text-green-800"
                                : item.status === "Non-Compliant"
                                  ? "bg-red-100 text-red-800"
                                  : item.status === "Expiring"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Closeout */}
        <TabsContent value="closeout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Closure & Performance Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {contracts
                  .filter((c) => c.status === "Completed")
                  .map((contract) => (
                    <div key={contract.id} className="border rounded-lg p-6">
                      <h3 className="font-semibold text-lg mb-4">
                        {contract.title}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">
                            Performance Metrics
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Timeliness:</span>
                              <span className="font-medium">
                                {contract.performance.timelinessScore}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quality:</span>
                              <span className="font-medium">
                                {contract.performance.qualityScore}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Compliance:</span>
                              <span className="font-medium">
                                {contract.performance.complianceScore}%
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold pt-2 border-t">
                              <span>Overall Rating:</span>
                              <span>
                                {contract.performance.overallRating}/5.0
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">
                            Financial Summary
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Contract Value:</span>
                              <span>
                                ₦
                                {contract.financials.totalContractValue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Paid:</span>
                              <span>
                                ₦
                                {contract.financials.paidAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Retention Released:</span>
                              <span>
                                ₦
                                {contract.financials.retentionAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="space-y-2">
                            <Button className="w-full" size="sm">
                              <Award className="h-4 w-4 mr-2" />
                              Generate Certificate
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Final Report
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Contract
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {contracts.filter((c) => c.status === "Completed").length ===
                  0 && (
                  <div className="text-center py-8">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No completed contracts ready for closeout
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Analytics & Reports */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Contracts</p>
                    <p className="text-2xl font-bold">{contracts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Contracts</p>
                    <p className="text-2xl font-bold">
                      {contracts.filter((c) => c.status === "Active").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold">
                      ₦
                      {contracts
                        .reduce((sum, c) => sum + c.contractValue, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Performance</p>
                    <p className="text-2xl font-bold">
                      {(
                        contracts.reduce(
                          (sum, c) => sum + c.performance.overallRating,
                          0,
                        ) / contracts.length || 0
                      ).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contract Performance Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div key={contract.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{contract.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <span className="font-bold">
                          {contract.performance.overallRating}/5.0
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Timeliness</span>
                        <Progress
                          value={contract.performance.timelinessScore}
                          className="h-2 mt-1"
                        />
                        <span className="text-xs text-gray-500">
                          {contract.performance.timelinessScore}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quality</span>
                        <Progress
                          value={contract.performance.qualityScore}
                          className="h-2 mt-1"
                        />
                        <span className="text-xs text-gray-500">
                          {contract.performance.qualityScore}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Compliance</span>
                        <Progress
                          value={contract.performance.complianceScore}
                          className="h-2 mt-1"
                        />
                        <span className="text-xs text-gray-500">
                          {contract.performance.complianceScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Contract Modal */}
      <Dialog open={showContractModal} onOpenChange={setShowContractModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Contract Title</Label>
              <Input
                id="title"
                value={contractForm.title}
                onChange={(e) =>
                  setContractForm({ ...contractForm, title: e.target.value })
                }
                placeholder="Enter contract title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={contractForm.description}
                onChange={(e) =>
                  setContractForm({
                    ...contractForm,
                    description: e.target.value,
                  })
                }
                placeholder="Enter contract description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractValue">Contract Value (₦)</Label>
                <Input
                  id="contractValue"
                  type="number"
                  value={contractForm.contractValue}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      contractValue: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="contractType">Contract Type</Label>
                <Select
                  value={contractForm.contractType}
                  onValueChange={(value) =>
                    setContractForm({ ...contractForm, contractType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Supply">Supply</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Consultancy">Consultancy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={contractForm.startDate}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={contractForm.endDate}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowContractModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateContract}>Create Contract</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractManagement;
