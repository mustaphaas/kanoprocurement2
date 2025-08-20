// User Synchronization Service for Ministry Dashboard
// Handles user status changes and their effects across the procurement system

import {
  User,
  UserStatus,
  Committee,
  CommitteeMember,
  COIDeclaration,
  hasPermission,
} from "@shared/userManagement";

export interface UserSyncEvent {
  type: "status_change" | "role_change" | "permission_change" | "deletion";
  user_id: string;
  old_value?: any;
  new_value?: any;
  timestamp: string;
  triggered_by: string;
  affected_modules: string[];
}

export interface SyncRule {
  trigger: string;
  action: string;
  target_modules: string[];
  priority: number;
}

export class UserSyncService {
  private static instance: UserSyncService;
  private ministryId: string;
  private eventListeners: Map<string, Function[]> = new Map();
  private syncRules: SyncRule[] = [];

  constructor(ministryId: string) {
    this.ministryId = ministryId;
    this.initializeSyncRules();
  }

  static getInstance(ministryId: string): UserSyncService {
    if (!UserSyncService.instance) {
      UserSyncService.instance = new UserSyncService(ministryId);
    }
    return UserSyncService.instance;
  }

  private initializeSyncRules(): void {
    this.syncRules = [
      {
        trigger: "user_deactivated",
        action: "remove_from_committees",
        target_modules: ["committee_management", "tender_evaluation"],
        priority: 1,
      },
      {
        trigger: "user_deactivated",
        action: "disable_login",
        target_modules: ["authentication", "session_management"],
        priority: 1,
      },
      {
        trigger: "user_deactivated",
        action: "revoke_active_permissions",
        target_modules: ["tender_management", "contract_management", "noc_management"],
        priority: 1,
      },
      {
        trigger: "role_changed",
        action: "update_permissions",
        target_modules: ["all_modules"],
        priority: 2,
      },
      {
        trigger: "role_changed",
        action: "reassess_committee_eligibility",
        target_modules: ["committee_management"],
        priority: 2,
      },
      {
        trigger: "user_deleted",
        action: "cleanup_references",
        target_modules: ["all_modules"],
        priority: 1,
      },
      {
        trigger: "permission_changed",
        action: "update_ui_access",
        target_modules: ["dashboard", "navigation"],
        priority: 3,
      },
    ];
  }

  // Main synchronization method
  public async syncUserChange(
    user: User,
    changeType: "status_change" | "role_change" | "permission_change" | "deletion",
    oldValue: any,
    newValue: any,
    triggeredBy: string
  ): Promise<UserSyncEvent> {
    const event: UserSyncEvent = {
      type: changeType,
      user_id: user.user_id,
      old_value: oldValue,
      new_value: newValue,
      timestamp: new Date().toISOString(),
      triggered_by: triggeredBy,
      affected_modules: [],
    };

    // Execute synchronization rules
    const applicableRules = this.getSyncRules(changeType, user, oldValue, newValue);
    
    for (const rule of applicableRules) {
      try {
        await this.executeSyncRule(rule, user, event);
        event.affected_modules.push(...rule.target_modules);
      } catch (error) {
        console.error(`Failed to execute sync rule ${rule.action}:`, error);
      }
    }

    // Log the sync event
    this.logSyncEvent(event);

    // Notify listeners
    this.notifyListeners(event);

    return event;
  }

  private getSyncRules(
    changeType: string,
    user: User,
    oldValue: any,
    newValue: any
  ): SyncRule[] {
    let triggerType = "";

    switch (changeType) {
      case "status_change":
        if (newValue === "inactive" || newValue === "suspended") {
          triggerType = "user_deactivated";
        } else if (newValue === "active" && oldValue !== "active") {
          triggerType = "user_activated";
        }
        break;
      case "role_change":
        triggerType = "role_changed";
        break;
      case "permission_change":
        triggerType = "permission_changed";
        break;
      case "deletion":
        triggerType = "user_deleted";
        break;
    }

    return this.syncRules
      .filter(rule => rule.trigger === triggerType)
      .sort((a, b) => a.priority - b.priority);
  }

  private async executeSyncRule(rule: SyncRule, user: User, event: UserSyncEvent): Promise<void> {
    switch (rule.action) {
      case "remove_from_committees":
        await this.removeUserFromCommittees(user.user_id);
        break;
      case "disable_login":
        await this.disableUserLogin(user.user_id);
        break;
      case "revoke_active_permissions":
        await this.revokeActivePermissions(user.user_id);
        break;
      case "update_permissions":
        await this.updateUserPermissions(user);
        break;
      case "reassess_committee_eligibility":
        await this.reassessCommitteeEligibility(user);
        break;
      case "cleanup_references":
        await this.cleanupUserReferences(user.user_id);
        break;
      case "update_ui_access":
        await this.updateUIAccess(user);
        break;
    }
  }

