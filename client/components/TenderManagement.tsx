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
  AlertTriangle,
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

// Types
interface Tender {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "Draft" | "Published" | "Open" | "Closed" | "Evaluated" | "Awarded";
  createdDate: string;
  publishedDate?: string;
  closingDate?: string;
  openingDate?: string;
  ministry: string;
  department: string;
  tenderType: "Open" | "Selective" | "Limited";
  procurementMethod: "NCB" | "ICB" | "QCBS" | "CQS" | "SSS";
  documents: TenderDocument[];
  amendments: TenderAmendment[];
  bidders: Bidder[];
  evaluation: TenderEvaluation;
  timeline: TenderTimelineEvent[];
}

interface TenderDocument {
  id: string;
  name: string;
  type: "RFP" | "TOR" | "BOQ" | "Eligibility" | "Technical" | "Other";
  size: string;
  uploadDate: string;
  downloadCount: number;
}

interface TenderAmendment {
  id: string;
  title: string;
  description: string;
  amendmentDate: string;
  documents: TenderDocument[];
}

interface Bidder {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  submissionDate?: string;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  status: "Interested" | "Submitted" | "Qualified" | "Disqualified" | "Awarded";
  documents: BidDocument[];
}

interface BidDocument {
  id: string;
  name: string;
  type: "Technical" | "Financial" | "Supporting";
  submitDate: string;
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected";
}

interface TenderEvaluation {
  id: string;
  technicalCriteria: EvaluationCriteria[];
  financialCriteria: EvaluationCriteria[];
  committee: CommitteeMember[];
  technicalThreshold: number;
  financialWeight: number;
  technicalWeight: number;
  status: "Not Started" | "Technical" | "Financial" | "Combined" | "Complete";
}

interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  description: string;
}

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  department: string;
  isChairman: boolean;
  conflictDeclared: boolean;
}

interface TenderTimelineEvent {
  id: string;
  event: string;
  date: string;
  status: "Upcoming" | "Current" | "Completed" | "Overdue";
  description: string;
}

// Storage keys
const STORAGE_KEYS = {
  TENDERS: "kanoproc_tenders",
  TENDER_DOCUMENTS: "kanoproc_tender_documents",
  BIDDERS: "kanoproc_bidders",
  EVALUATIONS: "kanoproc_evaluations",
};

