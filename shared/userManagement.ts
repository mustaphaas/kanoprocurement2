// User Management Types and Models for Ministry Dashboard

export interface User {
  user_id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  department: Department;
  permissions: Permission[];
  status: UserStatus;
  created_date: string;
  last_login?: string;
  created_by: string;
  ministry_id: string;
  phone?: string;
  employee_id?: string;
  profile_image?: string;
}

export interface UserRole {
  role_id: string;
  role_name: string;
  role_description: string;
  default_permissions: Permission[];
  hierarchy_level: number; // 1=Admin, 2=Manager, 3=Officer, 4=Staff
}

export interface Department {
  department_id: string;
  department_name: string;
  department_code: string;
  description: string;
  head_user_id?: string;
}

export interface Permission {
  permission_id: string;
  permission_name: string;
  permission_code: string;
  category: PermissionCategory;
  description: string;
  risk_level: "low" | "medium" | "high" | "critical";
}

export type PermissionCategory =
  | "tender_management"
  | "evaluation"
  | "financial"
  | "reporting"
  | "user_management"
  | "contract_management"
  | "noc_management"
  | "audit_compliance"
  | "system_admin";

export type UserStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "pending_approval";

// Committee and COI Related Types
export interface Committee {
  committee_id: string;
  committee_name: string;
  committee_type: CommitteeType;
  members: CommitteeMember[];
  created_date: string;
  status: "active" | "inactive" | "dissolved";
  tender_id?: string;
  ministry_id: string;
}

export interface CommitteeMember {
  user_id: string;
  committee_role: CommitteeRole;
  assigned_date: string;
  assigned_by: string;
  status: "active" | "inactive";
  coi_status: COIStatus;
}

export type CommitteeType =
  | "technical_evaluation"
  | "financial_evaluation"
  | "procurement_planning"
  | "contract_review"
  | "audit_committee";

export type CommitteeRole =
  | "chair"
  | "secretary"
  | "evaluator"
  | "financial_analyst"
  | "technical_expert"
  | "legal_advisor"
  | "observer";

// Conflict of Interest (COI) System
export interface COIDeclaration {
  coi_id: string;
  user_id: string;
  tender_id: string;
  declaration_type: COIType;
  has_conflict: boolean;
  conflict_details?: string;
  relationship_type?: RelationshipType;
  company_name?: string;
  financial_interest?: string;
  declared_date: string;
  approved_by?: string;
  approval_date?: string;
  status: COIStatus;
  override_reason?: string;
  override_by?: string;
}

export type COIType =
  | "financial"
  | "personal"
  | "professional"
  | "family"
  | "none";

export type RelationshipType =
  | "employee"
  | "shareholder"
  | "director"
  | "consultant"
  | "family_member"
  | "business_partner"
  | "other";

export type COIStatus =
  | "declared_no_conflict"
  | "declared_with_conflict"
  | "pending_review"
  | "approved_with_conflict"
  | "rejected_conflict"
  | "not_declared";

// User Activity and Audit
export interface UserActivity {
  activity_id: string;
  user_id: string;
  action: string;
  module: string;
  target_id?: string;
  target_type?: string;
  timestamp: string;
  ip_address?: string;
  details: any;
  result: "success" | "failure" | "partial";
}

