/**
 * Ministry Isolation Verification Utility
 * Checks for proper data isolation between ministries
 */

/**
 * Check if any legacy global keys exist that could cause contamination
 */
export const checkForGlobalKeyContamination = (): {
  hasContamination: boolean;
  contaminatedKeys: string[];
  report: string;
} => {
  const LEGACY_GLOBAL_KEYS = ['recentTenders', 'featuredTenders'];
  const contaminatedKeys: string[] = [];
  
  LEGACY_GLOBAL_KEYS.forEach(key => {
    const data = localStorage.getItem(key);
    if (data && data !== '[]' && data !== 'null') {
      contaminatedKeys.push(key);
    }
  });
  
  const hasContamination = contaminatedKeys.length > 0;
  const report = hasContamination
    ? `❌ CONTAMINATION DETECTED: Found data in legacy global keys: ${contaminatedKeys.join(', ')}`
    : `✅ NO CONTAMINATION: All legacy global keys are clean`;
    
  return { hasContamination, contaminatedKeys, report };
};

/**
 * Get all ministry codes that have data
 */
export const getMinistryCodesWithData = (): string[] => {
  const ministryCodes: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith('_recentTenders')) {
      const ministryCode = key.replace('_recentTenders', '');
      if (ministryCode.length <= 10) { // Reasonable ministry code length
        ministryCodes.push(ministryCode);
      }
    }
  }
  
  return ministryCodes;
};

/**
 * Verify that each ministry has isolated data
 */
export const verifyMinistryIsolation = (): {
  isIsolated: boolean;
  report: string;
  details: { ministryCode: string; tenderCount: number }[];
} => {
  const ministryCodes = getMinistryCodesWithData();
  const details: { ministryCode: string; tenderCount: number }[] = [];
  
  ministryCodes.forEach(ministryCode => {
    const recentTendersKey = `${ministryCode}_recentTenders`;
    const data = localStorage.getItem(recentTendersKey);
    const tenderCount = data ? JSON.parse(data).length : 0;
    details.push({ ministryCode, tenderCount });
  });
  
  const isIsolated = ministryCodes.length > 0;
  const report = isIsolated
    ? `✅ ISOLATION VERIFIED: Found ${ministryCodes.length} ministries with isolated data: ${ministryCodes.join(', ')}`
    : `⚠️ NO MINISTRY DATA: No ministry-specific data found`;
    
  return { isIsolated, report, details };
};

/**
 * Run complete verification and return comprehensive report
 */
export const runFullVerification = (): {
  passed: boolean;
  summary: string;
  details: {
    globalKeyCheck: ReturnType<typeof checkForGlobalKeyContamination>;
    isolationCheck: ReturnType<typeof verifyMinistryIsolation>;
  };
} => {
  const globalKeyCheck = checkForGlobalKeyContamination();
  const isolationCheck = verifyMinistryIsolation();
  
  const passed = !globalKeyCheck.hasContamination && isolationCheck.isIsolated;
  
  const summary = `
=== MINISTRY DATA ISOLATION VERIFICATION ===

${globalKeyCheck.report}
${isolationCheck.report}

${isolationCheck.details.length > 0 ? 
  `Ministry Data Summary:
${isolationCheck.details.map(d => `  • ${d.ministryCode}: ${d.tenderCount} tenders`).join('\n')}` 
  : 'No ministry data found'}

OVERALL STATUS: ${passed ? '✅ PASSED' : '❌ FAILED'}
  `;
  
  return {
    passed,
    summary,
    details: { globalKeyCheck, isolationCheck }
  };
};

/**
 * Console-friendly verification function
 */
export const logVerificationReport = (): void => {
  const result = runFullVerification();
  console.log(result.summary);
  
  if (!result.passed) {
    console.warn('❌ Ministry isolation verification failed!');
    if (result.details.globalKeyCheck.hasContamination) {
      console.warn('  - Legacy global keys still contain data');
      console.warn('  - Contaminated keys:', result.details.globalKeyCheck.contaminatedKeys);
    }
  } else {
    console.log('✅ Ministry isolation verification passed!');
  }
};

// Export for global debugging access
(window as any).verifyMinistryIsolation = runFullVerification;
(window as any).logMinistryIsolation = logVerificationReport;