const TenderManagement = () => {
  const [activeTab, setActiveTab] = useState("creation");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showTenderModal, setShowTenderModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Form states
  const [tenderForm, setTenderForm] = useState({
    title: "",
    description: "",
    budget: "",
    tenderType: "Open",
    procurementMethod: "NCB",
    closingDate: "",
    documents: [] as File[],
  });

  const [amendmentForm, setAmendmentForm] = useState({
    title: "",
    description: "",
    documents: [] as File[],
  });

  // Load data from localStorage
  useEffect(() => {
    const loadFromStorage = (key: string) => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    };

    setTenders(loadFromStorage(STORAGE_KEYS.TENDERS));
  }, []);

  // Save to localStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Mock data for initial load
  useEffect(() => {
    if (tenders.length === 0) {
      const mockTenders: Tender[] = [
        {
          id: "T001",
          title: "Construction of Primary Healthcare Centers",
          description: "Construction of 5 primary healthcare centers across rural communities",
          budget: 250000000,
          status: "Published",
          createdDate: "2024-01-15",
          publishedDate: "2024-01-20",
          closingDate: "2024-02-20",
          openingDate: "2024-02-21",
          ministry: "Ministry of Health",
          department: "Primary Healthcare Development",
          tenderType: "Open",
          procurementMethod: "ICB",
          documents: [],
          amendments: [],
          bidders: [],
          evaluation: {
            id: "E001",
            technicalCriteria: [],
            financialCriteria: [],
            committee: [],
            technicalThreshold: 70,
            financialWeight: 30,
            technicalWeight: 70,
            status: "Not Started",
          },
          timeline: [],
        },
        {
          id: "T002",
          title: "Supply of Medical Equipment",
          description: "Procurement of modern medical equipment for state hospitals",
          budget: 150000000,
          status: "Open",
          createdDate: "2024-01-10",
          publishedDate: "2024-01-15",
          closingDate: "2024-02-15",
          ministry: "Ministry of Health",
          department: "Medical Equipment",
          tenderType: "Open",
          procurementMethod: "QCBS",
          documents: [],
          amendments: [],
          bidders: [],
          evaluation: {
            id: "E002",
            technicalCriteria: [],
            financialCriteria: [],
            committee: [],
            technicalThreshold: 75,
            financialWeight: 40,
            technicalWeight: 60,
            status: "Not Started",
          },
          timeline: [],
        },
      ];
      
      setTenders(mockTenders);
      saveToStorage(STORAGE_KEYS.TENDERS, mockTenders);
    }
  }, [tenders.length]);

  const handleCreateTender = () => {
    const newTender: Tender = {
      id: `T${String(tenders.length + 1).padStart(3, "0")}`,
      title: tenderForm.title,
      description: tenderForm.description,
      budget: parseFloat(tenderForm.budget),
      status: "Draft",
      createdDate: new Date().toISOString().split("T")[0],
      ministry: "Current Ministry", // This would come from auth context
      department: "Current Department",
      tenderType: tenderForm.tenderType as "Open" | "Selective" | "Limited",
      procurementMethod: tenderForm.procurementMethod as "NCB" | "ICB" | "QCBS" | "CQS" | "SSS",
      closingDate: tenderForm.closingDate,
      documents: [],
      amendments: [],
      bidders: [],
      evaluation: {
        id: `E${String(tenders.length + 1).padStart(3, "0")}`,
        technicalCriteria: [],
        financialCriteria: [],
        committee: [],
        technicalThreshold: 70,
        financialWeight: 30,
        technicalWeight: 70,
        status: "Not Started",
      },
      timeline: [],
    };

    const updatedTenders = [...tenders, newTender];
    setTenders(updatedTenders);
    saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);
    
    setTenderForm({
      title: "",
      description: "",
      budget: "",
      tenderType: "Open",
      procurementMethod: "NCB",
      closingDate: "",
      documents: [],
    });
    setShowTenderModal(false);
  };

  const updateTenderStatus = (tenderId: string, status: Tender["status"]) => {
    const updatedTenders = tenders.map((tender) =>
      tender.id === tenderId
        ? {
            ...tender,
            status,
            publishedDate:
              status === "Published"
                ? new Date().toISOString().split("T")[0]
                : tender.publishedDate,
          }
        : tender,
    );

    setTenders(updatedTenders);
    saveToStorage(STORAGE_KEYS.TENDERS, updatedTenders);
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || tender.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      Draft: "secondary",
      Published: "outline",
      Open: "default",
      Closed: "destructive",
      Evaluated: "default",
      Awarded: "default",
    };
    const colors = {
      Draft: "bg-gray-100 text-gray-800",
      Published: "bg-blue-100 text-blue-800",
      Open: "bg-green-100 text-green-800",
      Closed: "bg-red-100 text-red-800",
      Evaluated: "bg-yellow-100 text-yellow-800",
      Awarded: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const getDaysRemaining = (closingDate: string) => {
    const closing = new Date(closingDate);
    const today = new Date();
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Tender Management Module (KanoProc)
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowTenderModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Tender
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="creation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Creation
          </TabsTrigger>
          <TabsTrigger value="administration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Administration
          </TabsTrigger>
          <TabsTrigger value="vendor" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendor Interaction
          </TabsTrigger>
          <TabsTrigger value="opening" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Opening
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Evaluation
          </TabsTrigger>
          <TabsTrigger value="award" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Award
          </TabsTrigger>
          <TabsTrigger value="notification" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification
          </TabsTrigger>
          <TabsTrigger value="contract" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Contract Link
          </TabsTrigger>
        </TabsList>

        {/* Tender Creation & Publication */}
        <TabsContent value="creation" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Evaluated">Evaluated</SelectItem>
                <SelectItem value="Awarded">Awarded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredTenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tender.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {tender.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Budget: ₦{tender.budget.toLocaleString()}</span>
                        <span>Method: {tender.procurementMethod}</span>
                        <span>Type: {tender.tenderType}</span>
                        {tender.closingDate && (
                          <span>
                            Days Remaining: {getDaysRemaining(tender.closingDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(tender.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTender(tender)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {tender.status === "Draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateTenderStatus(tender.id, "Published")
                            }
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tender Administration */}
        <TabsContent value="administration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tender Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Amendments & Addenda</h3>
                    <p className="text-sm text-gray-600">
                      Issue clarifications and updated documents
                    </p>
                  </div>
                  <Button onClick={() => setShowAmendmentModal(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Amendment
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Timeline Tracker</h3>
                    <p className="text-sm text-gray-600">
                      Monitor tender deadlines and milestones
                    </p>
                  </div>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Timeline
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Audit Trail</h3>
                    <p className="text-sm text-gray-600">
                      Complete log of all tender activities
                    </p>
                  </div>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    View Audit Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Interaction */}
        <TabsContent value="vendor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Interaction Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Document Downloads</p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Clarifications</p>
                        <p className="text-2xl font-bold">23</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Interested Vendors</p>
                        <p className="text-2xl font-bold">47</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Bids Submitted</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tender Opening */}
        <TabsContent value="opening" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tender Opening Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-900">QCBS Two-Envelope System</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Technical proposals opened first, financial proposals remain sealed
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <Button className="justify-start" size="lg">
                    <Clock className="h-5 w-5 mr-2" />
                    Generate Opening Report
                  </Button>
                  
                  <Button variant="outline" className="justify-start" size="lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Log Received Bids
                  </Button>
                  
                  <Button variant="outline" className="justify-start" size="lg">
                    <Shield className="h-5 w-5 mr-2" />
                    Verify Submission Times
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation */}
        <TabsContent value="evaluation" className="space-y-6">
          {/* Committee Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Committee Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Procurement Planning builds the team, Tender Management confirms and activates them for this specific tender.
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Assigned Members */}
                  <div>
                    <h3 className="font-medium mb-3">Assigned Committee Members (From Procurement Planning)</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Dr. Amina Hassan", role: "Chairperson", department: "Primary Healthcare", status: "Active", coi: "Declared - No Conflict" },
                        { name: "Engr. Usman Kano", role: "Technical Secretary", department: "Infrastructure", status: "Active", coi: "Pending Declaration" },
                        { name: "Mrs. Fatima Aliyu", role: "Technical Evaluator", department: "Procurement", status: "Active", coi: "Declared - No Conflict" },
                        { name: "Mr. Ibrahim Garba", role: "Financial Evaluator", department: "Finance", status: "Inactive", coi: "Conflict Declared" },
                        { name: "Dr. Aisha Mohammed", role: "Technical Evaluator", department: "Medical Services", status: "Active", coi: "Declared - No Conflict" },
                      ].map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">{member.role} • {member.department}</p>
                                <p className="text-xs text-gray-500">COI Status: {member.coi}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={
                              member.status === "Active" ? "bg-green-100 text-green-800" :
                              member.status === "Inactive" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }>
                              {member.status}
                            </Badge>

                            <div className="flex gap-1">
                              {member.status === "Inactive" && (
                                <Button size="sm" variant="outline">
                                  Replace
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant={member.status === "Active" ? "destructive" : "default"}
                              >
                                {member.status === "Active" ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-primary">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Committee Active
                    </Button>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Replace Member
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COI Declaration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Conflict of Interest (COI) Declaration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Mandatory Declaration Required</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        All committee members must complete COI declaration before evaluation begins. This ensures compliance with Kano's governance rules.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Individual COI Declarations</h3>

                  {[
                    { name: "Dr. Amina Hassan", role: "Chairperson", status: "Completed", hasConflict: false, details: null },
                    { name: "Engr. Usman Kano", role: "Technical Secretary", status: "Pending", hasConflict: null, details: null },
                    { name: "Mrs. Fatima Aliyu", role: "Technical Evaluator", status: "Completed", hasConflict: false, details: null },
                    { name: "Mr. Ibrahim Garba", role: "Financial Evaluator", status: "Conflict Declared", hasConflict: true, details: "Has business relationship with MedEquip Solutions Ltd - Medium severity" },
                    { name: "Dr. Aisha Mohammed", role: "Technical Evaluator", status: "Completed", hasConflict: false, details: null },
                  ].map((member, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                        <Badge className={
                          member.status === "Completed" && !member.hasConflict ? "bg-green-100 text-green-800" :
                          member.status === "Conflict Declared" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {member.status}
                        </Badge>
                      </div>

                      {member.status === "Pending" && (
                        <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Declaration</Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`no-conflict-${index}`} />
                                <Label htmlFor={`no-conflict-${index}`} className="text-sm">
                                  I declare I have no financial/professional interest in participating companies
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id={`has-conflict-${index}`} />
                                <Label htmlFor={`has-conflict-${index}`} className="text-sm">
                                  I declare a potential conflict of interest (details below)
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`conflict-details-${index}`} className="text-sm font-medium">
                              Conflict Details (if applicable)
                            </Label>
                            <Textarea
                              id={`conflict-details-${index}`}
                              placeholder="Please provide company name, nature of relationship, and severity level..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>

                          <Button size="sm">Submit Declaration</Button>
                        </div>
                      )}

                      {member.hasConflict && member.details && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-800">Conflict Details:</p>
                          <p className="text-sm text-red-700 mt-1">{member.details}</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline">Approve with Mitigation</Button>
                            <Button size="sm" variant="destructive">Replace Evaluator</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">COI Declaration Status</p>
                      <p className="text-sm text-green-700">4 of 5 declarations completed • 1 conflict requires resolution</p>
                    </div>
                    <Button disabled className="bg-gray-400">
                      <Shield className="h-4 w-4 mr-2" />
                      Proceed to Scoring (Blocked)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QCBS Scoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                QCBS Scoring Engine (Technical + Financial)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Scoring Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-medium text-blue-900">Technical Weight</h3>
                    <p className="text-2xl font-bold text-blue-800">70%</p>
                    <p className="text-sm text-blue-700">Minimum Threshold: 70 points</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h3 className="font-medium text-green-900">Financial Weight</h3>
                    <p className="text-2xl font-bold text-green-800">30%</p>
                    <p className="text-sm text-green-700">Lowest Bid = 100 points</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50">
                    <h3 className="font-medium text-purple-900">Total Bidders</h3>
                    <p className="text-2xl font-bold text-purple-800">5</p>
                    <p className="text-sm text-purple-700">Technical evaluation first</p>
                  </div>
                </div>

                {/* Technical Scoring Interface */}
                <div>
                  <h3 className="font-medium mb-4">Technical Scoring (Individual → Consensus)</h3>

                  <Tabs defaultValue="individual" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="individual">Individual Scoring</TabsTrigger>
                      <TabsTrigger value="consensus">Consensus Building</TabsTrigger>
                    </TabsList>

                    <TabsContent value="individual" className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3">
                          <strong>Instructions:</strong> Each evaluator scores independently based on the criteria from Procurement Planning.
                        </p>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Criteria</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Max Score</TableHead>
                                <TableHead>Bidder A</TableHead>
                                <TableHead>Bidder B</TableHead>
                                <TableHead>Bidder C</TableHead>
                                <TableHead>Bidder D</TableHead>
                                <TableHead>Bidder E</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Technical Capability</TableCell>
                                <TableCell>30%</TableCell>
                                <TableCell>30</TableCell>
                                <TableCell><Input type="number" placeholder="0-30" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-30" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-30" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-30" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-30" className="w-20" /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Experience & Track Record</TableCell>
                                <TableCell>25%</TableCell>
                                <TableCell>25</TableCell>
                                <TableCell><Input type="number" placeholder="0-25" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-25" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-25" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-25" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-25" className="w-20" /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Methodology & Approach</TableCell>
                                <TableCell>20%</TableCell>
                                <TableCell>20</TableCell>
                                <TableCell><Input type="number" placeholder="0-20" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-20" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-20" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-20" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-20" className="w-20" /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Key Personnel Qualifications</TableCell>
                                <TableCell>15%</TableCell>
                                <TableCell>15</TableCell>
                                <TableCell><Input type="number" placeholder="0-15" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-15" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-15" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-15" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-15" className="w-20" /></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Local Content & Capacity</TableCell>
                                <TableCell>10%</TableCell>
                                <TableCell>10</TableCell>
                                <TableCell><Input type="number" placeholder="0-10" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-10" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-10" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-10" className="w-20" /></TableCell>
                                <TableCell><Input type="number" placeholder="0-10" className="w-20" /></TableCell>
                              </TableRow>
                              <TableRow className="font-bold bg-gray-50">
                                <TableCell>TOTAL TECHNICAL SCORE</TableCell>
                                <TableCell>100%</TableCell>
                                <TableCell>100</TableCell>
                                <TableCell>85</TableCell>
                                <TableCell>78</TableCell>
                                <TableCell>72</TableCell>
                                <TableCell>68</TableCell>
                                <TableCell>82</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <p className="text-sm text-gray-600">Evaluator: Dr. Amina Hassan (Chairperson)</p>
                          <Button>Save Individual Scores</Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="consensus" className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Consensus Building Workspace</h4>
                        <p className="text-sm text-blue-700">
                          Compare individual evaluator scores and build consensus. System highlights variances &gt;20 points for discussion.
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bidder</TableHead>
                              <TableHead>Dr. Amina Hassan</TableHead>
                              <TableHead>Mrs. Fatima Aliyu</TableHead>
                              <TableHead>Dr. Aisha Mohammed</TableHead>
                              <TableHead>Variance</TableHead>
                              <TableHead>Consensus Score</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Northern Construction Ltd</TableCell>
                              <TableCell>85</TableCell>
                              <TableCell>83</TableCell>
                              <TableCell>87</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">4 pts</Badge>
                              </TableCell>
                              <TableCell>
                                <Input type="number" defaultValue="85" className="w-20" />
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">MedEquip Solutions Ltd</TableCell>
                              <TableCell>78</TableCell>
                              <TableCell>75</TableCell>
                              <TableCell>82</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">7 pts</Badge>
                              </TableCell>
                              <TableCell>
                                <Input type="number" defaultValue="78" className="w-20" />
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Kano Engineering Works</TableCell>
                              <TableCell>72</TableCell>
                              <TableCell>69</TableCell>
                              <TableCell>75</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">6 pts</Badge>
                              </TableCell>
                              <TableCell>
                                <Input type="number" defaultValue="72" className="w-20" />
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Sahel Construction Co</TableCell>
                              <TableCell>68</TableCell>
                              <TableCell>45</TableCell>
                              <TableCell>71</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">26 pts ⚠️</Badge>
                              </TableCell>
                              <TableCell>
                                <Input type="number" defaultValue="61" className="w-20" />
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">Disqualified</Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Arewa Infrastructure Ltd</TableCell>
                              <TableCell>82</TableCell>
                              <TableCell>79</TableCell>
                              <TableCell>84</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">5 pts</Badge>
                              </TableCell>
                              <TableCell>
                                <Input type="number" defaultValue="82" className="w-20" />
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          <strong>Technical Qualification:</strong> 4 bidders qualified (≥70 points), 1 disqualified
                        </p>
                        <Button className="bg-primary">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalize Technical Scores
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Financial Scoring */}
                <div>
                  <h3 className="font-medium mb-4">Financial Scoring (Auto-Calculated)</h3>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Financial Envelopes Opening</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Only qualified bidders' financial proposals will be opened. Disqualified bidders remain sealed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bidder</TableHead>
                          <TableHead>Technical Status</TableHead>
                          <TableHead>Bid Amount (₦)</TableHead>
                          <TableHead>Financial Score</TableHead>
                          <TableHead>Technical Score</TableHead>
                          <TableHead>Combined Score</TableHead>
                          <TableHead>Rank</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-green-50">
                          <TableCell className="font-medium">MedEquip Solutions Ltd</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                          </TableCell>
                          <TableCell>₦180,000,000</TableCell>
                          <TableCell className="font-bold">100.0</TableCell>
                          <TableCell>78.0</TableCell>
                          <TableCell className="font-bold text-green-600">84.6</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">🥇 1st</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Northern Construction Ltd</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                          </TableCell>
                          <TableCell>₦195,000,000</TableCell>
                          <TableCell>92.3</TableCell>
                          <TableCell>85.0</TableCell>
                          <TableCell className="font-bold">87.2</TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-800">🥈 2nd</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Arewa Infrastructure Ltd</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                          </TableCell>
                          <TableCell>₦210,000,000</TableCell>
                          <TableCell>85.7</TableCell>
                          <TableCell>82.0</TableCell>
                          <TableCell className="font-bold">83.1</TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-800">🥉 3rd</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Kano Engineering Works</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                          </TableCell>
                          <TableCell>₦225,000,000</TableCell>
                          <TableCell>80.0</TableCell>
                          <TableCell>72.0</TableCell>
                          <TableCell className="font-bold">74.4</TableCell>
                          <TableCell>
                            <Badge className="bg-gray-100 text-gray-800">4th</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="opacity-50">
                          <TableCell className="font-medium">Sahel Construction Co</TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">Disqualified</Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">Sealed</TableCell>
                          <TableCell className="text-gray-400">N/A</TableCell>
                          <TableCell>61.0</TableCell>
                          <TableCell className="text-gray-400">N/A</TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800">Disqualified</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">QCBS Evaluation Complete</p>
                      <p className="text-sm text-green-700">
                        Recommended Award: <strong>MedEquip Solutions Ltd</strong> (Combined Score: 84.6)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                      <Button className="bg-primary">
                        <Award className="h-4 w-4 mr-2" />
                        Generate Award Recommendation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Award Recommendation */}
        <TabsContent value="award" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Award Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Evaluation Report</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate comprehensive evaluation report for approval
                  </p>
                  <Button className="mt-2" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Approval Workflow</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Route to MDA Head → State Tenders Board (if above threshold)
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Award Notification */}
        <TabsContent value="notification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Award Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <h3 className="font-medium text-green-900">Successful Bidder Notification</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Notify winning bidder(s) of award decision
                  </p>
                  <Button className="mt-2" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Send Award Notice
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-medium text-blue-900">Unsuccessful Bidder Feedback</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Provide feedback to unsuccessful bidders as per procurement law
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Public Award Notice</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Publish award notice on KanoProc public portal
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Publish Award
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Management Link */}
        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Link to Contract Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Convert to Contract</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Convert winning bid to draft contract
                  </p>
                  <Button className="mt-2" size="sm">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Create Draft Contract
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Contract Execution</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Push to Contract Management for milestones and payments
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Transfer to Contract Mgmt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Tender Modal */}
      <Dialog open={showTenderModal} onOpenChange={setShowTenderModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Tender</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tender Title</Label>
              <Input
                id="title"
                value={tenderForm.title}
                onChange={(e) =>
                  setTenderForm({ ...tenderForm, title: e.target.value })
                }
                placeholder="Enter tender title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={tenderForm.description}
                onChange={(e) =>
                  setTenderForm({ ...tenderForm, description: e.target.value })
                }
                placeholder="Enter tender description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (₦)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={tenderForm.budget}
                  onChange={(e) =>
                    setTenderForm({ ...tenderForm, budget: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="closingDate">Closing Date</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={tenderForm.closingDate}
                  onChange={(e) =>
                    setTenderForm({ ...tenderForm, closingDate: e.target.value })
                  }
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tenderType">Tender Type</Label>
                <Select
                  value={tenderForm.tenderType}
                  onValueChange={(value) =>
                    setTenderForm({ ...tenderForm, tenderType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open Tender</SelectItem>
                    <SelectItem value="Selective">Selective Tender</SelectItem>
                    <SelectItem value="Limited">Limited Tender</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="procurementMethod">Procurement Method</Label>
                <Select
                  value={tenderForm.procurementMethod}
                  onValueChange={(value) =>
                    setTenderForm({ ...tenderForm, procurementMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NCB">National Competitive Bidding</SelectItem>
                    <SelectItem value="ICB">International Competitive Bidding</SelectItem>
                    <SelectItem value="QCBS">Quality & Cost Based Selection</SelectItem>
                    <SelectItem value="CQS">Consultant Quality Selection</SelectItem>
                    <SelectItem value="SSS">Single Source Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTenderModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTender}>Create Tender</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenderManagement;
