import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// Types for our collections
export interface Company {
  id?: string;
  userId: string;
  companyName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  contactPersonName: string;
  status: "Pending" | "Approved" | "Suspended" | "Blacklisted";
  registrationDate: Timestamp;
  lastActivity: Timestamp;
  documents: {
    incorporation: boolean;
    taxClearance: boolean;
    companyProfile: boolean;
    cacForm: boolean;
  };
  verificationStatus: {
    cac: "Pending" | "Verified" | "Failed";
    firs: "Pending" | "Verified" | "Failed";
  };
  suspensionReason?: string;
  blacklistReason?: string;
}

export interface Tender {
  id?: string;
  title: string;
  description: string;
  category: string;
  ministry: string;
  procuringEntity: string;
  estimatedValue: string;
  currency: string;
  status:
    | "Draft"
    | "Published"
    | "Closed"
    | "Evaluated"
    | "Awarded"
    | "Cancelled";
  publishDate: Timestamp;
  closeDate: Timestamp;
  openDate?: Timestamp;
  awardDate?: Timestamp;
  awardedCompany?: string;
  awardAmount?: string;
  bidsReceived: number;
  ocdsReleased: boolean;
  addendaCount: number;
  evaluationScore?: number;
  eligibilityCriteria: string;
  technicalRequirements: string;
  evaluationCriteria: string;
  contractDuration: string;
  deliveryLocation: string;
  paymentTerms: string;
  // OCDS fields
  ocdsId: string;
  procurementMethod: string;
  procurementCategory: string;
  mainProcurementCategory: string;
  additionalProcurementCategories: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TenderBid {
  id?: string;
  tenderId: string;
  companyId: string;
  companyUserId: string;
  companyName: string;
  bidAmount: string;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  comments?: string;
  status: "Submitted" | "Under Review" | "Evaluated" | "Accepted" | "Rejected";
  submittedAt: Timestamp;
  evaluatedAt?: Timestamp;
  evaluatedBy?: string;
  documents: string[]; // Array of document URLs
}

export interface Contract {
  id?: string;
  tenderId: string;
  companyId: string;
  companyUserId: string;
  companyName: string;
  projectTitle: string;
  awardingMinistry: string;
  contractValue: string;
  awardDate: Timestamp;
  startDate?: Timestamp;
  expectedEndDate?: Timestamp;
  actualEndDate?: Timestamp;
  status: "Awarded" | "Active" | "Completed" | "Terminated" | "Delayed";
  progress: number;
  milestones: ContractMilestone[];
  performanceScore: {
    overall: number;
    quality: number;
    timeliness: number;
    budgetCompliance: number;
  };
  issues: ContractIssue[];
}

export interface ContractMilestone {
  id: string;
  title: string;
  description: string;
  expectedDate: Timestamp;
  actualDate?: Timestamp;
  status: "Pending" | "In Progress" | "Completed" | "Delayed";
  completionPercentage: number;
  notes?: string;
  documents: string[];
}

export interface ContractIssue {
  id: string;
  type: "Quality" | "Timeline" | "Budget" | "Compliance" | "Other";
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  reportedDate: Timestamp;
  resolvedDate?: Timestamp;
  status: "Open" | "In Progress" | "Resolved";
  actionTaken?: string;
}

export interface NotificationData {
  id?: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  relatedId?: string; // Related tender, contract, etc.
  relatedType?: "tender" | "contract" | "bid" | "system";
}

export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

// Company operations
export const companyService = {
  async create(company: Omit<Company, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "companies"), {
      ...company,
      registrationDate: serverTimestamp(),
      lastActivity: serverTimestamp(),
    });
    return docRef.id;
  },

  async getById(id: string): Promise<Company | null> {
    const docRef = doc(db, "companies", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Company)
      : null;
  },

  async getByUserId(userId: string): Promise<Company | null> {
    const q = query(collection(db, "companies"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty
      ? null
      : ({
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        } as Company);
  },

  async getAll(constraints: QueryConstraint[] = []): Promise<Company[]> {
    const q = query(collection(db, "companies"), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Company,
    );
  },

  async update(id: string, updates: Partial<Company>): Promise<void> {
    const docRef = doc(db, "companies", id);
    await updateDoc(docRef, {
      ...updates,
      lastActivity: serverTimestamp(),
    });
  },

  async updateStatus(
    id: string,
    status: Company["status"],
    reason?: string,
  ): Promise<void> {
    const updates: any = { status, lastActivity: serverTimestamp() };
    if (status === "Suspended" && reason) {
      updates.suspensionReason = reason;
    }
    if (status === "Blacklisted" && reason) {
      updates.blacklistReason = reason;
    }

    const docRef = doc(db, "companies", id);
    await updateDoc(docRef, updates);
  },

  onSnapshot(
    callback: (companies: Company[]) => void,
    constraints: QueryConstraint[] = [],
  ) {
    const q = query(collection(db, "companies"), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const companies = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Company,
      );
      callback(companies);
    });
  },
};

