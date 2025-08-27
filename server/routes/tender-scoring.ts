import { RequestHandler } from "express";

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

export interface TenderScoreSubmission {
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

    // Calculate total score
    const totalScore = Object.values(submission.scores).reduce(
      (sum, score) => sum + score,
      0,
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

export const getTenderFinalScores: RequestHandler = (req, res) => {
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

    // Group scores by bidder
    const bidderScores: Record<string, TenderScore[]> = {};
    scores.forEach((score) => {
      if (!bidderScores[score.bidderName]) {
        bidderScores[score.bidderName] = [];
      }
      bidderScores[score.bidderName].push(score);
    });

    // Calculate final scores for each bidder
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

        // Separate technical and financial scores (simplified)
        // In a real implementation, this would use the evaluation template criteria types
        const allScores = Object.values(avgScores);
        const technicalScore = allScores
          .slice(0, -1)
          .reduce((sum, score) => sum + score, 0); // All but last
        const financialScore = allScores[allScores.length - 1] || 0; // Last score assumed financial

        // Simple weighted final score (70% technical, 30% financial)
        const finalScore = technicalScore * 0.7 + financialScore * 0.3;

        return {
          bidderName,
          technicalScore: Math.round(technicalScore * 100) / 100,
          financialScore: Math.round(financialScore * 100) / 100,
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

export const getTenderAssignment: RequestHandler = (req, res) => {
  try {
    const { tenderId } = req.params;

    // Mock tender assignment data - in production this would come from database
    const mockAssignment = {
      id: `CA-${tenderId}`,
      tenderId,
      evaluationTemplateId: "ET-001", // Default QCBS template
      committeeMemberId: "user123", // Current user
      status: "active",
      evaluationStart: "2024-01-15T00:00:00Z",
      evaluationEnd: "2024-02-15T00:00:00Z",
    };

    res.json(mockAssignment);
  } catch (error) {
    console.error("Error fetching tender assignment:", error);
    res.status(500).json({ error: "Failed to fetch tender assignment" });
  }
};
