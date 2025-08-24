import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  tenderSettingsManager,
  tenderStatusChecker,
  TenderStatus,
  TenderSystemSettings,
} from "@/lib/tenderSettings";

interface ValidationResult {
  requirement: string;
  status: "pass" | "fail" | "warning";
  details: string;
  evidence?: string;
}

export function TenderStatusValidation() {
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [settings, setSettings] = useState<TenderSystemSettings>(
    tenderSettingsManager.getSettings(),
  );
  const [newThreshold, setNewThreshold] = useState(
    settings.closingSoonThresholdDays,
  );

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = () => {
    const results: ValidationResult[] = [];

    // Test 1: Automatic status transitions (Active → Closing Soon → Closed)
    const testTender = {
      status: "Active" as TenderStatus,
      closingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      publishedDate: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 10 days ago
    };

    const statusAfter3Days = tenderStatusChecker.determineAutomaticStatus(
      testTender.status,
      testTender.closingDate,
      testTender.publishedDate,
    );

    results.push({
      requirement: "Active → Closing Soon transition (within threshold)",
      status: statusAfter3Days === "Closing Soon" ? "pass" : "fail",
      details: `Tender with 3 days until deadline should be "Closing Soon"`,
      evidence: `Current threshold: ${settings.closingSoonThresholdDays} days. Status: ${statusAfter3Days}`,
    });

    // Test 2: Closed status for past deadline
    const pastDeadlineTender = {
      status: "Active" as TenderStatus,
      closingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      publishedDate: new Date(
        Date.now() - 20 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };

    const pastStatus = tenderStatusChecker.determineAutomaticStatus(
      pastDeadlineTender.status,
      pastDeadlineTender.closingDate,
      pastDeadlineTender.publishedDate,
    );

    results.push({
      requirement: "Active → Closed transition (past deadline)",
      status: pastStatus === "Closed" ? "pass" : "fail",
      details: "Tender past deadline should automatically become Closed",
      evidence: `Status for past deadline: ${pastStatus}`,
    });

    // Test 3: EOI/Bid submission permissions for Active/Closing Soon
    const activeStatusInfo = tenderStatusChecker.getStatusInfo("Active");
    results.push({
      requirement: "Active tenders allow EOI and bid submission",
      status:
        activeStatusInfo.canExpressInterest && activeStatusInfo.canSubmitBid
          ? "pass"
          : "fail",
      details: "Active tenders should allow both EOI and bid submission",
      evidence: `EOI: ${activeStatusInfo.canExpressInterest}, Bid: ${activeStatusInfo.canSubmitBid}`,
    });

    const closingSoonInfo = tenderStatusChecker.getStatusInfo("Closing Soon");
    results.push({
      requirement: "Closing Soon tenders allow EOI and bid submission",
      status:
        closingSoonInfo.canExpressInterest && closingSoonInfo.canSubmitBid
          ? "pass"
          : "fail",
      details: "Closing Soon tenders should still allow EOI and bid submission",
      evidence: `EOI: ${closingSoonInfo.canExpressInterest}, Bid: ${closingSoonInfo.canSubmitBid}`,
    });

    // Test 4: Closed tenders lock EOI/bid submission
    const closedStatusInfo = tenderStatusChecker.getStatusInfo("Closed");
    results.push({
      requirement: "Closed tenders prevent EOI and bid submission",
      status:
        !closedStatusInfo.canExpressInterest && !closedStatusInfo.canSubmitBid
          ? "pass"
          : "fail",
      details: "Closed tenders should not allow new EOI or bid submissions",
      evidence: `EOI: ${closedStatusInfo.canExpressInterest}, Bid: ${closedStatusInfo.canSubmitBid}`,
    });

    // Test 5: System settings for closing soon threshold
    const thresholdConfigurable =
      settings.closingSoonThresholdDays >= 1 &&
      settings.closingSoonThresholdDays <= 30;
    results.push({
      requirement: "Configurable Closing Soon threshold (1-30 days)",
      status: thresholdConfigurable ? "pass" : "fail",
      details:
        "System should allow configuring the Closing Soon threshold between 1-30 days",
      evidence: `Current threshold: ${settings.closingSoonThresholdDays} days`,
    });

    // Test 6: Automatic evaluation start when tender closes
    const shouldStartEval = tenderStatusChecker.shouldStartEvaluation("Closed");
    results.push({
      requirement: "Closed tenders auto-flow to Evaluation stage",
      status:
        shouldStartEval && settings.autoEvaluationStartEnabled
          ? "pass"
          : "warning",
      details:
        "When tender closes, it should automatically flow into evaluation stage",
      evidence: `Auto evaluation enabled: ${settings.autoEvaluationStartEnabled}, Should start: ${shouldStartEval}`,
    });

    // Test 7: Auto transition setting
    results.push({
      requirement: "Auto transition system configurable",
      status:
        typeof settings.autoTransitionEnabled === "boolean" ? "pass" : "fail",
      details:
        "System should allow enabling/disabling automatic status transitions",
      evidence: `Auto transitions: ${settings.autoTransitionEnabled}`,
    });

    setValidationResults(results);
  };

  const handleUpdateThreshold = () => {
    try {
      tenderSettingsManager.setClosingSoonThreshold(newThreshold);
      setSettings(tenderSettingsManager.getSettings());
      runValidation(); // Re-run validation with new settings
    } catch (error) {
      alert("Invalid threshold value. Must be between 1 and 30 days.");
    }
  };

  const toggleAutoTransitions = () => {
    tenderSettingsManager.setAutoTransitionEnabled(
      !settings.autoTransitionEnabled,
    );
    setSettings(tenderSettingsManager.getSettings());
    runValidation();
  };

  const toggleAutoEvaluation = () => {
    tenderSettingsManager.setAutoEvaluationStartEnabled(
      !settings.autoEvaluationStartEnabled,
    );
    setSettings(tenderSettingsManager.getSettings());
    runValidation();
  };

  const getStatusIcon = (status: ValidationResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ValidationResult["status"]) => {
    const variants = {
      pass: "default" as const,
      fail: "destructive" as const,
      warning: "secondary" as const,
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const passCount = validationResults.filter((r) => r.status === "pass").length;
  const failCount = validationResults.filter((r) => r.status === "fail").length;
  const warningCount = validationResults.filter(
    (r) => r.status === "warning",
  ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tender Status Management Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {passCount}
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {warningCount}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            {validationResults.map((result, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.requirement}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.details}
                  </p>
                  {result.evidence && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {result.evidence}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="threshold">Closing Soon Threshold (days)</Label>
              <div className="flex gap-2">
                <Input
                  id="threshold"
                  type="number"
                  min="1"
                  max="30"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(parseInt(e.target.value))}
                  className="w-20"
                />
                <Button onClick={handleUpdateThreshold} size="sm">
                  Update
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Auto Transitions</Label>
                <Button
                  variant={
                    settings.autoTransitionEnabled ? "default" : "outline"
                  }
                  size="sm"
                  onClick={toggleAutoTransitions}
                >
                  {settings.autoTransitionEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto Evaluation Start</Label>
                <Button
                  variant={
                    settings.autoEvaluationStartEnabled ? "default" : "outline"
                  }
                  size="sm"
                  onClick={toggleAutoEvaluation}
                >
                  {settings.autoEvaluationStartEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={runValidation}
              variant="outline"
              className="w-full"
            >
              Re-run Validation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
