import { RequestHandler } from "express";

export interface EvaluationCriteria {
  id: number;
  name: string;
  maxScore: number;
  weight?: number;
  type?: 'technical' | 'financial';
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string;
  criteria: EvaluationCriteria[];
}

const mockEvaluationTemplates: EvaluationTemplate[] = [
  {
    id: "ET-001",
    name: "Quality and Cost-Based Selection (QCBS)",
    description: "70% Technical, 30% Financial evaluation",
    category: "Healthcare",
    type: "QCBS",
    criteria: [
      { id: 1, name: "Qualifications", maxScore: 20, weight: 0.2, type: "technical" },
      { id: 2, name: "Methodology", maxScore: 25, weight: 0.25, type: "technical" },
      { id: 3, name: "Experience", maxScore: 15, weight: 0.15, type: "technical" },
      { id: 4, name: "Team Competence", maxScore: 10, weight: 0.1, type: "technical" },
      { id: 5, name: "Financial Proposal", maxScore: 30, weight: 0.3, type: "financial" }
    ]
  },
  {
    id: "ET-002",
    name: "Least Cost Selection (LCS)",
    description: "Lowest cost among technically qualified bidders",
    category: "Infrastructure",
    type: "LCS",
    criteria: [
      { id: 1, name: "Technical Qualification", maxScore: 70, weight: 0.7, type: "technical" },
      { id: 2, name: "Financial Proposal", maxScore: 30, weight: 0.3, type: "financial" }
    ]
  },
  {
    id: "ET-003",
    name: "Quality-Based Selection (QBS)",
    description: "100% Technical evaluation, price negotiated later",
    category: "Services",
    type: "QBS",
    criteria: [
      { id: 1, name: "Technical Approach", maxScore: 40, weight: 0.4, type: "technical" },
      { id: 2, name: "Team Qualifications", maxScore: 30, weight: 0.3, type: "technical" },
      { id: 3, name: "Company Experience", maxScore: 30, weight: 0.3, type: "technical" }
    ]
  },
  {
    id: "ET-004",
    name: "Fixed Budget Selection (FBS)",
    description: "Best technical proposal within fixed budget",
    category: "Education",
    type: "FBS",
    criteria: [
      { id: 1, name: "Technical Proposal", maxScore: 50, weight: 0.5, type: "technical" },
      { id: 2, name: "Implementation Plan", maxScore: 30, weight: 0.3, type: "technical" },
      { id: 3, name: "Budget Compliance", maxScore: 20, weight: 0.2, type: "financial" }
    ]
  },
  {
    id: "ET-005",
    name: "Simplified QCBS for Healthcare",
    description: "Simplified QCBS template for healthcare procurement",
    category: "Healthcare",
    type: "QCBS",
    criteria: [
      { id: 1, name: "Qualifications", maxScore: 20, weight: 0.2, type: "technical" },
      { id: 2, name: "Methodology", maxScore: 25, weight: 0.25, type: "technical" },
      { id: 3, name: "Experience", maxScore: 15, weight: 0.15, type: "technical" },
      { id: 4, name: "Team Competence", maxScore: 10, weight: 0.1, type: "technical" },
      { id: 5, name: "Financial Proposal", maxScore: 30, weight: 0.3, type: "financial" }
    ]
  },
  {
    id: "ET-006",
    name: "Infrastructure LCS Standard",
    description: "Standard LCS template for infrastructure projects",
    category: "Infrastructure",
    type: "LCS",
    criteria: [
      { id: 1, name: "Technical Qualification", maxScore: 70, weight: 0.7, type: "technical" },
      { id: 2, name: "Financial Proposal", maxScore: 30, weight: 0.3, type: "financial" }
    ]
  },
  {
    id: "ET-007",
    name: "Education Technology QCBS",
    description: "QCBS template optimized for education technology",
    category: "Education",
    type: "QCBS",
    criteria: [
      { id: 1, name: "Technical Specifications", maxScore: 25, weight: 0.25, type: "technical" },
      { id: 2, name: "Implementation Methodology", maxScore: 20, weight: 0.2, type: "technical" },
      { id: 3, name: "Support and Training", maxScore: 15, weight: 0.15, type: "technical" },
      { id: 4, name: "Company Experience", maxScore: 10, weight: 0.1, type: "technical" },
      { id: 5, name: "Financial Proposal", maxScore: 30, weight: 0.3, type: "financial" }
    ]
  },
  {
    id: "ET-008",
    name: "General Goods LCS",
    description: "LCS template for general goods and supplies",
    category: "General",
    type: "LCS",
    criteria: [
      { id: 1, name: "Product Quality", maxScore: 40, weight: 0.4, type: "technical" },
      { id: 2, name: "Delivery Capability", maxScore: 30, weight: 0.3, type: "technical" },
      { id: 3, name: "Financial Proposal", maxScore: 30, weight: 0.3, type: "financial" }
    ]
  },
];

export const getEvaluationTemplates: RequestHandler = (req, res) => {
  try {
    // In a real application, this would fetch from a database
    // For now, return mock data plus any created templates
    res.json(mockEvaluationTemplates);
  } catch (error) {
    console.error("Error fetching evaluation templates:", error);
    res.status(500).json({ error: "Failed to fetch evaluation templates" });
  }
};

export const getEvaluationTemplateById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const template = mockEvaluationTemplates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({ error: "Evaluation template not found" });
    }

    res.json(template);
  } catch (error) {
    console.error("Error fetching evaluation template:", error);
    res.status(500).json({ error: "Failed to fetch evaluation template" });
  }
};

export const createEvaluationTemplate: RequestHandler = (req, res) => {
  try {
    const { name, description, category, type } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Create new evaluation template
    const newTemplate: EvaluationTemplate = {
      id: `ET-${Date.now()}`,
      name,
      description: description || "",
      category: category || "General",
      type: type || "QCBS",
    };

    // Add to mock data (in production, save to database)
    mockEvaluationTemplates.push(newTemplate);

    console.log("Created new evaluation template:", newTemplate);

    res.status(201).json(newTemplate);
  } catch (error) {
    console.error("Error creating evaluation template:", error);
    res.status(500).json({ error: "Failed to create evaluation template" });
  }
};
