import { RequestHandler } from "express";

export interface CommitteeAssignmentPayload {
  tenderId: string;
  committeeTemplateId: string;
  evaluationTemplateId: string;
  evaluationStart: string;
  evaluationEnd: string;
  notes: string;
}

export interface CommitteeAssignmentResponse {
  id: string;
  tenderId: string;
  committeeTemplateId: string;
  evaluationTemplateId: string;
  evaluationStart: string;
  evaluationEnd: string;
  notes: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

// In-memory storage for demo purposes (in production, use a database)
let assignments: CommitteeAssignmentResponse[] = [
  // Sample assignments for testing
  {
    id: "CA-1000001",
    tenderId: "TDR-001",
    committeeTemplateId: "CT-001",
    evaluationTemplateId: "ET-001", // QCBS template
    evaluationStart: "2024-01-15T00:00:00Z",
    evaluationEnd: "2024-02-15T23:59:59Z",
    notes: "Medical equipment procurement evaluation",
    status: "Active",
    createdAt: "2024-01-10T10:00:00Z",
    createdBy: "Admin User",
  },
  {
    id: "CA-1000002",
    tenderId: "TDR-002",
    committeeTemplateId: "CT-002",
    evaluationTemplateId: "ET-002", // LCS template
    evaluationStart: "2024-01-20T00:00:00Z",
    evaluationEnd: "2024-02-20T23:59:59Z",
    notes: "Infrastructure project evaluation",
    status: "Draft",
    createdAt: "2024-01-15T14:30:00Z",
    createdBy: "Ministry User",
  },
  {
    id: "CA-1000003",
    tenderId: "TDR-003",
    committeeTemplateId: "CT-001",
    evaluationTemplateId: "ET-003", // QBS template
    evaluationStart: "2024-02-01T00:00:00Z",
    evaluationEnd: "2024-02-28T23:59:59Z",
    notes: "Consulting services evaluation",
    status: "Active",
    createdAt: "2024-01-25T09:15:00Z",
    createdBy: "Procurement Officer",
  },
];

// Helper function to get assignment by tender ID
export const getAssignmentByTenderId = (
  tenderId: string,
): CommitteeAssignmentResponse | null => {
  return (
    assignments.find((assignment) => assignment.tenderId === tenderId) || null
  );
};

// Get tender assignment with full tender information for TenderScoring page
export const getTenderAssignmentWithDetails: RequestHandler = (req, res) => {
  try {
    const { tenderId } = req.params;

    if (!tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }

    // Find assignment for this tender
    const assignment = getAssignmentByTenderId(tenderId);

    if (!assignment) {
      return res.status(404).json({ error: "Tender assignment not found" });
    }

    // Get tender information
    const tenderInfo = getTenderInfo(tenderId);

    // Return assignment with tender details
    const assignmentWithDetails = {
      ...assignment,
      tenderTitle: tenderInfo.title,
      tenderCategory: tenderInfo.category,
      ministry: tenderInfo.ministry,
    };

    console.log(
      `📋 Returning tender assignment details for ${tenderId}:`,
      assignmentWithDetails,
    );

    res.json(assignmentWithDetails);
  } catch (error) {
    console.error("Error fetching tender assignment with details:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch tender assignment details" });
  }
};

export const createCommitteeAssignment: RequestHandler = (req, res) => {
  try {
    const payload: CommitteeAssignmentPayload = req.body;

    // Validate required fields
    if (!payload.tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }
    if (!payload.committeeTemplateId) {
      return res.status(400).json({ error: "committeeTemplateId is required" });
    }
    if (!payload.evaluationTemplateId) {
      return res
        .status(400)
        .json({ error: "evaluationTemplateId is required" });
    }
    if (!payload.evaluationStart) {
      return res.status(400).json({ error: "evaluationStart is required" });
    }
    if (!payload.evaluationEnd) {
      return res.status(400).json({ error: "evaluationEnd is required" });
    }

    // Validate date logic
    if (new Date(payload.evaluationStart) >= new Date(payload.evaluationEnd)) {
      return res.status(400).json({
        error: "Evaluation end date must be after start date",
      });
    }

    // Create new assignment
    const newAssignment: CommitteeAssignmentResponse = {
      id: `CA-${Date.now()}`,
      tenderId: payload.tenderId,
      committeeTemplateId: payload.committeeTemplateId,
      evaluationTemplateId: payload.evaluationTemplateId,
      evaluationStart: payload.evaluationStart,
      evaluationEnd: payload.evaluationEnd,
      notes: payload.notes || "",
      status: "Draft",
      createdAt: new Date().toISOString(),
      createdBy: "Current User", // In production, get from authentication
    };

    // Store assignment (in production, save to database)
    assignments.push(newAssignment);

    console.log("Created new committee assignment:", newAssignment);

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error("Error creating committee assignment:", error);
    res.status(500).json({ error: "Failed to create committee assignment" });
  }
};

