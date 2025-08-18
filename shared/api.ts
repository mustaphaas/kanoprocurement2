/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * MDA (Ministry, Department, Agency) types for MDA Management
 */
export interface MDA {
  id: string;
  name: string;
  type: "ministry" | "department" | "agency";
  description: string;
  parentMDA?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  headOfMDA: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings: MDASettings;
}

export interface MDASettings {
  procurementThresholds: {
    level1: number;
    level2: number;
    level3: number;
  };
  allowedCategories: string[];
  customWorkflows: boolean;
  budgetYear: string;
  totalBudget: number;
}

export interface MDAAdmin {
  id: string;
  mdaId: string;
  userId: string;
  role: "mda_admin" | "mda_super_admin";
  permissions: MDAPermissions;
  assignedBy: string;
  assignedAt: Date;
  isActive: boolean;
}

export interface MDAPermissions {
  canCreateUsers: boolean;
  canManageTenders: boolean;
  canApproveContracts: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  maxApprovalAmount: number;
}

export interface CreateMDARequest {
  name: string;
  type: "ministry" | "department" | "agency";
  description: string;
  parentMDA?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  headOfMDA: string;
  settings: MDASettings;
}

export interface CreateMDAAdminRequest {
  mdaId: string;
  email: string;
  displayName: string;
  role: "mda_admin" | "mda_super_admin";
  permissions: MDAPermissions;
}

export interface MDAUser {
  id: string;
  mdaId: string;
  userId: string;
  email?: string; // Email for login credentials
  displayName?: string; // Full name for display
  role: "procurement_officer" | "evaluator" | "accountant" | "viewer";
  department: string;
  permissions: MDAUserPermissions;
  assignedBy: string;
  assignedAt: Date;
  isActive: boolean;
}

export interface MDAUserPermissions {
  canCreateTenders: boolean;
  canEvaluateBids: boolean;
  canViewFinancials: boolean;
  canGenerateReports: boolean;
  accessLevel: "read" | "write" | "admin";
}

export interface CreateMDAUserRequest {
  mdaId: string;
  email: string;
  displayName: string;
  role: "procurement_officer" | "evaluator" | "accountant" | "viewer";
  department: string;
  permissions: MDAUserPermissions;
}
