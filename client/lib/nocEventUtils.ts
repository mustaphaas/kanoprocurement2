/**
 * Utility functions for NOC event management and testing
 */

export interface NOCStatusUpdateEvent {
  requestId: string;
  status: "Approved" | "Rejected";
  certificateNumber?: string;
  approvalDate?: string;
  rejectionDate?: string;
}

/**
 * Dispatch a NOC status update event
 */
export const dispatchNOCStatusUpdate = (details: NOCStatusUpdateEvent) => {
  window.dispatchEvent(
    new CustomEvent("nocStatusUpdated", {
      detail: details,
    }),
  );
};

/**
 * Test function to simulate a NOC approval - useful for debugging
 */
export const testNOCApproval = (requestId: string) => {
  console.log("🧪 Testing NOC approval for request:", requestId);

  dispatchNOCStatusUpdate({
    requestId,
    status: "Approved",
    certificateNumber: `KNS/TEST/${new Date().getFullYear()}/${Math.floor(
      Math.random() * 999,
    )
      .toString()
      .padStart(3, "0")}`,
    approvalDate: new Date().toISOString().split("T")[0],
  });

  console.log("✅ NOC approval event dispatched");
};

/**
 * Test function to simulate a NOC rejection - useful for debugging
 */
export const testNOCRejection = (requestId: string) => {
  console.log("🧪 Testing NOC rejection for request:", requestId);

  dispatchNOCStatusUpdate({
    requestId,
    status: "Rejected",
    rejectionDate: new Date().toISOString().split("T")[0],
  });

  console.log("❌ NOC rejection event dispatched");
};

// Add test functions to window for browser console testing
if (typeof window !== "undefined") {
  (window as any).testNOCApproval = testNOCApproval;
  (window as any).testNOCRejection = testNOCRejection;
  (window as any).dispatchNOCStatusUpdate = dispatchNOCStatusUpdate;
}
