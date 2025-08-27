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

/**
 * Tender Scoring System Types
 */
export interface EvaluationCriteria {
  id: number;
  name: string;
  maxScore: number;
  weight?: number;
  type?: 'technical' | 'financial';
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string;
  criteria: EvaluationCriteria[];
}

export interface TenderScore {
  id: string;
  tenderId: string;
  committeeMemberId: string;
  bidderName: string;
  scores: Record<number, number>; // criteriaId -> score
  totalScore: number;
  submittedAt: string;
  status: "draft" | "submitted";
}

export interface TenderScoreSubmission {
  tenderId: string;
  committeeMemberId: string;
  bidderName: string;
  scores: Record<number, number>;
}

export interface TenderFinalScore {
  bidderName: string;
  technicalScore: number;
  financialScore: number;
  finalScore: number;
  rank: number;
}

export interface TenderAssignment {
  id: string;
  tenderId: string;
  evaluationTemplateId: string;
  committeeMemberId: string;
  status: string;
  evaluationStart: string;
  evaluationEnd: string;
}
