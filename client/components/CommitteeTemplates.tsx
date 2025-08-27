import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Eye,
  Save,
  Trash2,
  UserCheck,
  AlertTriangle,
  Target,
  FileText,
  Settings,
  CheckCircle,
  Info,
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
import { Separator } from "@/components/ui/separator";

// Types for Planning Stage Committee Templates
interface CommitteeRoleTemplate {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requiredQualifications: string[];
  requiredExpertise: string[];
  minimumExperience: number;
  mandatoryRole: boolean;
  conflictOfInterestAllowed: boolean; // Binary: true = allowed, false = strictly prohibited
  minimumRequired: number; // Minimum number of this role required
  maxConflictScore?: number; // Maximum allowed conflict of interest score
}

interface CommitteeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  applicableTypes: string[];
  minimumMembers: number;
  maximumMembers: number;
  quorumRequirement: number;
  roles: CommitteeRoleTemplate[];
  evaluationFramework: EvaluationFramework;
  approvalLevels: ApprovalLevel[];
  createdDate: string;
  lastModified: string;
  status: "Draft" | "Active" | "Archived";
  usageCount: number;
  governanceRules: GovernanceRule[];
  auditTrail: AuditTrail;
  templateCategory: "Goods" | "Works" | "Services" | "Consultancy";
}

interface EvaluationFramework {
  methodology: "QCBS" | "QBS" | "LCS" | "FBS";
  defaultTechnicalWeight: number; // Default weight, can be adjusted per tender
  defaultFinancialWeight: number; // Default weight, can be adjusted per tender
  technicalWeightPercent?: number; // Legacy property for backward compatibility
  financialWeightPercent?: number; // Legacy property for backward compatibility
  allowWeightCustomization: boolean; // Whether weights can be modified per tender
  passingTechnicalScore: number; // Configurable threshold
  scoringScale: number; // e.g., 100 or 10
  evaluationCriteria: FrameworkCriteria[];
  consensusRules: ConsensusRule[];
}

interface FrameworkCriteria {
  id: string;
  category: "Technical" | "Financial" | "Experience" | "Compliance";
  name: string;
  weight: number;
  maxScore: number;
  passingScore: number;
  evaluationMethod: "Numerical" | "Pass/Fail" | "Ranked" | "Weighted";
  subCriteria: SubFrameworkCriteria[];
}

interface SubFrameworkCriteria {
  id: string;
  name: string;
  weight: number;
  description: string;
  evaluationGuidelines: string;
}

interface ConsensusRule {
  type: "Unanimous" | "Majority" | "Weighted Average" | "Chair Decision";
  threshold?: number;
  applicableToStage: "Qualification" | "Technical" | "Financial" | "Final";
  conflictResolution: string;
}

interface ApprovalLevel {
  level: number;
  title: string;
  description: string;
  requiredRole: string;
  timeframe: number; // hours
  escalationRules: string;
}

interface GovernanceRule {
  id: string;
  type: "COI" | "Rotation" | "Term Limit" | "Experience" | "Independence";
  description: string;
  enforcement: "Mandatory" | "Recommended" | "Advisory";
  penalty: string;
}

interface AuditTrail {
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  versionHistory: VersionHistory[];
}

interface VersionHistory {
  version: number;
  modifiedBy: string;
  modifiedDate: string;
  changes: string;
  reason: string;
}

const STORAGE_KEY = "committeeTemplates";

