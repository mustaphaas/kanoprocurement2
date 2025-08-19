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
        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Committee Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-24 justify-start flex-col items-start p-4">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="font-medium">Committee Assignment</span>
                    <span className="text-xs opacity-70">Assign evaluators</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 justify-start flex-col items-start p-4">
                    <Shield className="h-6 w-6 mb-2" />
                    <span className="font-medium">COI Declaration</span>
                    <span className="text-xs opacity-70">Conflict of Interest</span>
                  </Button>
                  
                  <Button variant="outline" className="h-24 justify-start flex-col items-start p-4">
                    <Scale className="h-6 w-6 mb-2" />
                    <span className="font-medium">QCBS Scoring</span>
                    <span className="text-xs opacity-70">Technical + Financial</span>
                  </Button>
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
