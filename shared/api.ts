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
 * MDA (Ministry, Department, Agency) types
 */
export interface MDA {
  id: string;
  name: string;
  type: 'ministry' | 'department' | 'agency';
  description: string;
  parentMDA?: string; // For hierarchical structure (departments under ministries)
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
    level1: number; // MDA head approval
    level2: number; // Requires higher approval
    level3: number; // Requires state tender board
  };
  allowedCategories: string[];
  customWorkflows: boolean;
  budgetYear: string;
  totalBudget: number;
}

/**
 * MDA Admin types - extends UserProfile
 */
export interface MDAAdmin {
  id: string;
  mdaId: string;
  userId: string;
  role: 'mda_admin' | 'mda_super_admin';
  permissions: MDAPermissions;
  assignedBy: string; // superuser who assigned them
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

/**
 * MDA User types
 */
export interface MDAUser {
  id: string;
  mdaId: string;
  userId: string;
  role: 'procurement_officer' | 'evaluator' | 'accountant' | 'viewer';
  department?: string;
  permissions: MDAUserPermissions;
  createdBy: string; // MDA admin who created them
  createdAt: Date;
  isActive: boolean;
}

export interface MDAUserPermissions {
  canCreateTenders: boolean;
  canEvaluateBids: boolean;
  canViewFinancials: boolean;
  canGenerateReports: boolean;
  accessLevel: 'read' | 'write' | 'admin';
}

/**
 * Enhanced UserProfile to include MDA information
 */
export interface EnhancedUserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'company' | 'admin' | 'superuser' | 'mda_admin' | 'mda_user';
  companyId?: string;
  mdaId?: string; // For MDA users and admins
  mdaRole?: string; // Specific role within MDA
  createdAt: Date;
  lastLoginAt: Date;
  emailVerified: boolean;
}

/**
 * MDA Tender types
 */
export interface MDATender {
  id: string;
  mdaId: string;
  title: string;
  description: string;
  category: string;
  estimatedValue: number;
  currency: string;
  status: 'draft' | 'published' | 'closed' | 'awarded' | 'cancelled';
  publishDate?: Date;
  closingDate?: Date;
  createdBy: string;
  approvedBy?: string;
  documents: TenderDocument[];
  requirements: string[];
  evaluationCriteria: EvaluationCriteria[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TenderDocument {
  id: string;
  name: string;
  type: 'specification' | 'terms' | 'drawing' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  description: string;
}

/**
 * API Response types
 */
export interface MDAListResponse {
  mdas: MDA[];
  total: number;
  page: number;
  limit: number;
}

export interface MDAAdminListResponse {
  admins: (MDAAdmin & { user: EnhancedUserProfile; mda: MDA })[];
  total: number;
  page: number;
  limit: number;
}

export interface MDAUserListResponse {
  users: (MDAUser & { user: EnhancedUserProfile; mda: MDA })[];
  total: number;
  page: number;
  limit: number;
}

/**
 * API Request types
 */
export interface CreateMDARequest {
  name: string;
  type: 'ministry' | 'department' | 'agency';
  description: string;
  parentMDA?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  headOfMDA: string;
  settings: MDASettings;
}

export interface UpdateMDARequest extends Partial<CreateMDARequest> {
  id: string;
}

export interface CreateMDAAdminRequest {
  mdaId: string;
  email: string;
  displayName: string;
  role: 'mda_admin' | 'mda_super_admin';
  permissions: MDAPermissions;
}

export interface CreateMDAUserRequest {
  mdaId: string;
  email: string;
  displayName: string;
  role: 'procurement_officer' | 'evaluator' | 'accountant' | 'viewer';
  department?: string;
  permissions: MDAUserPermissions;
}

/**
 * Dashboard Statistics types
 */
export interface MDADashboardStats {
  totalTenders: number;
  activeTenders: number;
  totalValue: number;
  averageProcessingTime: number;
  successfulAwards: number;
  pendingApprovals: number;
  monthlyTrends: {
    month: string;
    tenders: number;
    value: number;
  }[];
}

export interface SuperuserDashboardStats {
  totalMDAs: number;
  activeMDAs: number;
  totalAdmins: number;
  totalUsers: number;
  systemWideStats: {
    totalTenders: number;
    totalValue: number;
    averageEfficiency: number;
  };
  mdaPerformance: {
    mdaId: string;
    mdaName: string;
    tendersCount: number;
    totalValue: number;
    efficiency: number;
  }[];
}
