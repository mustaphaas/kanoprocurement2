import { messageService } from "./messageService";

interface TenderAssignment {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderCategory: string;
  ministry?: string;
}

interface CompanyBid {
  id: string;
  tenderId: string;
  companyName: string;
  companyEmail: string;
  bidAmount: string;
  submissionDate: string;
}

class EvaluationNotificationService {
  private static instance: EvaluationNotificationService;

  private constructor() {}

  public static getInstance(): EvaluationNotificationService {
    if (!EvaluationNotificationService.instance) {
      EvaluationNotificationService.instance = new EvaluationNotificationService();
    }
    return EvaluationNotificationService.instance;
  }

  // Get all companies that have submitted bids for a tender
  private getCompaniesWithBids(tenderId: string): CompanyBid[] {
    try {
      const storedBids = localStorage.getItem("tenderBids");
      if (!storedBids) return [];

      const allBids = JSON.parse(storedBids);
      return allBids.filter((bid: any) => bid.tenderId === tenderId);
    } catch (error) {
      console.error("Error fetching bids for tender:", tenderId, error);
      return [];
    }
  }

  // Send evaluation commencement notification to all bidding companies
  public notifyEvaluationCommencing(assignment: TenderAssignment): void {
    const biddingCompanies = this.getCompaniesWithBids(assignment.tenderId);
    
    if (biddingCompanies.length === 0) {
      console.log(`No bidders found for tender ${assignment.tenderId}`);
      return;
    }

    console.log(`Notifying ${biddingCompanies.length} companies about evaluation commencement for tender ${assignment.tenderId}`);

    biddingCompanies.forEach((bid) => {
      try {
        messageService.addMessage(
          {
            type: "bid_evaluated",
            category: "info",
            title: "Tender Evaluation Commencing",
            message: `The evaluation process for tender "${assignment.tenderTitle}" has commenced. Your bid submitted on ${new Date(bid.submissionDate).toLocaleDateString()} is now being reviewed by the evaluation committee. You will be notified once the evaluation is complete.`,
            tenderId: assignment.tenderId,
            bidId: bid.id,
            read: false,
            actions: [
              {
                id: "view_tender",
                label: "View Tender Details",
                action: "view_tender",
                data: { tenderId: assignment.tenderId },
              },
              {
                id: "view_bid",
                label: "View Your Bid",
                action: "view_bid", 
                data: { bidId: bid.id, tenderId: assignment.tenderId },
              }
            ],
            metadata: {
              tenderTitle: assignment.tenderTitle,
              tenderCategory: assignment.tenderCategory,
              ministry: assignment.ministry || "Ministry",
              bidAmount: bid.bidAmount,
              evaluationStatus: "In Progress",
              companyName: bid.companyName,
            },
          },
          bid.companyEmail
        );

        console.log(`✅ Evaluation commencement notification sent to ${bid.companyName} (${bid.companyEmail})`);
      } catch (error) {
        console.error(`Failed to send evaluation commencement notification to ${bid.companyEmail}:`, error);
      }
    });
  }

