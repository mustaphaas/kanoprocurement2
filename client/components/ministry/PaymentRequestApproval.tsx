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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Building2,
  User,
  Calendar,
  Receipt,
  Send,
  MessageSquare,
  Download,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  readMinistryData,
  writeMinistryData,
  getCurrentMinistryContext,
} from "@/lib/ministryStorageHelper";

// Import the PaymentRequest interface from the company component
interface PaymentRequest {
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
  // Ministry-specific fields
  ministryComments?: string;
  financeComments?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  reviewDeadline: string;
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

interface PaymentRequestApprovalProps {
  ministryCode?: string;
  ministryName?: string;
}

export default function PaymentRequestApproval({
  ministryCode,
  ministryName,
}: PaymentRequestApprovalProps) {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>(
    [],
  );
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");

  // Approval form states
  const [approvalAction, setApprovalAction] = useState<
    "approve" | "reject" | ""
  >("");
  const [approvalComments, setApprovalComments] = useState("");
  const [financeForwardFlag, setFinanceForwardFlag] = useState(true);

  const currentMinistry = getCurrentMinistryContext();
  const effectiveMinistryCode = ministryCode || currentMinistry.ministryCode;
  const effectiveMinistryName = ministryName || currentMinistry.ministryName;

  // Load payment requests on component mount
  useEffect(() => {
    loadPaymentRequests();
  }, [effectiveMinistryCode]);

  // Filter requests based on search and filter criteria
  useEffect(() => {
    let filtered = paymentRequests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.contractTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.companyDetails.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          req.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((req) => req.priority === priorityFilter);
    }

    // Date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRangeFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(
            (req) =>
              req.submittedDate && new Date(req.submittedDate) >= filterDate,
          );
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(
            (req) =>
              req.submittedDate && new Date(req.submittedDate) >= filterDate,
          );
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(
            (req) =>
              req.submittedDate && new Date(req.submittedDate) >= filterDate,
          );
          break;
      }
    }

    setFilteredRequests(filtered);
  }, [
    paymentRequests,
    searchTerm,
    statusFilter,
    priorityFilter,
    dateRangeFilter,
  ]);

  const loadPaymentRequests = () => {
    try {
      // Load payment requests for this ministry
      const ministryRequests = readMinistryData<PaymentRequest[]>(
        `paymentRequests_ministry`,
        [],
        effectiveMinistryCode,
      );

      // Also check for any new requests from companies that need to be imported
      const companies = ["approved@company.com", "company@example.com"]; // In real app, this would come from a proper source
      let allRequests = [...ministryRequests];

      companies.forEach((companyEmail) => {
        try {
          const companyRequests = JSON.parse(
            localStorage.getItem(`paymentRequests_${companyEmail}`) || "[]",
          ) as PaymentRequest[];

          // Find requests that should be in this ministry but aren't yet
          const relevantRequests = companyRequests.filter((req) => {
            // Extract ministry from contract title or use other logic to determine ministry
            const contractMinistry = determineMinistryFromContract(
              req.contractTitle,
            );
            return (
              contractMinistry === effectiveMinistryCode &&
              !allRequests.find((existingReq) => existingReq.id === req.id)
            );
          });

          if (relevantRequests.length > 0) {
            allRequests = [
              ...allRequests,
              ...relevantRequests.map((req) => ({
                ...req,
                status:
                  req.status === "Submitted"
                    ? ("Under Review" as const)
                    : req.status,
                priority: determinePriority(req),
                reviewDeadline: calculateReviewDeadline(req),
              })),
            ];
          }
        } catch (error) {
          console.error(`Error loading requests for ${companyEmail}:`, error);
        }
      });

      setPaymentRequests(allRequests);

      // Save the updated ministry requests
      if (allRequests.length !== ministryRequests.length) {
        writeMinistryData(
          `paymentRequests_ministry`,
          allRequests,
          effectiveMinistryCode,
        );
      }
    } catch (error) {
      console.error("Error loading payment requests:", error);
    }
  };

  // Helper function to determine ministry from contract title
  const determineMinistryFromContract = (contractTitle: string): string => {
    if (
      contractTitle.toLowerCase().includes("health") ||
      contractTitle.toLowerCase().includes("medical")
    ) {
      return "MOH";
    }
    if (
      contractTitle.toLowerCase().includes("road") ||
      contractTitle.toLowerCase().includes("infrastructure")
    ) {
      return "MOWI";
    }
    if (
      contractTitle.toLowerCase().includes("education") ||
      contractTitle.toLowerCase().includes("school")
    ) {
      return "MOE";
    }
    if (
      contractTitle.toLowerCase().includes("ict") ||
      contractTitle.toLowerCase().includes("technology")
    ) {
      return "MOST";
    }
    return "MOH"; // Default fallback
  };

  // Helper function to determine priority
  const determinePriority = (
    request: PaymentRequest,
  ): PaymentRequest["priority"] => {
    const amount = request.requestedAmount;
    if (amount >= 1000000000) return "Urgent"; // 1B+
    if (amount >= 500000000) return "High"; // 500M+
    if (amount >= 100000000) return "Medium"; // 100M+
    return "Low";
  };

  // Helper function to calculate review deadline
  const calculateReviewDeadline = (request: PaymentRequest): string => {
    const submittedDate = new Date(request.submittedDate || Date.now());
    const deadline = new Date(submittedDate);

    // Set deadline based on priority
    switch (request.priority || determinePriority(request)) {
      case "Urgent":
        deadline.setDate(submittedDate.getDate() + 2); // 2 days
        break;
      case "High":
        deadline.setDate(submittedDate.getDate() + 5); // 5 days
        break;
      case "Medium":
        deadline.setDate(submittedDate.getDate() + 10); // 10 days
        break;
      default:
        deadline.setDate(submittedDate.getDate() + 14); // 14 days
    }

    return deadline.toISOString();
  };

  const handleApproveRequest = () => {
    if (!selectedRequest || !approvalAction) return;

    setLoading(true);

    const updatedRequest: PaymentRequest = {
      ...selectedRequest,
      status: approvalAction === "approve" ? "Ministry Approved" : "Rejected",
      ministryApprovalDate: new Date().toISOString(),
      ministryReviewer: "Current User", // In real app, get from auth context
      ministryComments: approvalComments,
      rejectionReason:
        approvalAction === "reject" ? approvalComments : undefined,
    };

    // Update the payment requests list
    const updatedRequests = paymentRequests.map((req) =>
      req.id === selectedRequest.id ? updatedRequest : req,
    );

    setPaymentRequests(updatedRequests);

    // Save to ministry storage
    writeMinistryData(
      `paymentRequests_ministry`,
      updatedRequests,
      effectiveMinistryCode,
    );

    // Also update the company's copy
    try {
      const companyEmail = selectedRequest.companyDetails.email;
      const companyRequests = JSON.parse(
        localStorage.getItem(`paymentRequests_${companyEmail}`) || "[]",
      ) as PaymentRequest[];

      const updatedCompanyRequests = companyRequests.map((req) =>
        req.id === selectedRequest.id ? updatedRequest : req,
      );

      localStorage.setItem(
        `paymentRequests_${companyEmail}`,
        JSON.stringify(updatedCompanyRequests),
      );
    } catch (error) {
      console.error("Error updating company payment request:", error);
    }

    // If approved and flagged for finance, create finance notification (would be real integration in production)
    if (approvalAction === "approve" && financeForwardFlag) {
      console.log("Payment request forwarded to Finance:", updatedRequest);
      // Here you would typically send to finance system or create finance workflow
    }

    // Reset modal states
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setApprovalAction("");
    setApprovalComments("");
    setFinanceForwardFlag(true);
    setLoading(false);
  };

  const getStatusColor = (status: PaymentRequest["status"]) => {
    switch (status) {
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

  const getPriorityColor = (priority: PaymentRequest["priority"]) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const pendingApprovalCount = paymentRequests.filter(
    (req) => req.status === "Submitted" || req.status === "Under Review",
  ).length;

  const overdueCount = paymentRequests.filter(
    (req) =>
      (req.status === "Submitted" || req.status === "Under Review") &&
      isOverdue(req.reviewDeadline),
  ).length;

  const totalValuePending = paymentRequests
    .filter(
      (req) => req.status === "Submitted" || req.status === "Under Review",
    )
    .reduce((sum, req) => sum + req.requestedAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Payment Request Approvals
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Review and approve payment requests from contractors -{" "}
                  {effectiveMinistryName}
                </p>
              </div>
            </div>
            <Button
              onClick={loadPaymentRequests}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {pendingApprovalCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">
                  {overdueCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Value Pending
                </p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalValuePending)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Approved This Month
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {
                    paymentRequests.filter(
                      (req) =>
                        req.status === "Ministry Approved" &&
                        req.ministryApprovalDate &&
                        new Date(req.ministryApprovalDate).getMonth() ===
                          new Date().getMonth(),
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search by contract, company, or request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Ministry Approved">
                  Ministry Approved
                </SelectItem>
                <SelectItem value="Finance Approved">
                  Finance Approved
                </SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No payment requests found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className={
                      isOverdue(request.reviewDeadline) &&
                      (request.status === "Submitted" ||
                        request.status === "Under Review")
                        ? "bg-red-50"
                        : ""
                    }
                  >
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.companyDetails.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.companyDetails.email}
                        </div>
                      </div>
                    </TableCell>
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
                      <Badge
                        variant="outline"
                        className={getPriorityColor(request.priority)}
                      >
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className={
                          isOverdue(request.reviewDeadline) &&
                          (request.status === "Submitted" ||
                            request.status === "Under Review")
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {new Date(request.reviewDeadline).toLocaleDateString()}
                        {isOverdue(request.reviewDeadline) &&
                          (request.status === "Submitted" ||
                            request.status === "Under Review") && (
                            <div className="text-xs text-red-500">Overdue</div>
                          )}
                      </div>
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
                        {(request.status === "Submitted" ||
                          request.status === "Under Review") && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApprovalModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Review
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
                      Company
                    </Label>
                    <p className="text-sm">
                      {selectedRequest.companyDetails.name}
                    </p>
                  </div>

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
                      Status & Priority
                    </Label>
                    <div className="flex space-x-2 mt-1">
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1">{selectedRequest.status}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(selectedRequest.priority)}
                      >
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                  </div>

                  {selectedRequest.ministryComments && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Ministry Comments
                      </Label>
                      <p className="text-sm">
                        {selectedRequest.ministryComments}
                      </p>
                    </div>
                  )}

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

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Review Payment Request - {selectedRequest.id}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Request Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <p className="font-medium">
                        {selectedRequest.companyDetails.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-medium">
                        {formatCurrency(selectedRequest.requestedAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Contract:</span>
                      <p className="font-medium">
                        {selectedRequest.contractTitle}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Net Amount:</span>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedRequest.netAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="approvalAction">Decision *</Label>
                  <Select
                    value={approvalAction}
                    onValueChange={(value: "approve" | "reject") =>
                      setApprovalAction(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Approve Payment Request
                        </div>
                      </SelectItem>
                      <SelectItem value="reject">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Reject Payment Request
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="comments">
                    {approvalAction === "approve"
                      ? "Approval Comments"
                      : "Rejection Reason"}{" "}
                    *
                  </Label>
                  <Textarea
                    id="comments"
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    placeholder={
                      approvalAction === "approve"
                        ? "Add any comments or conditions for approval..."
                        : "Provide detailed reason for rejection..."
                    }
                    rows={4}
                  />
                </div>

                {approvalAction === "approve" && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="financeForward"
                      checked={financeForwardFlag}
                      onChange={(e) => setFinanceForwardFlag(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="financeForward" className="text-sm">
                      Forward to Finance for final approval and payment
                      processing
                    </label>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApproveRequest}
                    disabled={
                      loading || !approvalAction || !approvalComments.trim()
                    }
                    className={
                      approvalAction === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {loading
                      ? "Processing..."
                      : approvalAction === "approve"
                        ? "Approve Request"
                        : "Reject Request"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