  // Synchronization Actions

  private async removeUserFromCommittees(userId: string): Promise<void> {
    try {
      const committeesKey = `ministry_committees_${this.ministryId}`;
      const committeesData = localStorage.getItem(committeesKey);
      
      if (committeesData) {
        const committees: Committee[] = JSON.parse(committeesData);
        
        const updatedCommittees = committees.map(committee => ({
          ...committee,
          members: committee.members.map(member => 
            member.user_id === userId 
              ? { ...member, status: "inactive" as const }
              : member
          )
        }));

        localStorage.setItem(committeesKey, JSON.stringify(updatedCommittees));
        
        // Notify committee management module
        this.emit("committee_membership_changed", { userId, action: "removed" });
      }
    } catch (error) {
      console.error("Error removing user from committees:", error);
    }
  }

  private async disableUserLogin(userId: string): Promise<void> {
    try {
      // Add to disabled users list
      const disabledUsersKey = `disabled_users_${this.ministryId}`;
      const disabledUsers = JSON.parse(localStorage.getItem(disabledUsersKey) || "[]");
      
      if (!disabledUsers.includes(userId)) {
        disabledUsers.push(userId);
        localStorage.setItem(disabledUsersKey, JSON.stringify(disabledUsers));
      }

      // Clear any active sessions
      const activeSessionsKey = `active_sessions_${this.ministryId}`;
      const activeSessions = JSON.parse(localStorage.getItem(activeSessionsKey) || "{}");
      
      if (activeSessions[userId]) {
        delete activeSessions[userId];
        localStorage.setItem(activeSessionsKey, JSON.stringify(activeSessions));
      }

      this.emit("user_login_disabled", { userId });
    } catch (error) {
      console.error("Error disabling user login:", error);
    }
  }

  private async revokeActivePermissions(userId: string): Promise<void> {
    try {
      // Store revoked permissions for potential restoration
      const revokedPermissionsKey = `revoked_permissions_${this.ministryId}`;
      const revokedPermissions = JSON.parse(localStorage.getItem(revokedPermissionsKey) || "{}");
      
      const usersKey = `ministry_users_${this.ministryId}`;
      const usersData = localStorage.getItem(usersKey);
      
      if (usersData) {
        const users: User[] = JSON.parse(usersData);
        const user = users.find(u => u.user_id === userId);
        
        if (user) {
          // Store current permissions for potential restoration
          revokedPermissions[userId] = {
            permissions: user.permissions,
            revoked_date: new Date().toISOString(),
          };
          
          localStorage.setItem(revokedPermissionsKey, JSON.stringify(revokedPermissions));
        }
      }

      this.emit("permissions_revoked", { userId });
    } catch (error) {
      console.error("Error revoking permissions:", error);
    }
  }

  private async updateUserPermissions(user: User): Promise<void> {
    try {
      // Update user permissions based on new role
      const usersKey = `ministry_users_${this.ministryId}`;
      const usersData = localStorage.getItem(usersKey);
      
      if (usersData) {
        const users: User[] = JSON.parse(usersData);
        const updatedUsers = users.map(u => 
          u.user_id === user.user_id 
            ? { ...u, permissions: user.role.default_permissions }
            : u
        );
        
        localStorage.setItem(usersKey, JSON.stringify(updatedUsers));
      }

      this.emit("permissions_updated", { userId: user.user_id, newPermissions: user.permissions });
    } catch (error) {
      console.error("Error updating user permissions:", error);
    }
  }