// Tender operations
export const tenderService = {
  async create(tender: Omit<Tender, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "tenders"), {
      ...tender,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      bidsReceived: 0,
      ocdsReleased: false,
      addendaCount: 0,
    });
    return docRef.id;
  },

  async getById(id: string): Promise<Tender | null> {
    const docRef = doc(db, "tenders", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? ({ id: docSnap.id, ...docSnap.data() } as Tender)
      : null;
  },

  async getAll(constraints: QueryConstraint[] = []): Promise<Tender[]> {
    const q = query(collection(db, "tenders"), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Tender,
    );
  },

  async getPublished(): Promise<Tender[]> {
    return this.getAll([
      where("status", "==", "Published"),
      orderBy("publishDate", "desc"),
    ]);
  },

  async update(id: string, updates: Partial<Tender>): Promise<void> {
    const docRef = doc(db, "tenders", id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async updateStatus(id: string, status: Tender["status"]): Promise<void> {
    const docRef = doc(db, "tenders", id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  onSnapshot(
    callback: (tenders: Tender[]) => void,
    constraints: QueryConstraint[] = [],
  ) {
    const q = query(collection(db, "tenders"), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const tenders = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Tender,
      );
      callback(tenders);
    });
  },
};

// Bid operations
export const bidService = {
  async create(bid: Omit<TenderBid, "id">): Promise<string> {
    const docRef = await addDoc(
      collection(db, "tenders", bid.tenderId, "bids"),
      {
        ...bid,
        submittedAt: serverTimestamp(),
      },
    );

    // Update tender bid count
    const tenderRef = doc(db, "tenders", bid.tenderId);
    const tenderDoc = await getDoc(tenderRef);
    if (tenderDoc.exists()) {
      await updateDoc(tenderRef, {
        bidsReceived: (tenderDoc.data().bidsReceived || 0) + 1,
      });
    }

    return docRef.id;
  },

  async getByTender(tenderId: string): Promise<TenderBid[]> {
    const q = query(
      collection(db, "tenders", tenderId, "bids"),
      orderBy("submittedAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as TenderBid,
    );
  },

  async getByCompany(companyUserId: string): Promise<TenderBid[]> {
    // This would require a collection group query across all tender bids
    // For now, we'll implement a simpler version
    const q = query(
      collection(db, "bids"), // We'd need a separate bids collection for this
      where("companyUserId", "==", companyUserId),
      orderBy("submittedAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as TenderBid,
    );
  },

  async update(
    tenderId: string,
    bidId: string,
    updates: Partial<TenderBid>,
  ): Promise<void> {
    const docRef = doc(db, "tenders", tenderId, "bids", bidId);
    await updateDoc(docRef, updates);
  },
};

// Contract operations
export const contractService = {
  async create(contract: Omit<Contract, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "contracts"), {
      ...contract,
      awardDate: serverTimestamp(),
    });
    return docRef.id;
  },

  async getByCompanyUser(companyUserId: string): Promise<Contract[]> {
    const q = query(
      collection(db, "contracts"),
      where("companyUserId", "==", companyUserId),
      orderBy("awardDate", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Contract,
    );
  },

  async getAll(constraints: QueryConstraint[] = []): Promise<Contract[]> {
    const q = query(collection(db, "contracts"), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Contract,
    );
  },

  async update(id: string, updates: Partial<Contract>): Promise<void> {
    const docRef = doc(db, "contracts", id);
    await updateDoc(docRef, updates);
  },
};

// Notification operations
export const notificationService = {
  async create(notification: Omit<NotificationData, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getByUser(
    userId: string,
    limitCount: number = 50,
  ): Promise<NotificationData[]> {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as NotificationData,
    );
  },

  async markAsRead(id: string): Promise<void> {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { read: true });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
    );
    const querySnapshot = await getDocs(q);

    const batch = [];
    querySnapshot.docs.forEach((docSnapshot) => {
      batch.push(updateDoc(docSnapshot.ref, { read: true }));
    });

    await Promise.all(batch);
  },

  onSnapshot(
    userId: string,
    callback: (notifications: NotificationData[]) => void,
  ) {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as NotificationData,
      );
      callback(notifications);
    });
  },
};

