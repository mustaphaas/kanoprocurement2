import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  Save,
  Send,
  Clock,
  FileText,
  Shield,
  Target,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  MapPin,
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
import { getClosedTenders, type ClosedTender } from "@/lib/tenderData";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types for Tender-Specific Committee Assignment
interface ClosedTender {
  id: string;
  title: string;
  category: string;
  status: "Closed" | "Evaluation_Complete" | "Awarded";
  closingDate: string;
  ministry: string;
  estimatedValue: number;
}

interface TenderCommitteeAssignment {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderCategory: string;
  committeeTemplateId: string;
  templateName: string;
  assignedMembers: AssignedMember[];
  assignmentDate: string;
  assignedBy: string;
  evaluationPeriod: {
    startDate: string;
    endDate: string;
  };
  status:
    | "Draft"
    | "Assigned"
    | "COI_Pending"
    | "Active"
    | "Completed"
    | "Suspended";
  workspaceAccess: WorkspaceAccess;
  coiDeclarations: COIDeclaration[];
  assignmentNotes: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedDate?: string;
  conflicts: ConflictIssue[];
  evaluationResults?: string;
}

interface AssignedMember {
  id: string;
  roleId: string;
  roleTitle: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  department: string;
  qualifications: string[];
  expertise: string[];
  experience: number;
  assignmentDate: string;
  status:
    | "Invited"
    | "Accepted"
    | "Declined"
    | "COI_Declared"
    | "Disqualified"
    | "Active";
  invitationSent: boolean;
  responseDate?: string;
  replacementFor?: string;
  performanceHistory: PerformanceRecord[];
  availability: {
    available: boolean;
    conflictingCommitments: string[];
    availableFrom?: string;
    availableTo?: string;
  };
}

interface WorkspaceAccess {
  workspaceId: string;
  accessLevel: "View" | "Evaluate" | "Admin";
  documentsAccess: string[];
  evaluationAccess: string[];
  deadlines: {
    documentReview: string;
    evaluationSubmission: string;
    consensusMeeting: string;
  };
  notifications: NotificationPreference[];
}

interface COIDeclaration {
  id: string;
  memberId: string;
  memberName: string;
  declarationDate: string;
  hasConflict: boolean;
  conflictDetails: ConflictDetail[];
  supportingDocuments: string[];
  reviewStatus: "Pending" | "Approved" | "Rejected" | "Needs_Clarification";
  reviewedBy?: string;
  reviewDate?: string;
  reviewComments?: string;
  mitigationMeasures: string[];
  riskLevel: "Low" | "Medium" | "High" | "Disqualifying";
}

interface ConflictDetail {
  type: "Financial" | "Personal" | "Professional" | "Contractual" | "Family";
  description: string;
  entity: string;
  relationship: string;
  value?: number;
  duration?: string;
  mitigation?: string;
}

interface ConflictIssue {
  id: string;
  type: "COI" | "Qualification" | "Availability" | "Experience";
  memberId: string;
  memberName: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Resolved" | "Mitigated" | "Escalated";
  resolutionPlan: string;
  resolvedDate?: string;
}

interface PerformanceRecord {
  evaluationId: string;
  date: string;
  rating: number;
  feedback: string;
  timeliness: number;
  quality: number;
}

interface NotificationPreference {
  type: "Email" | "SMS" | "Portal";
  events: string[];
  enabled: boolean;
}

interface MemberPool {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  qualifications: string[];
  expertise: string[];
  experience: number;
  availability: "Available" | "Busy" | "On_Leave" | "Retired";
  performanceRating: number;
  recentAssignments: string[];
  lastAssignment?: string;
  specializations: string[];
  languages: string[];
  location: string;
  clearanceLevel?: string;
}

const STORAGE_KEYS = {
  TENDER_ASSIGNMENTS: "tenderCommitteeAssignments",
  MEMBER_POOL: "memberPool",
  COI_DECLARATIONS: "coiDeclarations",
  CLOSED_TENDERS: "closedTenders",
  COMMITTEE_TEMPLATES: "committeeTemplates",
};

interface CommitteeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
}

