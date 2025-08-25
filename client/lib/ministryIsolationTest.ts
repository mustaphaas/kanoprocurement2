/**
 * Ministry Isolation Test Utility
 * Helps verify that data is properly isolated between ministries
 */

import { getCurrentMinistryContext, readMinistryData, writeMinistryData } from './ministryStorageHelper';

interface IsolationTestResult {
  ministry: string;
  testName: string;
  passed: boolean;
  details: string;
  data?: any;
}

/**
 * Test committee template isolation
 */
export const testCommitteeTemplateIsolation = (): IsolationTestResult[] => {
  const results: IsolationTestResult[] = [];
  const { ministryCode, ministryName } = getCurrentMinistryContext();

  try {
    // Test 1: Check current ministry has its own templates
    const currentTemplates = readMinistryData('committeeTemplates', []);
    results.push({
      ministry: ministryCode,
      testName: 'Current Ministry Templates',
      passed: true,
      details: `Found ${currentTemplates.length} committee templates for ${ministryName}`,
      data: { count: currentTemplates.length, templates: currentTemplates }
    });

    // Test 2: Check other ministries don't contaminate
    const otherMinistries = ['MOH', 'MOWI', 'MOE'].filter(code => code !== ministryCode);
    
    otherMinistries.forEach(otherCode => {
      const otherTemplates = readMinistryData('committeeTemplates', [], otherCode);
      const hasContamination = currentTemplates.some((template: any) => 
        otherTemplates.some((other: any) => other.id === template.id)
      );

      results.push({
        ministry: otherCode,
        testName: 'Cross-Ministry Contamination Check',
        passed: !hasContamination,
        details: hasContamination 
          ? `❌ Found contamination: templates from ${otherCode} appear in ${ministryCode}`
          : `✅ No contamination: ${otherCode} templates properly isolated`,
        data: { otherTemplatesCount: otherTemplates.length }
      });
    });

  } catch (error) {
    results.push({
      ministry: ministryCode,
      testName: 'Committee Template Test',
      passed: false,
      details: `Error testing templates: ${error}`,
    });
  }

  return results;
};

/**
 * Test tender isolation
 */
export const testTenderIsolation = (): IsolationTestResult[] => {
  const results: IsolationTestResult[] = [];
  const { ministryCode, ministryName } = getCurrentMinistryContext();

  try {
    // Test current ministry tenders
    const currentTenders = readMinistryData('tenders', []);
    const currentRecentTenders = readMinistryData('recentTenders', []);
    const currentFeaturedTenders = readMinistryData('featuredTenders', []);

    results.push({
      ministry: ministryCode,
      testName: 'Current Ministry Tenders',
      passed: true,
      details: `Found tenders for ${ministryName}: ${currentTenders.length} main, ${currentRecentTenders.length} recent, ${currentFeaturedTenders.length} featured`,
      data: { 
        tenders: currentTenders.length,
        recent: currentRecentTenders.length, 
        featured: currentFeaturedTenders.length
      }
    });

    // Check tenders belong to current ministry
    const invalidTenders = currentTenders.filter((tender: any) => {
      const hasValidId = tender.id && tender.id.startsWith(ministryCode);
      const hasValidMinistry = tender.ministry && tender.ministry.includes(ministryName || '');
      return !hasValidId && !hasValidMinistry;
    });

    results.push({
      ministry: ministryCode,
      testName: 'Tender Ownership Validation',
      passed: invalidTenders.length === 0,
      details: invalidTenders.length === 0
        ? `✅ All tenders properly belong to ${ministryName}`
        : `❌ Found ${invalidTenders.length} tenders that don't belong to ${ministryName}`,
      data: { invalidTenders }
    });

  } catch (error) {
    results.push({
      ministry: ministryCode,
      testName: 'Tender Isolation Test',
      passed: false,
      details: `Error testing tenders: ${error}`,
    });
  }

  return results;
};

/**
 * Test mock data isolation
 */
export const testMockDataIsolation = (): IsolationTestResult[] => {
  const results: IsolationTestResult[] = [];
  const { ministryCode, ministryName } = getCurrentMinistryContext();

  const mockKeys = [
    'mockProcurementPlan',
    'mockTender', 
    'mockNOCRequest',
    'mockContract',
    'mockUsers'
  ];

  mockKeys.forEach(key => {
    try {
      const mockData = readMinistryData(key, null);
      const hasData = mockData !== null;

      results.push({
        ministry: ministryCode,
        testName: `Mock Data: ${key}`,
        passed: true,
        details: hasData 
          ? `✅ ${ministryName} has mock ${key} data`
          : `ℹ️ ${ministryName} has no mock ${key} data`,
        data: { hasData, data: mockData }
      });

    } catch (error) {
      results.push({
        ministry: ministryCode,
        testName: `Mock Data: ${key}`,
        passed: false,
        details: `Error checking mock ${key}: ${error}`,
      });
    }
  });

  return results;
};

/**
 * Test for global key contamination
 */
export const testGlobalKeyContamination = (): IsolationTestResult[] => {
  const results: IsolationTestResult[] = [];
  const { ministryCode } = getCurrentMinistryContext();

  const problematicGlobalKeys = [
    'ministryTenders',
    'recentTenders',
    'featuredTenders',
    'mockProcurementPlan',
    'mockTender',
    'mockNOCRequest', 
    'mockContract',
    'mockUsers'
  ];

  problematicGlobalKeys.forEach(key => {
    const hasGlobalData = localStorage.getItem(key) !== null;
    
    results.push({
      ministry: ministryCode,
      testName: `Global Key Check: ${key}`,
      passed: !hasGlobalData,
      details: hasGlobalData
        ? `❌ Global key '${key}' still exists - potential contamination source`
        : `✅ Global key '${key}' properly cleaned up`,
      data: { hasGlobalData }
    });
  });

  return results;
};

/**
 * Run comprehensive isolation test
 */
export const runIsolationTest = (): {
  ministry: string;
  ministryName: string;
  results: IsolationTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    score: string;
  };
} => {
  const { ministryCode, ministryName } = getCurrentMinistryContext();
  
  console.log(`🧪 Running ministry isolation test for ${ministryName} (${ministryCode})`);

  const allResults = [
    ...testCommitteeTemplateIsolation(),
    ...testTenderIsolation(),
    ...testMockDataIsolation(),
    ...testGlobalKeyContamination()
  ];

  const total = allResults.length;
  const passed = allResults.filter(r => r.passed).length;
  const failed = total - passed;
  const score = `${Math.round((passed / total) * 100)}%`;

  const summary = {
    total,
    passed,
    failed,
    score
  };

  console.log(`📊 Test Results: ${passed}/${total} passed (${score})`);
  
  if (failed > 0) {
    console.log('❌ Failed tests:');
    allResults.filter(r => !r.passed).forEach(result => {
      console.log(`  - ${result.testName}: ${result.details}`);
    });
  } else {
    console.log('✅ All isolation tests passed!');
  }

  return {
    ministry: ministryCode,
    ministryName: ministryName || 'Unknown',
    results: allResults,
    summary
  };
};

/**
 * Quick test function for console usage
 */
export const quickIsolationTest = (): void => {
  const result = runIsolationTest();
  console.table(result.results.map(r => ({
    Test: r.testName,
    Ministry: r.ministry,
    Status: r.passed ? '✅ PASS' : '❌ FAIL',
    Details: r.details
  })));
};
