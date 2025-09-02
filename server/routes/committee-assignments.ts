import { RequestHandler } from "express";
import {
  EvaluationTemplate,
  mockEvaluationTemplates,
} from "./evaluation-templates";

export interface CommitteeAssignment {
  id: string;
  tenderId: string;
  tenderTitle: string;
  committeeTemplateId: string;
  evaluationTemplateId: string;
  evaluationStart: string;
  evaluationEnd: string;
  status: "active" | "draft" | "completed" | "suspended";
  assignedBy: string;
  createdAt: string;
  notes?: string;
}

// In-memory storage for demo purposes
let assignments: CommitteeAssignment[] = [
  {
    id: "CA-001",
    tenderId: "MOH-2024-001",
    tenderTitle: "Medical Equipment Procurement for State Hospitals",
    committeeTemplateId: "CT-001",
    evaluationTemplateId: "ET-001",
    evaluationStart: "2024-01-15T00:00:00Z",
    evaluationEnd: "2024-02-15T00:00:00Z",
    status: "active",
    assignedBy: "Admin",
    createdAt: "2024-01-10T00:00:00Z",
    notes: "Priority tender for Q1 2024",
  },
  {
    id: "CA-002",
    tenderId: "KS-2024-002",
    tenderTitle: "Hospital Equipment Supply",
    committeeTemplateId: "CT-001",
    evaluationTemplateId: "ET-001",
    evaluationStart: "2024-01-20T00:00:00Z",
    evaluationEnd: "2024-02-20T00:00:00Z",
    status: "active",
    assignedBy: "Admin",
    createdAt: "2024-01-15T00:00:00Z",
    notes: "Urgent procurement for new hospital wing",
  },
];

export const createCommitteeAssignment: RequestHandler = (req, res) => {
  try {
    const {
      tenderId,
      committeeTemplateId,
      evaluationTemplateId,
      evaluationStart,
      evaluationEnd,
      notes,
    } = req.body;

    // Validate required fields
    if (!tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }
    if (!committeeTemplateId) {
      return res
        .status(400)
        .json({ error: "committeeTemplateId is required" });
    }
    if (!evaluationTemplateId) {
      return res
        .status(400)
        .json({ error: "evaluationTemplateId is required" });
    }
    if (!evaluationStart) {
      return res.status(400).json({ error: "evaluationStart is required" });
    }
    if (!evaluationEnd) {
      return res.status(400).json({ error: "evaluationEnd is required" });
    }

    // Validate evaluation template exists
    const evaluationTemplate = mockEvaluationTemplates.find(
      (t) => t.id === evaluationTemplateId,
    );
    if (!evaluationTemplate) {
      return res
        .status(400)
        .json({ error: "Invalid evaluation template ID" });
    }

    // Generate a tender title based on the tender ID pattern
    let tenderTitle = `Tender ${tenderId}`;
    if (tenderId.startsWith("MOH-")) {
      tenderTitle = `Health Sector Procurement ${tenderId}`;
    } else if (tenderId.startsWith("KS-")) {
      tenderTitle = `Kano State Tender ${tenderId}`;
    } else if (tenderId.startsWith("MOWI-")) {
      tenderTitle = `Infrastructure Project ${tenderId}`;
    } else if (tenderId.startsWith("MOE-")) {
      tenderTitle = `Educational Services ${tenderId}`;
    }

    const newAssignment: CommitteeAssignment = {
      id: `CA-${Date.now()}`,
      tenderId,
      tenderTitle,
      committeeTemplateId,
      evaluationTemplateId,
      evaluationStart,
      evaluationEnd,
      status: "active",
      assignedBy: "Current User", // In production, get from authentication
      createdAt: new Date().toISOString(),
      notes,
    };

    assignments.push(newAssignment);

    console.log("Created committee assignment:", newAssignment);
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

export const getTenderAssignmentsForEvaluator: RequestHandler = (req, res) => {
  try {
    const { evaluatorId } = req.params;

    // For demo purposes, return assignments where the evaluator should have access
    // In production, this would check actual committee membership
    const evaluatorAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      tenderId: assignment.tenderId,
      tenderTitle: assignment.tenderTitle,
      status: assignment.status,
      evaluationStart: assignment.evaluationStart,
      evaluationEnd: assignment.evaluationEnd,
      evaluationTemplateId: assignment.evaluationTemplateId,
    }));

    console.log(
      `Returning ${evaluatorAssignments.length} assignments for evaluator ${evaluatorId}`,
    );
    res.json(evaluatorAssignments);
  } catch (error) {
    console.error("Error fetching tender assignments for evaluator:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch tender assignments for evaluator" });
  }
};

export const updateCommitteeAssignmentStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const validStatuses = ["active", "draft", "completed", "suspended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const assignmentIndex = assignments.findIndex((a) => a.id === id);
    if (assignmentIndex === -1) {
      return res.status(404).json({ error: "Committee assignment not found" });
    }

    assignments[assignmentIndex].status = status;

    console.log(
      `Updated assignment ${id} status to ${status}`,
      assignments[assignmentIndex],
    );
    res.json(assignments[assignmentIndex]);
  } catch (error) {
    console.error("Error updating committee assignment status:", error);
    res
      .status(500)
      .json({ error: "Failed to update committee assignment status" });
  }
};

// Helper function to get assignment by tender ID
export const getAssignmentByTenderId = (tenderId: string) => {
  return assignments.find((a) => a.tenderId === tenderId);
};

// Helper function to update assignment status in memory (for chairman approval)
export const updateAssignmentStatusInMemory = (assignmentId: string, status: string) => {
  const assignmentIndex = assignments.findIndex((a) => a.id === assignmentId);
  if (assignmentIndex !== -1) {
    assignments[assignmentIndex].status = status.toLowerCase() as any;
    console.log(`Updated assignment ${assignmentId} status to ${status} in memory`);
    return assignments[assignmentIndex];
  }
  return null;
};
