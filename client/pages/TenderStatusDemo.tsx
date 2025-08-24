import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenderStatusValidation } from "@/components/TenderStatusValidation";
import TenderSystemSettings from "@/components/TenderSystemSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  tenderStatusChecker,
  tenderSettingsManager,
  TenderStatus,
} from "@/lib/tenderSettings";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  PlayCircle,
  StopCircle,
} from "lucide-react";

interface DemoTender {
  id: string;
  title: string;
  closingDate: string;
  status: TenderStatus;
  daysRemaining: number;
}

export default function TenderStatusDemo() {
  const [demoTenders, setDemoTenders] = useState<DemoTender[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    generateDemoTenders();

    // Auto-refresh every 10 seconds to show status transitions
    const interval = setInterval(() => {
      generateDemoTenders();
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const generateDemoTenders = () => {
    const now = new Date();
    const settings = tenderSettingsManager.getSettings();

    const demoData: DemoTender[] = [
      {
        id: "DEMO-001",
        title: "Active Tender (10 days remaining)",
        closingDate: new Date(
          now.getTime() + 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "Active",
        daysRemaining: 10,
      },
      {
        id: "DEMO-002",
        title: `Closing Soon Tender (${Math.floor(settings.closingSoonThresholdDays / 2)} days remaining)`,
        closingDate: new Date(
          now.getTime() +
            Math.floor(settings.closingSoonThresholdDays / 2) *
              24 *
              60 *
              60 *
              1000,
        ).toISOString(),
        status: "Active", // Will auto-transition to Closing Soon
        daysRemaining: Math.floor(settings.closingSoonThresholdDays / 2),
      },
      {
        id: "DEMO-003",
        title: "Recently Closed Tender (1 day past deadline)",
        closingDate: new Date(
          now.getTime() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "Active", // Will auto-transition to Closed
        daysRemaining: -1,
      },
      {
        id: "DEMO-004",
        title: "Long Closed Tender (10 days past deadline)",
        closingDate: new Date(
          now.getTime() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: "Closed",
        daysRemaining: -10,
      },
    ];

    // Apply automatic status transitions
    const updatedTenders = demoData.map((tender) => {
      const automaticStatus = tenderStatusChecker.determineAutomaticStatus(
        tender.status,
        tender.closingDate,
      );
      return {
        ...tender,
        status: automaticStatus,
        daysRemaining: tenderStatusChecker.calculateDaysUntilDeadline(
          tender.closingDate,
        ),
      };
    });

    setDemoTenders(updatedTenders);
  };

  const getStatusColor = (status: TenderStatus) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Closing Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-red-100 text-red-800";
      case "Evaluated":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: TenderStatus) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Closing Soon":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "Closed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Evaluated":
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const testEOIBidPermissions = (status: TenderStatus) => {
    const statusInfo = tenderStatusChecker.getStatusInfo(status);
    return {
      canEOI: statusInfo.canExpressInterest,
      canBid: statusInfo.canSubmitBid,
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Tender Status Management Demo</h1>
        <p className="text-muted-foreground">
          Demonstrating automatic status transitions and validation rules
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="validation">Validation Tests</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Live Tender Status Demonstration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {demoTenders.map((tender) => {
                  const permissions = testEOIBidPermissions(tender.status);
                  return (
                    <div
                      key={tender.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{tender.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tender.daysRemaining >= 0
                            ? `${tender.daysRemaining} days remaining`
                            : `${Math.abs(tender.daysRemaining)} days past deadline`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Deadline:{" "}
                          {new Date(tender.closingDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            EOI
                          </div>
                          {permissions.canEOI ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            Bid
                          </div>
                          {permissions.canBid ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(tender.status)}
                          <Badge className={getStatusColor(tender.status)}>
                            {tender.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Status Transition Rules
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    • Active → Closing Soon:{" "}
                    {tenderSettingsManager.getClosingSoonThreshold()} days
                    before deadline
                  </div>
                  <div>• Closing Soon → Closed: Past deadline (automatic)</div>
                  <div>• Closed → Evaluation: Automatic flow enabled</div>
                  <div>
                    • EOI/Bid submission: Only allowed for Active and Closing
                    Soon tenders
                  </div>
                </div>
              </div>

              <Button onClick={generateDemoTenders} className="w-full mt-4">
                Refresh Status Check
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <TenderStatusValidation />
        </TabsContent>

        <TabsContent value="settings">
          <TenderSystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
