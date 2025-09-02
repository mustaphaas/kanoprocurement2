import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getCommitteeTemplates } from "./routes/committee-templates";
import {
  getEvaluationTemplates,
  getEvaluationTemplateById,
  createEvaluationTemplate,
} from "./routes/evaluation-templates";
import {
  createCommitteeAssignment,
  getCommitteeAssignments,
  getTenderAssignmentsForEvaluator,
  updateCommitteeAssignmentStatus,
} from "./routes/committee-assignments";
import {
  submitTenderScore,
  submitEvaluatorScore,
  getTenderScores,
  getTenderFinalScores,
  getTenderAssignment,
} from "./routes/tender-scoring";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Committee management API routes
  app.get("/api/committee-templates", getCommitteeTemplates);
  app.get("/api/evaluation-templates", getEvaluationTemplates);
  app.get("/api/evaluation-templates/:id", getEvaluationTemplateById);
  app.post("/api/evaluation-templates", createEvaluationTemplate);
  app.post("/api/committee-assignments", createCommitteeAssignment);
  app.get("/api/committee-assignments", getCommitteeAssignments);
  app.patch(
    "/api/committee-assignments/:id/status",
    updateCommitteeAssignmentStatus,
  );
  app.get(
    "/api/tender-assignments/:evaluatorId",
    getTenderAssignmentsForEvaluator,
  );

  // Tender scoring API routes
  app.post("/api/tender-scores", submitTenderScore);
  app.post("/api/evaluator-scores", submitEvaluatorScore);
  app.get("/api/tenders/:tenderId/scores", getTenderScores);
  app.get("/api/tenders/:tenderId/final-scores", getTenderFinalScores);
  app.get("/api/tenders/:tenderId/assignment", getTenderAssignment);

  return app;
}
