import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  AlertTriangle,
  Star,
  Edit,
  Eye,
  Plus,
  Trash2,
  Save,
  Calculator,
  BarChart3,
  MessageSquare,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  FileText,
  Award,
  Scale,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Types
interface CommitteeMember {
  id: string;
  name: string;
  role: "Chair" | "Secretary" | "Evaluator" | "Technical Expert" | "Observer";
  department: string;
  email: string;
  phone: string;
  conflictOfInterest: boolean;
  expertise: string[];
  availability: "Available" | "Busy" | "On Leave";
  evaluationHistory: EvaluationRecord[];
  performanceRating: number;
  dateJoined: string;
  qualifications: string[];
  certifications: string[];
}

interface EvaluationRecord {
  evaluationId: string;
  tenderTitle: string;
  date: string;
  role: string;
  performanceScore: number;
  notes?: string;
}

interface EvaluationCommittee {
  id: string;
  name: string;
  description: string;
  type: "Technical" | "Financial" | "Combined" | "Specialized";
  members: CommitteeMember[];
  chairperson: string;
  secretary: string;
  activeEvaluations: ActiveEvaluation[];
  createdDate: string;
  status: "Active" | "Inactive" | "Archived";
  specialization: string[];
  minimumMembers: number;
  maximumMembers: number;
  quorumRequirement: number;
  evaluationCriteria: string[];
  workload: number;
  performanceMetrics: CommitteePerformance;
}

interface ActiveEvaluation {
  id: string;
  tenderId: string;
  tenderTitle: string;
  status: "Assigned" | "In Progress" | "Completed" | "On Hold";
  assignedDate: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  progress: number;
}

interface CommitteePerformance {
  averageCompletionTime: number;
  evaluationsCompleted: number;
  qualityScore: number;
  memberSatisfaction: number;
  consistencyScore: number;
}

interface IndividualScore {
  memberId: string;
  memberName: string;
  scores: { [criteriaId: string]: number };
  totalScore: number;
  comments: string;
  submissionDate: string;
  timeSpent: number;
}

interface VendorEvaluation {
  vendorId: string;
  vendorName: string;
  individualScores: IndividualScore[];
  consensusScore: number;
  technicalCompliance: boolean;
  recommendedRanking: number;
  finalComments: string;
  disputeFlags: DisputeFlag[];
}

interface DisputeFlag {
  id: string;
  raisedBy: string;
  concern: string;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "Resolved" | "Escalated";
  date: string;
}

interface EvaluationSession {
  id: string;
  committeeId: string;
  tenderId: string;
  tenderTitle: string;
  sessionDate: string;
  duration: number;
  attendees: string[];
  agenda: string[];
  minutes: string;
  decisions: SessionDecision[];
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  vendors: VendorEvaluation[];
  consensusBuilder: ConsensusData;
}

interface SessionDecision {
  id: string;
  type: "Vendor Ranking" | "Clarification Request" | "Committee Decision";
  description: string;
  votingResult: VotingResult;
  implementationDate?: string;
}

interface VotingResult {
  inFavor: number;
  against: number;
  abstain: number;
  details: { [memberId: string]: "For" | "Against" | "Abstain" };
}

interface ConsensusData {
  totalVariance: number;
  averageScore: number;
  outliers: OutlierScore[];
  adjustmentFactors: { [vendorId: string]: number };
  finalConsensusReached: boolean;
}

interface OutlierScore {
  memberId: string;
  vendorId: string;
  score: number;
  deviation: number;
  justificationRequired: boolean;
}

const STORAGE_KEYS = {
  COMMITTEES: "evaluationCommittees",
  EVALUATION_SESSIONS: "evaluationSessions",
  MEMBER_POOL: "memberPool",
};

