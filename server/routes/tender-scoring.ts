import { RequestHandler } from "express";
import { getAssignmentByTenderId } from "./committee-assignments";
import {
  EvaluationTemplate,
  EvaluationCriteria,
  mockEvaluationTemplates,
} from "./evaluation-templates";

export interface TenderScore {
  id: string;
  tenderId: string;
  committeeMemberId: string;
  bidderName: string;
  scores: Record<number, number>; // criteriaId -> score
  totalScore: number;
  submittedAt: string;
  status: "draft" | "submitted";
}

// New payload structure as requested
export interface ScoreItem {
  criterionId: string;
  score: number;
  comment: string;
}

export interface TenderScoreSubmission {
  tenderId: string;
  evaluatorId: string;
  scores: ScoreItem[];
}

// Legacy interface for backward compatibility
export interface LegacyTenderScoreSubmission {
  tenderId: string;
  committeeMemberId: string;
  bidderName: string;
  scores: Record<number, number>;
}

export interface TenderFinalScore {
  bidderName: string;
  technicalScore: number;
  financialScore: number;
  finalScore: number;
  rank: number;
}

interface ChairmanDecision {
  tenderId: string;
  status: "approved" | "revision_requested";
  approvedBy: string;
  approvedAt: string;
  reason?: string;
  winningBidderName?: string;
  finalScores?: TenderFinalScore[];
}

// In-memory storage for demo purposes
let tenderScores: TenderScore[] = [];
let chairmanDecisions: ChairmanDecision[] = [];

// Helper: compute final scores for a tender using current stored evaluator scores and evaluation template
function computeFinalScoresForTender(tenderId: string): {
  finalScores: TenderFinalScore[];
  evaluationTemplate?: EvaluationTemplate;
} {
  const scores = tenderScores.filter((s) => s.tenderId === tenderId);
  const assignment = getAssignmentByTenderId(tenderId);
  const evaluationTemplate = assignment
    ? mockEvaluationTemplates.find((t) => t.id === assignment.evaluationTemplateId)
    : undefined;

  if (!scores.length || !evaluationTemplate) {
    return { finalScores: [], evaluationTemplate };
  }

  // Group scores by bidder
  const bidderScores: Record<string, TenderScore[]> = {};
  scores.forEach((score) => {
    if (!bidderScores[score.bidderName]) bidderScores[score.bidderName] = [];
    bidderScores[score.bidderName].push(score);
  });

  const finalScores: TenderFinalScore[] = Object.entries(bidderScores).map(
    ([bidderName, bidderScoreList]) => {
      const avgScores: Record<number, number> = {};
      const criteriaIds = new Set<number>();

      bidderScoreList.forEach((score) => {
        Object.keys(score.scores).forEach((criteriaId) => {
          criteriaIds.add(parseInt(criteriaId));
        });
      });

      criteriaIds.forEach((criteriaId) => {
        const criteriaScores = bidderScoreList
          .map((score) => score.scores[criteriaId] || 0)
          .filter((val) => val > 0);
        if (criteriaScores.length > 0) {
          avgScores[criteriaId] =
            criteriaScores.reduce((sum, val) => sum + val, 0) /
            criteriaScores.length;
        }
      });

      let technicalScore = 0;
      let financialScore = 0;
      let maxTechnicalScore = 0;
      let maxFinancialScore = 0;

      evaluationTemplate.criteria.forEach((criterion) => {
        const score = avgScores[criterion.id] || 0;
        if (criterion.type === "financial") {
          financialScore += score;
          maxFinancialScore += criterion.maxScore;
        } else {
          technicalScore += score;
          maxTechnicalScore += criterion.maxScore;
        }
      });

      const technicalPercentage =
        maxTechnicalScore > 0 ? (technicalScore / maxTechnicalScore) * 100 : 0;
      const financialPercentage =
        maxFinancialScore > 0 ? (financialScore / maxFinancialScore) * 100 : 0;

      let finalScore = 0;
      switch ((evaluationTemplate.type || "QCBS").toUpperCase()) {
        case "QCBS":
          finalScore = technicalPercentage * 0.7 + financialPercentage * 0.3;
          break;
        case "LCS": {
          const minTechnicalThreshold = 75;
          finalScore =
            technicalPercentage >= minTechnicalThreshold
              ? financialPercentage * 0.8 + technicalPercentage * 0.2
              : technicalPercentage * 0.5;
          break;
        }
        case "QBS":
          finalScore = technicalPercentage;
          break;
        case "FBS":
          finalScore = technicalPercentage * 0.9 + financialPercentage * 0.1;
          break;
        default:
          finalScore = technicalPercentage * 0.7 + financialPercentage * 0.3;
      }

      return {
        bidderName,
        technicalScore: Math.round(technicalPercentage * 100) / 100,
        financialScore: Math.round(financialPercentage * 100) / 100,
        finalScore: Math.round(finalScore * 100) / 100,
        rank: 0,
      };
    },
  );

  finalScores.sort((a, b) => b.finalScore - a.finalScore);
  finalScores.forEach((s, idx) => (s.rank = idx + 1));

  return { finalScores, evaluationTemplate };
}

