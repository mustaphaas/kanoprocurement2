// Enhanced Mock Data Generator for User Management System

import {
  User,
  Committee,
  CommitteeMember,
  COIDeclaration,
  UserActivity,
  DEFAULT_ROLES,
  DEFAULT_DEPARTMENTS,
  generateUserId,
  generateCommitteeId,
  generateCOIId,
} from "@shared/userManagement";

export interface MockDataOptions {
  ministryId: string;
  userCount?: number;
  committeeCount?: number;
  includeTestCommittee?: boolean;
  includeRealisticCOI?: boolean;
}

export class UserMockDataGenerator {
  private ministryId: string;
  private userCount: number;
  private committeeCount: number;
  private includeTestCommittee: boolean;
  private includeRealisticCOI: boolean;

  constructor(options: MockDataOptions) {
    this.ministryId = options.ministryId;
    this.userCount = options.userCount || 10;
    this.committeeCount = options.committeeCount || 3;
    this.includeTestCommittee = options.includeTestCommittee || true;
    this.includeRealisticCOI = options.includeRealisticCOI || true;
  }

  public generateCompleteUserData(): {
    users: User[];
    committees: Committee[];
    coiDeclarations: COIDeclaration[];
    userActivities: UserActivity[];
  } {
    const users = this.generateUsers();
    const committees = this.generateCommittees(users);
    const coiDeclarations = this.generateCOIDeclarations(users, committees);
    const userActivities = this.generateUserActivities(users);

    return {
      users,
      committees,
      coiDeclarations,
      userActivities,
    };
  }

