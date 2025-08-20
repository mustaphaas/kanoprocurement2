import { auditLogStorage } from "./auditLogStorage";

/**
 * Utility to clear mock audit data and start fresh with real audit logs
 */
export const clearMockAuditData = (): boolean => {
  try {
    const logs = auditLogStorage.getLogs();
    
    // Check if we have mock data by looking for specific patterns
    const hasMockData = logs.some(log => 
      log.details.includes('TechSolutions Nigeria') || 
      log.details.includes('Northern Construction Ltd') ||
      log.details.includes('Omega Engineering Services') ||
      log.action === 'COMPANY_APPROVED' ||
      log.entity === 'Hospital Equipment Supply' ||
      log.user === 'EvaluationCommittee' ||
      log.user === 'AdminUser'
    );

    if (hasMockData) {
      console.log('🗑️ Found mock audit data, clearing it...');
      auditLogStorage.clearAllLogs();
      console.log('✅ Mock audit data cleared successfully');
      return true;
    } else {
      console.log('ℹ️ No mock data found, audit logs appear to be real');
      return false;
    }
  } catch (error) {
    console.error('❌ Error clearing mock audit data:', error);
    return false;
  }
};

/**
 * Get audit log statistics to help identify mock vs real data
 */
export const getAuditDataInfo = () => {
  const logs = auditLogStorage.getLogs();
  const stats = auditLogStorage.getLogStats();
  
  const mockDataIndicators = logs.filter(log => 
    log.details.includes('TechSolutions Nigeria') || 
    log.details.includes('Northern Construction Ltd') ||
    log.details.includes('Omega Engineering Services') ||
    log.user === 'EvaluationCommittee' ||
    log.user === 'AdminUser'
  );

  return {
    totalLogs: logs.length,
    mockDataCount: mockDataIndicators.length,
    realDataCount: logs.length - mockDataIndicators.length,
    hasMockData: mockDataIndicators.length > 0,
    stats
  };
};
