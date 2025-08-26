/**
 * Ministry Filtering Fix Verification
 * Run this to verify the property name fix is working
 */

/**
 * Quick verification function to check if the ministry property fix is working
 */
export const verifyMinistryPropertyFix = (): { 
  success: boolean; 
  message: string; 
  details: any;
} => {
  try {
    // Check current ministry user data
    const ministryUser = localStorage.getItem("ministryUser");
    if (!ministryUser) {
      return {
        success: false,
        message: "No ministry user found in localStorage",
        details: null
      };
    }

    const userData = JSON.parse(ministryUser);
    
    // Check if ministryName property exists (this was the missing property)
    const hasMinistryName = "ministryName" in userData;
    const hasMinistryCode = "ministryCode" in userData;
    
    if (!hasMinistryName) {
      return {
        success: false,
        message: "ministryName property still missing from ministry user data",
        details: { 
          availableProps: Object.keys(userData),
          userData: userData
        }
      };
    }

    if (!hasMinistryCode) {
      return {
        success: false,
        message: "ministryCode property still missing from ministry user data",
        details: { 
          availableProps: Object.keys(userData),
          userData: userData
        }
      };
    }

    // Check filtering logic
    const mainTenders = JSON.parse(localStorage.getItem("kanoproc_tenders") || "[]");
    const currentMinistryName = userData.ministryName;
    
    const ministryTenders = mainTenders.filter((tender: any) => 
      tender.ministry === currentMinistryName
    );

    const totalTenders = mainTenders.length;
    const filteredTenders = ministryTenders.length;

    return {
      success: true,
      message: `Ministry property fix verified successfully. Ministry: ${currentMinistryName}, Showing ${filteredTenders}/${totalTenders} tenders`,
      details: {
        ministryName: userData.ministryName,
        ministryCode: userData.ministryCode,
        totalTenders,
        filteredTenders,
        propertyCheck: {
          hasMinistryName,
          hasMinistryCode
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Error verifying ministry fix: ${error}`,
      details: { error }
    };
  }
};

/**
 * Console-friendly verification
 */
export const logVerificationResult = (): void => {
  const result = verifyMinistryPropertyFix();
  
  console.log("=== MINISTRY PROPERTY FIX VERIFICATION ===");
  console.log(result.success ? "✅ SUCCESS" : "❌ FAILED");
  console.log(result.message);
  
  if (result.details) {
    console.log("Details:", result.details);
  }
  
  console.log("=========================================");
};

// Export for browser console access
(window as any).verifyMinistryPropertyFix = verifyMinistryPropertyFix;
(window as any).logVerificationResult = logVerificationResult;