  private generateUsers(): User[] {
    const users: User[] = [];
    const currentDate = new Date();

    // Predefined realistic users with proper ministry context
    const predefinedUsers = [
      {
        name: "Dr. Amina Hassan Abdullahi",
        email: "amina.hassan@kanohealth.gov.ng",
        username: "amina.hassan",
        role_id: "ROLE_ADMIN",
        department_id: "DEPT_ADMIN",
        phone: "+234 803 123 4567",
        employee_id: "KNS-MOH-001",
        status: "active" as const,
      },
      {
        name: "Mallam Ibrahim Kano Muhammad",
        email: "ibrahim.kano@kanohealth.gov.ng",
        username: "ibrahim.kano",
        role_id: "ROLE_PROC_MANAGER",
        department_id: "DEPT_PROCUREMENT",
        phone: "+234 805 987 6543",
        employee_id: "KNS-MOH-002",
        status: "active" as const,
      },
      {
        name: "Engr. Fatima Aliyu Dantata",
        email: "fatima.aliyu@kanohealth.gov.ng",
        username: "fatima.aliyu",
        role_id: "ROLE_EVALUATOR",
        department_id: "DEPT_TECHNICAL",
        phone: "+234 807 555 1234",
        employee_id: "KNS-MOH-003",
        status: "active" as const,
      },
      {
        name: "Malam Usman Bello Ahmad",
        email: "usman.bello@kanohealth.gov.ng",
        username: "usman.bello",
        role_id: "ROLE_ACCOUNTANT",
        department_id: "DEPT_FINANCE",
        phone: "+234 814 567 8901",
        employee_id: "KNS-MOH-004",
        status: "active" as const,
      },
      {
        name: "Barr. Zainab Ibrahim Yakubu",
        email: "zainab.ibrahim@kanohealth.gov.ng",
        username: "zainab.ibrahim",
        role_id: "ROLE_LEGAL_ADVISOR",
        department_id: "DEPT_LEGAL",
        phone: "+234 809 234 5678",
        employee_id: "KNS-MOH-005",
        status: "active" as const,
      },
      {
        name: "Dr. Musa Garba Shehu",
        email: "musa.garba@kanohealth.gov.ng",
        username: "musa.garba",
        role_id: "ROLE_COMMITTEE_CHAIR",
        department_id: "DEPT_TECHNICAL",
        phone: "+234 803 654 7890",
        employee_id: "KNS-MOH-006",
        status: "active" as const,
      },
      {
        name: "Hajiya Khadija Sani Yahaya",
        email: "khadija.sani@kanohealth.gov.ng",
        username: "khadija.sani",
        role_id: "ROLE_PROC_OFFICER",
        department_id: "DEPT_PROCUREMENT",
        phone: "+234 805 321 6547",
        employee_id: "KNS-MOH-007",
        status: "active" as const,
      },
      {
        name: "Engr. Ahmad Tijjani Musa",
        email: "ahmad.tijjani@kanohealth.gov.ng",
        username: "ahmad.tijjani",
        role_id: "ROLE_EVALUATOR",
        department_id: "DEPT_TECHNICAL",
        phone: "+234 807 987 3210",
        employee_id: "KNS-MOH-008",
        status: "inactive" as const, // Test inactive user
      },
      {
        name: "Mal. Bashir Umar Sani",
        email: "bashir.umar@kanohealth.gov.ng",
        username: "bashir.umar",
        role_id: "ROLE_PROC_OFFICER",
        department_id: "DEPT_PLANNING",
        phone: "+234 814 456 7891",
        employee_id: "KNS-MOH-009",
        status: "pending_approval" as const, // Test pending user
      },
      {
        name: "Dr. Halima Adamu Ibrahim",
        email: "halima.adamu@kanohealth.gov.ng",
        username: "halima.adamu",
        role_id: "ROLE_EVALUATOR",
        department_id: "DEPT_TECHNICAL",
        phone: "+234 803 789 4561",
        employee_id: "KNS-MOH-010",
        status: "active" as const,
      },
    ];

    // Create users from predefined data
    predefinedUsers.forEach((userData, index) => {
      const role = DEFAULT_ROLES.find(r => r.role_id === userData.role_id)!;
      const department = DEFAULT_DEPARTMENTS.find(d => d.department_id === userData.department_id)!;
      
      const user: User = {
        user_id: generateUserId(),
        name: userData.name,
        email: userData.email,
        username: userData.username,
        role,
        department,
        permissions: role.default_permissions,
        status: userData.status,
        created_date: new Date(currentDate.getTime() - (30 - index) * 24 * 60 * 60 * 1000).toISOString(),
        created_by: index === 0 ? "SYSTEM" : users[0]?.user_id || "SYSTEM",
        ministry_id: this.ministryId,
        phone: userData.phone,
        employee_id: userData.employee_id,
        last_login: userData.status === "active" ? 
          new Date(currentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() :
          undefined,
      };

      users.push(user);
    });

    return users;
  }

  private generateCommittees(users: User[]): Committee[] {
    const committees: Committee[] = [];
    const activeUsers = users.filter(u => u.status === "active");

    // Test committee with 2 users as requested
    if (this.includeTestCommittee) {
      const testCommittee: Committee = {
        committee_id: generateCommitteeId(),
        committee_name: "Medical Equipment Evaluation Committee",
        committee_type: "technical_evaluation",
        members: [
          {
            user_id: activeUsers.find(u => u.role.role_name.includes("Chair"))?.user_id || activeUsers[0].user_id,
            committee_role: "chair",
            assigned_date: new Date().toISOString(),
            assigned_by: activeUsers[0].user_id,
            status: "active",
            coi_status: "declared_no_conflict",
          },
          {
            user_id: activeUsers.find(u => u.role.role_name.includes("Evaluator"))?.user_id || activeUsers[1].user_id,
            committee_role: "evaluator",
            assigned_date: new Date().toISOString(),
            assigned_by: activeUsers[0].user_id,
            status: "active",
            coi_status: "declared_no_conflict",
          },
        ],
        created_date: new Date().toISOString(),
        status: "active",
        tender_id: "MOH-2024-001", // Link to tender from overview
        ministry_id: this.ministryId,
      };
      committees.push(testCommittee);
    }

    // Financial Evaluation Committee
    const financialCommittee: Committee = {
      committee_id: generateCommitteeId(),
      committee_name: "Financial Evaluation Committee",
      committee_type: "financial_evaluation",
      members: [
        {
          user_id: activeUsers.find(u => u.department.department_code === "FIN")?.user_id || activeUsers[2].user_id,
          committee_role: "chair",
          assigned_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: activeUsers[0].user_id,
          status: "active",
          coi_status: "declared_no_conflict",
        },
        {
          user_id: activeUsers.find(u => u.role.role_name.includes("Accountant"))?.user_id || activeUsers[3].user_id,
          committee_role: "financial_analyst",
          assigned_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: activeUsers[0].user_id,
          status: "active",
          coi_status: "declared_no_conflict",
        },
        {
          user_id: activeUsers.find(u => u.department.department_code === "LEGAL")?.user_id || activeUsers[4].user_id,
          committee_role: "legal_advisor",
          assigned_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: activeUsers[0].user_id,
          status: "active",
          coi_status: "declared_no_conflict",
        },
      ],
      created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      tender_id: "MOH-2024-002",
      ministry_id: this.ministryId,
    };
    committees.push(financialCommittee);

    // Procurement Planning Committee
    const procurementCommittee: Committee = {
      committee_id: generateCommitteeId(),
      committee_name: "Annual Procurement Planning Committee",
      committee_type: "procurement_planning",
      members: [
        {
          user_id: activeUsers.find(u => u.role.role_name.includes("Procurement Manager"))?.user_id || activeUsers[1].user_id,
          committee_role: "chair",
          assigned_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: activeUsers[0].user_id,
          status: "active",
          coi_status: "declared_no_conflict",
        },
        {
          user_id: activeUsers.find(u => u.role.role_name.includes("Procurement Officer"))?.user_id || activeUsers[5].user_id,
          committee_role: "secretary",
          assigned_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: activeUsers[0].user_id,
          status: "active",
          coi_status: "declared_no_conflict",
        },
        {
          user_id: activeUsers.find(u => u.department.department_code === "PLAN")?.user_id || activeUsers[6].user_id,
          committee_role: "evaluator",
          assigned_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_by: activeUsers[0].user_id,
          status: "active",
          coi_status: "declared_with_conflict", // Test COI case
        },
      ],
      created_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      ministry_id: this.ministryId,
    };
    committees.push(procurementCommittee);

    return committees;
  }

  private generateCOIDeclarations(users: User[], committees: Committee[]): COIDeclaration[] {
    if (!this.includeRealisticCOI) return [];

    const coiDeclarations: COIDeclaration[] = [];

    // Generate realistic COI scenario
    const conflictedUser = users.find(u => u.name.includes("Bashir"));
    if (conflictedUser) {
      const declaration: COIDeclaration = {
        coi_id: generateCOIId(),
        user_id: conflictedUser.user_id,
        tender_id: "MOH-2024-001",
        declaration_type: "professional",
        has_conflict: true,
        conflict_details: "Previously worked as consultant for one of the bidding companies",
        relationship_type: "consultant",
        company_name: "PrimeCare Medical Ltd",
        financial_interest: "Consulting fees received in 2023",
        declared_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "pending_review",
      };
      coiDeclarations.push(declaration);
    }

    // Generate no-conflict declarations for other users
    users.filter(u => u.status === "active" && u !== conflictedUser).slice(0, 5).forEach(user => {
      const declaration: COIDeclaration = {
        coi_id: generateCOIId(),
        user_id: user.user_id,
        tender_id: "MOH-2024-001",
        declaration_type: "none",
        has_conflict: false,
        declared_date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "declared_no_conflict",
      };
      coiDeclarations.push(declaration);
    });

    return coiDeclarations;
  }

  private generateUserActivities(users: User[]): UserActivity[] {
    const activities: UserActivity[] = [];
    const actions = [
      "login",
      "tender_created",
      "bid_evaluated",
      "committee_joined",
      "noc_requested",
      "contract_reviewed",
      "report_generated",
      "user_created",
      "permission_updated",
    ];

    const modules = [
      "authentication",
      "tender_management",
      "evaluation",
      "committee_management",
      "noc_management",
      "contract_management",
      "reporting",
      "user_management",
    ];

    users.filter(u => u.status === "active").forEach(user => {
      // Generate 3-10 activities per active user
      const activityCount = Math.floor(Math.random() * 8) + 3;
      
      for (let i = 0; i < activityCount; i++) {
        const activity: UserActivity = {
          activity_id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: user.user_id,
          action: actions[Math.floor(Math.random() * actions.length)],
          module: modules[Math.floor(Math.random() * modules.length)],
          target_id: `target-${Math.random().toString(36).substr(2, 9)}`,
          target_type: "tender",
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          details: {
            success: Math.random() > 0.1,
            duration: Math.floor(Math.random() * 5000) + 100,
          },
          result: Math.random() > 0.1 ? "success" : "failure",
        };
        activities.push(activity);
      }
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Static method for easy integration
  public static generateAndSave(options: MockDataOptions): void {
    const generator = new UserMockDataGenerator(options);
    const data = generator.generateCompleteUserData();

    // Save to localStorage
    localStorage.setItem(`ministry_users_${options.ministryId}`, JSON.stringify(data.users));
    localStorage.setItem(`ministry_committees_${options.ministryId}`, JSON.stringify(data.committees));
    localStorage.setItem(`ministry_coi_${options.ministryId}`, JSON.stringify(data.coiDeclarations));
    localStorage.setItem(`user_activities_${options.ministryId}`, JSON.stringify(data.userActivities));

    console.log("Mock user data generated and saved:", {
      users: data.users.length,
      committees: data.committees.length,
      coiDeclarations: data.coiDeclarations.length,
      userActivities: data.userActivities.length,
    });
  }

  // Utility method to create test scenario for committee assignment
  public static createTestCommitteeScenario(ministryId: string): {
    committee: Committee;
    availableUsers: User[];
    sampleAssignment: any;
  } {
    const usersKey = `ministry_users_${ministryId}`;
    const users: User[] = JSON.parse(localStorage.getItem(usersKey) || "[]");
    
    const activeUsers = users.filter(u => u.status === "active");
    
    const testCommittee: Committee = {
      committee_id: generateCommitteeId(),
      committee_name: "IT Infrastructure Evaluation Committee",
      committee_type: "technical_evaluation",
      members: [
        {
          user_id: activeUsers[0]?.user_id || "",
          committee_role: "chair",
          assigned_date: new Date().toISOString(),
          assigned_by: activeUsers[0]?.user_id || "",
          status: "active",
          coi_status: "declared_no_conflict",
        },
        {
          user_id: activeUsers[1]?.user_id || "",
          committee_role: "technical_expert",
          assigned_date: new Date().toISOString(),
          assigned_by: activeUsers[0]?.user_id || "",
          status: "active",
          coi_status: "declared_no_conflict",
        },
      ],
      created_date: new Date().toISOString(),
      status: "active",
      tender_id: "MOH-2024-004",
      ministry_id: ministryId,
    };

    const sampleAssignment = {
      committeeName: testCommittee.committee_name,
      assignedUsers: testCommittee.members.map(member => {
        const user = users.find(u => u.user_id === member.user_id);
        return {
          name: user?.name || "Unknown User",
          role: member.committee_role,
          coiStatus: member.coi_status,
        };
      }),
      eligibleForNewRole: activeUsers.filter(u => 
        !testCommittee.members.some(m => m.user_id === u.user_id)
      ).slice(0, 3).map(u => ({
        id: u.user_id,
        name: u.name,
        department: u.department.department_name,
        role: u.role.role_name,
      })),
    };

    return {
      committee: testCommittee,
      availableUsers: activeUsers,
      sampleAssignment,
    };
  }
}

// Export convenience function
export const generateMockUserData = (ministryId: string): void => {
  UserMockDataGenerator.generateAndSave({
    ministryId,
    userCount: 10,
    committeeCount: 3,
    includeTestCommittee: true,
    includeRealisticCOI: true,
  });
};