// Audit log operations
export const auditService = {
  async log(auditData: Omit<AuditLog, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "auditLogs"), {
      ...auditData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAll(constraints: QueryConstraint[] = []): Promise<AuditLog[]> {
    const q = query(collection(db, "auditLogs"), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AuditLog,
    );
  },

  async getRecent(limitCount: number = 100): Promise<AuditLog[]> {
    return this.getAll([orderBy("timestamp", "desc"), limit(limitCount)]);
  },
};

// Utility functions
export const firestoreUtils = {
  // Convert Firestore Timestamp to Date
  timestampToDate: (timestamp: Timestamp): Date => timestamp.toDate(),

  // Convert Date to Firestore Timestamp
  dateToTimestamp: (date: Date): Timestamp => Timestamp.fromDate(date),

  // Get server timestamp
  getServerTimestamp: () => serverTimestamp(),
};

// Clarification operations
export type ClarificationStatus = "Pending Response" | "Responded" | "Closed";

export interface Clarification {
  id?: string;
  tender: string;
  subject: string;
  category: string;
  message: string;
  urgent: boolean;
  submittedDate: Timestamp;
  responseDate?: Timestamp | null;
  response?: string | null;
  status: ClarificationStatus;
  vendorEmail: string;
  vendorName: string;
  ministryCode: string;
}

export const clarificationService = {
  async create(
    clar: Omit<Clarification, "id" | "submittedDate">,
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "clarifications"), {
      ...clar,
      submittedDate: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Clarification>): Promise<void> {
    const ref = doc(db, "clarifications", id);
    await updateDoc(ref, updates);
  },

  async getByVendorEmail(
    email: string,
  ): Promise<(Clarification & { id: string })[]> {
    const q = query(
      collection(db, "clarifications"),
      where("vendorEmail", "==", email.toLowerCase()),
      orderBy("submittedDate", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Clarification & { id: string },
    );
  },

  async getByMinistry(
    ministryCode: string,
  ): Promise<(Clarification & { id: string })[]> {
    const q = query(
      collection(db, "clarifications"),
      where("ministryCode", "==", ministryCode),
      orderBy("submittedDate", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Clarification & { id: string },
    );
  },

  onSnapshotByVendor(
    email: string,
    callback: (cls: (Clarification & { id: string })[]) => void,
  ) {
    const qy = query(
      collection(db, "clarifications"),
      where("vendorEmail", "==", email.toLowerCase()),
      orderBy("submittedDate", "desc"),
    );
    return onSnapshot(qy, (snapshot) => {
      const list = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as Clarification & { id: string },
      );
      callback(list);
    });
  },
};
