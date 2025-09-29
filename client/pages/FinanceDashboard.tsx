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
} from "lucide-react";
import {
  readMinistryData,
  writeMinistryData,
  getMinistryCodesWithData,
} from "@/lib/ministryStorageHelper";

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
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
              : statusFilter === "paid"
                ? r.status === "Paid"
                : statusFilter === "rejected"
                  ? r.status === "Rejected"
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
    // update ministry bucket
    const code = updated.ministryCode || "MOH";
    const list = readMinistryData<PaymentRequest[]>(MINISTRY_KEY, [], code);
    const newList = list.map((r) => (r.id === updated.id ? updated : r));
    writeMinistryData(MINISTRY_KEY, newList, code);

    // update company copy
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
    load();
  };

  const approveFinance = (r: PaymentRequest) => {
    const updated: PaymentRequest = {
      ...r,
      status: "Finance Approved",
      financeApprovalDate: new Date().toISOString(),
      financeReviewer: "Finance Officer",
    };
    persistUpdate(updated);
  };

  const markPaid = (r: PaymentRequest) => {
    const updated: PaymentRequest = {
      ...r,
      status: "Paid",
      paymentDate: new Date().toISOString(),
    };
    persistUpdate(updated);
  };

  const reject = (r: PaymentRequest) => {
    const updated: PaymentRequest = { ...r, status: "Rejected" };
    persistUpdate(updated);
  };

  const getStatusBadge = (status: PaymentRequest["status"]) => {
    const map: Record<string, string> = {
      Submitted: "bg-blue-100 text-blue-800",
      "Under Review": "bg-yellow-100 text-yellow-800",
      "Ministry Approved": "bg-purple-100 text-purple-800",
      "Finance Approved": "bg-green-100 text-green-800",
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
  const paidTotal = requests
    .filter((r) => r.status === "Paid")
    .reduce((s, r) => s + (r.totalAmount || r.netAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> Finance Dashboard
        </h1>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {pendingCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Finance Approved</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {approvedCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ₦{paidTotal.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Finance Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-gray-500"
                  >
                    No requests
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
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
                      ₦{(r.totalAmount || r.netAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(r.status)}</TableCell>
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
                        onClick={() => markPaid(r)}
                        disabled={r.status !== "Finance Approved"}
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
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Ministry Approval Date</span>
                  <div>
                    {selected.ministryApprovalDate
                      ? new Date(selected.ministryApprovalDate).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Payment Date</span>
                  <div>
                    {selected.paymentDate
                      ? new Date(selected.paymentDate).toLocaleString()
                      : "-"}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Work Description</span>
                <div className="mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded border">
                  {selected.workDescription}
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />{" "}
                {selected.supportingDocuments?.length || 0} documents attached
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
