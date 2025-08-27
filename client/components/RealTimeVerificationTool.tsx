import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  Edit,
  Save,
  Send,
  CheckCircle,
  XCircle,
  Trophy,
  Calculator,
  Users,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface TenderAssignment {
  id: string;
  tenderId: string;
  tenderTitle: string;
  status: "Active" | "Completed" | "Draft";
  dueDate: string;
  evaluatorCount: number;
  completedEvaluations: number;
}

interface Bidder {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  submissionDate: string;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  status: "Qualified" | "Disqualified" | "Under Review";
  bidAmount: string;
  experience: string;
  certifications: string[];
  previousProjects: number;
  completionRate: number;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
  type: "technical" | "financial" | "compliance";
  description: string;
}

interface EvaluatorScore {
  evaluatorId: string;
  evaluatorName: string;
  role: string;
  scores: Record<string, { score: number; comment: string }>;
  totalScore: number;
  submissionDate?: string;
  status: "draft" | "submitted" | "approved";
}

interface ChairmanAction {
  id: string;
  action: "override" | "approve" | "request_revision";
  criterionId?: string;
  originalScore?: number;
  newScore?: number;
  reason: string;
  timestamp: string;
}

export default function RealTimeVerificationTool() {
  // State management
  const [selectedTender, setSelectedTender] = useState<TenderAssignment | null>(
    null,
  );
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [assignedTenders, setAssignedTenders] = useState<TenderAssignment[]>(
    [],
  );
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<
    EvaluationCriterion[]
  >([]);
  const [evaluatorScores, setEvaluatorScores] = useState<EvaluatorScore[]>([]);
  const [chairmanActions, setChairmanActions] = useState<ChairmanAction[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<
    "evaluator" | "chairman"
  >("evaluator");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [aggregatedResults, setAggregatedResults] = useState<any[]>([]);

  // Form states
  const [myScores, setMyScores] = useState<
    Record<string, { score: number; comment: string }>
  >({});
  const [overrideForm, setOverrideForm] = useState({
    criterionId: "",
    evaluatorId: "",
    newScore: 0,
    reason: "",
  });
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
    const interval = setInterval(fetchRealTimeUpdates, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeMockData = () => {
    // Mock assigned tenders
    const mockTenders: TenderAssignment[] = [
      {
        id: "TA-001",
        tenderId: "TDR-002",
        tenderTitle:
          "Road Construction and Rehabilitation Project - Infrastructure",
        status: "Active",
        dueDate: "2024-03-15",
        evaluatorCount: 5,
        completedEvaluations: 3,
      },
      {
        id: "TA-002",
        tenderId: "MOH-2024-001",
        tenderTitle: "Hospital Equipment Supply",
        status: "Active",
        dueDate: "2024-03-20",
        evaluatorCount: 4,
        completedEvaluations: 2,
      },
      {
        id: "TA-003",
        tenderId: "MOE-2024-001",
        tenderTitle: "School Furniture Supply Program",
        status: "Completed",
        dueDate: "2024-03-10",
        evaluatorCount: 6,
        completedEvaluations: 6,
      },
    ];

    // Mock bidders
    const mockBidders: Bidder[] = [
      {
        id: "BID-001",
        companyName: "Kano Construction Ltd",
        contactPerson: "Eng. Ibrahim Mohammed",
        email: "ibrahim@kanoconstruction.ng",
        submissionDate: "2024-02-10",
        status: "Qualified",
        bidAmount: "₦14,800,000,000",
        experience: "20 years",
        certifications: ["ISO 9001", "COREN Certified", "NIQS Registered"],
        previousProjects: 62,
        completionRate: 97.8,
      },
      {
        id: "BID-002",
        companyName: "Sahel Bridge Builders",
        contactPerson: "Mallam Usman Kano",
        email: "usman@sahelbridge.com",
        submissionDate: "2024-02-09",
        status: "Qualified",
        bidAmount: "₦15,100,000,000",
        experience: "18 years",
        certifications: ["ISO 9001", "COREN Certified"],
        previousProjects: 45,
        completionRate: 96.2,
      },
      {
        id: "BID-003",
        companyName: "Northern Roads Nigeria",
        contactPerson: "Fatima Abubakar",
        email: "fatima@northernroads.ng",
        submissionDate: "2024-02-08",
        status: "Under Review",
        bidAmount: "₦15,400,000,000",
        experience: "15 years",
        certifications: ["ISO 9001", "NBRRI Certified"],
        previousProjects: 38,
        completionRate: 95.5,
      },
    ];

    // Mock evaluation criteria
    const mockCriteria: EvaluationCriterion[] = [
      {
        id: "TECH-001",
        name: "Technical Expertise and Capability",
        maxScore: 25,
        weight: 0.25,
        type: "technical",
        description: "Assessment of technical competence and experience",
      },
      {
        id: "TECH-002",
        name: "Project Management Approach",
        maxScore: 20,
        weight: 0.2,
        type: "technical",
        description: "Quality of proposed project management methodology",
      },
      {
        id: "TECH-003",
        name: "Resource Availability",
        maxScore: 15,
        weight: 0.15,
        type: "technical",
        description: "Availability of required equipment and personnel",
      },
      {
        id: "FIN-001",
        name: "Financial Proposal",
        maxScore: 25,
        weight: 0.25,
        type: "financial",
        description: "Cost competitiveness and value for money",
      },
      {
        id: "COMP-001",
        name: "Compliance and Documentation",
        maxScore: 15,
        weight: 0.15,
        type: "compliance",
        description: "Completeness and accuracy of submitted documents",
      },
    ];

    // Mock evaluator scores
    const mockEvaluatorScores: EvaluatorScore[] = [
      {
        evaluatorId: "EV-001",
        evaluatorName: "Dr. Amina Hassan",
        role: "Technical Expert",
        scores: {
          "TECH-001": {
            score: 22,
            comment: "Excellent technical capabilities demonstrated",
          },
          "TECH-002": {
            score: 18,
            comment: "Strong project management approach",
          },
          "TECH-003": { score: 14, comment: "Adequate resources available" },
          "FIN-001": { score: 20, comment: "Competitive pricing" },
          "COMP-001": { score: 13, comment: "All documents complete" },
        },
        totalScore: 87,
        submissionDate: "2024-03-12",
        status: "submitted",
      },
      {
        evaluatorId: "EV-002",
        evaluatorName: "Eng. Musa Ibrahim",
        role: "Infrastructure Specialist",
        scores: {
          "TECH-001": { score: 20, comment: "Good technical approach" },
          "TECH-002": { score: 17, comment: "Solid methodology" },
          "TECH-003": { score: 13, comment: "Resources seem adequate" },
          "FIN-001": { score: 22, comment: "Very competitive bid" },
          "COMP-001": { score: 14, comment: "Complete documentation" },
        },
        totalScore: 86,
        submissionDate: "2024-03-11",
        status: "submitted",
      },
      {
        evaluatorId: "EV-003",
        evaluatorName: "Fatima Yusuf",
        role: "Financial Analyst",
        scores: {
          "TECH-001": { score: 21, comment: "Strong technical team" },
          "TECH-002": { score: 19, comment: "Well-structured approach" },
          "TECH-003": {
            score: 12,
            comment: "Some concerns about equipment availability",
          },
          "FIN-001": { score: 23, comment: "Best financial proposal" },
          "COMP-001": { score: 15, comment: "Excellent documentation" },
        },
        totalScore: 90,
        submissionDate: "2024-03-13",
        status: "submitted",
      },
    ];

    setAssignedTenders(mockTenders);
    setBidders(mockBidders);
    setEvaluationCriteria(mockCriteria);
    setEvaluatorScores(mockEvaluatorScores);

    // Initialize my scores
    const initialScores: Record<string, { score: number; comment: string }> =
      {};
    mockCriteria.forEach((criterion) => {
      initialScores[criterion.id] = { score: 0, comment: "" };
    });
    setMyScores(initialScores);

    // Set user role (in production, get from auth context)
    const userRole = localStorage.getItem("userRole") || "evaluator";
    setCurrentUserRole(userRole as "evaluator" | "chairman");
  };

  const fetchRealTimeUpdates = () => {
    // Simulate real-time updates
    setLastRefresh(new Date());

    // In production, this would fetch from API
    // Example: fetch('/api/evaluation-updates')

    // Mock: Add some random score updates
    if (Math.random() > 0.8) {
      setEvaluatorScores((prev) =>
        prev.map((evaluator) => ({
          ...evaluator,
          totalScore: evaluator.totalScore + (Math.random() - 0.5) * 2,
        })),
      );
    }
  };

  const handleTenderSelection = (tenderId: string) => {
    const tender = assignedTenders.find((t) => t.tenderId === tenderId);
    setSelectedTender(tender || null);

    if (tender) {
      // Load bidders for this tender
      setIsLoading(true);
      setTimeout(() => {
        // In production, fetch from API
        setSelectedBidder(null);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleBidderSelection = (bidderId: string) => {
    const bidder = bidders.find((b) => b.id === bidderId);
    setSelectedBidder(bidder || null);
  };

  const handleScoreChange = (
    criterionId: string,
    score: number,
    comment: string,
  ) => {
    setMyScores((prev) => ({
      ...prev,
      [criterionId]: { score, comment },
    }));
  };

  const saveMyScores = () => {
    // Save scores to localStorage/API
    const myEvaluation: EvaluatorScore = {
      evaluatorId: "EV-004",
      evaluatorName: "Current User",
      role: "Evaluator",
      scores: myScores,
      totalScore: Object.values(myScores).reduce(
        (sum, item) => sum + item.score,
        0,
      ),
      status: "draft",
    };

    localStorage.setItem(
      `evaluation_${selectedTender?.tenderId}_${selectedBidder?.id}`,
      JSON.stringify(myEvaluation),
    );
    alert("Scores saved as draft successfully!");
  };

  const submitMyScores = () => {
    if (!hasAllScores()) {
      alert("Please enter scores for all criteria before submitting");
      return;
    }

    const myEvaluation: EvaluatorScore = {
      evaluatorId: "EV-004",
      evaluatorName: "Current User",
      role: "Evaluator",
      scores: myScores,
      totalScore: Object.values(myScores).reduce(
        (sum, item) => sum + item.score,
        0,
      ),
      submissionDate: new Date().toISOString(),
      status: "submitted",
    };

    setEvaluatorScores((prev) => [
      ...prev.filter((e) => e.evaluatorId !== "EV-004"),
      myEvaluation,
    ]);
    alert("Scores submitted successfully!");
  };

  const hasAllScores = () => {
    return evaluationCriteria.every(
      (criterion) => myScores[criterion.id]?.score > 0,
    );
  };

  const handleChairmanOverride = () => {
    if (
      !overrideForm.criterionId ||
      !overrideForm.evaluatorId ||
      !overrideForm.reason
    ) {
      alert("Please fill all required fields");
      return;
    }

    const action: ChairmanAction = {
      id: `CA-${Date.now()}`,
      action: "override",
      criterionId: overrideForm.criterionId,
      newScore: overrideForm.newScore,
      reason: overrideForm.reason,
      timestamp: new Date().toISOString(),
    };

    setChairmanActions((prev) => [...prev, action]);

    // Update the evaluator score
    setEvaluatorScores((prev) =>
      prev.map((evaluator) => {
        if (evaluator.evaluatorId === overrideForm.evaluatorId) {
          const updatedScores = {
            ...evaluator.scores,
            [overrideForm.criterionId]: {
              ...evaluator.scores[overrideForm.criterionId],
              score: overrideForm.newScore,
            },
          };
          return {
            ...evaluator,
            scores: updatedScores,
            totalScore: Object.values(updatedScores).reduce(
              (sum, item) => sum + item.score,
              0,
            ),
          };
        }
        return evaluator;
      }),
    );

    setShowOverrideDialog(false);
    setOverrideForm({
      criterionId: "",
      evaluatorId: "",
      newScore: 0,
      reason: "",
    });
    alert("Score override applied successfully!");
  };

  const approveAllEvaluations = () => {
    setEvaluatorScores((prev) =>
      prev.map((evaluator) => ({
        ...evaluator,
        status: "approved" as const,
      })),
    );
    alert("All evaluations approved successfully!");
  };

  const calculateAverageScore = (criterionId: string) => {
    const scores = evaluatorScores
      .map((evaluator) => evaluator.scores[criterionId]?.score || 0)
      .filter((score) => score > 0);

    return scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;
  };

  const generateAggregatedResults = () => {
    const results = evaluationCriteria.map((criterion) => {
      const avgScore = calculateAverageScore(criterion.id);
      const maxPossible = criterion.maxScore;
      const percentage = (avgScore / maxPossible) * 100;

      return {
        criterion: criterion.name,
        averageScore: avgScore.toFixed(1),
        maxScore: maxPossible,
        percentage: percentage.toFixed(1),
        weight: (criterion.weight * 100).toFixed(0),
        type: criterion.type,
      };
    });

    setAggregatedResults(results);
  };

  useEffect(() => {
    if (evaluatorScores.length > 0) {
      generateAggregatedResults();
    }
  }, [evaluatorScores, evaluationCriteria]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl text-blue-900">
                <Shield className="h-6 w-6" />
                Real-Time Verification Tool
              </CardTitle>
              <CardDescription className="text-blue-700">
                Comprehensive tender evaluation with real-time collaboration
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  currentUserRole === "chairman" ? "default" : "secondary"
                }
              >
                {currentUserRole === "chairman" ? "Chairman" : "Evaluator"}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchRealTimeUpdates}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="evaluation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="evaluation" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Evaluation
          </TabsTrigger>
          <TabsTrigger value="chairman" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Chairman Review
          </TabsTrigger>
          <TabsTrigger value="aggregation" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Score Aggregation
          </TabsTrigger>
        </TabsList>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tender Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Select Assigned Tender
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={handleTenderSelection}
                  value={selectedTender?.tenderId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tender to evaluate" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedTenders.map((tender) => (
                      <SelectItem key={tender.id} value={tender.tenderId}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {tender.tenderTitle}
                          </span>
                          <span className="text-sm text-gray-500">
                            Due: {new Date(tender.dueDate).toLocaleDateString()}{" "}
                            •{tender.completedEvaluations}/
                            {tender.evaluatorCount} evaluations
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTender && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          className="ml-2"
                          variant={
                            selectedTender.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedTender.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Progress:</span>
                        <span className="ml-2">
                          {selectedTender.completedEvaluations}/
                          {selectedTender.evaluatorCount}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bidder Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Bidder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={handleBidderSelection}
                  value={selectedBidder?.id || ""}
                  disabled={!selectedTender || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedTender
                          ? "Choose a bidder to evaluate"
                          : "Select a tender first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {bidders.map((bidder) => (
                      <SelectItem key={bidder.id} value={bidder.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {bidder.companyName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {bidder.bidAmount} • {bidder.experience} experience
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedBidder && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Contact:</span>
                        <span>{selectedBidder.contactPerson}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={
                            selectedBidder.status === "Qualified"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedBidder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Completion Rate:</span>
                        <span>{selectedBidder.completionRate}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Evaluation Criteria */}
          {selectedTender && selectedBidder && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Evaluation Criteria
                </CardTitle>
                <CardDescription>
                  Score each criterion for {selectedBidder.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {evaluationCriteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{criterion.name}</h4>
                        <p className="text-sm text-gray-600">
                          {criterion.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            criterion.type === "financial"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {criterion.type}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          Max: {criterion.maxScore} pts | Weight:{" "}
                          {(criterion.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`score-${criterion.id}`}>
                          Score (0-{criterion.maxScore})
                        </Label>
                        <Input
                          id={`score-${criterion.id}`}
                          type="number"
                          min="0"
                          max={criterion.maxScore}
                          step="0.1"
                          value={myScores[criterion.id]?.score || ""}
                          onChange={(e) =>
                            handleScoreChange(
                              criterion.id,
                              parseFloat(e.target.value) || 0,
                              myScores[criterion.id]?.comment || "",
                            )
                          }
                          placeholder="Enter score"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`comment-${criterion.id}`}>
                          Comments
                        </Label>
                        <Textarea
                          id={`comment-${criterion.id}`}
                          value={myScores[criterion.id]?.comment || ""}
                          onChange={(e) =>
                            handleScoreChange(
                              criterion.id,
                              myScores[criterion.id]?.score || 0,
                              e.target.value,
                            )
                          }
                          placeholder="Enter evaluation comments"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <span className="font-medium text-lg">Total Score: </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {Object.values(myScores)
                        .reduce((sum, item) => sum + item.score, 0)
                        .toFixed(1)}
                    </span>
                    <span className="text-gray-600">
                      /
                      {evaluationCriteria.reduce(
                        (sum, c) => sum + c.maxScore,
                        0,
                      )}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={saveMyScores}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button onClick={submitMyScores} disabled={!hasAllScores()}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Scores
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chairman Review Tab */}
        <TabsContent value="chairman" className="space-y-6">
          {currentUserRole !== "chairman" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Chairman access required to view and modify evaluator scores.
              </AlertDescription>
            </Alert>
          )}

          {currentUserRole === "chairman" && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Evaluator Scores Overview
                      </CardTitle>
                      <CardDescription>
                        Review and manage evaluator submissions
                      </CardDescription>
                    </div>
                    <Button onClick={approveAllEvaluations}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Evaluator</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Total Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluatorScores.map((evaluator) => (
                          <TableRow key={evaluator.evaluatorId}>
                            <TableCell className="font-medium">
                              {evaluator.evaluatorName}
                            </TableCell>
                            <TableCell>{evaluator.role}</TableCell>
                            <TableCell>
                              <span className="text-lg font-semibold">
                                {evaluator.totalScore.toFixed(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  evaluator.status === "approved"
                                    ? "default"
                                    : evaluator.status === "submitted"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {evaluator.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {evaluator.submissionDate
                                ? new Date(
                                    evaluator.submissionDate,
                                  ).toLocaleDateString()
                                : "Not submitted"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setOverrideForm((prev) => ({
                                      ...prev,
                                      evaluatorId: evaluator.evaluatorId,
                                    }));
                                    setShowOverrideDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Criterion Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Criterion Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Criterion</TableHead>
                          {evaluatorScores.map((evaluator) => (
                            <TableHead
                              key={evaluator.evaluatorId}
                              className="text-center"
                            >
                              <div>{evaluator.evaluatorName}</div>
                              <div className="text-xs text-gray-500">
                                {evaluator.role}
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="text-center">Average</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {evaluationCriteria.map((criterion) => (
                          <TableRow key={criterion.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{criterion.name}</div>
                                <div className="text-sm text-gray-500">
                                  Max: {criterion.maxScore}
                                </div>
                              </div>
                            </TableCell>
                            {evaluatorScores.map((evaluator) => (
                              <TableCell
                                key={`${criterion.id}-${evaluator.evaluatorId}`}
                                className="text-center"
                              >
                                <div className="font-semibold">
                                  {evaluator.scores[
                                    criterion.id
                                  ]?.score?.toFixed(1) || "0.0"}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {evaluator.scores[criterion.id]?.comment &&
                                    "💬"}
                                </div>
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              <div className="font-bold text-blue-600">
                                {calculateAverageScore(criterion.id).toFixed(1)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Chairman Actions Log */}
              {chairmanActions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chairman Actions Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chairmanActions.map((action) => (
                        <div
                          key={action.id}
                          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">
                                Score Override
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                New score: {action.newScore}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(action.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{action.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Score Aggregation Tab */}
        <TabsContent value="aggregation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Score Aggregation Results
                  </CardTitle>
                  <CardDescription>
                    Consolidated evaluation results and analytics
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Statistics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {evaluatorScores.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Completed Evaluations
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {(
                            evaluatorScores.reduce(
                              (sum, e) => sum + e.totalScore,
                              0,
                            ) / evaluatorScores.length || 0
                          ).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Average Total Score
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Score Distribution</h3>
                  <div className="space-y-2">
                    {evaluatorScores.map((evaluator) => (
                      <div
                        key={evaluator.evaluatorId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm font-medium">
                          {evaluator.evaluatorName}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(evaluator.totalScore / 100) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">
                            {evaluator.totalScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Aggregation Table */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Criterion-wise Analysis
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Criterion</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Max Possible</TableHead>
                        <TableHead>Achievement %</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aggregatedResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {result.criterion}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                result.type === "financial"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {result.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{result.weight}%</TableCell>
                          <TableCell className="font-semibold">
                            {result.averageScore}
                          </TableCell>
                          <TableCell>{result.maxScore}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    parseFloat(result.percentage) >= 80
                                      ? "bg-green-500"
                                      : parseFloat(result.percentage) >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${result.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {result.percentage}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {parseFloat(result.percentage) >= 80 ? (
                              <Badge className="bg-green-100 text-green-800">
                                Excellent
                              </Badge>
                            ) : parseFloat(result.percentage) >= 60 ? (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Good
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                Needs Review
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Final Recommendation */}
              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Award className="h-5 w-5" />
                    Final Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Overall Evaluation Status:
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        Recommended for Award
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Final Composite Score:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(
                          evaluatorScores.reduce(
                            (sum, e) => sum + e.totalScore,
                            0,
                          ) / evaluatorScores.length || 0
                        ).toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Based on the evaluation results from{" "}
                      {evaluatorScores.length} evaluators, this bidder
                      demonstrates strong performance across all evaluation
                      criteria.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chairman Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Evaluator Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Criterion</Label>
              <Select
                value={overrideForm.criterionId}
                onValueChange={(value) =>
                  setOverrideForm((prev) => ({ ...prev, criterionId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select criterion" />
                </SelectTrigger>
                <SelectContent>
                  {evaluationCriteria.map((criterion) => (
                    <SelectItem key={criterion.id} value={criterion.id}>
                      {criterion.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New Score</Label>
              <Input
                type="number"
                value={overrideForm.newScore}
                onChange={(e) =>
                  setOverrideForm((prev) => ({
                    ...prev,
                    newScore: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter new score"
              />
            </div>
            <div>
              <Label>Reason for Override</Label>
              <Textarea
                value={overrideForm.reason}
                onChange={(e) =>
                  setOverrideForm((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                placeholder="Explain the reason for this override"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowOverrideDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleChairmanOverride}>Apply Override</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
