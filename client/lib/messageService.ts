import { logUserAction } from "./auditLogStorage";

export interface CompanyMessage {
  id: string;
  type:
    | "bid_created"
    | "tender_closing_soon"
    | "tender_closed"
    | "eoi_confirmed"
    | "bid_confirmed"
    | "bid_evaluated"
    | "contract_awarded"
    | "general";
  category: "info" | "success" | "warning" | "error" | "urgent";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  tenderId?: string;
  bidId?: string;
  contractId?: string;
  actions?: MessageAction[];
  metadata?: Record<string, any>;
}

export interface MessageAction {
  id: string;
  label: string;
  action:
    | "view_tender"
    | "view_bid"
    | "download_document"
    | "contact_support"
    | "mark_read";
  url?: string;
  data?: Record<string, any>;
}

export interface TenderStatusUpdate {
  tenderId: string;
  tenderTitle: string;
  oldStatus: string;
  newStatus: string;
  deadline?: string;
  ministry?: string;
}

class MessageService {
  private static instance: MessageService;
  private storageKey = "company_messages";
  private listeners: ((messages: CompanyMessage[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  // Subscribe to message updates
  public subscribe(listener: (messages: CompanyMessage[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners of message updates
  private notifyListeners(): void {
    const messages = this.getMessages();
    this.listeners.forEach((listener) => listener(messages));
  }

  // Get all messages for current company
  public getMessages(companyEmail?: string): CompanyMessage[] {
    try {
      const emailRaw = companyEmail || this.getCurrentCompanyEmail();
      const email = emailRaw || "unknown@company.com";
      const key = `${this.storageKey}_${email}`;
      const lcKey = `${this.storageKey}_${email.toLowerCase()}`;
      const stored = localStorage.getItem(key) || localStorage.getItem(lcKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
    return [];
  }

  // Save messages for current company
  private saveMessages(
    messages: CompanyMessage[],
    companyEmail?: string,
  ): void {
    try {
      const email = companyEmail || this.getCurrentCompanyEmail();
      const key = `${this.storageKey}_${email}`;
      localStorage.setItem(key, JSON.stringify(messages));
      this.notifyListeners();
    } catch (error) {
      console.error("Error saving messages:", error);
    }
  }

  // Add a new message
  public addMessage(
    message: Omit<CompanyMessage, "id" | "timestamp">,
    companyEmail?: string,
  ): string {
    const newMessage: CompanyMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    const messages = this.getMessages(companyEmail);
    messages.unshift(newMessage); // Add to beginning for chronological order
    this.saveMessages(messages, companyEmail);

    // Log the message creation
    logUserAction(
      companyEmail || this.getCurrentCompanyEmail(),
      "company_user",
      "MESSAGE_RECEIVED",
      "Company Messages",
      `New ${message.type} message: ${message.title}`,
      message.category === "urgent" ? "HIGH" : "MEDIUM",
      message.tenderId || message.bidId,
      {
        messageId: newMessage.id,
        messageType: message.type,
        messageCategory: message.category,
        title: message.title,
        tenderId: message.tenderId,
        bidId: message.bidId,
      },
    );

    return newMessage.id;
  }

  // Mark message as read
  public markAsRead(messageId: string, companyEmail?: string): void {
    const messages = this.getMessages(companyEmail);
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex].read = true;
      this.saveMessages(messages, companyEmail);
    }
  }

  // Mark all messages as read
  public markAllAsRead(companyEmail?: string): void {
    const messages = this.getMessages(companyEmail);
    messages.forEach((message) => (message.read = true));
    this.saveMessages(messages, companyEmail);
  }

  // Get unread message count
  public getUnreadCount(companyEmail?: string): number {
    const messages = this.getMessages(companyEmail);
    return messages.filter((m) => !m.read).length;
  }

  // Delete a message
  public deleteMessage(messageId: string, companyEmail?: string): void {
    const messages = this.getMessages(companyEmail);
    const filteredMessages = messages.filter((m) => m.id !== messageId);
    this.saveMessages(filteredMessages, companyEmail);
  }

  // Helper to get current company email
  private getCurrentCompanyEmail(): string {
    // Try to get from auth context or user data
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.email?.toLowerCase() || "unknown@company.com";
      } catch (e) {
        console.error("Error parsing current user:", e);
      }
    }
    return "unknown@company.com";
  }

  // Create EOI confirmation message
  public createEOIConfirmationMessage(
    tenderData: {
      id: string;
      title: string;
      ministry: string;
      deadline: string;
      value: string;
    },
    companyEmail?: string,
  ): string {
    return this.addMessage(
      {
        type: "eoi_confirmed",
        category: "success",
        title: "Expression of Interest Confirmed",
        message: `Your expression of interest for "${tenderData.title}" has been successfully submitted to ${tenderData.ministry}. You can now proceed to submit your bid before the deadline on ${new Date(tenderData.deadline).toLocaleDateString()}.`,
        tenderId: tenderData.id,
        actions: [
          {
            id: "view_tender",
            label: "View Tender Details",
            action: "view_tender",
            data: { tenderId: tenderData.id },
          },
          {
            id: "submit_bid",
            label: "Submit Bid",
            action: "view_tender",
            data: { tenderId: tenderData.id, action: "submit_bid" },
          },
        ],
        metadata: {
          tenderTitle: tenderData.title,
          ministry: tenderData.ministry,
          deadline: tenderData.deadline,
          value: tenderData.value,
        },
      },
      companyEmail,
    );
  }

  // Create bid confirmation message
  public createBidConfirmationMessage(
    bidData: {
      id: string;
      tenderId: string;
      tenderTitle: string;
      bidAmount: string;
      ministry: string;
    },
    companyEmail?: string,
  ): string {
    return this.addMessage(
      {
        type: "bid_confirmed",
        category: "success",
        title: "Bid Successfully Submitted",
        message: `Your bid of ${bidData.bidAmount} for "${bidData.tenderTitle}" has been successfully submitted and is now under evaluation. You will be notified of the evaluation results.`,
        tenderId: bidData.tenderId,
        bidId: bidData.id,
        actions: [
          {
            id: "view_bid",
            label: "View Bid Details",
            action: "view_bid",
            data: { bidId: bidData.id, tenderId: bidData.tenderId },
          },
          {
            id: "track_status",
            label: "Track Evaluation Status",
            action: "view_tender",
            data: { tenderId: bidData.tenderId },
          },
        ],
        metadata: {
          tenderTitle: bidData.tenderTitle,
          bidAmount: bidData.bidAmount,
          ministry: bidData.ministry,
          submissionDate: new Date().toISOString(),
        },
      },
      companyEmail,
    );
  }

  // Create tender status update message
  public createTenderStatusUpdateMessage(
    update: TenderStatusUpdate,
    companyEmail?: string,
  ): string {
    let messageConfig: {
      category: "info" | "warning" | "urgent";
      title: string;
      message: string;
      actions: MessageAction[];
    };

    switch (update.newStatus.toLowerCase()) {
      case "closing soon":
        messageConfig = {
          category: "warning",
          title: "Tender Closing Soon",
          message: `The tender "${update.tenderTitle}" is closing soon. Deadline: ${update.deadline ? new Date(update.deadline).toLocaleDateString() : "Check tender details"}. Make sure to submit your bid before the deadline.`,
          actions: [
            {
              id: "view_tender",
              label: "View Tender",
              action: "view_tender",
              data: { tenderId: update.tenderId },
            },
            {
              id: "submit_bid",
              label: "Submit Bid Now",
              action: "view_tender",
              data: { tenderId: update.tenderId, action: "submit_bid" },
            },
          ],
        };
        break;

      case "closed":
        messageConfig = {
          category: "info",
          title: "Tender Closed",
          message: `The tender "${update.tenderTitle}" has closed. If you submitted a bid, it is now under evaluation. You will be notified of the results.`,
          actions: [
            {
              id: "view_results",
              label: "Check Results",
              action: "view_tender",
              data: { tenderId: update.tenderId },
            },
          ],
        };
        break;

      case "evaluated":
        messageConfig = {
          category: "info",
          title: "Tender Evaluation Complete",
          message: `The evaluation for tender "${update.tenderTitle}" has been completed. Results will be published soon.`,
          actions: [
            {
              id: "view_results",
              label: "View Results",
              action: "view_tender",
              data: { tenderId: update.tenderId },
            },
          ],
        };
        break;

      default:
        messageConfig = {
          category: "info",
          title: "Tender Status Updated",
          message: `The status of tender "${update.tenderTitle}" has been updated to "${update.newStatus}".`,
          actions: [
            {
              id: "view_tender",
              label: "View Details",
              action: "view_tender",
              data: { tenderId: update.tenderId },
            },
          ],
        };
    }

    return this.addMessage(
      {
        type:
          update.newStatus.toLowerCase() === "closing soon"
            ? "tender_closing_soon"
            : update.newStatus.toLowerCase() === "closed"
              ? "tender_closed"
              : "general",
        category: messageConfig.category,
        title: messageConfig.title,
        message: messageConfig.message,
        tenderId: update.tenderId,
        actions: messageConfig.actions,
        metadata: {
          tenderTitle: update.tenderTitle,
          oldStatus: update.oldStatus,
          newStatus: update.newStatus,
          ministry: update.ministry,
          deadline: update.deadline,
        },
      },
      companyEmail,
    );
  }

  // Create bid created message (when Ministry creates a new tender)
  public createBidCreatedMessage(
    tenderData: {
      id: string;
      title: string;
      ministry: string;
      category: string;
      value: string;
      deadline: string;
    },
    companyEmail?: string,
  ): string {
    return this.addMessage(
      {
        type: "bid_created",
        category: "info",
        title: "New Tender Available",
        message: `A new tender "${tenderData.title}" worth ${tenderData.value} has been published by ${tenderData.ministry}. Deadline: ${new Date(tenderData.deadline).toLocaleDateString()}. Express your interest to participate.`,
        tenderId: tenderData.id,
        actions: [
          {
            id: "view_tender",
            label: "View Tender",
            action: "view_tender",
            data: { tenderId: tenderData.id },
          },
          {
            id: "express_interest",
            label: "Express Interest",
            action: "view_tender",
            data: { tenderId: tenderData.id, action: "express_interest" },
          },
        ],
        metadata: {
          tenderTitle: tenderData.title,
          ministry: tenderData.ministry,
          category: tenderData.category,
          value: tenderData.value,
          deadline: tenderData.deadline,
        },
      },
      companyEmail,
    );
  }

  // Auto-generate messages for tenders that companies have expressed interest in
  public monitorTenderStatusChanges(): void {
    // This function should be called periodically to check for tender status changes
    // and generate appropriate messages for companies that have expressed interest
    try {
      const companyStatesByEmail: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("companyTenderStates_")) {
          try {
            const email = key.replace("companyTenderStates_", "");
            companyStatesByEmail[email] = JSON.parse(
              localStorage.getItem(key) || "{}",
            );
          } catch (error) {
            console.error(
              "Error parsing company tender states for key:",
              key,
              error,
            );
          }
        }
      }
      if (Object.keys(companyStatesByEmail).length === 0) {
        companyStatesByEmail["legacy"] = JSON.parse(
          localStorage.getItem("companyTenderStates") || "{}",
        );
      }
      // Get tenders from all ministries (aggregated approach)
      const getAggregatedTenders = () => {
        const allTenders: any[] = [];

        // Scan all ministry-specific recentTenders keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.endsWith("_recentTenders")) {
            try {
              const ministryTenders = JSON.parse(
                localStorage.getItem(key) || "[]",
              );
              allTenders.push(...ministryTenders);
            } catch (error) {
              console.error(`Error parsing tenders for key ${key}:`, error);
            }
          }
        }

        return allTenders;
      };

      const recentTenders = getAggregatedTenders();

      recentTenders.forEach((tender: any) => {
        Object.values(companyStatesByEmail).forEach((states: any) => {
          const tenderState = states[tender.id];
          if (
            tenderState &&
            (tenderState.hasExpressedInterest || tenderState.hasBid)
          ) {
            // Check if tender status has changed and should trigger a notification
            const currentStatus = tender.status;
            const lastNotifiedStatus = localStorage.getItem(
              `lastNotifiedStatus_${tender.id}`,
            );

            if (lastNotifiedStatus !== currentStatus) {
              // Create status update message
              this.createTenderStatusUpdateMessage({
                tenderId: tender.id,
                tenderTitle: tender.title,
                oldStatus: lastNotifiedStatus || "Unknown",
                newStatus: currentStatus,
                deadline: tender.deadline,
                ministry: tender.procuringEntity || tender.ministry,
              });

              // Update last notified status
              localStorage.setItem(
                `lastNotifiedStatus_${tender.id}`,
                currentStatus,
              );
            }
          }
        });
      });
    } catch (error) {
      console.error("Error monitoring tender status changes:", error);
    }
  }
}

export const messageService = MessageService.getInstance();
