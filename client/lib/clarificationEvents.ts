export interface ClarificationSubmittedEvent {
  id: string;
  tender: string;
  subject: string;
  category: string;
  message: string;
  urgent: boolean;
  submittedDate: string; // ISO date string
  vendorEmail: string;
  vendorName: string;
  ministryCode: string;
  status: "Pending Response" | "Responded" | "Closed";
}

export const dispatchClarificationSubmitted = (
  details: ClarificationSubmittedEvent,
) => {
  window.dispatchEvent(
    new CustomEvent("clarificationSubmitted", {
      detail: details,
    }),
  );
};

// Expose for manual testing if needed
if (typeof window !== "undefined") {
  (window as any).dispatchClarificationSubmitted =
    dispatchClarificationSubmitted;
}
