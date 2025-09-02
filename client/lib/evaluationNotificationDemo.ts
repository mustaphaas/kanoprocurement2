// Demo script to test the evaluation notification system
// Run this in the browser console to test the notification flow

import { evaluationNotificationService } from './evaluationNotificationService';
import { messageService } from './messageService';

// Demo data setup
const setupDemoData = () => {
  console.log("🔧 Setting up demo data for evaluation notifications...");
  
  // Create demo tender bids
  const demoBids = [
    {
      id: "BID-DEMO-001",
      tenderId: "MOH-2024-001", 
      companyName: "MedTech Solutions Ltd",
      companyEmail: "info@medtech.com",
      bidAmount: "₦850,000,000",
      submissionDate: "2024-02-10T09:30:00Z"
    },
    {
      id: "BID-DEMO-002", 
      tenderId: "MOH-2024-001",
      companyName: "HealthCare Innovations",
      companyEmail: "admin@healthcare-innovations.ng",
      bidAmount: "₦875,000,000", 
      submissionDate: "2024-02-09T14:20:00Z"
    },
    {
      id: "BID-DEMO-003",
      tenderId: "MOH-2024-001",
      companyName: "Northern Medical Supplies",
      companyEmail: "contact@northernmed.com",
      bidAmount: "₦820,000,000",
      submissionDate: "2024-02-08T16:45:00Z"
    }
  ];

  // Save demo bids to localStorage
  const existingBids = JSON.parse(localStorage.getItem("tenderBids") || "[]");
  const mergedBids = [...existingBids, ...demoBids];
  localStorage.setItem("tenderBids", JSON.stringify(mergedBids));
  
  console.log(`✅ Added ${demoBids.length} demo bids for tender MOH-2024-001`);
  return demoBids;
};

// Test evaluation commencement notification
const testEvaluationCommencing = () => {
  console.log("📢 Testing evaluation commencement notifications...");
  
  const demoAssignment = {
    id: "TCA-DEMO-001",
    tenderId: "MOH-2024-001",
    tenderTitle: "Medical Equipment Procurement for State Hospitals",
    tenderCategory: "Healthcare",
    ministry: "Ministry of Health"
  };

  evaluationNotificationService.notifyEvaluationCommencing(demoAssignment);
  console.log("✅ Evaluation commencement notifications sent!");
};

// Test evaluation completion notification
const testEvaluationCompleted = () => {
  console.log("🎉 Testing evaluation completion notifications...");
  
  const demoAssignment = {
    id: "TCA-DEMO-001", 
    tenderId: "MOH-2024-001",
    tenderTitle: "Medical Equipment Procurement for State Hospitals",
    tenderCategory: "Healthcare",
    ministry: "Ministry of Health"
  };

  evaluationNotificationService.notifyEvaluationCompleted(
    demoAssignment,
    "MedTech Solutions Ltd" // Winning bidder
  );
  console.log("✅ Evaluation completion notifications sent!");
};

// Check messages for a specific company
const checkCompanyMessages = (companyEmail: string) => {
  console.log(`📋 Checking messages for ${companyEmail}:`);
  const messages = messageService.getMessages(companyEmail);
  console.log(`Found ${messages.length} messages:`);
  
  messages.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.category.toUpperCase()}] ${msg.title}`);
    console.log(`   Type: ${msg.type}`);
    console.log(`   Message: ${msg.message.substring(0, 100)}...`);
    console.log(`   Read: ${msg.read}`);
    console.log(`   Date: ${new Date(msg.timestamp).toLocaleString()}`);
    console.log("");
  });
  
  return messages;
};

// Complete demo workflow
export const runEvaluationNotificationDemo = () => {
  console.log("🚀 Starting evaluation notification demo workflow...\n");
  
  // Step 1: Setup demo data
  const demoBids = setupDemoData();
  
  // Step 2: Test tender assignment activation (evaluation commencement)
  console.log("\n📋 STEP 1: Tender Assignment Activated");
  testEvaluationCommencing();
  
  // Step 3: Check messages after activation
  console.log("\n📬 Messages after evaluation commencement:");
  demoBids.forEach(bid => {
    console.log(`\n--- ${bid.companyName} ---`);
    checkCompanyMessages(bid.companyEmail);
  });
  
  // Step 4: Test chairman approval (evaluation completion)  
  console.log("\n🏆 STEP 2: Chairman Approves Evaluation");
  testEvaluationCompleted();
  
  // Step 5: Check messages after completion
  console.log("\n📬 Messages after evaluation completion:");
  demoBids.forEach(bid => {
    console.log(`\n--- ${bid.companyName} ---`);
    const messages = checkCompanyMessages(bid.companyEmail);
    const completionMessage = messages.find(m => m.title === "Tender Evaluation Completed");
    if (completionMessage && completionMessage.metadata?.isWinningBid) {
      console.log("🎉 THIS COMPANY WON THE TENDER!");
    }
  });
  
  console.log("\n✅ Demo completed! Check the Messages section in Company Dashboard to see the notifications.");
  console.log("\n🔧 Available debug commands:");
  console.log("- window.debugTenderBids() - Debug tender bids and assignments");
  console.log("- window.debugTenderBids('MOH-2024-001') - Debug specific tender");
};

// Make available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runEvaluationNotificationDemo = runEvaluationNotificationDemo;
  (window as any).checkCompanyMessages = checkCompanyMessages;
  (window as any).testEvaluationCommencing = testEvaluationCommencing;
  (window as any).testEvaluationCompleted = testEvaluationCompleted;
  (window as any).setupDemoData = setupDemoData;
}

export { 
  setupDemoData,
  testEvaluationCommencing, 
  testEvaluationCompleted,
  checkCompanyMessages
};