export const submitTenderScore: RequestHandler = (req, res) => {
  try {
    const submission: TenderScoreSubmission = req.body;

    // Validate required fields
    if (!submission.tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }
    if (!submission.committeeMemberId) {
      return res.status(400).json({ error: "committeeMemberId is required" });
    }
    if (!submission.bidderName) {
      return res.status(400).json({ error: "bidderName is required" });
    }
    if (!submission.scores || Object.keys(submission.scores).length === 0) {
      return res.status(400).json({ error: "scores are required" });
    }

    // Get the tender assignment to validate against the evaluation template
    const assignment = getAssignmentByTenderId(submission.tenderId);
    if (assignment) {
      const evaluationTemplate = mockEvaluationTemplates.find(
        (t) => t.id === assignment.evaluationTemplateId,
      );

      if (evaluationTemplate) {
        // Validate scores against template criteria
        for (const [criteriaIdStr, score] of Object.entries(
          submission.scores,
        )) {
          const criteriaId = parseInt(criteriaIdStr);
          const criterion = evaluationTemplate.criteria.find(
            (c) => c.id === criteriaId,
          );

          if (!criterion) {
            return res.status(400).json({
              error: `Invalid criteria ID: ${criteriaId}. This criterion is not part of the evaluation template.`,
            });
          }

          if (score < 0 || score > criterion.maxScore) {
            return res.status(400).json({
              error: `Score for '${criterion.name}' must be between 0 and ${criterion.maxScore}`,
            });
          }
        }

        // Check if all required criteria are provided
        const providedCriteriaIds = new Set(
          Object.keys(submission.scores).map((id) => parseInt(id)),
        );
        const requiredCriteriaIds = new Set(
          evaluationTemplate.criteria.map((c) => c.id),
        );

        for (const requiredId of requiredCriteriaIds) {
          if (!providedCriteriaIds.has(requiredId)) {
            const criterion = evaluationTemplate.criteria.find(
              (c) => c.id === requiredId,
            );
            return res.status(400).json({
              error: `Missing score for required criterion: '${criterion?.name}'`,
            });
          }
        }
      }
    }

    // Calculate total score
    const totalScore = Object.values(submission.scores).reduce(
      (sum, score) => sum + score,
      0,
    );

    console.log(
      `Submitting score for tender ${submission.tenderId}, bidder ${submission.bidderName}:`,
      {
        scores: submission.scores,
        totalScore,
        evaluationTemplateId: assignment?.evaluationTemplateId,
      },
    );

    // Check if score already exists for this tender/committee member/bidder
    const existingScoreIndex = tenderScores.findIndex(
      (score) =>
        score.tenderId === submission.tenderId &&
        score.committeeMemberId === submission.committeeMemberId &&
        score.bidderName === submission.bidderName,
    );

    const newScore: TenderScore = {
      id:
        existingScoreIndex >= 0
          ? tenderScores[existingScoreIndex].id
          : `TS-${Date.now()}`,
      tenderId: submission.tenderId,
      committeeMemberId: submission.committeeMemberId,
      bidderName: submission.bidderName,
      scores: submission.scores as unknown as Record<number, number>,
      totalScore,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };

    if (existingScoreIndex >= 0) {
      // Update existing score
      tenderScores[existingScoreIndex] = newScore;
    } else {
      // Add new score
      tenderScores.push(newScore);
    }

    console.log("Submitted tender score:", newScore);
    res.status(201).json(newScore);
  } catch (error) {
    console.error("Error submitting tender score:", error);
    res.status(500).json({ error: "Failed to submit tender score" });
  }
};

export const getTenderScores: RequestHandler = (req, res) => {
  try {
    const { tenderId } = req.params;

    if (!tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }

    const scores = tenderScores.filter((score) => score.tenderId === tenderId);
    res.json(scores);
  } catch (error) {
    console.error("Error fetching tender scores:", error);
    res.status(500).json({ error: "Failed to fetch tender scores" });
  }
};