  private async reassessCommitteeEligibility(user: User): Promise<void> {
    try {
      const committeesKey = `ministry_committees_${this.ministryId}`;
      const committeesData = localStorage.getItem(committeesKey);
      
      if (committeesData) {
        const committees: Committee[] = JSON.parse(committeesData);
        
        // Check if user is still eligible for current committee roles
        const affectedCommittees = committees.filter(committee =>
          committee.members.some(member => member.user_id === user.user_id)
        );

        for (const committee of affectedCommittees) {
          const member = committee.members.find(m => m.user_id === user.user_id);
          if (member) {
            // Check if user's new role is compatible with committee role
            const isEligible = this.checkCommitteeRoleEligibility(user, member.committee_role);
            
            if (!isEligible) {
              // Flag for review or automatic removal
              this.emit("committee_eligibility_warning", {
                userId: user.user_id,
                committeeId: committee.committee_id,
                reason: "role_change_incompatible"
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reassessing committee eligibility:", error);
    }
  }

  private async cleanupUserReferences(userId: string): Promise<void> {
    try {
      // Remove from committees
      await this.removeUserFromCommittees(userId);
      
      // Remove COI declarations
      const coiKey = `ministry_coi_${this.ministryId}`;
      const coiData = localStorage.getItem(coiKey);
      
      if (coiData) {
        const coiDeclarations: COIDeclaration[] = JSON.parse(coiData);
        const filteredCOI = coiDeclarations.filter(coi => coi.user_id !== userId);
        localStorage.setItem(coiKey, JSON.stringify(filteredCOI));
      }

      // Update audit logs to mark user as deleted
      const auditKey = `audit_logs_${this.ministryId}`;
      const auditData = localStorage.getItem(auditKey);
      
      if (auditData) {
        const auditLogs = JSON.parse(auditData);
        auditLogs.push({
          id: `audit-${Date.now()}`,
          action: "user_deleted",
          user_id: userId,
          timestamp: new Date().toISOString(),
          details: "User account permanently deleted",
        });
        localStorage.setItem(auditKey, JSON.stringify(auditLogs));
      }

      this.emit("user_references_cleaned", { userId });
    } catch (error) {
      console.error("Error cleaning up user references:", error);
    }
  }

  private async updateUIAccess(user: User): Promise<void> {
    try {
      // Update navigation permissions cache
      const navPermissionsKey = `nav_permissions_${this.ministryId}`;
      const navPermissions = JSON.parse(localStorage.getItem(navPermissionsKey) || "{}");
      
      navPermissions[user.user_id] = {
        permissions: user.permissions.map(p => p.permission_code),
        last_updated: new Date().toISOString(),
      };
      
      localStorage.setItem(navPermissionsKey, JSON.stringify(navPermissions));

      this.emit("ui_access_updated", { userId: user.user_id });
    } catch (error) {
      console.error("Error updating UI access:", error);
    }
  }

  // Helper Methods

  private checkCommitteeRoleEligibility(user: User, committeeRole: string): boolean {
    switch (committeeRole) {
      case "chair":
        return user.role.hierarchy_level <= 2;
      case "evaluator":
        return hasPermission(user, "evaluation.evaluate");
      case "financial_analyst":
        return user.department.department_code === "FIN";
      case "technical_expert":
        return user.department.department_code === "TECH";
      case "legal_advisor":
        return user.department.department_code === "LEGAL";
      default:
        return true;
    }
  }

  // Event System

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  private notifyListeners(event: UserSyncEvent): void {
    this.emit("user_sync_event", event);
    this.emit(`user_${event.type}`, event);
  }

  // Logging

  private logSyncEvent(event: UserSyncEvent): void {
    try {
      const logKey = `user_sync_logs_${this.ministryId}`;
      const logs = JSON.parse(localStorage.getItem(logKey) || "[]");
      
      logs.push(event);
      
      // Keep only last 1000 log entries
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem(logKey, JSON.stringify(logs));
    } catch (error) {
      console.error("Error logging sync event:", error);
    }
  }

  // Public utility methods for checking user states

  public isUserActive(userId: string): boolean {
    try {
      const disabledUsersKey = `disabled_users_${this.ministryId}`;
      const disabledUsers = JSON.parse(localStorage.getItem(disabledUsersKey) || "[]");
      return !disabledUsers.includes(userId);
    } catch (error) {
      console.error("Error checking user active status:", error);
      return false;
    }
  }

  public getUserSyncHistory(userId: string): UserSyncEvent[] {
    try {
      const logKey = `user_sync_logs_${this.ministryId}`;
      const logs: UserSyncEvent[] = JSON.parse(localStorage.getItem(logKey) || "[]");
      return logs.filter(log => log.user_id === userId);
    } catch (error) {
      console.error("Error getting user sync history:", error);
      return [];
    }
  }

  public restoreUserPermissions(userId: string): boolean {
    try {
      const revokedPermissionsKey = `revoked_permissions_${this.ministryId}`;
      const revokedPermissions = JSON.parse(localStorage.getItem(revokedPermissionsKey) || "{}");
      
      if (revokedPermissions[userId]) {
        const usersKey = `ministry_users_${this.ministryId}`;
        const usersData = localStorage.getItem(usersKey);
        
        if (usersData) {
          const users: User[] = JSON.parse(usersData);
          const updatedUsers = users.map(u => 
            u.user_id === userId 
              ? { ...u, permissions: revokedPermissions[userId].permissions }
              : u
          );
          
          localStorage.setItem(usersKey, JSON.stringify(updatedUsers));
          
          // Remove from revoked permissions
          delete revokedPermissions[userId];
          localStorage.setItem(revokedPermissionsKey, JSON.stringify(revokedPermissions));
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error restoring user permissions:", error);
      return false;
    }
  }
}

// Export utility functions
export const createUserSyncService = (ministryId: string): UserSyncService => {
  return UserSyncService.getInstance(ministryId);
};

export const getUserSyncService = (ministryId: string): UserSyncService => {
  return UserSyncService.getInstance(ministryId);
};
