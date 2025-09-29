import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  CreditCard,
  FileText,
  Filter,
  Search,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  Banknote,
} from "lucide-react";
import {
  readMinistryData,
  writeMinistryData,
  getMinistryCodesWithData,
} from "@/lib/ministryStorageHelper";
import { useAuth } from "@/contexts/StaticAuthContext";
import { logUserAction } from "@/lib/auditLogStorage";

interface PaymentExecution {
  method: "TSA" | "Cheque" | "EFT" | "Remita" | "RTGS" | "Other";
  reference: string;
  amountTransferred: number;
  status: "Processing" | "Completed" | "Failed" | "On Hold";
  disbursementDate?: string;
  authorizedBy: string;
  authorizedRole: string;
  authorizedAt: string;
  comments?: string;
  reconciliation?: {
    approvedAmount: number;
    transferredAmount: number;
    discrepancy: number;
    reconciled: boolean;
  };
}

interface PaymentRequest {
  id: string;
  contractId: string;
  contractTitle: string;
  requestedAmount: number;
  workDescription: string;
  workPeriod: { from: string; to: string };
  milestoneId?: string;
  milestoneTitle?: string;
  supportingDocuments: any[];
  charges: { total: number };
  netAmount: number;
  totalAmount: number;
  status:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Ministry Approved"
    | "Finance Approved"
    | "Processing"
    | "On Hold"
    | "Failed"
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
    bankDetails: {
      accountName: string;
      accountNumber: string;
      bankName: string;
    };
  };
  ministryReviewer?: string;
  financeReviewer?: string;
  workCompletionPercentage: number;
  requestType: "Milestone" | "Interim" | "Final" | "Advance";
  invoiceNumber?: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  ministryCode?: string; // denormalized when aggregated
  paymentExecution?: PaymentExecution;
}

const MINISTRY_KEY = "paymentRequests_ministry";

function aggregateMinistryPaymentRequests(): PaymentRequest[] {
  const codes = getMinistryCodesWithData(MINISTRY_KEY);
  const all: PaymentRequest[] = [];
  codes.forEach((code) => {
    const list = readMinistryData<PaymentRequest[]>(MINISTRY_KEY, [], code).map(
      (r) => ({ ...r, ministryCode: code }),
    );
    all.push(...list);
  });
  return all;
}

