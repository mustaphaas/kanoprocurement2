import { v4 as uuidv4 } from 'uuid';

// Audit Log Types
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: 'admin' | 'superuser' | 'company';
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata: AuditMetadata;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  errorMessage?: string;
  hash: string;
  previousHash?: string;
  signature: string;
  geolocation?: {
    country: string;
    region: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export type AuditAction =
  // Authentication & Session
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTRATION'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'SESSION_TIMEOUT'
  | 'MULTI_FACTOR_AUTH'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  
  // Company Management
  | 'COMPANY_APPROVED'
  | 'COMPANY_SUSPENDED'
  | 'COMPANY_BLACKLISTED'
  | 'COMPANY_PROFILE_UPDATE'
  | 'COMPANY_DOCUMENT_UPLOAD'
  | 'COMPANY_DOCUMENT_VERIFICATION'
  | 'COMPANY_STATUS_CHANGE'
  
  // Tender Process
  | 'TENDER_CREATED'
  | 'TENDER_PUBLISHED'
  | 'TENDER_UPDATED'
  | 'TENDER_CANCELLED'
  | 'TENDER_EXTENDED'
  | 'TENDER_VIEWED'
  | 'TENDER_DOWNLOADED'
  
  // Bidding Process
  | 'BID_INTEREST_EXPRESSED'
  | 'BID_SUBMITTED'
  | 'BID_WITHDRAWN'
  | 'BID_MODIFIED'
  | 'BID_OPENED'
  | 'BID_EVALUATED'
  | 'BID_AWARDED'
  | 'BID_REJECTED'
  
  // Document Management
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_DELETED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_EXPIRED'
  
  // Financial Operations
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_COMPLETED'
  | 'PAYMENT_FAILED'
  | 'REFUND_PROCESSED'
  | 'BANK_GUARANTEE_UPLOADED'
  | 'PERFORMANCE_BOND_VERIFIED'
  
  // Evaluation & Award
  | 'EVALUATION_STARTED'
  | 'EVALUATION_COMPLETED'
  | 'EVALUATION_COMMITTEE_ASSIGNED'
  | 'TECHNICAL_SCORE_ASSIGNED'
  | 'FINANCIAL_SCORE_ASSIGNED'
  | 'AWARD_DECISION_MADE'
  | 'CONTRACT_GENERATED'
  
  // Communication
  | 'MESSAGE_SENT'
  | 'MESSAGE_RECEIVED'
  | 'CLARIFICATION_REQUESTED'
  | 'CLARIFICATION_RESPONDED'
  | 'NOTIFICATION_SENT'
  | 'EMAIL_SENT'
  
  // System Security
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'PERMISSION_DENIED'
  | 'DATA_EXPORT'
  | 'DATA_IMPORT'
  | 'BACKUP_CREATED'
  | 'SYSTEM_CONFIGURATION_CHANGED'
  | 'SECURITY_ALERT'
  | 'AUDIT_LOG_ACCESSED'
  | 'FRAUD_DETECTION_TRIGGERED'
  
  // Contract Management
  | 'CONTRACT_SIGNED'
  | 'CONTRACT_AMENDED'
  | 'MILESTONE_UPDATED'
  | 'DELIVERY_CONFIRMED'
  | 'QUALITY_INSPECTION'
  | 'PAYMENT_MILESTONE_REACHED'
  | 'CONTRACT_COMPLETED'
  | 'CONTRACT_TERMINATED';

export interface AuditMetadata {
  requestId: string;
  correlationId: string;
  sourceModule: string;
  browserFingerprint: string;
  screenResolution: string;
  timezone: string;
  language: string;
  referrer?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  operatingSystem: string;
  riskScore: number; // 0-100
  additionalContext?: Record<string, any>;
}

// Immutable Audit Log Manager
class AuditLogManager {
  private static instance: AuditLogManager;
  private logs: AuditLogEntry[] = [];
  private lastHash: string = '';
  private secretKey: string;

  private constructor() {
    this.secretKey = this.generateSecretKey();
    this.initializeAuditSystem();
  }

  public static getInstance(): AuditLogManager {
    if (!AuditLogManager.instance) {
      AuditLogManager.instance = new AuditLogManager();
    }
    return AuditLogManager.instance;
  }

  private generateSecretKey(): string {
    // In production, this should be from environment variables
    return process.env.AUDIT_SECRET_KEY || 'kanoproc-audit-secret-2024';
  }

  private async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async generateSignature(entry: Omit<AuditLogEntry, 'hash' | 'signature'>): Promise<string> {
    const dataToSign = JSON.stringify(entry) + this.secretKey;
    return await this.generateHash(dataToSign);
  }

  private async generateEntryHash(entry: Omit<AuditLogEntry, 'hash'>): Promise<string> {
    const dataToHash = JSON.stringify(entry) + this.lastHash;
    return await this.generateHash(dataToHash);
  }

  private initializeAuditSystem(): void {
    // Initialize with system start entry
    this.logActivity({
      action: 'SYSTEM_CONFIGURATION_CHANGED',
      resource: 'AUDIT_SYSTEM',
      userId: 'SYSTEM',
      userEmail: 'system@kanoproc.gov.ng',
      userRole: 'admin',
      metadata: {
        sourceModule: 'AuditLogManager',
        additionalContext: {
          message: 'Audit logging system initialized',
          version: '2.0.0'
        }
      },
      severity: 'HIGH'
    });
  }

  public async logActivity(params: {
    action: AuditAction;
    resource: string;
    resourceId?: string;
    userId: string;
    userEmail: string;
    userRole: 'admin' | 'superuser' | 'company';
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Partial<AuditMetadata>;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    errorMessage?: string;
  }): Promise<string> {
    
    const now = new Date();
    const sessionId = this.getSessionId();
    const browserInfo = this.getBrowserInfo();
    
    const entry: Omit<AuditLogEntry, 'hash' | 'signature'> = {
      id: uuidv4(),
      timestamp: now.toISOString(),
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      sessionId,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      oldValues: params.oldValues,
      newValues: params.newValues,
      metadata: {
        requestId: uuidv4(),
        correlationId: this.getCorrelationId(),
        sourceModule: params.metadata?.sourceModule || 'Unknown',
        browserFingerprint: await this.generateBrowserFingerprint(),
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        referrer: document.referrer,
        deviceType: this.getDeviceType(),
        operatingSystem: this.getOperatingSystem(),
        riskScore: this.calculateRiskScore(params.action, params.userRole),
        additionalContext: params.metadata?.additionalContext,
        ...params.metadata
      },
      severity: params.severity || this.determineSeverity(params.action),
      status: params.status || 'SUCCESS',
      errorMessage: params.errorMessage,
      previousHash: this.lastHash,
      geolocation: await this.getGeolocation()
    };

    // Generate cryptographic signature and hash
    const signature = await this.generateSignature(entry);
    const hash = await this.generateEntryHash({ ...entry, signature });

    const finalEntry: AuditLogEntry = {
      ...entry,
      signature,
      hash
    };

    // Store immutably (in production, this would go to a write-only database)
    this.logs.push(Object.freeze(finalEntry));
    this.lastHash = hash;

    // Send to secure storage (simulated)
    await this.persistToSecureStorage(finalEntry);
    
    // Real-time security monitoring
    this.performSecurityAnalysis(finalEntry);

    return finalEntry.id;
  }

  private async persistToSecureStorage(entry: AuditLogEntry): Promise<void> {
    // In production, this would send to:
    // 1. Blockchain or distributed ledger
    // 2. Write-only database with encryption
    // 3. SIEM system for real-time monitoring
    // 4. Government audit systems
    
    console.log('🔒 Audit Log Persisted:', {
      id: entry.id,
      action: entry.action,
      timestamp: entry.timestamp,
      hash: entry.hash.substring(0, 16) + '...'
    });
  }

  private performSecurityAnalysis(entry: AuditLogEntry): void {
    // Real-time fraud detection
    if (entry.metadata.riskScore > 80) {
      this.triggerSecurityAlert(entry);
    }

    // Anomaly detection
    if (this.detectAnomalousActivity(entry)) {
      this.logActivity({
        action: 'FRAUD_DETECTION_TRIGGERED',
        resource: 'SECURITY_SYSTEM',
        userId: 'SYSTEM',
        userEmail: 'security@kanoproc.gov.ng',
        userRole: 'admin',
        metadata: {
          sourceModule: 'SecurityAnalyzer',
          additionalContext: {
            triggeredBy: entry.id,
            reason: 'Anomalous activity pattern detected'
          }
        },
        severity: 'CRITICAL'
      });
    }
  }

  private detectAnomalousActivity(entry: AuditLogEntry): boolean {
    // Check for suspicious patterns
    const recentLogs = this.logs.slice(-10);
    
    // Multiple failed login attempts
    if (entry.action === 'USER_LOGIN' && entry.status === 'FAILURE') {
      const failedAttempts = recentLogs.filter(log => 
        log.action === 'USER_LOGIN' && 
        log.status === 'FAILURE' && 
        log.userId === entry.userId
      ).length;
      
      if (failedAttempts >= 3) return true;
    }

    // Rapid successive actions
    const timeWindow = 30000; // 30 seconds
    const rapidActions = recentLogs.filter(log =>
      new Date(entry.timestamp).getTime() - new Date(log.timestamp).getTime() < timeWindow &&
      log.userId === entry.userId
    ).length;

    if (rapidActions > 20) return true;

    return false;
  }

  private triggerSecurityAlert(entry: AuditLogEntry): void {
    // In production, this would:
    // 1. Send alerts to security team
    // 2. Trigger automated responses
    // 3. Update risk scores
    // 4. Potentially lock accounts
    
    console.warn('🚨 SECURITY ALERT:', {
      userId: entry.userId,
      action: entry.action,
      riskScore: entry.metadata.riskScore,
      timestamp: entry.timestamp
    });
  }

  public async verifyLogIntegrity(): Promise<boolean> {
    let previousHash = '';
    
    for (const entry of this.logs) {
      // Verify hash chain
      const expectedHash = await this.generateEntryHash({
        ...entry,
        previousHash: previousHash,
        hash: undefined as any
      });
      
      if (entry.hash !== expectedHash) {
        console.error('🔴 AUDIT LOG INTEGRITY VIOLATION:', entry.id);
        return false;
      }

      // Verify signature
      const { hash, signature, ...entryWithoutHashAndSignature } = entry;
      const expectedSignature = await this.generateSignature(entryWithoutHashAndSignature);
      
      if (entry.signature !== expectedSignature) {
        console.error('🔴 AUDIT LOG SIGNATURE INVALID:', entry.id);
        return false;
      }

      previousHash = entry.hash;
    }

    return true;
  }

  public getLogs(params?: {
    userId?: string;
    action?: AuditAction;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): ReadonlyArray<AuditLogEntry> {
    let filteredLogs = [...this.logs];

    if (params?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === params.userId);
    }

    if (params?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === params.action);
    }

    if (params?.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === params.severity);
    }

    if (params?.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= params.startDate!
      );
    }

    if (params?.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= params.endDate!
      );
    }

    if (params?.limit) {
      filteredLogs = filteredLogs.slice(-params.limit);
    }

    return Object.freeze(filteredLogs);
  }

  // Helper methods
  private getSessionId(): string {
    return sessionStorage.getItem('sessionId') || uuidv4();
  }

  private getCorrelationId(): string {
    return sessionStorage.getItem('correlationId') || uuidv4();
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, this would be determined by the server
      return '127.0.0.1'; // Placeholder
    } catch {
      return 'unknown';
    }
  }

  private async generateBrowserFingerprint(): Promise<string> {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency,
      navigator.deviceMemory || 'unknown'
    ].join('|');

    return await this.generateHash(fingerprint);
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|phone/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getOperatingSystem(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private calculateRiskScore(action: AuditAction, userRole: string): number {
    let baseScore = 0;

    // High-risk actions
    const highRiskActions: AuditAction[] = [
      'COMPANY_BLACKLISTED', 'BID_AWARDED', 'CONTRACT_SIGNED',
      'PAYMENT_COMPLETED', 'SYSTEM_CONFIGURATION_CHANGED',
      'UNAUTHORIZED_ACCESS_ATTEMPT', 'DATA_EXPORT'
    ];

    if (highRiskActions.includes(action)) baseScore += 40;

    // Medium-risk actions
    const mediumRiskActions: AuditAction[] = [
      'COMPANY_APPROVED', 'BID_SUBMITTED', 'DOCUMENT_UPLOADED',
      'EVALUATION_COMPLETED', 'PASSWORD_CHANGE'
    ];

    if (mediumRiskActions.includes(action)) baseScore += 20;

    // Role-based risk adjustment
    if (userRole === 'admin' || userRole === 'superuser') baseScore += 20;

    // Time-based risk (higher risk during off-hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) baseScore += 15;

    return Math.min(baseScore, 100);
  }

  private determineSeverity(action: AuditAction): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalActions: AuditAction[] = [
      'UNAUTHORIZED_ACCESS_ATTEMPT', 'FRAUD_DETECTION_TRIGGERED',
      'SYSTEM_CONFIGURATION_CHANGED', 'AUDIT_LOG_ACCESSED'
    ];

    const highActions: AuditAction[] = [
      'COMPANY_BLACKLISTED', 'BID_AWARDED', 'CONTRACT_SIGNED',
      'PAYMENT_COMPLETED', 'DATA_EXPORT', 'ACCOUNT_LOCKED'
    ];

    const mediumActions: AuditAction[] = [
      'COMPANY_APPROVED', 'BID_SUBMITTED', 'DOCUMENT_UPLOADED',
      'USER_LOGIN', 'PASSWORD_CHANGE'
    ];

    if (criticalActions.includes(action)) return 'CRITICAL';
    if (highActions.includes(action)) return 'HIGH';
    if (mediumActions.includes(action)) return 'MEDIUM';
    return 'LOW';
  }

  private getBrowserInfo(): any {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  private async getGeolocation(): Promise<any> {
    try {
      // In production, this would use IP geolocation service
      return {
        country: 'Nigeria',
        region: 'Kano State',
        city: 'Kano'
      };
    } catch {
      return undefined;
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogManager.getInstance();

// Convenience functions for common actions
export const logUserAction = async (params: {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Partial<AuditMetadata>;
}) => {
  // Get current user from context (in production)
  const currentUser = {
    id: 'current-user-id',
    email: 'user@example.com',
    role: 'company' as const
  };

  return await auditLogger.logActivity({
    ...params,
    userId: currentUser.id,
    userEmail: currentUser.email,
    userRole: currentUser.role
  });
};

export const logSecurityEvent = async (
  action: AuditAction,
  details: string,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH'
) => {
  return await auditLogger.logActivity({
    action,
    resource: 'SECURITY_SYSTEM',
    userId: 'SYSTEM',
    userEmail: 'security@kanoproc.gov.ng',
    userRole: 'admin',
    severity,
    metadata: {
      sourceModule: 'SecuritySystem',
      additionalContext: { details }
    }
  });
};
