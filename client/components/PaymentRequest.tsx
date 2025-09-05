import React, { useState, useEffect } from "react";
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
import {
  CreditCard,
  Plus,
  Eye,
  FileText,
  Upload,
  Calculator,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt,
  DollarSign,
  Building2,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/StaticAuthContext";
import { formatCurrency } from "@/lib/utils";
import { getAllMinistries } from "@shared/ministries";

// Payment Request Interfaces
export interface PaymentRequest {
  id: string;
  contractId: string;
  contractTitle: string;
  requestedAmount: number;
  workDescription: string;
  workPeriod: {
    from: string;
    to: string;
  };
  milestoneId?: string;
  milestoneTitle?: string;
  supportingDocuments: PaymentDocument[];
  charges: PaymentCharges;
  netAmount: number;
  totalAmount: number;
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Ministry Approved"
    | "Finance Approved"
    | "Paid"
    | "Rejected";
  submittedDate?: string;
  ministryApprovalDate?: string;
  financeApprovalDate?: string;
  paymentDate?: string;
  rejectionReason?: string;
  companyDetails: {
    name: string;
    email: string;
    contactPerson: string;
    bankDetails: BankDetails;
  };
  ministryReviewer?: string;
  financeReviewer?: string;
  workCompletionPercentage: number;
  requestType: "Milestone" | "Interim" | "Final" | "Advance";
  invoiceNumber?: string;
  ministryCode?: string;
}

interface PaymentDocument {
  id: string;
  name: string;
  type:
    | "Invoice"
    | "Work Completion Certificate"
    | "Progress Report"
    | "Photos"
    | "Other";
  uploadDate: string;
  size: string;
  url?: string;
}

interface PaymentCharges {
  tenderFee: number; // 2%
  stampDuty: number; // 1%
  withholdingTax: number; // 2.5%
  educationTaxFund: number; // 2%
  vat: number; // 7.5%
  total: number;
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  sortCode?: string;
}

interface Contract {
  id: string;
  title: string;
  contractValue: number;
  ministry: string;
  status: "Active" | "Completed" | "Terminated";
  milestones: Array<{
    id: string;
    title: string;
    percentage: number;
    status: "Pending" | "In Progress" | "Completed";
    dueDate: string;
  }>;
}

// Calculate payment charges
const calculateCharges = (amount: number): PaymentCharges => {
  const tenderFee = amount * 0.02; // 2%
  const stampDuty = amount * 0.01; // 1%
  const withholdingTax = amount * 0.025; // 2.5%
  const educationTaxFund = amount * 0.02; // 2%
  const vat = amount * 0.075; // 7.5%

  const total = tenderFee + stampDuty + withholdingTax + educationTaxFund + vat;

  return {
    tenderFee,
    stampDuty,
    withholdingTax,
    educationTaxFund,
    vat,
    total,
  };
};

interface PaymentRequestProps {
  companyEmail: string;
  companyName: string;
}

export default function PaymentRequest({
  companyEmail,
  companyName,
}: PaymentRequestProps) {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    contractId: "",
    requestedAmount: 0,
    workDescription: "",
    workPeriodFrom: "",
    workPeriodTo: "",
    milestoneId: "none",
    workCompletionPercentage: 0,
    requestType: "Interim" as PaymentRequest["requestType"],
    invoiceNumber: "",
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      sortCode: "",
    } as BankDetails,
  });

  const [documents, setDocuments] = useState<PaymentDocument[]>([]);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadPaymentRequests();
    loadContracts();
  }, [companyEmail]);

  const loadPaymentRequests = () => {
    try {
      const key = `paymentRequests_${companyEmail}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setPaymentRequests(JSON.parse(stored));
        return;
      }
      // Seed sample requests for testing across ministries when none exist
      const samples: PaymentRequest[] = [
        {
          id: `PR-${Date.now()}-MOH`,
          contractId: "CON-2024-002",
          contractTitle: "Hospital Equipment Supply",
          requestedAmount: 120000000,
          workDescription: "Delivery of diagnostic equipment and initial training",
          workPeriod: { from: "2024-01-01", to: "2024-01-31" },
          supportingDocuments: [],
          charges: calculateCharges(120000000),
          netAmount: 120000000 - calculateCharges(120000000).total,
          totalAmount: 120000000,
          status: "Submitted",
          submittedDate: new Date().toISOString(),
          companyDetails: { name: companyName, email: companyEmail, contactPerson: "", bankDetails: { accountName: "", accountNumber: "", bankName: "" } },
          workCompletionPercentage: 50,
          requestType: "Interim",
          invoiceNumber: "INV-MOH-001",
          ministryCode: "MOH",
        },
        {
          id: `PR-${Date.now()}-MOWI`,
          contractId: "CON-2024-001",
          contractTitle: "Urban Road Expansion - Phase 1",
          requestedAmount: 300000000,
          workDescription: "Completed earthworks & drainage for sections A-C",
          workPeriod: { from: "2024-02-01", to: "2024-02-28" },
          supportingDocuments: [],
          charges: calculateCharges(300000000),
          netAmount: 300000000 - calculateCharges(300000000).total,
          totalAmount: 300000000,
          status: "Under Review",
          submittedDate: new Date().toISOString(),
          companyDetails: { name: companyName, email: companyEmail, contactPerson: "", bankDetails: { accountName: "", accountNumber: "", bankName: "" } },
          workCompletionPercentage: 55,
          requestType: "Milestone",
          invoiceNumber: "INV-MOWI-001",
          ministryCode: "MOWI",
        },
        {
          id: `PR-${Date.now()}-MOE`,
          contractId: "CON-2024-003",
          contractTitle: "School Renovation & Furniture Supply",
          requestedAmount: 80000000,
          workDescription: "Structural repairs completed for 10 schools",
          workPeriod: { from: "2024-01-15", to: "2024-02-10" },
          supportingDocuments: [],
          charges: calculateCharges(80000000),
          netAmount: 80000000 - calculateCharges(80000000).total,
          totalAmount: 80000000,
          status: "Submitted",
          submittedDate: new Date().toISOString(),
          companyDetails: { name: companyName, email: companyEmail, contactPerson: "", bankDetails: { accountName: "", accountNumber: "", bankName: "" } },
          workCompletionPercentage: 30,
          requestType: "Interim",
          invoiceNumber: "INV-MOE-001",
          ministryCode: "MOE",
        },
      ];
      localStorage.setItem(key, JSON.stringify(samples));
      setPaymentRequests(samples);
    } catch (error) {
      console.error("Error loading payment requests:", error);
    }
  };

  const loadContracts = () => {
    // Mock contract data across supported ministries
    const mockContracts: Contract[] = [
      {
        id: "CON-2024-001",
        title: "Urban Road Expansion - Phase 1",
        contractValue: 4200000000,
        ministry: "Ministry of Works and Infrastructure",
        status: "Active",
        milestones: [
          { id: "M1", title: "Survey & Design", percentage: 20, status: "Completed", dueDate: "2024-01-31" },
          { id: "M2", title: "Earthworks & Drainage", percentage: 35, status: "In Progress", dueDate: "2024-03-15" },
          { id: "M3", title: "Pavement & Surfacing", percentage: 35, status: "Pending", dueDate: "2024-05-30" },
          { id: "M4", title: "Markings & Handover", percentage: 10, status: "Pending", dueDate: "2024-06-30" },
        ],
      },
      {
        id: "CON-2024-002",
        title: "Hospital Equipment Supply",
        contractValue: 850000000,
        ministry: "Ministry of Health",
        status: "Active",
        milestones: [
          { id: "M1", title: "Equipment Procurement", percentage: 50, status: "Completed", dueDate: "2024-01-31" },
          { id: "M2", title: "Installation and Training", percentage: 50, status: "In Progress", dueDate: "2024-03-31" },
        ],
      },
      {
        id: "CON-2024-003",
        title: "School Renovation & Furniture Supply",
        contractValue: 650000000,
        ministry: "Ministry of Education",
        status: "Active",
        milestones: [
          { id: "M1", title: "Structural Repairs", percentage: 30, status: "In Progress", dueDate: "2024-02-28" },
          { id: "M2", title: "Furniture Production", percentage: 40, status: "Pending", dueDate: "2024-04-15" },
          { id: "M3", title: "Delivery & Installation", percentage: 30, status: "Pending", dueDate: "2024-05-31" },
        ],
      },
      {
        id: "CON-2024-004",
        title: "Bridge Rehabilitation Program",
        contractValue: 1900000000,
        ministry: "Ministry of Works and Infrastructure",
        status: "Active",
        milestones: [
          { id: "M1", title: "Structural Assessment", percentage: 25, status: "Completed", dueDate: "2024-01-20" },
          { id: "M2", title: "Reinforcement & Decking", percentage: 50, status: "In Progress", dueDate: "2024-03-25" },
          { id: "M3", title: "Finishing & Load Tests", percentage: 25, status: "Pending", dueDate: "2024-05-10" },
        ],
      },
    ];
    setContracts(mockContracts);
  };

  const savePaymentRequests = (requests: PaymentRequest[]) => {
    try {
      localStorage.setItem(
        `paymentRequests_${companyEmail}`,
        JSON.stringify(requests),
      );
      setPaymentRequests(requests);
    } catch (error) {
      console.error("Error saving payment requests:", error);
    }
  };

  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF, JPG, or PNG file");
        return;
      }

      setInvoiceFile(file);
    }
  };

  const resolveMinistryCode = (ministryName: string): string => {
    try {
      const ministries = getAllMinistries();
      const exact = ministries.find(
        (m) => m.name.toLowerCase() === ministryName.toLowerCase(),
      );
      if (exact) return exact.code;
      const lowered = ministryName.toLowerCase();
      if (lowered.includes("works")) return "MOWI";
      if (lowered.includes("education")) return "MOE";
      if (lowered.includes("health")) return "MOH";
      return "";
    } catch {
      return "";
    }
  };

  const handleCreateRequest = async () => {
    if (
      !formData.contractId ||
      !formData.requestedAmount ||
      !formData.workDescription ||
      !invoiceFile
    ) {
      alert("Please fill in all required fields including invoice attachment");
      return;
    }

    setLoading(true);

    const selectedContract = contracts.find(
      (c) => c.id === formData.contractId,
    );
    if (!selectedContract) {
      alert("Selected contract not found");
      setLoading(false);
      return;
    }

    const charges = calculateCharges(formData.requestedAmount);
    const netAmount = formData.requestedAmount - charges.total;

    // Convert file to base64 for storage
    let invoiceDocument: PaymentDocument | null = null;
    if (invoiceFile) {
      try {
        const base64 = await fileToBase64(invoiceFile);
        invoiceDocument = {
          id: `DOC-${Date.now()}`,
          name: invoiceFile.name,
          type: "Invoice",
          uploadDate: new Date().toISOString(),
          size: formatFileSize(invoiceFile.size),
          url: base64, // Store as base64 for now
        };
      } catch (error) {
        alert("Error processing invoice file. Please try again.");
        setLoading(false);
        return;
      }
    }

    const newRequest: PaymentRequest = {
      id: `PR-${Date.now()}`,
      contractId: formData.contractId,
      contractTitle: selectedContract.title,
      requestedAmount: formData.requestedAmount,
      workDescription: formData.workDescription,
      workPeriod: {
        from: formData.workPeriodFrom,
        to: formData.workPeriodTo,
      },
      milestoneId:
        formData.milestoneId && formData.milestoneId !== "none"
          ? formData.milestoneId
          : undefined,
      milestoneTitle:
        formData.milestoneId && formData.milestoneId !== "none"
          ? selectedContract.milestones.find(
              (m) => m.id === formData.milestoneId,
            )?.title
          : undefined,
      supportingDocuments: invoiceDocument
        ? [invoiceDocument, ...documents]
        : documents,
      charges,
      netAmount,
      totalAmount: formData.requestedAmount,
      status: "Draft",
      companyDetails: {
        name: companyName,
        email: companyEmail,
        contactPerson: "", // Would be filled from user profile
        bankDetails: formData.bankDetails,
      },
      workCompletionPercentage: formData.workCompletionPercentage,
      requestType: formData.requestType,
      invoiceNumber: formData.invoiceNumber,
      ministryCode: resolveMinistryCode(selectedContract.ministry),
    };

    const updatedRequests = [...paymentRequests, newRequest];
    savePaymentRequests(updatedRequests);

    // Reset form
    setFormData({
      contractId: "",
      requestedAmount: 0,
      workDescription: "",
      workPeriodFrom: "",
      workPeriodTo: "",
      milestoneId: "none",
      workCompletionPercentage: 0,
      requestType: "Interim",
      invoiceNumber: "",
      bankDetails: {
        accountName: "",
        accountNumber: "",
        bankName: "",
        sortCode: "",
      },
    });
    setDocuments([]);
    setInvoiceFile(null);
    setShowCreateModal(false);
    setLoading(false);
  };

  const handleSubmitRequest = (requestId: string) => {
    const updatedRequests = paymentRequests.map((req) => {
      if (req.id === requestId) {
        return {
          ...req,
          status: "Submitted" as const,
          submittedDate: new Date().toISOString(),
        };
      }
      return req;
    });
    savePaymentRequests(updatedRequests);
  };

  const getStatusColor = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Ministry Approved":
        return "bg-purple-100 text-purple-800";
      case "Finance Approved":
        return "bg-green-100 text-green-800";
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "Draft":
        return <FileText className="h-4 w-4" />;
      case "Submitted":
        return <Clock className="h-4 w-4" />;
      case "Under Review":
        return <AlertTriangle className="h-4 w-4" />;
      case "Ministry Approved":
        return <CheckCircle className="h-4 w-4" />;
      case "Finance Approved":
        return <CheckCircle className="h-4 w-4" />;
      case "Paid":
        return <CheckCircle className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Helper functions
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const selectedContract = formData.contractId
    ? contracts.find((c) => c.id === formData.contractId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Payment Requests</CardTitle>
                <p className="text-sm text-gray-600">
                  Request payments for completed work and milestones
                </p>
              </div>
            </div>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Payment Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Payment Request</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contract">Contract *</Label>
                      <Select
                        value={formData.contractId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            contractId: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract" />
                        </SelectTrigger>
                        <SelectContent>
                          {contracts.map((contract) => (
                            <SelectItem key={contract.id} value={contract.id}>
                              {contract.title} -{" "}
                              {formatCurrency(contract.contractValue)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedContract && (
                      <div>
                        <Label htmlFor="milestone">Milestone (Optional)</Label>
                        <Select
                          value={formData.milestoneId}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              milestoneId: value === "none" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select milestone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              No specific milestone
                            </SelectItem>
                            {selectedContract.milestones.map((milestone) => (
                              <SelectItem
                                key={milestone.id}
                                value={milestone.id}
                              >
                                {milestone.title} ({milestone.percentage}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="requestType">Request Type *</Label>
                      <Select
                        value={formData.requestType}
                        onValueChange={(value: PaymentRequest["requestType"]) =>
                          setFormData((prev) => ({
                            ...prev,
                            requestType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Advance">
                            Advance Payment
                          </SelectItem>
                          <SelectItem value="Interim">
                            Interim Payment
                          </SelectItem>
                          <SelectItem value="Milestone">
                            Milestone Payment
                          </SelectItem>
                          <SelectItem value="Final">Final Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Requested Amount (₦) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.requestedAmount || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            requestedAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="Enter amount"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="workPeriodFrom">
                          Work Period From *
                        </Label>
                        <Input
                          id="workPeriodFrom"
                          type="date"
                          value={formData.workPeriodFrom}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              workPeriodFrom: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="workPeriodTo">Work Period To *</Label>
                        <Input
                          id="workPeriodTo"
                          type="date"
                          value={formData.workPeriodTo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              workPeriodTo: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="completion">Work Completion %</Label>
                      <Input
                        id="completion"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.workCompletionPercentage || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workCompletionPercentage:
                              parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="Percentage completed"
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            invoiceNumber: e.target.value,
                          }))
                        }
                        placeholder="Invoice reference number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="invoiceFile">Invoice Attachment *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload invoice document
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            Accepted formats: PDF, JPG, PNG (Max 10MB)
                          </p>
                          <input
                            type="file"
                            id="invoiceFile"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleInvoiceFileChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("invoiceFile")?.click()
                            }
                            className="mb-2"
                          >
                            Choose File
                          </Button>
                          {invoiceFile && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-green-600" />
                                  <span className="text-green-800">
                                    {invoiceFile.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setInvoiceFile(null)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  ×
                                </button>
                              </div>
                              <p className="text-green-600 mt-1">
                                Size:{" "}
                                {(invoiceFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="workDescription">
                        Work Description *
                      </Label>
                      <Textarea
                        id="workDescription"
                        value={formData.workDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workDescription: e.target.value,
                          }))
                        }
                        placeholder="Describe the work completed for this payment request"
                        rows={4}
                      />
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Bank Details
                      </Label>
                      <div className="grid grid-cols-1 gap-3">
                        <Input
                          placeholder="Account Name"
                          value={formData.bankDetails.accountName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bankDetails: {
                                ...prev.bankDetails,
                                accountName: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          placeholder="Account Number"
                          value={formData.bankDetails.accountNumber}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bankDetails: {
                                ...prev.bankDetails,
                                accountNumber: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          placeholder="Bank Name"
                          value={formData.bankDetails.bankName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bankDetails: {
                                ...prev.bankDetails,
                                bankName: e.target.value,
                              },
                            }))
                          }
                        />
                        <Input
                          placeholder="Sort Code (Optional)"
                          value={formData.bankDetails.sortCode}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bankDetails: {
                                ...prev.bankDetails,
                                sortCode: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Payment Calculation */}
                    {formData.requestedAmount > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            <Calculator className="h-4 w-4 mr-2" />
                            Payment Breakdown
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {(() => {
                            const charges = calculateCharges(
                              formData.requestedAmount,
                            );
                            const netAmount =
                              formData.requestedAmount - charges.total;
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span>Requested Amount:</span>
                                  <span className="font-medium">
                                    {formatCurrency(formData.requestedAmount)}
                                  </span>
                                </div>
                                <div className="border-t pt-2 space-y-1 text-xs text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Tender Fee (2%):</span>
                                    <span>
                                      -{formatCurrency(charges.tenderFee)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Stamp Duty (1%):</span>
                                    <span>
                                      -{formatCurrency(charges.stampDuty)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>WHT (2.5%):</span>
                                    <span>
                                      -{formatCurrency(charges.withholdingTax)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>ETF (2%):</span>
                                    <span>
                                      -
                                      {formatCurrency(charges.educationTaxFund)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>VAT (7.5%):</span>
                                    <span>-{formatCurrency(charges.vat)}</span>
                                  </div>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-medium text-green-600">
                                  <span>Net Amount:</span>
                                  <span>{formatCurrency(netAmount)}</span>
                                </div>
                              </>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRequest}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Payment Requests List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No payment requests found. Create your first payment request
                    above.
                  </TableCell>
                </TableRow>
              ) : (
                paymentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.contractTitle}
                        </div>
                        {request.milestoneTitle && (
                          <div className="text-sm text-gray-500">
                            {request.milestoneTitle}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(request.requestedAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Net: {formatCurrency(request.netAmount)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.requestType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.submittedDate
                        ? new Date(request.submittedDate).toLocaleDateString()
                        : "Draft"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === "Draft" && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmitRequest(request.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Request Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Payment Request Details - {selectedRequest.id}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Contract
                    </Label>
                    <p className="text-sm">{selectedRequest.contractTitle}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Work Description
                    </Label>
                    <p className="text-sm">{selectedRequest.workDescription}</p>
                  </div>

                  {selectedRequest.supportingDocuments.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Supporting Documents
                      </Label>
                      <div className="space-y-2 mt-2">
                        {selectedRequest.supportingDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center space-x-2 p-2 bg-gray-50 rounded border"
                          >
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.type} • {doc.size} •{" "}
                                {new Date(doc.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                            {doc.url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Create a link to download/view the file
                                  const link = document.createElement("a");
                                  link.href = doc.url;
                                  link.download = doc.name;
                                  link.click();
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Work Period
                      </Label>
                      <p className="text-sm">
                        {new Date(
                          selectedRequest.workPeriod.from,
                        ).toLocaleDateString()}{" "}
                        -
                        {new Date(
                          selectedRequest.workPeriod.to,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Completion
                      </Label>
                      <p className="text-sm">
                        {selectedRequest.workCompletionPercentage}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Bank Details
                    </Label>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Account:</strong>{" "}
                        {selectedRequest.companyDetails.bankDetails.accountName}
                      </p>
                      <p>
                        <strong>Number:</strong>{" "}
                        {
                          selectedRequest.companyDetails.bankDetails
                            .accountNumber
                        }
                      </p>
                      <p>
                        <strong>Bank:</strong>{" "}
                        {selectedRequest.companyDetails.bankDetails.bankName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">
                        Payment Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Requested Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedRequest.requestedAmount)}
                        </span>
                      </div>
                      <div className="border-t pt-2 space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Tender Fee (2%):</span>
                          <span>
                            -{formatCurrency(selectedRequest.charges.tenderFee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stamp Duty (1%):</span>
                          <span>
                            -{formatCurrency(selectedRequest.charges.stampDuty)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>WHT (2.5%):</span>
                          <span>
                            -
                            {formatCurrency(
                              selectedRequest.charges.withholdingTax,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ETF (2%):</span>
                          <span>
                            -
                            {formatCurrency(
                              selectedRequest.charges.educationTaxFund,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT (7.5%):</span>
                          <span>
                            -{formatCurrency(selectedRequest.charges.vat)}
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium text-green-600">
                        <span>Net Amount:</span>
                        <span>{formatCurrency(selectedRequest.netAmount)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Status
                    </Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1">{selectedRequest.status}</span>
                    </Badge>
                  </div>

                  {selectedRequest.rejectionReason && (
                    <div>
                      <Label className="text-sm font-medium text-red-700">
                        Rejection Reason
                      </Label>
                      <p className="text-sm text-red-600">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
