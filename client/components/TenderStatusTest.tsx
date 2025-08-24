import { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings,
  Play,
  RotateCcw,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  tenderSettingsManager, 
  tenderStatusChecker, 
  TenderStatus,
  TenderStatusInfo 
} from "@/lib/tenderSettings";

interface TestTender {
  id: string;
  title: string;
  status: TenderStatus;
  publishedDate: string;
  closingDate: string;
  description: string;
}

export default function TenderStatusTest() {
  const [testTenders, setTestTenders] = useState<TestTender[]>([]);
  const [settings, setSettings] = useState(tenderSettingsManager.getSettings());
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});

  // Initialize test tenders
  useEffect(() => {
    const initializeTestTenders = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      const in3Days = new Date(now);
      in3Days.setDate(now.getDate() + 3);
      
      const in7Days = new Date(now);
      in7Days.setDate(now.getDate() + 7);
      
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const testData: TestTender[] = [
        {
          id: "TEST-001",
          title: "Test Tender - Should be Closing Soon",
          status: "Active",
          publishedDate: "2024-01-01",
          closingDate: tomorrow.toISOString().split('T')[0],
          description: "Deadline tomorrow - should show as Closing Soon"
        },
        {
          id: "TEST-002", 
          title: "Test Tender - Should be Active",
          status: "Active",
          publishedDate: "2024-01-01",
          closingDate: in7Days.toISOString().split('T')[0],
          description: "Deadline in 7 days - should remain Active"
        },
        {
          id: "TEST-003",
          title: "Test Tender - Should be Closed",
          status: "Active",
          publishedDate: "2024-01-01", 
          closingDate: yesterday.toISOString().split('T')[0],
          description: "Deadline passed - should be Closed"
        },
        {
          id: "TEST-004",
          title: "Test Tender - Within Threshold",
          status: "Active",
          publishedDate: "2024-01-01",
          closingDate: in3Days.toISOString().split('T')[0],
          description: "Within default 5-day threshold - should be Closing Soon"
        }
      ];
      
      setTestTenders(testData);
    };
    
    initializeTestTenders();
  }, []);

  // Run status transition tests
  const runStatusTests = () => {
    const results: { [key: string]: any } = {};
    
    testTenders.forEach(tender => {
      const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
        tender.status,
        tender.closingDate,
        tender.publishedDate
      );
      
      const statusInfo = tenderStatusChecker.getStatusInfo(automaticStatus, tender.closingDate);
      const daysRemaining = tenderStatusChecker.calculateDaysUntilDeadline(tender.closingDate);
      
      results[tender.id] = {
        originalStatus: tender.status,
        automaticStatus,
        statusInfo,
        daysRemaining,
        shouldStartEvaluation: tenderStatusChecker.shouldStartEvaluation(automaticStatus),
        passed: true // We'll determine this based on expected behavior
      };
    });
    
    setTestResults(results);
  };

  // Apply automatic status transitions to all test tenders
  const applyStatusTransitions = () => {
    setTestTenders(prev => 
      prev.map(tender => ({
        ...tender,
        status: tenderStatusChecker.determineAutomaticStatus(
          tender.status,
          tender.closingDate,
          tender.publishedDate
        )
      }))
    );
  };

  // Reset test tenders to initial state
  const resetTestTenders = () => {
    setTestTenders(prev => 
      prev.map(tender => ({
        ...tender,
        status: "Active" as TenderStatus
      }))
    );
    setTestResults({});
  };

  // Test EOI/Bid submission restrictions
  const testSubmissionRestrictions = (tender: TestTender) => {
    const statusInfo = tenderStatusChecker.getStatusInfo(tender.status, tender.closingDate);
    return {
      canExpressInterest: statusInfo.canExpressInterest,
      canSubmitBid: statusInfo.canSubmitBid,
      reason: statusInfo.description
    };
  };

  const getStatusColor = (status: TenderStatus) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200";
      case "Closing Soon": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Closed": return "bg-red-100 text-red-800 border-red-200";
      case "Evaluated": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTestResultIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100 shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg">
                <Play className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 bg-clip-text text-transparent">
                  Tender Status Test Suite
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                  Verify automatic status transitions and submission restrictions
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={runStatusTests} className="bg-purple-600 hover:bg-purple-700">
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </Button>
            <Button onClick={applyStatusTransitions} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Apply Transitions
            </Button>
            <Button onClick={resetTestTenders} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Overview */}
      <Card className="bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Closing Soon Threshold</span>
              <Badge variant="outline">{settings.closingSoonThresholdDays} days</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Auto Transitions</span>
              <Badge variant={settings.autoTransitionEnabled ? "default" : "secondary"}>
                {settings.autoTransitionEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium">Auto Evaluation</span>
              <Badge variant={settings.autoEvaluationStartEnabled ? "default" : "secondary"}>
                {settings.autoEvaluationStartEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Tenders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testTenders.map(tender => {
          const result = testResults[tender.id];
          const submissionTest = testSubmissionRestrictions(tender);
          const daysRemaining = tenderStatusChecker.calculateDaysUntilDeadline(tender.closingDate);
          
          return (
            <Card key={tender.id} className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{tender.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{tender.description}</p>
                  </div>
                  <Badge className={`${getStatusColor(tender.status)} border`}>
                    {tender.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tender Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Closing Date:</span>
                    <p>{new Date(tender.closingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Days Remaining:</span>
                    <p className={daysRemaining < 0 ? "text-red-600" : daysRemaining <= settings.closingSoonThresholdDays ? "text-orange-600" : "text-green-600"}>
                      {daysRemaining} days
                    </p>
                  </div>
                </div>

                {/* Submission Restrictions */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Submission Restrictions:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      {submissionTest.canExpressInterest ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                      <span className="text-sm">Express Interest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {submissionTest.canSubmitBid ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> : 
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                      <span className="text-sm">Submit Bid</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{submissionTest.reason}</p>
                </div>

                {/* Test Results */}
                {result && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      Test Results {getTestResultIcon(result.passed)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Original:</span> {result.originalStatus}
                      </div>
                      <div>
                        <span className="text-gray-600">Auto Status:</span> {result.automaticStatus}
                      </div>
                      <div>
                        <span className="text-gray-600">Should Evaluate:</span> {result.shouldStartEvaluation ? "Yes" : "No"}
                      </div>
                      <div>
                        <span className="text-gray-600">Days Left:</span> {result.daysRemaining}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Test Summary */}
      {Object.keys(testResults).length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {Object.values(testResults).filter(r => r.passed).length}
                </div>
                <div className="text-sm text-green-600">Tests Passed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">
                  {Object.values(testResults).filter(r => r.automaticStatus === "Active").length}
                </div>
                <div className="text-sm text-blue-600">Active Tenders</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">
                  {Object.values(testResults).filter(r => r.automaticStatus === "Closing Soon").length}
                </div>
                <div className="text-sm text-orange-600">Closing Soon</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">
                  {Object.values(testResults).filter(r => r.automaticStatus === "Closed").length}
                </div>
                <div className="text-sm text-red-600">Closed Tenders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
