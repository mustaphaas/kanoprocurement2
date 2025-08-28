export type ClarificationStatus = "Pending Response" | "Responded" | "Closed";

export interface ClarificationRecord {
  id: string;
  tender: string; // e.g., "TB001 - Road Construction ..."
  subject: string;
  category: string;
  message: string;
  urgent: boolean;
  submittedDate: string; // ISO date string
  responseDate: string | null;
  response: string | null;
  status: ClarificationStatus;
  vendorEmail: string;
  vendorName: string;
  ministryCode: string;
}

const CENTRAL_KEY = "centralClarifications";

export const getCentralClarifications = (): ClarificationRecord[] => {
  try {
    const raw = localStorage.getItem(CENTRAL_KEY);
    return raw ? (JSON.parse(raw) as ClarificationRecord[]) : [];
  } catch (e) {
    console.error("Failed to parse central clarifications", e);
    return [];
  }
};

export const saveCentralClarifications = (
  items: ClarificationRecord[],
) => {
  localStorage.setItem(CENTRAL_KEY, JSON.stringify(items));
};

export const addClarification = (
  item: ClarificationRecord,
): ClarificationRecord[] => {
  const current = getCentralClarifications();
  const updated = [item, ...current];
  saveCentralClarifications(updated);
  return updated;
};

export const getCompanyClarifications = (
  vendorEmail: string,
): ClarificationRecord[] => {
  return getCentralClarifications().filter(
    (c) => c.vendorEmail.toLowerCase() === vendorEmail.toLowerCase(),
  );
};

export const getClarificationById = (id: string): ClarificationRecord | null => {
  return getCentralClarifications().find((c) => c.id === id) || null;
};

export const updateClarification = (
  id: string,
  patch: Partial<ClarificationRecord>,
): ClarificationRecord[] => {
  const current = getCentralClarifications();
  const updated = current.map((c) => (c.id === id ? { ...c, ...patch } : c));
  saveCentralClarifications(updated);
  return updated;
};
