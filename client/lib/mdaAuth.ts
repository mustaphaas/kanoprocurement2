/**
 * MDA Authentication Service
 * Manages authentication for MDA administrators and users
 */

export interface MDACredential {
  id: string;
  name: string;
  type: "ministry" | "department" | "agency";
  adminEmail: string;
  adminName: string;
  adminRole: "mda_admin" | "mda_super_admin";
  loginUrl: string;
  createdAt: string;
  createdBy: string;
}

export interface MDALoginData {
  mdaId: string;
  email: string;
  role: "mda_admin" | "mda_super_admin" | "procurement_officer" | "evaluator" | "accountant" | "viewer";
  displayName: string;
  permissions: any;
  loginTime: string;
}

class MDAAuthService {
  private CREDENTIALS_KEY = "mdaCredentials";
  private CURRENT_USER_KEY = "ministryUser";

  /**
   * Get all MDA credentials
   */
  getAllCredentials(): MDACredential[] {
    try {
      const credentials = localStorage.getItem(this.CREDENTIALS_KEY);
      return credentials ? JSON.parse(credentials) : [];
    } catch (error) {
      console.error("Error loading MDA credentials:", error);
      return [];
    }
  }

  /**
   * Find MDA by admin email
   */
  findMDAByEmail(email: string): MDACredential | null {
    const credentials = this.getAllCredentials();
    return credentials.find(cred => cred.adminEmail.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Authenticate MDA administrator
   */
  authenticateAdmin(email: string, password: string): { success: boolean; user?: MDALoginData; error?: string } {
    try {
      const mda = this.findMDAByEmail(email);
      
      if (!mda) {
        return { success: false, error: "Invalid email or password" };
      }

      // For demo purposes, we'll accept any password
      // In a real system, this would verify against a secure password system
      if (!password) {
        return { success: false, error: "Password is required" };
      }

      // Get admin data from localStorage
      const allAdmins = JSON.parse(localStorage.getItem("mda_admins") || "[]");
      const admin = allAdmins.find((a: any) => a.mdaId === mda.id);

      if (!admin) {
        return { success: false, error: "Administrator data not found" };
      }

      const loginData: MDALoginData = {
        mdaId: mda.id,
        email: email,
        role: mda.adminRole,
        displayName: mda.adminName,
        permissions: admin.permissions,
        loginTime: new Date().toISOString(),
      };

      // Store current user session
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify({
        ministryId: mda.id,
        email: email,
        name: mda.adminName,
        role: mda.adminRole,
        loginTime: loginData.loginTime,
      }));

      console.log(`✅ MDA Admin logged in: ${mda.adminName} (${email}) for ${mda.name}`);

      return { success: true, user: loginData };
    } catch (error) {
      console.error("Error during MDA authentication:", error);
      return { success: false, error: "Authentication failed" };
    }
  }

  /**
   * Check if user is currently logged in
   */
  getCurrentUser(): any | null {
    try {
      const userData = localStorage.getItem(this.CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get current user's MDA information
   */
  getCurrentMDA(): MDACredential | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const credentials = this.getAllCredentials();
    return credentials.find(cred => cred.id === user.ministryId) || null;
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    console.log("🚪 MDA user logged out");
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Super admins have all permissions
    if (user.role === "mda_super_admin") return true;

    // Get admin permissions from localStorage
    const allAdmins = JSON.parse(localStorage.getItem("mda_admins") || "[]");
    const admin = allAdmins.find((a: any) => a.mdaId === user.ministryId);
    
    if (!admin) return false;

    // Check specific permissions
    switch (permission) {
      case "canCreateUsers":
        return admin.permissions?.canCreateUsers || false;
      case "canManageTenders":
        return admin.permissions?.canManageTenders || false;
      case "canApproveContracts":
        return admin.permissions?.canApproveContracts || false;
      case "canViewReports":
        return admin.permissions?.canViewReports || false;
      case "canManageSettings":
        return admin.permissions?.canManageSettings || false;
      default:
        return false;
    }
  }

  /**
   * Get all users for current MDA
   */
  getMDAUsers(): any[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    const allUsers = JSON.parse(localStorage.getItem("mda_users") || "[]");
    return allUsers.filter((u: any) => u.mdaId === user.ministryId);
  }

  /**
   * Check if current user can manage users
   */
  canManageUsers(): boolean {
    return this.hasPermission("canCreateUsers");
  }

  /**
   * Debug information
   */
  debugInfo(): void {
    console.log("=== MDA AUTH DEBUG INFO ===");
    console.log("Current User:", this.getCurrentUser());
    console.log("Current MDA:", this.getCurrentMDA());
    console.log("Can Manage Users:", this.canManageUsers());
    console.log("MDA Users:", this.getMDAUsers());
    console.log("All Credentials:", this.getAllCredentials());
    console.log("===========================");
  }
}

export const mdaAuthService = new MDAAuthService();