export const getTenderFinalScores: RequestHandler = async (req, res) => {
  try {
    const { tenderId } = req.params;

    if (!tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }

    const { finalScores, evaluationTemplate } = computeFinalScoresForTender(
      tenderId,
    );

    if (!evaluationTemplate) {
      return res.status(404).json({ error: "Evaluation template not found" });
    }

    res.json(finalScores);
  } catch (error) {
    console.error("Error calculating tender final scores:", error);
    res.status(500).json({ error: "Failed to calculate tender final scores" });
  }
};

// New endpoint for evaluator score submission with new format
export const submitEvaluatorScore: RequestHandler = (req, res) => {
  try {
    const submission: TenderScoreSubmission = req.body;

    // Validate required fields
    if (!submission.tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }
    if (!submission.evaluatorId) {
      return res.status(400).json({ error: "evaluatorId is required" });
    }
    if (!submission.scores || submission.scores.length === 0) {
      return res.status(400).json({ error: "scores are required" });
    }

    // Get the tender assignment to validate against the evaluation template
    const assignment = getAssignmentByTenderId(submission.tenderId);
    if (!assignment) {
      return res.status(404).json({ error: "Tender assignment not found" });
    }

    const evaluationTemplate = mockEvaluationTemplates.find(
      (t) => t.id === assignment.evaluationTemplateId,
    );

    // If template is found, validate strictly. Otherwise, accept with generic bounds
    if (evaluationTemplate) {
      for (const scoreItem of submission.scores) {
        const criteriaId = parseInt(scoreItem.criterionId);
        const criterion = evaluationTemplate.criteria.find(
          (c) => c.id === criteriaId,
        );

        if (!criterion) {
          return res.status(400).json({
            error: `Invalid criteria ID: ${scoreItem.criterionId}. This criterion is not part of the evaluation template.`,
          });
        }

        if (scoreItem.score < 0 || scoreItem.score > criterion.maxScore) {
          return res.status(400).json({
            error: `Score for '${criterion.name}' must be between 0 and ${criterion.maxScore}`,
          });
        }
      }
    } else {
      console.warn(
        `Evaluation template ${assignment.evaluationTemplateId} not found on server; accepting scores with generic validation.`,
      );
      for (const scoreItem of submission.scores) {
        if (scoreItem.score < 0 || scoreItem.score > 100) {
          return res
            .status(400)
            .json({ error: "Scores must be between 0 and 100" });
        }
      }
    }

    // Convert to storage format and calculate total score
    const scoresRecord: Record<number, number> = {};
    let totalScore = 0;

    submission.scores.forEach((scoreItem, idx) => {
      const parsed = parseInt(scoreItem.criterionId);
      const criteriaId = Number.isNaN(parsed) ? 1000 + idx : parsed;
      scoresRecord[criteriaId] = scoreItem.score;
      totalScore += scoreItem.score;
    });

    // Find existing score entry for this evaluator and tender
    const existingScoreIndex = tenderScores.findIndex(
      (score) =>
        score.tenderId === submission.tenderId &&
        score.committeeMemberId === submission.evaluatorId,
    );

    const newScore: TenderScore = {
      id:
        existingScoreIndex >= 0
          ? tenderScores[existingScoreIndex].id
          : `TS-${Date.now()}`,
      tenderId: submission.tenderId,
      committeeMemberId: submission.evaluatorId,
      bidderName: "All Bidders", // For new format, we handle all bidders in one submission
      scores: scoresRecord,
      totalScore,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };

    if (existingScoreIndex >= 0) {
      tenderScores[existingScoreIndex] = newScore;
    } else {
      tenderScores.push(newScore);
    }

    console.log("Submitted evaluator score:", newScore);
    res.status(201).json({
      success: true,
      scoreId: newScore.id,
      message: "Scores submitted successfully",
      submittedScores: submission.scores,
    });
  } catch (error) {
    console.error("Error submitting evaluator score:", error);
    res.status(500).json({ error: "Failed to submit evaluator score" });
  }
};