export default function FinanceDashboard() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [execOpen, setExecOpen] = useState(false);

  // Execution form
  const [execForm, setExecForm] = useState<PaymentExecution>({
    method: "TSA",
    reference: "",
    amountTransferred: 0,
    status: "Processing",
    authorizedBy: userProfile?.name || "Finance Officer",
    authorizedRole: userProfile?.role || "finance",
    authorizedAt: new Date().toISOString(),
    comments: "",
  });

  const load = () => {
    const list = aggregateMinistryPaymentRequests();
    setRequests(list);
  };

  useEffect(() => {
    load();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.endsWith(`_${MINISTRY_KEY}`)) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
            ? r.status === "Ministry Approved" || r.status === "Under Review"
            : statusFilter === "approved"
              ? r.status === "Finance Approved"
              : statusFilter === "processing"
                ? r.status === "Processing"
                : statusFilter === "paid"
                  ? r.status === "Paid"
                  : statusFilter === "failed"
                    ? r.status === "Failed"
                    : statusFilter === "hold"
                      ? r.status === "On Hold"
                      : true;
      const matchesTerm = !term
        ? true
        : [
            r.id,
            r.contractTitle,
            r.companyDetails?.name,
            r.companyDetails?.email,
          ]
            .filter(Boolean)
            .some((s) => String(s).toLowerCase().includes(term));
      return matchesStatus && matchesTerm;
    });
  }, [requests, search, statusFilter]);

  const persistUpdate = (updated: PaymentRequest) => {
    const code = updated.ministryCode || "MOH";
    const list = readMinistryData<PaymentRequest[]>(MINISTRY_KEY, [], code);
    const newList = list.map((r) => (r.id === updated.id ? updated : r));
    writeMinistryData(MINISTRY_KEY, newList, code);

    try {
      const email = updated.companyDetails.email;
      const companyKey = `paymentRequests_${email}`;
      const companyList = JSON.parse(
        localStorage.getItem(companyKey) || "[]",
      ) as PaymentRequest[];
      const companyUpdated = companyList.map((r) =>
        r.id === updated.id ? updated : r,
      );
      localStorage.setItem(companyKey, JSON.stringify(companyUpdated));
    } catch {}
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const approveFinance = (r: PaymentRequest) => {
    const updated: PaymentRequest = {
      ...r,
      status: "Finance Approved",
      financeApprovalDate: new Date().toISOString(),
      financeReviewer: userProfile?.name || "Finance Officer",
    };
    persistUpdate(updated);
    logUserAction(
      userProfile?.name || "FinanceOfficer",
      "FINANCE_APPROVAL",
      "Payment",
      `Finance approved ${r.id}`,
      "MEDIUM",
      r.id,
      {
        ministryCode: r.ministryCode,
        amount: r.totalAmount,
        company: r.companyDetails?.email,
      },
    );
  };

  const openExecution = (r: PaymentRequest) => {
    setSelected(r);
    setExecForm({
      method: "TSA",
      reference: "",
      amountTransferred: r.totalAmount || r.netAmount || 0,
      status: "Processing",
      authorizedBy: userProfile?.name || "Finance Officer",
      authorizedRole: userProfile?.role || "finance",
      authorizedAt: new Date().toISOString(),
      comments: "",
    });
    setExecOpen(true);
  };

  const submitExecution = () => {
    if (!selected) return;
    const approved = selected.totalAmount || selected.netAmount || 0;
    const disbursed = execForm.amountTransferred;
    const status = execForm.status;
    const exec: PaymentExecution = {
      ...execForm,
      disbursementDate:
        status === "Completed" ? new Date().toISOString() : undefined,
      reconciliation: {
        approvedAmount: approved,
        transferredAmount: disbursed,
        discrepancy: Number((approved - disbursed).toFixed(2)),
        reconciled: Math.abs(approved - disbursed) < 0.01,
      },
    };

    const updated: PaymentRequest = {
      ...selected,
      paymentExecution: exec,
      status:
        status === "Completed"
          ? "Paid"
          : status === "Failed"
            ? "Failed"
            : status === "On Hold"
              ? "On Hold"
              : "Processing",
      paymentDate:
        status === "Completed" ? exec.disbursementDate : selected.paymentDate,
    };

    persistUpdate(updated);

    logUserAction(
      userProfile?.name || "FinanceOfficer",
      "PAYMENT_EXECUTION_RECORDED",
      "Payment",
      `Execution recorded for ${selected.id} via ${exec.method}`,
      exec.reconciliation && !exec.reconciliation.reconciled ? "HIGH" : "LOW",
      selected.id,
      {
        method: exec.method,
        reference: exec.reference,
        transferred: exec.amountTransferred,
        status: exec.status,
        discrepancy: exec.reconciliation?.discrepancy,
      },
    );

    setExecOpen(false);
    setSelected(null);
  };

  const markPaid = (r: PaymentRequest) => {
    const updated: PaymentRequest = {
      ...r,
      status: "Paid",
      paymentDate: new Date().toISOString(),
      paymentExecution: {
        method: r.paymentExecution?.method || "TSA",
        reference: r.paymentExecution?.reference || "",
        amountTransferred:
          r.paymentExecution?.amountTransferred ||
          r.totalAmount ||
          r.netAmount ||
          0,
        status: "Completed",
        disbursementDate: new Date().toISOString(),
        authorizedBy: userProfile?.name || "Finance Officer",
        authorizedRole: userProfile?.role || "finance",
        authorizedAt: new Date().toISOString(),
        comments: r.paymentExecution?.comments,
        reconciliation: {
          approvedAmount: r.totalAmount || r.netAmount || 0,
          transferredAmount:
            r.paymentExecution?.amountTransferred ||
            r.totalAmount ||
            r.netAmount ||
            0,
          discrepancy:
            (r.totalAmount || r.netAmount || 0) -
            (r.paymentExecution?.amountTransferred ||
              r.totalAmount ||
              r.netAmount ||
              0),
          reconciled: true,
        },
      },
    };
    persistUpdate(updated);
  };

  const reject = (r: PaymentRequest) => {
    const updated: PaymentRequest = { ...r, status: "Failed" };
    persistUpdate(updated);
  };

  const getStatusBadge = (status: PaymentRequest["status"]) => {
    const map: Record<string, string> = {
      Submitted: "bg-blue-100 text-blue-800",
      "Under Review": "bg-yellow-100 text-yellow-800",
      "Ministry Approved": "bg-purple-100 text-purple-800",
      "Finance Approved": "bg-green-100 text-green-800",
      Processing: "bg-amber-100 text-amber-800",
      "On Hold": "bg-orange-100 text-orange-800",
      Failed: "bg-red-100 text-red-800",
      Paid: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Draft: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={`${map[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </Badge>
    );
  };

  const pendingCount = requests.filter(
    (r) => r.status === "Ministry Approved" || r.status === "Under Review",
  ).length;
  const approvedCount = requests.filter(
    (r) => r.status === "Finance Approved",
  ).length;
  const processingCount = requests.filter(
    (r) => r.status === "Processing",
  ).length;
  const discrepancies = requests.filter(
    (r) => (r.paymentExecution?.reconciliation?.discrepancy || 0) !== 0,
  ).length;
  const paidTotal = requests
    .filter((r) => r.status === "Paid")
    .reduce((s, r) => s + (r.totalAmount || r.netAmount || 0), 0);

  return (
    <div className="min-h-screen governor-gradient-bg/20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shadow">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Finance Dashboard
              </h1>
              <p className="text-white/90 text-sm">
                Payments processing • Execution • Reconciliation • Audit
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="px-4 py-2 text-sm">
                Paid Total: ₦{paidTotal.toLocaleString()}
              </CardContent>
            </Card>
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="governor-card-hover">
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {pendingCount}
            </CardContent>
          </Card>
          <Card className="governor-card-hover">
            <CardHeader>
              <CardTitle>Finance Approved</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {approvedCount}
            </CardContent>
          </Card>
          <Card className="governor-card-hover">
            <CardHeader>
              <CardTitle>Processing</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {processingCount}
            </CardContent>
          </Card>
          <Card className="governor-card-hover">
            <CardHeader>
              <CardTitle>Discrepancies</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {discrepancies}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Finance Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by ID, company or contract"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reconciliation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-gray-500"
                    >
                      No requests
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => {
                    const d =
                      r.paymentExecution?.reconciliation?.discrepancy || 0;
                    const hasDisc = Math.abs(d) > 0.01;
                    return (
                      <TableRow key={r.id} className="hover:bg-gray-50">
                        <TableCell>
                          <button
                            className="text-green-700 underline"
                            onClick={() => {
                              setSelected(r);
                              setDetailsOpen(true);
                            }}
                          >
                            {r.id}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {r.companyDetails?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {r.companyDetails?.email}
                          </div>
                        </TableCell>
                        <TableCell>{r.contractTitle}</TableCell>
                        <TableCell>
                          ₦
                          {(r.totalAmount || r.netAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell>
                          {hasDisc ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              -₦{Math.abs(d).toLocaleString()}
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              OK
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveFinance(r)}
                            disabled={
                              r.status !== "Ministry Approved" &&
                              r.status !== "Under Review"
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openExecution(r)}
                            disabled={
                              !(
                                r.status === "Finance Approved" ||
                                r.status === "Processing" ||
                                r.status === "On Hold" ||
                                r.status === "Failed"
                              )
                            }
                          >
                            <Banknote className="h-4 w-4 mr-1" />
                            Record Execution
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPaid(r)}
                            disabled={r.status === "Paid"}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reject(r)}
                            disabled={r.status === "Paid"}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Fail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Request Details - {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Company</span>
                  <div className="font-medium">
                    {selected.companyDetails.name}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Contract</span>
                  <div className="font-medium">{selected.contractTitle}</div>
                </div>
                <div>
                  <span className="text-gray-500">Amount</span>
                  <div className="font-medium">
                    ₦
                    {(
                      selected.totalAmount ||
                      selected.netAmount ||
                      0
                    ).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Ministry</span>
                  <div className="font-medium">{selected.ministryCode}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <div className="mt-1">{getStatusBadge(selected.status)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Finance Reviewer</span>
                  <div>{selected.financeReviewer || "-"}</div>
                </div>
                <div>
                  <span className="text-gray-500">Finance Approval Date</span>
                  <div>
                    {selected.financeApprovalDate
                      ? new Date(selected.financeApprovalDate).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>
              {selected.paymentExecution && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Method</span>
                    <div>{selected.paymentExecution.method}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Reference</span>
                    <div className="font-mono">
                      {selected.paymentExecution.reference}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Transferred</span>
                    <div>
                      ₦
                      {selected.paymentExecution.amountTransferred.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Disbursed</span>
                    <div>
                      {selected.paymentExecution.disbursementDate
                        ? new Date(
                            selected.paymentExecution.disbursementDate,
                          ).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />{" "}
                {selected.supportingDocuments?.length || 0} documents attached
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Execution */}
      <Dialog open={execOpen} onOpenChange={setExecOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Record Payment Execution - {selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-600">Method</span>
                  <Select
                    value={execForm.method}
                    onValueChange={(v: PaymentExecution["method"]) =>
                      setExecForm((s) => ({ ...s, method: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TSA">TSA</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="EFT">EFT</SelectItem>
                      <SelectItem value="Remita">Remita</SelectItem>
                      <SelectItem value="RTGS">RTGS</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <span className="text-xs text-gray-600">Reference</span>
                  <Input
                    placeholder="e.g. TSA-2025-000123"
                    value={execForm.reference}
                    onChange={(e) =>
                      setExecForm((s) => ({ ...s, reference: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-600">
                    Amount Transferred (₦)
                  </span>
                  <Input
                    type="number"
                    value={execForm.amountTransferred}
                    onChange={(e) =>
                      setExecForm((s) => ({
                        ...s,
                        amountTransferred: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-600">
                    Execution Status
                  </span>
                  <Select
                    value={execForm.status}
                    onValueChange={(v: PaymentExecution["status"]) =>
                      setExecForm((s) => ({ ...s, status: v }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-600">Comments</span>
                <Input
                  placeholder="Notes, reason, or bank feedback"
                  value={execForm.comments}
                  onChange={(e) =>
                    setExecForm((s) => ({ ...s, comments: e.target.value }))
                  }
                />
              </div>
              {/* Reconciliation preview */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded border bg-gray-50">
                  <div className="text-gray-500">Approved</div>
                  <div className="font-semibold">
                    ₦
                    {(
                      selected.totalAmount ||
                      selected.netAmount ||
                      0
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded border bg-gray-50">
                  <div className="text-gray-500">Transferred</div>
                  <div className="font-semibold">
                    ₦{execForm.amountTransferred.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded border bg-gray-50">
                  <div className="text-gray-500">Discrepancy</div>
                  <div
                    className={`font-semibold ${Math.abs((selected.totalAmount || selected.netAmount || 0) - execForm.amountTransferred) > 0.01 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    ₦
                    {Math.abs(
                      (selected.totalAmount || selected.netAmount || 0) -
                        execForm.amountTransferred,
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setExecOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitExecution}>
                  <CreditCard className="h-4 w-4 mr-1" />
                  Save Execution
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
