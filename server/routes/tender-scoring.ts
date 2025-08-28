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

// In-memory storage for demo purposes
let tenderScores: TenderScore[] = [];

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
      scores: submission.scores,
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

    // Get all scores for this tender
    const scores = tenderScores.filter((score) => score.tenderId === tenderId);

    if (scores.length === 0) {
      return res.json([]);
    }

    // Get the tender assignment to find the evaluation template
    const assignment = getAssignmentByTenderId(tenderId);
    if (!assignment) {
      console.error(`No assignment found for tender ${tenderId}`);
      return res.status(404).json({ error: "Tender assignment not found" });
    }

    // Get the evaluation template
    const evaluationTemplate = mockEvaluationTemplates.find(
      (t) => t.id === assignment.evaluationTemplateId,
    );

    if (!evaluationTemplate) {
      console.error(
        `Evaluation template ${assignment.evaluationTemplateId} not found`,
      );
      return res.status(404).json({ error: "Evaluation template not found" });
    }

    // Group scores by bidder
    const bidderScores: Record<string, TenderScore[]> = {};
    scores.forEach((score) => {
      if (!bidderScores[score.bidderName]) {
        bidderScores[score.bidderName] = [];
      }
      bidderScores[score.bidderName].push(score);
    });

    // Calculate final scores for each bidder using the evaluation template
    const finalScores: TenderFinalScore[] = Object.entries(bidderScores).map(
      ([bidderName, bidderScoreList]) => {
        // Calculate average scores across all committee members
        const avgScores: Record<number, number> = {};
        const criteriaIds = new Set<number>();

        // Collect all criteria IDs
        bidderScoreList.forEach((score) => {
          Object.keys(score.scores).forEach((criteriaId) => {
            criteriaIds.add(parseInt(criteriaId));
          });
        });

        // Calculate average for each criteria
        criteriaIds.forEach((criteriaId) => {
          const criteriaScores = bidderScoreList
            .map((score) => score.scores[criteriaId] || 0)
            .filter((score) => score > 0);

          if (criteriaScores.length > 0) {
            avgScores[criteriaId] =
              criteriaScores.reduce((sum, score) => sum + score, 0) /
              criteriaScores.length;
          }
        });

        // Calculate technical and financial scores using template criteria
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
            // Default to technical if type is not specified or is 'technical'
            technicalScore += score;
            maxTechnicalScore += criterion.maxScore;
          }
        });

        // Normalize scores to percentages
        const technicalPercentage =
          maxTechnicalScore > 0
            ? (technicalScore / maxTechnicalScore) * 100
            : 0;
        const financialPercentage =
          maxFinancialScore > 0
            ? (financialScore / maxFinancialScore) * 100
            : 0;

        // Apply methodology based on template type
        let finalScore = 0;

        switch (evaluationTemplate.type?.toUpperCase()) {
          case "QCBS":
            // Quality and Cost-Based Selection: typically 70% technical, 30% financial
            finalScore = technicalPercentage * 0.7 + financialPercentage * 0.3;
            break;

          case "LCS":
            // Least Cost Selection: technical qualification is pass/fail, lowest cost wins
            // For scoring purposes, if technical meets minimum threshold, financial dominates
            const minTechnicalThreshold = 75; // 75% minimum
            if (technicalPercentage >= minTechnicalThreshold) {
              finalScore =
                financialPercentage * 0.8 + technicalPercentage * 0.2;
            } else {
              finalScore = technicalPercentage * 0.5; // Penalize for not meeting technical threshold
            }
            break;

          case "QBS":
            // Quality-Based Selection: 100% technical (price negotiated later)
            finalScore = technicalPercentage;
            break;

          case "FBS":
            // Fixed Budget Selection: best technical within budget
            finalScore = technicalPercentage * 0.9 + financialPercentage * 0.1;
            break;

          default:
            // Default to QCBS methodology
            finalScore = technicalPercentage * 0.7 + financialPercentage * 0.3;
            break;
        }

        return {
          bidderName,
          technicalScore: Math.round(technicalPercentage * 100) / 100,
          financialScore: Math.round(financialPercentage * 100) / 100,
          finalScore: Math.round(finalScore * 100) / 100,
          rank: 0, // Will be set after sorting
        };
      },
    );

    // Sort by final score (descending) and assign ranks
    finalScores.sort((a, b) => b.finalScore - a.finalScore);
    finalScores.forEach((score, index) => {
      score.rank = index + 1;
    });

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
    if (!evaluationTemplate) {
      return res.status(404).json({ error: "Evaluation template not found" });
    }

    // Validate scores against template criteria
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

    // Convert to storage format and calculate total score
    const scoresRecord: Record<number, number> = {};
    let totalScore = 0;

    submission.scores.forEach((scoreItem) => {
      const criteriaId = parseInt(scoreItem.criterionId);
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
