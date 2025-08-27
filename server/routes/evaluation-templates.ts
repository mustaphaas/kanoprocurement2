import { RequestHandler } from "express";

export interface EvaluationTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string;
}

const mockEvaluationTemplates: EvaluationTemplate[] = [
  {
    id: "ET-001",
    name: "Quality and Cost-Based Selection (QCBS)",
    description: "70% Technical, 30% Financial evaluation",
    category: "Healthcare",
    type: "QCBS"
  },
  {
    id: "ET-002",
    name: "Least Cost Selection (LCS)",
    description: "Lowest cost among technically qualified bidders",
    category: "Infrastructure",
    type: "LCS"
  },
  {
    id: "ET-003",
    name: "Quality-Based Selection (QBS)",
    description: "100% Technical evaluation, price negotiated later",
    category: "Services",
    type: "QBS"
  },
  {
    id: "ET-004",
    name: "Fixed Budget Selection (FBS)",
    description: "Best technical proposal within fixed budget",
    category: "Education",
    type: "FBS"
  },
  {
    id: "ET-005",
    name: "Simplified QCBS for Healthcare",
    description: "Simplified QCBS template for healthcare procurement",
    category: "Healthcare",
    type: "QCBS"
  },
  {
    id: "ET-006",
    name: "Infrastructure LCS Standard",
    description: "Standard LCS template for infrastructure projects",
    category: "Infrastructure",
    type: "LCS"
  },
  {
    id: "ET-007",
    name: "Education Technology QCBS",
    description: "QCBS template optimized for education technology",
    category: "Education",
    type: "QCBS"
  },
  {
    id: "ET-008",
    name: "General Goods LCS",
    description: "LCS template for general goods and supplies",
    category: "General",
    type: "LCS"
  }
];

export const getEvaluationTemplates: RequestHandler = (req, res) => {
  try {
    // In a real application, this would fetch from a database
    // For now, return mock data
    res.json(mockEvaluationTemplates);
  } catch (error) {
    console.error("Error fetching evaluation templates:", error);
    res.status(500).json({ error: "Failed to fetch evaluation templates" });
  }
};