// Permission Definitions
export const DEFAULT_PERMISSIONS: Permission[] = [
  // Tender Management
  {
    permission_id: "TENDER_CREATE",
    permission_name: "Create Tenders",
    permission_code: "tender.create",
    category: "tender_management",
    description: "Ability to create and publish new tenders",
    risk_level: "high",
  },
  {
    permission_id: "TENDER_EDIT",
    permission_name: "Edit Tenders",
    permission_code: "tender.edit",
    category: "tender_management",
    description: "Ability to modify existing tenders",
    risk_level: "high",
  },
  {
    permission_id: "TENDER_VIEW",
    permission_name: "View Tenders",
    permission_code: "tender.view",
    category: "tender_management",
    description: "Ability to view tender details",
    risk_level: "low",
  },
  {
    permission_id: "TENDER_DELETE",
    permission_name: "Delete Tenders",
    permission_code: "tender.delete",
    category: "tender_management",
    description: "Ability to delete tenders",
    risk_level: "critical",
  },

  // Evaluation
  {
    permission_id: "BID_EVALUATE",
    permission_name: "Evaluate Bids",
    permission_code: "evaluation.evaluate",
    category: "evaluation",
    description: "Ability to evaluate and score bids",
    risk_level: "high",
  },
  {
    permission_id: "BID_VIEW",
    permission_name: "View Bids",
    permission_code: "evaluation.view",
    category: "evaluation",
    description: "Ability to view bid submissions",
    risk_level: "medium",
  },
  {
    permission_id: "EVAL_FINALIZE",
    permission_name: "Finalize Evaluations",
    permission_code: "evaluation.finalize",
    category: "evaluation",
    description: "Ability to finalize evaluation results",
    risk_level: "critical",
  },

  // Financial
  {
    permission_id: "FINANCIAL_VIEW",
    permission_name: "View Financials",
    permission_code: "financial.view",
    category: "financial",
    description: "Ability to view financial data and budgets",
    risk_level: "medium",
  },
  {
    permission_id: "BUDGET_MANAGE",
    permission_name: "Manage Budgets",
    permission_code: "financial.budget",
    category: "financial",
    description: "Ability to manage budget allocations",
    risk_level: "high",
  },
  {
    permission_id: "PAYMENT_APPROVE",
    permission_name: "Approve Payments",
    permission_code: "financial.payments",
    category: "financial",
    description: "Ability to approve payment requests",
    risk_level: "critical",
  },

  // Contracts
  {
    permission_id: "CONTRACT_VIEW",
    permission_name: "View Contracts",
    permission_code: "contract.view",
    category: "contract_management",
    description: "Ability to view contract details",
    risk_level: "low",
  },
  {
    permission_id: "CONTRACT_APPROVE",
    permission_name: "Approve Contracts",
    permission_code: "contract.approve",
    category: "contract_management",
    description: "Ability to approve contract awards",
    risk_level: "critical",
  },
  {
    permission_id: "CONTRACT_MANAGE",
    permission_name: "Manage Contracts",
    permission_code: "contract.manage",
    category: "contract_management",
    description: "Ability to manage contract execution",
    risk_level: "high",
  },

  // NOC Management
  {
    permission_id: "NOC_VIEW",
    permission_name: "View NOC Requests",
    permission_code: "noc.view",
    category: "noc_management",
    description: "Ability to view NOC requests",
    risk_level: "low",
  },
  {
    permission_id: "NOC_APPROVE",
    permission_name: "Approve NOC",
    permission_code: "noc.approve",
    category: "noc_management",
    description: "Ability to approve NOC requests",
    risk_level: "critical",
  },
  {
    permission_id: "NOC_CREATE",
    permission_name: "Create NOC Requests",
    permission_code: "noc.create",
    category: "noc_management",
    description: "Ability to create NOC requests",
    risk_level: "medium",
  },

  // Reporting
  {
    permission_id: "REPORT_GENERATE",
    permission_name: "Generate Reports",
    permission_code: "report.generate",
    category: "reporting",
    description: "Ability to generate system reports",
    risk_level: "medium",
  },
  {
    permission_id: "REPORT_VIEW",
    permission_name: "View Reports",
    permission_code: "report.view",
    category: "reporting",
    description: "Ability to view generated reports",
    risk_level: "low",
  },
  {
    permission_id: "ANALYTICS_VIEW",
    permission_name: "View Analytics",
    permission_code: "analytics.view",
    category: "reporting",
    description: "Ability to view analytics and dashboards",
    risk_level: "low",
  },

  // User Management
  {
    permission_id: "USER_CREATE",
    permission_name: "Create Users",
    permission_code: "user.create",
    category: "user_management",
    description: "Ability to create new users",
    risk_level: "high",
  },
  {
    permission_id: "USER_EDIT",
    permission_name: "Edit Users",
    permission_code: "user.edit",
    category: "user_management",
    description: "Ability to modify user accounts",
    risk_level: "high",
  },
  {
    permission_id: "USER_VIEW",
    permission_name: "View Users",
    permission_code: "user.view",
    category: "user_management",
    description: "Ability to view user information",
    risk_level: "medium",
  },
  {
    permission_id: "USER_DELETE",
    permission_name: "Delete Users",
    permission_code: "user.delete",
    category: "user_management",
    description: "Ability to delete user accounts",
    risk_level: "critical",
  },

  // System Admin
  {
    permission_id: "SYSTEM_CONFIG",
    permission_name: "System Configuration",
    permission_code: "system.config",
    category: "system_admin",
    description: "Ability to configure system settings",
    risk_level: "critical",
  },
  {
    permission_id: "AUDIT_VIEW",
    permission_name: "View Audit Logs",
    permission_code: "audit.view",
    category: "audit_compliance",
    description: "Ability to view system audit logs",
    risk_level: "medium",
  },
];

