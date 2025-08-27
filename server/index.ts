import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getCommitteeTemplates } from "./routes/committee-templates";
import { getEvaluationTemplates, createEvaluationTemplate } from "./routes/evaluation-templates";
import { createCommitteeAssignment, getCommitteeAssignments } from "./routes/committee-assignments";

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
  app.post("/api/evaluation-templates", createEvaluationTemplate);
  app.post("/api/committee-assignments", createCommitteeAssignment);
  app.get("/api/committee-assignments", getCommitteeAssignments);

  return app;
}
