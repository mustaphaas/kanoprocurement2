import { debugSpecificTender } from "./tenderDebugHelper";
import "./fixTenderSettings";

// Auto-run debug when this module loads
console.log("🔍 Running tender status debug for user issue...");
debugSpecificTender();

// Instructions for user
console.log(`
📋 DEBUGGING INSTRUCTIONS:
1. Open browser console (F12)
2. Run: debugSpecificTender()
3. Check if "Days until deadline" shows 1 (for tomorrow)
4. Check if "Automatic status would be" shows "Closing Soon" 
5. If it shows "Closed", there's a bug in the date logic

🔧 To check localStorage tenders:
1. Run: localStorage.getItem('recentTenders')
2. Look for tender with "Supply of Analgesic" 
3. Check its exact closingDate format

📅 Expected for deadline 8/27/2025:
- Days until: 1
- Status: "Closing Soon" (not "Closed")
`);