export const getCommitteeAssignments: RequestHandler = (req, res) => {
  try {
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching committee assignments:", error);
    res.status(500).json({ error: "Failed to fetch committee assignments" });
  }
};

// Update assignment status (e.g., Draft -> Active)
export const updateCommitteeAssignmentStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status?: string };

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }
    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const idx = assignments.findIndex((a) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    assignments[idx] = { ...assignments[idx], status };
    console.log(`Updated committee assignment ${id} to status ${status}`);
    return res.json(assignments[idx]);
  } catch (error) {
    console.error("Error updating committee assignment status:", error);
    return res
      .status(500)
      .json({ error: "Failed to update committee assignment status" });
  }
};

// Helper function to get tender information from localStorage simulation
const getTenderInfo = (tenderId: string) => {
  // In a real application, this would query the database
  // For now, simulate reading from the same localStorage that the client uses
  const mockTenders = [
    {
      id: "KS-2024-001",
      title: "Supply of Medical Equipment to Primary Health Centers",
      category: "Healthcare",
      ministry: "Ministry of Health",
    },
    {
      id: "KS-2024-002",
      title: "Hospital Equipment Supply",
      category: "Healthcare",
      ministry: "Ministry of Health",
    },
    {
      id: "KS-2024-003",
      title: "Road Construction and Rehabilitation Project",
      category: "Infrastructure",
      ministry: "Ministry of Works and Infrastructure",
    },
    {
      id: "MOH-2024-001",
      title: "Medical Equipment Procurement for State Hospitals",
      category: "Healthcare",
      ministry: "Ministry of Health",
    },
    {
      id: "MOWI-2024-001",
      title: "Kano-Kaduna Highway Rehabilitation",
      category: "Infrastructure",
      ministry: "Ministry of Works and Infrastructure",
    },
    {
      id: "MOE-2024-001",
      title: "School Furniture Supply Program",
      category: "Education",
      ministry: "Ministry of Education",
    },
  ];

  // First try to find in mock data
  const mockTender = mockTenders.find((t) => t.id === tenderId);
  if (mockTender) {
    return mockTender;
  }

  // Fallback: generate based on ID pattern
  if (tenderId.startsWith("KS-")) {
    return {
      id: tenderId,
      title: `Kano State Tender ${tenderId}`,
      category: "General",
      ministry: "Kano State Government",
    };
  } else if (tenderId.startsWith("MOH-")) {
    return {
      id: tenderId,
      title: `Health Sector Procurement ${tenderId}`,
      category: "Healthcare",
      ministry: "Ministry of Health",
    };
  } else if (tenderId.startsWith("MOWI-")) {
    return {
      id: tenderId,
      title: `Infrastructure Project ${tenderId}`,
      category: "Infrastructure",
      ministry: "Ministry of Works and Infrastructure",
    };
  } else if (tenderId.startsWith("MOE-")) {
    return {
      id: tenderId,
      title: `Educational Services ${tenderId}`,
      category: "Education",
      ministry: "Ministry of Education",
    };
  }

  // Final fallback
  return {
    id: tenderId,
    title: `Tender ${tenderId}`,
    category: "General",
    ministry: "Kano State Government",
  };
};

// Get tender assignments for a specific evaluator
export const getTenderAssignmentsForEvaluator: RequestHandler = (req, res) => {
  try {
    const { evaluatorId } = req.params;

    if (!evaluatorId) {
      return res.status(400).json({ error: "evaluatorId is required" });
    }

    // Filter assignments where the evaluator is part of the committee
    // For now, return all active assignments (in production, filter by evaluator membership)
    const evaluatorAssignments = assignments
      .filter(
        (assignment) =>
          assignment.status === "Draft" || assignment.status === "Active",
      )
      .map((assignment) => {
        // Get real tender information instead of hard-coded values
        const tenderInfo = getTenderInfo(assignment.tenderId);

        return {
          id: assignment.id,
          tenderId: assignment.tenderId,
          tenderTitle: tenderInfo.title,
          tenderCategory: tenderInfo.category,
          ministry: tenderInfo.ministry,
          evaluationTemplateId: assignment.evaluationTemplateId,
          evaluationStart: assignment.evaluationStart,
          evaluationEnd: assignment.evaluationEnd,
          status: assignment.status,
        };
      });

    console.log(
      `📋 Returning ${evaluatorAssignments.length} tender assignments for evaluator ${evaluatorId}:`,
      evaluatorAssignments.map((a) => ({
        id: a.id,
        tenderId: a.tenderId,
        title: a.tenderTitle,
      })),
    );

    res.json(evaluatorAssignments);
  } catch (error) {
    console.error("Error fetching tender assignments for evaluator:", error);
    res.status(500).json({ error: "Failed to fetch tender assignments" });
  }
};
