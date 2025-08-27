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
let assignments: CommitteeAssignmentResponse[] = [];

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
