import { persistentStorage } from "./persistentStorage";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogFilter {
  user?: string;
  action?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  entity?: string;
  searchTerm?: string;
}

class AuditLogStorage {
  private readonly AUDIT_LOGS_KEY = "audit_logs";
  private readonly MAX_LOGS = 10000; // Maximum number of logs to keep

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAllLogs(): AuditLogEntry[] {
    try {
      const logs = persistentStorage.getItem(this.AUDIT_LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("Error reading audit logs:", error);
      return [];
    }
  }

  private saveLogs(logs: AuditLogEntry[]): void {
    try {
      // Keep only the most recent logs if we exceed the maximum
      const logsToSave =
        logs.length > this.MAX_LOGS ? logs.slice(-this.MAX_LOGS) : logs;

      persistentStorage.setItem(
        this.AUDIT_LOGS_KEY,
        JSON.stringify(logsToSave),
      );
    } catch (error) {
      console.error("Error saving audit logs:", error);
    }
  }

  public addLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): string {
    const id = this.generateId();
    const timestamp = new Date().toISOString();

    const newEntry: AuditLogEntry = {
      id,
      timestamp,
      ...entry,
      ipAddress: "127.0.0.1", // In a real app, this would be the actual IP
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    const logs = this.getAllLogs();
    logs.push(newEntry);

    // Sort by timestamp (newest first)
    logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    this.saveLogs(logs);

    console.log("🔍 Audit log added:", {
      id,
      action: entry.action,
      entity: entry.entity,
      user: entry.user,
      severity: entry.severity,
    });

    return id;
  }

  public getLogs(filter?: AuditLogFilter, limit?: number): AuditLogEntry[] {
    let logs = this.getAllLogs();

    // Apply filters
    if (filter) {
      if (filter.user) {
        logs = logs.filter((log) =>
          log.user.toLowerCase().includes(filter.user!.toLowerCase()),
        );
      }

      if (filter.action) {
        logs = logs.filter((log) =>
          log.action.toLowerCase().includes(filter.action!.toLowerCase()),
        );
      }

      if (filter.severity) {
        logs = logs.filter((log) => log.severity === filter.severity);
      }

      if (filter.entity) {
        logs = logs.filter((log) =>
          log.entity.toLowerCase().includes(filter.entity!.toLowerCase()),
        );
      }

      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        logs = logs.filter(
          (log) =>
            log.user.toLowerCase().includes(searchTerm) ||
            log.action.toLowerCase().includes(searchTerm) ||
            log.entity.toLowerCase().includes(searchTerm) ||
            log.details.toLowerCase().includes(searchTerm),
        );
      }

      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        logs = logs.filter((log) => new Date(log.timestamp) >= startDate);
      }

      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        logs = logs.filter((log) => new Date(log.timestamp) <= endDate);
      }
    }

    // Apply limit
    if (limit && limit > 0) {
      logs = logs.slice(0, limit);
    }

    return logs;
  }

  public getLogById(id: string): AuditLogEntry | null {
    const logs = this.getAllLogs();
    return logs.find((log) => log.id === id) || null;
  }

  public getLogsByUser(user: string, limit?: number): AuditLogEntry[] {
    return this.getLogs({ user }, limit);
  }

  public getLogsByAction(action: string, limit?: number): AuditLogEntry[] {
    return this.getLogs({ action }, limit);
  }

  public getLogsBySeverity(
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    limit?: number,
  ): AuditLogEntry[] {
    return this.getLogs({ severity }, limit);
  }

  public getRecentLogs(limit: number = 100): AuditLogEntry[] {
    return this.getLogs({}, limit);
  }

  public exportLogs(format: "json" | "csv" = "json"): string {
    const logs = this.getAllLogs();

    if (format === "csv") {
      const headers = [
        "ID",
        "Timestamp",
        "User",
        "User Role",
        "Action",
        "Entity",
        "Entity ID",
        "Details",
        "Severity",
        "IP Address",
        "User Agent",
      ];

      const csvLines = [
        headers.join(","),
        ...logs.map((log) =>
          [
            log.id,
            log.timestamp,
            `"${log.user}"`,
            `"${log.userRole}"`,
            `"${log.action}"`,
            `"${log.entity}"`,
            log.entityId || "",
            `"${log.details.replace(/"/g, '""')}"`,
            log.severity,
            log.ipAddress || "",
            `"${(log.userAgent || "").replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ];

      return csvLines.join("\n");
    }

    return JSON.stringify(logs, null, 2);
  }

  public clearAllLogs(): void {
    persistentStorage.removeItem(this.AUDIT_LOGS_KEY);
    console.log("🗑️ All audit logs cleared");
  }

  public getLogStats(): {
    totalLogs: number;
    logsBySeverity: Record<string, number>;
    logsByUser: Record<string, number>;
    logsByAction: Record<string, number>;
    oldestLog?: string;
    newestLog?: string;
  } {
    const logs = this.getAllLogs();

    const stats = {
      totalLogs: logs.length,
      logsBySeverity: {} as Record<string, number>,
      logsByUser: {} as Record<string, number>,
      logsByAction: {} as Record<string, number>,
      oldestLog: undefined as string | undefined,
      newestLog: undefined as string | undefined,
    };

    if (logs.length > 0) {
      stats.newestLog = logs[0].timestamp;
      stats.oldestLog = logs[logs.length - 1].timestamp;

      logs.forEach((log) => {
        // Count by severity
        stats.logsBySeverity[log.severity] =
          (stats.logsBySeverity[log.severity] || 0) + 1;

        // Count by user
        stats.logsByUser[log.user] = (stats.logsByUser[log.user] || 0) + 1;

        // Count by action
        stats.logsByAction[log.action] =
          (stats.logsByAction[log.action] || 0) + 1;
      });
    }

    return stats;
  }

  // Initialize with some sample data if no logs exist
  public initializeSampleData(): void {
    const existingLogs = this.getAllLogs();
    if (existingLogs.length === 0) {
      const sampleLogs: Omit<AuditLogEntry, "id" | "timestamp">[] = [
        {
          user: "SuperUser",
          userRole: "super_admin",
          action: "COMPANY_APPROVED",
          entity: "TechSolutions Nigeria",
          entityId: "comp-001",
          details: "Company registration approved after document verification",
          severity: "MEDIUM",
          metadata: {
            documentType: "CAC Certificate",
            verificationResult: "PASSED",
          },
        },
        {
          user: "AdminUser",
          userRole: "admin",
          action: "DOCUMENT_UPLOADED",
          entity: "Northern Construction Ltd",
          entityId: "comp-002",
          details: "New tax clearance certificate uploaded",
          severity: "LOW",
          metadata: { documentType: "Tax Clearance", fileSize: "2.3MB" },
        },
        {
          user: "SuperUser",
          userRole: "super_admin",
          action: "TENDER_CREATED",
          entity: "Hospital Equipment Supply",
          entityId: "KS-2024-015",
          details: "New tender published: Hospital Equipment Supply",
          severity: "MEDIUM",
          metadata: { estimatedValue: "₦850M", category: "Healthcare" },
        },
        {
          user: "EvaluationCommittee",
          userRole: "evaluator",
          action: "BID_EVALUATED",
          entity: "Road Construction Project",
          entityId: "KS-2024-002",
          details: "Bid evaluation completed for Northern Construction Ltd",
          severity: "MEDIUM",
          metadata: {
            bidAmount: "₦2.3B",
            technicalScore: 85,
            financialScore: 90,
          },
        },
        {
          user: "SystemAdmin",
          userRole: "system_admin",
          action: "SYSTEM_LOGIN",
          entity: "SuperUser Dashboard",
          details: "SuperUser logged into the system",
          severity: "LOW",
          metadata: { loginMethod: "credentials", sessionId: "sess_12345" },
        },
        {
          user: "SuperUser",
          userRole: "super_admin",
          action: "COMPANY_SUSPENDED",
          entity: "Omega Engineering Services",
          entityId: "comp-003",
          details: "Company suspended due to expired compliance documents",
          severity: "HIGH",
          metadata: {
            suspensionReason: "Expired documents",
            documentsAffected: ["Tax Clearance"],
          },
        },
        {
          user: "SuperUser",
          userRole: "super_admin",
          action: "NOC_APPROVED",
          entity: "ICT Infrastructure Upgrade",
          entityId: "KS-2024-003",
          details: "No Objection Certificate approved for contract award",
          severity: "HIGH",
          metadata: {
            contractValue: "₦1.1B",
            awardedTo: "TechSolutions Nigeria",
          },
        },
      ];

      sampleLogs.forEach((log) => this.addLog(log));
      console.log("🔍 Initialized audit logs with sample data");
    }
  }
}

// Create and export singleton instance
export const auditLogStorage = new AuditLogStorage();

// Utility functions for common operations
export const logUserAction = (
  user: string,
  userRole: string,
  action: string,
  entity: string,
  details: string,
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW",
  entityId?: string,
  metadata?: Record<string, any>,
): string => {
  return auditLogStorage.addLog({
    user,
    userRole,
    action,
    entity,
    entityId,
    details,
    severity,
    metadata,
  });
};

export const logSystemAction = (
  action: string,
  entity: string,
  details: string,
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW",
  metadata?: Record<string, any>,
): string => {
  return logUserAction(
    "SYSTEM",
    "system",
    action,
    entity,
    details,
    severity,
    undefined,
    metadata,
  );
};

export const logSecurityEvent = (
  user: string,
  action: string,
  details: string,
  metadata?: Record<string, any>,
): string => {
  return logUserAction(
    user,
    "security",
    action,
    "Security Event",
    details,
    "CRITICAL",
    undefined,
    metadata,
  );
};
