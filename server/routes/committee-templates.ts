import { RequestHandler } from "express";

export interface CommitteeTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
}

const mockCommitteeTemplates: CommitteeTemplate[] = [
  {
    id: "CT-001",
    name: "Healthcare Procurement Committee",
    description: "Standard template for healthcare procurement evaluations",
    category: "Healthcare",
    status: "Active"
  },
  {
    id: "CT-002", 
    name: "Infrastructure Evaluation Committee",
    description: "Template for construction and infrastructure projects",
    category: "Infrastructure",
    status: "Active"
  },
  {
    id: "CT-003",
    name: "Education Technology Committee",
    description: "Specialized for educational technology procurement",
    category: "Education",
    status: "Active"
  },
  {
    id: "CT-004",
    name: "General Goods Committee",
    description: "Standard template for general goods and supplies",
    category: "General",
    status: "Active"
  },
  {
    id: "CT-005",
    name: "Professional Services Committee",
    description: "Template for consultancy and professional services",
    category: "Services",
    status: "Active"
  }
];

export const getCommitteeTemplates: RequestHandler = (req, res) => {
  try {
    // In a real application, this would fetch from a database
    // For now, return mock data
    res.json(mockCommitteeTemplates);
  } catch (error) {
    console.error("Error fetching committee templates:", error);
    res.status(500).json({ error: "Failed to fetch committee templates" });
  }
};
