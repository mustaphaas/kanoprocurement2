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
        // Generate realistic tender titles and categories based on tender ID and template
        let tenderTitle = "Sample Tender";
        let tenderCategory = "General";

        switch (assignment.tenderId) {
          case "TDR-001":
            tenderTitle =
              "Supply of Medical Equipment to Primary Health Centers";
            tenderCategory = "Healthcare";
            break;
          case "TDR-002":
            tenderTitle = "Road Construction and Rehabilitation Project";
            tenderCategory = "Infrastructure";
            break;
          case "TDR-003":
            tenderTitle = "Consulting Services for Health System Improvement";
            tenderCategory = "Professional Services";
            break;
          default:
            tenderTitle = `Tender ${assignment.tenderId}`;
            tenderCategory = "General";
        }

        return {
          id: assignment.id,
          tenderId: assignment.tenderId,
          tenderTitle,
          tenderCategory,
          evaluationTemplateId: assignment.evaluationTemplateId,
          evaluationStart: assignment.evaluationStart,
          evaluationEnd: assignment.evaluationEnd,
          status: assignment.status,
        };
      });

    res.json(evaluatorAssignments);
  } catch (error) {
    console.error("Error fetching tender assignments for evaluator:", error);
    res.status(500).json({ error: "Failed to fetch tender assignments" });
  }
};