export const approveFinalScores: RequestHandler = (req, res) => {
  try {
    const { tenderId } = req.params as { tenderId: string };
    const { chairmanId, winningBidderName, notes } = req.body || {};

    if (!tenderId) return res.status(400).json({ error: "tenderId is required" });
    if (!chairmanId)
      return res.status(400).json({ error: "chairmanId is required" });

    const { finalScores, evaluationTemplate } = computeFinalScoresForTender(
      tenderId,
    );

    if (!evaluationTemplate) {
      return res.status(404).json({ error: "Evaluation template not found" });
    }
    if (finalScores.length === 0) {
      return res.status(400).json({ error: "No scores available to finalize" });
    }

    const decision: ChairmanDecision = {
      tenderId,
      status: "approved",
      approvedBy: chairmanId,
      approvedAt: new Date().toISOString(),
      reason: notes,
      winningBidderName: winningBidderName || finalScores[0]?.bidderName,
      finalScores,
    };

    chairmanDecisions = chairmanDecisions.filter((d) => d.tenderId !== tenderId);
    chairmanDecisions.push(decision);

    // Update the committee assignment status to transition to NOC phase
    try {
      const assignment = getAssignmentByTenderId(tenderId);
      if (assignment) {
        // Import updateAssignmentStatus from committee-assignments
        const { updateAssignmentStatusInMemory } = require("./committee-assignments");
        updateAssignmentStatusInMemory(assignment.id, "Completed");
        console.log(`Updated assignment ${assignment.id} status to Completed for NOC workflow`);
      }
    } catch (updateError) {
      console.error("Failed to update assignment status:", updateError);
      // Don't fail the approval, just log the error
    }

    return res.status(201).json({
      success: true,
      decision,
      message: "Evaluation approved. Tender now ready for NOC process."
    });
  } catch (error) {
    console.error("Error approving final scores:", error);
    return res.status(500).json({ error: "Failed to approve final scores" });
  }
};

export const requestRevision: RequestHandler = (req, res) => {
  try {
    const { tenderId } = req.params as { tenderId: string };
    const { chairmanId, reason } = req.body || {};

    if (!tenderId) return res.status(400).json({ error: "tenderId is required" });
    if (!chairmanId)
      return res.status(400).json({ error: "chairmanId is required" });
    if (!reason || String(reason).trim().length < 5)
      return res
        .status(400)
        .json({ error: "A valid reason (min 5 chars) is required" });

    const decision: ChairmanDecision = {
      tenderId,
      status: "revision_requested",
      approvedBy: chairmanId,
      approvedAt: new Date().toISOString(),
      reason,
    };

    chairmanDecisions = chairmanDecisions.filter((d) => d.tenderId !== tenderId);
    chairmanDecisions.push(decision);

    return res.status(201).json({ success: true, decision });
  } catch (error) {
    console.error("Error requesting revision:", error);
    return res.status(500).json({ error: "Failed to request revision" });
  }
};

export const getChairmanDecision: RequestHandler = (req, res) => {
  try {
    const { tenderId } = req.params as { tenderId: string };
    const decision = chairmanDecisions.find((d) => d.tenderId === tenderId);
    if (!decision) return res.status(404).json({ error: "No decision found" });
    return res.json(decision);
  } catch (error) {
    console.error("Error getting chairman decision:", error);
    return res.status(500).json({ error: "Failed to get chairman decision" });
  }
};

// Helper function to get tender information (same as in committee-assignments.ts)
const getTenderInfoForScoring = (tenderId: string) => {
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

export const getTenderAssignment: RequestHandler = (req, res) => {
  try {
    const { tenderId } = req.params;

    if (!tenderId) {
      return res.status(400).json({ error: "tenderId is required" });
    }

    // Get tender information first
    const tenderInfo = getTenderInfoForScoring(tenderId);

    // Get the real assignment data from committee assignments
    const assignment = getAssignmentByTenderId(tenderId);

    if (!assignment) {
      // Return a mock assignment for backward compatibility if no assignment found
      const mockAssignment = {
        id: `CA-${tenderId}`,
        tenderId,
        tenderTitle: tenderInfo.title,
        tenderCategory: tenderInfo.category,
        ministry: tenderInfo.ministry,
        evaluationTemplateId: "ET-001", // Default QCBS template
        committeeMemberId: "user123", // Current user
        status: "active",
        evaluationStart: "2024-01-15T00:00:00Z",
        evaluationEnd: "2024-02-15T00:00:00Z",
      };
      console.log(
        `📋 Returning mock assignment for ${tenderId}:`,
        mockAssignment,
      );
      return res.json(mockAssignment);
    }

    // Transform the assignment data to match the expected format with tender information
    const tenderAssignment = {
      id: assignment.id,
      tenderId: assignment.tenderId,
      tenderTitle: tenderInfo.title,
      tenderCategory: tenderInfo.category,
      ministry: tenderInfo.ministry,
      evaluationTemplateId: assignment.evaluationTemplateId,
      committeeMemberId: "user123", // Current user - in production, get from auth
      status: assignment.status.toLowerCase(),
      evaluationStart: assignment.evaluationStart,
      evaluationEnd: assignment.evaluationEnd,
    };

    res.json(tenderAssignment);
  } catch (error) {
    console.error("Error fetching tender assignment:", error);
    res.status(500).json({ error: "Failed to fetch tender assignment" });
  }
};
