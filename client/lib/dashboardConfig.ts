export interface DashboardFunction {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  route: string;
  category: 'tender' | 'profile' | 'documents' | 'communication' | 'contracts' | 'reports' | 'compliance';
  requiredStatus?: CompanyStatus[];
  badge?: string;
  priority: number; // Higher priority shows first
}

export type CompanyStatus = "Pending" | "Approved" | "Suspended" | "Blacklisted";

export interface UserStatusConfig {
  status: CompanyStatus;
  welcomeMessage: string;
  statusDescription: string;
  statusColor: 'blue' | 'green' | 'orange' | 'red';
  availableFunctions: DashboardFunction[];
  restrictions: string[];
  nextSteps: string[];
}

// Define all possible dashboard functions
export const dashboardFunctions: DashboardFunction[] = [
  // Tender Functions
  {
    id: 'browse-opportunities',
    name: 'Browse Opportunities',
    description: 'View all available procurement opportunities',
    icon: 'Search',
    enabled: true,
    route: 'tender-ads',
    category: 'tender',
    priority: 10,
  },
  {
    id: 'express-interest',
    name: 'Express Interest',
    description: 'Show interest in tender opportunities',
    icon: 'Heart',
    enabled: true,
    route: 'tender-ads',
    category: 'tender',
    requiredStatus: ['Approved'],
    priority: 9,
  },
  {
    id: 'submit-proposals',
    name: 'Submit Proposals',
    description: 'Submit bids and technical proposals',
    icon: 'Send',
    enabled: true,
    route: 'tender-ads',
    category: 'tender',
    requiredStatus: ['Approved'],
    priority: 8,
  },
  {
    id: 'my-applications',
    name: 'My Applications',
    description: 'Track your submitted applications',
    icon: 'FileText',
    enabled: true,
    route: 'purchased-bids',
    category: 'tender',
    requiredStatus: ['Approved', 'Suspended'],
    priority: 7,
  },

  // Profile & Company Functions
  {
    id: 'company-profile',
    name: 'Company Profile',
    description: 'Manage your company information',
    icon: 'Building2',
    enabled: true,
    route: 'my-profile',
    category: 'profile',
    priority: 6,
  },
  {
    id: 'verification-center',
    name: 'Verification Center',
    description: 'Complete account verification process',
    icon: 'Shield',
    enabled: true,
    route: 'my-documents',
    category: 'profile',
    requiredStatus: ['Pending'],
    badge: 'Required',
    priority: 15,
  },
  {
    id: 'document-vault',
    name: 'Document Vault',
    description: 'Manage all company documents',
    icon: 'Archive',
    enabled: true,
    route: 'my-documents',
    category: 'documents',
    priority: 5,
  },

  // Communication Functions
  {
    id: 'clarification-requests',
    name: 'Clarification Requests',
    description: 'Request clarifications on tenders',
    icon: 'MessageSquare',
    enabled: true,
    route: 'new-clarifications',
    category: 'communication',
    requiredStatus: ['Approved'],
    priority: 4,
  },
  {
    id: 'notifications-center',
    name: 'Notifications Center',
    description: 'View important announcements',
    icon: 'Bell',
    enabled: true,
    route: 'messages',
    category: 'communication',
    priority: 3,
  },

  // Contract Functions
  {
    id: 'awarded-contracts',
    name: 'Awarded Contracts',
    description: 'View and manage your contracts',
    icon: 'Award',
    enabled: true,
    route: 'contracts-awarded',
    category: 'contracts',
    requiredStatus: ['Approved'],
    priority: 2,
  },
  {
    id: 'contract-performance',
    name: 'Performance Tracking',
    description: 'Monitor contract execution progress',
    icon: 'TrendingUp',
    enabled: true,
    route: 'contracts-awarded',
    category: 'contracts',
    requiredStatus: ['Approved'],
    priority: 1,
  },

  // Compliance & Reports
  {
    id: 'compliance-center',
    name: 'Compliance Center',
    description: 'Ensure regulatory compliance',
    icon: 'CheckCircle',
    enabled: true,
    route: 'detailed-compliance',
    category: 'compliance',
    requiredStatus: ['Approved', 'Suspended'],
    priority: 0,
  },
  {
    id: 'reinstatement-portal',
    name: 'Reinstatement Portal',
    description: 'Apply for account reinstatement',
    icon: 'RefreshCw',
    enabled: true,
    route: 'my-documents',
    category: 'compliance',
    requiredStatus: ['Suspended'],
    badge: 'Action Required',
    priority: 14,
  },
  {
    id: 'appeal-center',
    name: 'Appeal Center',
    description: 'Submit appeals and grievances',
    icon: 'AlertTriangle',
    enabled: true,
    route: 'grievance',
    category: 'compliance',
    requiredStatus: ['Blacklisted'],
    badge: 'Available',
    priority: 13,
  },
];