  // Send evaluation completion notification to all bidding companies
  public notifyEvaluationCompleted(assignment: TenderAssignment, winningBidder?: string): void {
    const biddingCompanies = this.getCompaniesWithBids(assignment.tenderId);
    
    if (biddingCompanies.length === 0) {
      console.log(`No bidders found for tender ${assignment.tenderId}`);
      return;
    }

    console.log(`Notifying ${biddingCompanies.length} companies about evaluation completion for tender ${assignment.tenderId}`);

    biddingCompanies.forEach((bid) => {
      try {
        const isWinner = winningBidder === bid.companyName;
        
        messageService.addMessage(
          {
            type: "bid_evaluated",
            category: isWinner ? "success" : "info",
            title: "Tender Evaluation Completed",
            message: isWinner 
              ? `Congratulations! The evaluation for tender "${assignment.tenderTitle}" has been completed and your bid has been selected as the winning proposal. You will be contacted soon with the next steps for contract award.`
              : `The evaluation for tender "${assignment.tenderTitle}" has been completed. Your bid has been reviewed and the evaluation results are now finalized. Thank you for your participation in this tender process.`,
            tenderId: assignment.tenderId,
            bidId: bid.id,
            read: false,
            actions: [
              {
                id: "view_results",
                label: "View Results",
                action: "view_tender",
                data: { tenderId: assignment.tenderId },
              },
              ...(isWinner ? [{
                id: "contact_support",
                label: "Contact for Next Steps",
                action: "contact_support",
                data: { tenderId: assignment.tenderId, type: "winner_contact" },
              }] : [])
            ],
            metadata: {
              tenderTitle: assignment.tenderTitle,
              tenderCategory: assignment.tenderCategory,
              ministry: assignment.ministry || "Ministry",
              bidAmount: bid.bidAmount,
              evaluationStatus: "Completed",
              isWinningBid: isWinner,
              companyName: bid.companyName,
              evaluationDate: new Date().toISOString(),
            },
          },
          bid.companyEmail
        );

        console.log(`✅ Evaluation completion notification sent to ${bid.companyName} (${bid.companyEmail}) - ${isWinner ? 'WINNER' : 'PARTICIPANT'}`);
      } catch (error) {
        console.error(`Failed to send evaluation completion notification to ${bid.companyEmail}:`, error);
      }
    });
  }

  // Get ministry information for better notification context
  private getMinistryInfo(ministryCode?: string): { name: string; code: string } {
    const ministryMap: Record<string, string> = {
      "MOH": "Ministry of Health",
      "MOWI": "Ministry of Works and Infrastructure", 
      "MOE": "Ministry of Education",
    };

    if (ministryCode && ministryMap[ministryCode]) {
      return { name: ministryMap[ministryCode], code: ministryCode };
    }

    return { name: "Government Ministry", code: "GOV" };
  }

  // Get tender assignment details from localStorage
  public getTenderAssignmentDetails(tenderId: string): TenderAssignment | null {
    try {
      // Check all ministry-specific assignment stores
      const ministryStorageKeys = Object.keys(localStorage)
        .filter(key => key.endsWith("_tenderCommitteeAssignments"));

      for (const key of ministryStorageKeys) {
        const assignments = JSON.parse(localStorage.getItem(key) || "[]");
        const assignment = assignments.find((a: any) => a.tenderId === tenderId);
        
        if (assignment) {
          // Get ministry info from the storage key
          const ministryCode = key.split("_")[0];
          const ministryInfo = this.getMinistryInfo(ministryCode);
          
          return {
            id: assignment.id,
            tenderId: assignment.tenderId,
            tenderTitle: assignment.tenderTitle,
            tenderCategory: assignment.tenderCategory,
            ministry: ministryInfo.name,
          };
        }
      }
    } catch (error) {
      console.error("Error getting tender assignment details:", error);
    }
    
    return null;
  }

  // Debug function to check current bids and assignments
  public debugTenderBids(tenderId?: string): void {
    console.log("=== EVALUATION NOTIFICATION DEBUG ===");
    
    if (tenderId) {
      console.log(`Debugging for tender: ${tenderId}`);
      const bids = this.getCompaniesWithBids(tenderId);
      console.log(`Found ${bids.length} bids:`, bids);
      
      const assignment = this.getTenderAssignmentDetails(tenderId);
      console.log("Assignment details:", assignment);
    } else {
      console.log("All tender bids:");
      const allBids = localStorage.getItem("tenderBids");
      console.log(allBids ? JSON.parse(allBids) : "No bids found");
      
      console.log("\nAll assignments:");
      const assignmentKeys = Object.keys(localStorage)
        .filter(key => key.endsWith("_tenderCommitteeAssignments"));
      
      assignmentKeys.forEach(key => {
        const assignments = localStorage.getItem(key);
        console.log(`${key}:`, assignments ? JSON.parse(assignments) : "No assignments");
      });
    }
  }
}

export const evaluationNotificationService = EvaluationNotificationService.getInstance();

// Global debug functions
if (typeof window !== 'undefined') {
  (window as any).debugTenderBids = evaluationNotificationService.debugTenderBids.bind(evaluationNotificationService);
}
