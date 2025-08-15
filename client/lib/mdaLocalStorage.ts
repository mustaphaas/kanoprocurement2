import {
  MDA,
  MDAAdmin,
  MDAUser,
  CreateMDARequest,
  CreateMDAAdminRequest,
  CreateMDAUserRequest,
  EnhancedUserProfile,
  MDATender,
} from "@shared/api";

/**
 * MDA LocalStorage Service
 *
 * This service provides MDA management functionality using localStorage
 * for data persistence. All data is stored locally in the browser.
 */
class MDALocalStorageService {
  private readonly MDA_KEY = "mdas";
  private readonly MDA_ADMIN_KEY = "mda_admins";
  private readonly MDA_USER_KEY = "mda_users";
  private readonly MDA_TENDER_KEY = "mda_tenders";
  private readonly MDA_STATS_KEY = "mda_stats";

  // Utility methods for localStorage operations
  private getFromStorage<T>(key: string, defaultValue: T[] = []): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return defaultValue as T[];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage key ${key}:`, error);
    }
  }

  private generateId(): string {
    return `mda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // MDA Operations
  async createMDA(data: CreateMDARequest, createdBy: string): Promise<MDA> {
    const mdas = this.getFromStorage<MDA>(this.MDA_KEY);

    const newMDA: MDA = {
      id: this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    mdas.push(newMDA);
    this.saveToStorage(this.MDA_KEY, mdas);

    console.log(`✅ Created MDA: ${newMDA.name}`);
    return newMDA;
  }

  async getMDA(mdaId: string): Promise<MDA | null> {
    const mdas = this.getFromStorage<MDA>(this.MDA_KEY);
    const mda = mdas.find((m) => m.id === mdaId);

    if (mda) {
      // Convert date strings back to Date objects
      return {
        ...mda,
        createdAt: new Date(mda.createdAt),
        updatedAt: new Date(mda.updatedAt),
      };
    }

    return null;
  }

  async getAllMDAs(): Promise<MDA[]> {
    const mdas = this.getFromStorage<MDA>(this.MDA_KEY);

    return mdas
      .filter((mda) => mda.isActive)
      .map((mda) => ({
        ...mda,
        createdAt: new Date(mda.createdAt),
        updatedAt: new Date(mda.updatedAt),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateMDA(
    mdaId: string,
    updates: Partial<MDA>,
    updatedBy: string,
  ): Promise<void> {
    const mdas = this.getFromStorage<MDA>(this.MDA_KEY);
    const index = mdas.findIndex((m) => m.id === mdaId);

    if (index !== -1) {
      mdas[index] = {
        ...mdas[index],
        ...updates,
        updatedAt: new Date(),
      };

      this.saveToStorage(this.MDA_KEY, mdas);
      console.log(`✅ Updated MDA: ${mdas[index].name}`);
    }
  }

  async deleteMDA(mdaId: string): Promise<void> {
    const mdas = this.getFromStorage<MDA>(this.MDA_KEY);
    const updatedMDAs = mdas.filter((m) => m.id !== mdaId);

    this.saveToStorage(this.MDA_KEY, updatedMDAs);

    // Also remove related admins and users
    const admins = this.getFromStorage<MDAAdmin>(this.MDA_ADMIN_KEY);
    const updatedAdmins = admins.filter((a) => a.mdaId !== mdaId);
    this.saveToStorage(this.MDA_ADMIN_KEY, updatedAdmins);

    const users = this.getFromStorage<MDAUser>(this.MDA_USER_KEY);
    const updatedUsers = users.filter((u) => u.mdaId !== mdaId);
    this.saveToStorage(this.MDA_USER_KEY, updatedUsers);

    console.log(`✅ Deleted MDA and related data for ID: ${mdaId}`);
  }

  // MDA Admin Operations
  async createMDAAdmin(
    data: CreateMDAAdminRequest,
    createdBy: string,
  ): Promise<MDAAdmin> {
    const admins = this.getFromStorage<MDAAdmin>(this.MDA_ADMIN_KEY);

    const newAdmin: MDAAdmin = {
      id: this.generateId(),
      mdaId: data.mdaId,
      userId: `user-${Date.now()}`,
      role: data.role,
      permissions: data.permissions,
      assignedBy: createdBy,
      assignedAt: new Date(),
      isActive: true,
    };

    admins.push(newAdmin);
    this.saveToStorage(this.MDA_ADMIN_KEY, admins);

    console.log(
      `✅ Created MDA Admin: ${data.displayName} for MDA: ${data.mdaId}`,
    );
    return newAdmin;
  }

  async getMDAAdmins(
    mdaId?: string,
  ): Promise<(MDAAdmin & { user: EnhancedUserProfile; mda: MDA })[]> {
    const admins = this.getFromStorage<MDAAdmin>(this.MDA_ADMIN_KEY);
    const mdas = this.getFromStorage<MDA>(this.MDA_KEY);

    let filteredAdmins = admins.filter((admin) => admin.isActive);

    if (mdaId) {
      filteredAdmins = filteredAdmins.filter((admin) => admin.mdaId === mdaId);
    }

    return filteredAdmins.map((admin) => {
      const mda = mdas.find((m) => m.id === admin.mdaId);

      // Create mock user profile
      const user: EnhancedUserProfile = {
        uid: admin.userId,
        email: `admin-${admin.id}@kanostate.gov.ng`,
        displayName: `MDA Administrator`,
        role: "mda_admin",
        mdaId: admin.mdaId,
        mdaRole: admin.role,
        createdAt: new Date(admin.assignedAt),
        lastLoginAt: new Date(),
        emailVerified: true,
      };

      return {
        ...admin,
        assignedAt: new Date(admin.assignedAt),
        user,
        mda: mda
          ? {
              ...mda,
              createdAt: new Date(mda.createdAt),
              updatedAt: new Date(mda.updatedAt),
            }
          : ({} as MDA),
      };
    });
  }

  // MDA User Operations
  async createMDAUser(
    data: CreateMDAUserRequest,
    createdBy: string,
  ): Promise<MDAUser> {
    const users = this.getFromStorage<MDAUser>(this.MDA_USER_KEY);

    const newUser: MDAUser = {
      id: this.generateId(),
      mdaId: data.mdaId,
      userId: `user-${Date.now()}`,
      role: data.role,
      department: data.department,
      permissions: data.permissions,
      createdBy: createdBy,
      createdAt: new Date(),
      isActive: true,
    };

    users.push(newUser);
    this.saveToStorage(this.MDA_USER_KEY, users);

    console.log(
      `✅ Created MDA User: ${data.displayName} (${data.role}) for MDA: ${data.mdaId}`,
    );
    return newUser;
  }

  async getMDAUsers(
    mdaId: string,
  ): Promise<(MDAUser & { user: EnhancedUserProfile })[]> {
    const users = this.getFromStorage<MDAUser>(this.MDA_USER_KEY);

    const filteredUsers = users.filter(
      (user) => user.mdaId === mdaId && user.isActive,
    );

    return filteredUsers.map((user) => {
      // Create mock user profile
      const userProfile: EnhancedUserProfile = {
        uid: user.userId,
        email: `${user.role}-${user.id}@kanostate.gov.ng`,
        displayName: `${user.role.replace("_", " ").toUpperCase()} User`,
        role: "mda_user",
        mdaId: user.mdaId,
        mdaRole: user.role,
        department: user.department,
        createdAt: new Date(user.createdAt),
        lastLoginAt: new Date(),
        emailVerified: true,
      };

      return {
        ...user,
        createdAt: new Date(user.createdAt),
        user: userProfile,
      };
    });
  }

  // Tender Operations
  async createTender(
    tender: Omit<MDATender, "id" | "createdAt" | "updatedAt">,
    createdBy: string,
  ): Promise<MDATender> {
    const tenders = this.getFromStorage<MDATender>(this.MDA_TENDER_KEY);

    const newTender: MDATender = {
      ...tender,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tenders.push(newTender);
    this.saveToStorage(this.MDA_TENDER_KEY, tenders);

    console.log(`✅ Created tender: ${newTender.title}`);
    return newTender;
  }

  async getMDATenders(mdaId: string): Promise<MDATender[]> {
    const tenders = this.getFromStorage<MDATender>(this.MDA_TENDER_KEY);

    return tenders
      .filter((tender) => tender.mdaId === mdaId)
      .map((tender) => ({
        ...tender,
        publishDate: tender.publishDate ? new Date(tender.publishDate) : null,
        closingDate: tender.closingDate ? new Date(tender.closingDate) : null,
        createdAt: new Date(tender.createdAt),
        updatedAt: new Date(tender.updatedAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Dashboard Statistics
  async getMDAStats(mdaId: string): Promise<any> {
    const tenders = await this.getMDATenders(mdaId);
    const users = await this.getMDAUsers(mdaId);
    const admins = await this.getMDAAdmins(mdaId);

    const activeTenders = tenders.filter(
      (t) => t.status === "published",
    ).length;
    const totalValue = tenders.reduce((sum, t) => sum + t.estimatedValue, 0);
    const awardedTenders = tenders.filter((t) => t.status === "awarded").length;
    const draftTenders = tenders.filter((t) => t.status === "draft").length;

    return {
      totalTenders: tenders.length,
      activeTenders,
      totalValue,
      averageProcessingTime: 14, // Mock value
      successfulAwards: awardedTenders,
      pendingApprovals: draftTenders,
      totalUsers: users.length,
      totalAdmins: admins.length,
      monthlyTrends: this.generateMockTrends(tenders),
    };
  }

  async getSystemStats(): Promise<any> {
    const mdas = await this.getAllMDAs();
    const allAdmins = await this.getMDAAdmins();
    const allTenders = this.getFromStorage<MDATender>(this.MDA_TENDER_KEY);
    const allUsers = this.getFromStorage<MDAUser>(this.MDA_USER_KEY);

    const totalValue = allTenders.reduce((sum, t) => sum + t.estimatedValue, 0);

    return {
      totalMDAs: mdas.length,
      activeMDAs: mdas.filter((m) => m.isActive).length,
      totalAdmins: allAdmins.length,
      totalUsers: allUsers.length,
      systemWideStats: {
        totalTenders: allTenders.length,
        totalValue,
        averageEfficiency: 92.5, // Mock value
      },
      mdaPerformance: mdas.map((mda) => ({
        mdaId: mda.id,
        mdaName: mda.name,
        tenderCount: allTenders.filter((t) => t.mdaId === mda.id).length,
        efficiency: Math.floor(Math.random() * 20) + 80, // Mock efficiency between 80-100%
      })),
    };
  }

  // Utility Methods
  private generateMockTrends(tenders: MDATender[]): any[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May"];

    return months.map((month) => {
      const monthTenders = Math.floor(Math.random() * 5) + 1;
      const monthValue =
        monthTenders * (Math.floor(Math.random() * 100000000) + 50000000);

      return {
        month,
        tenders: monthTenders,
        value: monthValue,
      };
    });
  }

  // Data Management
  clearAllData(): void {
    localStorage.removeItem(this.MDA_KEY);
    localStorage.removeItem(this.MDA_ADMIN_KEY);
    localStorage.removeItem(this.MDA_USER_KEY);
    localStorage.removeItem(this.MDA_TENDER_KEY);
    localStorage.removeItem(this.MDA_STATS_KEY);
    console.log("🗑️ Cleared all MDA data from localStorage");
  }

  exportData(): string {
    const data = {
      mdas: this.getFromStorage(this.MDA_KEY),
      admins: this.getFromStorage(this.MDA_ADMIN_KEY),
      users: this.getFromStorage(this.MDA_USER_KEY),
      tenders: this.getFromStorage(this.MDA_TENDER_KEY),
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);

      if (data.mdas) this.saveToStorage(this.MDA_KEY, data.mdas);
      if (data.admins) this.saveToStorage(this.MDA_ADMIN_KEY, data.admins);
      if (data.users) this.saveToStorage(this.MDA_USER_KEY, data.users);
      if (data.tenders) this.saveToStorage(this.MDA_TENDER_KEY, data.tenders);

      console.log("✅ Successfully imported MDA data");
    } catch (error) {
      console.error("❌ Failed to import MDA data:", error);
      throw new Error("Invalid data format");
    }
  }

  // Check if service is available
  isAvailable(): boolean {
    try {
      const testKey = "__mda_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const mdaLocalStorageService = new MDALocalStorageService();