// Default Roles
export const DEFAULT_ROLES: UserRole[] = [
  {
    role_id: "ROLE_ADMIN",
    role_name: "Ministry Admin",
    role_description: "Full administrative access to all ministry functions",
    hierarchy_level: 1,
    default_permissions: DEFAULT_PERMISSIONS, // All permissions
  },
  {
    role_id: "ROLE_PROC_MANAGER",
    role_name: "Procurement Manager",
    role_description:
      "Manages procurement processes and oversees procurement team",
    hierarchy_level: 2,
    default_permissions: DEFAULT_PERMISSIONS.filter((p) =>
      [
        "tender_management",
        "evaluation",
        "contract_management",
        "noc_management",
        "reporting",
      ].includes(p.category),
    ),
  },
  {
    role_id: "ROLE_PROC_OFFICER",
    role_name: "Procurement Officer",
    role_description: "Handles day-to-day procurement activities",
    hierarchy_level: 3,
    default_permissions: DEFAULT_PERMISSIONS.filter(
      (p) =>
        p.permission_code.includes("view") ||
        [
          "tender.create",
          "tender.edit",
          "noc.create",
          "evaluation.evaluate",
          "report.generate",
        ].includes(p.permission_code),
    ),
  },
  {
    role_id: "ROLE_EVALUATOR",
    role_name: "Bid Evaluator",
    role_description: "Specialized in evaluating tender submissions",
    hierarchy_level: 3,
    default_permissions: DEFAULT_PERMISSIONS.filter(
      (p) => p.category === "evaluation" || p.permission_code.includes("view"),
    ),
  },
  {
    role_id: "ROLE_ACCOUNTANT",
    role_name: "Accountant",
    role_description: "Handles financial aspects of procurement",
    hierarchy_level: 3,
    default_permissions: DEFAULT_PERMISSIONS.filter(
      (p) =>
        p.category === "financial" ||
        p.permission_code.includes("view") ||
        p.category === "reporting",
    ),
  },
  {
    role_id: "ROLE_LEGAL_ADVISOR",
    role_name: "Legal Advisor",
    role_description: "Provides legal guidance on procurement matters",
    hierarchy_level: 3,
    default_permissions: DEFAULT_PERMISSIONS.filter(
      (p) =>
        p.permission_code.includes("view") ||
        p.category === "contract_management" ||
        p.category === "audit_compliance",
    ),
  },
  {
    role_id: "ROLE_COMMITTEE_CHAIR",
    role_name: "Committee Chair",
    role_description: "Chairs evaluation committees",
    hierarchy_level: 2,
    default_permissions: DEFAULT_PERMISSIONS.filter(
      (p) =>
        p.category === "evaluation" ||
        p.permission_code.includes("view") ||
        p.permission_code === "eval.finalize",
    ),
  },
];

// Default Departments
export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    department_id: "DEPT_PROCUREMENT",
    department_name: "Procurement Department",
    department_code: "PROC",
    description: "Handles all procurement activities and processes",
  },
  {
    department_id: "DEPT_FINANCE",
    department_name: "Finance Department",
    department_code: "FIN",
    description: "Manages financial aspects and budget allocations",
  },
  {
    department_id: "DEPT_TECHNICAL",
    department_name: "Technical Department",
    department_code: "TECH",
    description: "Provides technical expertise and evaluations",
  },
  {
    department_id: "DEPT_LEGAL",
    department_name: "Legal Department",
    department_code: "LEGAL",
    description: "Provides legal guidance and contract review",
  },
  {
    department_id: "DEPT_ADMIN",
    department_name: "Administration",
    department_code: "ADMIN",
    description: "General administrative and support functions",
  },
  {
    department_id: "DEPT_PLANNING",
    department_name: "Planning Department",
    department_code: "PLAN",
    description: "Strategic planning and policy development",
  },
];

// Helper Functions
export const hasPermission = (user: User, permissionCode: string): boolean => {
  return user.permissions.some((p) => p.permission_code === permissionCode);
};

export const getUsersByRole = (users: User[], roleId: string): User[] => {
  return users.filter(
    (user) => user.role.role_id === roleId && user.status === "active",
  );
};

export const getUsersByDepartment = (
  users: User[],
  departmentId: string,
): User[] => {
  return users.filter(
    (user) =>
      user.department.department_id === departmentId &&
      user.status === "active",
  );
};

export const canUserJoinCommittee = (
  user: User,
  tenderId: string,
  coiDeclarations: COIDeclaration[],
): boolean => {
  if (user.status !== "active") return false;

  const userCOI = coiDeclarations.find(
    (coi) => coi.user_id === user.user_id && coi.tender_id === tenderId,
  );

  if (!userCOI) return true; // No COI declaration means can join

  return (
    userCOI.status === "declared_no_conflict" ||
    userCOI.status === "approved_with_conflict"
  );
};

export const generateUserId = (): string => {
  return `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const generateCommitteeId = (): string => {
  return `COMM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const generateCOIId = (): string => {
  return `COI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};