export default function EvaluationCommitteeManagement() {
  const [activeTab, setActiveTab] = useState("committees");
  const [committees, setCommittees] = useState<EvaluationCommittee[]>([]);
  const [evaluationSessions, setEvaluationSessions] = useState<EvaluationSession[]>([]);
  const [memberPool, setMemberPool] = useState<CommitteeMember[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<EvaluationCommittee | null>(null);
  const [selectedSession, setSelectedSession] = useState<EvaluationSession | null>(null);
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showConsensusModal, setShowConsensusModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);

  // Form states
  const [committeeForm, setCommitteeForm] = useState({
    name: "",
    description: "",
    type: "Technical" as const,
    specialization: [] as string[],
    minimumMembers: 3,
    maximumMembers: 7,
    quorumRequirement: 3,
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "Evaluator" as const,
    department: "",
    email: "",
    phone: "",
    expertise: [] as string[],
    qualifications: [] as string[],
    certifications: [] as string[],
    conflictOfInterest: false,
  });

  const [scoringData, setScoringData] = useState<{ [vendorId: string]: { [criteriaId: string]: number } }>({});
  const [currentMemberScoring, setCurrentMemberScoring] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      
      // Load committees
      const committeesKey = `${ministryCode}_${STORAGE_KEYS.COMMITTEES}`;
      const storedCommittees = localStorage.getItem(committeesKey);
      if (storedCommittees) {
        setCommittees(JSON.parse(storedCommittees));
      } else {
        const sampleCommittees = createSampleCommittees(ministryCode);
        setCommittees(sampleCommittees);
        localStorage.setItem(committeesKey, JSON.stringify(sampleCommittees));
      }

      // Load evaluation sessions
      const sessionsKey = `${ministryCode}_${STORAGE_KEYS.EVALUATION_SESSIONS}`;
      const storedSessions = localStorage.getItem(sessionsKey);
      if (storedSessions) {
        setEvaluationSessions(JSON.parse(storedSessions));
      } else {
        const sampleSessions = createSampleSessions(ministryCode);
        setEvaluationSessions(sampleSessions);
        localStorage.setItem(sessionsKey, JSON.stringify(sampleSessions));
      }

      // Load member pool
      const memberPoolKey = `${ministryCode}_${STORAGE_KEYS.MEMBER_POOL}`;
      const storedMemberPool = localStorage.getItem(memberPoolKey);
      if (storedMemberPool) {
        setMemberPool(JSON.parse(storedMemberPool));
      } else {
        const sampleMemberPool = createSampleMemberPool(ministryCode);
        setMemberPool(sampleMemberPool);
        localStorage.setItem(memberPoolKey, JSON.stringify(sampleMemberPool));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = (type: string, data: any) => {
    try {
      const ministryUser = JSON.parse(localStorage.getItem("ministryUser") || "{}");
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${type}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const createSampleCommittees = (ministryCode: string): EvaluationCommittee[] => {
    const baseCommittee: EvaluationCommittee = {
      id: "EC-2024-001",
      name: "Medical Equipment Evaluation Committee",
      description: "Specialized committee for evaluating medical equipment procurement",
      type: "Technical",
      chairperson: "MEM-001",
      secretary: "MEM-002",
      createdDate: "2024-01-10",
      status: "Active",
      specialization: ["Medical Equipment", "Healthcare Technology", "Quality Assurance"],
      minimumMembers: 3,
      maximumMembers: 7,
      quorumRequirement: 3,
      evaluationCriteria: ["Technical Specifications", "Quality Standards", "Price", "Delivery Timeline", "After Sales Support"],
      workload: 3,
      members: [
        {
          id: "MEM-001",
          name: "Dr. Amina Hassan",
          role: "Chair",
          department: "Medical Services",
          email: "amina.hassan@health.kano.gov.ng",
          phone: "08012345678",
          conflictOfInterest: false,
          expertise: ["Medical Equipment", "Clinical Engineering", "Quality Assurance"],
          availability: "Available",
          evaluationHistory: [
            {
              evaluationId: "EVAL-2024-001",
              tenderTitle: "Hospital Equipment Supply",
              date: "2024-02-15",
              role: "Chair",
              performanceScore: 9.2,
              notes: "Excellent leadership and technical analysis",
            },
          ],
          performanceRating: 9.2,
          dateJoined: "2024-01-10",
          qualifications: ["MBBS", "MSc Medical Equipment Technology"],
          certifications: ["Medical Equipment Certification", "Quality Management"],
        },
        {
          id: "MEM-002",
          name: "Eng. Musa Ibrahim",
          role: "Secretary",
          department: "Biomedical Engineering",
          email: "musa.ibrahim@health.kano.gov.ng",
          phone: "08012345679",
          conflictOfInterest: false,
          expertise: ["Biomedical Engineering", "Equipment Procurement", "Technical Evaluation"],
          availability: "Available",
          evaluationHistory: [
            {
              evaluationId: "EVAL-2024-001",
              tenderTitle: "Hospital Equipment Supply",
              date: "2024-02-15",
              role: "Secretary",
              performanceScore: 8.8,
              notes: "Thorough documentation and technical evaluation",
            },
          ],
          performanceRating: 8.8,
          dateJoined: "2024-01-10",
          qualifications: ["BSc Biomedical Engineering", "MSc Engineering Management"],
          certifications: ["Professional Engineer", "Biomedical Equipment Specialist"],
        },
        {
          id: "MEM-003",
          name: "Dr. Fatima Yusuf",
          role: "Evaluator",
          department: "Hospital Management",
          email: "fatima.yusuf@health.kano.gov.ng",
          phone: "08012345680",
          conflictOfInterest: false,
          expertise: ["Hospital Management", "Healthcare Administration", "Budget Planning"],
          availability: "Available",
          evaluationHistory: [
            {
              evaluationId: "EVAL-2024-001",
              tenderTitle: "Hospital Equipment Supply",
              date: "2024-02-15",
              role: "Evaluator",
              performanceScore: 8.5,
              notes: "Strong financial and operational analysis",
            },
          ],
          performanceRating: 8.5,
          dateJoined: "2024-01-10",
          qualifications: ["MBBS", "MBA Healthcare Management"],
          certifications: ["Healthcare Administrator", "Financial Management"],
        },
      ],
      activeEvaluations: [
        {
          id: "EVAL-2024-002",
          tenderId: "MOH-2024-002",
          tenderTitle: "Pharmaceutical Supply Contract",
          status: "In Progress",
          assignedDate: "2024-03-01",
          deadline: "2024-03-15",
          priority: "High",
          progress: 65,
        },
      ],
      performanceMetrics: {
        averageCompletionTime: 12,
        evaluationsCompleted: 5,
        qualityScore: 8.8,
        memberSatisfaction: 9.1,
        consistencyScore: 8.9,
      },
    };

    if (ministryCode === "MOWI") {
      baseCommittee.name = "Infrastructure Evaluation Committee";
      baseCommittee.description = "Specialized committee for evaluating construction and infrastructure projects";
      baseCommittee.specialization = ["Civil Engineering", "Construction Management", "Infrastructure Development"];
      baseCommittee.evaluationCriteria = ["Technical Capability", "Financial Proposal", "Project Timeline", "Safety Standards", "Environmental Compliance"];
      baseCommittee.members = [
        {
          ...baseCommittee.members[0],
          name: "Eng. Ibrahim Mohammed",
          department: "Road Construction",
          email: "ibrahim.mohammed@works.kano.gov.ng",
          expertise: ["Civil Engineering", "Road Construction", "Project Management"],
          qualifications: ["BSc Civil Engineering", "MSc Construction Management"],
        },
        {
          ...baseCommittee.members[1],
          name: "Arch. Aisha Garba",
          department: "Urban Planning",
          email: "aisha.garba@works.kano.gov.ng",
          expertise: ["Architecture", "Urban Planning", "Building Construction"],
          qualifications: ["BSc Architecture", "MSc Urban Planning"],
        },
        {
          ...baseCommittee.members[2],
          name: "Eng. Usman Kano",
          department: "Bridge Engineering",
          email: "usman.kano@works.kano.gov.ng",
          expertise: ["Structural Engineering", "Bridge Construction", "Quality Control"],
          qualifications: ["BSc Structural Engineering", "MSc Bridge Engineering"],
        },
      ];
    } else if (ministryCode === "MOE") {
      baseCommittee.name = "Educational Procurement Committee";
      baseCommittee.description = "Specialized committee for evaluating educational equipment and materials";
      baseCommittee.specialization = ["Educational Technology", "Learning Materials", "School Infrastructure"];
      baseCommittee.evaluationCriteria = ["Educational Value", "Technical Quality", "Cost Effectiveness", "Age Appropriateness", "Maintenance Requirements"];
      baseCommittee.members = [
        {
          ...baseCommittee.members[0],
          name: "Prof. Aisha Garba",
          department: "Curriculum Development",
          email: "aisha.garba@education.kano.gov.ng",
          expertise: ["Educational Technology", "Curriculum Development", "Learning Materials"],
          qualifications: ["PhD Education", "MSc Educational Technology"],
        },
        {
          ...baseCommittee.members[1],
          name: "Dr. Bello Sani",
          department: "School Administration",
          email: "bello.sani@education.kano.gov.ng",
          expertise: ["School Administration", "Educational Planning", "Budget Management"],
          qualifications: ["PhD Educational Administration", "MSc Management"],
        },
        {
          ...baseCommittee.members[2],
          name: "Mal. Zainab Ibrahim",
          department: "Teacher Training",
          email: "zainab.ibrahim@education.kano.gov.ng",
          expertise: ["Teacher Training", "Educational Materials", "Quality Assurance"],
          qualifications: ["MEd Teacher Training", "BSc Education"],
        },
      ];
    }

    return [baseCommittee];
  };

  const createSampleSessions = (ministryCode: string): EvaluationSession[] => {
    return [
      {
        id: "ES-2024-001",
        committeeId: "EC-2024-001",
        tenderId: "MOH-2024-001",
        tenderTitle: "Hospital Equipment Supply",
        sessionDate: "2024-02-15",
        duration: 240,
        attendees: ["MEM-001", "MEM-002", "MEM-003"],
        agenda: [
          "Review technical specifications",
          "Evaluate vendor proposals",
          "Score each vendor",
          "Discuss consensus",
          "Finalize recommendations",
        ],
        minutes: "Committee reviewed 5 vendor proposals for hospital equipment supply. All vendors met basic technical requirements. Detailed scoring completed.",
        decisions: [
          {
            id: "DEC-001",
            type: "Vendor Ranking",
            description: "Final vendor ranking based on consensus scoring",
            votingResult: {
              inFavor: 3,
              against: 0,
              abstain: 0,
              details: {
                "MEM-001": "For",
                "MEM-002": "For", 
                "MEM-003": "For",
              },
            },
          },
        ],
        status: "Completed",
        vendors: [
          {
            vendorId: "VEN-001",
            vendorName: "PrimeCare Medical Ltd",
            individualScores: [
              {
                memberId: "MEM-001",
                memberName: "Dr. Amina Hassan",
                scores: {
                  "technical": 88,
                  "financial": 85,
                  "experience": 92,
                  "timeline": 90,
                },
                totalScore: 87.8,
                comments: "Excellent technical specifications and strong track record",
                submissionDate: "2024-02-15",
                timeSpent: 90,
              },
              {
                memberId: "MEM-002",
                memberName: "Eng. Musa Ibrahim",
                scores: {
                  "technical": 86,
                  "financial": 87,
                  "experience": 89,
                  "timeline": 88,
                },
                totalScore: 87.2,
                comments: "Good technical quality, competitive pricing",
                submissionDate: "2024-02-15",
                timeSpent: 85,
              },
              {
                memberId: "MEM-003",
                memberName: "Dr. Fatima Yusuf",
                scores: {
                  "technical": 90,
                  "financial": 83,
                  "experience": 94,
                  "timeline": 89,
                },
                totalScore: 88.1,
                comments: "Strong operational capability and experience",
                submissionDate: "2024-02-15",
                timeSpent: 75,
              },
            ],
            consensusScore: 87.7,
            technicalCompliance: true,
            recommendedRanking: 1,
            finalComments: "Top performer with consistent high scores across all criteria",
            disputeFlags: [],
          },
          {
            vendorId: "VEN-002",
            vendorName: "Falcon Diagnostics Ltd",
            individualScores: [
              {
                memberId: "MEM-001",
                memberName: "Dr. Amina Hassan",
                scores: {
                  "technical": 82,
                  "financial": 88,
                  "experience": 85,
                  "timeline": 87,
                },
                totalScore: 84.9,
                comments: "Good financial proposal with competitive pricing",
                submissionDate: "2024-02-15",
                timeSpent: 80,
              },
              {
                memberId: "MEM-002",
                memberName: "Eng. Musa Ibrahim",
                scores: {
                  "technical": 84,
                  "financial": 86,
                  "experience": 83,
                  "timeline": 85,
                },
                totalScore: 84.3,
                comments: "Adequate technical capability, good value",
                submissionDate: "2024-02-15",
                timeSpent: 78,
              },
              {
                memberId: "MEM-003",
                memberName: "Dr. Fatima Yusuf",
                scores: {
                  "technical": 80,
                  "financial": 90,
                  "experience": 86,
                  "timeline": 84,
                },
                totalScore: 84.8,
                comments: "Excellent financial proposal, adequate technical",
                submissionDate: "2024-02-15",
                timeSpent: 72,
              },
            ],
            consensusScore: 84.7,
            technicalCompliance: true,
            recommendedRanking: 2,
            finalComments: "Strong financial proposal with good technical capability",
            disputeFlags: [],
          },
        ],
        consensusBuilder: {
          totalVariance: 2.3,
          averageScore: 86.2,
          outliers: [],
          adjustmentFactors: {
            "VEN-001": 1.0,
            "VEN-002": 1.0,
          },
          finalConsensusReached: true,
        },
      },
    ];
  };

  const createSampleMemberPool = (ministryCode: string): CommitteeMember[] => {
    // This would contain available members who can be assigned to committees
    return [];
  };

  const createCommittee = () => {
    const newCommittee: EvaluationCommittee = {
      id: `EC-${Date.now()}`,
      name: committeeForm.name,
      description: committeeForm.description,
      type: committeeForm.type,
      members: [],
      chairperson: "",
      secretary: "",
      activeEvaluations: [],
      createdDate: new Date().toISOString().split('T')[0],
      status: "Active",
      specialization: committeeForm.specialization,
      minimumMembers: committeeForm.minimumMembers,
      maximumMembers: committeeForm.maximumMembers,
      quorumRequirement: committeeForm.quorumRequirement,
      evaluationCriteria: ["Technical Capability", "Financial Proposal", "Experience", "Timeline"],
      workload: 0,
      performanceMetrics: {
        averageCompletionTime: 0,
        evaluationsCompleted: 0,
        qualityScore: 0,
        memberSatisfaction: 0,
        consistencyScore: 0,
      },
    };

    const updatedCommittees = [...committees, newCommittee];
    setCommittees(updatedCommittees);
    saveData(STORAGE_KEYS.COMMITTEES, updatedCommittees);
    
    setCommitteeForm({
      name: "",
      description: "",
      type: "Technical",
      specialization: [],
      minimumMembers: 3,
      maximumMembers: 7,
      quorumRequirement: 3,
    });
    setShowCommitteeModal(false);
  };

  const addMemberToCommittee = (committeeId: string) => {
    const newMember: CommitteeMember = {
      id: `MEM-${Date.now()}`,
      name: memberForm.name,
      role: memberForm.role,
      department: memberForm.department,
      email: memberForm.email,
      phone: memberForm.phone,
      conflictOfInterest: memberForm.conflictOfInterest,
      expertise: memberForm.expertise,
      availability: "Available",
      evaluationHistory: [],
      performanceRating: 0,
      dateJoined: new Date().toISOString().split('T')[0],
      qualifications: memberForm.qualifications,
      certifications: memberForm.certifications,
    };

    const updatedCommittees = committees.map(committee => 
      committee.id === committeeId 
        ? { ...committee, members: [...committee.members, newMember] }
        : committee
    );

    setCommittees(updatedCommittees);
    saveData(STORAGE_KEYS.COMMITTEES, updatedCommittees);

    setMemberForm({
      name: "",
      role: "Evaluator",
      department: "",
      email: "",
      phone: "",
      expertise: [],
      qualifications: [],
      certifications: [],
      conflictOfInterest: false,
    });
    setShowMemberModal(false);
  };

  const removeMemberFromCommittee = (committeeId: string, memberId: string) => {
    const updatedCommittees = committees.map(committee => 
      committee.id === committeeId 
        ? { ...committee, members: committee.members.filter(member => member.id !== memberId) }
        : committee
    );

    setCommittees(updatedCommittees);
    saveData(STORAGE_KEYS.COMMITTEES, updatedCommittees);
  };

  const calculateConsensus = (vendorScores: IndividualScore[]): number => {
    if (vendorScores.length === 0) return 0;
    
    const totalScore = vendorScores.reduce((sum, score) => sum + score.totalScore, 0);
    return Math.round((totalScore / vendorScores.length) * 10) / 10;
  };

  const getVarianceLevel = (scores: number[]): "Low" | "Medium" | "High" => {
    if (scores.length < 2) return "Low";
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    if (variance < 25) return "Low";
    if (variance < 100) return "Medium";
    return "High";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "default",
      Inactive: "secondary",
      Archived: "outline",
      "In Progress": "secondary",
      Completed: "default",
      Scheduled: "outline",
      Cancelled: "destructive",
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getRoleBadge = (role: CommitteeMember["role"]) => {
    const variants = {
      Chair: "default",
      Secretary: "secondary",
      Evaluator: "outline",
      "Technical Expert": "secondary",
      Observer: "outline",
    };
    return <Badge variant={variants[role] as any}>{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evaluation Committee Management</h2>
          <p className="text-gray-600">Manage evaluation committees, members, and scoring processes</p>
        </div>
        <Button onClick={() => setShowCommitteeModal(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Committee
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="committees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Committees
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Evaluation Sessions
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Individual Scoring
          </TabsTrigger>
          <TabsTrigger value="consensus" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Consensus Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="committees" className="space-y-4">
          <div className="grid gap-4">
            {committees.map((committee) => (
              <Card key={committee.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{committee.name}</CardTitle>
                        {getStatusBadge(committee.status)}
                        <Badge variant="outline">{committee.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{committee.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Members</Label>
                          <p className="text-sm font-semibold">{committee.members.length}/{committee.maximumMembers}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Active Evaluations</Label>
                          <p className="text-sm font-semibold">{committee.activeEvaluations.length}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Quality Score</Label>
                          <p className="text-sm font-semibold">{committee.performanceMetrics.qualityScore.toFixed(1)}/10</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Completed</Label>
                          <p className="text-sm font-semibold">{committee.performanceMetrics.evaluationsCompleted}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedCommittee(committee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedCommittee(committee);
                          setShowMemberModal(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Committee Members</h4>
                      <div className="space-y-2">
                        {committee.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{member.name}</span>
                                  {getRoleBadge(member.role)}
                                  {member.conflictOfInterest && (
                                    <Badge variant="destructive" className="text-xs">
                                      COI
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {member.department} • {member.email}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Performance: {member.performanceRating.toFixed(1)}/10 • 
                                  Expertise: {member.expertise.join(", ")}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingMember(member);
                                  setMemberForm({
                                    name: member.name,
                                    role: member.role,
                                    department: member.department,
                                    email: member.email,
                                    phone: member.phone,
                                    expertise: member.expertise,
                                    qualifications: member.qualifications,
                                    certifications: member.certifications,
                                    conflictOfInterest: member.conflictOfInterest,
                                  });
                                  setShowMemberModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeMemberFromCommittee(committee.id, member.id)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {committee.activeEvaluations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Active Evaluations</h4>
                        <div className="space-y-2">
                          {committee.activeEvaluations.map((evaluation) => (
                            <div key={evaluation.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{evaluation.tenderTitle}</span>
                                  {getStatusBadge(evaluation.status)}
                                  <Badge variant="outline">{evaluation.priority}</Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Deadline: {evaluation.deadline} • Progress: {evaluation.progress}%
                                </div>
                              </div>
                              <div className="w-20">
                                <Progress value={evaluation.progress} className="h-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Evaluation Sessions</h3>
            <Button onClick={() => setShowSessionModal(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>

          <div className="grid gap-4">
            {evaluationSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{session.tenderTitle}</CardTitle>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Session Date</Label>
                          <p>{session.sessionDate}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Duration</Label>
                          <p>{Math.floor(session.duration / 60)}h {session.duration % 60}m</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Attendees</Label>
                          <p>{session.attendees.length}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Vendors</Label>
                          <p>{session.vendors.length}</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedSession(session)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {session.status === "Completed" && (
                    <div>
                      <h4 className="font-medium mb-2">Vendor Rankings</h4>
                      <div className="space-y-2">
                        {session.vendors
                          .sort((a, b) => a.recommendedRanking - b.recommendedRanking)
                          .map((vendor, index) => (
                            <div key={vendor.vendorId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-lg">#{index + 1}</span>
                                <div>
                                  <span className="font-medium">{vendor.vendorName}</span>
                                  <div className="text-sm text-gray-600">
                                    Consensus Score: {vendor.consensusScore} • 
                                    {vendor.technicalCompliance ? " Compliant" : " Non-Compliant"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{vendor.consensusScore}</span>
                                {vendor.technicalCompliance && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Individual Scoring</h3>
            <Button onClick={() => setShowScoringModal(true)} variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Enter Scores
            </Button>
          </div>

          <div className="grid gap-4">
            {evaluationSessions
              .filter(session => session.status === "In Progress")
              .map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{session.tenderTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {session.vendors.map((vendor) => (
                        <div key={vendor.vendorId} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3">{vendor.vendorName}</h4>
                          <div className="space-y-2">
                            {vendor.individualScores.map((score) => (
                              <div key={score.memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <span className="font-medium">{score.memberName}</span>
                                  <div className="text-sm text-gray-600">
                                    Submitted: {score.submissionDate} • Time: {score.timeSpent}min
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg">{score.totalScore}</span>
                                  <Badge variant="default">Submitted</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {vendor.individualScores.length > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Consensus Score</span>
                                <span className="font-bold text-lg">{calculateConsensus(vendor.individualScores)}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Variance: {getVarianceLevel(vendor.individualScores.map(s => s.totalScore))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="consensus" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Consensus Builder</h3>
            <Button onClick={() => setShowConsensusModal(true)} variant="outline">
              <Scale className="h-4 w-4 mr-2" />
              Build Consensus
            </Button>
          </div>

          <div className="grid gap-4">
            {evaluationSessions
              .filter(session => session.vendors.some(vendor => vendor.individualScores.length > 0))
              .map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{session.tenderTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Total Variance</Label>
                          <p className="font-semibold">{session.consensusBuilder.totalVariance.toFixed(1)}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Average Score</Label>
                          <p className="font-semibold">{session.consensusBuilder.averageScore.toFixed(1)}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Outliers</Label>
                          <p className="font-semibold">{session.consensusBuilder.outliers.length}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">Consensus</Label>
                          <div className="flex items-center gap-1">
                            {session.consensusBuilder.finalConsensusReached ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-semibold">
                              {session.consensusBuilder.finalConsensusReached ? "Reached" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-3">Vendor Consensus Analysis</h4>
                        <div className="space-y-3">
                          {session.vendors.map((vendor) => {
                            const scores = vendor.individualScores.map(s => s.totalScore);
                            const variance = getVarianceLevel(scores);
                            
                            return (
                              <div key={vendor.vendorId} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{vendor.vendorName}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={
                                      variance === "Low" ? "default" :
                                      variance === "Medium" ? "secondary" :
                                      "destructive"
                                    }>
                                      {variance} Variance
                                    </Badge>
                                    <span className="font-bold">{vendor.consensusScore}</span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <Label className="text-xs text-gray-500">Individual Scores</Label>
                                    <p>{scores.join(", ")}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Range</Label>
                                    <p>{Math.min(...scores)} - {Math.max(...scores)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500">Std Dev</Label>
                                    <p>{Math.sqrt(scores.reduce((sum, score) => {
                                      const mean = scores.reduce((s, sc) => s + sc, 0) / scores.length;
                                      return sum + Math.pow(score - mean, 2);
                                    }, 0) / scores.length).toFixed(1)}</p>
                                  </div>
                                </div>

                                {variance !== "Low" && (
                                  <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                                    <div className="flex items-center gap-1 text-yellow-700">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span className="font-medium">Requires Discussion</span>
                                    </div>
                                    <p className="text-yellow-600">
                                      Significant variance in individual scores. Consider committee discussion to reach consensus.
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Committee Modal */}
      <Dialog open={showCommitteeModal} onOpenChange={setShowCommitteeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Committee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="committee-name">Committee Name</Label>
              <Input
                id="committee-name"
                value={committeeForm.name}
                onChange={(e) => setCommitteeForm({...committeeForm, name: e.target.value})}
                placeholder="Enter committee name"
              />
            </div>
            <div>
              <Label htmlFor="committee-description">Description</Label>
              <Textarea
                id="committee-description"
                value={committeeForm.description}
                onChange={(e) => setCommitteeForm({...committeeForm, description: e.target.value})}
                placeholder="Describe the committee purpose"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="committee-type">Committee Type</Label>
                <Select value={committeeForm.type} onValueChange={(value: any) => setCommitteeForm({...committeeForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Combined">Combined</SelectItem>
                    <SelectItem value="Specialized">Specialized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quorum">Quorum Requirement</Label>
                <Input
                  id="quorum"
                  type="number"
                  value={committeeForm.quorumRequirement}
                  onChange={(e) => setCommitteeForm({...committeeForm, quorumRequirement: parseInt(e.target.value) || 3})}
                  min="3"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-members">Minimum Members</Label>
                <Input
                  id="min-members"
                  type="number"
                  value={committeeForm.minimumMembers}
                  onChange={(e) => setCommitteeForm({...committeeForm, minimumMembers: parseInt(e.target.value) || 3})}
                  min="3"
                />
              </div>
              <div>
                <Label htmlFor="max-members">Maximum Members</Label>
                <Input
                  id="max-members"
                  type="number"
                  value={committeeForm.maximumMembers}
                  onChange={(e) => setCommitteeForm({...committeeForm, maximumMembers: parseInt(e.target.value) || 7})}
                  min="3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCommitteeModal(false)}>
                Cancel
              </Button>
              <Button onClick={createCommittee}>
                Create Committee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Member Modal */}
      <Dialog open={showMemberModal} onOpenChange={setShowMemberModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Member" : "Add New Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                  placeholder="Member name"
                />
              </div>
              <div>
                <Label htmlFor="member-role">Role</Label>
                <Select value={memberForm.role} onValueChange={(value: any) => setMemberForm({...memberForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chair">Chair</SelectItem>
                    <SelectItem value="Secretary">Secretary</SelectItem>
                    <SelectItem value="Evaluator">Evaluator</SelectItem>
                    <SelectItem value="Technical Expert">Technical Expert</SelectItem>
                    <SelectItem value="Observer">Observer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="member-department">Department</Label>
                <Input
                  id="member-department"
                  value={memberForm.department}
                  onChange={(e) => setMemberForm({...memberForm, department: e.target.value})}
                  placeholder="Department"
                />
              </div>
              <div>
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="member-phone">Phone</Label>
              <Input
                id="member-phone"
                value={memberForm.phone}
                onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="member-expertise">Expertise (comma-separated)</Label>
              <Input
                id="member-expertise"
                value={memberForm.expertise.join(", ")}
                onChange={(e) => setMemberForm({...memberForm, expertise: e.target.value.split(", ").filter(s => s.trim())})}
                placeholder="e.g., Medical Equipment, Quality Assurance"
              />
            </div>
            <div>
              <Label htmlFor="member-qualifications">Qualifications (comma-separated)</Label>
              <Input
                id="member-qualifications"
                value={memberForm.qualifications.join(", ")}
                onChange={(e) => setMemberForm({...memberForm, qualifications: e.target.value.split(", ").filter(s => s.trim())})}
                placeholder="e.g., MBBS, MSc Engineering"
              />
            </div>
            <div>
              <Label htmlFor="member-certifications">Certifications (comma-separated)</Label>
              <Input
                id="member-certifications"
                value={memberForm.certifications.join(", ")}
                onChange={(e) => setMemberForm({...memberForm, certifications: e.target.value.split(", ").filter(s => s.trim())})}
                placeholder="e.g., Professional Engineer, Quality Management"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflict-interest"
                checked={memberForm.conflictOfInterest}
                onCheckedChange={(checked) => setMemberForm({...memberForm, conflictOfInterest: checked as boolean})}
              />
              <Label htmlFor="conflict-interest">Has Conflict of Interest</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowMemberModal(false);
                setEditingMember(null);
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (selectedCommittee) {
                  addMemberToCommittee(selectedCommittee.id);
                  setEditingMember(null);
                }
              }}>
                {editingMember ? "Update Member" : "Add Member"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
