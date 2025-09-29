import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Search, Clock, AlertTriangle, FileText, DollarSign, Building2, Calendar } from "lucide-react";
import { getMinistryCodesWithData, readMinistryData, writeMinistryData } from "@/lib/ministryStorageHelper";
import { formatCurrency } from "@/lib/utils";

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  sortCode?: string;
}

interface PaymentCharges {
  tenderFee: number;
  stampDuty: number;
  withholdingTax: number;
  educationTaxFund: number;
  vat: number;
  total: number;
}

interface PaymentDocument {
  id: string;
  name: string;
  type: "Invoice" | "Work Completion Certificate" | "Progress Report" | "Photos" | "Other";
  uploadDate: string;
  size: string;
  url?: string;
}

export interface PaymentRequest {
  id: string;
  contractId: string;
  contractTitle: string;
  requestedAmount: number;
  workDescription: string;
  workPeriod: { from: string; to: string };
  milestoneId?: string;
  milestoneTitle?: string;
  supportingDocuments: PaymentDocument[];
  charges: PaymentCharges;
  netAmount: number;
  totalAmount: number;
  status: "Draft" | "Submitted" | "Under Review" | "Ministry Approved" | "Finance Approved" | "Paid" | "Rejected";
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
  ministryComments?: string;
  financeComments?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  reviewDeadline?: string;
}

// Extend with the ministry source key for updates
type FinanceQueueItem = PaymentRequest & { __ministryCode: string };

const statusBadge = (status: PaymentRequest["status"]) => {
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

const statusIcon = (status: PaymentRequest["status"]) => {
  switch (status) {
    case "Submitted":
      return <Clock className="h-4 w-4" />;
    case "Under Review":
      return <AlertTriangle className="h-4 w-4" />;
    case "Ministry Approved":
    case "Finance Approved":
    case "Paid":
      return <CheckCircle className="h-4 w-4" />;
    case "Rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export default function FinanceDashboard() {
  const [queue, setQueue] = useState<FinanceQueueItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Ministry Approved");
  const [selected, setSelected] = useState<FinanceQueueItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadQueue = () => {
    try {
      const ministryCodes = getMinistryCodesWithData("paymentRequests_ministry");
      const all: FinanceQueueItem[] = [];
      ministryCodes.forEach((code) => {
        const list = readMinistryData<PaymentRequest[]>("paymentRequests_ministry", [], code);
        list.forEach((req) => {
          all.push({ ...(req as PaymentRequest), __ministryCode: code });
        });
      });
      setQueue(all);
    } catch (e) {
      console.error("Error loading finance queue", e);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const metrics = useMemo(() => {
    const total = queue.length;
    const ministryApproved = queue.filter((q) => q.status === "Ministry Approved").length;
    const financeApproved = queue.filter((q) => q.status === "Finance Approved").length;
    const paid = queue.filter((q) => q.status === "Paid").length;
    return { total, ministryApproved, financeApproved, paid };
  }, [queue]);

  const filtered = useMemo(() => {
    return queue.filter((q) => {
      const matchText =
        q.id.toLowerCase().includes(search.toLowerCase()) ||
        q.contractTitle.toLowerCase().includes(search.toLowerCase()) ||
        q.companyDetails.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : q.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [queue, search, statusFilter]);

  const updateEverywhere = (updated: FinanceQueueItem) => {
    // Update ministry store
    const ministryList = readMinistryData<PaymentRequest[]>("paymentRequests_ministry", [], updated.__ministryCode);
    const newMinistryList = ministryList.map((r) => (r.id === updated.id ? updated : r));
    writeMinistryData("paymentRequests_ministry", newMinistryList, updated.__ministryCode);

    // Update company copy
    try {
      const email = updated.companyDetails.email;
      const companyList = JSON.parse(localStorage.getItem(`paymentRequests_${email}`) || "[]") as PaymentRequest[];
      const newCompanyList = companyList.map((r) => (r.id === updated.id ? updated : r));
      localStorage.setItem(`paymentRequests_${email}`, JSON.stringify(newCompanyList));
    } catch (e) {
      console.error("Failed to update company copy", e);
    }
  };

  const handleFinanceApprove = (item: FinanceQueueItem) => {
    setLoading(true);
    const updated: FinanceQueueItem = {
      ...item,
      status: "Finance Approved",
      financeApprovalDate: new Date().toISOString(),
      financeReviewer: "Finance Officer",
    };
    updateEverywhere(updated);
    setLoading(false);
    loadQueue();
  };

  const handleMarkPaid = (item: FinanceQueueItem) => {
    setLoading(true);
    const updated: FinanceQueueItem = {
      ...item,
      status: "Paid",
      paymentDate: new Date().toISOString(),
    };
    updateEverywhere(updated);
    setLoading(false);
    loadQueue();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
              <p className="text-sm text-gray-600">Process ministry-approved payment requests and manage disbursements</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Total Requests</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{metrics.total}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Waiting for Finance</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-purple-700">{metrics.ministryApproved}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Finance Approved</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-emerald-700">{metrics.financeApproved}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Paid</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-emerald-700">{metrics.paid}</div></CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative w-full md:w-1/2">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, contract or company" className="pl-9" />
              </div>
              <div className="w-full md:w-64">
                <Label className="text-xs text-gray-600">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Ministry Approved">Ministry Approved</SelectItem>
                    <SelectItem value="Finance Approved">Finance Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">No requests found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{item.contractTitle}</div>
                        <div className="text-xs text-gray-500">{item.requestType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>{item.companyDetails.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(item.requestedAmount)}</div>
                        <div className="text-xs text-gray-500">Net: {formatCurrency(item.netAmount)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadge(item.status)}>
                          {statusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setSelected(item); setShowDetails(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.status === "Ministry Approved" && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading} onClick={() => handleFinanceApprove(item)}>
                              Approve
                            </Button>
                          )}
                          {item.status === "Finance Approved" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={loading} onClick={() => handleMarkPaid(item)}>
                              Mark Paid
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

        {/* Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>Payment Request Details - {selected.id}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 text-sm">
                    <div>
                      <Label className="text-gray-700">Contract</Label>
                      <div>{selected.contractTitle}</div>
                    </div>
                    <div>
                      <Label className="text-gray-700">Company</Label>
                      <div>{selected.companyDetails.name}</div>
                    </div>
                    <div>
                      <Label className="text-gray-700">Work Period</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {new Date(selected.workPeriod.from).toLocaleDateString()} - {new Date(selected.workPeriod.to).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700">Amount</Label>
                      <div>{formatCurrency(selected.requestedAmount)} (Net {formatCurrency(selected.netAmount)})</div>
                    </div>
                    <div>
                      <Label className="text-gray-700">Status</Label>
                      <Badge className={statusBadge(selected.status)}>
                        {statusIcon(selected.status)}
                        <span className="ml-1">{selected.status}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <Label className="text-gray-700">Work Description</Label>
                      <div className="whitespace-pre-wrap">{selected.workDescription}</div>
                    </div>
                    <div>
                      <Label className="text-gray-700">Bank Details</Label>
                      <div className="space-y-1">
                        <div><strong>Account:</strong> {selected.companyDetails.bankDetails.accountName}</div>
                        <div><strong>Number:</strong> {selected.companyDetails.bankDetails.accountNumber}</div>
                        <div><strong>Bank:</strong> {selected.companyDetails.bankDetails.bankName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