export default function CommitteeTemplates() {
  const [templates, setTemplates] = useState<CommitteeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CommitteeTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<CommitteeTemplate | null>(null);

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "",
    applicableTypes: [] as string[],
    minimumMembers: 3,
    maximumMembers: 7,
    quorumRequirement: 3,
    methodology: "QCBS" as const,
    technicalWeightPercent: 70,
    financialWeightPercent: 30,
    passingTechnicalScore: 75,
  });

  const [roleForm, setRoleForm] = useState({
    title: "",
    description: "",
    responsibilities: [] as string[],
    requiredQualifications: [] as string[],
    requiredExpertise: [] as string[],
    minimumExperience: 3,
    mandatoryRole: true,
    maxConflictScore: 3,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const ministryUser = JSON.parse(
        localStorage.getItem("ministryUser") || "{}",
      );
      const ministryCode =
        ministryUser.ministryCode?.toUpperCase() ||
        ministryUser.ministryId?.toUpperCase() ||
        "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;

      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedTemplates = JSON.parse(stored);
        // Ensure all templates have auditTrail property for backwards compatibility
        const templatesWithAuditTrail = parsedTemplates.map((template: any) => {
          const migratedTemplate = { ...template };

          // Ensure auditTrail exists
          if (!migratedTemplate.auditTrail) {
            migratedTemplate.auditTrail = {
              createdBy: "Legacy",
              createdDate: template.createdDate || "2024-01-01",
              lastModifiedBy: "Legacy",
              lastModifiedDate: template.lastModified || "2024-01-01",
              versionHistory: [
                {
                  version: 1,
                  modifiedBy: "Legacy",
                  modifiedDate: template.createdDate || "2024-01-01",
                  changes: "Legacy template migration",
                  reason: "Added missing auditTrail",
                },
              ],
            };
          }

          // Ensure all array properties exist
          if (!migratedTemplate.roles) {
            migratedTemplate.roles = [];
          }
          if (!migratedTemplate.applicableTypes) {
            migratedTemplate.applicableTypes = [];
          }
          if (!migratedTemplate.governanceRules) {
            migratedTemplate.governanceRules = [];
          }
          if (!migratedTemplate.approvalLevels) {
            migratedTemplate.approvalLevels = [];
          }

          return migratedTemplate;
        });
        setTemplates(templatesWithAuditTrail);
        // Save the migrated templates back to localStorage
        localStorage.setItem(
          storageKey,
          JSON.stringify(templatesWithAuditTrail),
        );
      } else {
        const sampleTemplates = createSampleTemplates(ministryCode);
        setTemplates(sampleTemplates);
        localStorage.setItem(storageKey, JSON.stringify(sampleTemplates));
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const saveTemplates = (updatedTemplates: CommitteeTemplate[]) => {
    try {
      const ministryUser = JSON.parse(
        localStorage.getItem("ministryUser") || "{}",
      );
      const ministryCode =
        ministryUser.ministryCode?.toUpperCase() ||
        ministryUser.ministryId?.toUpperCase() ||
        "MOH";
      const storageKey = `${ministryCode}_${STORAGE_KEY}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error("Error saving templates:", error);
    }
  };

  const createSampleTemplates = (ministryCode: string): CommitteeTemplate[] => {
    const baseTemplate: CommitteeTemplate = {
      id: "CT-2024-001",
      name: "Medical Equipment Procurement Committee",
      description:
        "Template for evaluating medical equipment and healthcare technology procurement",
      category: "Medical Equipment",
      applicableTypes: [
        "Medical Equipment",
        "Healthcare Technology",
        "Laboratory Equipment",
      ],
      minimumMembers: 5,
      maximumMembers: 7,
      quorumRequirement: 4,
      createdDate: "2024-01-15",
      lastModified: "2024-02-10",
      status: "Active",
      usageCount: 12,
      roles: [
        {
          id: "ROLE-001",
          title: "Committee Chairperson",
          description:
            "Senior medical professional responsible for leading evaluations",
          responsibilities: [
            "Lead committee meetings and deliberations",
            "Ensure fair and transparent evaluation process",
            "Make final decisions in case of deadlocks",
            "Sign off on final recommendations",
          ],
          requiredQualifications: [
            "Medical degree (MBBS/MD) or equivalent",
            "Minimum 15 years clinical experience",
            "Previous committee leadership experience",
          ],
          requiredExpertise: [
            "Clinical Medicine",
            "Healthcare Administration",
            "Medical Equipment Knowledge",
          ],
          minimumExperience: 15,
          mandatoryRole: true,
          maxConflictScore: 2,
        },
        {
          id: "ROLE-002",
          title: "Technical Secretary",
          description:
            "Biomedical engineer responsible for technical evaluation and documentation",
          responsibilities: [
            "Coordinate technical evaluations",
            "Maintain evaluation documentation",
            "Provide technical analysis and reports",
            "Ensure compliance with technical standards",
          ],
          requiredQualifications: [
            "Engineering degree in Biomedical/Electrical/Mechanical",
            "Professional engineering certification",
            "Minimum 10 years relevant experience",
          ],
          requiredExpertise: [
            "Biomedical Engineering",
            "Medical Device Technology",
            "Quality Assurance",
          ],
          minimumExperience: 10,
          mandatoryRole: true,
          maxConflictScore: 3,
        },
        {
          id: "ROLE-003",
          title: "Clinical Evaluator",
          description:
            "Medical specialist with expertise in relevant clinical area",
          responsibilities: [
            "Evaluate clinical utility and safety",
            "Assess compatibility with clinical workflows",
            "Provide clinical perspective on equipment",
            "Review user requirements and specifications",
          ],
          requiredQualifications: [
            "Medical degree with specialization",
            "Minimum 8 years clinical practice",
            "Experience with medical equipment",
          ],
          requiredExpertise: [
            "Clinical Practice",
            "Medical Equipment Usage",
            "Patient Safety",
          ],
          minimumExperience: 8,
          mandatoryRole: true,
          maxConflictScore: 3,
        },
        {
          id: "ROLE-004",
          title: "Financial Analyst",
          description: "Finance professional for cost-benefit analysis",
          responsibilities: [
            "Analyze financial proposals",
            "Conduct cost-benefit analysis",
            "Evaluate payment terms and conditions",
            "Assess budget impact and sustainability",
          ],
          requiredQualifications: [
            "Degree in Finance, Accounting, or Economics",
            "Professional certification (CPA, CFA, etc.)",
            "Minimum 7 years financial analysis experience",
          ],
          requiredExpertise: [
            "Financial Analysis",
            "Cost-Benefit Analysis",
            "Budget Planning",
          ],
          minimumExperience: 7,
          mandatoryRole: true,
          maxConflictScore: 2,
        },
        {
          id: "ROLE-005",
          title: "Procurement Specialist",
          description:
            "Procurement expert ensuring compliance with regulations",
          responsibilities: [
            "Ensure procurement compliance",
            "Review contract terms and conditions",
            "Assess vendor qualifications",
            "Monitor evaluation process integrity",
          ],
          requiredQualifications: [
            "Degree in Business, Law, or related field",
            "Procurement certification",
            "Minimum 8 years procurement experience",
          ],
          requiredExpertise: [
            "Procurement Regulations",
            "Contract Management",
            "Vendor Assessment",
          ],
          minimumExperience: 8,
          mandatoryRole: false,
          maxConflictScore: 1,
        },
      ],
      evaluationFramework: {
        methodology: "QCBS",
        defaultTechnicalWeight: 70,
        defaultFinancialWeight: 30,
        allowWeightCustomization: true,
        passingTechnicalScore: 75,
        scoringScale: 100,
        evaluationCriteria: [
          {
            id: "CRIT-001",
            category: "Technical",
            name: "Technical Specifications",
            weight: 40,
            maxScore: 100,
            passingScore: 75,
            evaluationMethod: "Numerical",
            subCriteria: [
              {
                id: "SUB-001",
                name: "Equipment Performance",
                weight: 50,
                description: "Technical performance and capabilities",
                evaluationGuidelines:
                  "Evaluate against specified performance parameters",
              },
              {
                id: "SUB-002",
                name: "Standards Compliance",
                weight: 30,
                description: "Compliance with international standards",
                evaluationGuidelines:
                  "Verify certifications and compliance documentation",
              },
              {
                id: "SUB-003",
                name: "Innovation and Technology",
                weight: 20,
                description: "Level of innovation and advanced technology",
                evaluationGuidelines:
                  "Assess technological advancement and future-proofing",
              },
            ],
          },
          {
            id: "CRIT-002",
            category: "Experience",
            name: "Company Experience",
            weight: 20,
            maxScore: 100,
            passingScore: 60,
            evaluationMethod: "Numerical",
            subCriteria: [
              {
                id: "SUB-004",
                name: "Relevant Experience",
                weight: 70,
                description: "Experience in similar projects and equipment",
                evaluationGuidelines:
                  "Evaluate similar project portfolio and track record",
              },
              {
                id: "SUB-005",
                name: "References and Testimonials",
                weight: 30,
                description: "Quality of client references",
                evaluationGuidelines:
                  "Contact references and verify testimonials",
              },
            ],
          },
          {
            id: "CRIT-003",
            category: "Compliance",
            name: "Regulatory Compliance",
            weight: 10,
            maxScore: 100,
            passingScore: 100,
            evaluationMethod: "Pass/Fail",
            subCriteria: [
              {
                id: "SUB-006",
                name: "Legal Compliance",
                weight: 100,
                description: "All regulatory and legal requirements met",
                evaluationGuidelines:
                  "Verify all required licenses and certifications",
              },
            ],
          },
        ],
        consensusRules: [
          {
            type: "Majority",
            threshold: 60,
            applicableToStage: "Technical",
            conflictResolution: "Chair has deciding vote in case of tie",
          },
          {
            type: "Unanimous",
            applicableToStage: "Qualification",
            conflictResolution: "Must reach consensus or exclude vendor",
          },
        ],
      },
      approvalLevels: [
        {
          level: 1,
          title: "Committee Recommendation",
          description:
            "Committee completes evaluation and provides recommendation",
          requiredRole: "Committee Chairperson",
          timeframe: 72,
          escalationRules:
            "Escalate to Procurement Director if not completed within timeframe",
        },
        {
          level: 2,
          title: "Technical Review",
          description: "Technical director reviews methodology and findings",
          requiredRole: "Technical Director",
          timeframe: 48,
          escalationRules:
            "Escalate to Permanent Secretary if significant issues found",
        },
        {
          level: 3,
          title: "Ministry Approval",
          description: "Final approval by ministry leadership",
          requiredRole: "Permanent Secretary",
          timeframe: 24,
          escalationRules: "Refer to Minister if value exceeds threshold",
        },
      ],
      governanceRules: [
        {
          id: "GOV-001",
          type: "COI",
          description:
            "Committee members must declare any financial interest in participating companies",
          enforcement: "Mandatory",
          penalty: "Immediate removal from committee",
        },
        {
          id: "GOV-002",
          type: "Independence",
          description:
            "Members cannot have worked for participating companies in past 2 years",
          enforcement: "Mandatory",
          penalty: "Disqualification from participation",
        },
        {
          id: "GOV-003",
          type: "Rotation",
          description:
            "Committee membership should rotate every 3 evaluations to ensure freshness",
          enforcement: "Recommended",
          penalty: "Advisory warning",
        },
        {
          id: "GOV-004",
          type: "Experience",
          description:
            "At least 60% of committee must have minimum required experience",
          enforcement: "Mandatory",
          penalty: "Committee reconstitution required",
        },
      ],
      auditTrail: {
        createdBy: "System",
        createdDate: "2024-01-15",
        lastModifiedBy: "System",
        lastModifiedDate: "2024-02-10",
        versionHistory: [
          {
            version: 1,
            modifiedBy: "System",
            modifiedDate: "2024-01-15",
            changes: "Initial template creation",
            reason: "Sample template generated",
          },
        ],
      },
    };

    // Customize for different ministries
    if (ministryCode === "MOWI") {
      baseTemplate.name = "Infrastructure Procurement Committee";
      baseTemplate.description =
        "Template for evaluating construction and infrastructure procurement";
      baseTemplate.category = "Infrastructure";
      baseTemplate.applicableTypes = [
        "Road Construction",
        "Bridge Construction",
        "Building Construction",
      ];

      baseTemplate.roles = [
        {
          ...(baseTemplate.roles?.[0] || {}),
          title: "Chief Engineer (Chair)",
          description:
            "Senior civil engineer responsible for leading technical evaluations",
          requiredQualifications: [
            "Civil Engineering degree",
            "Professional Engineer certification",
            "Minimum 15 years construction experience",
          ],
          requiredExpertise: [
            "Civil Engineering",
            "Construction Management",
            "Infrastructure Development",
          ],
        },
        // ... other roles adapted for infrastructure
      ];
    } else if (ministryCode === "MOE") {
      baseTemplate.name = "Educational Procurement Committee";
      baseTemplate.description =
        "Template for evaluating educational equipment and materials procurement";
      baseTemplate.category = "Educational";
      baseTemplate.applicableTypes = [
        "Educational Technology",
        "School Furniture",
        "Learning Materials",
      ];

      baseTemplate.roles = [
        {
          ...(baseTemplate.roles?.[0] || {}),
          title: "Education Director (Chair)",
          description:
            "Senior education professional responsible for leading evaluations",
          requiredQualifications: [
            "Education degree (PhD preferred)",
            "Minimum 15 years education experience",
            "Educational leadership experience",
          ],
          requiredExpertise: [
            "Educational Administration",
            "Curriculum Development",
            "Educational Technology",
          ],
        },
        // ... other roles adapted for education
      ];
    }

    return [baseTemplate];
  };

  const createTemplate = () => {
    const currentUser = "Current User"; // In a real app, get from auth context
    const currentDate = new Date().toISOString().split("T")[0];

    // Get ministry code for template ID
    const ministryUser = JSON.parse(
      localStorage.getItem("ministryUser") || "{}",
    );
    const ministryCode =
      ministryUser.ministryCode?.toUpperCase() ||
      ministryUser.ministryId?.toUpperCase() ||
      "MOH";

    const newTemplate: CommitteeTemplate = {
      id: `${ministryCode}-CT-${Date.now()}`,
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      applicableTypes: templateForm.applicableTypes,
      minimumMembers: templateForm.minimumMembers,
      maximumMembers: templateForm.maximumMembers,
      quorumRequirement: templateForm.quorumRequirement,
      roles: [],
      evaluationFramework: {
        methodology: templateForm.methodology,
        defaultTechnicalWeight: templateForm.technicalWeightPercent,
        defaultFinancialWeight: templateForm.financialWeightPercent,
        allowWeightCustomization: true,
        passingTechnicalScore: templateForm.passingTechnicalScore,
        scoringScale: 100,
        evaluationCriteria: [],
        consensusRules: [],
      },
      approvalLevels: [],
      createdDate: currentDate,
      lastModified: currentDate,
      status: "Draft",
      usageCount: 0,
      governanceRules: [],
      templateCategory: (templateForm.category === "Healthcare"
        ? "Goods"
        : templateForm.category === "Infrastructure"
          ? "Works"
          : templateForm.category === "Education"
            ? "Goods"
            : "Services") as "Goods" | "Works" | "Services" | "Consultancy",
      auditTrail: {
        createdBy: currentUser,
        createdDate: currentDate,
        lastModifiedBy: currentUser,
        lastModifiedDate: currentDate,
        versionHistory: [
          {
            version: 1,
            modifiedBy: currentUser,
            modifiedDate: currentDate,
            changes: "Initial template creation",
            reason: "New template created",
          },
        ],
      },
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);

    console.log("🆕 Created new template:", newTemplate);
    console.log("📋 Updated templates list:", updatedTemplates);
    console.log("🏛️ Ministry code used in template ID:", ministryCode);

    setTemplateForm({
      name: "",
      description: "",
      category: "",
      applicableTypes: [],
      minimumMembers: 3,
      maximumMembers: 7,
      quorumRequirement: 3,
      methodology: "QCBS",
      technicalWeightPercent: 70,
      financialWeightPercent: 30,
      passingTechnicalScore: 75,
    });
    setShowTemplateModal(false);
  };

  const addRoleToTemplate = (templateId: string) => {
    const newRole: CommitteeRoleTemplate = {
      id: `ROLE-${Date.now()}`,
      title: roleForm.title,
      description: roleForm.description,
      responsibilities: roleForm.responsibilities,
      requiredQualifications: roleForm.requiredQualifications,
      requiredExpertise: roleForm.requiredExpertise,
      minimumExperience: roleForm.minimumExperience,
      mandatoryRole: roleForm.mandatoryRole,
      conflictOfInterestAllowed: roleForm.maxConflictScore > 0,
      minimumRequired: 1,
    };

    const currentDate = new Date().toISOString().split("T")[0];
    const currentUser = "Current User";

    const updatedTemplates = templates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            roles: [...template.roles, newRole],
            lastModified: currentDate,
            auditTrail: {
              ...template.auditTrail,
              lastModifiedBy: currentUser,
              lastModifiedDate: currentDate,
              versionHistory: [
                ...(template.auditTrail?.versionHistory || []),
                {
                  version:
                    (template.auditTrail?.versionHistory?.length || 0) + 1,
                  modifiedBy: currentUser,
                  modifiedDate: currentDate,
                  changes: `Added role: ${newRole.title}`,
                  reason: "Role addition",
                },
              ],
            },
          }
        : template,
    );

    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);

    console.log("Added role to template:", templateId, newRole);
    console.log("Updated templates after role addition:", updatedTemplates);

    setRoleForm({
      title: "",
      description: "",
      responsibilities: [],
      requiredQualifications: [],
      requiredExpertise: [],
      minimumExperience: 3,
      mandatoryRole: true,
      maxConflictScore: 3,
    });
    setShowRoleModal(false);
  };

  const activateTemplate = (templateId: string) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const currentUser = "Current User";

    const updatedTemplates = templates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            status: "Active" as const,
            lastModified: currentDate,
            auditTrail: {
              ...template.auditTrail,
              lastModifiedBy: currentUser,
              lastModifiedDate: currentDate,
              versionHistory: [
                ...(template.auditTrail?.versionHistory || []),
                {
                  version:
                    (template.auditTrail?.versionHistory?.length || 0) + 1,
                  modifiedBy: currentUser,
                  modifiedDate: currentDate,
                  changes: "Template activated",
                  reason: "Status change to Active",
                },
              ],
            },
          }
        : template,
    );

    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
    console.log("Activated template:", templateId);
  };

  const editTemplate = (template: CommitteeTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      category: template.category,
      applicableTypes: template.applicableTypes,
      minimumMembers: template.minimumMembers,
      maximumMembers: template.maximumMembers,
      quorumRequirement: template.quorumRequirement,
      methodology: template.evaluationFramework?.methodology || "QCBS",
      technicalWeightPercent:
        template.evaluationFramework?.defaultTechnicalWeight || 70,
      financialWeightPercent:
        template.evaluationFramework?.defaultFinancialWeight || 30,
      passingTechnicalScore:
        template.evaluationFramework?.passingTechnicalScore || 75,
    });
    setShowEditModal(true);
  };

  const updateTemplate = () => {
    if (!editingTemplate) return;

    const currentDate = new Date().toISOString().split("T")[0];
    const currentUser = "Current User";

    const updatedTemplate: CommitteeTemplate = {
      ...editingTemplate,
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      applicableTypes: templateForm.applicableTypes,
      minimumMembers: templateForm.minimumMembers,
      maximumMembers: templateForm.maximumMembers,
      quorumRequirement: templateForm.quorumRequirement,
      evaluationFramework: {
        ...editingTemplate.evaluationFramework,
        methodology: templateForm.methodology,
        defaultTechnicalWeight: templateForm.technicalWeightPercent,
        defaultFinancialWeight: templateForm.financialWeightPercent,
        passingTechnicalScore: templateForm.passingTechnicalScore,
      },
      lastModified: currentDate,
      auditTrail: {
        ...editingTemplate.auditTrail,
        lastModifiedBy: currentUser,
        lastModifiedDate: currentDate,
        versionHistory: [
          ...(editingTemplate.auditTrail?.versionHistory || []),
          {
            version:
              (editingTemplate.auditTrail?.versionHistory?.length || 0) + 1,
            modifiedBy: currentUser,
            modifiedDate: currentDate,
            changes: "Template details updated",
            reason: "Template editing",
          },
        ],
      },
    };

    const updatedTemplates = templates.map((template) =>
      template.id === editingTemplate.id ? updatedTemplate : template,
    );

    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);

    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      description: "",
      category: "",
      applicableTypes: [],
      minimumMembers: 3,
      maximumMembers: 7,
      quorumRequirement: 3,
      methodology: "QCBS",
      technicalWeightPercent: 70,
      financialWeightPercent: 30,
      passingTechnicalScore: 75,
    });
    setShowEditModal(false);

    console.log("Updated template:", updatedTemplate);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Draft: "secondary",
      Active: "default",
      Archived: "outline",
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    );
  };

  const getMethodologyBadge = (methodology: string) => {
    const variants = {
      QCBS: "default",
      QBS: "secondary",
      LCS: "outline",
      FBS: "destructive",
    };
    return (
      <Badge variant={variants[methodology as keyof typeof variants] as any}>
        {methodology}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Committee Templates
          </h2>
          <p className="text-gray-600">
            Define committee structures and roles for procurement planning
          </p>
        </div>
        <Button
          onClick={() => setShowTemplateModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Committee Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {getStatusBadge(template.status)}
                    {template.evaluationFramework?.methodology &&
                      getMethodologyBadge(
                        template.evaluationFramework.methodology,
                      )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-500">
                        Roles Defined
                      </Label>
                      <p className="text-sm font-semibold">
                        {template.roles?.length || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">
                        Committee Size
                      </Label>
                      <p className="text-sm font-semibold">
                        {template.minimumMembers}-{template.maximumMembers}{" "}
                        members
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">
                        QCBS Weights
                      </Label>
                      <p className="text-sm font-semibold">
                        T:
                        {template.evaluationFramework?.defaultTechnicalWeight ||
                          template.evaluationFramework
                            ?.technicalWeightPercent ||
                          70}
                        % / F:
                        {template.evaluationFramework?.defaultFinancialWeight ||
                          template.evaluationFramework
                            ?.financialWeightPercent ||
                          30}
                        %
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">
                        Usage Count
                      </Label>
                      <p className="text-sm font-semibold">
                        {template.usageCount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editTemplate(template)}
                    title="Edit Template"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowRoleModal(true);
                    }}
                    title="Add Role"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {template.status === "Draft" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => activateTemplate(template.id)}
                      title="Activate Template"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Committee Roles ({template.roles?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {(template.roles || []).map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{role.title}</span>
                            {role.mandatoryRole && (
                              <Badge variant="destructive" className="text-xs">
                                Mandatory
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {role.minimumExperience}+ yrs
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              COI ≤ {role.maxConflictScore}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {role.description}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            Expertise: {role.requiredExpertise.join(", ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    QCBS Framework
                  </h4>
                  <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="text-xs font-medium text-blue-700">
                        Technical Weight
                      </Label>
                      <p className="font-semibold text-blue-900">
                        {template.evaluationFramework?.defaultTechnicalWeight ||
                          template.evaluationFramework
                            ?.technicalWeightPercent ||
                          70}
                        %
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-blue-700">
                        Financial Weight
                      </Label>
                      <p className="font-semibold text-blue-900">
                        {template.evaluationFramework?.defaultFinancialWeight ||
                          template.evaluationFramework
                            ?.financialWeightPercent ||
                          30}
                        %
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-blue-700">
                        Passing Score
                      </Label>
                      <p className="font-semibold text-blue-900">
                        {template.evaluationFramework?.passingTechnicalScore ||
                          75}
                        %
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-blue-700">
                        Criteria
                      </Label>
                      <p className="font-semibold text-blue-900">
                        {template.evaluationFramework?.evaluationCriteria
                          ?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {(template.applicableTypes?.length || 0) > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Applicable Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {(template.applicableTypes || []).map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(template.governanceRules?.length || 0) > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Governance Rules ({template.governanceRules?.length || 0})
                    </h4>
                    <div className="space-y-1">
                      {(template.governanceRules || []).map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between text-sm p-2 bg-yellow-50 rounded"
                        >
                          <span>{rule.description}</span>
                          <Badge
                            variant={
                              rule.enforcement === "Mandatory"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {rule.enforcement}
                          </Badge>
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

      {/* Create Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create Committee Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, name: e.target.value })
                }
                placeholder="e.g., Medical Equipment Committee"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the purpose and scope of this committee template"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={templateForm.category}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g., Medical Equipment"
                />
              </div>
              <div>
                <Label htmlFor="methodology">Evaluation Methodology</Label>
                <Select
                  value={templateForm.methodology}
                  onValueChange={(value: any) =>
                    setTemplateForm({ ...templateForm, methodology: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QCBS">
                      Quality and Cost-Based Selection (QCBS)
                    </SelectItem>
                    <SelectItem value="QBS">
                      Quality-Based Selection (QBS)
                    </SelectItem>
                    <SelectItem value="LCS">
                      Least Cost Selection (LCS)
                    </SelectItem>
                    <SelectItem value="FBS">
                      Fixed Budget Selection (FBS)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="min-members">Min Members</Label>
                <Input
                  id="min-members"
                  type="number"
                  value={templateForm.minimumMembers}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      minimumMembers: parseInt(e.target.value) || 3,
                    })
                  }
                  min="3"
                />
              </div>
              <div>
                <Label htmlFor="max-members">Max Members</Label>
                <Input
                  id="max-members"
                  type="number"
                  value={templateForm.maximumMembers}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      maximumMembers: parseInt(e.target.value) || 7,
                    })
                  }
                  min="3"
                />
              </div>
              <div>
                <Label htmlFor="quorum">Quorum</Label>
                <Input
                  id="quorum"
                  type="number"
                  value={templateForm.quorumRequirement}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      quorumRequirement: parseInt(e.target.value) || 3,
                    })
                  }
                  min="3"
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">QCBS Weighting</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="technical-weight">Technical Weight (%)</Label>
                  <Input
                    id="technical-weight"
                    type="number"
                    value={templateForm.technicalWeightPercent}
                    onChange={(e) => {
                      const technical = parseInt(e.target.value) || 70;
                      setTemplateForm({
                        ...templateForm,
                        technicalWeightPercent: technical,
                        financialWeightPercent: 100 - technical,
                      });
                    }}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="financial-weight">Financial Weight (%)</Label>
                  <Input
                    id="financial-weight"
                    type="number"
                    value={templateForm.financialWeightPercent}
                    onChange={(e) => {
                      const financial = parseInt(e.target.value) || 30;
                      setTemplateForm({
                        ...templateForm,
                        financialWeightPercent: financial,
                        technicalWeightPercent: 100 - financial,
                      });
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="passing-score">
                  Minimum Technical Passing Score (%)
                </Label>
                <Input
                  id="passing-score"
                  type="number"
                  value={templateForm.passingTechnicalScore}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      passingTechnicalScore: parseInt(e.target.value) || 75,
                    })
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="applicable-types">
                Applicable Procurement Types (comma-separated)
              </Label>
              <Input
                id="applicable-types"
                value={templateForm.applicableTypes.join(", ")}
                onChange={(e) =>
                  setTemplateForm({
                    ...templateForm,
                    applicableTypes: e.target.value
                      .split(", ")
                      .filter((s) => s.trim()),
                  })
                }
                placeholder="e.g., Medical Equipment, Healthcare Technology"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={createTemplate}>Create Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add Committee Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role-title">Role Title</Label>
                <Input
                  id="role-title"
                  value={roleForm.title}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, title: e.target.value })
                  }
                  placeholder="e.g., Committee Chairperson"
                />
              </div>
              <div>
                <Label htmlFor="min-experience">
                  Minimum Experience (years)
                </Label>
                <Input
                  id="min-experience"
                  type="number"
                  value={roleForm.minimumExperience}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      minimumExperience: parseInt(e.target.value) || 3,
                    })
                  }
                  min="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-description">Role Description</Label>
              <Textarea
                id="role-description"
                value={roleForm.description}
                onChange={(e) =>
                  setRoleForm({ ...roleForm, description: e.target.value })
                }
                placeholder="Describe the role and its purpose"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="responsibilities">
                Responsibilities (comma-separated)
              </Label>
              <Textarea
                id="responsibilities"
                value={roleForm.responsibilities.join(", ")}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    responsibilities: e.target.value
                      .split(", ")
                      .filter((s) => s.trim()),
                  })
                }
                placeholder="Lead evaluations, Make decisions, etc."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="qualifications">
                Required Qualifications (comma-separated)
              </Label>
              <Textarea
                id="qualifications"
                value={roleForm.requiredQualifications.join(", ")}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    requiredQualifications: e.target.value
                      .split(", ")
                      .filter((s) => s.trim()),
                  })
                }
                placeholder="Degree requirements, certifications, etc."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="expertise">
                Required Expertise (comma-separated)
              </Label>
              <Input
                id="expertise"
                value={roleForm.requiredExpertise.join(", ")}
                onChange={(e) =>
                  setRoleForm({
                    ...roleForm,
                    requiredExpertise: e.target.value
                      .split(", ")
                      .filter((s) => s.trim()),
                  })
                }
                placeholder="Technical areas of expertise"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mandatory-role"
                  checked={roleForm.mandatoryRole}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      mandatoryRole: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="mandatory-role">Mandatory Role</Label>
              </div>
              <div>
                <Label htmlFor="conflict-score">
                  Max Conflict Score (1-10)
                </Label>
                <Input
                  id="conflict-score"
                  type="number"
                  value={roleForm.maxConflictScore}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      maxConflictScore: parseInt(e.target.value) || 3,
                    })
                  }
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedTemplate && addRoleToTemplate(selectedTemplate.id)
                }
              >
                Add Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