// Status-based configurations
export const statusConfigurations: Record<CompanyStatus, UserStatusConfig> = {
  Pending: {
    status: 'Pending',
    welcomeMessage: 'Welcome to KanoProc! Your registration is under review.',
    statusDescription: 'Your company registration is being reviewed by the Bureau of Public Procurement. Limited portal access is available during this period.',
    statusColor: 'blue',
    availableFunctions: dashboardFunctions.filter(func => 
      !func.requiredStatus || func.requiredStatus.includes('Pending')
    ),
    restrictions: [
      'Cannot express interest in tenders',
      'Cannot submit bids or proposals',
      'Cannot download tender documents',
      'Cannot submit clarification requests'
    ],
    nextSteps: [
      'Complete document verification in Verification Center',
      'Ensure all required documents are uploaded',
      'Wait for BPP approval (5-7 business days)',
      'Monitor notifications for updates'
    ]
  },

  Approved: {
    status: 'Approved',
    welcomeMessage: 'Welcome back! Your account is fully active.',
    statusDescription: 'Your company is approved and has full access to all procurement opportunities and services.',
    statusColor: 'green',
    availableFunctions: dashboardFunctions.filter(func => 
      !func.requiredStatus || func.requiredStatus.includes('Approved')
    ),
    restrictions: [],
    nextSteps: [
      'Browse latest tender opportunities',
      'Express interest in relevant tenders',
      'Submit competitive proposals',
      'Monitor your application status'
    ]
  },

  Suspended: {
    status: 'Suspended',
    welcomeMessage: 'Account Suspended - Immediate Action Required',
    statusDescription: 'Your account has been suspended due to compliance issues. Use the Reinstatement Portal to resolve these issues.',
    statusColor: 'orange',
    availableFunctions: dashboardFunctions.filter(func => 
      !func.requiredStatus || func.requiredStatus.includes('Suspended')
    ),
    restrictions: [
      'Cannot express interest in new tenders',
      'Cannot submit new bids',
      'Cannot download new tender documents',
      'Limited access to communication features'
    ],
    nextSteps: [
      'Visit Reinstatement Portal immediately',
      'Update expired documents',
      'Address compliance issues',
      'Submit reinstatement application'
    ]
  },

  Blacklisted: {
    status: 'Blacklisted',
    welcomeMessage: 'Account Restricted - Appeal Available',
    statusDescription: 'Your company has been blacklisted from Kano State procurements. You may submit an appeal through the Appeal Center.',
    statusColor: 'red',
    availableFunctions: dashboardFunctions.filter(func => 
      !func.requiredStatus || func.requiredStatus.includes('Blacklisted')
    ),
    restrictions: [
      'Cannot participate in any procurement activities',
      'Cannot express interest in tenders',
      'Cannot submit bids or proposals',
      'Cannot access tender documents'
    ],
    nextSteps: [
      'Review blacklisting reasons',
      'Gather supporting documentation',
      'Submit appeal through Appeal Center',
      'Await appeal review decision'
    ]
  }
};

// Get configuration for a specific status
export const getDashboardConfig = (status: CompanyStatus): UserStatusConfig => {
  return statusConfigurations[status];
};

// Get available functions for a status, sorted by priority
export const getAvailableFunctions = (status: CompanyStatus): DashboardFunction[] => {
  const config = getDashboardConfig(status);
  return config.availableFunctions.sort((a, b) => b.priority - a.priority);
};

// Get functions by category for a status
export const getFunctionsByCategory = (status: CompanyStatus, category: DashboardFunction['category']): DashboardFunction[] => {
  return getAvailableFunctions(status).filter(func => func.category === category);
};

// Check if a function is available for a status
export const isFunctionAvailable = (functionId: string, status: CompanyStatus): boolean => {
  const availableFunctions = getAvailableFunctions(status);
  return availableFunctions.some(func => func.id === functionId);
};