export default function TenderCommitteeAssignment() {
  const [assignments, setAssignments] = useState<TenderCommitteeAssignment[]>(
    [],
  );
  const [memberPool, setMemberPool] = useState<MemberPool[]>([]);
  const [closedTenders, setClosedTenders] = useState<ClosedTender[]>([]);
  const [committeeTemplates, setCommitteeTemplates] = useState<
    CommitteeTemplate[]
  >([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<TenderCommitteeAssignment | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCOIModal, setShowCOIModal] = useState(false);
  const [showMemberSearchModal, setShowMemberSearchModal] = useState(false);
  const [activeTab, setActiveTab] = useState("assignments");
  const [showMemberAssignmentModal, setShowMemberAssignmentModal] =
    useState(false);
  const [selectedAssignmentForMembers, setSelectedAssignmentForMembers] =
    useState<TenderCommitteeAssignment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    tenderId: "",
    tenderTitle: "",
    tenderCategory: "",
    committeeTemplateId: "",
    evaluationStartDate: "",
    evaluationEndDate: "",
    assignmentNotes: "",
  });

  const [coiForm, setCOIForm] = useState({
    memberId: "",
    hasConflict: false,
    conflictDetails: [] as ConflictDetail[],
    supportingDocuments: [] as string[],
    mitigationMeasures: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const ministryUser = JSON.parse(
        localStorage.getItem("ministryUser") || "{}",
      );
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";

      // One-time cleanup: remove any cross-ministry contamination
      cleanupCrossMinistryContamination(ministryCode);

      // Clean up any legacy global committee templates
      const globalTemplatesKey = "committeeTemplates";
      if (localStorage.getItem(globalTemplatesKey)) {
        console.log("Removing legacy global committee templates");
        localStorage.removeItem(globalTemplatesKey);
      }

      // Load tender committee assignments
      const assignmentsKey = `${ministryCode}_${STORAGE_KEYS.TENDER_ASSIGNMENTS}`;
      const storedAssignments = localStorage.getItem(assignmentsKey);
      if (storedAssignments) {
        setAssignments(JSON.parse(storedAssignments));
      } else {
        const sampleAssignments = createSampleAssignments(ministryCode);
        setAssignments(sampleAssignments);
        localStorage.setItem(assignmentsKey, JSON.stringify(sampleAssignments));
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

      // Load closed tenders from unified data source
      const closedTendersData = getClosedTenders();
      setClosedTenders(closedTendersData);
      console.log("Loaded closed tenders:", closedTendersData);

      // Store in localStorage for consistency
      const closedTendersKey = `${ministryCode}_${STORAGE_KEYS.CLOSED_TENDERS}`;
      localStorage.setItem(closedTendersKey, JSON.stringify(closedTendersData));

      // Load committee templates
      const templatesKey = `${ministryCode}_${STORAGE_KEYS.COMMITTEE_TEMPLATES}`;
      const storedTemplates = localStorage.getItem(templatesKey);
      if (storedTemplates) {
        const parsedTemplates = JSON.parse(storedTemplates);

        // Filter templates to ensure only ministry-specific ones are loaded
        const ministrySpecificTemplates = parsedTemplates.filter(
          (template: any) => {
            // Check if template ID starts with ministry code or if it belongs to current ministry
            const belongsToMinistry =
              template.id?.startsWith(ministryCode) ||
              (ministryCode === "MOH" && template.category === "Healthcare") ||
              (ministryCode === "MOWI" &&
                template.category === "Infrastructure") ||
              (ministryCode === "MOE" && template.category === "Education");

            console.log(
              `Template ${template.id} (${template.category}) belongs to ${ministryCode}:`,
              belongsToMinistry,
            );
            return belongsToMinistry;
          },
        );

        setCommitteeTemplates(ministrySpecificTemplates);
        console.log(
          `Loaded ${ministrySpecificTemplates.length} ministry-specific committee templates for ${ministryCode}:`,
          ministrySpecificTemplates,
        );

        // Save the filtered templates back to ensure cleanup
        localStorage.setItem(
          templatesKey,
          JSON.stringify(ministrySpecificTemplates),
        );
      } else {
        // Create default templates if none exist
        const defaultTemplates = createDefaultCommitteeTemplates(ministryCode);
        setCommitteeTemplates(defaultTemplates);
        localStorage.setItem(templatesKey, JSON.stringify(defaultTemplates));
        console.log(
          `Created default committee templates for ${ministryCode}:`,
          defaultTemplates,
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = (type: string, data: any) => {
    try {
      const ministryUser = JSON.parse(
        localStorage.getItem("ministryUser") || "{}",
      );
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";
      const storageKey = `${ministryCode}_${type}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const createSampleAssignments = (
    ministryCode: string,
  ): TenderCommitteeAssignment[] => {
    const baseAssignment: TenderCommitteeAssignment = {
      id: "TCA-2024-001",
      tenderId: "KS-2024-002",
      tenderTitle: "Supply of Medical Equipment to Primary Health Centers",
      tenderCategory: "Healthcare",
      committeeTemplateId: "CT-2024-001",
      templateName: "Medical Equipment Procurement Committee",
      assignmentDate: "2024-02-10",
      assignedBy: "Procurement Director",
      evaluationPeriod: {
        startDate: "2024-02-15",
        endDate: "2024-02-28",
      },
      status: "Active",
      assignmentNotes:
        "Committee assigned for hospital equipment procurement evaluation",
      approvalRequired: true,
      approvedBy: "Permanent Secretary",
      approvedDate: "2024-02-12",
      conflicts: [],
      assignedMembers: [
        {
          id: "AM-001",
          roleId: "ROLE-001",
          roleTitle: "Committee Chairperson",
          memberId: "MEM-001",
          memberName: "Dr. Amina Hassan",
          memberEmail: "amina.hassan@health.kano.gov.ng",
          memberPhone: "08012345678",
          department: "Medical Services",
          qualifications: ["MBBS", "MSc Medical Equipment Technology"],
          expertise: [
            "Medical Equipment",
            "Clinical Engineering",
            "Quality Assurance",
          ],
          experience: 18,
          assignmentDate: "2024-02-10",
          status: "Active",
          invitationSent: true,
          responseDate: "2024-02-11",
          performanceHistory: [
            {
              evaluationId: "EVAL-2023-005",
              date: "2023-12-15",
              rating: 9.2,
              feedback: "Excellent leadership and technical analysis",
              timeliness: 9.5,
              quality: 9.0,
            },
          ],
          availability: {
            available: true,
            conflictingCommitments: [],
          },
        },
        {
          id: "AM-002",
          roleId: "ROLE-002",
          roleTitle: "Technical Secretary",
          memberId: "MEM-002",
          memberName: "Eng. Musa Ibrahim",
          memberEmail: "musa.ibrahim@health.kano.gov.ng",
          memberPhone: "08012345679",
          department: "Biomedical Engineering",
          qualifications: [
            "BSc Biomedical Engineering",
            "MSc Engineering Management",
          ],
          expertise: [
            "Biomedical Engineering",
            "Equipment Procurement",
            "Technical Evaluation",
          ],
          experience: 12,
          assignmentDate: "2024-02-10",
          status: "Active",
          invitationSent: true,
          responseDate: "2024-02-11",
          performanceHistory: [
            {
              evaluationId: "EVAL-2023-005",
              date: "2023-12-15",
              rating: 8.8,
              feedback: "Thorough documentation and technical evaluation",
              timeliness: 9.0,
              quality: 8.5,
            },
          ],
          availability: {
            available: true,
            conflictingCommitments: [],
          },
        },
        {
          id: "AM-003",
          roleId: "ROLE-003",
          roleTitle: "Clinical Evaluator",
          memberId: "MEM-003",
          memberName: "Dr. Fatima Yusuf",
          memberEmail: "fatima.yusuf@health.kano.gov.ng",
          memberPhone: "08012345680",
          department: "Hospital Management",
          qualifications: ["MBBS", "MBA Healthcare Management"],
          expertise: [
            "Hospital Management",
            "Healthcare Administration",
            "Budget Planning",
          ],
          experience: 10,
          assignmentDate: "2024-02-10",
          status: "COI_Declared",
          invitationSent: true,
          responseDate: "2024-02-11",
          performanceHistory: [
            {
              evaluationId: "EVAL-2023-005",
              date: "2023-12-15",
              rating: 8.5,
              feedback: "Strong financial and operational analysis",
              timeliness: 8.8,
              quality: 8.2,
            },
          ],
          availability: {
            available: true,
            conflictingCommitments: [],
          },
        },
        {
          id: "AM-004",
          roleId: "ROLE-004",
          roleTitle: "Financial Analyst",
          memberId: "MEM-004",
          memberName: "Mal. Bashir Ahmad",
          memberEmail: "bashir.ahmad@finance.kano.gov.ng",
          memberPhone: "08012345681",
          department: "Finance Department",
          qualifications: ["BSc Accounting", "ACA", "MBA Finance"],
          expertise: [
            "Financial Analysis",
            "Cost-Benefit Analysis",
            "Budget Planning",
          ],
          experience: 14,
          assignmentDate: "2024-02-10",
          status: "Active",
          invitationSent: true,
          responseDate: "2024-02-11",
          performanceHistory: [
            {
              evaluationId: "EVAL-2023-003",
              date: "2023-11-20",
              rating: 9.0,
              feedback: "Excellent financial analysis and budget assessment",
              timeliness: 9.2,
              quality: 8.8,
            },
          ],
          availability: {
            available: true,
            conflictingCommitments: [],
          },
        },
        {
          id: "AM-005",
          roleId: "ROLE-005",
          roleTitle: "Procurement Specialist",
          memberId: "MEM-005",
          memberName: "Mrs. Hauwa Musa",
          memberEmail: "hauwa.musa@procurement.kano.gov.ng",
          memberPhone: "08012345682",
          department: "Procurement Department",
          qualifications: [
            "BSc Business Administration",
            "Procurement Certification",
          ],
          expertise: [
            "Procurement Regulations",
            "Contract Management",
            "Vendor Assessment",
          ],
          experience: 9,
          assignmentDate: "2024-02-10",
          status: "Active",
          invitationSent: true,
          responseDate: "2024-02-11",
          performanceHistory: [
            {
              evaluationId: "EVAL-2023-008",
              date: "2024-01-10",
              rating: 8.7,
              feedback: "Strong compliance knowledge and attention to detail",
              timeliness: 8.5,
              quality: 8.9,
            },
          ],
          availability: {
            available: true,
            conflictingCommitments: [],
          },
        },
      ],
      workspaceAccess: {
        workspaceId: "WS-MOH-2024-001",
        accessLevel: "Evaluate",
        documentsAccess: [
          "Tender Documents",
          "Bid Submissions",
          "Technical Specifications",
        ],
        evaluationAccess: [
          "Technical Evaluation",
          "Financial Evaluation",
          "Scoring Sheets",
        ],
        deadlines: {
          documentReview: "2024-02-18",
          evaluationSubmission: "2024-02-25",
          consensusMeeting: "2024-02-27",
        },
        notifications: [
          {
            type: "Email",
            events: [
              "Document Upload",
              "Deadline Reminder",
              "Committee Updates",
            ],
            enabled: true,
          },
          {
            type: "SMS",
            events: ["Urgent Deadlines", "Emergency Notifications"],
            enabled: true,
          },
        ],
      },
      coiDeclarations: [
        {
          id: "COI-001",
          memberId: "MEM-003",
          memberName: "Dr. Fatima Yusuf",
          declarationDate: "2024-02-11",
          hasConflict: true,
          conflictDetails: [
            {
              type: "Professional",
              description:
                "Previously consulted for one of the bidding companies",
              entity: "Golden Gates Healthcare",
              relationship: "Consultant",
              duration: "2022-2023",
              mitigation: "Recuse from evaluation of this specific bidder",
            },
          ],
          supportingDocuments: [
            "Consulting Agreement Copy",
            "Declaration Letter",
          ],
          reviewStatus: "Approved",
          reviewedBy: "Ethics Committee",
          reviewDate: "2024-02-12",
          reviewComments:
            "Conflict manageable through recusal from specific vendor evaluation",
          mitigationMeasures: [
            "Recuse from Golden Gates Healthcare evaluation",
            "No access to Golden Gates Healthcare bid documents",
            "Exit room during Golden Gates Healthcare discussions",
          ],
          riskLevel: "Medium",
        },
      ],
    };

    // Customize for different ministries
    if (ministryCode === "MOWI") {
      baseAssignment.tenderId = "MOWI-2024-001";
      baseAssignment.tenderTitle = "Kano-Kaduna Highway Rehabilitation";
      baseAssignment.tenderCategory = "Road Construction";
      baseAssignment.templateName = "Infrastructure Procurement Committee";
      // Update member details for infrastructure focus
    } else if (ministryCode === "MOE") {
      baseAssignment.tenderId = "MOE-2024-001";
      baseAssignment.tenderTitle = "School Furniture Supply Program";
      baseAssignment.tenderCategory = "Educational Materials";
      baseAssignment.templateName = "Educational Procurement Committee";
      // Update member details for education focus
    }

    return [baseAssignment];
  };

  const cleanupCrossMinistryContamination = (currentMinistryCode: string) => {
    try {
      const allMinistryCodes = ["MOH", "MOWI", "MOE"];

      allMinistryCodes.forEach((ministryCode) => {
        const templatesKey = `${ministryCode}_${STORAGE_KEYS.COMMITTEE_TEMPLATES}`;
        const storedTemplates = localStorage.getItem(templatesKey);

        if (storedTemplates) {
          const parsedTemplates = JSON.parse(storedTemplates);

          // Filter out templates that don't belong to this ministry
          const cleanedTemplates = parsedTemplates.filter((template: any) => {
            const belongsToThisMinistry =
              template.id?.startsWith(ministryCode) ||
              (ministryCode === "MOH" && template.category === "Healthcare") ||
              (ministryCode === "MOWI" &&
                template.category === "Infrastructure") ||
              (ministryCode === "MOE" && template.category === "Education");

            if (!belongsToThisMinistry) {
              console.log(
                `Removing contaminated template ${template.id} from ${ministryCode} storage`,
              );
            }

            return belongsToThisMinistry;
          });

          // Save cleaned templates if any changes were made
          if (cleanedTemplates.length !== parsedTemplates.length) {
            localStorage.setItem(
              templatesKey,
              JSON.stringify(cleanedTemplates),
            );
            console.log(
              `Cleaned up ${ministryCode} templates: ${parsedTemplates.length} -> ${cleanedTemplates.length}`,
            );
          }
        }
      });
    } catch (error) {
      console.error("Error during cross-ministry cleanup:", error);
    }
  };

  const createDefaultCommitteeTemplates = (
    ministryCode: string,
  ): CommitteeTemplate[] => {
    // Create ministry-specific templates with unique IDs to prevent cross-contamination
    if (ministryCode === "MOH") {
      return [
        {
          id: `${ministryCode}-CT-2024-001`,
          name: "Medical Equipment Procurement Committee",
          description: "Template for medical equipment procurement",
          category: "Healthcare",
          status: "Active",
          roles: [],
          applicableTypes: [
            "Medical Devices",
            "Laboratory Equipment",
            "Pharmaceuticals",
          ],
          minimumMembers: 5,
          maximumMembers: 7,
          quorumRequirement: 4,
          createdDate: new Date().toISOString().split("T")[0],
          lastModified: new Date().toISOString().split("T")[0],
          usageCount: 0,
          evaluationFramework: {
            methodology: "QCBS",
            defaultTechnicalWeight: 70,
            defaultFinancialWeight: 30,
            allowWeightCustomization: true,
            passingTechnicalScore: 75,
            scoringScale: 100,
            evaluationCriteria: [],
            consensusRules: [],
          },
          approvalLevels: [],
          governanceRules: [],
          templateCategory: "Goods",
          auditTrail: {
            createdBy: "System",
            createdDate: new Date().toISOString().split("T")[0],
            lastModifiedBy: "System",
            lastModifiedDate: new Date().toISOString().split("T")[0],
            versionHistory: [
              {
                version: 1,
                modifiedBy: "System",
                modifiedDate: new Date().toISOString().split("T")[0],
                changes: "Initial template creation",
                reason: "Default template for Ministry of Health",
              },
            ],
          },
        },
      ];
    } else if (ministryCode === "MOWI") {
      return [
        {
          id: `${ministryCode}-CT-2024-001`,
          name: "Infrastructure Procurement Committee",
          description:
            "Template for infrastructure and construction procurement",
          category: "Infrastructure",
          status: "Active",
          roles: [],
          applicableTypes: [
            "Road Construction",
            "Bridge Construction",
            "Building Construction",
          ],
          minimumMembers: 5,
          maximumMembers: 7,
          quorumRequirement: 4,
          createdDate: new Date().toISOString().split("T")[0],
          lastModified: new Date().toISOString().split("T")[0],
          usageCount: 0,
          evaluationFramework: {
            methodology: "QCBS",
            defaultTechnicalWeight: 80,
            defaultFinancialWeight: 20,
            allowWeightCustomization: true,
            passingTechnicalScore: 75,
            scoringScale: 100,
            evaluationCriteria: [],
            consensusRules: [],
          },
          approvalLevels: [],
          governanceRules: [],
          templateCategory: "Works",
          auditTrail: {
            createdBy: "System",
            createdDate: new Date().toISOString().split("T")[0],
            lastModifiedBy: "System",
            lastModifiedDate: new Date().toISOString().split("T")[0],
            versionHistory: [
              {
                version: 1,
                modifiedBy: "System",
                modifiedDate: new Date().toISOString().split("T")[0],
                changes: "Initial template creation",
                reason:
                  "Default template for Ministry of Works and Infrastructure",
              },
            ],
          },
        },
      ];
    } else if (ministryCode === "MOE") {
      return [
        {
          id: `${ministryCode}-CT-2024-001`,
          name: "Educational Procurement Committee",
          description:
            "Template for educational equipment and materials procurement",
          category: "Education",
          status: "Active",
          roles: [],
          applicableTypes: [
            "Educational Technology",
            "School Furniture",
            "Learning Materials",
          ],
          minimumMembers: 5,
          maximumMembers: 7,
          quorumRequirement: 4,
          createdDate: new Date().toISOString().split("T")[0],
          lastModified: new Date().toISOString().split("T")[0],
          usageCount: 0,
          evaluationFramework: {
            methodology: "QCBS",
            defaultTechnicalWeight: 70,
            defaultFinancialWeight: 30,
            allowWeightCustomization: true,
            passingTechnicalScore: 75,
            scoringScale: 100,
            evaluationCriteria: [],
            consensusRules: [],
          },
          approvalLevels: [],
          governanceRules: [],
          templateCategory: "Goods",
          auditTrail: {
            createdBy: "System",
            createdDate: new Date().toISOString().split("T")[0],
            lastModifiedBy: "System",
            lastModifiedDate: new Date().toISOString().split("T")[0],
            versionHistory: [
              {
                version: 1,
                modifiedBy: "System",
                modifiedDate: new Date().toISOString().split("T")[0],
                changes: "Initial template creation",
                reason: "Default template for Ministry of Education",
              },
            ],
          },
        },
      ];
    }

    return [];
  };

  const createSampleMemberPool = (ministryCode: string): MemberPool[] => {
    const baseMemberPool: MemberPool[] = [
      {
        id: "POOL-001",
        name: "Dr. Khadija Aliyu",
        email: "khadija.aliyu@health.kano.gov.ng",
        phone: "08012345683",
        department: "Medical Services",
        position: "Deputy Director",
        qualifications: ["MBBS", "MPH", "PhD Public Health"],
        expertise: ["Public Health", "Medical Equipment", "Healthcare Policy"],
        experience: 20,
        availability: "Available",
        performanceRating: 9.1,
        recentAssignments: ["TCA-2023-005", "TCA-2023-008"],
        lastAssignment: "2023-12-15",
        specializations: ["Public Health", "Epidemiology", "Health Systems"],
        languages: ["English", "Hausa", "Arabic"],
        location: "Kano",
        clearanceLevel: "Senior",
      },
      {
        id: "POOL-002",
        name: "Eng. Abdullahi Sani",
        email: "abdullahi.sani@health.kano.gov.ng",
        phone: "08012345684",
        department: "Biomedical Engineering",
        position: "Senior Engineer",
        qualifications: [
          "BSc Electrical Engineering",
          "MSc Biomedical Engineering",
        ],
        expertise: [
          "Medical Device Technology",
          "Equipment Maintenance",
          "Quality Control",
        ],
        experience: 15,
        availability: "Available",
        performanceRating: 8.9,
        recentAssignments: ["TCA-2023-006", "TCA-2023-009"],
        lastAssignment: "2024-01-20",
        specializations: [
          "Medical Devices",
          "Biomedical Engineering",
          "Technical Standards",
        ],
        languages: ["English", "Hausa"],
        location: "Kano",
        clearanceLevel: "Senior",
      },
      {
        id: "POOL-003",
        name: "Mrs. Aisha Muhammad",
        email: "aisha.muhammad@finance.kano.gov.ng",
        phone: "08012345685",
        department: "Finance Department",
        position: "Principal Accountant",
        qualifications: ["BSc Accounting", "ACA", "MBA"],
        expertise: ["Financial Analysis", "Public Sector Accounting", "Audit"],
        experience: 12,
        availability: "Busy",
        performanceRating: 8.7,
        recentAssignments: ["TCA-2024-001"],
        lastAssignment: "2024-02-10",
        specializations: [
          "Government Accounting",
          "Financial Planning",
          "Budget Analysis",
        ],
        languages: ["English", "Hausa"],
        location: "Kano",
        clearanceLevel: "Senior",
      },
      {
        id: "POOL-004",
        name: "Dr. Ibrahim Garba",
        email: "ibrahim.garba@health.kano.gov.ng",
        phone: "08012345686",
        department: "Clinical Services",
        position: "Consultant Physician",
        qualifications: ["MBBS", "FMCP", "MSc Health Policy"],
        expertise: [
          "Internal Medicine",
          "Clinical Research",
          "Health Technology Assessment",
        ],
        experience: 18,
        availability: "Available",
        performanceRating: 9.3,
        recentAssignments: ["TCA-2023-007"],
        lastAssignment: "2023-11-30",
        specializations: ["Clinical Medicine", "Health Technology", "Research"],
        languages: ["English", "Hausa", "French"],
        location: "Kano",
        clearanceLevel: "Senior",
      },
      {
        id: "POOL-005",
        name: "Mal. Usman Dankade",
        email: "usman.dankade@procurement.kano.gov.ng",
        phone: "08012345687",
        department: "Procurement Department",
        position: "Procurement Officer",
        qualifications: ["BSc Business Administration", "MCIPS"],
        expertise: [
          "Procurement Law",
          "Contract Administration",
          "Vendor Management",
        ],
        experience: 8,
        availability: "Available",
        performanceRating: 8.4,
        recentAssignments: ["TCA-2023-010"],
        lastAssignment: "2023-10-15",
        specializations: [
          "Procurement Regulations",
          "Contract Law",
          "Vendor Assessment",
        ],
        languages: ["English", "Hausa"],
        location: "Kano",
        clearanceLevel: "Mid-Level",
      },
    ];

    // Customize for different ministries
    if (ministryCode === "MOWI") {
      // Add infrastructure-focused members
      baseMemberPool.push({
        id: "POOL-MOWI-001",
        name: "Eng. Ahmad Tijjani",
        email: "ahmad.tijjani@works.kano.gov.ng",
        phone: "08012345688",
        department: "Road Construction",
        position: "Chief Engineer",
        qualifications: [
          "BSc Civil Engineering",
          "MSc Construction Management",
          "MNSE",
        ],
        expertise: [
          "Road Construction",
          "Project Management",
          "Quality Control",
        ],
        experience: 22,
        availability: "Available",
        performanceRating: 9.4,
        recentAssignments: [],
        specializations: [
          "Highway Engineering",
          "Construction Management",
          "Quality Assurance",
        ],
        languages: ["English", "Hausa"],
        location: "Kano",
        clearanceLevel: "Senior",
      });
    } else if (ministryCode === "MOE") {
      // Add education-focused members
      baseMemberPool.push({
        id: "POOL-MOE-001",
        name: "Prof. Maryam Shehu",
        email: "maryam.shehu@education.kano.gov.ng",
        phone: "08012345689",
        department: "Curriculum Development",
        position: "Director of Education",
        qualifications: ["PhD Education", "MEd Curriculum Studies"],
        expertise: [
          "Educational Technology",
          "Curriculum Development",
          "Learning Materials",
        ],
        experience: 25,
        availability: "Available",
        performanceRating: 9.6,
        recentAssignments: [],
        specializations: [
          "Educational Technology",
          "Curriculum Design",
          "Learning Assessment",
        ],
        languages: ["English", "Hausa", "Arabic"],
        location: "Kano",
        clearanceLevel: "Senior",
      });
    }

    return baseMemberPool;
  };

  // Removed createSampleClosedTenders - now using unified data source from @/lib/tenderData

  const createAssignment = () => {
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validate required fields
    if (!assignmentForm.tenderId) {
      setErrorMessage("Please select a closed tender.");
      return;
    }
    if (!assignmentForm.committeeTemplateId) {
      setErrorMessage("Please select a committee template.");
      return;
    }
    if (!assignmentForm.evaluationStartDate) {
      setErrorMessage("Please set an evaluation start date.");
      return;
    }
    if (!assignmentForm.evaluationEndDate) {
      setErrorMessage("Please set an evaluation end date.");
      return;
    }

    // Validate date logic
    if (
      new Date(assignmentForm.evaluationStartDate) >=
      new Date(assignmentForm.evaluationEndDate)
    ) {
      setErrorMessage("Evaluation end date must be after start date.");
      return;
    }

    // Find the selected template to get its name
    const selectedTemplate = committeeTemplates.find(
      (t) => t.id === assignmentForm.committeeTemplateId,
    );

    const newAssignment: TenderCommitteeAssignment = {
      id: `TCA-${Date.now()}`,
      tenderId: assignmentForm.tenderId,
      tenderTitle: assignmentForm.tenderTitle,
      tenderCategory: assignmentForm.tenderCategory,
      committeeTemplateId: assignmentForm.committeeTemplateId,
      templateName: selectedTemplate?.name || "Unknown Template",
      assignedMembers: [],
      assignmentDate: new Date().toISOString().split("T")[0],
      assignedBy: "Current User",
      evaluationPeriod: {
        startDate: assignmentForm.evaluationStartDate,
        endDate: assignmentForm.evaluationEndDate,
      },
      status: "Draft",
      workspaceAccess: {
        workspaceId: `WS-${assignmentForm.tenderId}`,
        accessLevel: "Evaluate",
        documentsAccess: [],
        evaluationAccess: [],
        deadlines: {
          documentReview: assignmentForm.evaluationStartDate,
          evaluationSubmission: assignmentForm.evaluationEndDate,
          consensusMeeting: assignmentForm.evaluationEndDate,
        },
        notifications: [],
      },
      coiDeclarations: [],
      assignmentNotes: assignmentForm.assignmentNotes,
      approvalRequired: true,
      conflicts: [],
    };

    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    saveData(STORAGE_KEYS.TENDER_ASSIGNMENTS, updatedAssignments);

    // Log for debugging
    console.log("Created new assignment:", newAssignment);
    console.log("Updated assignments array:", updatedAssignments);

    setAssignmentForm({
      tenderId: "",
      tenderTitle: "",
      tenderCategory: "",
      committeeTemplateId: "",
      evaluationStartDate: "",
      evaluationEndDate: "",
      assignmentNotes: "",
    });
    setShowAssignmentModal(false);

    // Show success message
    setSuccessMessage("Committee assignment created successfully!");

    // Refresh committee templates after creating assignment
    loadCommitteeTemplates();
  };

  const loadCommitteeTemplates = () => {
    try {
      const ministryUser = JSON.parse(
        localStorage.getItem("ministryUser") || "{}",
      );
      const ministryCode = ministryUser.ministryId?.toUpperCase() || "MOH";

      const templatesKey = `${ministryCode}_${STORAGE_KEYS.COMMITTEE_TEMPLATES}`;
      const storedTemplates = localStorage.getItem(templatesKey);
      if (storedTemplates) {
        const parsedTemplates = JSON.parse(storedTemplates);

        // Filter templates to ensure only ministry-specific ones are loaded
        const ministrySpecificTemplates = parsedTemplates.filter(
          (template: any) => {
            const belongsToMinistry =
              template.id?.startsWith(ministryCode) ||
              (ministryCode === "MOH" && template.category === "Healthcare") ||
              (ministryCode === "MOWI" &&
                template.category === "Infrastructure") ||
              (ministryCode === "MOE" && template.category === "Education");
            return belongsToMinistry;
          },
        );

        setCommitteeTemplates(ministrySpecificTemplates);
        console.log(
          `Refreshed ${ministrySpecificTemplates.length} ministry-specific committee templates for ${ministryCode}`,
        );

        // Save the filtered templates back to ensure cleanup
        localStorage.setItem(
          templatesKey,
          JSON.stringify(ministrySpecificTemplates),
        );
      }
    } catch (error) {
      console.error("Error loading committee templates:", error);
    }
  };

  // Add effect to refresh templates when modal opens
  useEffect(() => {
    if (showAssignmentModal) {
      loadCommitteeTemplates();
    }
  }, [showAssignmentModal]);

  const submitCOIDeclaration = (assignmentId: string) => {
    const newDeclaration: COIDeclaration = {
      id: `COI-${Date.now()}`,
      memberId: coiForm.memberId,
      memberName: memberPool.find((m) => m.id === coiForm.memberId)?.name || "",
      declarationDate: new Date().toISOString().split("T")[0],
      hasConflict: coiForm.hasConflict,
      conflictDetails: coiForm.conflictDetails,
      supportingDocuments: coiForm.supportingDocuments,
      reviewStatus: "Pending",
      mitigationMeasures: coiForm.mitigationMeasures,
      riskLevel: coiForm.hasConflict ? "Medium" : "Low",
    };

    const updatedAssignments = assignments.map((assignment) =>
      assignment.id === assignmentId
        ? {
            ...assignment,
            coiDeclarations: [...assignment.coiDeclarations, newDeclaration],
            assignedMembers: assignment.assignedMembers.map((member) =>
              member.memberId === coiForm.memberId
                ? {
                    ...member,
                    status: coiForm.hasConflict
                      ? "COI_Declared"
                      : ("Active" as const),
                  }
                : member,
            ),
          }
        : assignment,
    );

    setAssignments(updatedAssignments);
    saveData(STORAGE_KEYS.TENDER_ASSIGNMENTS, updatedAssignments);

    setCOIForm({
      memberId: "",
      hasConflict: false,
      conflictDetails: [],
      supportingDocuments: [],
      mitigationMeasures: [],
    });
    setShowCOIModal(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Draft: "secondary",
      Assigned: "outline",
      COI_Pending: "outline",
      Active: "default",
      Completed: "default",
      Suspended: "destructive",
      Invited: "outline",
      Accepted: "default",
      Declined: "destructive",
      COI_Declared: "outline",
      Disqualified: "destructive",
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      Low: "default",
      Medium: "outline",
      High: "destructive",
      Disqualifying: "destructive",
    };
    return (
      <Badge variant={variants[riskLevel as keyof typeof variants] as any}>
        {riskLevel}
      </Badge>
    );
  };

  const filteredAssignments = assignments.filter((assignment) => {
    // Handle empty or undefined values gracefully
    const tenderTitle = assignment.tenderTitle || "";
    const tenderId = assignment.tenderId || "";
    const searchTermLower = searchTerm.toLowerCase().trim();

    const matchesSearch =
      searchTermLower === "" || // Show all if no search term
      tenderTitle.toLowerCase().includes(searchTermLower) ||
      tenderId.toLowerCase().includes(searchTermLower) ||
      assignment.templateName?.toLowerCase().includes(searchTermLower) ||
      assignment.tenderCategory?.toLowerCase().includes(searchTermLower);

    const matchesFilter =
      filterStatus === "all" || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Debug: Log current state (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("TenderCommitteeAssignment - Debug Info:", {
      closedTenders: closedTenders.length,
      committeeTemplates: committeeTemplates.length,
      totalAssignments: assignments.length,
      filteredAssignments: filteredAssignments.length,
      searchTerm,
      filterStatus,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Tender Committee Assignment
          </h2>
          <p className="text-gray-600">
            Assign committee members to specific tenders with COI management
          </p>
          {closedTenders.length === 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              ⚠️ No closed tenders available for assignment
            </p>
          )}
          {committeeTemplates.length === 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              ⚠️ No committee templates available
            </p>
          )}
        </div>
        <Button
          onClick={() => {
            setShowAssignmentModal(true);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Committee Assignments
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Member Assignment
          </TabsTrigger>
          <TabsTrigger value="coi" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            COI Management
          </TabsTrigger>
          <TabsTrigger value="pool" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Member Pool
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assignments..."
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
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="COI_Pending">COI Pending</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {assignments.length === 0 ? (
                  <div>
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                      No Committee Assignments
                    </h3>
                    <p className="text-sm">
                      Create your first committee assignment to get started.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                      No Matches Found
                    </h3>
                    <p className="text-sm">
                      Try adjusting your search terms or filters.
                    </p>
                    <p className="text-xs mt-2">
                      Total assignments: {assignments.length}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {assignment.tenderTitle}
                          </CardTitle>
                          {getStatusBadge(assignment.status)}
                          <Badge variant="outline">
                            {assignment.tenderCategory}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Tender ID: {assignment.tenderId} • Template:{" "}
                          {assignment.templateName}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs font-medium text-gray-500">
                              Members Assigned
                            </Label>
                            <p className="text-sm font-semibold">
                              {assignment.assignedMembers.length}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">
                              COI Declarations
                            </Label>
                            <p className="text-sm font-semibold">
                              {assignment.coiDeclarations.length}
                              {assignment.coiDeclarations.some(
                                (coi) => coi.hasConflict,
                              ) && (
                                <AlertTriangle className="inline h-3 w-3 ml-1 text-yellow-600" />
                              )}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">
                              Evaluation Period
                            </Label>
                            <p className="text-sm font-semibold">
                              {assignment.evaluationPeriod.startDate} to{" "}
                              {assignment.evaluationPeriod.endDate}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">
                              Conflicts
                            </Label>
                            <p className="text-sm font-semibold">
                              {assignment.conflicts.length}
                              {assignment.conflicts.some(
                                (c) => c.severity === "Critical",
                              ) && (
                                <XCircle className="inline h-3 w-3 ml-1 text-red-600" />
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {assignment.status === "Assigned" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowCOIModal(true);
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Assigned Members</h4>
                        <div className="space-y-2">
                          {assignment.assignedMembers
                            .slice(0, 3)
                            .map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <span className="font-medium">
                                      {member.memberName}
                                    </span>
                                    <span className="text-sm text-gray-600 ml-2">
                                      ({member.roleTitle})
                                    </span>
                                    <div className="text-xs text-gray-500">
                                      {member.department} • {member.experience}+
                                      years
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(member.status)}
                                  {member.status === "COI_Declared" && (
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          {assignment.assignedMembers.length > 3 && (
                            <div className="text-sm text-gray-500 text-center py-1">
                              +{assignment.assignedMembers.length - 3} more
                              members
                            </div>
                          )}
                        </div>
                      </div>

                      {assignment.coiDeclarations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            COI Declarations (
                            {assignment.coiDeclarations.length})
                          </h4>
                          <div className="space-y-2">
                            {assignment.coiDeclarations.map((coi) => (
                              <div
                                key={coi.id}
                                className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                              >
                                <div>
                                  <span className="font-medium">
                                    {coi.memberName}
                                  </span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    {coi.hasConflict
                                      ? "Conflict Declared"
                                      : "No Conflict"}
                                  </span>
                                  {coi.hasConflict && (
                                    <div className="text-xs text-gray-500">
                                      {coi.conflictDetails
                                        .map((detail) => detail.type)
                                        .join(", ")}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {getRiskBadge(coi.riskLevel)}
                                  <Badge
                                    variant={
                                      coi.reviewStatus === "Approved"
                                        ? "default"
                                        : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {coi.reviewStatus}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {assignment.conflicts.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {assignment.conflicts.length} conflict(s) require
                            attention. Review member assignments and COI
                            declarations.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Member Assignment to Committees
            </h3>
            <Button
              onClick={() => setShowMemberAssignmentModal(true)}
              variant="outline"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Assign Members
            </Button>
          </div>

          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {assignment.tenderTitle}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {assignment.tenderId} • {assignment.templateName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(assignment.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAssignmentForMembers(assignment);
                          setShowMemberAssignmentModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Current Committee Members (
                        {assignment.assignedMembers.length})
                      </h4>
                      {assignment.assignedMembers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No members assigned yet</p>
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setSelectedAssignmentForMembers(assignment);
                              setShowMemberAssignmentModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Assign First Member
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {assignment.assignedMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {member.memberName}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {member.roleTitle}
                                    </Badge>
                                    {getStatusBadge(member.status)}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {member.department} • {member.experience}+
                                    years
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Expertise: {member.expertise.join(", ")}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coi" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Conflict of Interest Management
            </h3>
            <Button onClick={() => setShowCOIModal(true)} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              New COI Declaration
            </Button>
          </div>

          <div className="grid gap-4">
            {assignments
              .flatMap((assignment) =>
                assignment.coiDeclarations.map((coi) => ({
                  ...coi,
                  tenderTitle: assignment.tenderTitle,
                  tenderId: assignment.tenderId,
                })),
              )
              .map((coi) => (
                <Card key={coi.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {coi.memberName}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Tender: {coi.tenderTitle} ({coi.tenderId})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRiskBadge(coi.riskLevel)}
                        <Badge
                          variant={
                            coi.reviewStatus === "Approved"
                              ? "default"
                              : "outline"
                          }
                        >
                          {coi.reviewStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Declaration Date
                          </Label>
                          <p className="text-sm">{coi.declarationDate}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Has Conflict
                          </Label>
                          <p className="text-sm flex items-center gap-1">
                            {coi.hasConflict ? (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                Yes
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                No
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {coi.hasConflict && coi.conflictDetails.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">
                            Conflict Details
                          </Label>
                          <div className="space-y-2 mt-1">
                            {coi.conflictDetails.map((detail, index) => (
                              <div
                                key={index}
                                className="p-2 bg-red-50 rounded border-l-4 border-red-500"
                              >
                                <div className="font-medium text-red-900">
                                  {detail.type} Conflict
                                </div>
                                <div className="text-sm text-red-800">
                                  {detail.description}
                                </div>
                                <div className="text-xs text-red-700">
                                  Entity: {detail.entity} • Relationship:{" "}
                                  {detail.relationship}
                                  {detail.duration &&
                                    ` • Duration: ${detail.duration}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {coi.mitigationMeasures.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">
                            Mitigation Measures
                          </Label>
                          <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
                            {coi.mitigationMeasures.map((measure, index) => (
                              <li key={index} className="text-gray-700">
                                {measure}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {coi.reviewComments && (
                        <div>
                          <Label className="text-sm font-medium">
                            Review Comments
                          </Label>
                          <p className="text-sm text-gray-700 mt-1">
                            {coi.reviewComments}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            Reviewed by: {coi.reviewedBy} on {coi.reviewDate}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="pool" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Member Pool</h3>
            <Button
              onClick={() => setShowMemberSearchModal(true)}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Members
            </Button>
          </div>

          <div className="grid gap-4">
            {memberPool.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <Badge
                          variant={
                            member.availability === "Available"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {member.availability}
                        </Badge>
                        <Badge variant="outline">{member.clearanceLevel}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {member.position} • {member.department}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-gray-500">
                            Experience
                          </Label>
                          <p className="text-sm font-semibold">
                            {member.experience} years
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">
                            Performance
                          </Label>
                          <p className="text-sm font-semibold">
                            {member.performanceRating}/10
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">
                            Recent Assignments
                          </Label>
                          <p className="text-sm font-semibold">
                            {member.recentAssignments.length}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-gray-500">
                            Last Assignment
                          </Label>
                          <p className="text-sm font-semibold">
                            {member.lastAssignment || "Never"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">
                        Contact Information
                      </Label>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {member.location}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Expertise Areas
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.expertise.map((area) => (
                          <Badge
                            key={area}
                            variant="outline"
                            className="text-xs"
                          >
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Qualifications
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.qualifications.map((qual) => (
                          <Badge
                            key={qual}
                            variant="secondary"
                            className="text-xs"
                          >
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Languages</Label>
                      <p className="text-sm text-gray-700">
                        {member.languages.join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Assignment Modal */}
      <Dialog
        open={showAssignmentModal}
        onOpenChange={(open) => {
          setShowAssignmentModal(open);
          if (!open) {
            setErrorMessage("");
            setSuccessMessage("");
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create Committee Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">{successMessage}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tender-id">Select Closed Tender</Label>
                <Select
                  value={assignmentForm.tenderId}
                  onValueChange={(value) => {
                    const selectedTender = closedTenders.find(
                      (t) => t.id === value,
                    );
                    setAssignmentForm({
                      ...assignmentForm,
                      tenderId: value,
                      tenderTitle: selectedTender?.title || "",
                      tenderCategory: selectedTender?.category || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a closed tender" />
                  </SelectTrigger>
                  <SelectContent>
                    {closedTenders.map((tender) => (
                      <SelectItem key={tender.id} value={tender.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{tender.id}</span>
                          <span className="text-sm text-gray-600">
                            {tender.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            {tender.category} • Closed: {tender.closingDate}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tender-category">Category</Label>
                <Input
                  id="tender-category"
                  value={assignmentForm.tenderCategory}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      tenderCategory: e.target.value,
                    })
                  }
                  placeholder="Auto-filled from tender selection"
                  disabled
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tender-title">Tender Title</Label>
              <Input
                id="tender-title"
                value={assignmentForm.tenderTitle}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    tenderTitle: e.target.value,
                  })
                }
                placeholder="Auto-filled from tender selection"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="committee-template">Committee Template</Label>
              <Select
                value={assignmentForm.committeeTemplateId}
                onValueChange={(value) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    committeeTemplateId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select committee template" />
                </SelectTrigger>
                <SelectContent>
                  {committeeTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-sm text-gray-600">
                          {template.description}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.category} • {template.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eval-start">Evaluation Start Date</Label>
                <Input
                  id="eval-start"
                  type="date"
                  value={assignmentForm.evaluationStartDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      evaluationStartDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="eval-end">Evaluation End Date</Label>
                <Input
                  id="eval-end"
                  type="date"
                  value={assignmentForm.evaluationEndDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      evaluationEndDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="assignment-notes">Assignment Notes</Label>
              <Textarea
                id="assignment-notes"
                value={assignmentForm.assignmentNotes}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    assignmentNotes: e.target.value,
                  })
                }
                placeholder="Add any special instructions or notes"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => setShowAssignmentModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={createAssignment}>Create Assignment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* COI Declaration Modal */}
      <Dialog open={showCOIModal} onOpenChange={setShowCOIModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Conflict of Interest Declaration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label htmlFor="coi-member">Committee Member</Label>
              <Select
                value={coiForm.memberId}
                onValueChange={(value) =>
                  setCOIForm({ ...coiForm, memberId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select committee member" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAssignment?.assignedMembers.map((member) => (
                    <SelectItem key={member.memberId} value={member.memberId}>
                      {member.memberName} ({member.roleTitle})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-conflict"
                checked={coiForm.hasConflict}
                onCheckedChange={(checked) =>
                  setCOIForm({ ...coiForm, hasConflict: checked as boolean })
                }
              />
              <Label htmlFor="has-conflict">
                I declare that I have a conflict of interest
              </Label>
            </div>

            {coiForm.hasConflict && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Conflict Details</h4>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please provide detailed information about your conflict of
                      interest. This information will be used to determine
                      appropriate mitigation measures.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="conflict-type">Type of Conflict</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select conflict type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Financial">
                          Financial Interest
                        </SelectItem>
                        <SelectItem value="Personal">
                          Personal Relationship
                        </SelectItem>
                        <SelectItem value="Professional">
                          Professional Relationship
                        </SelectItem>
                        <SelectItem value="Contractual">
                          Contractual Relationship
                        </SelectItem>
                        <SelectItem value="Family">
                          Family Relationship
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="conflict-description">
                      Description of Conflict
                    </Label>
                    <Textarea
                      id="conflict-description"
                      placeholder="Describe the nature of your conflict of interest"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="conflict-entity">Entity/Company</Label>
                      <Input
                        id="conflict-entity"
                        placeholder="Name of company or entity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="conflict-relationship">
                        Relationship
                      </Label>
                      <Input
                        id="conflict-relationship"
                        placeholder="e.g., Consultant, Shareholder, Employee"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mitigation-measures">
                      Proposed Mitigation Measures
                    </Label>
                    <Textarea
                      id="mitigation-measures"
                      placeholder="How do you propose to manage this conflict?"
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button variant="outline" onClick={() => setShowCOIModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedAssignment &&
                  submitCOIDeclaration(selectedAssignment.id)
                }
              >
                Submit Declaration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
